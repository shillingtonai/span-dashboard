# Meta (Instagram + Facebook) API Setup Guide
## For Span.io Social ROI Dashboard

Meta's API is the most involved of the four — there's an app approval step that can take a day or two. Start this first if you can.

---

## What You Need Before Starting
- Admin access to Span.io's **Facebook Page**
- Admin access to Span.io's **Instagram Business Account** (must be connected to the Facebook Page)
- A personal Facebook account to create the developer app

---

## Part 1: Create a Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Log in with your personal Facebook account
3. Click **My Apps → Create App**
4. Choose **Business** as the app type → **Next**
5. Fill in:
   - **App name**: `Spanio Dashboard` (or similar)
   - **App contact email**: your email
   - **Business Account**: select Span.io's business account if available, or skip
6. Click **Create App**

---

## Part 2: Add Required Products

In your new app's dashboard, you need to add two products:

### Add Instagram Graph API
1. In the left sidebar, click **Add Product**
2. Find **Instagram Graph API** → click **Set Up**

### Add Pages API (for Facebook Page data)
1. Click **Add Product** again
2. Find **Facebook Login for Business** → **Set Up** (this enables Pages access)

---

## Part 3: Configure App Permissions

1. In the left sidebar, go to **App Review → Permissions and Features**
2. Request the following permissions:
   - `pages_read_engagement` — for Facebook Page reach/impressions
   - `pages_show_list` — to list pages
   - `instagram_basic` — for Instagram basic metrics
   - `instagram_manage_insights` — for Instagram reach, impressions, engagement
3. For each permission, click **Request** and fill in the use case description

**What to write for the use case (copy this):**
> This permission is used to display aggregated social media performance metrics (reach, impressions, engagement) in a private internal dashboard for the brand's marketing team. Data is read-only and displayed only to authorized users of the dashboard.

4. Submit for review — Meta typically approves these within 1–2 business days

> **Note:** While waiting for approval, you can use your own test data by adding yourself as a test user (see Part 5).

---

## Part 4: Generate a Long-Lived Page Access Token

This is the token the dashboard uses to authenticate API calls.

### Step 1: Get a short-lived user token
1. Go to [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. Select your app from the dropdown
3. Under **Permissions**, add:
   - `pages_read_engagement`
   - `pages_show_list`
   - `instagram_basic`
   - `instagram_manage_insights`
4. Click **Generate Access Token** → approve the permissions popup
5. Copy the token shown — this is your short-lived user token (expires in ~1 hour)

### Step 2: Exchange for a long-lived user token
Run this in your terminal (replace `{APP_ID}`, `{APP_SECRET}`, and `{SHORT_LIVED_TOKEN}`):

```bash
curl "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}"
```

Find your App ID and App Secret in **App Settings → Basic**.

Copy the `access_token` from the response — this is your long-lived user token (valid ~60 days).

### Step 3: Get a permanent Page Access Token
Run this (replace `{LONG_LIVED_USER_TOKEN}`):

```bash
curl "https://graph.facebook.com/v18.0/me/accounts?access_token={LONG_LIVED_USER_TOKEN}"
```

This returns a list of pages you manage. Find the Span.io page in the response — copy its `access_token`. This is your **permanent Page Access Token** (never expires as long as you don't revoke it).

Also copy the `id` field — that's your `META_PAGE_ID`.

---

## Part 5: Find Your Instagram Business Account ID

```bash
curl "https://graph.facebook.com/v18.0/{META_PAGE_ID}?fields=instagram_business_account&access_token={PAGE_ACCESS_TOKEN}"
```

Copy the `id` from `instagram_business_account` — that's your `META_IG_ACCOUNT_ID`.

---

## Part 6: Set Your .env.local Values

```bash
META_ACCESS_TOKEN=EAAxxxxxxxxx...  # permanent page access token from Step 3
META_PAGE_ID=123456789012345
META_IG_ACCOUNT_ID=987654321098765
```

---

## Part 7: Test Your Token

Quick test to confirm everything works:

```bash
# Test Facebook Page insights
curl "https://graph.facebook.com/v18.0/{META_PAGE_ID}/insights?metric=page_impressions,page_reach&period=day&access_token={META_ACCESS_TOKEN}"

# Test Instagram insights
curl "https://graph.facebook.com/v18.0/{META_IG_ACCOUNT_ID}/insights?metric=reach,impressions&period=day&access_token={META_ACCESS_TOKEN}"
```

Both should return JSON with `data` arrays. If you get a permissions error, the app review may still be pending.

---

## Token Maintenance

Page access tokens don't expire, BUT they can be invalidated if:
- You change your Facebook password
- You revoke the app's permissions
- Meta's security systems flag suspicious activity

If the dashboard stops showing Meta data, regenerate the token using Parts 4–5 above.

Consider adding a token refresh reminder to your calendar every 6 months as a precaution.

---

## Troubleshooting

**"OAuthException: The user must be an administrator" error**
- Make sure your personal Facebook account has Admin role on the Span.io Page
- Go to the Page → Settings → Page Roles to confirm

**"Permissions error" on insights endpoints**
- App review may still be pending
- Temporarily add yourself as a Test User: App Dashboard → Roles → Test Users

**Instagram account not found**
- The Instagram account must be a Business or Creator account (not personal)
- It must be connected to the Facebook Page: Instagram → Settings → Linked Accounts → Facebook

**Empty data arrays**
- Insights data can have a 24–48 hour delay
- Make sure the date range you're requesting isn't too recent
