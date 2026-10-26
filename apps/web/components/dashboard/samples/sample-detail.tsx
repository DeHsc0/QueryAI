"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ExternalLink, Loader2, MessageSquareText, Plus } from "lucide-react"
import type { SampleCatalogEntry } from "@/lib/sample-catalog"
import { registerSampleDatabase } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { SampleOverview } from "./sample-overview"
import { SampleTables } from "./sample-tables"
import { SampleRelationships } from "./sample-relationships"

type Status = "idle" | "adding" | "added" | "error"

/**
 * Decision surface for one sample database. The add action lives in a header
 * that stays visible while the user reads, so the decision never requires
 * scrolling back. Reading material is ordered by what helps a decision:
 * what it is, what you can ask, then the structure behind the answers.
 */
export function SampleDetail({ entry }: { entry: SampleCatalogEntry }) {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [databaseId, setDatabaseId] = useState<string | null>(null)

  const add = async () => {
    if (status === "adding" || status === "added") return
    setStatus("adding")
    setError(null)
    try {
      const created = await registerSampleDatabase(entry.id)
      setDatabaseId(created.id)
      setStatus("added")
    } catch (e) {
      setStatus("error")
      setError(e instanceof Error && e.message ? e.message : "Could not add this sample. Try again.")
    }
  }

  const tableCount = entry.tables.length
  const jsonbCount = entry.stats.jsonb_column_count

  return (
    <div className="mt-6 grid gap-8 pb-24 lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-0">
      <div className="min-w-0 space-y-12">
        <header>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Sample database · <span className="text-foreground/80">{entry.engine}</span>
          </p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-foreground md:text-3xl">{entry.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{entry.domain}</p>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/90">{entry.description}</p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-4">
            <Stat label="Tables" value={tableCount} />
            <Stat label="JSONB columns" value={jsonbCount} />
            <Stat label="Relationships" value={entry.relationships.length} />
            <Stat label="Engine" value={entry.engine} />
          </dl>
        </header>

        <SampleOverview entry={entry} />
        <SampleTables tables={entry.tables} />
        <SampleRelationships relationships={entry.relationships} tableCount={tableCount} />
        <SourceFooter entry={entry} />
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Add this sample">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Add to workspace</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            Connects the read-only sample. No credentials needed. The schema is indexed so the agent can use it right away.
          </p>

          <div className="mt-5">
            {status === "added" ? (
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground" role="status">
                  <Check className="size-4 text-primary" aria-hidden="true" />
                  Added to your databases
                </p>
                <Button asChild className="h-10 w-full rounded-lg">
                  <Link href={`/database/${databaseId}`}>
                    <MessageSquareText className="size-4" aria-hidden="true" />
                    Open in chat
                  </Link>
                </Button>
              </div>
            ) : (
              <Button
                onClick={add}
                disabled={status === "adding"}
                className="h-10 w-full gap-2 rounded-lg text-sm font-medium"
              >
                {status === "adding" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Adding sample…
                  </>
                ) : (
                  <>
                    <Plus className="size-4" aria-hidden="true" />
                    Add sample database
                  </>
                )}
              </Button>
            )}
            {error && (
              <p className="mt-3 text-[12.5px] leading-relaxed text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Try asking</p>
            <ul className="mt-3 space-y-2.5">
              {entry.what_you_can_ask.slice(0, 3).map((topic) => (
                <li key={topic} className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden">
        {status === "added" ? (
          <Button asChild className="h-11 w-full rounded-lg">
            <Link href={`/database/${databaseId}`}>
              <MessageSquareText className="size-4" aria-hidden="true" />
              Open in chat
            </Link>
          </Button>
        ) : (
          <Button
            onClick={add}
            disabled={status === "adding"}
            className="h-11 w-full gap-2 rounded-lg text-sm font-medium"
          >
            {status === "adding" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Adding sample…
              </>
            ) : (
              <>
                <Plus className="size-4" aria-hidden="true" />
                Add sample database
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-24">
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-lg text-foreground">{value}</dd>
    </div>
  )
}

function SourceFooter({ entry }: { entry: SampleCatalogEntry }) {
  const { source } = entry
  return (
    <footer className="border-t border-border pt-6 text-[12px] leading-relaxed text-muted-foreground">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em]">Source and license</p>
      <p className="mt-2">
        {source.benchmark} · {source.attribution} · {source.license}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        <a
          href={source.dataset_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Dataset <ExternalLink className="size-3" aria-hidden="true" />
        </a>
        <a
          href={source.paper}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Paper <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </div>
    </footer>
  )
}
