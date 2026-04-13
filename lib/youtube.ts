import { YouTubeData, YouTubeDay, YouTubeVideo, DateRange } from '@/types'
import { getDateRanges } from './utils'

const YT_BASE = 'https://www.googleapis.com/youtube/v3'

function apiKey() {
  const k = process.env.YOUTUBE_API_KEY
  if (!k) throw new Error('YOUTUBE_API_KEY not set')
  return k
}

function channelId() {
  const id = process.env.YOUTUBE_CHANNEL_ID
  if (!id) throw new Error('YOUTUBE_CHANNEL_ID not set')
  return id
}

async function ytFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${YT_BASE}${path}`)
  url.searchParams.set('key', apiKey())
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`YouTube API ${path} error ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export async function fetchYouTubeData(range: DateRange): Promise<YouTubeData> {
  const { startDate, endDate } = getDateRanges(range)
  const channel = channelId()

  const [channelResp, searchResp] = await Promise.all([
    ytFetch<{
      items: {
        id: string
        statistics: {
          viewCount: string
          subscriberCount: string
          videoCount: string
        }
      }[]
    }>('/channels', {
      part: 'statistics',
      id: channel,
    }),
    ytFetch<{
      items: {
        id: { videoId: string }
        snippet: { publishedAt: string; title: string }
      }[]
    }>('/search', {
      part: 'snippet',
      channelId: channel,
      maxResults: '20',
      order: 'date',
      type: 'video',
      publishedAfter: `${startDate}T00:00:00Z`,
      publishedBefore: `${endDate}T23:59:59Z`,
    }),
  ])

  const channelStats = channelResp.items[0]?.statistics
  const subscriberCount = parseInt(channelStats?.subscriberCount ?? '0', 10)

  const videoIds = searchResp.items.map((i) => i.id.videoId).filter(Boolean)

  let topVideos: YouTubeVideo[] = []
  let totalViews = 0

  if (videoIds.length > 0) {
    const videoDetailsResp = await ytFetch<{
      items: {
        id: string
        snippet: { title: string; publishedAt: string; thumbnails: { medium: { url: string } } }
        statistics: { viewCount: string; likeCount: string; commentCount: string }
      }[]
    }>('/videos', {
      part: 'snippet,statistics',
      id: videoIds.join(','),
    })

    topVideos = videoDetailsResp.items
      .map((v) => ({
        id: v.id,
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt,
        views: parseInt(v.statistics.viewCount ?? '0', 10),
        likes: parseInt(v.statistics.likeCount ?? '0', 10),
        comments: parseInt(v.statistics.commentCount ?? '0', 10),
        thumbnailUrl: v.snippet.thumbnails.medium.url,
        watchTimeMinutes: 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    totalViews = topVideos.reduce((s, v) => s + v.views, 0)
  }

  const days = parseInt(range, 10)
  const avgViewsPerDay = videoIds.length > 0 ? Math.round(totalViews / days) : 0
  const dailyStats: YouTubeDay[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    return {
      date: d.toISOString().split('T')[0],
      views: avgViewsPerDay,
      watchTimeMinutes: 0,
    }
  })

  return {
    dailyStats,
    topVideos,
    totalViews,
    totalViewsPrev: 0,
    totalWatchTimeMinutes: 0,
    totalWatchTimeMinutesPrev: 0,
    subscriberCount,
    subscriberCountPrev: 0,
  }
}
