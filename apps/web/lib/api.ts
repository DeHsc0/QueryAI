/**
 * Client-side API module.
 *
 * Every function returns **sample data**. The real backend implementation
 * (an axios instance pointing at NEXT_PUBLIC_BACKEND_URL) is commented
 * out so you can swap it in once chat.py SSE is ready.
 */

import type {
  Database,
  CreateDatabaseRequest,
  Conversation,
  CreateConversationRequest,
  Turn,
  ChatRequest,
  ChatStreamEvent,
  DatabaseSummary,
  RegisterDatabaseRequest,
  UpdateDatabaseRequest,
  SqlResultRow,
} from "./types";

// ──────────────────────────────────────────
//  Real backend client — wire up when backend is ready
// ──────────────────────────────────────────

// import axios from "axios";
// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";
// const api = axios.create({ baseURL: BACKEND_URL, withCredentials: true });

// ──────────────────────────────────────────
//  Sample / mock data
// ──────────────────────────────────────────

export const mockDatabases: Database[] = [
  {
    id: "db_01",
    user_clerk_id: "user_2xSampleClerkId",
    encrypted_creds: "***",
    database_name: "alien_signals",
    database_soft: "postgresql",
    description: "Telescope signal database with SNR ratios and observatory data",
    dense_schema:
      "T:signals | cols:8 fields:id,observatory_id,telescope_id,snr_ratio,sender,signal_type,signal_blob,received_at\nT:telescopes | cols:5 fields:id,name,location,model,commissioned\nT:observatories | cols:4 fields:id,name,latitude,longitude",
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
  },
  {
    id: "db_02",
    user_clerk_id: "user_2xSampleClerkId",
    encrypted_creds: "***",
    database_name: "ecommerce_store",
    database_soft: "mysql",
    description: "E-commerce store with products, orders, and customers",
    dense_schema:
      "T:products | cols:6 fields:id,name,category,price,stock,created_at\nT:orders | cols:8 fields:id,customer_id,product_id,quantity,total,status,created_at\nT:customers | cols:5 fields:id,name,email,country,created_at",
    created_at: "2025-02-20T14:30:00Z",
    updated_at: "2025-02-20T14:30:00Z",
  },
  {
    id: "db_03",
    user_clerk_id: "user_2xSampleClerkId",
    encrypted_creds: "***",
    database_name: "saas_analytics",
    database_soft: "postgresql",
    description: "SaaS analytics with subscriptions, events, and metrics",
    dense_schema:
      "T:subscriptions | cols:5 fields:id,user_id,plan,amount,status\nT:events | cols:6 fields:id,user_id,event_name,properties,created_at\nT:metrics | cols:4 fields:id,name,value,recorded_at",
    created_at: "2025-03-10T11:15:00Z",
    updated_at: "2025-03-10T11:15:00Z",
  },
];

// ──────────────────────────────────────────
//  Conversations + turns — mock-first stores
//
//  Real backend contracts:
//    GET  /api/turns?thread_id= → saved turns for a conversation (sql_query is
//        persisted; structured results currently only exist while streaming,
//        see Turn.results for the expected backend addition)
//    POST /api/conversation { database_id, query? } → creates a conversation
//        (title generated with the LLM server-side)
//    POST /api/chat SSE — kept in the streamChat function below.
// ──────────────────────────────────────────

const hoursAgo = (h: number): string => new Date(Date.now() - h * 3_600_000).toISOString();

const seedConversations: Conversation[] = [
  {
    thread_id: "conv_1",
    title: "Customer spend analysis",
    database_id: "db_02",
    created_at: hoursAgo(3),
  },
  {
    thread_id: "conv_2",
    title: "Signal strength by observatory",
    database_id: "db_01",
    created_at: hoursAgo(27),
  },
  {
    thread_id: "conv_3",
    title: "MRR growth trend",
    database_id: "db_03",
    created_at: hoursAgo(120),
  },
];

