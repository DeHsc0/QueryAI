import { ArrowRight, ShieldCheck } from "lucide-react"
import { SignUpButton } from "@clerk/nextjs"
import { Reveal } from "./reveal"
import { DemoWorkspace } from "./demo-workspace"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
      {/* background plane: grid + top glow */}
      <div aria-hidden="true" className="landing-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[480px] max-w-3xl bg-[radial-gradient(60%_60%_at_50%_20%,oklch(0.77_0.146_167/0.10),transparent_70%)]"
      />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Reveal>
            <p className="flex items-center gap-2 rounded-full border border-border bg-elevated/60 py-1 pl-2.5 pr-3 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent-bright" aria-hidden="true" />
              Agentic data analysis for PostgreSQL, MySQL, Oracle &amp; SQL Server
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-5xl font-medium leading-[1.05] tracking-[-0.03em] text-foreground md:text-7xl">
              Ask your data<br className="hidden sm:block" /> anything.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Your database holds the answers. QueryAI uncovers them with
              natural-language questions, context-aware SQL, and clear
              analytical insights.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <SignUpButton mode="modal">
                <Button size="lg" className="h-11 gap-2 rounded-lg px-6 text-[15px] font-medium">
                  Get started
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </SignUpButton>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 rounded-lg px-6 text-[15px] text-muted-foreground hover:text-foreground"
              >
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <p className="mt-6 flex items-start justify-center gap-1.5 text-xs text-muted-foreground/80">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent-bright" aria-hidden="true" />
              No data movement. QueryAI reads your schema, runs read-only queries, and writes nothing.
            </p>
          </Reveal>
        </div>

        {/* Product centerpiece */}
        <Reveal delay={380} className="relative mx-auto mt-16 max-w-5xl md:mt-20">
          <DemoWorkspace />
        </Reveal>
      </div>
    </section>
  )
}
