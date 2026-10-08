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

FastAPI + Clerk auth → **LangChain 1.x `create_agent`** (a LangGraph `CompiledStateGraph`) → **DeepSeek** via `ChatDeepSeek` (`langchain-deepseek`) → **Qdrant** (hybrid dense+sparse retrieval, cloud inference) → **Redis** (LangGraph checkpointer + caching + Celery broker) → **Postgres/Supabase** (app data) → **Celery** workers → **mem0 (hosted)** for long-term memory.

## Agent (`apps/backend/agent/init.py`)

- `get_agent(checkpointer)` builds the agent once at FastAPI startup (`main.py` lifespan), stored on `AppState`.
- `Context` (runtime dataclass, `agent/context.py`): `tenant_id`, `conversation_id`, `dense_schema`, `db_type`, `encrypted_creds`.
- LLM: `get_llm(model_name="deepseek-v4-pro")` → `ChatDeepSeek(base_url="https://api.deepseek.com")`. Also reused for conversation title generation in `chat.py`.
- Tools: `retrieve_context`, `run_sql`, `add_memory`, `search_db_facts`.
- System prompt: hardcoded data-analyst persona with retrieve_context query rules, tool-call limits, clarifying-question policy, read-only SQL rules, add_memory guidelines, and search_db_facts instructions.
- Middleware (registration order): `ensure_context_caching`, `add_dense_schema`, `ToolCallLimitMiddleware(run_limit=4)`.
- Reasoning tokens are available via `additional_kwargs["reasoning_content"]` on each `AIMessage` (ChatDeepSeek exposes them; ChatOpenAI drops them).

### Middleware (`apps/backend/agent/middleware.py`)

- **`ensure_context_caching`** (`@before_agent`, `can_jump_to=["end"]`): splits `tenant_id` into `user_id__db_id`; reads `dense_schema:{user_id}:{db_id}` from Redis JSON cache; on miss loads `UserDatabases` from Postgres, caches 2h, and populates `runtime.context` (db_type, dense_schema, encrypted_creds). If no DB row → injects "Conversation limit reached." and jumps to end.
- **`add_dense_schema`** (`@dynamic_prompt`): appends `Database Software : {db_type}` and the dense schema to the system prompt on **every model call**.

## Tools (`apps/backend/agent/tools/`)

- **`retrieve_context(query, runtime)`** — Qdrant hybrid search over schema chunks. Dense: `openrouter/nvidia/llama-nemotron-embed-vl-1b-v2:free` (1024d via Qdrant cloud inference); sparse: `qdrant/bm25`; RRF fusion (10 dense : 5 sparse); filtered by payload `tenant_id`. Returns JSON-lines `{score, page_content}`. No re-ranker. No try/except.
- **`run_sql(query, runtime)`** — `sqlglot.parse_one` validation (dialect from `context.db_type`), naive banned-keyword substring scan (read-only enforcement), Fernet-decrypt creds, builds a per-DB-type SQLAlchemy engine, executes read-only, `Decimal → float`, returns JSON. Parse errors returned as strings; execution errors propagate.
- **`add_memory(memories, runtime)`** — Receives a `List[Memories]` from the agent. Each memory is a structured object with `memory`, `category` (db_fact | user_preference), and `confidence_score`. Enqueues a Celery `memory_write` task per memory with `{user_id, db_id, conversation_id, memory}`.
- **`search_db_facts(query, runtime)`** — Searches mem0 for long-term database facts scoped to the current user + database. Filters by `metadata.category == "db_fact"`. Returns up to 5 relevant memories ranked by semantic + BM25 relevance. The agent is instructed to call this BEFORE `retrieve_context` to avoid re-discovering known schema facts.

## Memory

### Short-term (`agent/memory/short.py`)
`AsyncRedisSaver` checkpointer keyed by `thread_id == conversation_id`. **Note:** TTL is `60 * 2` (120 seconds). On cache miss, `chat.py` rebuilds the last 5 `Turns` from Postgres as `Human`/`AI` message pairs.

### Long-term (`agent/memory/long.py`)
Hosted mem0 (`MemoryClient()`). Two consumers:

