// Database connection types — match backend schemas.py + models.py

export type DatabaseType = "postgresql" | "mysql" | "oracle" | "microsoft";

/**
 * Safe database metadata for the UI. Deliberately excludes `encrypted_creds`
 * (and any credential material): the browser only ever displays metadata the
 * backend already allows users to see.
 */
export interface DatabaseSummary {
  id: string;
  database_name: string;
  database_soft: DatabaseType;
  description: string | null;
  dense_schema: string | null;
  created_at: string;
}

/** Payload for registering a database — matches backend Database_Creation. */
export interface RegisterDatabaseRequest {
  database_name: string;
  description?: string;
  creds: Credentials;
}

/**
 * Mutable database fields. Only these are editable from the UI: the backend
 * model does not support changing vendor, credentials, or schema via rename.
 */
export interface UpdateDatabaseRequest {
  database_name?: string;
  description?: string | null;
}

export interface Credentials {
  host: string;
  database_type: DatabaseType;
  username: string;
  password: string;
  port: number;
  database: string;
}

// Conversation types — match conversation.py

export interface Conversation {
  thread_id: string;
  title: string;
  /** Owning database (used by the UI for per-database conversation lists). */
  database_id?: string;
  /** Creation timestamp (Real contract: conversations table created_at). */
  created_at?: string;
}

export interface CreateConversationRequest {
  database_id: string;
  query?: string;
}

// Turn / conversation history — match turns.py + models.py Turns

export interface Turn {
  id: string;
  conversation_id: string;
  user_query: string;
  ai_response: string;
  sql_query: string[] | null;
  created_at: string;
  /**
   * Structured results per executed SQL index. The real backend currently
   * persists only `sql_query`; structured result data arrives via tool
   * results while streaming. Expected backend addition: persist per-query
   * results so reopened conversations restore them (docs in Context.md derive
   * results from run_sql tool output: JSON array of row objects).
   */
  results?: SqlResult[];
}

// Chat — match schemas.py Chat

export interface ChatRequest {
  query: string;
  /** null for a fresh chat: the backend creates the conversation itself. */
  conversation_id?: string | null;
  db_id: string;
}

// SSE streaming event types — what the frontend will receive from /api/chat
// The backend tracks: tool calls (SQL queries), tool results (JSON arrays),
// and agent output (token-by-token) — emitted as SSE events

export interface ToolCallEvent {
  type: "tool_call";
  tool_name: string;
  call_id: string;
  args: Record<string, unknown>;
}

export interface ToolResultEvent {
  type: "tool_result";
  call_id: string;
  output: string;
}

export interface AgentOutputEvent {
  type: "agent_output";
  content: string;
}

export interface DoneEvent {
  type: "done";
}

export type ChatStreamEvent =
  | ToolCallEvent
  | ToolResultEvent
  | AgentOutputEvent
  | DoneEvent;

// Parsed SQL result rows — the run_sql tool returns a JSON array of
// plain objects (column -> value). Frontend parses for table rendering.
export interface SqlResultRow {
  [key: string]: string | number | boolean | null;
}

export interface SqlResult {
  columns: string[];
  rows: SqlResultRow[];
}
