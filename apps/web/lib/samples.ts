/**
 * Built-in sample databases. Ids match the backend SAMPLE_DB keys
 * (apps/backend/lib/helpers.py) and the entries in the root data.json.
 * Suggested questions are not duplicated here: they come from the backend
 * via GET /api/conversation/{db_id} once a sample is registered.
 */

export interface SampleDatabase {
  id: string
  name: string
  domain: string
  engine: string
  tableCount: number
}

export const SAMPLE_DATABASES: readonly SampleDatabase[] = [
  {
    id: "solar_panel",
    name: "Solar Panel Plants",
    domain: "Renewable energy / solar PV operations & maintenance",
    engine: "PostgreSQL",
    tableCount: 10,
  },
  {
    id: "polar_equipment",
    name: "Polar Station Equipment",
    domain: "Polar research infrastructure / remote equipment operations",
    engine: "PostgreSQL",
    tableCount: 16,
  },
  {
    id: "museum_artifact",
    name: "Museum Artifact Conservation",
    domain: "Museum collections care / preventive conservation",
    engine: "PostgreSQL",
    tableCount: 15,
  },
  {
    id: "archeology_scan",
    name: "Archaeological 3D Scanning",
    domain: "Archaeology / 3D site documentation and heritage conservation",
    engine: "PostgreSQL",
    tableCount: 14,
  },
  {
    id: "households",
    name: "Household Socioeconomic Survey",
    domain: "Demographics / household socioeconomics and housing (Brazil)",
    engine: "PostgreSQL",
    tableCount: 7,
  },
]

const SAMPLE_IDS = new Set(SAMPLE_DATABASES.map((s) => s.id))

/** A registered database is a sample when its name is a sample id (the backend registers samples under that name). */
export function isSampleDatabase(databaseName: string): boolean {
  return SAMPLE_IDS.has(databaseName)
}
