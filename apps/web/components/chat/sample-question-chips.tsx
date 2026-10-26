"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Sample questions as an always-visible, horizontally scrollable chip rail
 * aligned exactly with the composer below it. Picking a chip sends it
 * straight to the agent. Edge fades only appear on the side that actually
 * overflows, so the rail never dims content that is already fully visible.
 */
export function SampleQuestionChips({
  questions,
  disabled,
  onPick,
}: {
  questions: string[]
  disabled?: boolean
  onPick: (question: string) => void
}) {
  const railRef = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState({ left: false, right: false })
  // drag-to-scroll: mouse users can grab the rail and slide it; a real drag
  // suppresses the trailing click so it never also picks a chip
  const drag = useRef<{ pointerId: number; startX: number; startLeft: number; captured: boolean } | null>(
    null
  )
  // survives pointerup so the click that trails a real drag is suppressed there
  const dragged = useRef(false)

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    const update = () => {
      setOverflow({
        left: el.scrollLeft > 2,
        right: el.scrollWidth - el.clientWidth - el.scrollLeft > 2,
      })
    }
    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    // vertical wheel over the rail slides it horizontally (React's wheel
    // listener is passive, so it is attached manually to be cancelable)
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      if (el.scrollWidth <= el.clientWidth) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      el.removeEventListener("scroll", update)
      el.removeEventListener("wheel", onWheel)
      ro.disconnect()
    }
  }, [questions])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = railRef.current
    if (!el || e.pointerType !== "mouse" || e.button !== 0) return
    dragged.current = false
    // no pointer capture yet: capturing here would retarget the click to the
    // rail and eat chip clicks; it is taken lazily once a real drag begins
    drag.current = { pointerId: e.pointerId, startX: e.clientX, startLeft: el.scrollLeft, captured: false }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = railRef.current
    const d = drag.current
    if (!el || !d || d.pointerId !== e.pointerId) return
    const dx = e.clientX - d.startX
    if (!d.captured && Math.abs(dx) > 4) {
      d.captured = true
      dragged.current = true
      el.setPointerCapture(e.pointerId)
    }
    if (d.captured) el.scrollLeft = d.startLeft - dx
  }
  const endDrag = () => {
    drag.current = null
  }
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragged.current) {
      dragged.current = false
      e.preventDefault()
      e.stopPropagation()
    }
  }

  if (questions.length === 0) return null

  return (
    <div className="relative">
      <div
        ref={railRef}
        role="group"
        aria-label="Sample questions"
        onClickCapture={onClickCapture}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="flex cursor-grab items-center gap-1.5 overflow-x-auto py-px select-none active:cursor-grabbing"
      >
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
          Try
        </span>
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            disabled={disabled}
            onClick={() => onPick(question)}
            className={cn(
              "group flex h-8 max-w-64 shrink-0 items-center gap-1.5 rounded-full border border-border bg-elevated/50 px-3 text-xs text-muted-foreground",
              "transition-colors hover:border-accent-bright/45 hover:bg-accent-bright/[0.07] hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <Sparkles
              className="size-3 shrink-0 text-accent-bright/80 transition-colors group-hover:text-accent-bright"
              aria-hidden="true"
            />
            <span className="truncate">{question}</span>
          </button>
        ))}
      </div>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent transition-opacity",
          overflow.left ? "opacity-100" : "opacity-0"
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent transition-opacity",
          overflow.right ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  )
}
