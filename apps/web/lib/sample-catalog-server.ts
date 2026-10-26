import { readFile } from "node:fs/promises"
import path from "node:path"
import type { SampleCatalogEntry } from "./sample-catalog"

/**
 * Loads the sample catalog from the repo-root data.json (the file the backend
 * sample databases are described by). Only Server Components import this, so
 * the ~356 KB file never reaches the browser bundle.
 *
 * Resolved from the Next app directory, which is apps/web, so the root file is
 * two levels up.
 */

let cache: Promise<SampleCatalogEntry[]> | null = null

function loadCatalog(): Promise<SampleCatalogEntry[]> {
  cache ??= readFile(path.join(process.cwd(), "..", "..", "data.json"), "utf8").then(
    (text) => JSON.parse(text) as SampleCatalogEntry[],
  )
  return cache
}

export async function getSampleEntry(id: string): Promise<SampleCatalogEntry | null> {
  const catalog = await loadCatalog()
  return catalog.find((entry) => entry.id === id) ?? null
}

export async function getSampleIds(): Promise<string[]> {
  const catalog = await loadCatalog()
  return catalog.map((entry) => entry.id)
}
