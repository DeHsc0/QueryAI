"use client"

import { Braces, Database, NotebookPen, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const steps: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Database,
    title: "Connect",
    body: "Register a database with a dedicated read-only user. The guided setup provides the exact commands for your engine.",
  },
  {
    icon: Braces,
    title: "Index",
    body: "On registration, QueryAI extracts your schema and indexes it for context-aware retrieval.",
  },
  {
    icon: NotebookPen,
    title: "Analyze",
    body: "Ask in plain language. The agent runs validated read-only SQL and explains what it finds, with the queries visible.",
  },
]

/**
 * Supporting context panel, secondary to database management. Dismissible;
 * the dismissal persists for the tab so returning users go straight to the list.
 */
export function ConnectionPanel({ onDismiss }: { onDismiss: () => void }) {
  return (
    <aside
      aria-label="How QueryAI works"
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <header className="flex items-start justify-between gap-2 border-b border-border bg-elevated/50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">From database to insight</p>
          <p className="mt-0.5 text-xs text-muted-foreground">How QueryAI works with your data</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Dismiss the overview panel</span>
        </button>
      </header>

      <ol className="relative">
        <span
          aria-hidden="true"
          className="absolute bottom-5 left-[27px] top-6 w-px border-l border-dashed border-border max-md:hidden"
        />
        {steps.map((step, i) => (
          <li key={step.title} className={"relative flex gap-3 px-4 py-4" + (i > 0 ? " border-t border-border" : "")}>
            <span className="relative z-10 grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-elevated text-accent-bright">
              <step.icon className="size-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-foreground">
                <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="border-t border-border bg-elevated/30 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
        Credentials are encrypted before storage, and every query is validated read-only before it runs.
      </p>
    </aside>
  )
}
