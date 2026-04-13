import { DateRange } from '@/types'

// ── Number Formatting ─────────────────────────────────────────────────────────
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value)
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

// ── Percent Change ─────────────────────────────────────────────────────────────
export function percentChange(current: number, prev: number): number {
  if (prev === 0) return 0
  return ((current - prev) / prev) * 100
}

// ── Date Utilities ────────────────────────────────────────────────────────────
export function formatDateDisplay(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Returns { startDate, endDate, prevStartDate, prevEndDate } as 'YYYY-MM-DD' strings.
 * Current period: last `days` days (yesterday as anchor).
 * Prior period: same length immediately before current.
 */
export function getDateRanges(range: DateRange): {
  startDate: string
  endDate: string
  prevStartDate: string
  prevEndDate: string
} {
  const days = parseInt(range, 10)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDate = new Date(today)
  endDate.setDate(today.getDate() - 1) // yesterday

  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - days + 1)

  const prevEndDate = new Date(startDate)
  prevEndDate.setDate(startDate.getDate() - 1)

  const prevStartDate = new Date(prevEndDate)
  prevStartDate.setDate(prevEndDate.getDate() - days + 1)

  return {
    startDate: toISO(startDate),
    endDate: toISO(endDate),
    prevStartDate: toISO(prevStartDate),
    prevEndDate: toISO(prevEndDate),
  }
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0]
}

// ── Chart Helpers ─────────────────────────────────────────────────────────────
export const CHART_COLORS = ['#00E5A0', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'] as const

export const axisStyle = {
  tick: { fill: '#6B7280', fontSize: 11, fontFamily: 'DM Mono' },
  axisLine: { stroke: '#1E1E2E' },
  tickLine: false as const,
}

export const gridStyle = {
  stroke: '#1E1E2E',
  strokeDasharray: '3 3',
}

export const chartMargins = { top: 5, right: 10, left: -10, bottom: 0 }
