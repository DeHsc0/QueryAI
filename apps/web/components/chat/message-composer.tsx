"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, Square } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Bottom-anchored composer: Enter submits, Shift+Enter inserts a newline
 * (and on touch devices Enter always inserts a newline so it behaves like
 * a normal keyboard). Submissions are blocked while a turn is streaming.
 */
export function MessageComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  disabled,
  streaming,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onStop: () => void
  disabled?: boolean
  streaming?: boolean
  placeholder: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)")
    // deferred so the initial store write doesn't run as a synchronous effect body
    const t = setTimeout(() => setTouch(mq.matches), 0)
    const onChange = () => setTouch(mq.matches)
    mq.addEventListener("change", onChange)
    return () => {
      clearTimeout(t)
      mq.removeEventListener("change", onChange)
    }
  }, [])

  // autosize
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = Math.min(el.scrollHeight, 160) + "px"
  }, [value])

  const canSubmit = !disabled && !streaming && value.trim().length > 0

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return
    if (touch || e.shiftKey) return // newline
    e.preventDefault()
    if (canSubmit) onSubmit()
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (canSubmit) onSubmit()
      }}
      className="px-4 pb-4 pt-1 md:px-6 md:pb-5"
    >
      <div
        className={cn(
          "mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-card p-2 transition-colors",
          "focus-within:border-ring",
          disabled && "opacity-60"
        )}
      >
        <label htmlFor="composer" className="sr-only">
          Ask a question about your data
        </label>
        <textarea
          id="composer"
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-elevated text-foreground transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Stop generating"
          >
            <Square className="size-3.5" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSubmit}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[10.5px] text-muted-foreground">
        Enter to send · Shift+Enter for a new line{!streaming ? " · every query is read-only" : ""}
      </p>
    </form>
  )
}
