"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpDown,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import type { DatabaseSummary, DatabaseType, UpdateDatabaseRequest } from "@/lib/types"
import {
  clearSampleDatabases,
  deleteDatabase,
  listDatabases,
  restoreSampleDatabases,
  updateDatabase,
} from "@/lib/api"
import { getVendor } from "./vendor"
import { FormatDate } from "./format"
import { EmptyDatabases } from "./empty-state"
import { ConnectionPanel } from "./connection-panel"
import { Dialog } from "./dialog"
import { RegisterDatabaseDialog } from "./register-dialog"
import { VendorIcon } from "@/components/shared/sql-code"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type EngineFilter = "all" | DatabaseType
type SortKey = "added-desc" | "added-asc" | "name-asc" | "name-desc"

const vendorFilters: { value: EngineFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "oracle", label: "Oracle" },
  { value: "microsoft", label: "SQL Server" },
]

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "added-desc", label: "Newest first" },
  { value: "added-asc", label: "Oldest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
]

const PANEL_DISMISS_KEY = "qai_panel_dismissed"

/**
 * The workspace: header, toolbar, resource list, and a dismissible context
 * panel. Every figure on the page derives from the returned data.
 */
export function DatabaseOverview() {
  const [databases, setDatabases] = useState<DatabaseSummary[] | null>(null)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState("")
  const [engine, setEngine] = useState<EngineFilter>("all")
  const [sort, setSort] = useState<SortKey>("added-desc")
  const [editing, setEditing] = useState<DatabaseSummary | null>(null)
  const [deleting, setDeleting] = useState<DatabaseSummary | null>(null)
  const [panelDismissed, setPanelDismissed] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  const load = useCallback(async () => {
    setError(false)
    setDatabases(null)
    try {
      setDatabases(await listDatabases())
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    // deferred so the simulated fetch never runs as a synchronous effect body
    const t = setTimeout(() => {
      load()
    }, 0)
    return () => clearTimeout(t)
  }, [load])

  useEffect(() => {
    const t = setTimeout(() => {
      setPanelDismissed(localStorage.getItem(PANEL_DISMISS_KEY) === "1")
    }, 0)
    return () => clearTimeout(t)
  }, [])

  const dismissPanel = () => {
    setPanelDismissed(true)
    try {
      localStorage.setItem(PANEL_DISMISS_KEY, "1")
    } catch {
      /* non-fatal */
    }
  }

  const stats = useMemo(() => {
    if (!databases) return null
    const byEngine = new Map<DatabaseType, number>()
    let indexed = 0
    for (const db of databases) {
      byEngine.set(db.database_soft, (byEngine.get(db.database_soft) ?? 0) + 1)
      if (db.dense_schema) indexed += 1
    }
    const engines = [...byEngine.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type, n]) => `${getVendor(type).label} ×${n}`)
    return {
      total: databases.length,
      indexed,
      engineSummary: engines.join(" · ") || "None yet",
    }
  }, [databases])

  const visible = useMemo(() => {
    if (!databases) return []
    const q = query.trim().toLowerCase()
    const list = databases.filter((db) => {
      const engineOk = engine === "all" || db.database_soft === engine
      const textOk =
        !q ||
        db.database_name.toLowerCase().includes(q) ||
        (db.description ?? "").toLowerCase().includes(q)
      return engineOk && textOk
    })
    const sorted = [...list]
    sorted.sort((a, b) => {
      switch (sort) {
        case "added-asc":
          return a.created_at.localeCompare(b.created_at)
        case "name-asc":
          return a.database_name.localeCompare(b.database_name)
        case "name-desc":
          return b.database_name.localeCompare(a.database_name)
        case "added-desc":
        default:
          return b.created_at.localeCompare(a.created_at)
      }
    })
    return sorted
  }, [databases, query, engine, sort])

  const filtersActive = query.trim() !== "" || engine !== "all"

  const patchLocal = (updated: DatabaseSummary) => {
    setDatabases((prev) => (prev ? prev.map((db) => (db.id === updated.id ? updated : db)) : prev))
  }

  const removeLocal = (id: string) => {
    setDatabases((prev) => (prev ? prev.filter((db) => db.id !== id) : prev))
  }

  const dev = process.env.NODE_ENV === "development"
  const showPanel = stats !== null && stats.total > 0 && !error && !panelDismissed

  return (
    <div className="pb-4">
      {/* header */}
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        Workspace <span className="text-muted-foreground/70">/</span>{" "}
        <span className="text-accent-bright">Databases</span>
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">Your databases</h1>
        <Button
          size="lg"
          className="h-10 gap-2 rounded-lg px-5 text-sm font-medium"
          onClick={() => setRegisterOpen(true)}
        >
          <Plus className="size-4" aria-hidden="true" />
          Connect database
        </Button>
      </div>
      {stats && stats.total > 0 && (
        <p className="mt-2 font-mono text-[11.5px] text-muted-foreground">
          {stats.total} registered · {stats.engineSummary} · schemas indexed {stats.indexed}/{stats.total}
        </p>
      )}
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Manage the data sources QueryAI can analyze. Connections run with a dedicated
        read-only account and never receive write access.
      </p>

      {/* toolbar */}
      {stats && stats.total > 0 && (
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative sm:w-64">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="db-filter"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or description…"
              aria-label="Filter databases by name or description"
              className="h-9 pl-8.5"
            />
          </div>

          <div role="group" aria-label="Filter by engine" className="flex flex-wrap items-center gap-1.5">
            {vendorFilters.map((f) => {
              const active = engine === f.value
              return (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setEngine(f.value)}
                  className={cn(
                    "min-h-9 rounded-lg border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-accent-bright/50 bg-accent-bright/[0.08] text-foreground"
                      : "border-transparent bg-muted/40 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-1 items-center justify-start gap-2.5 sm:justify-end">
            <label htmlFor="db-sort" className="sr-only">
              Sort databases
            </label>
            <div className="relative">
              <ArrowUpDown
                className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <select
                id="db-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 appearance-none rounded-lg border border-input bg-input/30 pl-8 pr-7 text-xs text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    Sort · {o.label}
                  </option>
                ))}
              </select>
            </div>
            {filtersActive && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setEngine("all")
                }}
                className="min-h-9 rounded-lg px-2 font-mono text-[11px] text-accent-bright transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Clear filters
              </button>
            )}
            <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
              {visible.length} of {stats.total} shown
            </span>
          </div>
        </div>
      )}

      {/* workspace: primary resource list + supporting panel */}
      <div className={cn("mt-5 grid items-start gap-6", showPanel && "lg:grid-cols-[minmax(0,1fr)_340px]")}>
        <div className="min-w-0">
          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-6 text-center" role="alert">
              <p className="text-sm text-foreground">Loading your databases failed.</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                The connection info never reached the UI, so nothing was lost. Nothing is wrong with your data.
              </p>
              <Button variant="outline" className="mt-4" onClick={load}>
                Retry
              </Button>
            </div>
          ) : databases === null ? (
            <LoadingTable />
          ) : databases.length === 0 ? (
            <>
              <EmptyDatabases onConnect={() => setRegisterOpen(true)} />
              {dev && <DevPreview load={load} />}
            </>
          ) : visible.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-5 py-10 text-center">
              <p className="text-sm text-foreground">No databases match this view.</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                No registered database matches the search box or the selected engine.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setQuery("")
                  setEngine("all")
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              {/* desktop — resource table */}
              <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
                <table className="w-full min-w-[720px] text-left">
                  <caption className="sr-only">Registered databases</caption>
                  <thead>
                    <tr className="border-b border-border bg-elevated/40">
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Database
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Engine
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Description
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Added
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((db) => (
                      <DatabaseRow
                        key={db.id}
                        db={db}
                        onEdit={() => setEditing(db)}
                        onDelete={() => setDeleting(db)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* mobile — stacked resource list */}
              <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card md:hidden">
                {visible.map((db) => {
                  const meta = getVendor(db.database_soft)
                  return (
                    <li key={db.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <VendorIcon vendor={db.database_soft} className="size-8 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-mono text-[14px] font-medium text-foreground">{db.database_name}</p>
                            {db.dense_schema && <IndexedChip />}
                          </div>
                          <p className="text-xs text-muted-foreground">{meta.label}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                        {db.description || "No description"}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                        <span className="text-[11px] text-muted-foreground">Added {FormatDate(db.created_at)}</span>
                        <RowActions db={db} onEdit={() => setEditing(db)} onDelete={() => setDeleting(db)} />
                      </div>
                    </li>
                  )
                })}
              </ul>

              {dev && <DevPreview load={load} />}
            </>
          )}
        </div>

        {showPanel && <ConnectionPanel onDismiss={dismissPanel} />}
      </div>

      {editing && (
        <EditDatabaseDialog
          db={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            patchLocal(updated)
            setEditing(null)
          }}
        />
      )}
      {deleting && (
        <DeleteDatabaseDialog
          db={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            removeLocal(deleting.id)
            setDeleting(null)
          }}
        />
      )}
      {registerOpen && (
        <RegisterDatabaseDialog
          onClose={() => setRegisterOpen(false)}
          onRegistered={(created) => {
            setDatabases((prev) => (prev ? [created, ...prev] : [created]))
          }}
        />
      )}
    </div>
  )
}

