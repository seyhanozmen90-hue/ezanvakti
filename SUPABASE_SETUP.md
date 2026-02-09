# Prayer Times with Supabase Setup Guide

This project uses Supabase as the database backend for prayer times data.

## Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready (~2 minutes)
4. Copy your project credentials

### 2. Get Environment Variables

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### 3. Set Environment Variables

Create `.env.local` in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Prayer Times Provider
PRAYER_TIMES_PROVIDER=aladhan

# Admin Refresh Token
ADMIN_REFRESH_TOKEN=your-secret-admin-token

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Create Database Table

1. In your Supabase project, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and run it in the SQL Editor
4. You should see "Success. No rows returned"

The script will create:
- ✅ `prayer_times` table
- ✅ Unique constraint on `(city_slug, district_slug, date)`
- ✅ Indexes for fast queries
- ✅ Row Level Security (RLS) policies
- ✅ Auto-update trigger for `updated_at`

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

### 7. Test the API

```bash
# Test with İzmir
curl "http://localhost:3000/api/prayer-times?city=izmir"
```

**Expected Response:**

```json
{
  "city": "izmir",
  "district": null,
  "date": "2026-02-10",
  "timezone": "Europe/Istanbul",
  "source": "aladhan",
  "is_stale": false,
  "timings": {
    "fajr": "06:28",
    "sunrise": "08:04",
    "dhuhr": "13:19",
    "asr": "16:11",
    "maghrib": "18:40",
    "isha": "20:08"
  }
}
```

## Vercel Deployment

### Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (sensitive, don't expose)
PRAYER_TIMES_PROVIDER
ADMIN_REFRESH_TOKEN (sensitive)
NEXT_PUBLIC_BASE_URL
```

4. Select environments: **Production**, **Preview**, **Development**
5. Click **Save**

### Deploy

```bash
vercel --prod
```

Or connect your GitHub repo for automatic deployments.

## API Endpoints

### Public Prayer Times API

**Endpoint:** `GET /api/prayer-times`

**Query Parameters:**
- `city` (required): City slug (e.g., "izmir", "istanbul")
- `district` (optional): District slug (e.g., "bornova")
- `date` (optional): Date in YYYY-MM-DD format (default: today)

**Examples:**

```bash
# City prayer times
curl "https://your-app.vercel.app/api/prayer-times?city=izmir"

# District prayer times
curl "https://your-app.vercel.app/api/prayer-times?city=izmir&district=bornova"

# Specific date
curl "https://your-app.vercel.app/api/prayer-times?city=izmir&date=2026-02-15"
```

### Admin Refresh Endpoint

**Endpoint:** `POST /api/admin/refresh`

**Authentication:** 
- Header: `X-Admin-Token: your-secret-token`
- OR Query: `?token=your-secret-token`

**Body (optional):**

```json
{
  "cities": ["izmir", "istanbul"],
  "date": "2026-02-10",
  "includeDistricts": true
}
```

**Example:**

```bash
curl -X POST "https://your-app.vercel.app/api/admin/refresh?token=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"cities": ["izmir"], "includeDistricts": true}'
```

## Architecture

```
User Request
    ↓
API Route (Server-only, uses service role key)
    ↓
Prayer Times Service
    ↓
Supabase DB ← Aladhan API (if cache miss)
```

### Data Flow

1. **Request arrives** → API route receives city/district/date
2. **Check DB** → Query Supabase for cached data
3. **Cache hit** → Return immediately
4. **Cache miss** → Acquire lock to prevent stampede
5. **Fetch from Aladhan** → Use coordinates from `lib/geo/tr.ts`
6. **Upsert to DB** → Save to Supabase
7. **Return data** → Send to client
8. **Provider failure** → Return last known data (stale)

### Security

- ✅ **RLS enabled** on `prayer_times` table
- ✅ **Anon key** can only read (safe for public data)
- ✅ **Service role key** used only server-side for writes
- ✅ **Admin endpoint** protected by secret token

## Database Schema

```sql
CREATE TABLE prayer_times (
  id BIGSERIAL PRIMARY KEY,
  city_slug TEXT NOT NULL,
  district_slug TEXT,
  date DATE NOT NULL,
  fajr TEXT NOT NULL,
  sunrise TEXT NOT NULL,
  dhuhr TEXT NOT NULL,
  asr TEXT NOT NULL,
  maghrib TEXT NOT NULL,
  isha TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Istanbul',
  source TEXT NOT NULL DEFAULT 'aladhan',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (city_slug, district_slug, date)
);
```

## Adding Coordinates

To add prayer times for new cities, add coordinates to `lib/geo/tr.ts`:

```typescript
{
  city_slug: 'ankara',
  coords: { lat: 39.9334, lng: 32.8597 },
},
{
  city_slug: 'ankara',
  district_slug: 'cankaya',
  coords: { lat: 39.9178, lng: 32.8619 },
},
```

## Monitoring

### Check Supabase Table

1. Go to **Table Editor** in Supabase
2. Select `prayer_times` table
3. See all cached prayer times

### Check Logs

**Supabase:**
- Go to **Logs** → **API Logs** to see all queries

**Vercel:**
- Go to **Logs** tab to see API route logs

## Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_URL is not set"

**Solution:** Add environment variables to `.env.local` (local) or Vercel dashboard (production)

### Error: "Prayer times not found"

**Solution:** Add coordinates for that city in `lib/geo/tr.ts`

### Error: "Aladhan API timeout"

**Solution:** 
- Check internet connection
- Increase timeout in `lib/providers/aladhan.ts`
- Last known data will be returned as fallback

### Stale data warning

**Expected behavior:** If Aladhan API is down, the system returns the last known data with `is_stale: true`

## Cron Job Setup (Optional)

To automatically refresh prayer times daily:

### Vercel Cron

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/admin/refresh?token=YOUR_SECRET_TOKEN",
      "schedule": "0 2 * * *"
    }
  ]
}
```

This runs daily at 2:00 AM UTC.

### External Cron (e.g., Cron-job.org)

Set up a daily POST request to:
```
https://your-app.vercel.app/api/admin/refresh?token=YOUR_SECRET
```

## Development Tips

### Check if data is cached

```bash
# First call - fetches from Aladhan and caches
curl "http://localhost:3000/api/prayer-times?city=izmir"

# Second call - returns from cache (instant)
curl "http://localhost:3000/api/prayer-times?city=izmir"
```

### Force refresh via admin endpoint

```bash
curl -X POST "http://localhost:3000/api/admin/refresh?token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cities": ["izmir"]}'
```

### View Supabase data directly

```bash
# Using Supabase CLI (optional)
supabase db pull

# Or use Table Editor in Supabase dashboard
```

## Migration from Raw Postgres

If you previously used raw Postgres (`pg` package):

1. ✅ Schema is compatible - same table structure
2. ✅ Data can be migrated - use `pg_dump` and import
3. ✅ No code changes needed in pages/components
4. ✅ Better performance with Supabase connection pooling

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Aladhan API:** https://aladhan.com/prayer-times-api
- **Next.js Docs:** https://nextjs.org/docs

## Production Checklist

- [ ] Supabase project created
- [ ] Schema ran successfully
- [ ] Environment variables set (Vercel)
- [ ] Service role key kept secret
- [ ] RLS policies verified
- [ ] Coordinates added for all cities
- [ ] API tested locally
- [ ] API tested in production
- [ ] Cron job configured (optional)
- [ ] Monitoring enabled

---

**Note:** Never commit `.env.local` to git. It's in `.gitignore` by default.
