import type { DatabaseType } from "@/lib/types"

/** Display metadata for the four supported vendors (backend enum: DatabaseTypes). */
export const vendors = [
  { type: "postgresql", label: "PostgreSQL", defaultPort: 5432 },
  { type: "mysql", label: "MySQL", defaultPort: 3306 },
  { type: "oracle", label: "Oracle", defaultPort: 1521 },
  { type: "microsoft", label: "Microsoft SQL Server", defaultPort: 1433 },
] as const satisfies readonly VendorMeta[]

export type VendorMeta = {
  type: DatabaseType
  label: string
  defaultPort: number
}

export function getVendor(type: DatabaseType): VendorMeta {
  return vendors.find((v) => v.type === type) as VendorMeta
}
