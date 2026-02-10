# Prayer Times Smoke Test

Bu script, `/api/prayer-times` endpoint'ini `lib/geo/tr.ts` dosyasındaki tüm şehirler ve ilçeler için test eder.

## Kullanım

### 1. Dev Server'ı Başlat

```bash
npm run dev
```

Dev server varsayılan olarak `http://localhost:3000` veya `http://localhost:3001` üzerinde çalışacak.

### 2. Smoke Test'i Çalıştır

**Aynı terminal'de (varsayılan localhost:3000):**

```bash
npm run verify:prayer
```

**Farklı bir BASE_URL ile:**

```bash
BASE_URL=http://localhost:3001 npm run verify:prayer
```

**Production'da:**

```bash
BASE_URL=https://ezanvakti.com npm run verify:prayer
```

## Çıktı

Script şu bilgileri gösterir:

### 1. Gerçek Zamanlı İlerleme

```
🕌 Prayer Times Smoke Test

📍 Base URL: http://localhost:3000
📅 Date: 2026-02-10 (Europe/Istanbul)

🏙️  Testing cities...
  izmir... ✅ aladhan (05:24 - 20:30)
  istanbul... ✅ aladhan (05:45 - 20:15)
  ankara... ✅ aladhan (05:30 - 19:58)

🏘️  Testing districts...

  izmir (7 districts):
    bornova... ✅ aladhan (05:23 - 20:31)
    karsiyaka... ✅ aladhan (05:24 - 20:30)
    konak... ✅ aladhan (05:24 - 20:30)
    ...

  istanbul (10 districts):
    kadikoy... ✅ aladhan (05:45 - 20:15)
    besiktas... ✅ aladhan (05:45 - 20:16)
    ...
```

### 2. Özet İstatistikler

```
================================================================================
📊 SUMMARY
================================================================================
Total Requests: 20
Successful: 20
Errors: 0
```

### 3. Detaylı Tablo

```
┌─────────┬───────────┬────────────┬──────────────────┬─────────┬───────┬─────────┬────────┬───────┬─────────┬───────┬───────┐
│ (index) │   City    │  District  │      Coords      │ Source  │ Fajr  │ Sunrise │ Dhuhr  │  Asr  │ Maghrib │ Isha  │ Error │
├─────────┼───────────┼────────────┼──────────────────┼─────────┼───────┼─────────┼────────┼───────┼─────────┼───────┼───────┤
│    0    │  'izmir'  │    '-'     │ '38.4237,27.1428'│'aladhan'│'05:24'│ '06:57' │'12:45' │'15:28'│ '17:56' │'19:17'│  '-'  │
│    1    │'istanbul' │    '-'     │ '41.0082,28.9784'│'aladhan'│'05:45'│ '07:21' │'13:02' │'15:39'│ '18:03' │'19:28'│  '-'  │
│   ...   │    ...    │    ...     │       ...        │   ...   │  ...  │   ...   │  ...   │  ...  │   ...   │  ...  │  ...  │
└─────────┴───────────┴────────────┴──────────────────┴─────────┴───────┴─────────┴────────┴───────┴─────────┴───────┴───────┘
```

## Hata Durumları

Script hata durumlarında çökmez, hatayı loglar ve devam eder:

```
  izmir... ✅ aladhan (05:24 - 20:30)
  unknown-city... ❌ HTTP 500: Coordinates not found for city
  ankara... ✅ aladhan (05:30 - 19:58)
```

Son özette kaç hata olduğu raporlanır:

```
Total Requests: 20
Successful: 18
Errors: 2

❌ 2 test(s) failed
```

## Environment Variables

| Variable | Varsayılan | Açıklama |
|----------|-----------|----------|
| `BASE_URL` | `http://localhost:3000` | API base URL |

## Örnek Kullanımlar

### Local Development Test

```bash
# Terminal 1: Dev server başlat
npm run dev

# Terminal 2: Test çalıştır
npm run verify:prayer
```

### Production Verification

```bash
BASE_URL=https://ezanvakti.com npm run verify:prayer
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
- name: Start dev server
  run: npm run dev &
  
- name: Wait for server
  run: npx wait-on http://localhost:3000

- name: Run smoke tests
  run: npm run verify:prayer
```

## Script Detayları

- **Dosya:** `scripts/verify-prayer-times.ts`
- **Runtime:** Node.js + tsx (TypeScript executor)
- **Timeout:** 10 saniye per request
- **Timezone:** Europe/Istanbul
- **Koordinatlar:** `lib/geo/tr.ts`'den alınır

## Troubleshooting

### Port 3000 kullanımda

```bash
# Dev server farklı bir portta çalışıyorsa
BASE_URL=http://localhost:3001 npm run verify:prayer
```

### "MODULE_NOT_FOUND" hatası

```bash
# Bağımlılıkları yeniden kur
npm install
```

### "ECONNREFUSED" hatası

```bash
# Dev server'ın çalıştığından emin ol
npm run dev

# Başka bir terminal'de test çalıştır
npm run verify:prayer
```

## Katkıda Bulunma

Yeni şehir veya ilçe koordinatları eklemek için `lib/geo/tr.ts` dosyasını güncelleyin ve test'i çalıştırın:

```bash
# Yeni koordinat ekle
# lib/geo/tr.ts dosyasını düzenle

# Test et
npm run verify:prayer

# Her şey çalışıyorsa commit et
git add lib/geo/tr.ts
git commit -m "feat: Add new city/district coordinates"
```
