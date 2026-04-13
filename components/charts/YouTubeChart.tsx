'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { YouTubeDay } from '@/types'
import { formatDateShort, formatNumber, axisStyle, gridStyle, chartMargins } from '@/lib/utils'
import { ChartCard } from '@/components/ui/ChartCard'
import { ChartCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface Props {
  data: YouTubeDay[] | null
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

export function YouTubeChart({ data, loading, error }: Props) {
  if (loading) return <ChartCardSkeleton />

  const chartData = (data ?? []).map((d) => ({
    date: formatDateShort(d.date),
    Views: d.views,
  }))

  return (
    <ChartCard title="YouTube Views">
      {error || chartData.length === 0 ? (
        <EmptyState message="No YouTube data" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={chartMargins}>
            <defs>
              <linearGradient id="ytGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="date" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Views"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#ytGrad)"
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
