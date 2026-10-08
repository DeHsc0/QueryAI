from deepeval.metrics import GEval
from deepeval.test_case import SingleTurnParams
from config import JUDGE_MODEL, THRESHOLDS


def ToolOrderCompliance() -> GEval:
    return GEval(
        name="ToolOrderCompliance",
        model=JUDGE_MODEL,
        criteria=(
            "Evaluate the actual sequence in metadata.tool_trace. search_db_facts should precede "
            "retrieve_context when both are used; retrieve_context should precede run_sql when both "
            "are used. Skipping retrieve_context is valid when the database facts already answer the "
            "schema question. add_memory is optional and should normally follow the answer-producing "
            "work. Do not penalize a tool merely because it was not called. Score only ordering errors "
            "that are visible in the trace."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.METADATA,
        ],
        threshold=THRESHOLDS["tool_order"],
    )


def ToolCallEfficiency() -> GEval:
    return GEval(
        name="ToolCallEfficiency",
        model=JUDGE_MODEL,
        criteria=(
            "Evaluate tool-call efficiency using metadata.tool_trace. The agent has a maximum of four "
            "tool calls per turn. A good score reflects necessary calls, no repeated equivalent searches, "
            "and successful completion. Do not require a fixed number or a fixed set of tools: memory "
            "may be sufficient, retrieval may be unnecessary, and add_memory is optional."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.METADATA,
        ],
        threshold=THRESHOLDS["tool_efficiency"],
    )
