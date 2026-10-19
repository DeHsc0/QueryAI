/**
 * Client-side API module.
 *
 * Database, conversation, and turn endpoints talk to the real FastAPI backend
 * (Clerk Bearer auth, every response validated with zod — see lib/schemas.ts).
 * The chat send pipeline consumes the backend's real SSE stream from
 * POST /api/chat; the dashboard Edit/Delete dialogs are still mock-backed
 * until the backend PATCH/DELETE endpoints exist.
 */

import axios from "axios"
import { z } from "zod"
import {
  conversationsResponseSchema,
  databaseResponseSchema,
  databasesResponseSchema,
  registerDatabaseRequestSchema,
  turnsResponseSchema,
} from "./schemas"
import type {
  Conversation,
  CreateConversationRequest,
  ChatRequest,
  ChatStreamEvent,
  DatabaseSummary,
  RegisterDatabaseRequest,
  SqlResult,
  SqlResultRow,
  Turn,
  UpdateDatabaseRequest,
} from "./types"

// ──────────────────────────────────────────
//  Real backend client
// ──────────────────────────────────────────

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000"

const api = axios.create({ baseURL: BACKEND_URL, withCredentials: true })

/**
 * Registered by <ApiTokenBridge /> (mounted in the root layout); supplies the
 * Clerk session token for every request. The backend's Clerk middleware
 * resolves `req.state.clerk.sub` from this Bearer token.
 */
let tokenProvider: () => Promise<string | null> = async () => null

export function setApiTokenProvider(getToken: () => Promise<string | null>): void {
  tokenProvider = getToken
}

api.interceptors.request.use(async (config) => {
  try {
    const token = await tokenProvider()
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {
    // No token yet (signed out): let the request fail with the backend's
    // 401 instead of masking the auth state.
  }
  return config
})

export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/** Normalizes any failure into an ApiError and rethrows. */
function fail(error: unknown): never {
  throw toApiError(error)
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    const message =
      data !== null && typeof data === "object" && "message" in data
        && typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : error.response
          ? `Request failed with status ${error.response.status}`
          : "Could not reach the backend."
    return new ApiError(message, error.response?.status)
  }
  if (error instanceof Error) return new ApiError(error.message)
  return new ApiError("Request failed.")
}

/** Validates a backend payload with zod; throws ApiError on any mismatch. */
function parse<T>(schema: z.ZodType<T>, payload: unknown, endpoint: string): T {
  const result = schema.safeParse(payload)
  if (!result.success) {
    throw new ApiError(`Unexpected response payload from ${endpoint}`)
  }
  return result.data
}

// ──────────────────────────────────────────
//  Conversations + turns
//
//  Real backend contracts:
//    GET /api/conversation/{db_id}             → { data: [{ id, title }] }
//    GET /api/turns/{db_id}/{conversation_id}  → { data: [turn…] } (5 newest,
//        newest-first — reordered chronologically below)
//
//  POST /api/chat streams server-sent events (see the Chat pipeline section),
//  so mock-created conversations only exist locally; getTurns falls back to
//  the local store for those before giving up.
// ──────────────────────────────────────────

const turnsStore: Map<string, Turn[]> = new Map()

export async function listConversations(dbId: string): Promise<Conversation[]> {
  const resp = await api.get(`/api/conversation/${dbId}`).catch(fail)
  const body = parse(conversationsResponseSchema, resp.data, "GET /api/conversation")
  return body.data.map((c) => ({ thread_id: c.id, title: c.title, database_id: dbId }))
}

export async function getTurns(dbId: string, conversationId: string): Promise<Turn[]> {
  try {
    const resp = await api.get(`/api/turns/${dbId}/${conversationId}`)
    const body = parse(turnsResponseSchema, resp.data, "GET /api/turns")
    // Backend returns the 5 newest turns newest-first; the transcript is
    // chronological, so restore reading order.
    return body.data.slice().reverse()
  } catch (error) {
    // Mock-created conversations never reach the backend; keep their
    // in-session history visible instead of blanking the transcript.
    if (error instanceof ApiError && error.status === 404) {
      return [...(turnsStore.get(conversationId) ?? [])]
    }
    throw error
  }
}

// ──────────────────────────────────────────
//  Databases — real calls
// ──────────────────────────────────────────

