"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Loader2, Plus, Sparkles } from "lucide-react"
import type { DatabaseSummary } from "@/lib/types"
import { registerSampleDatabase } from "@/lib/api"
import { SAMPLE_DATABASES, type SampleDatabase } from "@/lib/samples"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AddState = { status: "adding" } | { status: "error"; message: string }

/**
 * "Try a sample" — one card per built-in sample database. Adding a sample
 * needs no credentials: the backend supplies the connection and returns the
 * same summary shape as a custom registration.
 */
export function SampleSection({
  databases,
  onAdded,
}: {
  databases: DatabaseSummary[] | null
  onAdded: (created: DatabaseSummary) => void
}) {
  const [adds, setAdds] = useState<Record<string, AddState>>({})

  const addedNames = new Set((databases ?? []).map((db) => db.database_name))

  const add = async (sample: SampleDatabase) => {
    setAdds((prev) => ({ ...prev, [sample.id]: { status: "adding" } }))
    try {
      const created = await registerSampleDatabase(sample.id)
      setAdds((prev) => {
        const next = { ...prev }
        delete next[sample.id]
        return next
      })
      onAdded(created)
    } catch (e) {
      setAdds((prev) => ({
        ...prev,
        [sample.id]: {
          status: "error",
          message: e instanceof Error && e.message ? e.message : "Could not add this sample. Try again.",
        },
      }))
    }
  }

  return (
    <section aria-labelledby="samples-heading" className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="samples-heading"
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
          >
            <Sparkles className="size-3.5 text-accent-bright" aria-hidden="true" />
            Try a sample
          </h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Ready-made databases with realistic data. Add one, then open it in chat and pick a question to start.
          </p>
        </div>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SAMPLE_DATABASES.map((sample) => {
          const added = addedNames.has(sample.id)
          const state = adds[sample.id]
          const adding = state?.status === "adding"
          return (
            <li
              key={sample.id}
              className={cn(
                "flex flex-col rounded-xl border bg-card p-4 transition-colors",
                added ? "border-accent-bright/30" : "border-border hover:border-ring/50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded border border-border bg-elevated/60 px-1.5 py-px font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  {sample.engine}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{sample.tableCount} tables</span>
              </div>
              <p className="mt-3 truncate font-mono text-[14px] font-medium text-foreground">{sample.name}</p>
              <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">{sample.domain}</p>

              {state?.status === "error" && (
                <p className="mt-3 text-[12px] leading-relaxed text-destructive" role="alert">
                  {state.message}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                <Link
                  href={`/dashboard/samples/${sample.id}`}
                  className="inline-flex min-h-8 items-center gap-1 rounded-md px-1.5 font-mono text-[11.5px] text-accent-bright transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Learn more about ${sample.name}`}
                >
                  Learn more
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
                {added ? (
                  <span className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-accent-bright">
                    <Check className="size-3.5" aria-hidden="true" />
                    Added
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 rounded-lg text-xs"
                    disabled={adding}
                    onClick={() => add(sample)}
                    aria-label={`Add ${sample.name} sample database`}
                  >
                    {adding ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                        Adding…
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5" aria-hidden="true" />
                        Add sample
                      </>
                    )}
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