**1. `add_memory` tool → Celery `memory_write` task:**
- Agent calls `add_memory` with structured memories (category, confidence, text).
- Tool enqueues one Celery task per memory.
- Worker calls `mem0.add(infer=False)` — stores verbatim, no extraction LLM.
- Scoping: `user_id` = Clerk sub, `app_id` = database id, `run_id` = conversation id.
- Metadata: `{category, confidence}`.

**2. `search_db_facts` tool (read path):**
- Agent calls with a natural-language query.
- Tool calls `mem0.search()` with filters `AND[user_id, app_id, metadata.category=db_fact]`.
- Returns top 5 memories ranked by relevance (semantic + BM25 + entity fusion).
- No `run_id` filter — db_facts are shared across all conversations for a database.

**User preferences** are conversation-scoped (`run_id` = conversation_id). They are stored via `add_memory` but not yet retrieved via a dedicated tool — the agent has no read path for preferences currently.

**Custom categories** are set at project level in `memory_write` task: `db_facts` and `user_preferences`.

## Request lifecycle (`apps/backend/api/endpoints/chat.py`)

```
POST /api/chat/ {query, conversation_id?, db_id}
  ├─ ClerkAuthMiddleware → req.state.clerk (user_id = sub)
  ├─ new conversation? → LLM title gen → INSERT conversations
  ├─ existing? → Redis checkpointer lookup; miss → Postgres last 5 turns
  ├─ agent.astream(messages, thread_id=conversation_id, context=Context(tenant_id, conversation_id))
  │     └─ internal streaming; HTTP response is NOT streamed (buffered)
  ├─ Celery insert_chats_in_db.delay(...) → INSERT turns
  └─ 200 {"data": ""}   ← response body empty; history via GET /api/turns/
```

Streaming loop tracks `run_sql` tool calls only (for sql_query column). `add_memory` and `search_db_facts` calls are not tracked in the HTTP response.

## Data models (`packages/db/db/models.py`, SQLModel/Postgres)

- `User` — `clerk_id` (unique, indexed) is the join key everywhere.
- `UserDatabases` — `user_clerk_id` FK, `encrypted_creds`, `database_name`, `database_soft` (db type), `description`, `dense_schema`.
- `Conversations` — `database_id` FK, `title`. No direct `user_id`; ownership via `database_id → user_databases.user_clerk_id`.
- `Turns` — `conversation_id` FK, `user_query`, `ai_response`, `sql_query: ARRAY[String]`, `created_at`.

## Task queue (`apps/task_queue`)

Celery (Redis broker/backend), `worker_pool="solo"`. Tasks:
- **`insert_chats_in_db`** — retry ×3, countdown 60. Inserts a `Turns` row. Accepts `Turn_data` (conversation_id, database_id, user_query, ai_response, sql_query).
- **`memory_write`** — retry ×3, countdown 60. Parses memory JSON, calls `mem0.add(infer=False)` with user/app/run scoping and metadata.

**Note:** broker URL is hardcoded to `redis://localhost:6379`, not read from `REDIS_URL`.

## Config & environment

No `pydantic-settings` usage despite the dependency — everything is `load_dotenv()` + `os.getenv()` across modules. `apps/backend/.env` holds: `ENCRYPTION_KEY`, `DATABASE_URL`, `TEST_DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `QDRANT_URL`/`QDRANT_API_KEY`/`QDRANT_COLLECTION`, `OPENROUTER_API_KEY`, `DEEPSEEK_API_KEY`, `REDIS_URL`, `LANGSMITH_*`, `USE_OPENROUTER_MODEL`, `FRONTEND_URL`, `MEM0_API_KEY`.

## Known issues / open work

- Redis checkpointer TTL is 120s (likely should be 2h).
- Celery broker URL hardcoded instead of `REDIS_URL`.
- `run_sql` banned-keyword check is naive substring matching (false positives on column names/values containing keywords like "UPDATE").
- `chat.py` has unused imports (`Context` from `agent.init`, `AppState` duplicate import) and debug `print` statements throughout.
- `chat.py` streaming only tracks `run_sql` tool calls; `retrieve_context`/`add_memory`/`search_db_facts` are silently dropped from the response.
- `chat.py` `agent_output` may be uninitialized if streaming never enters the model branch.
- User preferences have no read tool yet — stored via `add_memory` but never retrieved.
- `insert_chats_in_db` accepts `database_id` but never inserts it.
- `search_db_facts` returns raw mem0 response (full JSON with scores, metadata) — could be simplified for the agent.