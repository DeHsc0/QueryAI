"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Menu } from "lucide-react"
import type { ChatMessage } from "./chat-types"
import type { ChatStreamEvent, Conversation, DatabaseSummary, SqlResultRow, Turn } from "@/lib/types"
import {
  createConversation,
  getTurns,
  listConversations,
  listDatabases,
  streamChat,
} from "@/lib/api"
import { Logo } from "@/components/landing/logo"
import { VendorIcon } from "@/components/shared/sql-code"
import { ChatTranscript } from "./chat-transcript"
import { ConversationSidebar } from "./conversation-sidebar"
import { MessageComposer } from "./message-composer"

let messageSeq = 0
const nextId = (): string => `m${++messageSeq}-${Date.now()}`

/**
 * The chat workspace: conversation navigation on the left, transcript +
 * composer on the right. All backend interaction goes through lib/api;
 * stream events are applied against a run token so late events from an
 * abandoned conversation can never contaminate the active transcript.
 */
export function ChatWorkspace({ databaseId }: { databaseId: string }) {
  const [dbMeta, setDbMeta] = useState<DatabaseSummary | null>(null)
  const [dbLoading, setDbLoading] = useState(true)
  const [conversations, setConversations] = useState<
    { id: string; title: string; createdAt?: string }[]
  >([])

  const toSidebarItem = (c: Conversation /* lib types */): { id: string; title: string; createdAt?: string } => ({
    id: c.thread_id,
    title: c.title,
    createdAt: c.created_at,
  })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [composer, setComposer] = useState("")
  const [sidebarQuery, setSidebarQuery] = useState("")
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  // run tokens: bumping invalidates any in-flight stream loop
  const runIdRef = useRef(0)
  const activeIdRef = useRef<string | null>(null)
  // ids the backend itself issued (restored conversation list); locally
  // created conversations are absent here, so their requests send null
  const backendConversationIdsRef = useRef<Set<string>>(new Set())
  const lastSubmittedRef = useRef<string | null>(null)
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  // Keep the transcript scrolled to the bottom for new/active conversations
  // and as streamed content grows.
  useEffect(() => {
    const el = transcriptScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loadingHistory, activeId])

  // initial load: database metadata + conversation list
  useEffect(() => {
    const t = setTimeout(() => {
      ;(async () => {
        try {
          const dbs = await listDatabases()
          setDbMeta(dbs.find((d) => d.id === databaseId) ?? null)
        } catch {
          setDbMeta(null)
        } finally {
          setDbLoading(false)
        }
        try {
          const loaded = await listConversations(databaseId)
          backendConversationIdsRef.current = new Set(loaded.map((c) => c.thread_id))
          setConversations(loaded.map(toSidebarItem))
        } catch {
          setConversations([])
        }
      })()
    }, 0)
    return () => clearTimeout(t)
  }, [databaseId])

  const bumpRun = useCallback(() => {
    runIdRef.current += 1
    return runIdRef.current
  }, [])

  const finalizeStreamingMessage = useCallback(
    (turnId: string, opts?: { error?: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === turnId
            ? {
                ...m,
                streaming: false,
                activity: m.activity.map((a) => ({ ...a, status: "done" as const })),
                errorPayload: opts?.error ?? m.errorPayload,
              }
            : m
        )
      )
    },
    []
  )

  /* ── selection / new chat ──────────────────────────────────────── */

  const selectConversation = useCallback(
    async (id: string) => {
      if (id === activeIdRef.current) return
      bumpRun() // abort any in-flight stream for the previous conversation
      setDrawerOpen(false)
      setActiveId(id)
      setMessages([])
      setLoadingHistory(true)
      try {
        const turns = await getTurns(databaseId, id)
        if (activeIdRef.current !== id) return // user moved on while loading
        setMessages(turns.flatMap(turnToMessages))
      } catch {
        setMessages([])
      } finally {
        setLoadingHistory(false)
      }
    },
    [bumpRun, databaseId]
  )

  const newChat = useCallback(() => {
    bumpRun()
    setDrawerOpen(false)
    setActiveId(null)
    setMessages([])
    setComposer("")
    // Never reuses the previous conversation id: null stays null until the
    // first message is sent, at which point a fresh conversation is created.
  }, [bumpRun])

  /* ── streaming application ─────────────────────────────────────── */

  const applyEvent = useCallback((turnId: string, event: ChatStreamEvent) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === turnId ? handleStreamingEvent(m, event) : m))
    )
  }, [])

  const send = useCallback(
    async (rawText?: string) => {
      const text = (rawText ?? composer).trim()
      const db = dbMeta
      if (!text || !db || dbLoading) return
      const streamingNow = messages.some((m) => m.streaming)
      if (streamingNow) return // prevent duplicate submissions

      const myRun = bumpRun()
      lastSubmittedRef.current = text

      // The backend request only carries an id for a conversation the
      // backend itself created (restored via its list). Fresh chats and
      // locally-created conversations send conversation_id: null — the
      // backend creates its own record until response handling returns ids.
      const activeConvId = activeIdRef.current
      const requestConversationId =
        activeConvId && backendConversationIdsRef.current.has(activeConvId)
          ? activeConvId
          : null

      // no persistent conversation exists yet: create a local one for the
      // sidebar. The backend request above intentionally doesn't use this id.
      let convId = activeIdRef.current
      if (!convId) {
        const conversation = await createConversation({ database_id: db.id, query: text })
        if (runIdRef.current !== myRun) return // user switched away during create
        convId = conversation.thread_id
        activeIdRef.current = convId
        setActiveId(convId)
        setConversations((prev) => [toSidebarItem(conversation), ...prev])
        setSidebarQuery("")
      }

      const userTurnId = nextId()
      const assistantTurnId = nextId()
      const now = new Date().toISOString()
      setMessages([
        ...messages,
        {
          id: userTurnId,
          role: "user",
          content: text,
          createdAt: now,
          streaming: false,
          activity: [],
          queries: [],
        },
        {
          id: assistantTurnId,
          role: "assistant",
          content: "",
          createdAt: now,
          streaming: true,
          activity: [{ key: "plan", label: "Understanding the question", status: "active" }],
          queries: [],
        },
      ])
      setComposer("")

      try {
        for await (const event of streamChat(
          {
            query: text,
            conversation_id: requestConversationId,
            db_id: db.id,
          },
          // local id: keys the mock turn store so in-session history restores
          convId,
        )) {
          if (runIdRef.current !== myRun || activeIdRef.current !== convId) {
            return // abandoned: new chat or conversation switch mid-stream
          }
          applyEvent(assistantTurnId, event)
          if (event.type === "done") return
        }
      } catch {
        // connection dropped mid-turn: keep everything already streamed
        if (runIdRef.current === myRun && activeIdRef.current === convId) {
          finalizeStreamingMessage(assistantTurnId, {
            error: "The response stopped before finishing. Your messages are safe — try again.",
          })
          if (!composer) setComposer(lastSubmittedRef.current ?? "")
        }
      }
    },
    [bumpRun, composer, dbLoading, dbMeta, finalizeStreamingMessage, messages, applyEvent]
  )

  const stop = useCallback(() => {
    bumpRun()
    const streaming = messages.find((m) => m.streaming)
    if (streaming) finalizeStreamingMessage(streaming.id)
  }, [bumpRun, finalizeStreamingMessage, messages])

  const filteredConversations = useMemo(() => {
    const q = sidebarQuery.trim().toLowerCase()
    return q ? conversations.filter((c) => c.title.toLowerCase().includes(q)) : conversations
  }, [conversations, sidebarQuery])

  const conversationById = useMemo(
    () => new Map(conversations.map((c) => [c.id, c.title])),
    [conversations]
  )
  const activeTitle = useMemo(
    () => conversationById.get(activeId ?? "") ?? (activeId ? "Conversation" : "New chat"),
    [conversationById, activeId]
  )

  const streamingNow = useMemo(
    () => messages.some((m) => m.streaming),
    [messages]
  )

  /* ── no database registered for this workspace ─────────────────── */

  if (!dbLoading && !dbMeta) {
    return (
      <div className="grid h-dvh place-items-center bg-background px-6">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <VendorIconPlaceholder />
          <h1 className="mt-5 text-xl font-medium text-foreground">No database is connected</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            This conversation points at a database registered in your workspace. Register one
            to start asking questions.
          </p>
          <a
            href="/dashboard"
            className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Go to databases
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      {/* desktop sidebar */}
      <div className="hidden lg:block">
        <aside aria-label="Conversation navigation" className="h-full">
          <ConversationSidebar
            conversations={filteredConversations}
            activeId={activeId}
            dbMeta={dbMeta}
            query={sidebarQuery}
            onQueryChange={setSidebarQuery}
            onSelect={selectConversation}
            onNewChat={newChat}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            className={collapsed ? "" : "lg:w-72"}
          />
        </aside>
      </div>

      {/* mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close conversation navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 cursor-default bg-black/60 focus-visible:outline-none"
          />
          <aside
            aria-label="Conversation navigation"
            className="absolute inset-y-0 left-0 shadow-2xl"
          >
            <ConversationSidebar
              conversations={filteredConversations}
              activeId={activeId}
              dbMeta={dbMeta}
              query={sidebarQuery}
              onQueryChange={setSidebarQuery}
              onSelect={selectConversation}
              onNewChat={newChat}
              collapsed={false}
              onCollapsedChange={() => {}}
              className="w-80 border-r"
            />
          </aside>
        </div>
      )}

      {/* main column */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              aria-label="Open conversation navigation"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <div className="lg:hidden" aria-hidden="true">
              <Logo />
            </div>
            <h1 className="min-w-0 truncate text-sm font-medium text-foreground max-lg:flex-1">
              {activeTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-border px-2.5 py-1 font-mono text-[10.5px] text-muted-foreground sm:inline">
              read-only analysis
            </span>
            {dbMeta && (
              <span className="flex items-center gap-1.5 rounded-lg border border-border bg-elevated/60 px-2 py-1">
                <VendorIcon vendor={dbMeta.database_soft} className="size-4" />
                <span className="max-w-40 truncate font-mono text-[11px] text-muted-foreground">
                  {dbMeta.database_name}
                </span>
              </span>
            )}
          </div>
        </header>

        <div ref={transcriptScrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <ChatTranscript
            messages={messages}
            dbMeta={dbMeta}
            loadingHistory={loadingHistory}
            onSuggest={(text) => send(text)}
          />
        </div>

        <div className="shrink-0 border-t border-border bg-background/95">
          <MessageComposer
            value={composer}
            onChange={setComposer}
            onSubmit={() => send()}
            onStop={stop}
            disabled={!dbMeta || dbLoading}
            streaming={streamingNow}
            placeholder={
              dbMeta
                ? `Ask about ${dbMeta.database_name}…`
                : "Register a database in the workspace to ask questions"
            }
          />
        </div>
      </main>
    </div>
  )
}

/* ── streaming event adapter ──────────────────────────────────────── */

/** Completes all currently-active agent steps. */
function doneTools(m: ChatMessage): ChatMessage {
  return {
    ...m,
    activity: m.activity.map((a) => (a.status === "active" ? { ...a, status: "done" as const } : a)),
  }
}

function handleStreamingEvent(m: ChatMessage, event: ChatStreamEvent): ChatMessage {
  if (event.type === "done") {
    return { ...doneTools(m), streaming: false }
  }

  if (event.type === "tool_call") {
    const label =
      event.tool_name === "retrieve_context"
        ? "Finding relevant tables in your schema"
        : event.tool_name === "run_sql"
          ? "Running a read-only query"
          : event.tool_name === "add_memory"
            ? "Remembering your preferences"
            : event.tool_name === "search_db_facts"
              ? "Checking database facts"
              : `Calling ${event.tool_name}`

    let queries = m.queries
    if (event.tool_name === "run_sql") {
      const sql = typeof event.args.query === "string" ? event.args.query : ""
      queries = [...m.queries, { id: event.call_id, sql, status: "running" as const }]
    }

    return {
      ...doneTools(m),
      activity: [...m.activity, { key: event.call_id, label, status: "active" as const }],
      queries,
    }
  }

  if (event.type === "tool_result") {
    const sqlQuery = m.queries.find((q) => q.id === event.call_id)

    // structured results for an executed read-only query
    if (sqlQuery && sqlQuery.status === "running") {
      let parsed: unknown = null
      try {
        parsed = JSON.parse(event.output)
      } catch {
        parsed = null
      }
      const rows = Array.isArray(parsed) ? (parsed as SqlResultRow[]) : []
      const columns = rows.length > 0 ? Object.keys(rows[0] ?? {}) : []
      return {
        ...m,
        activity: m.activity.map((a) =>
          a.key === event.call_id ? { ...a, status: "done" as const } : a
        ),
        queries: m.queries.map((q) =>
          q.id === event.call_id
            ? { ...q, status: "done" as const, columns, rows, rowCount: rows.length }
            : q
        ),
      }
    }

    // non-SQL tool result: just close its activity step
    return {
      ...m,
      activity: m.activity.map((a) =>
        a.key === event.call_id ? { ...a, status: "done" as const } : a
      ),
    }
  }

  // agent_output: append tokens; add the "writing" step once, complete others
  const hasWriteStep = m.activity.some((a) => a.label === "Writing the analysis")
  return {
    ...doneTools(m),
    activity: hasWriteStep
      ? m.activity
      : [...m.activity, { key: "write", label: "Writing the analysis", status: "active" as const }],
    content: m.content + event.content,
  }
}

/* ── history restore ──────────────────────────────────────────────── */

function turnToMessages(turn: Turn): ChatMessage[] {
  const user: ChatMessage = {
    id: `${turn.id}-user`,
    role: "user",
    content: turn.user_query,
    createdAt: turn.created_at,
    streaming: false,
    activity: [],
    queries: [],
  }
  const assistant: ChatMessage = {
    id: `${turn.id}-assistant`,
    role: "assistant",
    content: turn.ai_response,
    createdAt: turn.created_at,
    streaming: false,
    activity: [],
    queries: (turn.sql_query ?? []).map((sql, i) => ({
      id: `${turn.id}-q${i}`,
      sql,
      status: "done" as const,
      columns: turn.results?.[i]?.columns,
      rows: turn.results?.[i]?.rows,
      rowCount: turn.results?.[i]?.rows.length,
    })),
  }
  return [user, assistant]
}

/* ── misc ─────────────────────────────────────────────────────────── */


function VendorIconPlaceholder() {
  return (
    <span className="mx-auto grid size-11 place-items-center rounded-xl border border-border bg-elevated">
      <svg width="18" height="20" viewBox="0 0 24 26" fill="none" aria-hidden="true">
        <path
          d="M4 7 C4 9 8 10 12 10 C16 10 20 9 20 7 V18 C20 20 16 21.4 12 21.4 C8 21.4 4 20 4 18 Z"
          stroke="currentColor"
          strokeWidth="1.4"
          className="text-muted-foreground"
          fill="none"
        />
        <ellipse cx="12" cy="7" rx="8" ry="3" className="text-muted-foreground/70" stroke="currentColor" strokeWidth="1.4" fill="none" />
      </svg>
    </span>
  )
}
