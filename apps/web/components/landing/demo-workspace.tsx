"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown, CircleAlert, Database, RotateCcw, SendHorizonal } from "lucide-react"
import { demoDbs, firstScenario, scenarios, type DemoRow, type DemoScenario } from "./data"
import { SqlLine } from "@/components/shared/sql-code"
import { cn } from "@/lib/utils"

/* ── Playback ─────────────────────────────────────────────────────── */

type Stage = 0 | 1 | 2 | 3 | 4 | 5 // idle, plan, schema, sql, results, answer

const ANSWER_START_AT = 2050

const STAGE_TIMINGS: { to: Stage; after: number }[] = [
  { to: 1, after: 0 },
  { to: 2, after: 550 },
  { to: 3, after: 950 },
  { to: 4, after: 1600 },
  { to: 5, after: ANSWER_START_AT },
]

const answerChunks = (answer: string) => {
  const words = answer.split(" ")
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += 3) chunks.push(words.slice(i, i + 3).join(" ") + " ")
  return chunks
}

/* ── Workspace ────────────────────────────────────────────────────── */

export function DemoWorkspace() {
  const [scenario, setScenario] = useState<DemoScenario>(firstScenario)
  const [stage, setStage] = useState<Stage>(0)
  const [streamIndex, setStreamIndex] = useState(0)
  const [dbOpen, setDbOpen] = useState(false)
  const dbMenuRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const reducedMotionRef = useRef(true)
  const chunks = useMemo(() => answerChunks(scenario.answer), [scenario.answer])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    reducedMotionRef.current = mq.matches
    const onChange = () => {
      reducedMotionRef.current = mq.matches
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const stopPlayback = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (streamTimer.current) {
      clearInterval(streamTimer.current)
      streamTimer.current = null
    }
  }, [])

  const play = useCallback(
    (target: DemoScenario) => {
      stopPlayback()
      setScenario(target)
      const chunkList = answerChunks(target.answer)
      if (reducedMotionRef.current) {
        setStreamIndex(chunkList.length)
        setStage(5)
        return
      }
      setStreamIndex(0)
      setStage(0)
      STAGE_TIMINGS.forEach(({ to, after }) => {
        timers.current.push(setTimeout(() => setStage(to), after))
      })
      timers.current.push(
        setTimeout(() => {
          streamTimer.current = setInterval(() => {
            setStreamIndex((i) => {
              if (i + 1 >= chunkList.length) {
                stopPlayback()
                setStage(5)
                return chunkList.length
              }
              return i + 1
            })
          }, 85)
        }, ANSWER_START_AT)
      )
    },
    [stopPlayback]
  )

  useEffect(() => {
    // first playback is deferred to a macrotask so it never runs inside the effect body
    const t = setTimeout(() => play(firstScenario), 0)
    return () => clearTimeout(t)
  }, [play])

  useEffect(() => () => stopPlayback(), [stopPlayback])

  // close db selector on outside click / escape
  useEffect(() => {
    if (!dbOpen) return
    const onDoc = (e: MouseEvent) => {
      if (dbMenuRef.current && !dbMenuRef.current.contains(e.target as Node)) setDbOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDbOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [dbOpen])

  const done = stage >= 5 && streamIndex >= chunks.length
  const activeDb = scenario.db

  const selectDb = (dbId: string) => {
    setDbOpen(false)
    const next = scenarios.find((s) => s.db.id === dbId)
    if (next && next.db.id !== scenario.db.id) play(next)
  }

  const streamText = chunks.slice(0, streamIndex).join("")

  const liveMessages =
    stage === 0
      ? "Starting demonstration"
      : stage === 1
        ? "Planning the analysis"
        : stage === 2
          ? "Retrieving table schema from the index"
          : stage === 3
            ? "Preparing a read-only SQL query"
            : stage === 4
              ? "Query finished, showing results"
              : done
                ? "Analysis complete"
                : "Writing the answer"

  return (
    <div className="relative">
      {/* backdrop glow (background plane) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-8 -top-12 -bottom-8 bg-[radial-gradient(60%_50%_at_50%_10%,oklch(0.77_0.146_167/0.09),transparent_70%)]"
      />

      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_90px_-20px_oklch(0.1_0.02_195/0.9)] ring-1 ring-white/[0.04]"
        role="group"
        aria-label="QueryAI sample workspace"
        id="product"
      >
        {/* ── Workspace top bar ── */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-elevated/60 px-4 py-2.5">
          <div className="relative min-w-0" ref={dbMenuRef}>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-left transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={dbOpen}
              aria-haspopup="listbox"
              onClick={() => setDbOpen((v) => !v)}
            >
              <Database className="size-3.5 shrink-0 text-accent-bright" aria-hidden="true" />
              <span className="truncate font-mono text-xs text-foreground">{activeDb.name}</span>
              <span className="hidden rounded border border-border px-1.5 py-px font-mono text-[10px] uppercase tracking-wide text-muted-foreground sm:inline">
                {activeDb.typeLabel}
              </span>
              <ChevronDown className={cn("size-3 shrink-0 text-muted-foreground transition-transform", dbOpen && "rotate-180")} aria-hidden="true" />
            </button>
            {dbOpen && (
              <ul
                className="absolute left-0 top-[calc(100%+4px)] z-10 w-56 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-xl"
                role="listbox"
                aria-label="Sample databases"
              >
                {demoDbs.map((db) => (
                  <li key={db.id} role="option" aria-selected={db.id === activeDb.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                        db.id === activeDb.id && "text-accent-bright"
                      )}
                      onClick={() => selectDb(db.id)}
                    >
                      <Database className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      <span className="flex-1 truncate font-mono">{db.name}</span>
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">{db.typeLabel}</span>
                      {db.id === activeDb.id && <Check className="size-3.5" aria-hidden="true" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-ring hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => play(scenario)}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Replay the demonstration</span>
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-2.5 py-1.5" role="status">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  done ? "bg-accent-bright" : "bg-accent-bright demo-ping"
                )}
                aria-hidden="true"
              />
              <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
                {done ? "Agent · ready" : "Agent · working"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="grid gap-px bg-border lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr]">
          {/* Left rail: question + activity */}
          <div className="flex min-h-0 flex-col bg-card">
            {/* question input (non-editable demonstration) */}
            <div className="border-b border-border p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  play(scenario)
                }}
              >
                <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 transition-colors focus-within:border-ring">
                  <p className="min-w-0 flex-1 self-center px-1 text-[13px] leading-relaxed text-foreground">
                    {scenario.question}
                  </p>
                  <button
                    type="submit"
                    className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Run this question again"
                  >
                    <SendHorizonal className="size-4" aria-hidden="true" />
                    <span className="sr-only">Run the sample question</span>
                  </button>
                </div>
              </form>

              <p className="mt-3 mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Try another question
              </p>
              <div className="flex flex-col gap-1.5">
                {scenarios.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={s.key === scenario.key}
                    onClick={() => play(s)}
                    className={cn(
                      "group flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      s.key === scenario.key
                        ? "border-accent-bright/40 bg-accent-bright/[0.07] text-foreground"
                        : "border-transparent bg-muted/40 text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1 shrink-0 rounded-full",
                        s.key === scenario.key ? "bg-accent-bright" : "bg-muted-foreground/50"
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1 leading-5">{s.question}</span>
                    <span className="shrink-0 rounded border border-border px-1 font-mono text-[9px] uppercase text-muted-foreground">
                      {s.db.type === "mysql" ? "MY" : "PG"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* agent activity timeline */}
            <div className="flex-1 p-4">
              <p className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Agent activity
                <span className="normal-case tracking-normal opacity-70">max 2 queries</span>
              </p>
              <ol className="relative flex flex-col">
                <StageRow
                  label="Question understood"
                  detail={scenario.plan}
                  state={stageState(1, stage)}
                />
                <StageRow
                  label="retrieve_context · hybrid schema search"
                  detail={`Tables: ${scenario.schemaTables.join(", ")}`}
                  mono={scenario.schemaHint}
                  state={stageState(2, stage)}
                  violet
                />
                <StageRow
                  label="run_sql · validated read-only"
                  detail={stage >= 4 ? "Executed against the sample set" : "Validating query"}
                  state={stageState(3, stage)}
                />
                <StageRow
                  label={done ? "Answer written" : "Composing the answer"}
                  detail={done ? undefined : "Streaming tokens…"}
                  state={done ? "done" : stageState(5, stage)}
                />
              </ol>
            </div>
          </div>

          {/* Right pane: SQL + results + answer */}
          <div className="flex min-w-0 flex-col bg-background/40">
            {/* SQL panel */}
            <div
              className={cn(
                "border-b border-border transition-opacity duration-500",
                stage >= 3 ? "opacity-100" : "opacity-40"
              )}
            >
              <div className="flex items-center justify-between px-4 pb-2 pt-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent-bright">
                  SQL · generated
                </span>
                <span className="hidden rounded-full border border-border px-2 py-px font-mono text-[10px] text-muted-foreground sm:inline">
                  read-only
                </span>
              </div>
              <div className="overflow-x-auto px-4 pb-3 font-mono">
                {scenario.sql.map((line, i) => (
                  <div key={`${scenario.key}-${i}`}>
                    <span className="mr-3 inline-block w-4 select-none text-right text-[11px] text-muted-foreground/50">
                      {i + 1}
                    </span>
                    <SqlLine line={line} />
                  </div>
                ))}
              </div>
            </div>

            {/* results */}
            <div className="p-4">
              <Results scenario={scenario} visible={stage >= 4} />
            </div>

            {/* answer + conclusion */}
            <div className="mt-auto border-t border-border p-4" aria-live="polite">
              {streamText && (
                <p className="text-[13.5px] leading-relaxed text-foreground/90">
                  {streamText}
                  {!done && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-accent-bright demo-ping" aria-hidden="true" />}
                </p>
              )}
              {done && (
                <div className="mt-3 flex items-start gap-3 rounded-xl border border-accent-bright/25 bg-accent-bright/[0.06] p-3">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-violet-soft" aria-hidden="true" />
                  <p className="text-[13.5px] leading-relaxed text-foreground">
                    <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.12em] text-violet-soft">
                      Insight
                    </span>
                    {scenario.conclusion}
                  </p>
                </div>
              )}
              <p className="sr-only">{liveMessages}</p>
            </div>
          </div>
        </div>

        {/* demonstration note */}
        <div className="flex items-center gap-2 border-t border-border bg-elevated/40 px-4 py-2">
          <CircleAlert className="size-3 text-muted-foreground" aria-hidden="true" />
          <p className="text-[11px] text-muted-foreground">
            Sample workspace with demonstration data. Nothing here is executing, connect your own database inside the app.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Timeline row ─────────────────────────────────────────────────── */

function stageState(required: number, current: Stage) {
  return current >= required ? (current === required ? "active" : "done") : "pending"
}

function StageRow({
  label,
  detail,
  mono,
  state,
  violet,
}: {
  label: string
  detail?: string
  mono?: string
  state: "pending" | "active" | "done"
  violet?: boolean
}) {
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      <span className="relative flex flex-col items-center" aria-hidden="true">
        <span
          className={cn(
            "grid size-4 shrink-0 place-items-center rounded-full",
            state === "pending" && "border border-muted-foreground/40",
            state === "active" && "border border-accent-bright bg-accent-bright/10",
            state === "done" && (violet ? "bg-violet-soft/90" : "bg-accent-bright/90")
          )}
        >
          {state === "done" && (
            <Check
              className={cn("size-2.5", violet ? "text-primary-foreground" : "text-background")}
              strokeWidth={3.5}
            />
          )}
          {state === "active" && <span className="size-1.5 rounded-full bg-accent-bright demo-ping" />}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-xs leading-5",
            state === "pending" ? "text-muted-foreground/60" : state === "active" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        {(detail || mono) && (
          <>
            {detail && state !== "pending" && (
              <p className="text-[11px] leading-5 text-muted-foreground/80">{detail}</p>
            )}
            {mono && state !== "pending" && (
              <p className="mt-0.5 truncate font-mono text-[10.5px] text-violet-soft/80">{mono}</p>
            )}
          </>
        )}
      </div>
    </li>
  )
}

/* ── Results panel: table + viz ───────────────────────────────────── */

function Results({ scenario, visible }: { scenario: DemoScenario; visible: boolean }) {
  const max = Math.max(...scenario.rows.map((r) => r.value))

  if (scenario.viz === "stat") {
    return (
      <div className={cn("transition-opacity duration-500", visible ? "opacity-100" : "opacity-0")}>
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-2xl font-semibold tracking-tight text-accent-bright">{scenario.metric.value}</p>
          <p className="text-xs text-muted-foreground">{scenario.metric.label}</p>
        </div>
        <table className="w-full text-left">
          <caption className="sr-only">{scenario.rowCaption}</caption>
          <thead>
            <tr className="text-[11px] text-muted-foreground">
              <th scope="col" className="pb-1.5 font-medium">Segment</th>
              <th scope="col" className="pb-1.5 text-right font-medium">Share</th>
              <th scope="col" className="pb-1.5 text-right font-medium">Orders</th>
            </tr>
          </thead>
          <tbody>
            {scenario.rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <td className="py-2 text-xs text-foreground">{row.label}</td>
                <td className="py-2 text-right font-mono text-xs tabular-nums text-accent-bright">{row.formatted}</td>
                <td className="py-2 text-right font-mono text-xs tabular-nums text-muted-foreground">{row.secondary}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-secondary">
          {scenario.rows.map((row, i) => (
            <div
              key={row.label}
              className={cn("h-full transition-[width] duration-700 ease-out", i === 0 ? "bg-accent-bright" : "bg-chart-3")}
              style={{ width: visible ? `${row.value}%` : "0%" }}
            />
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">{scenario.rowCaption}</p>
      </div>
    )
  }

  if (scenario.viz === "line") {
    const points = scenario.rows
    const w = 320
    const h = 96
    const minV = 0.9 * (points[0] as DemoRow).value
    const maxV = 1.05 * max
    const coords = points.map((p, i) => ({
      x: (i / (points.length - 1)) * (w - 12) + 6,
      y: h - 8 - ((p.value - minV) / (maxV - minV)) * (h - 16),
    }))
    const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ")
    const last = coords[coords.length - 1] as { x: number; y: number }
    const areaPath = `${linePath} L${last.x.toFixed(1)},${h} L${(coords[0] as { x: number }).x.toFixed(1)},${h} Z`

    return (
      <div className={cn("transition-opacity duration-500", visible ? "opacity-100" : "opacity-0")}>
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-2xl font-semibold tracking-tight text-accent-bright">{scenario.metric.value}</p>
          <p className="text-xs text-muted-foreground">{scenario.metric.label}</p>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" role="img" aria-label={scenario.vizLabel}>
          <path d={areaPath} fill="oklch(0.77 0.146 167 / 0.08)" />
          <path
            d={linePath}
            fill="none"
            stroke="oklch(0.77 0.146 167)"
            strokeWidth="2"
            strokeLinecap="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: visible ? 0 : 1,
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.3, 0.6, 0.3, 1)",
            }}
          />
          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r="2.5"
              fill="oklch(0.77 0.146 167)"
              style={{ opacity: visible ? 1 : 0, transition: "opacity 400ms", transitionDelay: `${400 + i * 120}ms` }}
            />
          ))}
        </svg>
        <table className="mt-3 w-full text-left">
          <caption className="sr-only">{scenario.rowCaption}</caption>
          <thead>
            <tr className="text-[11px] text-muted-foreground">
              <th scope="col" className="pb-1.5 font-medium">Month</th>
              <th scope="col" className="pb-1.5 text-right font-medium">MRR</th>
            </tr>
          </thead>
          <tbody>
            {scenario.rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <td className="py-2 text-xs text-foreground">{row.label}</td>
                <td className="py-2 text-right font-mono text-xs tabular-nums text-muted-foreground">{row.formatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // bar viz
  return (
    <div className={cn("transition-opacity duration-500", visible ? "opacity-100" : "opacity-0")}>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-2xl font-semibold tracking-tight text-accent-bright">{scenario.metric.value}</p>
        <p className="text-xs text-muted-foreground">{scenario.metric.label}</p>
      </div>
      <table className="w-full text-left">
        <caption className="sr-only">{scenario.rowCaption}</caption>
        <thead>
          <tr className="text-[11px] text-muted-foreground">
            <th scope="col" className="pb-1.5 font-medium">{scenario.vizLabel}</th>
            <th scope="col" className="pb-1.5 text-right font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {scenario.rows.map((row, i) => (
            <tr key={row.label} className="border-t border-border">
              <td className="py-2 pr-3">
                <p className="text-xs text-foreground">{row.label}</p>
                <div className="mt-1 h-1.5 w-full max-w-56 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent-bright/80 transition-[width] duration-700 ease-out"
                    style={{ width: visible ? `${(row.value / max) * 100}%` : "0%", transitionDelay: `${i * 90}ms` }}
                  />
                </div>
              </td>
              <td className="py-2 text-right align-top">
                <p className="font-mono text-xs tabular-nums text-accent-bright">{row.formatted}</p>
                {row.secondary && <p className="text-[10.5px] text-muted-foreground">{row.secondary}</p>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-muted-foreground">{scenario.rowCaption}</p>
    </div>
  )
}
