"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Menu } from "lucide-react"
import type { ChatMessage } from "./chat-types"
import type { ChatStreamEvent, Conversation, DatabaseSummary, SqlResultRow, Turn } from "@/lib/types"
import {
  ApiError,
  createConversation,
  getDatabaseConversations,
  getTurns,
  streamChat,
} from "@/lib/api"
import { Logo } from "@/components/landing/logo"
import { VendorIcon } from "@/components/shared/sql-code"
import { ChatTranscript } from "./chat-transcript"
import { ConversationSidebar } from "./conversation-sidebar"
import { MessageComposer } from "./message-composer"
import { SampleQuestionChips } from "./sample-question-chips"
import { isSampleDatabase } from "@/lib/samples"

let messageSeq = 0
const nextId = (): string => `m${++messageSeq}-${Date.now()}`

/** A live stream for one conversation: its assistant turn plus a flag the stream loop polls; Stop only ever touches the selected conversation's entry. */
interface RunControl {
  turnId: string
  cancelled: boolean
}

/**
 * The chat workspace: conversation navigation on the left, transcript +
 * composer on the right. All backend interaction goes through lib/api.
 *
 * Streaming is conversation-owned: every transcript is keyed by conversation
 * id and stream loops keep consuming after the user switches away, so a run
 * started in conversation A finishes into A even while B is on screen — only
 * the selected conversation's state renders, and Stop aborts just the
 * selected conversation's run.
 */
