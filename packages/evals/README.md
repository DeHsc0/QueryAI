# QueryAI agent evaluations

This package runs the real QueryAI agent against a JSONL evaluation set and scores the final answer and captured tool activity with DeepEval.

## Dataset and expected values

The default input is `dataset/bird_interact_data_with_gt.txt`. It is JSONL despite the `.txt` extension and contains the full SQL references merged by `dataset/combine_public_with_gt.py`. The public `bird_interact_data.jsonl` is useful for case metadata, but its `sol_sql` fields are empty and should not be used for SQL correctness scoring.

Reference SQL is provided to `SQLCorrectness` through `LLMTestCase.metadata`; it is never used as an expected natural-language answer. The current dataset does not contain reference prose answers, so `expected_output` remains unset and no answer metric is told to compare against SQL.

The Alien schema and knowledge files under `dataset/alien/` are supporting fixtures for preparing the external test tenant. They are not loaded by the runner because schema retrieval and database execution use the configured backend services.

## Configuration

The agent uses the backend service variables in `apps/backend/.env` or the process environment. DeepEval 4.2.8 or newer uses its `OpenAIModel` adapter pointed at the OpenAI-compatible CommandCode endpoint, with `CMD_API_KEY` as the key and `EVAL_MODEL_NAME` as the provider model name. Set these in `packages/evals/.env.local` or the process environment:

```dotenv
CMD_API_KEY=<your-commandcode-key>
EVAL_MODEL_NAME=inclusionai/ling-3.1-flash:free
COMMANDCODE_BASE_URL=https://api.commandcode.ai/provider/v1
```

`EVAL_MODEL_NAME` is configurable; the value above is the default. The base URL can also be overridden. The backend still needs its own DeepSeek key to run the agent. Other required services include Redis, Qdrant/OpenRouter, and mem0. Create a test tenant in the app database and provide its IDs through `EVAL_DB_ID` and `EVAL_USER_ID`, or as CLI arguments.

The evaluation harness wraps SQL and retrieval tools without modifying the backend: it rejects non-query SQL ASTs (including DML inside a CTE) and refuses to search a missing Qdrant collection instead of letting the backend create it. Use a dedicated test database account with read-only grants as an additional database-level safeguard.

## Run

From the repository root:

```powershell
uv run --package evals python packages/evals/runner.py --domain alien --limit 5 --db-id <test-database-id> --user-id <test-user-id>
```

`--limit` must be positive and defaults to one case. Use `--dataset` to select another JSONL set and `--results-dir` to change where DeepEval writes its run reports. Reports are saved under `packages/evals/results/` by default and ignored by Git.

The evaluation intercepts the Celery dispatch performed by `add_memory`. The real tool call and its arguments are captured, but the proposed memories are not sent to the long-term memory service, so repeated runs do not add new memory state. Agent conversations use unique thread IDs. SQL runs against the configured tenant and should therefore use a dedicated read-only test database.

## What the metrics score

- Answer relevancy and insight completeness use only the final user-facing answer.
- Faithfulness and contextual relevancy run only when the agent actually received tool evidence. `retrieval_context` contains actual outputs from schema search, database fact search, and SQL execution; it is never backfilled from ground truth.
- SQL correctness runs only for cases with a complete reference query.
- Tool correctness runs only when a dataset entry explicitly provides `expected_tools`; tool expectations are not guessed from category.
- Tool ordering, efficiency, memory, recovery, and clarification metrics inspect the captured structured trace in `metadata`.
- Reasoning-named metrics evaluate observable actions and answer grounding. The runner does not capture or send private model reasoning to the judge.

DeepEval saves timestamped JSON test-run reports. The CLI currently separates general, retrieval, SQL, and explicitly labeled tool evaluations so metrics only run on cases with the inputs they require.
