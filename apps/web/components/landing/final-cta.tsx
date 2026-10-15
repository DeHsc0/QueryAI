import { ArrowRight } from "lucide-react"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Logo } from "./logo"
import { Reveal } from "./reveal"
import { Button } from "@/components/ui/button"

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_100%,oklch(0.77_0.146_167/0.08),transparent_70%)]"
      />
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-5xl md:leading-[1.12]">
          Your data has answers.<br />Start asking.
        </h2>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Sign up, connect one database, and ask your first real question in plain English.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <SignUpButton mode="modal">
            <Button size="lg" className="h-11 gap-2 rounded-lg px-6 text-[15px] font-medium">
              Get started
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </SignUpButton>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="h-11 rounded-lg px-6 text-[15px] text-muted-foreground hover:text-foreground"
          >
            <a href="#top">Back to the demo</a>
          </Button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground/70">
          Works with PostgreSQL, MySQL, Oracle, and SQL Server
        </p>
      </Reveal>
    </section>
  )
}

const footerLinks = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              An AI data-analysis assistant that connects to your database and answers questions in plain English.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-2 text-sm md:items-end">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="rounded text-left text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Sign in
                  </button>
                </SignInButton>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} QueryAI</p>
          <p>All product content on this page runs on local sample data for demonstration.</p>
        </div>
      </div>
    </footer>
  )
}
