import asyncio
import json
import os
import uuid
from pathlib import Path
from typing import Optional
from unittest.mock import patch

from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

from deepeval import evaluate
from deepeval.evaluate import AsyncConfig, DisplayConfig, ErrorConfig
from deepeval.metrics import (
    AnswerRelevancyMetric,
    ContextualRelevancyMetric,
    FaithfulnessMetric,
    ToolCorrectnessMetric,
)
from deepeval.test_case import LLMTestCase, ToolCall

from config import JUDGE_MODEL, THRESHOLDS, validate_eval_environment
from dataset.loader import EvalCase, load_bird_interact
from metrics import (
    ClarifyingQuestionQuality,
    DbFactRelevancy,
    InsightCompleteness,
    MemoryUtilization,
    MemoryWriteQuality,
    ReasoningCoherence,
    ReasoningGroundedness,
    SQLErrorRecovery,
    SQLCorrectness,
    ToolCallEfficiency,
    ToolOrderCompliance,
)

PACKAGE_DIR = Path(__file__).parent
DEFAULT_DATASET = PACKAGE_DIR / "dataset" / "bird_interact_data_with_gt.txt"
DEFAULT_RESULTS_DIR = PACKAGE_DIR / "results"


def _make_readonly_sql_tool():
    """Reject unsafe SQL in the eval harness while leaving the backend untouched."""
    from langchain.tools import ToolRuntime, tool
    from sqlglot import ParseError, exp, parse
    from agent.tools.run_sql import run_sql as backend_run_sql

    @tool("run_sql", args_schema=backend_run_sql.args_schema)
    def run_sql(query: str, runtime: ToolRuntime) -> str:
        """Execute one read-only SQL query for an evaluation case."""
        dialect = "postgres" if runtime.context.db_type == "postgresql" else runtime.context.db_type
        try:
            statements = parse(query, read=dialect)
        except ParseError as error:
            return f"Invalid SQL syntax: {error}"

        unsafe_nodes = (exp.DML, exp.DDL, exp.Into, exp.Lock)
        if (
            len(statements) != 1
            or not isinstance(statements[0], exp.Query)
            or any(statements[0].find(node) is not None for node in unsafe_nodes)
        ):
            return "Error: only one read-only SELECT query is allowed"
        return backend_run_sql.func(query, runtime)

    return run_sql


def _make_readonly_retrieval_tool():
    """Require the Qdrant collection to exist before invoking the backend search tool."""
    from langchain.tools import ToolRuntime, tool
    from qdrant_client import QdrantClient
    from agent.tools import retriever as retriever_module

    backend_tool = retriever_module.retrieve_context
    client = QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
        cloud_inference=True,
    )
    collection_name = os.getenv("QDRANT_COLLECTION")

    @tool("retrieve_context", args_schema=backend_tool.args_schema)
    def retrieve_context(query: str, runtime: ToolRuntime) -> str:
        """Search the already-provisioned Qdrant schema collection."""
        if not collection_name or not client.collection_exists(collection_name):
            return f"Error: Qdrant collection '{collection_name}' is not provisioned."

        original_client_factory = retriever_module.get_qdrant_client
        retriever_module.get_qdrant_client = lambda: client
        try:
            return backend_tool.func(query, runtime)
        finally:
            retriever_module.get_qdrant_client = original_client_factory

    return retrieve_context


async def _get_agent():
    from agent import init as agent_init
    from agent.memory.short import get_checkpointer

    checkpointer = await get_checkpointer()
    original_sql_tool = agent_init.run_sql
    original_retrieval_tool = agent_init.retrieve_context
    agent_init.run_sql = _make_readonly_sql_tool()
    agent_init.retrieve_context = _make_readonly_retrieval_tool()
    try:
        agent = agent_init.get_agent(checkpointer)
    finally:
        agent_init.run_sql = original_sql_tool
        agent_init.retrieve_context = original_retrieval_tool
    return agent, checkpointer


