-- Prayer times table for Supabase (with Hijri dates)
-- Run this in Supabase SQL Editor

-- Create prayer_times table
CREATE TABLE IF NOT EXISTS public.prayer_times (
  city_slug TEXT NOT NULL,
  district_slug TEXT NULL,
  date DATE NOT NULL,
  fajr TEXT NOT NULL,
  sunrise TEXT NOT NULL,
  dhuhr TEXT NOT NULL,
  asr TEXT NOT NULL,
  maghrib TEXT NOT NULL,
  isha TEXT NOT NULL,
  hijri_date_short TEXT NULL,
  hijri_date_long TEXT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Istanbul',
  source TEXT NOT NULL DEFAULT 'aladhan',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one record per city/district/date combination
CREATE UNIQUE INDEX IF NOT EXISTS prayer_times_unique
  ON public.prayer_times (city_slug, district_slug, date);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS prayer_times_city_date_idx
  ON public.prayer_times (city_slug, date);

CREATE INDEX IF NOT EXISTS prayer_times_city_district_date_idx
  ON public.prayer_times (city_slug, district_slug, date);
