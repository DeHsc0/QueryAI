from deepeval.metrics import GEval
from deepeval.test_case import SingleTurnParams
from config import JUDGE_MODEL, THRESHOLDS


def ReasoningCoherence() -> GEval:
    return GEval(
        name="ReasoningCoherence",
        model=JUDGE_MODEL,
        criteria=(
            "Evaluate whether the observable sequence in metadata.tool_trace is coherent with the "
            "user's request and the final answer. Do not infer or request hidden chain-of-thought. "
            "Reward actions that follow from available tool results and penalize contradictions."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.ACTUAL_OUTPUT,
            SingleTurnParams.METADATA,
        ],
        threshold=THRESHOLDS["reasoning_coherence"],
    )


def ReasoningGroundedness() -> GEval:
    return GEval(
        name="ReasoningGroundedness",
        model=JUDGE_MODEL,
        criteria=(
            "Evaluate whether factual claims in the final response are supported by the actual tool "
            "outputs in metadata.tool_trace and metadata.retrieval_context. Penalize invented schema "
            "details, data values, or claims unsupported by those outputs. Do not judge hidden reasoning."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.ACTUAL_OUTPUT,
            SingleTurnParams.METADATA,
        ],
        threshold=THRESHOLDS["reasoning_groundedness"],
    )
