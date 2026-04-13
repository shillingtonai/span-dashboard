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
import { GA4SocialTrafficDay } from '@/types'
import { formatDateShort, formatNumber, axisStyle, gridStyle, chartMargins } from '@/lib/utils'
import { ChartCard } from '@/components/ui/ChartCard'
import { ChartCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface Props {
  data: GA4SocialTrafficDay[] | null
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

function aggregateByDate(data: GA4SocialTrafficDay[]) {
  const map = new Map<string, number>()
  for (const row of data) {
    map.set(row.date, (map.get(row.date) ?? 0) + row.sessions)
  }
  return Array.from(map.entries())
    .map(([date, sessions]) => ({ date: formatDateShort(date), sessions }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function SocialTrafficChart({ data, loading, error }: Props) {
  if (loading) return <ChartCardSkeleton height={280} />

  const chartData = data ? aggregateByDate(data) : []

  return (
    <ChartCard title="Social Referral Traffic" className="h-full">
      {error || chartData.length === 0 ? (
        <EmptyState message="No social traffic data" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={chartMargins}>
            <defs>
              <linearGradient id="socialGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5A0" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#00E5A0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="date" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="sessions"
              name="Sessions"
              stroke="#00E5A0"
              strokeWidth={2}
              fill="url(#socialGrad)"
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
