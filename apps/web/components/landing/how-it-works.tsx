import { FileCheck2, KeyRound, Search, Table2 } from "lucide-react"
import { Reveal } from "./reveal"
import { Section, SectionHeader } from "./section"

/**
 * Step 1 fragment — a database connection card (post-encryption state,
 * matching the app's Fernet-encrypted credential storage).
 */
function ConnectFragment() {
  return (
    <div className="rounded-xl border border-border bg-elevated/70 p-3.5">
      <div className="space-y-2">
        {[
          { k: "database_type", v: "postgresql" },
          { k: "host", v: "db.internal.acme.io" },
          { k: "port", v: "5432" },
        ].map((f) => (
          <div key={f.k} className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2">
            <span className="font-mono text-[11px] text-muted-foreground">{f.k}</span>
            <span className="font-mono text-[11px] text-foreground">{f.v}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <KeyRound className="size-3 text-accent-bright" aria-hidden="true" />
        Credentials encrypted (Fernet) before they are stored
      </p>
    </div>
  )
}

/** Step 2 fragment — the question box a user actually types into. */
function AskFragment() {
  return (
    <div className="rounded-xl border border-border bg-elevated/70 p-3.5">
      <div className="rounded-lg border border-ring/60 bg-background px-3 py-2.5 text-[13px] text-foreground">
        How did churn move after the March pricing change?
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Search className="size-3 text-violet-soft" aria-hidden="true" />
        Schema context retrieved first, so SQL fits your tables
      </p>
    </div>
  )
}

/** Step 3 fragment — results you can inspect: SQL, rows, and the write-up. */
function DiscoverFragment() {
  return (
    <div className="rounded-xl border border-border bg-elevated/70 p-3.5">
      <div aria-hidden="true" className="flex items-center gap-1 text-[10px] font-mono">
        <span className="rounded-md bg-primary/15 px-2 py-1 text-accent-bright">SQL</span>
        <span className="rounded-md px-2 py-1 text-muted-foreground">Data</span>
        <span className="rounded-md px-2 py-1 text-muted-foreground">Answer</span>
      </div>
      <div className="mt-2.5 overflow-x-auto rounded-lg bg-background px-3 py-2.5 font-mono text-[10.5px] leading-5">
        <p className="whitespace-pre"><span className="sql-kw">SELECT</span> <span className="sql-id">plan, SUM(total)</span></p>
        <p className="whitespace-pre"><span className="sql-kw">FROM</span> <span className="sql-id">v2_mrr_by_plan <span className="sql-kw">GROUP BY</span> plan</span></p>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Table2 className="size-3 text-accent-bright" aria-hidden="true" />
        Every answer links back to the exact query and rows
      </p>
    </div>
  )
}

const steps = [
  {
    n: "01",
    title: "Connect",
    body: "Point QueryAI at a supported database. The schema (tables, columns, foreign keys) is extracted and indexed for retrieval.",
    fragment: <ConnectFragment />,
  },
  {
    n: "02",
    title: "Ask",
    body: "Describe the analysis in plain English. The agent retrieves the most relevant tables from your indexed schema before it touches any query.",
    fragment: <AskFragment />,
  },
  {
    n: "03",
    title: "Discover",
    body: "Inspect the generated SQL, the returned rows, and a written analytical answer that states what the data actually shows.",
    fragment: <DiscoverFragment />,
  },
]

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeader
        index="01"
        eyebrow="How it works"
        title="From connection to answer in three steps"
        lede="No dashboards to configure, no SQL to hand-write. QueryAI sits on top of the database you already have."
      />

      <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
        {/* connector line (content plane decoration) */}
        <div
          aria-hidden="true"
          className="absolute left-[19px] top-3 h-[calc(100%-3rem)] w-px border-l border-dashed border-border md:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute left-[86px] right-[86px] top-3 hidden border-t border-dashed border-border md:block"
        />
        {steps.map((step, i) => (
          <Reveal key={step.n} as="li" delay={i * 90} className="relative">
            <div className="relative z-10 grid size-9 place-items-center rounded-full border border-accent-bright/40 bg-card font-mono text-xs text-accent-bright md:ml-[60px]">
              {step.n}
            </div>
            <div className="mt-5 md:px-1">
              <h3 className="text-lg font-medium text-foreground">{step.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              <div className="mt-5 max-w-sm">
                {step.fragment}
              </div>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal delay={200}>
        <p className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
          <FileCheck2 className="size-3.5 text-accent-bright" aria-hidden="true" />
          Supported engines: PostgreSQL, MySQL, Oracle, and Microsoft SQL Server.
        </p>
      </Reveal>
    </Section>
  )
}
