import type { SqlResultRow } from "@/lib/types"

/** Live agent activity labels — honest stage names tied to observed events. */
export interface AgentActivity {
  key: string
  label: string
  status: "active" | "done"
}

/** One executed (or proposed) SQL statement + its structured results. */
export interface TurnQuery {
  id: string
  sql: string
  status: "running" | "done" | "error"
  columns?: string[]
  rows?: SqlResultRow[]
  rowCount?: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
  streaming: boolean
  activity: AgentActivity[]
  queries: TurnQuery[]
  errorPayload?: string
}

export type ConversationGroup = "Today" | "Yesterday" | "Previous 7 days" | "Older"

export function conversationGroup(createdAt?: string): ConversationGroup {
  if (!createdAt) return "Older"
  const then = new Date(createdAt).getTime()
  const diffH = (Date.now() - then) / 3_600_000
  if (diffH < 24) return "Today"
  if (diffH < 48) return "Yesterday"
  if (diffH < 24 * 7) return "Previous 7 days"
  return "Older"
}
