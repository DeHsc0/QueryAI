from deepeval.metrics import GEval
from deepeval.test_case import SingleTurnParams
from config import JUDGE_MODEL, THRESHOLDS


def SQLCorrectness() -> GEval:
    return GEval(
        name="SQLCorrectness",
        model=JUDGE_MODEL,
        criteria=(
            "Evaluate whether the SQL in metadata.executed_sql correctly answers the user's question. "
            "Compare it with metadata.expected_sql, which is a complete reference query from the dataset. "
            "A score of 1 means the SQL is logically equivalent — same tables, joins, filters, aggregations, "
            "and ordering — even if column aliases or formatting differ. "
            "A score of 0.7-0.9 means the SQL is mostly correct with minor differences (extra columns, "
            "slightly different filter, missing LIMIT). "
            "A score below 0.5 means the SQL has significant logical errors (wrong tables, missing joins, "
            "incorrect aggregation, wrong GROUP BY). "
            "Ignore: column aliasing, formatting, ROUND precision, minor LIMIT differences. "
            "Focus on: correct tables, correct joins, correct WHERE/GROUP BY/ORDER BY semantics."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.METADATA,
        ],
        threshold=THRESHOLDS["sql_correctness"],
    )


def SQLErrorRecovery() -> GEval:
    return GEval(
        name="SQLErrorRecovery",
        model=JUDGE_MODEL,
        criteria=(
            "Use metadata.tool_trace to evaluate whether the agent recovered gracefully after a run_sql error. "
            "A score of 1 means: the agent recognized the error, diagnosed the cause (syntax, missing column, "
            "wrong join, etc.), corrected the SQL, and successfully re-executed. "
            "A score of 0.5 means: the agent retried but with the same or a similar error, or gave up too early. "
            "A score of 0 means: the agent ignored the error, hallucinated results, or crashed. "
            "If metadata contains no run_sql error, score 1 by default. "
            "Do not infer an error from the final answer alone."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.ACTUAL_OUTPUT,
            SingleTurnParams.METADATA,
        ],
        threshold=THRESHOLDS["sql_error_recovery"],
    )
