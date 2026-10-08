from deepeval.metrics import GEval
from deepeval.test_case import SingleTurnParams
from config import JUDGE_MODEL, THRESHOLDS


def InsightCompleteness() -> GEval:
    return GEval(
        name="InsightCompleteness",
        model=JUDGE_MODEL,
        criteria=(
            "Evaluate whether the agent's final user-facing response completely answers the user's question. "
            "A score of 1 means: all parts of the user's question are addressed, data is presented clearly, "
            "and key insights or patterns are highlighted (not just raw numbers). "
            "A score of 0.7 means: the core question is answered but some requested details are missing "
            "(e.g., user asked for average AND median but only average was provided). "
            "A score of 0.5 means: the response partially answers the question but misses significant parts. "
            "A score of 0 means: the response doesn't answer the question at all or is completely wrong. "
            "Bonus credit for noting data limitations or explaining methodology when relevant. "
            "Ignore tool traces and internal reasoning; actual_output contains only the final response."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.ACTUAL_OUTPUT,
        ],
        threshold=THRESHOLDS["insight_completeness"],
    )
