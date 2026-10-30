import os
from pathlib import Path
from dotenv import load_dotenv
from deepeval.models import OpenAIModel

PACKAGE_DIR = Path(__file__).parent
BACKEND_ENV = PACKAGE_DIR.parents[1] / "apps" / "backend" / ".env"
load_dotenv(PACKAGE_DIR / ".env.local")
load_dotenv(BACKEND_ENV)

COMMANDCODE_BASE_URL = os.getenv(
    "COMMANDCODE_BASE_URL", "https://api.commandcode.ai/provider/v1"
)
EVAL_MODEL_NAME = os.getenv(
    "EVAL_MODEL_NAME", "inclusionai/ling-3.0-flash-sante:free"
)

JUDGE_MODEL = OpenAIModel(
    model=EVAL_MODEL_NAME,
    api_key=os.getenv("CMD_API_KEY"),
    base_url=COMMANDCODE_BASE_URL,
    temperature=0,
)

THRESHOLDS = {
    "answer_relevancy": 0.5,
    "faithfulness": 0.7,
    "contextual_relevancy": 0.5,
    "tool_correctness": 0.7,
    "sql_correctness": 0.7,
    "tool_order": 0.7,
    "tool_efficiency": 0.5,
    "memory_write": 0.5,
    "memory_util": 0.5,
    "insight_completeness": 0.5,
    "reasoning_coherence": 0.5,
    "reasoning_groundedness": 0.5,
    "clarifying_question": 0.5,
    "db_fact_relevancy": 0.5,
    "sql_error_recovery": 0.5,
}


def validate_eval_environment() -> None:
    required = [
        "DEEPSEEK_API_KEY",
        "CMD_API_KEY",
        "REDIS_URL",
        "QDRANT_URL",
        "QDRANT_API_KEY",
        "QDRANT_COLLECTION",
        "OPENROUTER_API_KEY",
        "MEM0_API_KEY",
    ]
    missing = [name for name in required if not os.getenv(name)]
    if missing:
        raise RuntimeError(
            "Missing evaluation environment variables: " + ", ".join(missing)
        )
