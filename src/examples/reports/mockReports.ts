/*
 * Mock domain data for the Reports example page.
 *
 * This file deliberately lives next to the page (not under src/components/**)
 * because it is page-local sample data, not a reusable library primitive.
 * Rows are generated from a seeded PRNG so the table is stable across HMR
 * reloads and screenshots while still looking varied.
 */
import type { BadgeVariant } from '@/components/atoms/Badge'

export type ReportStatus = 'Draft' | 'In review' | 'Approved' | 'Rejected' | 'Archived'
export type ReportPriority = 'Low' | 'Medium' | 'High' | 'Urgent'
export type ReportChannel = 'Email' | 'Web' | 'Mobile' | 'Partner API' | 'In-store'

export interface ReportRow {
  id: string
  name: string
  client: string
  channel: ReportChannel
  status: ReportStatus
  priority: ReportPriority
  amount: number
  /** ISO `YYYY-MM-DD`; string ordering matches date ordering. */
  due: string
}

export const REPORT_STATUSES: ReportStatus[] = [
  'Draft',
  'In review',
  'Approved',
  'Rejected',
  'Archived',
]

export const REPORT_CHANNELS: ReportChannel[] = [
  'Email',
  'Web',
  'Mobile',
  'Partner API',
  'In-store',
]

/** Badge variant used to render each status in the table and filters. */
export const statusMeta: Record<ReportStatus, { variant: BadgeVariant }> = {
  Draft: { variant: 'neutral' },
  'In review': { variant: 'warning' },
  Approved: { variant: 'positive' },
  Rejected: { variant: 'negative' },
  Archived: { variant: 'info' },
}

/** Badge variant used to render each priority in the table. */
export const priorityMeta: Record<ReportPriority, { variant: BadgeVariant }> = {
  Low: { variant: 'neutral' },
  Medium: { variant: 'info' },
  High: { variant: 'warning' },
  Urgent: { variant: 'negative' },
}

const CLIENTS = [
  'Northwind',
  'Contoso',
  'Fabrikam',
  'Adventure Works',
  'Litware',
  'Proseware',
  'Tailspin',
  'Wide World',
  'Lucerne',
  'Trey Research',
  'Rockwood',
  'Blue Yonder',
]

const SUBJECTS = [
  'Revenue',
  'Churn',
  'Acquisition',
  'Engagement',
  'Retention',
  'Conversion',
  'Pipeline',
  'Satisfaction',
  'Utilization',
  'Backlog',
  'Forecast',
  'Inventory',
  'Payments',
  'Support volume',
  'Onboarding',
  'Compliance',
  'Latency',
  'Adoption',
  'Fraud',
  'Refunds',
  'Campaign ROI',
  'Subscriptions',
  'Coverage',
  'Turnaround',
  'Profitability',
  'Headcount',
]

/** Small deterministic LCG so generated rows never shuffle between renders. */
function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function pickStatus(value: number): ReportStatus {
  if (value < 0.34) return 'Draft'
  if (value < 0.62) return 'In review'
  if (value < 0.82) return 'Approved'
  if (value < 0.92) return 'Rejected'
  return 'Archived'
}

function pickPriority(value: number): ReportPriority {
  if (value < 0.3) return 'Low'
  if (value < 0.7) return 'Medium'
  if (value < 0.9) return 'High'
  return 'Urgent'
}

/** Builds the 26 mock rows the table renders. */
export function createReportRows(): ReportRow[] {
  const rng = createRng(20260925)
  const baseDue = Date.UTC(2026, 8, 1)
  return SUBJECTS.map((subject, index) => {
    const amount = Math.round((rng() * 240_000 + 1_200) / 100) * 100
    const dueOffset = Math.floor(rng() * 110)
    return {
      id: `RPT-${1000 + index}`,
      name: `${subject} report`,
      client: CLIENTS[index % CLIENTS.length] ?? 'Northwind',
      channel: REPORT_CHANNELS[Math.floor(rng() * REPORT_CHANNELS.length)] ?? 'Web',
      status: pickStatus(rng()),
      priority: pickPriority(rng()),
      amount,
      due: new Date(baseDue + dueOffset * 86_400_000).toISOString().slice(0, 10),
    }
  })
}

/** Local-time `Date` → ISO `YYYY-MM-DD` (no UTC shift). */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** ISO `YYYY-MM-DD` → human label, e.g. `05 Sep 2026`. */
export function formatReportDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  const date = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** Whole-dollar USD formatting for the amount column. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
