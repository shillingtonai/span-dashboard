# Span.io Social ROI Dashboard — Claude Instructions

## Project Overview
This is a Next.js 14 social media ROI dashboard for **Span.io**, a smart electrical panel company that sells through third-party installers. Because conversions happen off-platform, this dashboard focuses on **awareness and engagement metrics** as the primary ROI signal, with installer inquiry volume as the closest proxy to conversion data.

Deploy target: **Vercel**

---

## Core Principles

### Always follow these rules:
- All API calls happen **server-side only** — never expose credentials or tokens to the client
- Every data fetch must have a graceful error state — if one source fails, the rest of the dashboard still renders
- Use **loading skeletons** on all data cards while fetching
- All charts use **Recharts** — no other charting library
- All styling uses **Tailwind CSS** — no inline styles, no CSS modules unless absolutely necessary
- The dashboard must be **fully responsive** — works on desktop and tablet (client may present on iPad)

### Never do these things:
- Never log credentials or tokens anywhere
- Never fetch data client-side from third-party APIs
- Never hard-code any IDs, keys, or URLs — everything configurable via `.env`
- Never crash the whole page if one API fails
- Never use placeholder/fake data in production builds — use empty states instead

---

## Design System

Reference `SKILL.md` in this repo for full design guidance. Summary:

**Aesthetic direction: Refined dark dashboard — industrial precision meets clean data visualization**

- **Primary background**: `#0A0A0F` (near black)
- **Surface**: `#13131A` (card backgrounds)
- **Border**: `#1E1E2E` (subtle card borders)
- **Accent**: `#00E5A0` (Span.io-inspired electric green — used for highlights, active states, positive trends)
- **Accent secondary**: `#3B82F6` (blue — used for secondary data series)
- **Text primary**: `#F0F0F5`
- **Text muted**: `#6B7280`
- **Danger/down**: `#EF4444`

**Typography:**
- Display/headers: `DM Sans` (Google Fonts)
- Data/numbers: `DM Mono` (Google Fonts)
- Body: `Inter` (acceptable here as a supporting font only — never as the primary display font)

**Chart colors (in order):**
`#00E5A0`, `#3B82F6`, `#F59E0B`, `#8B5CF6`, `#EC4899`

---

## File Structure

```
/app
  /api
    /ga4/route.ts          — GA4 data fetching
    /gsc/route.ts          — Search Console data fetching
    /meta/route.ts         — Meta Graph API data fetching
    /youtube/route.ts      — YouTube Data API fetching
    /manual/route.ts       — Manual data CRUD (Vercel Postgres)
  /admin/page.tsx          — Password-protected manual entry form
  /page.tsx                — Main dashboard
  /layout.tsx              — Root layout with fonts
/components
  /ui
    KPICard.tsx            — Reusable KPI stat card with trend indicator
    ChartCard.tsx          — Reusable chart wrapper card
    LoadingSkeleton.tsx    — Skeleton loader component
    EmptyState.tsx         — Empty/error state component
  /charts
    SocialTrafficChart.tsx
    SearchTrendChart.tsx
    InstagramChart.tsx
    YouTubeChart.tsx
    InstallerInquiryChart.tsx
    HearAboutUsChart.tsx
  /sections
    TopContent.tsx         — Top posts and videos section
    ManualDataForm.tsx     — Admin data entry form
/lib
  ga4.ts                   — GA4 API client
  gsc.ts                   — Search Console client
  meta.ts                  — Meta Graph API client
  youtube.ts               — YouTube API client
  db.ts                    — Vercel Postgres client
  utils.ts                 — Shared utilities (date formatting, number formatting, etc.)
/types
  index.ts                 — Shared TypeScript types
```

---

## Environment Variables

All required env vars are in `.env.example`. Never commit `.env.local`.

Key vars:
- `GA4_SERVICE_ACCOUNT_JSON` — stringified JSON of Google service account
- `GA4_PROPERTY_ID` — GA4 property ID (format: `properties/XXXXXXXXX`)
- `GA4_INSTALLER_PAGE_PATH` — e.g. `/find-an-installer`
- `GSC_SITE_URL` — e.g. `https://span.io`
- `GSC_BRAND_KEYWORD` — e.g. `span`
- `META_ACCESS_TOKEN` — long-lived page access token
- `META_PAGE_ID` — Facebook Page ID
- `META_IG_ACCOUNT_ID` — Instagram Business Account ID
- `YOUTUBE_API_KEY` — YouTube Data API v3 key
- `YOUTUBE_CHANNEL_ID` — YouTube channel ID
- `ADMIN_PASSWORD` — simple password for `/admin` route
- `POSTGRES_URL` — Vercel Postgres connection string

---

## API Route Patterns

Every API route should follow this pattern:

```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30' // days

    // fetch data...

    return Response.json({ data, lastUpdated: new Date().toISOString() })
  } catch (error) {
    console.error('[ROUTE_NAME] fetch error:', error)
    return Response.json({ error: 'Failed to fetch data', data: null }, { status: 500 })
  }
}
```

---

## Manual Data Schema (Vercel Postgres)

```sql
CREATE TABLE IF NOT EXISTS manual_entries (
  id SERIAL PRIMARY KEY,
  entry_date DATE NOT NULL,
  installer_inquiries INTEGER DEFAULT 0,
  survey_social INTEGER DEFAULT 0,
  survey_google INTEGER DEFAULT 0,
  survey_word_of_mouth INTEGER DEFAULT 0,
  survey_installer_referral INTEGER DEFAULT 0,
  survey_other INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Date Range Toggle

The dashboard supports two date ranges, selectable via toggle in the header:
- **Last 30 Days** (default)
- **Last 90 Days**

All API routes accept a `?range=30` or `?range=90` query param. When the toggle changes, re-fetch all data sources.

---

## KPI Card Trend Indicators

Each KPI card should show:
- Current period value
- % change vs prior period (same length)
- Up arrow in accent green if positive, down arrow in red if negative
- Neutral gray if no change or insufficient data

---

## Admin Route Auth

Simple pattern — no NextAuth needed for v1:

```typescript
// In /app/admin/page.tsx
// Check a cookie set by a simple password form
// If cookie missing or wrong, show password gate
// If correct, show the data entry form
```

---

## Coding Standards

- TypeScript everywhere — no `any` types
- Use `async/await` — no `.then()` chains
- All components are functional — no class components
- Keep components small and focused — if a component is over 150 lines, split it
- Use named exports for components, default exports for pages
- Format numbers with `Intl.NumberFormat` — never raw numbers in the UI
- Format dates consistently: `MMM D, YYYY` for display, ISO for storage
