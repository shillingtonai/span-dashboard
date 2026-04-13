'use client'

import { KPICardProps } from '@/types'
import {
  formatNumber,
  formatPercent,
  formatDuration,
  percentChange,
} from '@/lib/utils'
import { KPICardSkeleton } from './LoadingSkeleton'
import { EmptyState } from './EmptyState'

function TrendBadge({ pct }: { pct: number }) {
  const isUp = pct > 0
  const isDown = pct < 0
  const color = isUp ? 'text-status-up' : isDown ? 'text-status-down' : 'text-text-muted'
  const bg = isUp
    ? 'bg-[rgba(0,229,160,0.12)]'
    : isDown
    ? 'bg-[rgba(239,68,68,0.12)]'
    : 'bg-border-subtle'
  const arrow = isUp ? '↑' : isDown ? '↓' : '→'

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-badge text-xs font-mono ${color} ${bg} transition-transform hover:scale-[1.02]`}
    >
      {arrow} {Math.abs(pct).toFixed(1)}%
    </span>
  )
}

function formatValue(
  value: number | string,
  format: KPICardProps['format']
): string {
  if (typeof value === 'string') return value
  switch (format) {
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'duration':
      return formatDuration(value)
    default:
      return formatNumber(value)
  }
}

export function KPICard({
  label,
  value,
  prevValue,
  unit,
  format = 'number',
  loading,
  error,
}: KPICardProps) {
  if (loading) return <KPICardSkeleton />
  if (error || value === null || value === undefined) {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-card p-6">
        <p className="text-xs uppercase tracking-wider text-text-muted mb-3">{label}</p>
        <EmptyState message="Data unavailable" detail="API error" />
      </div>
    )
  }

  const pct =
    typeof value === 'number' && prevValue !== undefined
      ? percentChange(value, prevValue)
      : null

  const displayValue = formatValue(value, format)
  const prevDisplay =
    typeof value === 'number' && prevValue !== undefined
      ? formatValue(prevValue, format)
      : null

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-card p-6 hover:border-border-default transition-colors">
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs uppercase tracking-wider text-text-muted font-sans">{label}</p>
        {pct !== null && <TrendBadge pct={pct} />}
      </div>
      <p className="text-3xl font-mono text-text-primary mb-2">
        {displayValue}
        {unit && <span className="text-lg text-text-muted ml-1">{unit}</span>}
      </p>
      {prevDisplay && (
        <p className="text-xs text-text-muted font-mono">
          vs {prevDisplay} last period
        </p>
      )}
    </div>
  )
}