export async function listDatabases(): Promise<DatabaseSummary[]> {
  const resp = await api.get("/api/database").catch(fail)
  const body = parse(databasesResponseSchema, resp.data, "GET /api/database")
  return body.data.map((db) => ({
    ...db,
    // GET omits dense_schema (schema indexing runs async after creation).
    dense_schema: db.dense_schema ?? null,
  }))
}

export async function registerDatabase(
  request: RegisterDatabaseRequest,
): Promise<DatabaseSummary> {
  // Shaped exactly for the backend Database_Creation schema before it leaves
  // the client, so a bad submission fails here instead of as a 422.
  const payload = registerDatabaseRequestSchema.parse(request)
  const resp = await api.post("/api/database", payload).catch(fail)
  const body = parse(databaseResponseSchema, resp.data, "POST /api/database")
  return { ...body.data, dense_schema: body.data.dense_schema ?? null }
}

// ──────────────────────────────────────────
//  Chat pipeline — real SSE streaming
//
//  POST /api/chat streams `text/event-stream` frames, emitted in this order
//  (frames may interleave as the agent loops tools → model):
//
//    {"type": "tool_call",   "data": {"query": "SELECT …"}}   — every run_sql
//                                                              call (query text,
//                                                              no result rows)
//    {"type": "tool_result", "data": <ToolMessage | rows[]>} — captured output
//                                                              of that run_sql
//    {"type": "output",      "data": "…full analysis…"}      — final answer,
//                                                              single event
//    {"type": "done"}                                        — turn handed to
//                                                              the queue
//    {"message": "…", "success": false}                      — in-stream failure
//
//  Every frame also carries "conversation_id" (the backend-issued thread id
//  it is running on). It is surfaced to the UI as a synthetic `conversation`
//  event so subsequent questions send it back.
//
//  Frames are scanned as JSON objects rather than split on blank lines:
//  the backend's tool_result frame currently ends without the "\n\n" a
//  strict SSE frame needs, so neighboring frames can arrive glued together.
//  Unknown event shapes are ignored, which keeps the bridge forward-compatible
//  (e.g. token-level `agent_output` deltas, once the backend streams them).
// ──────────────────────────────────────────

export async function createConversation(
  data: CreateConversationRequest,
): Promise<Conversation> {
  // The backend creates conversations implicitly inside POST /api/chat (and
  // returns the real id only once response handling lands). Until then this
  // mock exists purely for the local sidebar/transcript — its id is never
  // sent to the backend.
  await delay(500)
  const title = data.query ? generateTitle(data.query) : "New conversation"
  const conversation: Conversation = {
    thread_id: crypto.randomUUID(),
    title,
    database_id: data.database_id,
    created_at: new Date().toISOString(),
  }
  turnsStore.set(conversation.thread_id, [])
  return conversation
}

