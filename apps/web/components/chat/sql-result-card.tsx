"use client"

import { useState } from "react"
import { ChevronDown, Table2 } from "lucide-react"
import type { TurnQuery } from "./chat-types"
import { CopyButton } from "@/components/dashboard/copy-button"
import { SqlCode } from "@/components/shared/sql-code"
import { cn } from "@/lib/utils"

/**
 * One SQL statement + its structured results. Reused for live streaming
 * turns and for restored conversation history. The SQL block is collapsible;
 * the results table below it always stays visible.
 */
export function SqlResultCard({
  query,
  index,
  defaultOpen,
}: {
  query: TurnQuery
  index: number
  defaultOpen?: boolean
}) {
  const running = query.status === "running"
  const [sqlOpen, setSqlOpen] = useState(defaultOpen ?? true)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      {/* header row: SQL is collapsible, results are not part of the toggle */}
      <div className="relative flex items-center gap-2 py-1.5 pl-3 pr-28">
        <button
          type="button"
          onClick={() => setSqlOpen((v) => !v)}
          className="flex min-h-8 flex-1 items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={sqlOpen}
          aria-controls={`sql-code-${index}`}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent-bright">
            SQL {String(index).padStart(2, "0")}
          </span>
          <span className="rounded border border-border px-1.5 py-px font-mono text-[9.5px] uppercase text-muted-foreground">
            {running ? "running" : query.status === "error" ? "failed" : "read-only"}
          </span>
        </button>
        <div className="absolute right-2 top-1.5 flex items-center gap-1">
          <CopyButton text={query.sql} label="Copy" />
          <button
            type="button"
            onClick={() => setSqlOpen((v) => !v)}
            aria-expanded={sqlOpen}
            aria-controls={`sql-code-${index}`}
            className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronDown
              className={cn("size-3.5 transition-transform", sqlOpen && "rotate-180")}
              aria-hidden="true"
            />
            <span className="sr-only">{sqlOpen ? "Hide SQL" : "Show SQL"}</span>
          </button>
        </div>
      </div>

      {/* collapsible SQL code */}
      {sqlOpen && (
        <div id={`sql-code-${index}`} className="border-t border-border">
          <div className="max-h-72 overflow-auto px-3 py-2.5 font-mono">
            <SqlCode command={query.sql} />
          </div>
        </div>
      )}

      {/* results always visible */}
      {query.status === "done" && (
        <div className={cn("bg-elevated/20", sqlOpen && "border-t border-border")}>
          <ResultTable query={query} />
        </div>
      )}
      {query.status === "running" && (
        <div className="border-t border-border px-3 py-2.5" aria-live="polite">
          <span className="block h-2.5 w-40 animate-pulse rounded bg-muted" aria-hidden="true" />
          <span className="sr-only">Waiting for query results…</span>
        </div>
      )}
      {query.status === "error" && (
        <p className="border-t border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          This query failed; no results were returned.
        </p>
      )}
    </div>
  )
}

function ResultTable({ query }: { query: TurnQuery }) {
  const rows = query.rows ?? []
  const columns = query.columns ?? []

  // Restored history: the real backend persists sql_query only, so reopened
  // conversations show the SQL without structured result rows.
  if (query.rows === undefined) {
    return (
      <p className="border-t border-border bg-elevated/20 px-3 py-3 text-xs text-muted-foreground">
        Result rows are not part of saved history in this demo — re-run the question to fetch structured
        results live.
      </p>
    )
  }

  if (rows.length === 0) {
    return (
      <div>
        <p className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
          <Table2 className="size-3.5" aria-hidden="true" />
          0 rows returned
        </p>
      </div>
    )
  }

  const numericCols = columns.filter(
    (c) => rows.every((r) => typeof r[c] === "number") && rows.length > 0,
  )

  return (
    <div>
      <div className="max-h-72 overflow-auto">
        <table className="w-full text-left text-[11.5px]">
          <caption className="sr-only">
            Query results: {rows.length} rows, {columns.length} columns
          </caption>
          <thead>
            <tr className="sticky top-0 bg-elevated border-b border-border">
              {columns.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground",
                    numericCols.includes(c) && "text-right"
                  )}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-border/60">
                {columns.map((c) => {
                  const value = row[c]
                  return (
                    <td
                      key={c}
                      className={cn(
                        "max-w-72 px-3 py-1.5 align-top text-foreground/90",
                        numericCols.includes(c) && "text-right font-mono tabular-nums"
                      )}
                    >
                      {value === null || value === undefined ? (
                        <span className="text-muted-foreground/60">null</span>
                      ) : typeof value === "number" ? (
                        value.toLocaleString("en-US", { maximumFractionDigits: 2 })
                      ) : (
                        value.toString()
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-border/60 px-3 py-1.5 text-[10.5px] text-muted-foreground">
        {rows.length} row{rows.length === 1 ? "" : "s"} · demonstration data
      </p>
    </div>
  )
}
