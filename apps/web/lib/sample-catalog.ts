/**
 * Shape of one entry in the sample database catalog (lib/sample-catalog-data.ts,
 * hardcoded from the root data.json). Client components receive a single entry
 * as props, so the full catalog never ships to the browser.
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
  possible_values?: CatalogScalar[]
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
  possible_values?: CatalogScalar[]
  is_unique?: boolean
  note?: string
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

export interface CatalogKnowledgeEntry {
  id: number
  name: string
  kind: string
  description: string
  formula?: string
  rule?: string
  depends_on: { id: number; name: string }[]
}

export interface CatalogSampleQuestion {
  question: string
  type: string
  uses_knowledge: string[]
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
  knowledge_base?: CatalogKnowledgeEntry[]
  data_quirks?: string[]
  sample_questions?: CatalogSampleQuestion[]
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
