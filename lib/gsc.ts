import { google } from 'googleapis'
import { GSCData, GSCDay, DateRange } from '@/types'
import { getDateRanges } from './utils'

function getAuth() {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GA4_SERVICE_ACCOUNT_JSON not set')
  const credentials = JSON.parse(raw)
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
}

export async function fetchGSCData(range: DateRange): Promise<GSCData> {
  const auth = getAuth()
  const searchconsole = google.searchconsole({ version: 'v1', auth })

  const siteUrl = process.env.GSC_SITE_URL
  if (!siteUrl) throw new Error('GSC_SITE_URL not set')
  const brandKeyword = process.env.GSC_BRAND_KEYWORD ?? 'span'

  const { startDate, endDate, prevStartDate, prevEndDate } = getDateRanges(range)

  const [currentResp, prevResp] = await Promise.all([
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date'],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: 'query',
                operator: 'contains',
                expression: brandKeyword,
              },
            ],
          },
        ],
        rowLimit: 500,
      },
    }),
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: prevStartDate,
        endDate: prevEndDate,
        dimensions: ['date'],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: 'query',
                operator: 'contains',
                expression: brandKeyword,
              },
            ],
          },
        ],
        rowLimit: 500,
      },
    }),
  ])

  const brandedSearches: GSCDay[] = (currentResp.data.rows ?? []).map((row) => ({
    date: row.keys?.[0] ?? '',
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: (row.ctr ?? 0) * 100,
    position: row.position ?? 0,
  }))

  const totalClicks = brandedSearches.reduce((s, d) => s + d.clicks, 0)
  const totalImpressions = brandedSearches.reduce((s, d) => s + d.impressions, 0)

  const prevRows = prevResp.data.rows ?? []
  const totalClicksPrev = prevRows.reduce((s, r) => s + (r.clicks ?? 0), 0)
  const totalImpressionsPrev = prevRows.reduce((s, r) => s + (r.impressions ?? 0), 0)

  return {
    brandedSearches,
    totalClicks,
    totalClicksPrev,
    totalImpressions,
    totalImpressionsPrev,
  }
}
