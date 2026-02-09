-- Prayer times table
CREATE TABLE IF NOT EXISTS prayer_times (
  id SERIAL PRIMARY KEY,
  city_slug TEXT NOT NULL,
  district_slug TEXT,
  date TEXT NOT NULL, -- YYYY-MM-DD format
  fajr TEXT NOT NULL, -- HH:MM format
  sunrise TEXT NOT NULL,
  dhuhr TEXT NOT NULL,
  asr TEXT NOT NULL,
  maghrib TEXT NOT NULL,
  isha TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Istanbul',
  source TEXT NOT NULL, -- 'aladhan' or 'diyanet'
  fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT prayer_times_unique UNIQUE (city_slug, district_slug, date)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_prayer_times_lookup 
  ON prayer_times (city_slug, district_slug, date);

CREATE INDEX IF NOT EXISTS idx_prayer_times_date 
  ON prayer_times (date);

CREATE INDEX IF NOT EXISTS idx_prayer_times_fetched_at 
  ON prayer_times (fetched_at);
