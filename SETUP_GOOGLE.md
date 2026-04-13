# Google Cloud API Setup Guide
## For Span.io Social ROI Dashboard

This guide covers setting up the two Google APIs needed for the dashboard: **Google Analytics 4** and **Google Search Console**. Both use the same service account, so you only need to do the Google Cloud setup once.

---

## Part 1: Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it something like `spanio-dashboard`
4. Click **Create** and wait for it to provision (~30 seconds)
5. Make sure the new project is selected in the dropdown before continuing

---

## Part 2: Enable the Required APIs

You need to enable two APIs in this project.

### Enable Google Analytics Data API
1. In the left sidebar, go to **APIs & Services → Library**
2. Search for `Google Analytics Data API`
3. Click it → **Enable**

### Enable Google Search Console API
1. Go back to **APIs & Services → Library**
2. Search for `Google Search Console API`
3. Click it → **Enable**

---

## Part 3: Create a Service Account

A service account lets the dashboard read data from Google APIs without requiring a user to log in. This is what runs on your server.

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → Service Account**
3. Fill in:
   - **Service account name**: `spanio-dashboard-reader`
   - **Service account ID**: will auto-fill — that's fine
   - **Description**: `Read-only access for Span.io ROI dashboard`
4. Click **Create and Continue**
5. For "Grant this service account access to project" — skip this step (click **Continue**)
6. For "Grant users access to this service account" — skip this too (click **Done**)

### Download the Service Account Key
1. You'll now see your service account listed under **Credentials**
2. Click the service account email to open it
3. Go to the **Keys** tab
4. Click **Add Key → Create new key**
5. Choose **JSON** → **Create**
6. A JSON file will download to your computer — **keep this safe, treat it like a password**

### Prepare the Key for Your .env File
The JSON file needs to go into your `.env.local` as a single-line string.

On Mac/Linux, run this in your terminal (replace the filename):
```bash
cat your-service-account-file.json | tr -d '\n'
```

Copy the output and set it as the value for `GA4_SERVICE_ACCOUNT_JSON` in your `.env.local`.

On Windows (PowerShell):
```powershell
(Get-Content your-service-account-file.json) -join '' | Set-Clipboard
```

---

## Part 4: Grant the Service Account Access to GA4

The service account needs to be added as a viewer in your GA4 property.

1. Go to [analytics.google.com](https://analytics.google.com)
2. Click the **gear icon** (Admin) in the bottom left
3. In the **Property** column, click **Property Access Management**
4. Click the **+** button → **Add users**
5. Enter the service account email (looks like `spanio-dashboard-reader@spanio-dashboard.iam.gserviceaccount.com`)
6. Set role to **Viewer**
7. Click **Add**

### Find Your GA4 Property ID
1. In GA4 Admin, go to **Property Settings**
2. Your Property ID is the number shown at the top (e.g., `123456789`)
3. In your `.env.local`, set `GA4_PROPERTY_ID=properties/123456789` (include the `properties/` prefix)

---

## Part 5: Grant the Service Account Access to Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Select the Span.io property from the left sidebar
3. Go to **Settings** (gear icon) → **Users and permissions**
4. Click **Add User**
5. Enter the same service account email
6. Set permission to **Restricted** (read-only is fine)
7. Click **Add**

### Find Your Search Console Site URL
This is just the URL of the property in Search Console. It'll be one of:
- `https://span.io` (URL-prefix property)
- `sc-domain:span.io` (Domain property)

Check the URL shown in your Search Console property selector — use that exact format as your `GSC_SITE_URL` value.

---

## Part 6: Set Your .env.local Values

At this point you should be able to fill in these values:

```bash
# Google (both GA4 and GSC use the same service account)
GA4_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"spanio-dashboard",...}
GA4_PROPERTY_ID=properties/123456789
GA4_INSTALLER_PAGE_PATH=/find-an-installer

GSC_SITE_URL=https://span.io
GSC_BRAND_KEYWORD=span
```

---

## Troubleshooting

**"Permission denied" error from GA4**
- Double-check the service account email was added to the GA4 property (Part 4)
- It can take up to 15 minutes for GA4 permissions to propagate

**"API not enabled" error**
- Go back to APIs & Services → Library and confirm both APIs show as "Enabled"

**"Invalid JSON" error for GA4_SERVICE_ACCOUNT_JSON**
- Make sure the JSON is on a single line with no line breaks
- Make sure there are no extra quotes wrapping it in the .env file

**"Property not found" for GA4**
- Make sure your GA4_PROPERTY_ID includes the `properties/` prefix
- Double-check the number matches what's in GA4 Admin → Property Settings

**Search Console returning no data**
- Confirm the site URL format matches exactly what's shown in Search Console
- The service account may need up to 24 hours after being added before data is accessible

---

## Next Steps

Once Google is set up, refer to these guides for the remaining APIs:
- `SETUP_META.md` — Meta Graph API (Instagram + Facebook)
- `SETUP_YOUTUBE.md` — YouTube Data API
- `SETUP_VERCEL.md` — Vercel Postgres + deployment
