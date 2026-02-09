# Supabase Migration - Quick Reference

## ✅ Completed Migration

The project has been migrated from raw Postgres (`pg`) to Supabase.

## Quick Setup (3 Steps)

### 1. Create Supabase Project

- Go to [supabase.com](https://supabase.com)
- Create new project
- Get your credentials (URL, anon key, service role key)

### 2. Set Environment Variables in Vercel

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Schema in Supabase SQL Editor

Copy and run `supabase/schema.sql` in Supabase SQL Editor.

## Test Locally

```bash
# 1. Create .env.local with Supabase credentials
cp .env.example .env.local

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev

# 4. Test API
curl "http://localhost:3000/api/prayer-times?city=izmir"
```

## What Changed

### ❌ Removed
- `pg` package
- `@types/pg` package  
- `lib/db/client.ts` (raw Postgres pool)
- `DATABASE_URL` env variable

### ✅ Added
- `@supabase/supabase-js` package
- `lib/supabase/server.ts` (server client)
- `lib/supabase/public.ts` (public client)
- `supabase/schema.sql` (Supabase-specific schema)
- New env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### 🔄 Updated
- `lib/db/prayerTimesDb.ts` - uses Supabase client instead of pg
- `.env.example` - new Supabase variables

### ✅ Unchanged
- API routes (`/api/prayer-times`, `/api/admin/refresh`)
- Service layer (`lib/services/prayerTimesService.ts`)
- Provider abstraction (`lib/providers/`)
- Geo coordinates (`lib/geo/tr.ts`)
- Page components

## Full Documentation

See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for complete setup guide.

## Architecture

```
Client → API Route → Service Layer → Supabase DB ← Aladhan Provider
                                   (server role key)
```

## Security

- ✅ Service role key used only on server
- ✅ Anon key safe for client reads (RLS enabled)
- ✅ No sensitive keys exposed to browser

## Support

- **Supabase Setup:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Supabase Docs:** https://supabase.com/docs
- **API Documentation:** [PRAYER_TIMES_SETUP.md](./PRAYER_TIMES_SETUP.md)
