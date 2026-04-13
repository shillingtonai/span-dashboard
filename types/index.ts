// ── Date Range ────────────────────────────────────────────────────────────────
export type DateRange = '30' | '90'

// ── GA4 ───────────────────────────────────────────────────────────────────────
export interface GA4SocialTrafficDay {
  date: string // ISO e.g. "2024-03-01"
  sessions: number
  source: string
}

export interface GA4Data {
  socialTraffic: GA4SocialTrafficDay[]
  installerPageViews: number
  installerPageViewsPrev: number
  totalSessions: number
  totalSessionsPrev: number
  campaignData: { campaign: string; sessions: number; conversions: number }[]
}

// ── GSC ───────────────────────────────────────────────────────────────────────
export interface GSCDay {
  date: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface GSCData {
  brandedSearches: GSCDay[]
  totalClicks: number
  totalClicksPrev: number
  totalImpressions: number
  totalImpressionsPrev: number
}

// ── Meta ──────────────────────────────────────────────────────────────────────
export interface MetaInsightDay {
  date: string
  reach: number
  impressions: number
  followerCount?: number
}

export interface MetaPost {
  id: string
  message: string
  createdTime: string
  reach: number
  impressions: number
  likes: number
  comments: number
  shares: number
  mediaUrl?: string
  platform: 'instagram' | 'facebook'
}

export interface MetaData {
  igInsights: MetaInsightDay[]
  fbInsights: MetaInsightDay[]
  topPosts: MetaPost[]
  followerCount: number
  followerCountPrev: number
  avgEngagementRate: number
  avgEngagementRatePrev: number
  totalReach: number
  totalReachPrev: number
}

// ── YouTube ───────────────────────────────────────────────────────────────────
export interface YouTubeDay {
  date: string
  views: number
  watchTimeMinutes: number
}

export interface YouTubeVideo {
  id: string
  title: string
  publishedAt: string
  views: number
  likes: number
  comments: number
  thumbnailUrl: string
  watchTimeMinutes: number
}

export interface YouTubeData {
  dailyStats: YouTubeDay[]
  topVideos: YouTubeVideo[]
  totalViews: number
  totalViewsPrev: number
  totalWatchTimeMinutes: number
  totalWatchTimeMinutesPrev: number
  subscriberCount: number
  subscriberCountPrev: number
}

// ── Manual / Postgres ─────────────────────────────────────────────────────────
export interface ManualEntry {
  id: number
  entry_date: string
  installer_inquiries: number
  survey_social: number
  survey_google: number
  survey_word_of_mouth: number
  survey_installer_referral: number
  survey_other: number
  notes: string | null
  created_at: string
}

export interface ManualData {
  entries: ManualEntry[]
  totalInquiries: number
  totalInquiriesPrev: number
  surveyTotals: {
    social: number
    google: number
    wordOfMouth: number
    installerReferral: number
    other: number
  }
}

// ── API Responses ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error?: string
  lastUpdated?: string
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
export interface KPICardProps {
  label: string
  value: number | string
  prevValue?: number
  unit?: string
  format?: 'number' | 'percent' | 'duration' | 'string'
  loading?: boolean
  error?: boolean
}
