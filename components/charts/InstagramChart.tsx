'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { MetaInsightDay } from '@/types'
import { formatDateShort, formatNumber, axisStyle, gridStyle, chartMargins } from '@/lib/utils'
import { ChartCard } from '@/components/ui/ChartCard'
import { ChartCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface Props {
  igData: MetaInsightDay[] | null
  loading: boolean
  error: boolean
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated border border-border-default rounded-card p-3 text-sm">
      <p className="text-text-muted mb-2 font-mono text-xs">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-mono" style={{ color: entry.color }}>
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function InstagramChart({ igData, loading, error }: Props) {
  if (loading) return <ChartCardSkeleton />

  const chartData = (igData ?? []).map((d) => ({
    date: formatDateShort(d.date),
    Reach: d.reach,
    Impressions: d.impressions,
  }))

  return (
    <ChartCard title="Instagram Reach & Impressions">
      {error || chartData.length === 0 ? (
        <EmptyState message="No Instagram data" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={chartMargins}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="date" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Reach" fill="#00E5A0" radius={[2, 2, 0, 0]} isAnimationActive />
            <Bar dataKey="Impressions" fill="#3B82F6" radius={[2, 2, 0, 0]} isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
