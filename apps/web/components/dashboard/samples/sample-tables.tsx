"use client"

import { useState } from "react"
import { ChevronDown, KeyRound, Link2 } from "lucide-react"
import type { CatalogTable } from "@/lib/sample-catalog"
import { formatCatalogValue, roleLabel, sampleRowColumns } from "@/lib/sample-catalog"
import { cn } from "@/lib/utils"
import { SectionHeading } from "./sample-overview"

/**
 * Schema browser: a clickable index of every table, then one expandable
 * panel per table with its columns, JSONB field groups, and real sample rows.
 */
export function SampleTables({ tables }: { tables: CatalogTable[] }) {
  const [openName, setOpenName] = useState<string | null>(tables[0]?.name ?? null)

  return (
    <section aria-labelledby="sample-tables" className="space-y-4">
      <SectionHeading id="sample-tables" eyebrow="02 · Structure" title="Tables" />
      <p className="max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        {tables.length} tables. Open one to see its columns and a sample of its real rows.
      </p>

      <ul className="overflow-hidden rounded-xl border border-border bg-card">
        {tables.map((table) => {
          const open = openName === table.name
          const panelId = `table-${table.name}`
          return (
            <li key={table.name} className="border-b border-border last:border-0">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenName(open ? null : table.name)}
                className="flex min-h-14 w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[13.5px] font-medium text-foreground">{table.name}</p>
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{table.description}</p>
                </div>
                <span className="hidden shrink-0 rounded bg-muted px-1.5 py-px font-mono text-[10px] uppercase tracking-wide text-muted-foreground sm:inline">
                  {roleLabel(table.role)}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{table.columns.length} cols</span>
                <ChevronDown
                  className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
                  aria-hidden="true"
                />
              </button>

              {open && <TablePanel id={panelId} table={table} />}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function TablePanel({ id, table }: { id: string; table: CatalogTable }) {
  const columns = sampleRowColumns(table.sample_rows)
  const jsonColumns = table.columns.filter((c) => c.json_schema)

  return (
    <div id={id} className="space-y-6 border-t border-border bg-elevated/30 px-4 py-5">
      <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{table.description}</p>

      <div>
        <h3 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Columns</h3>
        <div className="mt-3 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-left text-[12.5px]">
            <caption className="sr-only">Columns of {table.name}</caption>
            <thead>
              <tr className="border-b border-border bg-card">
                <th scope="col" className="px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Name</th>
                <th scope="col" className="px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Type</th>
                <th scope="col" className="px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((column) => (
                <tr key={column.name} className="border-b border-border/70 last:border-0 align-top">
                  <td className="px-3 py-2.5">
                    <span className="flex flex-wrap items-center gap-1.5 font-mono text-foreground">
                      {column.name}
                      {column.is_primary_key && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-primary/15 px-1 text-[9.5px] uppercase text-primary">
                          <KeyRound className="size-2.5" aria-hidden="true" />
                          PK
                        </span>
                      )}
                      {column.foreign_key && (
                        <span
                          className="inline-flex items-center gap-0.5 rounded bg-muted px-1 text-[9.5px] uppercase text-muted-foreground"
                          title={`References ${column.foreign_key.table}.${column.foreign_key.column}`}
                        >
                          <Link2 className="size-2.5" aria-hidden="true" />
                          FK
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px] text-muted-foreground">
                    {column.type}
                    {column.nullable ? "" : " · not null"}
                  </td>
                  <td className="px-3 py-2.5 leading-relaxed text-muted-foreground">
                    {column.description}
                    {column.possible_values && (
                      <span className="mt-1.5 flex flex-wrap gap-1">
                        {column.possible_values.map((v) => (
                          <span key={String(v)} className="rounded bg-muted px-1.5 py-px font-mono text-[10.5px] text-foreground/80">
                            {formatCatalogValue(v)}
                          </span>
                        ))}
                      </span>
                    )}
                    {column.foreign_key && (
                      <span className="mt-1 block font-mono text-[11px] text-muted-foreground/80">
                        → {column.foreign_key.table}.{column.foreign_key.column}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {jsonColumns.map((column) => (
        <div key={column.name}>
          <h3 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            JSONB · <span className="text-foreground/80">{column.name}</span>
          </h3>
          <p className="mt-1 text-[12.5px] text-muted-foreground">{column.description}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {Object.entries(column.json_schema ?? {}).map(([groupKey, group]) => (
              <div key={groupKey} className="rounded-lg border border-border bg-card p-3.5">
                <p className="text-[13px] font-medium text-foreground">{groupKey.replace(/_/g, " ")}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{group.description}</p>
                <ul className="mt-3 space-y-2">
                  {group.fields.map((field) => (
                    <li key={field.name} className="text-[12px] leading-relaxed">
                      <span className="font-mono text-foreground">{field.name}</span>
                      <span className="ml-1.5 font-mono text-[10.5px] text-muted-foreground">{field.type}</span>
                      <span className="block text-muted-foreground">{field.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h3 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          Sample rows{table.sample_rows.length > 0 ? ` · ${table.sample_rows.length}` : ""}
        </h3>
        {table.sample_rows.length === 0 ? (
          <p className="mt-2 text-[12.5px] text-muted-foreground">No sample rows for this table.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-max text-left font-mono text-[11.5px]">
              <caption className="sr-only">Sample rows from {table.name}</caption>
              <thead>
                <tr className="border-b border-border bg-card">
                  {columns.map((c) => (
                    <th key={c} scope="col" className="whitespace-nowrap px-3 py-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.sample_rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/70 last:border-0">
                    {columns.map((c) => {
                      const value = row[c]
                      return (
                        <td
                          key={c}
                          className={cn(
                            "max-w-[16rem] truncate whitespace-nowrap px-3 py-2",
                            value === null || value === undefined ? "text-muted-foreground/60 italic" : "text-foreground/90",
                          )}
                          title={formatCatalogValue(value)}
                        >
                          {formatCatalogValue(value)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
