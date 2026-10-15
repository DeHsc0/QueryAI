"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Minimal accessible modal: focus is moved in, Tab is trapped, Escape and
 * backdrop close it, focus returns to the trigger, background scroll locks.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  const [idSeed] = useState(() => Math.random().toString(36).slice(2, 8))
  const titleId = `dialog-${idSeed}`

  // The open/close handler lives in a ref so the mount effect depends only
  // on `open` — otherwise re-renders (e.g. every keystroke) would re-run the
  // effect and yank focus back to the first field.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === "Escape") {
        e.stopPropagation()
        onCloseRef.current()
      }
      if (e.key === "Tab") {
        const panel = panelRef.current
        if (!panel) return
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
        )
        if (focusables.length === 0) return
        const first = focusables[0] as HTMLElement
        const last = focusables[focusables.length - 1] as HTMLElement
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        } else if (!panel.contains(document.activeElement)) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [open]
  )

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = "hidden"
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current
      // prefer the first editable field, fall back to the first focusable control
      const target =
        panel?.querySelector<HTMLElement>('input:not([disabled]), textarea, select') ??
        panel?.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
        )
      target?.focus()
    })
    document.addEventListener("keydown", onKeyDown, true)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("keydown", onKeyDown, true)
      document.body.style.overflow = ""
      restoreRef.current?.focus?.()
      restoreRef.current = null
    }
  }, [open, onKeyDown])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/65 focus-visible:outline-none"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "dialog-in relative w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-[0_24px_80px_-16px_oklch(0.05_0.01_195/0.9)]",
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-[15px] font-medium text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
