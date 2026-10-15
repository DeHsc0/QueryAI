import { cn } from "@/lib/utils"

/**
 * QueryAI wordmark. The mark abstracts a query cursor inside a data
 * surface: a bar chart rising out of a scan line.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary shadow-[0_1px_10px_oklch(0.77_0.146_167/0.25)]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1" y="9.5" width="3" height="5.5" rx="0.8" fill="oklch(0.15 0.01 195)" opacity="0.55" />
          <rect x="6" y="5.5" width="3" height="9.5" rx="0.8" fill="oklch(0.15 0.01 195)" opacity="0.8" />
          <rect x="11" y="1" width="3" height="14" rx="0.8" fill="oklch(0.15 0.01 195)" />
          <path d="M1 3.5h6" stroke="oklch(0.15 0.01 195)" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
        </svg>
      </span>
      <span className="font-mono text-[15px] font-semibold tracking-tight text-foreground">
        QueryAI
      </span>
    </span>
  )
}
