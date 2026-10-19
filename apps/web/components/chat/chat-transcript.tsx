"use client"

import { Check, RefreshCw, Sparkles } from "lucide-react"
import type { ChatMessage } from "./chat-types"
import { MarkdownMessage } from "./markdown-message"
import { SqlResultCard } from "./sql-result-card"
import type { DatabaseSummary } from "@/lib/types"
import { getVendor } from "@/components/dashboard/vendor"
import { cn } from "@/lib/utils"

const suggestions = [
  "Which products generated the most revenue?",
  "Show me the monthly growth trend.",
  "Which customers placed the most orders?",
  "Summarize the key trends in this dataset.",
]

export function ChatTranscript({
  messages,
  dbMeta,
  loadingHistory,
  onSuggest,
}: {
  messages: ChatMessage[]
  dbMeta: DatabaseSummary | null
  loadingHistory: boolean
  onSuggest: (text: string) => void
}) {
  const empty = messages.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 md:px-6">
        {loadingHistory ? (
          <div className="flex flex-col gap-3 pt-6" role="status" aria-live="polite">
            {[
              { h: "h-3 w-64", own: false },
              { h: "h-16 w-full", own: true },
              { h: "h-3 w-48", own: false },
            ].map((s, i) => (
              <span
                key={i}
                className={cn("block animate-pulse rounded bg-muted", s.h, s.own && "ml-auto")}
                aria-hidden="true"
              />
            ))}
            <span className="sr-only">Loading conversation…</span>
          </div>
        ) : empty ? (
          <EmptyState dbMeta={dbMeta} onSuggest={onSuggest} />
        ) : (
          <ol className="flex flex-col gap-6" aria-label="Conversation messages">
            {messages.map((m) => (
              <li key={m.id} className={cn("", m.role === "user" && "flex justify-end")}>
                {m.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl rounded-br-md border border-accent-bright/25 bg-accent-bright/[0.07] px-4 py-2.5 text-[14.5px] leading-relaxed text-foreground">
                    {m.content}
                  </div>
                ) : (
                  <AssistantMessage message={m} />
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="h-2" aria-hidden="true" />
    </div>
  )
}

function EmptyState({
  dbMeta,
  onSuggest,
}: {
  dbMeta: DatabaseSummary | null
  onSuggest: (text: string) => void
}) {
  const meta = dbMeta ? getVendor(dbMeta.database_soft) : null
  return (
    <div className="flex min-h-[55dvh] flex-col items-center justify-center text-center">
      <span className="grid size-11 place-items-center rounded-xl border border-border bg-elevated text-accent-bright">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-3xl font-medium tracking-tight text-foreground">
        What would you like to discover?
      </h2>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        Ask a question about your data, and QueryAI will help you explore the results.
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {dbMeta
          ? `Reading schema context from ${dbMeta.database_name} (${meta?.label}), read-only`
          : "No database is selected for this conversation"}
      </p>

      <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2 text-left sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggest(s)}
            className="group flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-[13px] text-muted-foreground transition-colors hover:border-ring/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex-1">{s}</span>
            <ArrowRightHint />
          </button>
        ))}
      </div>
      <p className="mt-5 text-[11px] text-muted-foreground">
        Illustrative examples; phrasing works best when it matches the tables in your database.
      </p>
    </div>
  )
}

function ArrowRightHint() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className="shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
      aria-hidden="true"
    >
      <path d="M2 5h6M5.5 2.5 8 5 5.5 7.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  const streamingText = message.streaming
  return (
    <article className="min-w-0 max-w-3xl">
      {/* agent activity */}
      {message.activity.length > 0 && (
        <>
          {message.streaming ? (
            <ol
              className="mb-3 flex flex-col gap-1.5"
              aria-label="Agent activity"
              aria-live="polite"
            >
              {message.activity.map((a) => (
                <li key={a.key} className="flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      "grid size-4 place-items-center rounded-full border",
                      a.status === "done"
                        ? "bg-accent-bright/80 text-background"
                        : "border-accent-bright text-accent-bright"
                    )}
                    aria-hidden="true"
                  >
                    {a.status === "done" && <Check className="size-2.5" strokeWidth={3.5} />}
                    {a.status === "active" && <span className="size-1 rounded-full bg-accent-bright demo-ping" />}
                  </span>
                  <span className={a.status === "done" ? "text-muted-foreground" : "text-foreground"}>
                    {a.label}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
        </>
      )}

      {/* executed queries + structured results */}
      {message.queries.length > 0 && (
        <div className="mb-3 flex flex-col gap-2">
          {message.queries.map((q, i) => (
            <SqlResultCard key={q.id} query={q} index={i + 1} defaultOpen={message.streaming} />
          ))}
        </div>
      )}

      {/* analysis text */}
      {message.content && (
        <div
          className={cn(
            "text-[14.5px] leading-relaxed text-foreground",
            streamingText &&
              "[&>*:last-child]:after:ml-0.5 [&>*:last-child]:after:inline-block [&>*:last-child]:after:h-[1em] [&>*:last-child]:after:w-[2px] [&>*:last-child]:after:translate-y-[2px] [&>*:last-child]:after:bg-accent-bright [&>*:last-child]:after:animate-pulse [&>*:last-child]:after:align-middle"
          )}
        >
          <MarkdownMessage content={message.content} />
        </div>
      )}
      {message.errorPayload && (
        <div className="mt-2 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5" role="alert">
          <RefreshCw className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-destructive">{message.errorPayload}</p>
        </div>
      )}
    </article>
  )
}