export const mockTurns: Turn[] = [
  {
    id: "turn_1",
    conversation_id: "conv_1",
    user_query: "Show me the top 5 customers by total spending this month",
    ai_response:
      "Alice Johnson is your top customer this month with $15,420.50 in spending. The top 5 carry a large share of monthly revenue, so the distribution is healthy but weighted toward the head of the list.",
    sql_query: [
      "SELECT c.name AS customer_name, SUM(o.total) AS total_spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nWHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)\nGROUP BY c.name\nORDER BY total_spent DESC\nLIMIT 5;",
    ],
    results: [
      {
        columns: ["customer_name", "total_spent"],
        rows: [
          { customer_name: "Alice Johnson", total_spent: 15420.5 },
          { customer_name: "Bob Smith", total_spent: 12300.0 },
          { customer_name: "Carol Lee", total_spent: 8750.75 },
          { customer_name: "David Kim", total_spent: 6200.0 },
          { customer_name: "Eva Martinez", total_spent: 4800.25 },
        ],
      },
    ],
    created_at: hoursAgo(3),
  },
  {
    id: "turn_2",
    conversation_id: "conv_1",
    user_query: "And how is revenue trending month over month?",
    ai_response:
      "Revenue grew every month this quarter: $45,200 (Jan), $52,000 (Feb), $61,400 (Mar). The March figure is 15% up on February, and the three-month total is $158,600.",
    sql_query: [
      "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(total) AS revenue\nFROM orders\nGROUP BY month\nORDER BY month;",
    ],
    results: [
      {
        columns: ["month", "revenue"],
        rows: [
          { month: "2025-01", revenue: 45200 },
          { month: "2025-02", revenue: 52000 },
          { month: "2025-03", revenue: 61400 },
        ],
      },
    ],
    created_at: hoursAgo(2.5),
  },
];

const turnsStoreSeed: Record<string, Turn[]> = {
  conv_1: mockTurns,
  conv_2: [
    {
      id: "turn_3",
      conversation_id: "conv_2",
      user_query: "Which observatory detected the strongest signals?",
      ai_response:
        "Mauna Kea logs the strongest detection of the period at SNR 18.4 and also leads raw detection volume with 214 readings, so its lead is not a one-off.",
      sql_query: [
        "SELECT ob.name AS observatory, MAX(s.snr_ratio) AS peak_snr, COUNT(s.id) AS detections\nFROM signals s\nJOIN observatories ob ON ob.id = s.observatory_id\nGROUP BY ob.name\nORDER BY peak_snr DESC\nLIMIT 4;",
      ],
      results: [
        {
          columns: ["observatory", "peak_snr", "detections"],
          rows: [
            { observatory: "Mauna Kea", peak_snr: 18.4, detections: 214 },
            { observatory: "La Palma", peak_snr: 15.2, detections: 167 },
            { observatory: "Paranal", peak_snr: 12.9, detections: 189 },
            { observatory: "Siding Spring", peak_snr: 9.6, detections: 143 },
          ],
        },
      ],
      created_at: hoursAgo(27),
    },
  ],
  conv_3: [
    {
      id: "turn_4",
      conversation_id: "conv_3",
      user_query: "How has MRR trended over the last six months?",
      ai_response:
        "MRR grew 38% over six months, from $28.4k in April to $38.6k in September, with no down month in the series and a near-linear curve.",
      sql_query: [
        "SELECT DATE_TRUNC('month', recorded_at) AS month, value\nFROM metrics\nWHERE name = 'mrr' AND recorded_at >= NOW() - INTERVAL '6 months'\nORDER BY month;",
      ],
      results: [
        {
          columns: ["month", "value"],
          rows: [
            { month: "2025-04-01", value: 28400 },
            { month: "2025-05-01", value: 30100 },
            { month: "2025-06-01", value: 31850 },
            { month: "2025-07-01", value: 33900 },
            { month: "2025-08-01", value: 36100 },
            { month: "2025-09-01", value: 38600 },
          ],
        },
      ],
      created_at: hoursAgo(120),
    },
  ],
};

/** Per-session conversation + turn state. Never holds credentials. */
let conversationStore: Conversation[] = seedConversations.map((c) => ({ ...c }));
const turnsStore: Map<string, Turn[]> = new Map(
  Object.entries(turnsStoreSeed).map(([id, list]) => [id, list.map((t) => ({ ...t }))]),
);

export async function listConversations(dbId?: string): Promise<Conversation[]> {
  // Real: const resp = await api.get("/api/conversation"); // filtered per database
  await delay(450);
  const filtered = dbId ? conversationStore.filter((c) => (c.database_id ?? "unknown") === dbId) : conversationStore;
  return [...filtered].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}

export async function getTurns(threadId: string): Promise<Turn[]> {
  // Real: const resp = await api.get("/api/turns", { params: { thread_id: threadId } });
  //       return resp.data.Data || [];
  await delay(500);
  return [...(turnsStore.get(threadId) ?? [])];
}

// ──────────────────────────────────────────
//  Utility
// ──────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ──────────────────────────────────────────
//  API functions (return sample data)
// ──────────────────────────────────────────

export async function getDatabases(): Promise<Database[]> {
  // Real: const resp = await api.get("/api/database");
  //       return resp.data.data.map((db: string) => JSON.parse(db));
  return mockDatabases;
}

export async function createDatabase(
  _data: CreateDatabaseRequest,
): Promise<{ message: string }> {
  // Real: const resp = await api.post("/api/database", data);
  //       return resp.data;
  return { message: "Successfully created Database" };
}

