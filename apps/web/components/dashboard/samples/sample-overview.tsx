import type { SampleCatalogEntry } from "@/lib/sample-catalog"

/** "What you can ask": the full topic list, which the sidebar only previews. */
export function SampleOverview({ entry }: { entry: SampleCatalogEntry }) {
  return (
    <section aria-labelledby="sample-ask" className="space-y-4">
      <SectionHeading id="sample-ask" eyebrow="01 · Scope" title="What you can ask" />
      <p className="max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        Topics this database can answer. Each one maps to tables in the schema below.
      </p>
      <ul className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
        {entry.what_you_can_ask.map((topic, i) => (
          <li key={topic} className="flex gap-3 bg-card px-4 py-3.5 last:odd:sm:col-span-2">
            <span className="font-mono text-[10.5px] text-muted-foreground/70">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[13.5px] leading-relaxed text-foreground/90">{topic}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function SectionHeading({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
      <h2 id={id} className="mt-1.5 text-xl font-medium tracking-tight text-foreground">
        {title}
      </h2>
    </div>
  )
}
