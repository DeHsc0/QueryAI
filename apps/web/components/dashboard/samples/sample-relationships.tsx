import type { CatalogRelationship } from "@/lib/sample-catalog"
import { SectionHeading } from "./sample-overview"

/**
 * How tables join. Each relationship is one line of the join graph, so a
 * user can see which questions need several tables before they ask.
 */
export function SampleRelationships({
  relationships,
  tableCount,
}: {
  relationships: CatalogRelationship[]
  tableCount: number
}) {
  return (
    <section aria-labelledby="sample-relationships" className="space-y-4">
      <SectionHeading id="sample-relationships" eyebrow="03 · Joins" title="Relationships" />
      <p className="max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        {relationships.length} links across {tableCount} tables. Questions that span several tables follow these joins.
      </p>

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {relationships.map((rel) => (
          <li key={`${rel.from}->${rel.to}`} className="grid gap-2 px-4 py-3.5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4">
            <span className="truncate font-mono text-[12.5px] text-foreground">{rel.from}</span>
            <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground">
              <span aria-hidden="true">→</span>
              {rel.type}
            </span>
            <span className="truncate font-mono text-[12.5px] text-foreground">{rel.to}</span>
            <span className="text-[12.5px] leading-relaxed text-muted-foreground md:col-span-3">{rel.meaning}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