/* ── header helpers ───────────────────────────────────────────────── */

function IndexedChip() {
  return (
    <span className="rounded border border-accent-bright/30 bg-accent-bright/[0.07] px-1.5 py-px font-mono text-[9.5px] uppercase tracking-wide text-accent-bright">
      Indexed
    </span>
  )
}

/* ── table row + actions ──────────────────────────────────────────── */

function DatabaseRow({
  db,
  onEdit,
  onDelete,
}: {
  db: DatabaseSummary
  onEdit: () => void
  onDelete: () => void
}) {
  const meta = getVendor(db.database_soft)
  return (
    <tr className="border-b border-border/70 transition-colors last:border-0 hover:bg-accent/20">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <VendorIcon vendor={db.database_soft} className="size-8 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-mono text-[13.5px] font-medium text-foreground">
                {db.database_name}
              </p>
              {db.dense_schema && <IndexedChip />}
            </div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">{meta.label}</td>
      <td className="max-w-[22rem] px-4 py-3.5">
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {db.description || "No description"}
        </p>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
        {FormatDate(db.created_at)}
      </td>
      <td className="px-3 py-2.5 text-right">
        <RowActions db={db} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  )
}

function RowActions({
  db,
  onEdit,
  onDelete,
}: {
  db: DatabaseSummary
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-9 gap-1 rounded-lg font-mono text-[11.5px] text-accent-bright hover:bg-accent-bright/10 hover:text-accent-bright"
      >
        <Link href={`/database/${db.id}`} aria-label={`Open ${db.database_name} for analysis`}>
          Analyze
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </Button>
      <button
        type="button"
        onClick={onEdit}
        className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Pencil className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Edit {db.database_name}</span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Delete {db.database_name}</span>
      </button>
    </div>
  )
}

