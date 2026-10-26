"use client"

import { useEffect, useId, useRef, useState } from "react"
import { ChevronUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Sample question picker: a compact trigger above the composer that opens a
 * list of the database's suggested questions. Picking one sends it straight
 * to the agent. Escape and outside clicks close the list.
 */
export function SampleQuestionPicker({
  questions,
  disabled,
  onPick,
}: {
  questions: string[]
  disabled?: boolean
  onPick: (question: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener("mousedown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (questions.length === 0) return null

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          open
            ? "border-accent-bright/50 bg-accent-bright/[0.08] text-foreground"
            : "border-border bg-elevated/60 text-muted-foreground hover:border-ring/60 hover:text-foreground",
        )}
      >
        <Sparkles className="size-3.5 text-accent-bright" aria-hidden="true" />
        Sample questions
        <span className="font-mono text-[10.5px] text-muted-foreground">{questions.length}</span>
        <ChevronUp
          className={cn("size-3.5 transition-transform", open ? "rotate-0" : "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={listId}
          role="group"
          aria-label="Sample questions"
          className="absolute bottom-full left-0 z-20 mb-2 w-[min(30rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-[0_24px_64px_-18px_oklch(0.05_0.01_195/0.9)]"
        >
          <p className="border-b border-border px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Pick a question to send
          </p>
          <ul className="max-h-[min(22rem,50dvh)] overflow-y-auto p-1.5">
            {questions.map((question, i) => (
              <li key={question}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onPick(question)
                  }}
                  className="group flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                >
                  <span className="mt-0.5 font-mono text-[10.5px] text-muted-foreground/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] leading-relaxed text-muted-foreground group-hover:text-foreground">
                    {question}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
