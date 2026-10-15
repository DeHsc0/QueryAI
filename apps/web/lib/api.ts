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

export const mockConversations: Conversation[] = [
  { thread_id: "conv_1", title: "Sales by Region Analysis" },
  { thread_id: "conv_2", title: "Customer Behavior Insights" },
  { thread_id: "conv_3", title: "Product Performance Q1" },
];

export const mockTurns: Turn[] = [
  {
    id: "turn_1",
    conversation_id: "conv_1",
    user_query: "Show me the top 5 customers by total spending this month",
    ai_response:
      "Based on the sales data, here are the top 5 customers by total spending this month. Alice Johnson leads with $15,420.50, followed by Bob Smith at $12,300.00. The results show a healthy distribution of spending across your customer base.",
    sql_query: [
      "SELECT c.name AS customer_name, SUM(o.total) AS total_spent FROM customers c JOIN orders o ON c.id = o.customer_id WHERE DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE) GROUP BY c.name ORDER BY total_spent DESC LIMIT 5",
    ],
    created_at: "2025-02-20T16:45:00Z",
  },
  {
    id: "turn_2",
    conversation_id: "conv_1",
    user_query: "What's the month-over-month revenue trend?",
    ai_response:
      "Revenue grew 15% month-over-month. January: $45,200. February: $52,000.",
    sql_query: [
      "SELECT DATE_TRUNC('month', order_date) AS month, SUM(total) AS revenue FROM orders GROUP BY month ORDER BY month",
    ],
    created_at: "2025-02-20T16:47:00Z",
  },
];

// Simulated SSE stream events showing a full question→SQL→table→insight cycle
const mockStreamEvents: ChatStreamEvent[] = [
  // Agent decides to call run_sql
  {
    type: "tool_call",
    tool_name: "run_sql",
    call_id: "call_sql_1",
    args: {
      query:
        "SELECT customer_name, total_spent FROM (\n  SELECT c.name AS customer_name, SUM(o.total) AS total_spent\n  FROM customers c\n  JOIN orders o ON c.id = o.customer_id\n  WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE)\n  GROUP BY c.name\n  ORDER BY total_spent DESC\n  LIMIT 5\n) t",
    },
  },
  // Tool returns JSON array of row objects
  {
    type: "tool_result",
    call_id: "call_sql_1",
    output: JSON.stringify([
      { customer_name: "Alice Johnson", total_spent: 15420.5 },
      { customer_name: "Bob Smith", total_spent: 12300.0 },
      { customer_name: "Carol Lee", total_spent: 8750.75 },
      { customer_name: "David Kim", total_spent: 6200.0 },
      { customer_name: "Eva Martinez", total_spent: 4800.25 },
    ]),
  },
  // Token-by-token agent output (final answer)
  { type: "agent_output", content: "Based on my analysis of your sales database," },
  { type: "agent_output", content: " here are the top 5 customers by total spending this month:\n\n" },
  {
    type: "agent_output",
    content:
      "| Customer Name | Total Spent |\n| --- | --- |\n| Alice Johnson | $15,420.50 |\n| Bob Smith | $12,300.00 |\n| Carol Lee | $8,750.75 |\n| David Kim | $6,200.00 |\n| Eva Martinez | $4,800.25 |\n\n",
  },
  {
    type: "agent_output",
    content:
      "Alice Johnson is your top customer this month with $15,420.50 in spending. The top 5 customers account for a significant portion of monthly revenue.",
  },
];

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
  const title = data.query ? generateTitle(data.query) : "New Conversation";
  return {
    thread_id: crypto.randomUUID(),
    title,
  };
}

export async function getTurns(_threadId: string): Promise<Turn[]> {
  // Real: const resp = await api.get("/api/turns", {
  //         params: { thread_id: threadId },
  //       });
  //       return resp.data.Data || [];
  return mockTurns;
}

export async function* streamChat(
  _request: ChatRequest,
): AsyncGenerator<ChatStreamEvent, void, void> {
  // Real SSE implementation:
  // const resp = await fetch(`${BACKEND_URL}/api/chat`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   credentials: "include",
  //   body: JSON.stringify(request),
  // });
  // const reader = resp.body?.getReader();
  // const decoder = new TextDecoder();
  // while (true) {
  //   const { done, value } = await reader.read();
  //   if (done) break;
  //   const text = decoder.decode(value, { stream: true });
  //   for (const line of text.split("\n\n")) {
  //     if (line.startsWith("data: ")) {
  //       const event = JSON.parse(line.slice(6));
  //       yield event;
  //     }
  //   }
  // }
  // yield { type: "done" };

  // Simulated streaming with sample data
  for (const event of mockStreamEvents) {
    if (event.type === "tool_call" || event.type === "tool_result") {
      await delay(400);
    } else if (event.type === "agent_output") {
      await delay(30); // token-level pacing
    }
    yield event;
  }
  await delay(200);
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
  return "New Conversation";
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
