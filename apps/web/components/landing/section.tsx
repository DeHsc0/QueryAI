import type { ReactNode } from "react"
import { Reveal } from "./reveal"
import { cn } from "@/lib/utils"

export function SectionHeader({
  index,
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  index: string
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
  align?: "left" | "center"
  className?: string
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-bright">
        <span className="text-muted-foreground/70">{index}</span> · {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground md:text-4xl md:leading-[1.15]">
        {title}
      </h2>
      {lede && (
        <p className={cn("mt-4 text-[15px] leading-relaxed text-muted-foreground")}>{lede}</p>
      )}
    </Reveal>
  )
}

export function Section({
  id,
  children,
  className,
}: {
  id?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn("relative py-24 md:py-28", className)}>
      <div className="mx-auto max-w-6xl px-6">{children}</div>
    </section>
  )
}
