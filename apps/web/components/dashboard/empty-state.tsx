"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Empty dashboard state: the first step of the product explained visually
 * with the same query-surface motif as the landing page mark.
 */
export function EmptyDatabases({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-16 text-center">
      <div
        aria-hidden="true"
        className="landing-grid pointer-events-none absolute inset-0 opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_20%,oklch(0.77_0.146_167/0.07),transparent_70%)]"
      />

      {/* restrained product-relevant illustration: a data surface with a query line */}
      <div aria-hidden="true" className="relative mx-auto mb-8 w-56">
        <div className="rounded-xl border border-border bg-elevated/80 p-4 shadow-[0_16px_48px_-18px_oklch(0.1_0.02_195/0.8)]">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-primary">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="9.5" width="3" height="5.5" rx="0.8" fill="oklch(0.15 0.01 195)" opacity="0.55" />
                <rect x="6" y="5.5" width="3" height="9.5" rx="0.8" fill="oklch(0.15 0.01 195)" opacity="0.8" />
                <rect x="11" y="1" width="3" height="14" rx="0.8" fill="oklch(0.15 0.01 195)" />
              </svg>
            </span>
            <span className="h-1.5 w-16 rounded-full bg-foreground/20" />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2">
            <span className="size-1 rounded-full bg-accent-bright demo-ping" />
            <span className="h-1.5 flex-1 rounded-full bg-foreground/10" />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <span className="h-1.5 rounded-full bg-foreground/10" />
            <span className="h-1.5 rounded-full bg-foreground/10" />
            <span className="h-1.5 w-8 rounded-full bg-accent-bright/50" />
          </div>
        </div>
      </div>

      <h2 className="relative text-3xl font-medium tracking-tight text-foreground md:text-4xl">
        Your data journey starts here.
      </h2>
      <p className="relative mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        Connect a database to start asking questions and uncovering insights with QueryAI.
      </p>
      <p className="relative mt-2 text-xs text-muted-foreground">
        PostgreSQL, MySQL, Oracle, and SQL Server supported
      </p>
      <div className="relative mt-8 flex justify-center">
        <Button size="lg" className="h-11 gap-2 rounded-lg px-6 text-[15px] font-medium" onClick={onConnect}>
          <Plus className="size-4" aria-hidden="true" />
          Connect database
        </Button>
      </div>
      <p className="relative mt-6 text-[11px] text-muted-foreground">
        QueryAI connects with a read-only account you create, so it can look but never write.
      </p>
    </div>
  )
}
