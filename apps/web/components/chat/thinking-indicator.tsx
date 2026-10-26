"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import type { AgentActivity } from "./chat-types"
import { cn } from "@/lib/utils"

/** Seconds since the current stream began while it is still running. */
export function useStreamElapsed(streaming: boolean): number {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!streaming) return
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [streaming])
  return streaming ? elapsed : 0
}

/**
 * Agent working state: the step rail with shimmer-text on the active step
 * and a running elapsed timer, plus a skeleton preview that fills the
 * space where the analysis will land while nothing has streamed yet.
 */
export function ActivityRail({
  activity,
  elapsed,
}: {
  activity: AgentActivity[]
  elapsed: number
}) {
  return (
    <ol
      className="mb-3 flex flex-col gap-1.5"
      aria-label="Agent activity"
      aria-live="polite"
    >
      {activity.map((a) => {
        const done = a.status === "done"
        const active = a.status === "active"
        return (
          <li key={a.key} className="step-in flex items-center gap-2.5 text-xs">
            <span
              className={cn(
                "grid size-4 place-items-center rounded-full border",
                done
                  ? "border-transparent bg-accent-bright/80 text-background"
                  : "border-accent-bright text-accent-bright"
              )}
              aria-hidden="true"
            >
              {done && <Check className="size-2.5" strokeWidth={3.5} />}
              {active && <span className="size-1 rounded-full bg-accent-bright demo-ping" />}
            </span>
            <span className={done ? "text-muted-foreground" : "shimmer-text"}>{a.label}</span>
            {active && (
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">
                {elapsed} s
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Skeleton preview of the forming answer; replaced by real tokens on first word. */
export function ThinkingBody() {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      {["42%", "88%", "67%"].map((width, i) => (
        <span
          key={i}
          className="sk-line h-2"
          style={{ width, "--sk-delay": `${i * 180}ms` } as React.CSSProperties}
        />
      ))}
      <span className="sr-only" role="status">
        Preparing the analysis…
      </span>
    </div>
  )
}
