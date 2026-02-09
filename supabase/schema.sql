-- Prayer times table for Supabase
-- Run this in Supabase SQL Editor

-- Enable the required extensions if not already enabled
-- (Usually already enabled in Supabase projects)

-- Create prayer_times table
CREATE TABLE IF NOT EXISTS prayer_times (
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
  
  -- Unique constraint: one record per city/district/date combination
  CONSTRAINT prayer_times_unique UNIQUE (city_slug, district_slug, date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_prayer_times_city_date 
  ON prayer_times (city_slug, date);

CREATE INDEX IF NOT EXISTS idx_prayer_times_city_district_date 
  ON prayer_times (city_slug, district_slug, date);

CREATE INDEX IF NOT EXISTS idx_prayer_times_date 
  ON prayer_times (date);

CREATE INDEX IF NOT EXISTS idx_prayer_times_fetched_at 
  ON prayer_times (fetched_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE prayer_times ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anonymous read access (safe for public prayer times data)
CREATE POLICY "Allow anonymous read access" ON prayer_times
  FOR SELECT
  TO anon
  USING (true);

-- Allow service role full access (for server-side operations)
CREATE POLICY "Allow service role full access" ON prayer_times
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Optional: Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_prayer_times_updated_at ON prayer_times;
CREATE TRIGGER update_prayer_times_updated_at
  BEFORE UPDATE ON prayer_times
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant access to authenticated and anon roles
GRANT SELECT ON prayer_times TO anon;
GRANT SELECT ON prayer_times TO authenticated;

-- Service role already has full access, no need to grant

COMMENT ON TABLE prayer_times IS 'Stores prayer times for Turkish cities and districts';
COMMENT ON COLUMN prayer_times.city_slug IS 'City slug (e.g., izmir, istanbul)';
COMMENT ON COLUMN prayer_times.district_slug IS 'District slug (e.g., bornova), nullable';
COMMENT ON COLUMN prayer_times.date IS 'Date for the prayer times';
COMMENT ON COLUMN prayer_times.fajr IS 'Fajr prayer time (HH:MM format)';
COMMENT ON COLUMN prayer_times.sunrise IS 'Sunrise time (HH:MM format)';
COMMENT ON COLUMN prayer_times.dhuhr IS 'Dhuhr prayer time (HH:MM format)';
COMMENT ON COLUMN prayer_times.asr IS 'Asr prayer time (HH:MM format)';
COMMENT ON COLUMN prayer_times.maghrib IS 'Maghrib prayer time (HH:MM format)';
COMMENT ON COLUMN prayer_times.isha IS 'Isha prayer time (HH:MM format)';
COMMENT ON COLUMN prayer_times.source IS 'Data source: aladhan or diyanet';
COMMENT ON COLUMN prayer_times.fetched_at IS 'When this data was fetched from the provider';