async def _run_agent(agent, query: str, case: EvalCase) -> dict:
    from agent.context import Context

    conversation_id = f"eval-{case.instance_id}-{uuid.uuid4().hex[:8]}"
    tenant_id = f"{case.user_id}__{case.db_id}"
    runtime_context = Context(
        tenant_id=tenant_id,
        conversation_id=conversation_id,
        dense_schema=None,
        db_type=None,
        encrypted_creds=None,
    )
    tool_calls = []
    tool_outputs = {}
    final_output = ""

    from task_queue.tasks import memory_write

    # add_memory still runs as an agent tool, but its Celery dispatch is intercepted here.
    with patch.object(memory_write, "delay", return_value=None):
        async for chunk_type, chunk_data in agent.astream(
            {"messages": [HumanMessage(content=query)]},
            config={"configurable": {"thread_id": conversation_id}},
            context=runtime_context,
            version="v3",
            stream_mode=["updates", "messages", "tasks"],
        ):
            if chunk_type == "tasks" and chunk_data.get("name") == "tools":
                for call in chunk_data.get("input", []):
                    tool_calls.append(
                        {
                            "name": call.get("name", ""),
                            "id": call.get("id", ""),
                            "args": call.get("args", {}),
                        }
                    )
            elif chunk_type == "updates":
                model_update = chunk_data.get("model")
                if model_update:
                    for message in model_update.get("messages", []):
                        if isinstance(message, AIMessage) and message.content and not message.tool_calls:
                            final_output = message.content

                tool_update = chunk_data.get("tools")
                if tool_update:
                    for message in tool_update.get("messages", []):
                        if isinstance(message, ToolMessage):
                            tool_outputs[message.tool_call_id] = message.content

    if not runtime_context.db_type or not runtime_context.encrypted_creds:
        raise RuntimeError(
            f"Could not load database configuration for test case {case.instance_id}; "
            "check the user/database IDs and backend tenant record."
        )

    trace = []
    retrieved_context = []
    db_fact_results = []
    executed_sql = []
    sql_tool_outputs = []
    memory_writes = []
    sql_errors = []

    for call in tool_calls:
        name = call["name"]
        args = call["args"] if isinstance(call["args"], dict) else {}
        output = tool_outputs.get(call["id"], "")
        trace.append({"name": name, "args": args, "output": output})

        if name == "retrieve_context" and _has_evidence(output):
            retrieved_context.append(f"retrieve_context result: {output}")
        elif name == "search_db_facts":
            if _has_evidence(output):
                db_fact_results.append(output)
                retrieved_context.append(f"search_db_facts result: {output}")
        elif name == "run_sql":
            query_text = args.get("query")
            if query_text:
                executed_sql.append(query_text)
            if _has_evidence(output):
                sql_tool_outputs.append(output)
                retrieved_context.append(f"run_sql result: {output}")
                if output.lstrip().lower().startswith(("error", "invalid sql")):
                    sql_errors.append(output)
        elif name == "add_memory":
            payload = args.get("data", [])
            memory_writes.extend(payload if isinstance(payload, list) else [payload])

    observed_tools = [
        ToolCall(
            name=call["name"],
            input_parameters=call["args"] if isinstance(call["args"], dict) else {},
            output=tool_outputs.get(call["id"], ""),
        )
        for call in tool_calls
    ]

    return {
        "output": final_output,
        "tool_calls": observed_tools,
        "tool_trace": trace,
        "retrieval_context": retrieved_context,
        "db_fact_results": db_fact_results,
        "executed_sql": executed_sql,
        "sql_tool_outputs": sql_tool_outputs,
        "sql_errors": sql_errors,
        "memory_writes": memory_writes,
        "conversation_id": conversation_id,
    }


def _has_evidence(output) -> bool:
    if output is None:
        return False
    text = output if isinstance(output, str) else json.dumps(output, ensure_ascii=False)
    return text.strip().lower() not in {"", "[]", "{}", "null", "none"}


def build_test_case(query: str, result: dict, case: EvalCase) -> LLMTestCase:
    metadata = {
        "instance_id": case.instance_id,
        "database": case.database,
        "category": case.category,
        "difficulty_tier": case.difficulty_tier,
        "expected_sql": case.sol_sql,
        "executed_sql": result.get("executed_sql", []),
        "sql_tool_outputs": result.get("sql_tool_outputs", []),
        "sql_errors": result.get("sql_errors", []),
        "tool_trace": result.get("tool_trace", []),
        "db_fact_results": result.get("db_fact_results", []),
        "memory_writes": result.get("memory_writes", []),
        "retrieval_context": result.get("retrieval_context", []),
    }
    expected_tools = (
        [ToolCall(name=name) for name in case.expected_tools]
        if case.expected_tools is not None
        else None
    )

    return LLMTestCase(
        input=query,
        actual_output=result.get("output", ""),
        # SQL references are only used by the SQL metric, never as an expected prose answer.
        expected_output=case.expected_insight,
        retrieval_context=result.get("retrieval_context") or None,
        tools_called=result.get("tool_calls", []),
        expected_tools=expected_tools,
        metadata=metadata,
    )