export function ChatWorkspace({ databaseId }: { databaseId: string }) {
  const [dbMeta, setDbMeta] = useState<DatabaseSummary | null>(null)
  const [dbLoading, setDbLoading] = useState(true)
  const [sampleQuestions, setSampleQuestions] = useState<string[]>([])
  const [conversations, setConversations] = useState<
    { id: string; title: string; createdAt?: string }[]
  >([])

  const toSidebarItem = (c: Conversation /* lib types */): { id: string; title: string; createdAt?: string } => ({
    id: c.thread_id,
    title: c.title,
    createdAt: c.created_at,
  })

  const [activeId, setActiveId] = useState<string | null>(null)
  // Transcripts keyed by conversation id, retained while other conversations
  // are selected so in-flight streams complete into their own entry.
  const [transcriptsBy, setTranscriptsBy] = useState<Map<string, ChatMessage[]>>(new Map())
  // Conversations whose persisted history is currently being fetched.
  const [historyLoadingIds, setHistoryLoadingIds] = useState<string[]>([])
  const [composer, setComposer] = useState("")
  const [sidebarQuery, setSidebarQuery] = useState("")
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const activeIdRef = useRef<string | null>(null)
  // ids the backend itself issued (restored conversation list); locally
  // created conversations are absent here, so their requests send null
  const backendConversationIdsRef = useRef<Set<string>>(new Set())
  // conversations whose store history was already merged this session
  const historyMergedIdsRef = useRef<Set<string>>(new Set())
  const lastSubmittedRef = useRef<string | null>(null)
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null)
  // One live run per conversation (the fresh-chat view is keyed "").
  const runsRef = useRef<Map<string, RunControl>>(new Map())
  // Stream iterators by conversation id so Stop can close exactly that one;
  // closing the generator aborts its fetch inside lib.api streamChat.
  const streamIteratorsRef = useRef<Map<string, AsyncGenerator<ChatStreamEvent, void, void>>>(
    new Map()
  )

  const activeMessages = useMemo(
    () => (activeId ? transcriptsBy.get(activeId) ?? [] : []),
    [activeId, transcriptsBy]
  )
  const loadingHistory = activeId ? historyLoadingIds.includes(activeId) : false

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  // Keep the transcript scrolled to the bottom for the selected conversation
  // and as streamed content grows.
  useEffect(() => {
    const el = transcriptScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [activeMessages, loadingHistory, activeId])

  // initial load: database + its conversations, in one request
  useEffect(() => {
    const t = setTimeout(() => {
      ;(async () => {
        try {
          const loaded = await getDatabaseConversations(databaseId)
          setDbMeta(loaded.database)
          setSampleQuestions(loaded.questions)
          backendConversationIdsRef.current = new Set(
            loaded.conversations.map((c) => c.thread_id)
          )
          setConversations(loaded.conversations.map(toSidebarItem))
        } catch {
          // 404 or fetch failure: no database or nothing to restore
          setDbMeta(null)
          setSampleQuestions([])
          setConversations([])
        } finally {
          setDbLoading(false)
        }
      })()
    }, 0)
    return () => clearTimeout(t)
  }, [databaseId])

  /* ── transcript mutation ───────────────────────────────────────── */

  /** Rewrites one conversation's transcript, leaving every other conversation's messages untouched. */
  const updateTranscript = useCallback(
    (convId: string, updater: (messages: ChatMessage[]) => ChatMessage[]) => {
      setTranscriptsBy((prev) => {
        const current = prev.get(convId) ?? []
        const next = updater(current)
        if (next === current) return prev
        return new Map(prev).set(convId, next)
      })
    },
    []
  )

  const finalizeStreamingMessage = useCallback(
    (convId: string, turnId: string, opts?: { error?: string }) => {
      updateTranscript(convId, (prev) =>
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
    [updateTranscript]
  )

  /* ── selection / new chat ──────────────────────────────────────── */

  /**
   * Adopts the backend-issued conversation id mid-stream: marks it
   * backend-known and re-keys the conversation's transcript and live run
   * (previously held under the temporary local id), swaps the sidebar's
   * stand-in id, and re-points the selection only when that conversation is
   * still on screen. Returns the id the stream belongs to from here on.
   */
  const adoptServerConversationId = useCallback(
    (localId: string, serverId: string): string => {
      backendConversationIdsRef.current = new Set(backendConversationIdsRef.current).add(serverId)
      if (serverId === localId) return localId

      const run = runsRef.current.get(localId)
      if (run) {
        runsRef.current.delete(localId)
        runsRef.current.set(serverId, run)
      }
      const iterator = streamIteratorsRef.current.get(localId)
      if (iterator) {
        streamIteratorsRef.current.delete(localId)
        streamIteratorsRef.current.set(serverId, iterator)
      }

      setTranscriptsBy((prev) => {
        if (!prev.has(localId)) return prev
        const next = new Map(prev)
        const messages = next.get(localId)
        next.delete(localId)
        if (messages) next.set(serverId, messages)
        return next
      })
      setConversations((prev) =>
        prev.map((c) => (c.id === localId ? { ...c, id: serverId } : c))
      )
      setHistoryLoadingIds((prev) =>
        prev.map((pending) => (pending === localId ? serverId : pending))
      )

      if (activeIdRef.current === localId) {
        activeIdRef.current = serverId
        setActiveId(serverId)
      }
      return serverId
    },
    []
  )

  const selectConversation = useCallback(
    async (id: string) => {
      if (id === activeIdRef.current) return
      setDrawerOpen(false)
      setActiveId(id)

      // History is fetched once per conversation per session; afterwards the
      // in-memory transcript (which may hold a live run) is authoritative.
      if (historyMergedIdsRef.current.has(id)) return
      setHistoryLoadingIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      try {
        const turns = await getTurns(databaseId, id)
        historyMergedIdsRef.current.add(id)
        setTranscriptsBy((prev) => {
          const buffered = prev.get(id) ?? []
          if (buffered.length === 0) {
            if (turns.length === 0) return prev
            return new Map(prev).set(id, turns.flatMap(turnToMessages))
          }
          // In-session messages stay authoritative (they carry the SQL result
          // rows the backend does not persist): fetched turns are dropped
          // when the same question is already in memory, so nothing copies.
          const bufferedQueries = new Set(
            buffered.filter((m) => m.role === "user").map((m) => m.content)
          )
          const historical = turns
            .filter((t) => !bufferedQueries.has(t.user_query))
            .flatMap(turnToMessages)
          if (historical.length === 0) return prev
          return new Map(prev).set(id, [...historical, ...buffered])
        })
      } catch {
        // fetch failed: keep whatever the in-memory transcript already holds
      } finally {
        setHistoryLoadingIds((prev) => prev.filter((pending) => pending !== id))
      }
    },
    [databaseId]
  )

  const newChat = useCallback(() => {
    setDrawerOpen(false)
    setActiveId(null)
    setComposer("")
    // Runs elsewhere keep streaming: switching back later restores them.
  }, [])

  /* ── streaming application ─────────────────────────────────────── */

  const applyEvent = useCallback(
    (convId: string, turnId: string, event: ChatStreamEvent) => {
      updateTranscript(convId, (prev) =>
        prev.map((m) => (m.id === turnId ? handleStreamingEvent(m, event) : m))
      )
    },
    [updateTranscript]
  )

  const send = useCallback(
    async (rawText?: string) => {
      const text = (rawText ?? composer).trim()
      const db = dbMeta
      if (!text || !db || dbLoading) return
      // Capture the composer content before clearing so a failed turn can
      // restore it below.
      lastSubmittedRef.current = text
      setComposer("")

      const submittedFrom = activeIdRef.current
      // One run per conversation: repeated submits into a conversation that
      // already has a live run are ignored (fresh-chat view counts as "").
      const initialKey = submittedFrom ?? ""
      if (runsRef.current.has(initialKey)) return

      // The backend request only carries an id for a conversation the
      // backend itself created (restored via its list). Fresh chats and
      // locally-created conversations send conversation_id: null — the
      // backend creates its own record and announces it mid-stream.
      const requestConversationId =
        submittedFrom && backendConversationIdsRef.current.has(submittedFrom)
          ? submittedFrom
          : null

      const userTurnId = nextId()
      const assistantTurnId = nextId()
      const run: RunControl = { turnId: assistantTurnId, cancelled: false }

      // While the local conversation is being created the run is parked under
      // the submitted-from key so nothing else can submit from this view.
      let convId = submittedFrom
      let runKey = initialKey
      runsRef.current.set(runKey, run)

      try {
        if (!convId) {
          const conversation = await createConversation({ database_id: db.id, query: text })
          convId = conversation.thread_id
          runKey = convId
          runsRef.current.delete("")
          runsRef.current.set(convId, run)
          // The conversation joins the sidebar; the selection follows only if
          // the user is still looking at the fresh-chat view.
          setConversations((prev) => [toSidebarItem(conversation), ...prev])
          if (activeIdRef.current === null) {
            activeIdRef.current = convId
            setActiveId(convId)
          }
        }

        const now = new Date().toISOString()
        updateTranscript(convId, (prev) => [
          ...prev,
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

        const iterator = streamChat(
          {
            query: text,
            conversation_id: requestConversationId,
            db_id: db.id,
          },
          // local id: keys the turn store so in-session history restores
          convId,
        )
        streamIteratorsRef.current.set(runKey, iterator)

        while (true) {
          const next = await iterator.next()
          if (next.done) break
          const event = next.value
          if (run.cancelled) break
          if (event.type === "conversation") {
            // The backend announces the conversation it actually ran on
            // (fresh chats create one mid-stream): re-key this run's state
            // from the temporary local id to the real one.
            convId = adoptServerConversationId(convId, event.id)
            runKey = convId
            continue
          }
          applyEvent(convId, run.turnId, event)
          if (event.type === "done") {
            finalizeStreamingMessage(convId, run.turnId)
            break
          }
        }
      } catch (error) {
        // Connection dropped mid-turn (Stop's early close also lands here):
        // keep everything already streamed in that conversation.
        if (!run.cancelled && convId) {
          finalizeStreamingMessage(convId, run.turnId, {
            error:
              error instanceof ApiError && error.message
                ? error.message
                : "The response stopped before finishing. Your messages are safe — try again.",
          })
          if (activeIdRef.current === convId && composer.length === 0) {
            setComposer(lastSubmittedRef.current ?? "")
          }
        }
      } finally {
        runsRef.current.delete(runKey)
        void streamIteratorsRef.current.get(runKey)?.return() // aborts the fetch if needed
        streamIteratorsRef.current.delete(runKey)
      }
    },
    [
      adoptServerConversationId,
      applyEvent,
      composer,
      dbLoading,
      dbMeta,
      finalizeStreamingMessage,
      updateTranscript,
    ]
  )

  const stop = useCallback(() => {
    const convId = activeIdRef.current
    if (!convId) return
    const run = runsRef.current.get(convId)
    if (!run) return
    run.cancelled = true
    finalizeStreamingMessage(convId, run.turnId)
    // Closing the generator makes lib.api streamChat abort its fetch; the
    // loop notices and cleans up the run registry. Other conversations'
    // runs are untouched.
    void streamIteratorsRef.current.get(convId)?.return()
  }, [finalizeStreamingMessage])

  /** Loads a suggested question into the composer without sending. Each pick replaces the draft, so the composer always holds exactly the clicked question. */
  const fillComposer = useCallback((question: string) => {
    setComposer(question)
  }, [])

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

  // Only the selected conversation's run controls the composer/stop state.
  const streamingNow = useMemo(
    () => activeMessages.some((m) => m.streaming),
    [activeMessages]
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
            {dbMeta && isSampleDatabase(dbMeta.database_name) && (
              <span className="hidden rounded border border-border bg-elevated px-1.5 py-px font-mono text-[9.5px] uppercase tracking-wide text-muted-foreground sm:inline">
                Sample
              </span>
            )}
          </div>
        </header>

        <div ref={transcriptScrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <ChatTranscript
            messages={activeMessages}
            dbMeta={dbMeta}
            // The history skeleton only replaces an empty transcript; a
            // conversation with in-session messages (e.g. a live run) keeps
            // rendering them while its store history is being fetched.
            loadingHistory={loadingHistory && activeMessages.length === 0}
            sampleQuestions={sampleQuestions}
            onSuggest={fillComposer}
          />
        </div>

        <div className="shrink-0 border-t border-border bg-background/95">
          {sampleQuestions.length > 0 && (
            <div className="mx-auto w-full max-w-3xl px-4 pt-2.5 md:px-6">
              <SampleQuestionChips
                questions={sampleQuestions}
                disabled={streamingNow || !dbMeta}
                onPick={fillComposer}
              />
            </div>
          )}
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

  // Conversation adoption is handled in send(); render nothing.
  if (event.type === "conversation") {
    return m
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
