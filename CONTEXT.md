# QueryAI Project Context

## Overview
QueryAI is a data analysis assistant that allows users to connect to their databases, ask natural language questions, and get insights powered by an agentic workflow. It's built as a monorepo using Turborepo with a Python FastAPI backend, Celery task queue, and Next.js frontend.

## Monorepo Structure

### Root Level
- **package.json**: Bun workspaces setup with Turbo for orchestration
- **turbo.json**: Pipeline config (build, lint, check-types, dev) with experimental Python workspaces
- **pyproject.toml**: Root Python project config (version 0.1.0)
- **bun.lock, uv.lock**: Package manager locks
- **.commandcode/, .deepeval/, .vscode/**: Dev tooling/config directories

### Apps (apps/)
- **apps/backend/**: FastAPI API server (Python, LangGraph/LangChain agent)
- **apps/task_queue/**: Celery worker for async tasks (Python)
- **apps/web/**: Next.js 16 (React 19) frontend app

### Packages (packages/)
- **packages/db/**: Shared database models (SQLModel) and engine config
- **packages/ui/**: Shared React component library
- **packages/eslint-config/**: ESLint configs
- **packages/typescript-config/**: TSConfig configs
- **packages/evals/**: Evaluation code (deepeval based on `.deepeval/`)

## Backend (apps/backend)

### Tech Stack
- FastAPI (web framework)
- LangChain/LangGraph (agent orchestration)
- SQLModel + SQLAlchemy (ORM)
- Redis (checkpointer + caching)
- Qdrant (vector store for schema retrieval)
- Mem0 (long-term memory)
- Clerk (auth)
- Cryptography (Fernet for credential encryption)

### Core Files
- **main.py**: App entry point. Sets up lifespan (initializes agent + checkpointer), Clerk auth middleware, CORS, mounts API router at `/api`
- **app_state.py**: Holds shared app state (agent, checkpointer)
- **schemas.py**: Pydantic request/response schemas (Creds, Database_Creation, Chat, etc.)
- **api/router.py**: Routes all endpoints under /api
- **api/endpoints/**: auth.py, database.py, chat.py, conversation.py, turns.py, test.py

### Agent System (agent/)
- **init.py**: Creates agent with LangGraph `create_agent`. Tools: retrieve_context, run_sql, add_memory, search_db_facts. Middleware: add_dense_schema, ToolCallLimitMiddleware (retrieve_context limit 2, run_sql limit 2), disable_parallel_tool_calls. Uses DeepSeek (deepseek-v4-pro) via OpenRouter.
- **context.py**: Runtime context (tenant_id, dense_schema, db_type, encrypted_creds, conversation_id, user_prefs)
- **middleware.py**: injects dense schema + user prefs into system prompt; disables parallel tool calls
- **tools/**: 
  - retriever.py: Hybrid search (dense + sparse BM25) against Qdrant filtered by tenant_id; returns top 10 results
  - run_sql.py: Validates read-only SQL (sqlglot), decrypts creds, runs against user DB, returns JSON results (max 50 rows, Decimals→float)
  - add_memory.py: Adds to long-term memory via Mem0
  - search_db_facts.py: Searches DB facts (appears minimal)
  - other helpers/arg schemas
- **memory/**: short.py, long.py (Mem0 client)

### API Endpoints
- **/api/auth**: Auth related (webhooks)
- **/api/database**: GET lists user's databases; POST creates encrypted creds, extracts schema (dense + full), ingests to Qdrant
- **/api/conversation**: POST creates new conversation (generates title via LLM)
- **/api/chat**: POST main agent endpoint. Flows: resolves db creds from Redis or DB, generates title if new convo, loads history/checkpointer state, builds context with user prefs (Mem0), streams agent via `agent.astream` with stream_mode ["updates","messages","tasks"], collects tool calls/results, stores turn asynchronously via task_queue, returns 200
- **/api/turns**: GET retrieves turns/history (from checkpointer or DB fallback)
- **/api/test**: Test endpoints

### Lib (lib/)
- **config.py**: Redis/Qdrant clients, config helpers
- **helpers.py**: Encryption/decryption (Fernet), DB URL building, get_user_db contextmanager, schema extraction (SQLAlchemy inspect), dense schema generation, schema ingestion to Qdrant

### Schema Flow
1. User submits DB creds → encrypted with Fernet → stored in UserDatabases
2. Schema extracted via SQLAlchemy inspect: collects tables, columns, FKs; builds `dense_schema` string (T:table | cols:N | J:refs...) and full table text
3. Full schema text embedded (Nemotron embed via OpenRouter) + sparse BM25 → ingested as Qdrant points with tenant_id `user_id__db_id`
4. At chat time, tenant-scoped hybrid retrieval feeds agent context

## Task Queue (apps/task_queue)
- **task_queue/main.py**: Celery app (broker/backend Redis localhost:6379 db 0/1, worker_pool="solo")
- **task_queue/tasks.py**:
  - memory_write: writes memories to Mem0 with metadata (category, confidence_score)
  - insert_chats_in_db: persists Turns to Postgres (conversation_id, ai_response, user_query, sql_query)

