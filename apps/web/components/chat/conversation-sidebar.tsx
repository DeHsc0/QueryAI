"use client"

import Link from "next/link"
import { PanelLeftClose, PanelLeftOpen, Plus, Search } from "lucide-react"
import type { ConversationGroup } from "./chat-types"
import type { DatabaseSummary } from "@/lib/types"
import { conversationGroup } from "./chat-types"
import { getVendor } from "@/components/dashboard/vendor"
import { Logo } from "@/components/landing/logo"
import { VendorIcon } from "@/components/shared/sql-code"
import { cn } from "@/lib/utils"

const groupOrder: ConversationGroup[] = ["Today", "Yesterday", "Previous 7 days", "Older"]

export function ConversationSidebar({
  conversations,
  activeId,
  dbMeta,
  query,
  onQueryChange,
  onSelect,
  onNewChat,
  collapsed,
  onCollapsedChange,
  className,
}: {
  conversations: { id: string; title: string; createdAt?: string }[]
  activeId: string | null
  dbMeta: DatabaseSummary | null
  query: string
  onQueryChange: (v: string) => void
  onSelect: (id: string) => void
  onNewChat: () => void
  collapsed: boolean
  onCollapsedChange: (v: boolean) => void
  className?: string
}) {
  const ids = new Set(conversations.map((c) => c.id))
  void ids

  return (
    <div
      className={cn(
        "flex h-full flex-col border-border bg-sidebar transition-[width] duration-200 md:border-r",
        collapsed ? "w-[68px]" : "w-72",
        className
      )}
    >
      {/* brand */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "justify-between px-3"
        )}
      >
        <Link
          href="/dashboard"
          className="rounded-md transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Back to database workspace"
          title="Back to database workspace"
        >
          {collapsed ? (
            <span className="grid size-8 place-items-center rounded-lg bg-primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="9.5" width="3" height="5.5" rx="0.8" fill="oklch(0.15 0.01 195)" opacity="0.55" />
                <rect x="6" y="5.5" width="3" height="9.5" rx="0.8" fill="oklch(0.15 0.01 195)" opacity="0.8" />
                <rect x="11" y="1" width="3" height="14" rx="0.8" fill="oklch(0.15 0.01 195)" />
              </svg>
            </span>
          ) : (
            <Logo />
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={() => onCollapsedChange(true)}
            className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-lg:hidden"
            aria-label="Collapse conversation navigation"
          >
            <PanelLeftClose className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {collapsed ? (
        /* collapsed rail */
        <>
          <div className="grid gap-2 p-2">
            <button
              type="button"
              onClick={onNewChat}
              title="New chat"
              aria-label="New chat"
              className="grid h-10 w-full place-items-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onCollapsedChange(false)}
              title="Expand conversation navigation"
              aria-label="Expand conversation navigation"
              className="grid h-10 w-full place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-lg:hidden"
            >
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* new chat + db context */}
          <div className="flex flex-col gap-2.5 p-3">
            <button
              type="button"
              onClick={onNewChat}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="size-4" aria-hidden="true" />
              New chat
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-lg border border-border bg-elevated/50 px-2.5 py-2 transition-colors hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Change database in the workspace"
            >
              {dbMeta ? (
                <VendorIcon vendor={dbMeta.database_soft} className="size-6 shrink-0" />
              ) : (
                <span className="size-6 rounded-md border border-border" aria-hidden="true" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-xs text-foreground">
                  {dbMeta?.database_name ?? "No database"}
                </span>
                <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                  Analyzing {dbMeta ? getVendor(dbMeta.database_soft).label : "—"}
                </span>
              </span>
            </Link>
          </div>

          {/* search */}
          <div className="relative px-3 pb-2">
            <Search className="pointer-events-none absolute left-5.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="conversation-search" className="sr-only">
              Search conversations
            </label>
            <input
              id="conversation-search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search conversations…"
              autoComplete="off"
              className="h-9 w-full rounded-lg border border-input bg-input/20 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* grouped conversation list */}
          <nav aria-label="Conversations" className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            {conversations.length === 0 ? (
              <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                {query.trim() ? "No conversations match your search." : "No conversations yet. Start your first chat."}
              </p>
            ) : (
              groupOrder.map((group) => {
                const items = conversations.filter((c) => conversationGroup(c.createdAt) === group)
                if (items.length === 0) return null
                return (
                  <section key={group} className="mb-4">
                    <h3 className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
                      {group}
                    </h3>
                    <ul className="flex flex-col gap-0.5">
                      {items.map((c) => {
                        const active = c.id === activeId
                        return (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => onSelect(c.id)}
                              aria-current={active ? "true" : undefined}
                              className={cn(
                                "flex min-h-10 w-full items-center rounded-lg px-2.5 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                active
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                              )}
                            >
                              <span className="truncate">{c.title}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              })
            )}
          </nav>
        </>
      )}
    </div>
  )
}
