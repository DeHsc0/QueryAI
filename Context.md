# QueryAI — Codebase Context

## What this is

A multi-tenant, agentic **AI data analyst**: users connect their own SQL databases, the agent explores the schema (vector search), writes read-only SQL, runs it against the user's DB, and returns insights. Users and conversations are authenticated via Clerk.

## Repository layout

Monorepo with two package managers:
- **JS/Turbo** (root `package.json`, `turbo.json`, `bun.lock`) → `apps/web`
- **Python uv workspace** (root `pyproject.toml`, `uv.lock`) → `apps/backend`, `apps/task_queue`, `packages/db`, `packages/evals`

| Path | Role |
|---|---|
| `apps/web` | Next.js frontend (`app/database/[databaseId]/page.tsx` is the chat surface) |
| `apps/backend` | FastAPI app + the LangChain/LangGraph agent |
| `apps/task_queue` | Celery worker (async persistence + memory writes) |
| `packages/db` | SQLModel models, shared engine, Alembic migrations |
| `packages/evals` | Evaluation harness |

## Backend stack

FastAPI + Clerk auth → **LangChain 1.x `create_agent`** (a LangGraph `CompiledStateGraph`) → **DeepSeek** via `ChatOpenAI` (OpenAI-compatible) → **Qdrant** (hybrid dense+sparse retrieval, cloud inference) → **Redis** (LangGraph checkpointer + caching + Celery broker) → **Postgres/Supabase** (app data) → **Celery** workers → **mem0 (hosted)** for long-term memory (in progress).

## Agent (`apps/backend/agent/init.py`)

- `get_agent(checkpointer)` builds the agent once at FastAPI startup (`main.py` lifespan), stored on `AppState`.
- `Context` (runtime dataclass, per-invocation): `tenant_id`, `dense_schema`, `db_type`, `encrypted_creds` (+ `conversation_id` being added).
- LLM: `get_llm(model_name="deepseek-v4-pro")` → `ChatOpenAI(base_url="https://api.deepseek.com")`. Also reused for conversation title generation in `chat.py`.
- Tools: `retrieve_context`, `run_sql`.
- System prompt: hardcoded data-analyst persona with retrieve_context query rules, tool-call limits, clarifying-question policy, and read-only SQL rules.
- Middleware (registration order): `ensure_context_caching`, `add_dense_schema`, `ToolCallLimitMiddleware(run_limit=4)`, `add_memory`.

### Middleware (`apps/backend/agent/middleware.py`)

- **`ensure_context_caching`** (`@before_agent`, `can_jump_to=["end"]`): splits `tenant_id` into `user_id__db_id`; reads `dense_schema:{user_id}:{db_id}` from Redis JSON cache; on miss loads `UserDatabases` from Postgres, caches 2h, and populates `runtime.context` (db_type, dense_schema, encrypted_creds). If no DB row → injects "Conversation limit reached." and jumps to end.
- **`add_dense_schema`** (`@dynamic_prompt`): appends `Database Software : {db_type}` and the dense schema to the system prompt on **every model call**.
- **`add_memory`** (`@after_agent`, WIP): slices messages from the last `HumanMessage`, converts them to mem0 format via `convert_messages`, and (planned) enqueues the Celery `memory_write` task.

## Tools (`apps/backend/agent/tools/`)

- **`retrieve_context(query, runtime)`** — Qdrant hybrid search over schema chunks. Dense: `openrouter/nvidia/llama-nemotron-embed-vl-1b-v2:free` (1024d via Qdrant cloud inference); sparse: `qdrant/bm25`; RRF fusion; filtered by payload `tenant_id`. Returns JSON-lines `{score, page_content}`. No try/except.
- **`run_sql(query, runtime)`** — `sqlglot.parse_one` validation (dialect from `context.db_type`), naive banned-keyword substring scan (read-only enforcement), Fernet-decrypt creds, builds a per-DB-type SQLAlchemy engine, executes read-only, `Decimal → float`, returns JSON. Parse errors returned as strings; execution errors propagate.
- Arg schemas in `tools_arg_schema.py` (`Retrieve_Context`, `Run_Sql_Query`), each with a single `query: str`.

## Memory