export async function createConversation(
  data: CreateConversationRequest,
): Promise<Conversation> {
  // Real: const resp = await api.post("/api/conversation", data);
  //       return resp.data;
  await delay(500);
  const title = data.query ? generateTitle(data.query) : "New conversation";
  const conversation: Conversation = {
    thread_id: crypto.randomUUID(),
    title,
    database_id: data.database_id,
    created_at: new Date().toISOString(),
  };
  conversationStore = [conversation, ...conversationStore];
  turnsStore.set(conversation.thread_id, []);
  return conversation;
}

// ──────────────────────────────────────────
//  Streaming chat — mock events with the same shape the SSE bridge will
//  produce for POST /api/chat (tool_call / tool_result / agent_output / done)
// ──────────────────────────────────────────

const revenueRows = () => [
  { product: "Meridian Desk Lamp", revenue: 4820, orders: 96 },
  { product: "Fieldline Backpack", revenue: 3690, orders: 74 },
  { product: "Halden Mug Set", revenue: 3156, orders: 118 },
];

const growthRows = () => [
  { month: "2025-05", revenue: 52000 },
  { month: "2025-06", revenue: 56400 },
  { month: "2025-07", revenue: 60500 },
  { month: "2025-08", revenue: 65200 },
  { month: "2025-09", revenue: 68900 },
];

const customerRows = () => [
  { customer: "Alice Johnson", orders: 18, total: 15420.5 },
  { customer: "Bob Smith", orders: 14, total: 12300.0 },
  { customer: "Carol Lee", orders: 9, total: 8750.75 },
];

interface StreamScenario {
  sql: string;
  rows: () => Record<string, unknown>[];
  answer: string;
}

function scenarioFor(query: string): StreamScenario {
  const q = query.toLowerCase();
  if (q.includes("customer")) {
    return {
      sql: "SELECT c.name AS customer, COUNT(*) AS orders, SUM(o.total) AS total\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.name\nORDER BY orders DESC\nLIMIT 5;",
      rows: customerRows,
      answer:
        "Alice Johnson places the most orders (18, $15,420.50 lifetime total), ahead of Bob Smith (14) and Carol Lee (9). Your top three customers hold a significant share of order volume, so retention programs focused on this segment have real leverage.",
    };
  }
  if (q.includes("trend") || q.includes("growth") || q.includes("monthly") || q.includes("month")) {
    return {
      sql: "SELECT DATE_FORMAT(o.created_at, '%Y-%m') AS month, SUM(o.total) AS revenue\nFROM orders o\nGROUP BY month\nORDER BY month;",
      rows: growthRows,
      answer:
        "Monthly revenue climbs steadily: $52.0k (May), $56.4k (Jun), $60.5k (Jul), $65.2k (Aug), $68.9k (Sep). That is a 32% gain over five months with no down month, so growth is structural rather than a one-off spike.",
    };
  }
  if (q.includes("products") || q.includes("product") || q.includes("revenue")) {
    return {
      sql: "SELECT p.name AS product, SUM(o.total) AS revenue, COUNT(*) AS orders\nFROM orders o\nJOIN products p ON p.id = o.product_id\nWHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)\nGROUP BY p.name\nORDER BY revenue DESC\nLIMIT 5;",
      rows: revenueRows,
      answer:
        "The Meridian Desk Lamp leads the quarter at $4,820 across 96 orders. Home-office goods dominate the top five: the desk lamp, backpack, and desk mat together carry most of the range, so a bundle across them should test well.",
    };
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
  };
}

export async function* streamChat(
  request: ChatRequest,
): AsyncGenerator<ChatStreamEvent, void, void> {
  // Real SSE bridge for POST /api/chat:
  // const resp = await fetch(`${BACKEND_URL}/api/chat`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   credentials: "include",
  //   body: JSON.stringify(request),
  // });
  // ... read `data: ` SSE lines and yield ChatStreamEvent objects …
  // yield { type: "done" };

  const scenario = scenarioFor(request.query);
  const callRetrieve = "call_retrieve";
  const callSql = "call_sql";

  await delay(400);
  yield { type: "tool_call", tool_name: "retrieve_context", call_id: callRetrieve, args: {} };
  await delay(700);
  yield {
    type: "tool_result",
    call_id: callRetrieve,
    output: JSON.stringify({ ok: true, tables: 3 }),
  };
  await delay(550);
  yield { type: "tool_call", tool_name: "run_sql", call_id: callSql, args: { query: scenario.sql } };
  await delay(750);
  yield { type: "tool_result", call_id: callSql, output: JSON.stringify(scenario.rows()) };

  const chunks = scenario.answer.match(/\S+\s*/g) ?? [];
  for (const chunk of chunks) {
    await delay(55);
    yield { type: "agent_output", content: chunk };
  }
  await delay(150);

  // Persist the finished turn so reopening the conversation restores it
  // (mock stand-in for the Celery-backed insert_chats_in_db task).
  if (request.conversation_id) {
    const turn: Turn = {
      id: crypto.randomUUID(),
      conversation_id: request.conversation_id,
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
    };
    const list = turnsStore.get(request.conversation_id) ?? [];
    turnsStore.set(request.conversation_id, [...list, turn]);
  }

  yield { type: "done" };
}

