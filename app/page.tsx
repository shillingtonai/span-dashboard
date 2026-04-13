'use client'

import { useState, useEffect, useCallback } from 'react'
import { DateRange, ApiResponse, GA4Data, GSCData, MetaData, YouTubeData, ManualData } from '@/types'
import { KPICard } from '@/components/ui/KPICard'
import { SocialTrafficChart } from '@/components/charts/SocialTrafficChart'
import { SearchTrendChart } from '@/components/charts/SearchTrendChart'
import { InstagramChart } from '@/components/charts/InstagramChart'
import { YouTubeChart } from '@/components/charts/YouTubeChart'
import { InstallerInquiryChart } from '@/components/charts/InstallerInquiryChart'
import { HearAboutUsChart } from '@/components/charts/HearAboutUsChart'
import { TopContent } from '@/components/sections/TopContent'
import { formatNumber, percentChange } from '@/lib/utils'

type LoadState = 'loading' | 'success' | 'error'

function DateToggle({
  range,
  onChange,
}: {
  range: DateRange
  onChange: (r: DateRange) => void
}) {
  return (
    <div className="flex items-center gap-1 bg-bg-surface border border-border-subtle rounded-badge p-1">
      {(['30', '90'] as DateRange[]).map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-3 py-1.5 text-xs font-mono rounded-[4px] transition-colors ${
            range === r
              ? 'bg-accent-primary text-bg-base font-medium'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {r}d
        </button>
      ))}
    </div>
  )
}

async function fetchAPI<T>(path: string, range: DateRange): Promise<ApiResponse<T>> {
  const res = await fetch(`${path}?range=${range}`, { cache: 'no-store' })
  return res.json()
}

