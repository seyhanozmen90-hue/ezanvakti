# Cron Refresh Endpoint Setup

## Overview

The `/api/admin/refresh` endpoint refreshes prayer times for all cities in your database.

**Purpose:** Run daily via cron to keep prayer times up-to-date.

## Security

✅ **Server-only** - No client exposure  
✅ **Bearer token authentication** - Requires `CRON_SECRET`  
✅ **Production-safe** - Continues even if one city fails  

## Setup

### 1. Set Environment Variable

Add to `.env.local` (local) or Vercel dashboard (production):

```bash
CRON_SECRET=your-super-secure-random-token-here
```

**Generate a secure token:**
```bash
# Option 1: OpenSSL
openssl rand -hex 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Use password manager
# Generate a 64-character random password
```

### 2. Configure Vercel Cron

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/admin/refresh",
      "schedule": "0 2 * * *"
    }
  ]
}
```

This runs daily at 2:00 AM UTC.

**Important:** Vercel automatically adds the `Authorization: Bearer <CRON_SECRET>` header when calling cron endpoints.

### 3. Manual Test

Test the endpoint manually:

```bash
curl -X POST https://your-app.vercel.app/api/admin/refresh \
  -H "Authorization: Bearer your-super-secure-random-token-here"
```

**Expected Response:**

```json
{
  "success": true,
  "refreshed": 3
}
```

## Vercel Cron Setup (Detailed)

### Step 1: Deploy to Vercel

```bash
vercel --prod
```

### Step 2: Add CRON_SECRET

1. Go to Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. Add:
   - Key: `CRON_SECRET`
   - Value: (your secure token)
   - Environments: **Production**, **Preview**, **Development**

### Step 3: Add vercel.json

```json
{
  "crons": [
    {
      "path": "/api/admin/refresh",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Schedule Format:** Standard cron syntax
- `0 2 * * *` = Daily at 2:00 AM UTC
- `0 */6 * * *` = Every 6 hours
- `0 0 * * 0` = Weekly on Sunday at midnight

### Step 4: Deploy Again

```bash
git add vercel.json
git commit -m "Add cron job for prayer times refresh"
git push
```

Vercel will automatically detect and configure the cron job.

### Step 5: Verify

1. Vercel Dashboard → **Settings** → **Cron Jobs**
2. You should see your cron job listed
3. Wait for next scheduled run or trigger manually

## How It Works

```
Vercel Cron (2:00 AM UTC)
    ↓
POST /api/admin/refresh
    ↓
Check Authorization: Bearer CRON_SECRET
    ↓
Load cities from lib/geo/tr.ts
    ↓
For each city:
  - Call getPrayerTimes(city_slug, null, today)
  - Fetch from Aladhan API
  - Save to Supabase
    ↓
Return { success: true, refreshed: 3 }
```

## Error Handling

✅ **One city fails** → Continues with other cities  
✅ **API timeout** → Logs error, returns last known data  
✅ **Database error** → Logs error, continues  

**The cron job will always return 200 OK** unless authentication fails.

## Monitoring

### Check Cron Logs

Vercel Dashboard → **Logs** → Filter by `/api/admin/refresh`

### Expected Logs

```
Cron refresh completed: 3 cities refreshed
```

### Error Logs

```
Failed to refresh istanbul: Aladhan API timeout
Cron refresh completed: 2 cities refreshed
```

## Troubleshooting

### Error: "Unauthorized"

❌ **Cause:** CRON_SECRET not set or incorrect

✅ **Fix:** 
1. Check Vercel env vars
2. Redeploy: `vercel --prod`

### Error: "No cities configured"

❌ **Cause:** `lib/geo/tr.ts` has no cities with coordinates

✅ **Fix:** Add cities to `lib/geo/tr.ts`

### Cron not running

❌ **Cause:** `vercel.json` not committed or deployed

✅ **Fix:**
```bash
git add vercel.json
git commit -m "Add cron config"
git push
```

## Alternative: External Cron (e.g., Cron-job.org)

If not using Vercel:

1. **Register:** https://cron-job.org
2. **Create Job:**
   - URL: `https://your-app.com/api/admin/refresh`
   - Method: `POST`
   - Headers: `Authorization: Bearer your-cron-secret`
   - Schedule: Daily at 2:00 AM
3. **Save & Enable**

## Security Best Practices

✅ **Use strong token** - 64+ characters, random  
✅ **Never commit token** - Use environment variables  
✅ **Rotate periodically** - Change token every 90 days  
✅ **Monitor logs** - Check for unauthorized access attempts  

## Local Testing

Test locally before deploying:

```bash
# Start dev server
npm run dev

# In another terminal
curl -X POST http://localhost:3001/api/admin/refresh \
  -H "Authorization: Bearer your-local-cron-secret"
```

Make sure `CRON_SECRET` is in your `.env.local`.

## Response Format

**Success:**
```json
{
  "success": true,
  "refreshed": 3
}
```

**Unauthorized:**
```json
{
  "success": false,
  "error": "Unauthorized. Invalid token."
}
```

**Server Error:**
```json
{
  "success": false,
  "error": "Refresh failed",
  "details": "..."
}
```

## Production Checklist

- [ ] `CRON_SECRET` added to Vercel env vars
- [ ] `vercel.json` created with cron schedule
- [ ] Deployed to production
- [ ] Cron job visible in Vercel dashboard
- [ ] Manual test successful
- [ ] Logs monitored for first run

---

**For more info:** [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
