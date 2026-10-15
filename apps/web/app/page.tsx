import { SiteNav } from "@/components/landing/site-nav"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { AgentPipeline } from "@/components/landing/agent-pipeline"
import { Features } from "@/components/landing/features"
import { Trust } from "@/components/landing/trust"
import { FinalCta, Footer } from "@/components/landing/final-cta"

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <HowItWorks />
        <AgentPipeline />
        <Features />
        <Trust />
        <FinalCta />
        <Footer />
      </main>
    </>
  )
}