export default function DashboardPage() {
  const [range, setRange] = useState<DateRange>('30')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const [ga4State, setGA4State] = useState<LoadState>('loading')
  const [ga4Data, setGA4Data] = useState<GA4Data | null>(null)

  const [gscState, setGSCState] = useState<LoadState>('loading')
  const [gscData, setGSCData] = useState<GSCData | null>(null)

  const [metaState, setMetaState] = useState<LoadState>('loading')
  const [metaData, setMetaData] = useState<MetaData | null>(null)

  const [ytState, setYTState] = useState<LoadState>('loading')
  const [ytData, setYTData] = useState<YouTubeData | null>(null)

  const [manualState, setManualState] = useState<LoadState>('loading')
  const [manualData, setManualData] = useState<ManualData | null>(null)

  const loadAll = useCallback(async (r: DateRange) => {
    setGA4State('loading')
    setGSCState('loading')
    setMetaState('loading')
    setYTState('loading')
    setManualState('loading')

    const [ga4Res, gscRes, metaRes, ytRes, manualRes] = await Promise.allSettled([
      fetchAPI<GA4Data>('/api/ga4', r),
      fetchAPI<GSCData>('/api/gsc', r),
      fetchAPI<MetaData>('/api/meta', r),
      fetchAPI<YouTubeData>('/api/youtube', r),
      fetchAPI<ManualData>('/api/manual', r),
    ])

    if (ga4Res.status === 'fulfilled' && ga4Res.value.data) {
      setGA4Data(ga4Res.value.data)
      setGA4State('success')
      if (ga4Res.value.lastUpdated) setLastUpdated(ga4Res.value.lastUpdated)
    } else {
      setGA4State('error')
    }

    if (gscRes.status === 'fulfilled' && gscRes.value.data) {
      setGSCData(gscRes.value.data)
      setGSCState('success')
    } else {
      setGSCState('error')
    }

    if (metaRes.status === 'fulfilled' && metaRes.value.data) {
      setMetaData(metaRes.value.data)
      setMetaState('success')
    } else {
      setMetaState('error')
    }

    if (ytRes.status === 'fulfilled' && ytRes.value.data) {
      setYTData(ytRes.value.data)
      setYTState('success')
    } else {
      setYTState('error')
    }

    if (manualRes.status === 'fulfilled' && manualRes.value.data) {
      setManualData(manualRes.value.data)
      setManualState('success')
    } else {
      setManualState('error')
    }
  }, [])

  useEffect(() => {
    loadAll(range)
  }, [range, loadAll])

  const loading = {
    ga4: ga4State === 'loading',
    gsc: gscState === 'loading',
    meta: metaState === 'loading',
    yt: ytState === 'loading',
    manual: manualState === 'loading',
  }

  const error = {
    ga4: ga4State === 'error',
    gsc: gscState === 'error',
    meta: metaState === 'error',
    yt: ytState === 'error',
    manual: manualState === 'error',
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-sans font-semibold text-text-primary">
              Span<span className="text-accent-primary">.io</span> Social ROI
            </h1>
            {lastUpdated && (
              <p className="text-xs text-text-muted font-mono mt-0.5">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <DateToggle range={range} onChange={setRange} />
            <a
              href="/admin"
              className="text-xs text-text-muted hover:text-text-primary transition-colors border border-border-subtle rounded-badge px-3 py-1.5"
            >
              Admin
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <section>
          <p className="text-xs uppercase tracking-widest text-text-muted mb-4">Key Metrics</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              label="Social Sessions"
              value={ga4Data?.totalSessions ?? 0}
              prevValue={ga4Data?.totalSessionsPrev ?? 0}
              loading={loading.ga4}
              error={error.ga4}
            />
            <KPICard
              label="Installer Page Views"
              value={ga4Data?.installerPageViews ?? 0}
              prevValue={ga4Data?.installerPageViewsPrev ?? 0}
              loading={loading.ga4}
              error={error.ga4}
            />
            <KPICard
              label="Branded Searches"
              value={gscData?.totalClicks ?? 0}
              prevValue={gscData?.totalClicksPrev ?? 0}
              loading={loading.gsc}
              error={error.gsc}
            />
            <KPICard
              label="IG Total Reach"
              value={metaData?.totalReach ?? 0}
              loading={loading.meta}
              error={error.meta}
            />
            <KPICard
              label="IG Followers"
              value={metaData?.followerCount ?? 0}
              loading={loading.meta}
              error={error.meta}
            />
            <KPICard
              label="Avg. Engagement Rate"
              value={metaData?.avgEngagementRate ?? 0}
              format="percent"
              loading={loading.meta}
              error={error.meta}
            />
            <KPICard
              label="YouTube Views"
              value={ytData?.totalViews ?? 0}
              prevValue={ytData?.totalViewsPrev ?? 0}
              loading={loading.yt}
              error={error.yt}
            />
            <KPICard
              label="YouTube Subscribers"
              value={ytData?.subscriberCount ?? 0}
              loading={loading.yt}
              error={error.yt}
            />
            <KPICard
              label="Installer Inquiries"
              value={manualData?.totalInquiries ?? 0}
              prevValue={manualData?.totalInquiriesPrev ?? 0}
              loading={loading.manual}
              error={error.manual}
            />
          </div>
        </section>

        {/* Charts Row 1 — 60/40 */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <SocialTrafficChart
              data={ga4Data?.socialTraffic ?? null}
              loading={loading.ga4}
              error={error.ga4}
            />
          </div>
          <div className="lg:col-span-2">
            <SearchTrendChart
              data={gscData?.brandedSearches ?? null}
              loading={loading.gsc}
              error={error.gsc}
            />
          </div>
        </section>

        {/* Charts Row 2 — 50/50 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InstagramChart
            igData={metaData?.igInsights ?? null}
            loading={loading.meta}
            error={error.meta}
          />
          <YouTubeChart
            data={ytData?.dailyStats ?? null}
            loading={loading.yt}
            error={error.yt}
          />
        </section>

        {/* Charts Row 3 — 50/50 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InstallerInquiryChart
            entries={manualData?.entries ?? null}
            loading={loading.manual}
            error={error.manual}
          />
          <HearAboutUsChart
            data={manualData}
            loading={loading.manual}
            error={error.manual}
          />
        </section>

        {/* Top Content */}
        <section>
          <p className="text-xs uppercase tracking-widest text-text-muted mb-4">Top Content</p>
          <TopContent
            topPosts={metaData?.topPosts ?? null}
            topVideos={ytData?.topVideos ?? null}
            postsLoading={loading.meta}
            videosLoading={loading.yt}
            postsError={error.meta}
            videosError={error.yt}
          />
        </section>
      </main>

      <footer className="border-t border-border-subtle mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-xs text-text-muted font-mono">Span.io Social ROI Dashboard</p>
        </div>
      </footer>
    </div>
  )
}
