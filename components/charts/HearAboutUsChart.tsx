'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ManualData } from '@/types'
import { formatNumber, CHART_COLORS } from '@/lib/utils'
import { ChartCard } from '@/components/ui/ChartCard'
import { ChartCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface Props {
  data: ManualData | null
  loading: boolean
  error: boolean
}

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: { name: string; value: number; payload: { color: string } }[]
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-bg-elevated border border-border-default rounded-card p-3 text-sm">
      <p className="font-mono" style={{ color: entry.payload.color }}>
        {entry.name}: {formatNumber(entry.value)}
      </p>
    </div>
  )
}

export function HearAboutUsChart({ data, loading, error }: Props) {
  if (loading) return <ChartCardSkeleton />

  const totals = data?.surveyTotals
  const chartData = totals
    ? [
        { name: 'Social Media', value: totals.social, color: CHART_COLORS[0] },
        { name: 'Google', value: totals.google, color: CHART_COLORS[1] },
        { name: 'Word of Mouth', value: totals.wordOfMouth, color: CHART_COLORS[2] },
        { name: 'Installer Referral', value: totals.installerReferral, color: CHART_COLORS[3] },
        { name: 'Other', value: totals.other, color: CHART_COLORS[4] },
      ].filter((d) => d.value > 0)
    : []

  return (
    <ChartCard title="How Did You Hear About Us">
      {error || chartData.length === 0 ? (
        <EmptyState
          message="No survey data"
          detail="Add survey entries via the Admin panel"
        />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: 'DM Mono', color: '#6B7280' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