def get_all_metrics(
    include_retrieval: bool = True,
    include_sql: bool = True,
    include_tool_correctness: bool = False,
):
    metrics = [
        AnswerRelevancyMetric(
            threshold=THRESHOLDS["answer_relevancy"], model=JUDGE_MODEL, async_mode=False
        ),
        InsightCompleteness(),
        SQLErrorRecovery(),
        ToolOrderCompliance(),
        ToolCallEfficiency(),
        DbFactRelevancy(),
        ClarifyingQuestionQuality(),
        MemoryWriteQuality(),
        MemoryUtilization(),
        ReasoningCoherence(),
        ReasoningGroundedness(),
    ]
    if include_retrieval:
        metrics.extend(
            [
                FaithfulnessMetric(
                    threshold=THRESHOLDS["faithfulness"],
                    model=JUDGE_MODEL,
                    async_mode=False,
                ),
                ContextualRelevancyMetric(
                    threshold=THRESHOLDS["contextual_relevancy"],
                    model=JUDGE_MODEL,
                    async_mode=False,
                ),
            ]
        )
    if include_sql:
        metrics.append(SQLCorrectness())
    if include_tool_correctness:
        metrics.append(
            ToolCorrectnessMetric(
                threshold=THRESHOLDS["tool_correctness"],
                should_consider_ordering=True,
                model=JUDGE_MODEL,
                async_mode=False,
            )
        )
    return metrics


def _evaluate(test_cases, metrics, results_dir: Path, subfolder: str) -> None:
    if not test_cases or not metrics:
        return
    evaluate(
        test_cases=test_cases,
        metrics=metrics,
        async_config=AsyncConfig(run_async=False),
        error_config=ErrorConfig(skip_on_missing_params=True),
        display_config=DisplayConfig(
            results_folder=str(results_dir),
            results_subfolder=subfolder,
            inspect_after_run=False,
        ),
    )


async def run_evaluation(
    domain: str = "alien",
    limit: Optional[int] = 1,
    db_id: str = "",
    user_id: str = "",
    dataset_path: Path = DEFAULT_DATASET,
    results_dir: Path = DEFAULT_RESULTS_DIR,
):
    if not db_id.strip() or not user_id.strip():
        raise ValueError("A configured test tenant is required: provide non-empty --db-id and --user-id")
    if limit is not None and limit < 1:
        raise ValueError("--limit must be a positive integer")
    validate_eval_environment()

    cases = load_bird_interact(str(dataset_path), domain=domain, limit=limit)
    if not cases:
        print(f"No cases found for domain '{domain}' in {dataset_path}")
        return []

    for case in cases:
        case.db_id = db_id
        case.user_id = user_id

    agent, checkpointer = await _get_agent()
    test_cases = []
    try:
        for index, case in enumerate(cases):
            print(
                f"\n[{index + 1}/{len(cases)}] Running agent for: "
                f"{case.instance_id} — {case.query[:80]}..."
            )
            result = await _run_agent(agent, case.query, case)
            test_cases.append(build_test_case(case.query, result, case))
    finally:
        await checkpointer.__aexit__(None, None, None)

    with_retrieval = [case for case in test_cases if case.retrieval_context]
    with_expected_sql = [case for case in test_cases if case.metadata.get("expected_sql")]
    with_expected_tools = [case for case in test_cases if case.expected_tools]

    print(f"\nEvaluating {len(test_cases)} test case(s)...\n")
    _evaluate(
        test_cases,
        get_all_metrics(include_retrieval=False, include_sql=False),
        results_dir,
        "agent",
    )
    _evaluate(
        with_retrieval,
        [
            FaithfulnessMetric(
                threshold=THRESHOLDS["faithfulness"], model=JUDGE_MODEL, async_mode=False
            ),
            ContextualRelevancyMetric(
                threshold=THRESHOLDS["contextual_relevancy"],
                model=JUDGE_MODEL,
                async_mode=False,
            ),
        ],
        results_dir,
        "retrieval",
    )
    _evaluate(with_expected_sql, [SQLCorrectness()], results_dir, "sql")
    if with_expected_tools:
        _evaluate(
            with_expected_tools,
            get_all_metrics(
                include_retrieval=False,
                include_sql=False,
                include_tool_correctness=True,
            )[-1:],
            results_dir,
            "tools",
        )
    return test_cases


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run QueryAI agent evaluations")
    parser.add_argument("--domain", default="alien", help="Dataset domain to evaluate")
    parser.add_argument("--limit", type=int, default=1, help="Positive number of cases to run")
    parser.add_argument("--db-id", default=os.getenv("EVAL_DB_ID", ""), help="Test database ID")
    parser.add_argument("--user-id", default=os.getenv("EVAL_USER_ID", ""), help="Test user ID")
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET, help="JSONL dataset with ground truth")
    parser.add_argument("--results-dir", type=Path, default=DEFAULT_RESULTS_DIR, help="DeepEval JSON results directory")
    args = parser.parse_args()

    asyncio.run(
        run_evaluation(
            domain=args.domain,
            limit=args.limit,
            db_id=args.db_id,
            user_id=args.user_id,
            dataset_path=args.dataset,
            results_dir=args.results_dir,
        )
    )
