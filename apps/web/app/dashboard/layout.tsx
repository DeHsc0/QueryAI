import type { Metadata } from "next"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { Logo } from "@/components/landing/logo"

export const metadata: Metadata = {
  title: "Dashboard — QueryAI",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6">
          <Link
            href="/dashboard"
            className="rounded-md transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="QueryAI workspace home"
          >
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:inline">
              workspace
            </span>
            <span className="hidden h-4 w-px bg-border sm:inline" aria-hidden="true" />
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  )
}