### Short-term (`agent/memory/short.py`)
`AsyncRedisSaver` checkpointer keyed by `thread_id == conversation_id`. **Note:** TTL is written as `60 * 2` (120 **seconds**, not 2 hours — likely a bug; intended `60 * 60 * 2`). On cache miss, `chat.py` rebuilds the last 5 `Turns` from Postgres as `Human`/`AI` message pairs.

### Long-term (`agent/memory/long.py`) — WIP
Hosted mem0 (`mem0ai` is a dependency; `MemoryClient()` stub currently unused). Design decisions agreed:

- **Scoping:** `user_id` = Clerk `sub`; `run_id` = `conversation_id` (conversation-scoped prefs); DB scope via `metadata: {tenant_id: "user__db"}`.
- **Write path:** `@after_agent` middleware converts the current turn's messages to mem0's `[{role, content}]` format and enqueues a Celery `memory_write` task → `mem0.add(infer=True)`. Worker keeps backend free of the extraction LLM call. Tool outputs truncated (~600 chars); `run_sql` errors kept verbatim.
- **Read path (agreed):** once per conversation (Redis-cached block), fetch a capped set of memories and inject into the system prompt — static prefix, compatible with DeepSeek's automatic prefix caching. Within-conversation memory is redundant (short-term history already covers it).
- **Failure policy:** bounded Celery retries; a hard mem0 outage is drop-and-log, not retry-forever. Durable outbox (Postgres) is a possible v2.

## Request lifecycle (`apps/backend/api/endpoints/chat.py`)

```
POST /api/chat/ {query, conversation_id?, db_id}
  ├─ ClerkAuthMiddleware → req.state.clerk (user_id = sub)
  ├─ new conversation? → LLM title gen → INSERT conversations
  ├─ existing? → Redis checkpointer lookup; miss → Postgres last 5 turns
  ├─ agent.astream(messages, thread_id=conversation_id, context=Context(tenant_id))
  │     └─ internal streaming; HTTP response is NOT streamed (buffered)
  ├─ Celery insert_chats_in_db.delay(...) → INSERT turns
  └─ 200 {"data": ""}   ← response body empty; history via GET /api/turns/
```

## Data models (`packages/db/db/models.py`, SQLModel/Postgres)

- `User` — `clerk_id` (unique, indexed) is the join key everywhere.
- `UserDatabases` — `user_clerk_id` FK, `encrypted_creds`, `database_name`, `database_soft` (db type), `description`, `dense_schema`.
- `Conversations` — `database_id` FK, `title`. No direct `user_id`; ownership via `database_id → user_databases.user_clerk_id`.
- `Turns` — `conversation_id` FK, `user_query`, `ai_response`, `sql_query: ARRAY[String]`, `created_at`. This is the messages table.

## Task queue (`apps/task_queue`)

Celery (Redis broker/backend), `worker_pool="solo"`. Tasks: `insert_chats_in_db` (retry ×3, countdown 60) and `memory_write` (WIP). **Note:** broker URL is hardcoded to `redis://localhost:6379`, not read from `REDIS_URL`.

## Config & environment

No `pydantic-settings` usage despite the dependency — everything is `load_dotenv()` + `os.getenv()` across modules. `apps/backend/.env` holds: `ENCRYPTION_KEY`, `DATABASE_URL`, `TEST_DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `QDRANT_URL`/`QDRANT_API_KEY`/`QDRANT_COLLECTION`, `OPENROUTER_API_KEY`, `DEEPSEEK_API_KEY`, `REDIS_URL`, `LANGSMITH_*`, `USE_OPENROUTER_MODEL`, `FRONTEND_URL`. `MEM0_API_KEY` needed for long-term memory (add to backend + worker env).

## Known issues / open work

- `add_memory` middleware: `return` indentation bug (conversion stops after first message); `if last_human_indx:` skips index 0; `messages.index(msg)` returns the first equal message.
- `Context` needs `conversation_id`; `chat.py` must pass it.
- `memory_write` task still a stub; worker needs `mem0ai` dependency + `MEM0_API_KEY`.
- Redis checkpointer TTL is 120s (likely should be 2h).
- Celery broker URL hardcoded instead of `REDIS_URL`.
- `run_sql` banned-keyword check is naive substring matching (false positives).
- `database_soft : str = DatabaseTypes` assigns the class, not a column constraint.
- `chat.py` returns an empty response body; debug `print` statements throughout middleware/endpoints.
- `insert_chats_in_db` accepts `database_id` but never inserts it.
