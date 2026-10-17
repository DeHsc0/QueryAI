/**
 * Client-side API module.
 *
 * Database, conversation, and turn endpoints talk to the real FastAPI backend
 * (Clerk Bearer auth, every response validated with zod — see lib/schemas.ts).
 *  The chat send pipeline fires the real POST /api/chat (sendChatRequest,
 *  called from streamChat) but keeps the mock streaming scenario for the UI
 *  until the backend starts returning usable responses; the dashboard
 *  Edit/Delete dialogs are still mock-backed until the backend PATCH/DELETE
 *  endpoints exist.
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
//  The send pipeline (POST /api/chat) is still mock, so mock-created
//  conversations only exist locally; getTurns falls back to the local
//  store for those before giving up.
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
//  Chat pipeline — real request (sendChatRequest), mock streaming responses
//  until the backend sends usable data back
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

const revenueRows = () => [
  { product: "Meridian Desk Lamp", revenue: 4820, orders: 96 },
  { product: "Fieldline Backpack", revenue: 3690, orders: 74 },
  { product: "Halden Mug Set", revenue: 3156, orders: 118 },
]

const growthRows = () => [
  { month: "2025-05", revenue: 52000 },
  { month: "2025-06", revenue: 56400 },
  { month: "2025-07", revenue: 60500 },
  { month: "2025-08", revenue: 65200 },
  { month: "2025-09", revenue: 68900 },
]

const customerRows = () => [
  { customer: "Alice Johnson", orders: 18, total: 15420.5 },
  { customer: "Bob Smith", orders: 14, total: 12300.0 },
  { customer: "Carol Lee", orders: 9, total: 8750.75 },
]

interface StreamScenario {
  sql: string
  rows: () => Record<string, unknown>[]
  answer: string
}

function scenarioFor(query: string): StreamScenario {
  const q = query.toLowerCase()
  if (q.includes("customer")) {
    return {
      sql: "SELECT c.name AS customer, COUNT(*) AS orders, SUM(o.total) AS total\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.name\nORDER BY orders DESC\nLIMIT 5;",
      rows: customerRows,
      answer:
        "Alice Johnson places the most orders (18, $15,420.50 lifetime total), ahead of Bob Smith (14) and Carol Lee (9). Your top three customers hold a significant share of order volume, so retention programs focused on this segment have real leverage.",
    }
  }
  if (q.includes("trend") || q.includes("growth") || q.includes("monthly") || q.includes("month")) {
    return {
      sql: "SELECT DATE_FORMAT(o.created_at, '%Y-%m') AS month, SUM(o.total) AS revenue\nFROM orders o\nGROUP BY month\nORDER BY month;",
      rows: growthRows,
      answer:
        "Monthly revenue climbs steadily: $52.0k (May), $56.4k (Jun), $60.5k (Jul), $65.2k (Aug), $68.9k (Sep). That is a 32% gain over five months with no down month, so growth is structural rather than a one-off spike.",
    }
  }
  if (q.includes("products") || q.includes("product") || q.includes("revenue")) {
    return {
      sql: "SELECT p.name AS product, SUM(o.total) AS revenue, COUNT(*) AS orders\nFROM orders o\nJOIN products p ON p.id = o.product_id\nWHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)\nGROUP BY p.name\nORDER BY revenue DESC\nLIMIT 5;",
      rows: revenueRows,
      answer:
        "The Meridian Desk Lamp leads the quarter at $4,820 across 96 orders. Home-office goods dominate the top five: the desk lamp, backpack, and desk mat together carry most of the range, so a bundle across them should test well.",
    }
  }
  return {
    sql: "SELECT table_name, n_rows\nFROM sample_table_stats\nWHERE schema = 'YOUR_SCHEMA_NAME'\nORDER BY n_rows DESC\nLIMIT 3;",
    rows: () => [
      { table_name: "orders", n_rows: 1240 },
      { table_name: "customers", n_rows: 310 },
      { table_name: "products", n_rows: 24 },
    ],
    answer:
      "This dataset is compact: 1,240 orders, 310 customers, and 24 products. Every order relates to one customer and one product at a join depth of two, so aggregated answers stay fast and the dimensional tables carry most of the analytical value.",
  }
}

export interface ChatSendResult {
  ok: boolean
  status?: number
  message: string | null
}

/**
 * The real chat request. POST /api/chat exists on the backend but currently
 * returns nothing useful (`{"data": ""}` once the entire agent run has
 * completed), so the outcome is captured and logged here; real response
 * handling (SSE bridge → ChatStreamEvent) lands when the backend streams.
 */
export async function sendChatRequest(request: ChatRequest): Promise<ChatSendResult> {
  try {
    const resp = await api.post("/api/chat", {
      query: request.query,
      conversation_id: request.conversation_id ?? null,
      db_id: request.db_id,
    })
    return { ok: true, status: resp.status, message: null }
  } catch (error) {
    const e = toApiError(error)
    console.warn(`Chat request failed (${e.status ?? "network error"}): ${e.message}`)
    return { ok: false, status: e.status, message: e.message }
  }
}

export async function* streamChat(
  request: ChatRequest,
  // Local conversation id (may not exist on the backend): the mock turn
  // store is keyed by this, so locally-created conversations still restore
  // their in-session history.
  localConversationId?: string,
): AsyncGenerator<ChatStreamEvent, void, void> {
  // Fire the real POST /api/chat for this turn (sendChatRequest captures the
  // outcome without throwing — the backend streams nothing yet). UI streaming
  // is unchanged: the mock scenario below keeps the transcript honest until
  // real response handling replaces it.
  void sendChatRequest(request)

  const scenario = scenarioFor(request.query)
  const callRetrieve = "call_retrieve"
  const callSql = "call_sql"

  await delay(400)
  yield { type: "tool_call", tool_name: "retrieve_context", call_id: callRetrieve, args: {} }
  await delay(700)
  yield {
    type: "tool_result",
    call_id: callRetrieve,
    output: JSON.stringify({ ok: true, tables: 3 }),
  }
  await delay(550)
  yield { type: "tool_call", tool_name: "run_sql", call_id: callSql, args: { query: scenario.sql } }
  await delay(750)
  yield { type: "tool_result", call_id: callSql, output: JSON.stringify(scenario.rows()) }

  const chunks = scenario.answer.match(/\S+\s*/g) ?? []
  for (const chunk of chunks) {
    await delay(55)
    yield { type: "agent_output", content: chunk }
  }
  await delay(150)

  // Persist the finished turn so reopening the conversation restores it
  // (mock stand-in for the Celery-backed insert_chats_in_db task). Keyed by
  // the local conversation id — backend-created records come later.
  const persistConversationId = localConversationId ?? request.conversation_id
  if (persistConversationId) {
    const turn: Turn = {
      id: crypto.randomUUID(),
      conversation_id: persistConversationId,
      user_query: request.query,
      ai_response: scenario.answer,
      sql_query: [scenario.sql],
      results: [
        {
          columns: Object.keys(scenario.rows()[0] ?? {}),
          rows: scenario.rows() as SqlResultRow[],
        },
      ],
      created_at: new Date().toISOString(),
    }
    const list = turnsStore.get(persistConversationId) ?? []
    turnsStore.set(persistConversationId, [...list, turn])
  }

  yield { type: "done" }
}

// ──────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
