"use client"

import { useId, useState } from "react"
import type { DatabaseType } from "@/lib/types"
import { cn } from "@/lib/utils"

const SQL_KEYWORDS = new Set([
  "SELECT", "FROM", "JOIN", "ON", "WHERE", "GROUP", "BY", "ORDER",
  "LIMIT", "AS", "AND", "OR", "DESC", "ASC", "INTERVAL", "DISTINCT",
])
const SQL_FUNCTIONS = new Set([
  "COUNT", "SUM", "MAX", "AVG", "MIN",
  "DATE_SUB", "CURDATE", "DATE_TRUNC", "NOW",
])

/** One SQL line with token coloring, shared by the demo and the setup guide. */
export function SqlLine({ line }: { line: string }) {
  const tokens = line.split(/(\s+|[(),;])/)
  return (
    <span className="whitespace-pre text-[12.5px] leading-6">
      {tokens.map((token, i) => {
        if (!token.trim()) return token
        if (/^'[^']*'$/.test(token)) return <span key={i} className="sql-str">{token}</span>
        if (/^-?\d+/.test(token)) return <span key={i} className="sql-num">{token}</span>
        const upper = token.toUpperCase()
        if (SQL_FUNCTIONS.has(upper)) return <span key={i} className="sql-fn">{token}</span>
        if (SQL_KEYWORDS.has(upper)) return <span key={i} className="sql-kw">{token}</span>
        return <span key={i} className="sql-id">{token}</span>
      })}
    </span>
  )
}

/** A complete SQL command with the same coloring, one row per line. */
export function SqlCode({ command }: { command: string }) {
  return (
    <>
      {command.split("\n").map((line, i) => (
        <div key={i}>
          <SqlLine line={line} />
        </div>
      ))}
    </>
  )
}

/* ── Vendor icon: the official vendor mark, with a drawn cylinder fallback ── */

const vendorPalettes: Record<DatabaseType, { top: string; body: string; ridge: string }> = {
  postgresql: { top: "oklch(0.87 0.10 167)", body: "oklch(0.62 0.12 167)", ridge: "oklch(0.50 0.10 167)" },
  mysql: { top: "oklch(0.88 0.10 80)", body: "oklch(0.68 0.13 75)", ridge: "oklch(0.55 0.11 75)" },
  oracle: { top: "oklch(0.83 0.08 295)", body: "oklch(0.62 0.10 295)", ridge: "oklch(0.50 0.09 295)" },
  microsoft: { top: "oklch(0.82 0.09 245)", body: "oklch(0.62 0.12 245)", ridge: "oklch(0.50 0.10 245)" },
}

/** Official brand marks (CC0 simple-icons set, brand colors) served by Iconify. */
const brandIconUris: Record<DatabaseType, string> = {
  postgresql: "https://api.iconify.design/simple-icons/postgresql.svg?color=%234169E1&width=48&height=48",
  mysql: "https://api.iconify.design/simple-icons/mysql.svg?color=%234479A1&width=48&height=48",
  oracle: "https://api.iconify.design/simple-icons/oracle.svg?color=%23F80000&width=48&height=48",
  microsoft: "https://api.iconify.design/simple-icons/microsoftsqlserver.svg?color=%23CC2927&width=48&height=48",
}

export function VendorIcon({ vendor, className }: { vendor: DatabaseType; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <CylinderIcon vendor={vendor} className={className} />
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brandIconUris[vendor]}
      alt=""
      draggable={false}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-contain", className)}
    />
  )
}

function CylinderIcon({ vendor, className }: { vendor: DatabaseType; className?: string }) {
  const uid = useId()
  const palette = vendorPalettes[vendor]
  return (
    <span aria-hidden="true" className={className}>
      <svg viewBox="0 0 24 26" className="h-full w-full">
        <defs>
          <linearGradient id={`${uid}-body`} x1="4" y1="0" x2="20" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={palette.ridge} />
            <stop offset="0.5" stopColor={palette.body} />
            <stop offset="1" stopColor={palette.ridge} />
          </linearGradient>
        </defs>
        {/* body */}
        <path
          d="M4 7 C4 9 8 10 12 10 C16 10 20 9 20 7 V18 C20 20 16 21.4 12 21.4 C8 21.4 4 20 4 18 Z"
          fill={`url(#${uid}-body)`}
        />
        {/* ridges */}
        <path
          d="M4 11.5 C4 13.3 8 14.3 12 14.3 C16 14.3 20 13.3 20 11.5"
          fill="none"
          stroke={palette.top}
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <path
          d="M4 15.4 C4 17.2 8 18.2 12 18.2 C16 18.2 20 17.2 20 15.4"
          fill="none"
          stroke={palette.top}
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        {/* top disk */}
        <ellipse cx="12" cy="7" rx="8" ry="3" fill={palette.top} />
        <ellipse cx="12" cy="7" rx="5" ry="1.7" fill={palette.ridge} fillOpacity="0.7" />
      </svg>
    </span>
  )
}
