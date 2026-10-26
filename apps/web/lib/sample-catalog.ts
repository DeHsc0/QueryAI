/**
 * Shape of one entry in the root data.json (the sample database catalog).
 * Only the server page imports the JSON itself; client components receive a
 * single entry as props, so the full catalog never ships to the browser.
 */

export type CatalogScalar = string | number | boolean | null

export interface CatalogSource {
  benchmark: string
  dataset_url: string
  folder: string
  paper: string
  license: string
  attribution: string
}

export interface CatalogStats {
  table_count: number
  jsonb_column_count: number
  knowledge_entry_count?: number
  row_counts_note?: string
}

export interface CatalogJsonField {
  name: string
  type: string
  description: string
  example?: CatalogScalar
  possible_values?: string[]
}

export interface CatalogJsonGroup {
  description: string
  fields: CatalogJsonField[]
}

export interface CatalogColumn {
  name: string
  type: string
  description: string
  nullable: boolean
  is_primary_key: boolean
  foreign_key: { table: string; column: string } | null
  example?: CatalogScalar
  possible_values?: string[]
  json_schema?: Record<string, CatalogJsonGroup>
}

export interface CatalogForeignKey {
  column: string
  references: { table: string; column: string }
}

export interface CatalogTable {
  name: string
  role: string
  description: string
  primary_key: string[]
  columns: CatalogColumn[]
  sample_rows: Record<string, unknown>[]
  row_count: number | null
  foreign_keys: CatalogForeignKey[]
}

export interface CatalogRelationship {
  from: string
  to: string
  type: string
  meaning: string
}

export interface SampleCatalogEntry {
  id: string
  name: string
  domain: string
  description: string
  engine: string
  source: CatalogSource
  stats: CatalogStats
  what_you_can_ask: string[]
  tables: CatalogTable[]
  relationships: CatalogRelationship[]
}

/** Renders any sample cell value as readable text. */
export function formatCatalogValue(value: unknown): string {
  if (value === null || value === undefined) return "null"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

/** Human label for a table role such as "snapshot hub". */
export function roleLabel(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

/** Union of keys across sample rows, in first-seen order, so ragged rows still render. */
export function sampleRowColumns(rows: Record<string, unknown>[]): string[] {
  const seen = new Set<string>()
  for (const row of rows) for (const key of Object.keys(row)) seen.add(key)
  return [...seen]
}
