import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { GA4Data, GA4SocialTrafficDay, DateRange } from '@/types'
import { getDateRanges } from './utils'

function getClient() {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GA4_SERVICE_ACCOUNT_JSON not set')
  const credentials = JSON.parse(raw)
  return new BetaAnalyticsDataClient({ credentials })
}

const PROPERTY_ID = () => {
  const id = process.env.GA4_PROPERTY_ID
  if (!id) throw new Error('GA4_PROPERTY_ID not set')
  return id
}

export async function fetchGA4Data(range: DateRange): Promise<GA4Data> {
  const analyticsData = getClient()
  const propertyId = PROPERTY_ID()
  const { startDate, endDate, prevStartDate, prevEndDate } = getDateRanges(range)
  const installerPath = process.env.GA4_INSTALLER_PAGE_PATH ?? '/find-an-installer'

  // Social traffic by day + source
  const [socialResp, installerResp, installerPrevResp, campaignResp] = await Promise.all([
    analyticsData.runReport({
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGrouping' }],
      metrics: [{ name: 'sessions' }],
      dimensionFilter: {
        filter: {
          fieldName: 'sessionDefaultChannelGrouping',
          stringFilter: { value: 'Organic Social', matchType: 'EXACT' },
        },
      },
    }),
    analyticsData.runReport({
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { value: installerPath, matchType: 'EXACT' },
        },
      },
    }),
    analyticsData.runReport({
      property: propertyId,
      dateRanges: [{ startDate: prevStartDate, endDate: prevEndDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { value: installerPath, matchType: 'EXACT' },
        },
      },
    }),
    analyticsData.runReport({
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionCampaignName' }, { name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }, { name: 'conversions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    }),
  ])

  const socialTraffic: GA4SocialTrafficDay[] = (socialResp[0].rows ?? []).map((row) => ({
    date: formatGA4Date(row.dimensionValues?.[0].value ?? ''),
    source: row.dimensionValues?.[1].value ?? '',
    sessions: parseInt(row.metricValues?.[0].value ?? '0', 10),
  }))

  const installerPageViews = parseInt(
    installerResp[0].rows?.[0]?.metricValues?.[0].value ?? '0',
    10
  )
  const installerPageViewsPrev = parseInt(
    installerPrevResp[0].rows?.[0]?.metricValues?.[0].value ?? '0',
    10
  )

  const totalSessions = socialTraffic.reduce((sum, d) => sum + d.sessions, 0)
  const totalSessionsPrev = 0

  const campaignData = (campaignResp[0].rows ?? []).map((row) => ({
    campaign: row.dimensionValues?.[0].value ?? '(not set)',
    sessions: parseInt(row.metricValues?.[0].value ?? '0', 10),
    conversions: parseInt(row.metricValues?.[1].value ?? '0', 10),
  }))

  return {
    socialTraffic,
    installerPageViews,
    installerPageViewsPrev,
    totalSessions,
    totalSessionsPrev,
    campaignData,
  }
}

function formatGA4Date(raw: string): string {
  // GA4 returns dates as YYYYMMDD
  if (raw.length !== 8) return raw
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}
