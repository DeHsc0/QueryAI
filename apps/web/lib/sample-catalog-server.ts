import type { SampleCatalogEntry } from "./sample-catalog"
import { SAMPLE_CATALOG } from "./sample-catalog-data"

export async function getSampleEntry(id: string): Promise<SampleCatalogEntry | null> {
  return SAMPLE_CATALOG.find((entry) => entry.id === id) ?? null
}

export async function getSampleIds(): Promise<string[]> {
  return SAMPLE_CATALOG.map((entry) => entry.id)
}
