import { MetaData, MetaInsightDay, MetaPost, DateRange } from '@/types'
import { getDateRanges } from './utils'

const BASE = 'https://graph.facebook.com/v19.0'

function token() {
  const t = process.env.META_ACCESS_TOKEN
  if (!t) throw new Error('META_ACCESS_TOKEN not set')
  return t
}

async function graphFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('access_token', token())
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Meta API ${path} error ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export async function fetchMetaData(range: DateRange): Promise<MetaData> {
  const igId = process.env.META_IG_ACCOUNT_ID
  const fbId = process.env.META_PAGE_ID
  if (!igId) throw new Error('META_IG_ACCOUNT_ID not set')
  if (!fbId) throw new Error('META_PAGE_ID not set')

  const { startDate, endDate } = getDateRanges(range)
  const since = Math.floor(new Date(startDate).getTime() / 1000).toString()
  const until = Math.floor(new Date(endDate + 'T23:59:59').getTime() / 1000).toString()

  const [igInsightsResp, igFollowersResp, fbInsightsResp, igPostsResp] = await Promise.all([
    graphFetch<{ data: { name: string; values: { value: number; end_time: string }[] }[] }>(
      `/${igId}/insights`,
      {
        metric: 'reach,impressions',
        period: 'day',
        since,
        until,
      }
    ),
    graphFetch<{ followers_count: number; name: string }>(`/${igId}`, {
      fields: 'followers_count,name',
    }),
    graphFetch<{ data: { name: string; values: { value: number; end_time: string }[] }[] }>(
      `/${fbId}/insights`,
      {
        metric: 'page_impressions,page_reach',
        period: 'day',
        since,
        until,
      }
    ),
    graphFetch<{
      data: {
        id: string
        caption?: string
        timestamp: string
        like_count: number
        comments_count: number
        media_url?: string
        insights?: { data: { name: string; values: { value: number }[] }[] }
      }[]
    }>(`/${igId}/media`, {
      fields:
        'id,caption,timestamp,like_count,comments_count,media_url,insights.metric(reach,impressions)',
      limit: '20',
    }),
  ])

  const reachMetric = igInsightsResp.data.find((m) => m.name === 'reach')
  const impressionsMetric = igInsightsResp.data.find((m) => m.name === 'impressions')

  const igInsights: MetaInsightDay[] = (reachMetric?.values ?? []).map((v, i) => ({
    date: v.end_time.split('T')[0],
    reach: v.value,
    impressions: impressionsMetric?.values[i]?.value ?? 0,
  }))

  const fbReachMetric = fbInsightsResp.data.find((m) => m.name === 'page_reach')
  const fbImpressionsMetric = fbInsightsResp.data.find((m) => m.name === 'page_impressions')

  const fbInsights: MetaInsightDay[] = (fbReachMetric?.values ?? []).map((v, i) => ({
    date: v.end_time.split('T')[0],
    reach: v.value,
    impressions: fbImpressionsMetric?.values[i]?.value ?? 0,
  }))

  const topPosts: MetaPost[] = igPostsResp.data
    .map((post) => {
      const postReach =
        post.insights?.data.find((m) => m.name === 'reach')?.values[0]?.value ?? 0
      const postImpressions =
        post.insights?.data.find((m) => m.name === 'impressions')?.values[0]?.value ?? 0
      return {
        id: post.id,
        message: post.caption ?? '',
        createdTime: post.timestamp,
        reach: postReach,
        impressions: postImpressions,
        likes: post.like_count,
        comments: post.comments_count,
        shares: 0,
        mediaUrl: post.media_url,
        platform: 'instagram' as const,
      }
    })
    .sort((a, b) => b.reach - a.reach)
    .slice(0, 10)

  const totalReach = igInsights.reduce((s, d) => s + d.reach, 0)

  const engRates = topPosts
    .filter((p) => p.reach > 0)
    .map((p) => ((p.likes + p.comments) / p.reach) * 100)
  const avgEngagementRate =
    engRates.length > 0 ? engRates.reduce((s, r) => s + r, 0) / engRates.length : 0

  return {
    igInsights,
    fbInsights,
    topPosts,
    followerCount: igFollowersResp.followers_count,
    followerCountPrev: 0,
    avgEngagementRate,
    avgEngagementRatePrev: 0,
    totalReach,
    totalReachPrev: 0,
  }
}
