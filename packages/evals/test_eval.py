import asyncio
import os
import pytest
from pathlib import Path

from deepeval import assert_test

from dataset.loader import load_bird_interact
from runner import _get_agent, _run_agent, build_test_case, get_all_metrics
from config import validate_eval_environment

DATASET_PATH = Path(__file__).parent / "dataset" / "bird_interact_data_with_gt.txt"
EVAL_DOMAIN = "alien"
EVAL_DB_ID = os.getenv("EVAL_DB_ID", "")
EVAL_USER_ID = os.getenv("EVAL_USER_ID", "")

cases = load_bird_interact(str(DATASET_PATH), domain=EVAL_DOMAIN, limit=1)
for c in cases:
    c.db_id = EVAL_DB_ID
    c.user_id = EVAL_USER_ID

@pytest.mark.parametrize("case", cases, ids=[c.instance_id for c in cases])
def test_agent(case):
    if not EVAL_DB_ID or not EVAL_USER_ID:
        pytest.skip("Set EVAL_DB_ID and EVAL_USER_ID to run the live-agent evaluation")
    validate_eval_environment()

    async def run_case():
        agent, checkpointer = await _get_agent()
        try:
            result = await _run_agent(agent, case.query, case)
            return build_test_case(case.query, result, case)
        finally:
            await checkpointer.__aexit__(None, None, None)

    test_case = asyncio.run(run_case())
    metrics = get_all_metrics(
        include_retrieval=bool(test_case.retrieval_context),
        include_sql=bool(case.sol_sql),
        include_tool_correctness=bool(case.expected_tools),
    )
    assert_test(test_case, metrics)
