/**
 * Deterministic sample data for the landing-page demo workspace.
 *
 * Databases mirror the shape of lib/api.ts mockDatabases (same names and
 * engines). Everything here is local demonstration data — never fetched,
 * never executed, and labeled as a demonstration in the workspace UI.
 */

import type { DatabaseType } from "@/lib/types"

export type DemoViz = "bar" | "line" | "stat"

export interface DemoDb {
  id: string
  name: string
  type: DatabaseType
  typeLabel: string
}

export interface DemoRow {
  label: string
  value: number
  formatted: string
  secondary?: string
}

export interface DemoScenario {
  key: string
  db: DemoDb
  question: string
  plan: string
  schemaTables: string[]
  schemaHint: string
  sql: string[]
  rows: DemoRow[]
  rowCaption: string
  viz: DemoViz
  vizLabel: string
  answer: string
  metric: { value: string; label: string }
  conclusion: string
}

export const demoDbs = [
  { id: "db_02", name: "ecommerce_store", type: "mysql", typeLabel: "MySQL" },
  { id: "db_01", name: "alien_signals", type: "postgresql", typeLabel: "PostgreSQL" },
  { id: "db_03", name: "saas_analytics", type: "postgresql", typeLabel: "PostgreSQL" },
] as const satisfies readonly DemoDb[]

const [ecommDb, signalsDb, saasDb] = demoDbs

export const scenarios: DemoScenario[] = [
  {
    key: "revenue",
    db: ecommDb,
    question: "Which products generated the most revenue this quarter?",
    plan: "Read-only analysis, up to 2 queries",
    schemaTables: ["orders", "products", "customers"],
    schemaHint: "orders → product_id → products.id",
    sql: [
      "SELECT",
      "  p.name AS product,",
      "  SUM(o.total) AS revenue,",
      "  COUNT(*) AS orders",
      "FROM orders o",
      "JOIN products p ON p.id = o.product_id",
      "WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)",
      "GROUP BY p.name",
      "ORDER BY revenue DESC",
      "LIMIT 5;",
    ],
    rows: [
      { label: "Meridian Desk Lamp", value: 4820, formatted: "$4,820", secondary: "96 orders" },
      { label: "Fieldline Backpack", value: 3690, formatted: "$3,690", secondary: "74 orders" },
      { label: "Halden Mug Set", value: 3156, formatted: "$3,156", secondary: "118 orders" },
      { label: "Vantage Desk Mat", value: 2480, formatted: "$2,480", secondary: "63 orders" },
      { label: "Orla Ceramic Vase", value: 1931, formatted: "$1,931", secondary: "41 orders" },
    ],
    rowCaption: "Top 5 of 24 products by quarterly revenue",
    viz: "bar",
    vizLabel: "Revenue per product",
    answer:
      "The Meridian Desk Lamp leads the quarter. Across the top five, revenue concentrates in home-office goods: the desk lamp, backpack, and desk mat together account for the bulk of the range.",
    metric: { value: "$4,820", label: "top product revenue" },
    conclusion:
      "Meridian Desk Lamp leads the quarter at $4,820 across 96 orders, 31% ahead of the Fieldline Backpack.",
  },
  {
    key: "repeat",
    db: ecommDb,
    question: "What share of last month's orders came from repeat customers?",
    plan: "Read-only analysis, up to 2 queries",
    schemaTables: ["orders", "customers"],
    schemaHint: "orders → customer_id → customers.id",
    sql: [
      "SELECT",
      "  COUNT(*) AS repeat_orders,",
      "  COUNT(DISTINCT o.customer_id) AS repeat_customers",
      "FROM orders o",
      "JOIN orders prev ON prev.customer_id = o.customer_id",
      "  AND prev.created_at < DATE_SUB(o.created_at, INTERVAL 1 DAY)",
      "WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH);",
    ],
    rows: [
      { label: "Repeat customers", value: 44, formatted: "44%", secondary: "168 orders" },
      { label: "New customers", value: 56, formatted: "56%", secondary: "214 orders" },
    ],
    rowCaption: "382 orders last month",
    viz: "stat",
    vizLabel: "Order share",
    answer:
      "Repeat customers are close to half of order volume: 168 of last month's 382 orders came from 71 returning customers, at a higher average order value than new buyers.",
    metric: { value: "44%", label: "repeat-customer orders" },
    conclusion:
      "August's orders split 44% repeat vs 56% new; repeat buyers average $61 per order vs $48 for new customers.",
  },
  {
    key: "signals",
    db: signalsDb,
    question: "Which observatory detected the strongest signals?",
    plan: "Read-only analysis, up to 2 queries",
    schemaTables: ["signals", "observatories"],
    schemaHint: "signals → observatory_id → observatories.id",
    sql: [
      "SELECT",
      "  ob.name AS observatory,",
      "  MAX(s.snr_ratio) AS peak_snr,",
      "  COUNT(s.id) AS detections",
      "FROM signals s",
      "JOIN observatories ob ON ob.id = s.observatory_id",
      "GROUP BY ob.name",
      "ORDER BY peak_snr DESC",
      "LIMIT 4;",
    ],
    rows: [
      { label: "Mauna Kea", value: 18.4, formatted: "18.4", secondary: "214 detections" },
      { label: "La Palma", value: 15.2, formatted: "15.2", secondary: "167 detections" },
      { label: "Paranal", value: 12.9, formatted: "12.9", secondary: "189 detections" },
      { label: "Siding Spring", value: 9.6, formatted: "9.6", secondary: "143 detections" },
    ],
    rowCaption: "Peak signal-to-noise ratio per observatory",
    viz: "bar",
    vizLabel: "Peak SNR",
    answer:
      "Mauna Kea logs the strongest detection of the period at SNR 18.4 and also leads raw detection volume, so its lead is not a one-off reading.",
    metric: { value: "18.4", label: "peak SNR, Mauna Kea" },
    conclusion:
      "Mauna Kea holds the strongest signal at SNR 18.4 and tops detection volume with 214 readings.",
  },
  {
    key: "mrr",
    db: saasDb,
    question: "How has MRR trended over the last six months?",
    plan: "Read-only analysis, up to 2 queries",
    schemaTables: ["metrics", "subscriptions"],
    schemaHint: "metrics.recorded_at filtered by name = 'mrr'",
    sql: [
      "SELECT",
      "  DATE_TRUNC('month', recorded_at) AS month,",
      "  value",
      "FROM metrics",
      "WHERE name = 'mrr'",
      "  AND recorded_at >= NOW() - INTERVAL '6 months'",
      "ORDER BY month;",
    ],
    rows: [
      { label: "Apr", value: 28400, formatted: "$28.4k" },
      { label: "May", value: 30100, formatted: "$30.1k" },
      { label: "Jun", value: 31850, formatted: "$31.9k" },
      { label: "Jul", value: 33900, formatted: "$33.9k" },
      { label: "Aug", value: 36100, formatted: "$36.1k" },
      { label: "Sep", value: 38600, formatted: "$38.6k" },
    ],
    rowCaption: "Monthly recurring revenue, Apr – Sep",
    viz: "line",
    vizLabel: "MRR trend",
    answer:
      "MRR grew 38% over six months, from $28.4k in April to $38.6k in September. There is no down month in the series and the curve is close to linear.",
    metric: { value: "+38%", label: "MRR, six months" },
    conclusion:
      "MRR grew 38% in six months, from $28.4k (Apr) to $38.6k (Sep), with no down months in the series.",
  },
]

export const firstScenario = scenarios[0] as DemoScenario
