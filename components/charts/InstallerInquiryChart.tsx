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
import { ManualEntry } from '@/types'
import { formatDateShort, formatNumber, axisStyle, gridStyle, chartMargins } from '@/lib/utils'
import { ChartCard } from '@/components/ui/ChartCard'
import { ChartCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface Props {
  entries: ManualEntry[] | null
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

export function InstallerInquiryChart({ entries, loading, error }: Props) {
  if (loading) return <ChartCardSkeleton />

  const chartData = (entries ?? [])
    .slice()
    .reverse()
    .map((e) => ({
      date: formatDateShort(e.entry_date),
      Inquiries: e.installer_inquiries,
    }))

  return (
    <ChartCard title="Installer Inquiries">
      {error || chartData.length === 0 ? (
        <EmptyState
          message="No inquiry data"
          detail="Add entries via the Admin panel"
        />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={chartMargins}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="date" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Inquiries" fill="#00E5A0" radius={[2, 2, 0, 0]} isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