// ──────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────

function generateTitle(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("revenue") || q.includes("sales")) return "Revenue Analysis";
  if (q.includes("customer")) return "Customer Insights";
  if (q.includes("product")) return "Product Performance";
  if (q.includes("trend")) return "Trend Analysis";
  const firstWords = query.trim().split(/\s+/).slice(0, 5).join(" ");
  return firstWords.length >= 60 ? firstWords.slice(0, 57) + "…" : firstWords || "New conversation";
}

// ──────────────────────────────────────────
//  Dashboard databases — mock-first store
//
//  Real backend contract (apps/backend/api/endpoints/database.py):
//    GET  /api/database  → list of UserDatabases for the Clerk user
//    POST /api/database  → Database_Creation { database_name, description?, creds }
//                          creds are encrypted server-side (Fernet) and never returned.
//
//  Replace listDatabases/registerDatabase bodies with axios calls (commented
//  inline) once the backend is wired. The store below never keeps passwords.
// ──────────────────────────────────────────

const seedDatabases: DatabaseSummary[] = mockDatabases.map((db) => ({
  id: db.id,
  database_name: db.database_name,
  database_soft: db.database_soft,
  description: db.description,
  dense_schema: db.dense_schema,
  created_at: db.created_at,
}));

const STORE_KEY = "qai_demo_databases";
let dashboardStore: DatabaseSummary[];

try {
  // Metadata-only session persistence so a demo registration survives page
  // reloads in the same tab. Never store credentials here (or anywhere).
  const saved = typeof window !== "undefined" ? sessionStorage.getItem(STORE_KEY) : null;
  dashboardStore = saved ? (JSON.parse(saved) as DatabaseSummary[]) : [...seedDatabases];
} catch {
  dashboardStore = [...seedDatabases];
}

function persistStore(): void {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(dashboardStore));
  } catch {
    /* non-fatal for a demo */
  }
}

export async function listDatabases(): Promise<DatabaseSummary[]> {
  // Real: const resp = await api.get("/api/database");
  //       return resp.data.data.map((db: string) => JSON.parse(db) as DatabaseSummary);
  await delay(650);
  return [...dashboardStore];
}

export async function registerDatabase(
  request: RegisterDatabaseRequest,
): Promise<DatabaseSummary> {
  // Real: const resp = await api.post("/api/database", request);
  //       return { id: resp.data.id, ... }  // server returns safe metadata only
  await delay(1500);
  const created: DatabaseSummary = {
    id: crypto.randomUUID(),
    database_name: request.database_name,
    database_soft: request.creds.database_type,
    description: request.description ?? null,
    // The real backend extracts + indexes the schema during registration.
    // Mock cannot honestly claim that work happened, so it stays null until
    // the live integration runs.
    dense_schema: null,
    created_at: new Date().toISOString(),
  };
  dashboardStore = [created, ...dashboardStore];
  persistStore();
  return created;
}

/** Dev-preview helpers: from an empty dashboard to sample data and back. */
export function clearSampleDatabases(): void {
  dashboardStore = [];
  persistStore();
}

export function restoreSampleDatabases(): void {
  dashboardStore = [...seedDatabases];
  persistStore();
}

export async function updateDatabase(
  id: string,
  patch: UpdateDatabaseRequest,
): Promise<DatabaseSummary> {
  // Real: const resp = await api.patch(`/api/database/${id}`, patch);
  //       return resp.data;  // safe metadata only
  await delay(900);
  let updated: DatabaseSummary | undefined;
  dashboardStore = dashboardStore.map((db) => {
    if (db.id !== id) return db;
    updated = {
      ...db,
      ...(patch.database_name !== undefined ? { database_name: patch.database_name } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
    };
    return updated;
  });
  if (!updated) throw new Error("Database not found");
  persistStore();
  return updated;
}

export async function deleteDatabase(id: string): Promise<void> {
  // Real: await api.delete(`/api/database/${id}`);
  await delay(900);
  const before = dashboardStore.length;
  dashboardStore = dashboardStore.filter((db) => db.id !== id);
  if (dashboardStore.length === before) throw new Error("Database not found");
  persistStore();
}
