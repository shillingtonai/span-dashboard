# YouTube Data API Setup Guide
## For Span.io Social ROI Dashboard

YouTube is the simplest API to set up — just an API key, no OAuth needed for read-only public channel data.

---

## Part 1: Create a YouTube API Key

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select the same project you created for GA4/GSC (`spanio-dashboard`)
3. Go to **APIs & Services → Library**
4. Search for `YouTube Data API v3` → **Enable** it
5. Go to **APIs & Services → Credentials**
6. Click **+ Create Credentials → API key**
7. Copy the key that appears

### Restrict the API Key (Recommended)
1. Click on the API key you just created
2. Under **API restrictions**, select **Restrict key**
3. Choose **YouTube Data API v3** from the dropdown
4. Click **Save**

This prevents the key from being used for other Google APIs if it ever leaks.

---

## Part 2: Find Your Channel ID

The Channel ID is a string starting with `UC` (e.g., `UCxxxxxxxxxxxxxxxxxxxxxxxx`).

**Option A: From the YouTube Studio URL**
1. Go to [studio.youtube.com](https://studio.youtube.com)
2. Click your profile/channel in the top right
3. The URL will be `https://studio.youtube.com/channel/UCxxxxxxxx` — copy the `UCxxxxxxxx` part

**Option B: From the channel page**
1. Go to the Span.io YouTube channel page
2. Click **More** → **Share** → **Copy channel ID**

---

## Part 3: Set Your .env.local Values

```bash
YOUTUBE_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Part 4: Test Your Setup

```bash
curl "https://www.googleapis.com/youtube/v3/channels?part=statistics&id={YOUTUBE_CHANNEL_ID}&key={YOUTUBE_API_KEY}"
```

You should see subscriber count, view count, and video count in the response.

---

## Quota Notes

The YouTube Data API has a daily quota of 10,000 units. The dashboard's usage is minimal (a few reads per page load), so you're unlikely to hit limits. If you ever do, the dashboard will show empty states gracefully.

---
---

# Vercel Setup Guide
## For Span.io Social ROI Dashboard

---

## Part 1: Set Up Vercel Postgres

1. Go to [vercel.com](https://vercel.com) and log in
2. Go to your project (or create a new one by importing from GitHub)
3. In your project dashboard, go to **Storage** tab
4. Click **Create Database → Postgres**
5. Name it `spanio-dashboard` → **Create**
6. Once created, go to the database → **.env.local** tab
7. Copy the `POSTGRES_URL` value shown

---

## Part 2: Create the Database Table

After deploying once, run the migration. The easiest way is via the Vercel Postgres query editor:

1. In your Vercel project, go to **Storage → your database → Data** tab
2. Click **Query**
3. Paste and run this SQL:

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

## Part 3: Set Environment Variables in Vercel

1. Go to your Vercel project → **Settings → Environment Variables**
2. Add each variable from your `.env.local` file:

| Variable | Value |
|---|---|
| `GA4_SERVICE_ACCOUNT_JSON` | The full JSON string (single line) |
| `GA4_PROPERTY_ID` | e.g. `properties/123456789` |
| `GA4_INSTALLER_PAGE_PATH` | e.g. `/find-an-installer` |
| `GSC_SITE_URL` | e.g. `https://span.io` |
| `GSC_BRAND_KEYWORD` | e.g. `span` |
| `META_ACCESS_TOKEN` | Your permanent page access token |
| `META_PAGE_ID` | Facebook Page ID |
| `META_IG_ACCOUNT_ID` | Instagram Business Account ID |
| `YOUTUBE_API_KEY` | Your YouTube API key |
| `YOUTUBE_CHANNEL_ID` | Channel ID starting with UC |
| `ADMIN_PASSWORD` | A strong password for the /admin route |
| `POSTGRES_URL` | From Vercel Storage (auto-populated if linked) |

3. Set each variable to apply to **Production**, **Preview**, and **Development**

> **Tip for GA4_SERVICE_ACCOUNT_JSON:** Paste the JSON directly — Vercel handles special characters in env vars correctly without extra escaping.

---

## Part 4: Deploy

### From GitHub (recommended)
1. Push your project to a GitHub repo
2. In Vercel, click **Add New Project → Import Git Repository**
3. Select your repo → **Deploy**
4. Vercel auto-detects Next.js and configures the build correctly

### From CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## Part 5: Verify the Deployment

1. Visit your deployed URL
2. Check that KPI cards load (may take a few seconds on first load)
3. Visit `/admin` and confirm the password gate works
4. Add a test manual entry and confirm it appears on the dashboard

---

## Custom Domain (Optional)

1. In Vercel project → **Settings → Domains**
2. Add a domain like `dashboard.span.io` or `spanio-roi.youragency.com`
3. Follow Vercel's DNS setup instructions for your domain registrar

---

## Troubleshooting

**Build fails with "Cannot find module" errors**
- Make sure all dependencies are in `package.json` (not just installed locally)
- Run `npm install` locally and commit the updated `package-lock.json`

**Environment variables not loading**
- Redeploy after adding env vars — they don't hot-reload
- Check variable names for typos (case-sensitive)

**Postgres connection errors**
- Make sure the database is linked to your project in Vercel Storage
- The `POSTGRES_URL` must be the one Vercel provides, not a local connection string

**API routes returning 500 errors**
- Check Vercel's **Logs** tab for the specific error message
- Most common cause: malformed `GA4_SERVICE_ACCOUNT_JSON` (line breaks in the string)
