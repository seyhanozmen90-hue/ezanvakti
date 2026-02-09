# Prayer Times Production Architecture Setup

Bu proje production-grade, database-backed bir ezan vakti sistemi kullanıyor.

## Mimari Özeti

```
User Request
    ↓
Page/API Route
    ↓
Prayer Times Service (lock + cache)
    ↓
Database (PostgreSQL) ← Provider (Aladhan/Diyanet)
```

### Özellikler

- ✅ **DB-Backed**: Tüm vakitler veritabanında saklanır
- ✅ **Provider Abstraction**: Aladhan ↔ Diyanet arası kolay geçiş
- ✅ **Caching**: DB caching ile provider çağrıları minimize edilir
- ✅ **Lock Mechanism**: Stampede prevention (aynı veri için çoklu provider çağrısı engellenir)
- ✅ **Fallback System**: Provider down olsa bile son bilinen veriyi döner
- ✅ **Admin Refresh**: Cron job için endpoint

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

Yeni paketler:
- `pg`: PostgreSQL client
- `@types/pg`: TypeScript types

### 2. Veritabanı Kurulumu

#### Option A: Vercel Postgres (Önerilen)

```bash
# Vercel dashboard'dan Postgres ekle
# Connection string'i otomatik olarak DATABASE_URL'ye eklenir
```

#### Option B: Local PostgreSQL

```bash
# .env.local oluştur
DATABASE_URL="postgresql://user:password@localhost:5432/ezanvakti"
```

### 3. Veritabanı Tablosunu Oluştur

```bash
# PostgreSQL'e bağlan ve şemayı çalıştır
psql $DATABASE_URL < lib/db/schema.sql
```

Veya Vercel Postgres SQL tab'ından `lib/db/schema.sql` dosyasının içeriğini çalıştır.

### 4. Environment Variables

`.env.local` dosyasına ekle:

```bash
# Database
DATABASE_URL="your-postgres-connection-string"

# Prayer Times Provider (aladhan or diyanet)
PRAYER_TIMES_PROVIDER="aladhan"

# Admin refresh token (güçlü bir token oluştur)
ADMIN_REFRESH_TOKEN="your-secret-token-here"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Kullanım

### Public API

**Endpoint:** `GET /api/prayer-times`

**Query Parameters:**
- `city` (required): City slug (e.g., "izmir", "istanbul")
- `district` (optional): District slug (e.g., "bornova")
- `date` (optional): Date in YYYY-MM-DD format (default: today)

**Example:**

```bash
# City prayer times
curl "http://localhost:3000/api/prayer-times?city=izmir"

# District prayer times
curl "http://localhost:3000/api/prayer-times?city=izmir&district=bornova"

# Specific date
curl "http://localhost:3000/api/prayer-times?city=izmir&date=2026-02-15"
```

**Response:**

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

### Admin Refresh Endpoint

**Endpoint:** `POST /api/admin/refresh`

**Authentication:** Header `X-Admin-Token: your-secret-token` or query param `?token=your-secret-token`

**Body (optional):**

```json
{
  "cities": ["izmir", "istanbul"],  // optional, defaults to all
  "date": "2026-02-10",             // optional, defaults to today
  "includeDistricts": true          // optional, defaults to false
}
```

**Example:**

```bash
curl -X POST "http://localhost:3000/api/admin/refresh?token=your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{"cities": ["izmir"], "includeDistricts": true}'
```

**Response:**

```json
{
  "success": true,
  "refreshed": 5,
  "failed": 0,
  "date": "2026-02-10",
  "results": [
    {
      "city": "izmir",
      "district": null,
      "date": "2026-02-10",
      "source": "aladhan",
      "success": true
    }
  ]
}
```

### Cron Job Setup (Vercel)

`vercel.json` oluştur:

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

Bu her gün saat 02:00'da refresh yapar.

## Koordinat Ekleme

`lib/geo/tr.ts` dosyasına yeni şehir/ilçe koordinatları ekle:

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

## Provider Değiştirme

### Aladhan'dan Diyanet'e Geçiş

1. `lib/providers/diyanet.ts` dosyasını implement et
2. `.env.local` dosyasında `PRAYER_TIMES_PROVIDER="diyanet"` yap
3. Admin refresh endpoint ile verileri yeniden çek

## Veritabanı Tablosu

```sql
CREATE TABLE prayer_times (
  id SERIAL PRIMARY KEY,
  city_slug TEXT NOT NULL,
  district_slug TEXT,
  date TEXT NOT NULL,
  fajr TEXT NOT NULL,
  sunrise TEXT NOT NULL,
  dhuhr TEXT NOT NULL,
  asr TEXT NOT NULL,
  maghrib TEXT NOT NULL,
  isha TEXT NOT NULL,
  timezone TEXT DEFAULT 'Europe/Istanbul',
  source TEXT NOT NULL,
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(city_slug, district_slug, date)
);
```

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  User Request (city=izmir, date=2026-02-10)                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Prayer Times Service                                       │
│  1. Check DB first                                          │
│  2. If not found, acquire lock                              │
│  3. Fetch from Aladhan (lat/lng based)                     │
│  4. Upsert to DB                                            │
│  5. If provider fails, return last known (stale)           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Database (PostgreSQL)                                      │
│  • Stores all prayer times                                  │
│  • Unique constraint prevents duplicates                    │
│  • Acts as cache and fallback                               │
└─────────────────────────────────────────────────────────────┘
```

## Dosya Yapısı

```
lib/
├── db/
│   ├── schema.sql              # DB table schema
│   ├── types.ts                # TypeScript types
│   ├── client.ts               # PostgreSQL connection pool
│   └── prayerTimesDb.ts        # Data access layer
├── providers/
│   ├── types.ts                # Provider interface
│   ├── aladhan.ts              # Aladhan implementation
│   ├── diyanet.ts              # Diyanet stub
│   └── index.ts                # Active provider selector
├── geo/
│   └── tr.ts                   # Turkey coordinates mapping
└── services/
    ├── lockManager.ts          # In-memory lock
    └── prayerTimesService.ts   # Main service with caching

app/api/
├── prayer-times/
│   └── route.ts                # Public API endpoint
└── admin/
    └── refresh/
        └── route.ts            # Admin refresh endpoint
```

## Troubleshooting

### Database connection error

```bash
# Test connection
psql $DATABASE_URL

# Check env variable
echo $DATABASE_URL
```

### Provider timeout

Aladhan API timeout süresi varsayılan 5 saniye. `lib/providers/aladhan.ts` dosyasında `REQUEST_TIMEOUT` değerini artır.

### Lock issues

In-memory lock sadece tek instance için çalışır. Production'da multiple instances için Redis kullan.

### Stale data

Provider down olduğunda eski veriyi döner. `is_stale: true` flag'ini kontrol et.

## Production Checklist

- [ ] PostgreSQL database kuruldu
- [ ] Schema çalıştırıldı
- [ ] Environment variables ayarlandı
- [ ] Koordinatlar eklendi (`lib/geo/tr.ts`)
- [ ] Admin refresh endpoint test edildi
- [ ] Cron job ayarlandı (Vercel crons)
- [ ] Cache headers doğru çalışıyor
- [ ] Fallback sistemi test edildi
- [ ] Provider abstraction test edildi

## Next Steps

1. Diyanet provider'ı implement et
2. Redis-based distributed lock ekle
3. Monitoring ve alerting ekle
4. Rate limiting ekle
5. API key authentication ekle (optional)
