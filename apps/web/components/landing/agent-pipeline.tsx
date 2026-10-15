import { Fragment } from "react"
import { Layers, MessagesSquare, Braces, Table2, NotebookPen } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Reveal } from "./reveal"
import { Section, SectionHeader } from "./section"
import { cn } from "@/lib/utils"

interface Node {
  icon: LucideIcon
  label: string
  sub: string
  tone: "neutral" | "teal" | "violet"
}

const nodes: Node[] = [
  { icon: MessagesSquare, label: "Question", sub: "Plain English", tone: "neutral" },
  { icon: Layers, label: "Schema retrieval", sub: "Dense + BM25, top 10", tone: "violet" },
  { icon: Braces, label: "SQL execution", sub: "Validated read-only", tone: "teal" },
  { icon: Table2, label: "Results", sub: "Up to 50 rows per run", tone: "teal" },
  { icon: NotebookPen, label: "Explanation", sub: "The numbers, in words", tone: "violet" },
]

const toneClasses = {
  neutral: "border-border text-foreground",
  teal: "border-accent-bright/50 text-accent-bright",
  violet: "border-violet-soft/50 text-violet-soft",
}

export function AgentPipeline() {
  return (
    <Section id="agent" className="border-y border-border bg-card/30">
      <SectionHeader
        index="02"
        eyebrow="Under the hood"
        title="An agent that investigates before it answers"
        lede="Each question runs through the same honest pipeline: ground the question in your real schema, query carefully, then explain what came back."
      />

      <Reveal delay={120}>
        <div className="mt-14">
          <div className="flex flex-col md:flex-row md:items-start">
            {nodes.map((node, i) => (
              <Fragment key={node.label}>
                <div
                  className={cn(
                    "flex items-center gap-4 md:flex-1 md:flex-col md:items-center md:gap-3",
                    i > 0 && "pt-6 md:pt-0"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-xl border bg-background",
                      toneClasses[node.tone]
                    )}
                  >
                    <node.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 md:text-center">
                    <p className="font-mono text-[13px] text-foreground">{node.label}</p>
                    <p className="mt-1 text-[11px] leading-4 text-muted-foreground md:mt-0 md:max-w-36">
                      {node.sub}
                    </p>
                  </div>
                </div>
                {i < nodes.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="relative ml-[21px] h-8 w-px bg-border md:ml-0 md:mt-[21px] md:h-px md:w-10 md:flex-none"
                  >
                    <span
                      className="pipeline-pulse absolute top-1/2 left-0 size-1.5 -translate-y-1/2 rounded-full bg-accent-bright max-md:hidden"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={220}>
        <p className="mt-10 text-xs text-muted-foreground">
          The agent is bounded: at most two schema retrievals and two SQL queries per question, so it investigates with intent instead of thrashing.
        </p>
      </Reveal>
    </Section>
  )
}
