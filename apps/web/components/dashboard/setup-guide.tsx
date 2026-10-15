import { AlertTriangle, CircleHelp, ExternalLink, Lock, ShieldCheck } from "lucide-react"
import type { DatabaseType } from "@/lib/types"
import { SqlCode, VendorIcon } from "@/components/shared/sql-code"
import { getVendor } from "./vendor"
import { guides, type GuideStep, type VendorGuide } from "./guide-data"
import { CopyButton } from "./copy-button"

/**
 * The read-only database user setup guide. Rendered beside the registration
 * form (sticky on desktop), disclosed below the form on mobile.
 */
export function SetupGuide({
  vendor,
  dbName,
  variant = "panel",
  open,
  onToggle,
}: {
  vendor: DatabaseType
  dbName: string
  variant: "panel" | "disclosure"
  open?: boolean
  onToggle?: (open: boolean) => void
}) {
  const meta = getVendor(vendor)
  const guide = guides[vendor]

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card"
      data-variant={variant}
    >
      {/* vendor header */}
      <div className="flex items-center gap-3 border-b border-border bg-elevated/60 px-4 py-3">
        <VendorIcon vendor={vendor} className="size-9 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            Read-only user setup
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {dbName ? <><span className="font-mono text-accent-bright">{dbName}</span> · </> : null}
            {meta.label}
          </p>
        </div>
      </div>

      {variant === "disclosure" ? (
        <details className="group" open={open} onToggle={(e) => onToggle?.((e.target as HTMLDetailsElement).open)}>
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
            Setup commands
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-open:opacity-0" aria-hidden="true">
              show
            </span>
          </summary>
          <GuideBody guide={guide} />
        </details>
      ) : (
        <GuideBody guide={guide} />
      )}
    </div>
  )
}

function GuideBody({ guide }: { guide: VendorGuide }) {
  return (
    <div className="flex flex-col">
      {/* why */}
      <div className="flex gap-2.5 border-b border-border px-4 py-3.5">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent-bright" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed text-muted-foreground">{guide.why}</p>
      </div>

      {/* prerequisites */}
      <div className="border-b border-border bg-elevated/30 px-4 py-3">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Before you start
        </p>
        <ul className="flex flex-col gap-1">
          {guide.prerequisites.map((p) => (
            <li key={p} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-[7px] size-1 shrink-0 rounded-full bg-muted-foreground/60" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* steps with per-step copy + copy-all */}
      <ol className="flex flex-col border-b border-border">
        {guide.steps.map((step, i) => (
          <li key={step.title} className={i > 0 ? "border-t border-border" : undefined}>
            <GuideStepPanel step={step} />
          </li>
        ))}
      </ol>
      <div className="px-4 py-2.5">
        <CopyButton
          className="w-full justify-center"
          label={`Copy all ${guide.steps.length} commands`}
          text={AllCommands(guide)}
        />
      </div>

      {/* placeholders */}
      <div className="border-t border-border bg-elevated/30 px-4 py-3">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <AlertTriangle className="size-3" aria-hidden="true" />
          Replace every placeholder
        </p>
        <dl className="flex flex-col gap-2.5">
          {guide.placeholders.map((p) => (
            <div key={p.token} className="min-w-0">
              <dt className="font-mono text-[11px] text-accent-bright">{p.token}</dt>
              <dd className="mt-0.5 text-[11.5px] leading-5 text-muted-foreground">{p.meaning}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* troubleshooting */}
      <div className="border-t border-border px-4 py-3">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <CircleHelp className="size-3" aria-hidden="true" />
          Common permission problems
        </p>
        <ul className="flex flex-col divide-y divide-border/60">
          {guide.troubleshooting.map((t) => (
            <li key={t.problem} className="py-2.5 first:pt-0 last:pb-0">
              <p className="font-mono text-[11px] leading-5 text-foreground">{t.problem}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.fix}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* docs link */}
      <a
        href={guide.docsUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span className="flex items-center gap-2">
          <ExternalLink className="size-3.5 shrink-0 text-accent-bright" aria-hidden="true" />
          {guide.docsLabel}
        </span>
        <span className="font-mono text-[10px]">docs</span>
      </a>

      {/* security note */}
      <p className="flex items-start gap-2 border-t border-border bg-elevated/40 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 size-3 shrink-0 text-accent-bright" aria-hidden="true" />
        These commands run in your own database tools. QueryAI never executes setup SQL from the browser, and the password you enter is stored only encrypted, server-side.
      </p>
    </div>
  )
}

function AllCommands(guide: { steps: GuideStep[] }): string {
  return guide.steps.map((s) => s.command).join("\n\n")
}

function GuideStepPanel({ step }: { step: GuideStep }) {
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-foreground">{step.title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/80">{step.runWhere}</p>
        </div>
        <CopyButton text={step.command} label="Copy" />
      </div>
      <div className="mt-2 overflow-hidden rounded-lg border border-border bg-background">
        <pre
          tabIndex={0}
          className="overflow-x-auto px-3 py-2.5 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <code>
            <SqlCode command={step.command} />
          </code>
        </pre>
      </div>
      {step.caveat && (
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">{step.caveat}</p>
      )}
    </div>
  )
}
