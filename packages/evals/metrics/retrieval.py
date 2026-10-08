from deepeval.metrics import GEval
from deepeval.test_case import SingleTurnParams
from config import JUDGE_MODEL, THRESHOLDS


def DbFactRelevancy() -> GEval:
    return GEval(
        name="DbFactRelevancy",
        model=JUDGE_MODEL,
        criteria=(
            "Evaluate whether metadata.db_fact_results returned by search_db_facts are relevant "
            "to the user's query. "
            "A score of 1 means the returned memories directly address the schema knowledge needed "
            "to answer the query (correct tables, columns, join paths, or domain facts). "
            "A score of 0 means the results are completely irrelevant or empty when they shouldn't be. "
            "Partial credit (0.3-0.7) for results that are tangentially related but not directly useful."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.METADATA,
        ],
        threshold=THRESHOLDS["db_fact_relevancy"],
    )


def ClarifyingQuestionQuality() -> GEval:
    return GEval(
        name="ClarifyingQuestionQuality",
        model=JUDGE_MODEL,
        criteria=(
            "Evaluate the final response and metadata.tool_trace. If ambiguity or missing schema/data "
            "prevented a reliable answer, the agent should ask a specific clarifying question rather "
            "than invent an answer. If the evidence was sufficient, it should answer directly. "
            "Do not use expected SQL as an expected natural-language answer."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.ACTUAL_OUTPUT,
            SingleTurnParams.METADATA,
        ],
        threshold=THRESHOLDS["clarifying_question"],
    )
