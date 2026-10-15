import { BrainCircuit, Database, History, MessagesSquare, ShieldCheck, Settings2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Reveal } from "./reveal"
import { Section, SectionHeader } from "./section"
import { cn } from "@/lib/utils"

function Cell({
  icon,
  title,
  body,
  span,
  children,
  delay,
}: {
  icon: LucideIcon
  title: string
  body: string
  span: string
  children: ReactNode
  delay: number
}) {
  const Icon = icon
  return (
    <Reveal delay={delay} className={cn("min-w-0", span)}>
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-start gap-3 p-5 pb-4">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-elevated text-accent-bright">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-[15px] font-medium text-foreground">{title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
          </div>
        </div>
        <div className="mt-auto border-t border-border bg-elevated/50 p-5">{children}</div>
      </div>
    </Reveal>
  )
}

/* Fragments — small, believable pieces of the actual product. */

function ExploreFragment() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="max-w-[85%] self-end rounded-xl rounded-br-sm bg-primary/15 px-3.5 py-2.5">
        <p className="text-xs leading-relaxed text-foreground">
          Top customers by spend this month?
        </p>
      </div>
      <div className="max-w-[90%] self-start rounded-xl rounded-bl-sm border border-border bg-background px-3.5 py-2.5">
        <p className="text-xs leading-relaxed text-muted-foreground">
          The top 5 account for 62% of monthly revenue. <span className="text-accent-bright font-mono">Alice Johnson</span> leads at $15,420.
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-border px-3 py-2">
        <p className="text-[11px] text-muted-foreground/70">
          Ask a follow-up: “Which of them ordered in the last 7 days?”
        </p>
      </div>
    </div>
  )
}

function SchemaFragment() {
  return (
    <div>
      <div className="rounded-lg bg-background p-3 font-mono text-[10.5px] leading-5">
        <p className="text-violet-soft">T:orders | cols:8 | <span className="text-accent-bright">J:customers(customer_id)</span></p>
        <p className="text-muted-foreground">T:products | cols:6 | J:orders(product_id)</p>
        <p className="text-muted-foreground">T:customers | cols:5</p>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded border border-border bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">tenant: user__db</span>
        <span className="rounded border border-border bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">dense + BM25</span>
        <span className="rounded border border-border bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">top 10</span>
      </div>
    </div>
  )
}

function ReadonlyFragment() {
  return (
    <div className="rounded-lg bg-background p-3 font-mono text-[10.5px] leading-5">
      <p className="flex items-center justify-between gap-2">
        <span className="text-accent-bright">run_sql · validated</span>
        <span className="rounded-sm border border-destructive/40 px-1 text-[9.5px] text-destructive">write blocked</span>
      </p>
      <p className="mt-1 whitespace-pre text-sql-id">DROP TABLE orders</p>
      <p className="mt-0.5 text-muted-foreground/60 line-through decoration-destructive/60">returns: rejected before execution</p>
      <p className="mt-2 whitespace-pre text-sql-id">SELECT total FROM orders ✓</p>
    </div>
  )
}

function AnswersFragment() {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-violet-soft" aria-hidden="true" />
      <div>
        <p className="text-[13px] leading-relaxed text-foreground/90">
          “August orders split 44% repeat vs 56% new; repeat buyers average $61 per order vs $48 for first-time customers.”
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          metric · comparison · conclusion
        </p>
      </div>
    </div>
  )
}

function HistoryFragment() {
  return (
    <ol className="flex flex-col gap-1 text-xs" aria-label="Conversation examples">
      {[
        { t: "Revenue Analysis", n: "4 turns" },
        { t: "Churn after pricing change", n: "2 turns" },
        { t: "Top regions by margin", n: "6 turns" },
      ].map((c) => (
        <li key={c.t} className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2 text-muted-foreground">
          <span className="truncate">{c.t}</span>
          <span className="shrink-0 font-mono text-[10px]">{c.n}</span>
        </li>
      ))}
    </ol>
  )
}

function PrefsFragment() {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {["Prefers EUR", "Weekly summary cadence", "Timezone UTC+2", "Runs margin analysis on Mondays"].map((p) => (
          <span key={p} className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
            {p}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-4 text-muted-foreground/80">
        Preferences are remembered per user and per database, and steered into every new answer.
      </p>
    </div>
  )
}

export function Features() {
  return (
    <Section id="features">
      <SectionHeader
        index="03"
        eyebrow="Features"
        title="Built for questions, not dashboards"
        lede="Everything on this page maps to shipped behavior: hybrid schema retrieval, bounded agent runs, read-only execution, conversation memory."
      />

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-12">
        <Cell
          icon={MessagesSquare}
          title="Natural-language exploration"
          body="Ask in the words you'd use with a colleague. Follow-ups keep the thread, so refinement doesn't mean starting over."
          span="md:col-span-7"
          delay={0}
        >
          <ExploreFragment />
        </Cell>

        <Cell
          icon={Database}
          title="Context-aware schema retrieval"
          body="Your schema is indexed and searched with hybrid dense + sparse retrieval, filtered to your account and database."
          span="md:col-span-5"
          delay={80}
        >
          <SchemaFragment />
        </Cell>

        <Cell
          icon={ShieldCheck}
          title="AI-assisted, read-only SQL"
          body="Queries are generated for you, validated as read-only, and executed with results capped before they reach the answer."
          span="md:col-span-5"
          delay={0}
        >
          <ReadonlyFragment />
        </Cell>

        <Cell
          icon={BrainCircuit}
          title="Analytical answers"
          body="Not just rows: a written answer that names the metric, the comparison, and the conclusion you can act on."
          span="md:col-span-7"
          delay={80}
        >
          <AnswersFragment />
        </Cell>

        <Cell
          icon={History}
          title="Conversation history"
          body="Every conversation and turn is stored, so yesterday's investigation is still available today."
          span="md:col-span-4"
          delay={0}
        >
          <HistoryFragment />
        </Cell>

        <Cell
          icon={Settings2}
          title="Preferences that stick"
          body="The agent remembers how you like answers delivered and applies it conversation after conversation."
          span="md:col-span-8"
          delay={80}
        >
          <PrefsFragment />
        </Cell>
      </div>
    </Section>
  )
}
