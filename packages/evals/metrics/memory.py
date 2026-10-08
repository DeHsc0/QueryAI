from deepeval.metrics import GEval
from deepeval.test_case import SingleTurnParams
from config import JUDGE_MODEL, THRESHOLDS


def MemoryWriteQuality() -> GEval:
    return GEval(
        name="MemoryWriteQuality",
        model=JUDGE_MODEL,
        criteria=(
            "Evaluate the memory payloads in metadata.memory_writes. "
            "A score of 1 means: the agent stored memories that are (a) factually correct, (b) self-contained, "
            "(c) categorized correctly (db_fact or user_preference), (d) have reasonable confidence scores, "
            "and (e) represent genuinely useful long-term knowledge (not one-off data points). "
            "A score of 0.5 means: memories were stored but some are vague, incorrectly categorized, "
            "or represent temporary information that shouldn't be persisted. "
            "A score of 0 means: no memories were stored when they should have been, or stored "
            "memories are factually incorrect or useless. "
            "If the query had no durable knowledge to store, score 1 when memory_writes is empty. "
            "If the evaluation runner reports that writes were captured without persistence, judge "
            "the proposed payloads only."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.METADATA,
        ],
        threshold=THRESHOLDS["memory_write"],
    )


def MemoryUtilization() -> GEval:
    return GEval(
        name="MemoryUtilization",
        model=JUDGE_MODEL,
        criteria=(
            "Evaluate whether the agent used metadata.db_fact_results to inform its response. "
            "A score of 1 means: the agent called search_db_facts, received relevant memories, "
            "and used that knowledge to avoid redundant retrieve_context calls or to generate "
            "more accurate SQL without re-discovering known schema facts. "
            "A score of 0.5 means: the agent called search_db_facts but ignored useful results, "
            "or called retrieve_context for information already available in memories. "
            "A score of 0 means: the agent didn't call search_db_facts at all, or the memories "
            "were completely ignored in the final response. "
            "Note: On the first conversation with a database, there may be no stored memories yet — "
            "score 1 if the agent correctly called search_db_facts and gracefully handled empty results."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.TOOLS_CALLED,
            SingleTurnParams.ACTUAL_OUTPUT,
            SingleTurnParams.METADATA,
        ],
        threshold=THRESHOLDS["memory_util"],
    )