export async function* streamChat(
  request: ChatRequest,
  // Local conversation id (may not exist on the backend): the turn store is
  // keyed by this, so locally-created conversations still restore their
  // in-session history.
  localConversationId?: string,
): AsyncGenerator<ChatStreamEvent, void, void> {
  // Aborting on generator exit: whoever stops iterating (user hit New chat,
  // switched conversations, or pressed stop) tears the fetch down with it.
  const controller = new AbortController()

  // The backend's tool events carry no ids, so call ids are minted here in
  // arrival order; run_sql results pair back to calls the same way (FIFO).
  // Everything is also collected for the locally persisted turn below.
  let sqlSeq = 0
  const pendingCalls: string[] = []
  const sqlQueries: string[] = []
  const sqlResults: SqlResult[] = []
  let answer = ""

  try {
    const token = await tokenProvider().catch(() => null)

    const resp = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({
        query: request.query,
        conversation_id: request.conversation_id ?? null,
        db_id: request.db_id,
      }),
      signal: controller.signal,
    })

    if (!resp.ok) {
      let message = `Request failed with status ${resp.status}`
      try {
        const body: unknown = await resp.json()
        const record = body as { message?: unknown } | null
        if (typeof record?.message === "string") message = record.message
      } catch {
        // non-JSON error body — keep the status-based message
      }
      throw new ApiError(message, resp.status)
    }

    if (!resp.body) throw new ApiError("The backend returned no stream.")

    // The backend stamps every frame with the conversation id it is running
    // on. Fresh chats learn their id from the first frame and it is handed
    // to the UI (which then sends it back on subsequent questions).
    let serverConversationId: string | null = null

    for await (const frame of sseFrames(resp.body)) {
      const event = frame as Record<string, unknown>
      const { type } = event

      const frameConversationId =
        typeof event.conversation_id === "string" && event.conversation_id.length > 0
          ? event.conversation_id
          : null
      if (frameConversationId && frameConversationId !== serverConversationId) {
        serverConversationId = frameConversationId
        if (frameConversationId !== request.conversation_id) {
          yield { type: "conversation", id: frameConversationId }
        }
      }

      // In-stream failure: {"message": "…", "success": false}
      if (type === undefined && event.success === false) {
        throw new ApiError(
          typeof event.message === "string"
            ? event.message
            : "The agent failed mid-turn."
        )
      }

      if (type === "tool_call" || type === "run_sql") {
        const args = (
          event.data !== null && typeof event.data === "object" ? event.data : {}
        ) as Record<string, unknown>
        sqlSeq += 1
        const callId = `run_sql-${sqlSeq}`
        sqlQueries.push(typeof args.query === "string" ? args.query : "")
        pendingCalls.push(callId)
        yield { type: "tool_call", tool_name: "run_sql", call_id: callId, args }
      } else if (type === "tool_result") {
        const output = toolResultOutput(event.data)
        const callId = pendingCalls.shift() ?? `run_sql-${sqlSeq + 1}`
        sqlResults.push({ columns: rowColumns(output), rows: parseRows(output) })
        yield { type: "tool_result", call_id: callId, output: output ?? "" }
      } else if (type === "output") {
        // The whole answer arrives as one event. It reveals word-by-word at
        // the token-streaming pace (purely cosmetic — data is already here),
        // so per-chunk buffering inside the UI never makes a delay visible.
        if (typeof event.data === "string" && event.data.length > 0) {
          answer = event.data
          for (const chunk of event.data.match(/\S+\s*/g) ?? []) {
            await delay(TOKEN_PACE_MS)
            yield { type: "agent_output", content: chunk }
          }
        }
      } else if (type === "agent_output") {
        // Forward-compatible: token deltas, once the backend streams them.
        if (typeof event.content === "string" && event.content.length > 0) {
          answer += event.content
          yield { type: "agent_output", content: event.content }
        }
      } else if (type === "done") {
        persistLocalTurn(
          serverConversationId ?? localConversationId ?? request.conversation_id,
          request.query,
          answer,
          sqlQueries,
          sqlResults,
        )
        yield { type: "done" }
        return
      }
    }

    // Stream ended without a done frame. An answer without done still
    // finalizes the turn in the UI; no answer means the agent produced
    // nothing, which is surfaced as an error rather than a silent hang.
    if (answer) {
      persistLocalTurn(
        serverConversationId ?? localConversationId ?? request.conversation_id,
        request.query,
        answer,
        sqlQueries,
        sqlResults,
      )
      yield { type: "done" }
    } else {
      throw new ApiError("The agent returned no answer for this question.")
    }
  } finally {
    controller.abort()
  }
}

// ──────────────────────────────────────────
//  SSE frame parsing
//
//  Yields the JSON object of every `data: {…}` frame. The scanner walks each
//  object character-by-character (string/escape aware), so frames glued
//  together by a missing trailing blank line still parse cleanly, and an
//  object that crosses a chunk boundary simply waits for more bytes.
// ──────────────────────────────────────────

async function* sseFrames(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<unknown, void, void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      while (true) {
        const next = nextSseFrame(buffer)
        if (!next) break
        buffer = next.rest
        if (next.frame !== null) yield next.frame
      }
    }
  } finally {
    reader.cancel().catch(() => {})
  }
}

/** Extracts one `data: {…}` JSON frame from the head of the buffer, or null when no complete frame is available yet. */
function nextSseFrame(buffer: string): { frame: unknown; rest: string } | null {
  const at = buffer.indexOf("data:")
  if (at === -1) return null

  const brace = buffer.indexOf("{", at + 5)
  if (brace === -1) return null // JSON body not fully received yet

  let depth = 0
  let inString = false
  let escaped = false
  let end = -1

  for (let i = brace; i < buffer.length; i++) {
    const ch = buffer[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === "\\") escaped = true
      else if (ch === '"') inString = false
    } else if (ch === '"') {
      inString = true
    } else if (ch === "{") {
      depth += 1
    } else if (ch === "}") {
      depth -= 1
      if (depth === 0) {
        end = i + 1
        break
      }
    }
  }

  if (end === -1) return null // object crosses a chunk boundary

  let frame: unknown
  try {
    frame = JSON.parse(buffer.slice(brace, end))
  } catch {
    frame = null
  }
  return { frame, rest: buffer.slice(end) }
}

