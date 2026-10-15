import { Lock, Search, ShieldCheck, Fingerprint } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Reveal } from "./reveal"
import { Section, SectionHeader } from "./section"

interface Item {
  icon: LucideIcon
  title: string
  body: string
}

const items: Item[] = [
  {
    icon: Search,
    title: "Read-only by construction",
    body: "Every SQL statement is validated before execution. Only reads pass; the agent cannot insert, update, or delete anything in your database.",
  },
  {
    icon: Lock,
    title: "Credentials encrypted at rest",
    body: "Connection credentials are encrypted before they are stored and decrypted only in memory, at the moment a query runs.",
  },
  {
    icon: Fingerprint,
    title: "Tenant-scoped context",
    body: "Schema retrieval is filtered strictly to your user and your database. One tenant never sees another tenant's tables.",
  },
  {
    icon: ShieldCheck,
    title: "Bounded, observable runs",
    body: "Each answer is limited to two schema lookups and two SQL queries. You see the exact queries and rows behind every conclusion.",
  },
]

export function Trust() {
  return (
    <Section id="security" className="border-t border-border bg-card/30">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <SectionHeader
            index="04"
            eyebrow="Security"
            title="Your database is respected as your database"
            lede="QueryAI is designed around one rule: it can look, but it cannot touch. These are current product behaviors, not roadmap promises."
          />
        </div>

        <Reveal delay={120} className="md:col-span-7">
          <ul className="grid gap-0">
            {items.map((item, i) => (
              <li
                key={item.title}
                className={i > 0 ? "border-t border-border" : undefined}
              >
                <div className="flex gap-4 py-5 first:pt-0">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-elevated text-accent-bright">
                    <item.icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-medium text-foreground">{item.title}</h3>
                    <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  )
}