/* ── dialogs ──────────────────────────────────────────────────────── */

function EditDatabaseDialog({
  db,
  onClose,
  onSaved,
}: {
  db: DatabaseSummary
  onClose: () => void
  onSaved: (updated: DatabaseSummary) => void
}) {
  const [name, setName] = useState(db.database_name)
  const [description, setDescription] = useState(db.description ?? "")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!/^[a-z0-9_]+$/.test(name)) {
      setError("Display name: lowercase letters, numbers, and underscores only.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const patch: UpdateDatabaseRequest = {
        database_name: name,
        description: description.trim() || null,
      }
      const updated = await updateDatabase(db.id, patch)
      onSaved(updated)
    } catch {
      setSaving(false)
      setError("Saving failed. Try again.")
    }
  }

  return (
    <Dialog
      open
      onClose={() => {
        if (!saving) onClose()
      }}
      title={`Edit ${db.database_name}`}
      description={`${getVendor(db.database_soft).label} connection. Only the name and description are editable; credentials stay server-side.`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        noValidate
      >
        <label htmlFor="edit-name" className="mb-1.5 block text-[13px] font-medium text-foreground">
          Display name
        </label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="h-10 font-mono"
          aria-invalid={Boolean(error)}
        />
        <label htmlFor="edit-description" className="mb-1.5 mt-4 block text-[13px] font-medium text-foreground">
          Description
        </label>
        <Input
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoComplete="off"
          className="h-10"
        />
        {error && (
          <p className="mt-3 text-[12.5px] leading-relaxed text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="h-9" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="h-9 gap-1.5" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

function DeleteDatabaseDialog({
  db,
  onClose,
  onDeleted,
}: {
  db: DatabaseSummary
  onClose: () => void
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (deleting) return
    setDeleting(true)
    setError(null)
    try {
      await deleteDatabase(db.id)
      onDeleted()
    } catch {
      setDeleting(false)
      setError("Deletion failed. Try again.")
    }
  }

  return (
    <Dialog
      open
      onClose={() => {
        if (!deleting) onClose()
      }}
      title={`Delete ${db.database_name}?`}
    >
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        This removes {db.database_name} ({getVendor(db.database_soft).label}) from your workspace.
        The database itself and your data stay untouched. This can’t be undone from this workspace.
      </p>
      {error && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="h-9" onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="h-9 gap-1.5"
          onClick={submit}
          disabled={deleting}
        >
          {deleting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Deleting…
            </>
          ) : (
            "Delete database"
          )}
        </Button>
      </div>
    </Dialog>
  )
}

/* ── misc ─────────────────────────────────────────────────────────── */

function DevPreview({ load }: { load: () => void }) {
  return (
    <p className="mt-10 flex items-center gap-3 text-[11px] text-muted-foreground">
      <span className="font-mono uppercase tracking-wider">dev preview</span>
      <button
        type="button"
        className="rounded border border-border px-2 py-1 font-mono text-[10px] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => {
          clearSampleDatabases()
          load()
        }}
      >
        empty state
      </button>
      <button
        type="button"
        className="rounded border border-border px-2 py-1 font-mono text-[10px] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => {
          restoreSampleDatabases()
          load()
        }}
      >
        sample data
      </button>
    </p>
  )
}

function LoadingTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card" role="status" aria-live="polite">
      <div className="border-b border-border bg-elevated/40 px-4 py-3">
        <span className="block h-2.5 w-44 animate-pulse rounded bg-muted" aria-hidden="true" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border/70 px-4 py-5 last:border-0">
          <span className="size-8 shrink-0 animate-pulse rounded-lg bg-muted" aria-hidden="true" />
          <span className="block h-3 w-36 animate-pulse rounded bg-muted" aria-hidden="true" />
          <span className="ml-auto hidden h-3 w-24 animate-pulse rounded bg-muted sm:block" aria-hidden="true" />
          <span className="hidden h-3 w-20 animate-pulse rounded bg-muted sm:block" aria-hidden="true" />
        </div>
      ))}
      <p className="sr-only">Loading databases…</p>
    </div>
  )
}