/**
 * Normalizes a tool_result payload into the JSON text the UI parses.
 * Accepted shapes (run_sql content is itself a JSON string, so it frequently
 * arrives double-encoded):
 *   "[{…row…}]"                          — rows JSON directly
 *   "\"[{…row…}]\""                      — double-encoded rows (json.dumps of the content string)
 *   {"content": "[{…row…}]"} (or its JSON string) — ToolMessage dict / envelope
 * Plain strings (e.g. run_sql validation errors) pass through untouched so
 * the UI can still show a query card, just without a table.
 */
function toolResultOutput(data: unknown): string | null {
  if (typeof data === "string") {
    let text = data
    for (let depth = 0; depth < 3; depth++) {
      try {
        const parsed: unknown = JSON.parse(text)
        if (Array.isArray(parsed)) return text // rows JSON reached
        if (typeof parsed === "string") {
          text = parsed // still encoded — decode one more layer
          continue
        }
        if (parsed !== null && typeof parsed === "object") {
          const content = (parsed as Record<string, unknown>).content
          if (typeof content === "string") return content
          return JSON.stringify(parsed)
        }
        return JSON.stringify(parsed)
      } catch {
        return text // not JSON: opaque output (parse/validation error text)
      }
    }
    return text
  }
  if (data !== null && typeof data === "object") {
    const record = data as Record<string, unknown>
    if (typeof record.content === "string") return record.content
  }
  return null
}

/** Parses run_sql output (JSON array of row objects) into structured rows. */
function parseRows(output: string | null): SqlResultRow[] {
  if (!output) return []
  try {
    const parsed: unknown = JSON.parse(output)
    return Array.isArray(parsed) ? (parsed as SqlResultRow[]) : []
  } catch {
    return []
  }
}

function rowColumns(output: string | null): string[] {
  const rows = parseRows(output)
  return rows.length > 0 ? Object.keys(rows[0] ?? {}) : []
}

/** Persists the finished turn locally so reopening a locally-created conversation restores it (stand-in for the Celery-backed insert_chats_in_db task). Keyed by the resolved conversation id (backend-issued when the stream announced one). */
function persistLocalTurn(
  conversationId: string | undefined | null,
  userQuery: string,
  answer: string,
  sqlQueries: string[],
  sqlResults: SqlResult[],
): void {
  if (!conversationId || !answer) return

  const turn: Turn = {
    id: crypto.randomUUID(),
    conversation_id: conversationId,
    user_query: userQuery,
    ai_response: answer,
    sql_query: sqlQueries.length > 0 ? sqlQueries : null,
    results: sqlResults,
    created_at: new Date().toISOString(),
  }
  const list = turnsStore.get(conversationId) ?? []
  turnsStore.set(conversationId, [...list, turn])
}

// ──────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Revealed-answer pace for one-shot `output` frames (ms per word). */
const TOKEN_PACE_MS = 40

function generateTitle(query: string): string {
  const q = query.toLowerCase()
  if (q.includes("revenue") || q.includes("sales")) return "Revenue Analysis"
  if (q.includes("customer")) return "Customer Insights"
  if (q.includes("product")) return "Product Performance"
  if (q.includes("trend")) return "Trend Analysis"
  const firstWords = query.trim().split(/\s+/).slice(0, 5).join(" ")
  return firstWords.length >= 60 ? firstWords.slice(0, 57) + "…" : firstWords || "New conversation"
}

// ──────────────────────────────────────────
//  Dashboard Edit/Delete — client-local stand-ins
//
//  The backend does not expose PATCH/DELETE on /api/database yet, so these
//  return the patched/deleted result locally without persisting. They take
//  the current DatabaseSummary because the real list no longer shares state
//  with a mock store.
// ──────────────────────────────────────────

export async function updateDatabase(
  db: DatabaseSummary,
  patch: UpdateDatabaseRequest,
): Promise<DatabaseSummary> {
  await delay(900)
  return {
    ...db,
    ...(patch.database_name !== undefined ? { database_name: patch.database_name } : {}),
    ...(patch.description !== undefined ? { description: patch.description } : {}),
  }
}

export async function deleteDatabase(db: DatabaseSummary): Promise<void> {
  void db
  await delay(900)
}