Called asynchronously from backend (e.g. chat.py uses `insert_chats_in_db.delay`)

## Database (packages/db)
- **db/models.py**: SQLModel models
  - User (clerk_id, username, email)
  - UserDatabases (encrypted_creds, database_name, database_soft enum: postgresql/mysql/oracle/microsoft, description, dense_schema, FKs to user)
  - Conversations (database_id FK, title)
  - Turns (conversation_id FK, user_query, sql_query (ARRAY of strings), ai_response)
- **db/dependency.py**: get_db() session dependency with commit/rollback/close
- Uses DATABASE_URL from env (Supabase Postgres)

## Frontend (apps/web)
- Next.js 16, React 19, TypeScript
- Tailwind CSS v4
- shadcn/ui (radix-ui, lucide-react, class-variance-authority)
- Clerk (@clerk/nextjs) for auth
- Axios
- **app/page.tsx**: Landing page (currently minimal empty div)
- **components/landing/**: Landing components (present)
- **lib/api.ts**: Client API with mock/sample implementations (functions return mock data; real backend calls commented). Includes getDatabases, createDatabase, createConversation, getTurns, streamChat (simulated SSE). Uses types from lib/types.ts
- **lib/types.ts**: Type definitions for Database, Conversation, Turn, ChatRequest, ChatStreamEvent etc.
- next.config.mjs, postcss.config.mjs, components.json present

Frontend shows it expects SSE streaming for chat responses (mockStreamEvents simulate tool_call, tool_result, agent_output chunks).

## Agent Workflow (How it works)
1. User sends chat request (query, db_id, optional conversation_id) to POST /api/chat
2. Auth via Clerk middleware (sets req.state.clerk with sub=user_id)
3. Load db_data: check Redis key `db_data:{user_id}:{db_id}` (cached 2h). If miss, load from UserDatabases and cache.
4. If new conversation (no conversation_id): generate title with LLM, create Conversations row, get new_convo_id
5. If existing: load recent turns from DB (last 5) to reconstruct context; load user prefs from Mem0 (cached in Redis) filtered by user_id, app_id=db_id, run_id=thread_id
6. Build message history (reverse chron turns + current HumanMessage)
7. Get agent from app state; stream with context (tenant_id, dense_schema, db_type, encrypted_creds, conversation_id, user_prefs)
8. During streaming:
- On tasks with run_sql tool call: collect tool_call metadata (call_id, tool_name, args)
- On updates with AIMessage: capture agent_output
- On updates with ToolMessage: match call_id and attach output
9. After streaming, extract sql_queries, if agent_output exists, enqueue insert_chats_in_db task with Turn_data
10. Returns 200

Tool constraints (from agent system prompt): max 2 retrieve_context calls, max 2 run_sql calls per question; read-only SQL only; prefer aggregation/limited results.

## Queue System
- Celery worker (apps/task_queue) consumes tasks from Redis broker (db 0). Results stored in Redis backend (db 1).
- Tasks: insert_chats_in_db (persists turns to Postgres), memory_write (writes to Mem0). Both have retries (3 retries, 120s delay).
- Backend enqueues insert_chats_in_db.delay() after chat completion; memory_write appears defined but usage not obvious in shown code.

## Data Architecture
### Postgres (via SQLModel)
- users (1:N user_databases)
- user_databases (1:N conversations)
- conversations (1:N turns)
- turns store user_query, ai_response, sql_query (array), timestamps

### Redis
- Broker/backend for Celery
- Checkpointer for LangGraph (AsyncRedisSaver) — stores thread state
- Caching: `db_data:{user_id}:{db_id}` (2h), `user_prefs:{user_id}:{db_id}:{conversation_id}` (session-based)

### Qdrant
- Vector store for schema retrieval (hybrid search). Points have payload with tenant_id (`user_id__db_id`) and page_content (table schema text). Dense embeddings via OpenRouter Nemotron, sparse via BM25.

### Mem0
- Long-term memory client; used for user preferences/db facts across sessions (filtered by user_id, app_id=db_id, run_id=thread_id)

## Environment Variables (backend .env)
Key vars: ENCRYPTION_KEY, DATABASE_URL, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION, OPENROUTER_API_KEY, DEEPSEEK_API_KEY, REDIS_URL, LANGSMITH_* , MEM0_API_KEY

## Dev Workflow
- Turborepo runs dev/build/lint across workspaces
- Backend: FastAPI (likely `uvicorn` or `fastapi dev`)
- Task queue: Celery worker
- Frontend: Next.js dev server on port 3000
- Redis needed (localhost:6379) for checkpointer + Celery
- Qdrant + Postgres + external services configured via env

## Notes
- Agent uses DeepSeek v4 via OpenRouter
- Schema ingestion creates tenant-scoped vectors for RAG over schema
- Chat endpoint is the core orchestrator tying agent, checkpointer, Redis cache, Mem0, task queue
- Frontend is in early state (landing page minimal) but has API layer ready for SSE integration with backend
- Codebase follows monorepo Python/TS split with shared packages (db models shared conceptually; task_queue imports from db, agent code in backend)
- The codebase has .pytest_cache etc indicating tests exist
