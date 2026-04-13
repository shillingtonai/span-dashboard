'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { GSCDay } from '@/types'
import { formatDateShort, formatNumber, axisStyle, gridStyle, chartMargins } from '@/lib/utils'
import { ChartCard } from '@/components/ui/ChartCard'
import { ChartCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface Props {
  data: GSCDay[] | null
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

export function SearchTrendChart({ data, loading, error }: Props) {
  if (loading) return <ChartCardSkeleton height={220} />

  const chartData = (data ?? []).map((d) => ({
    date: formatDateShort(d.date),
    Clicks: d.clicks,
    Impressions: d.impressions,
  }))

  return (
    <ChartCard title="Branded Search Trends">
      {error || chartData.length === 0 ? (
        <EmptyState message="No search data" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={chartMargins}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="date" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: 'DM Mono', color: '#6B7280' }}
            />
            <Line
              type="monotone"
              dataKey="Clicks"
              stroke="#00E5A0"
              strokeWidth={2}
              dot={false}
              isAnimationActive
            />
            <Line
              type="monotone"
              dataKey="Impressions"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
