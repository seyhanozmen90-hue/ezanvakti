# 📁 Proje Yapısı Detaylı Dokümantasyon

Bu dosya, Ezan Vakitleri projesinin dosya yapısını ve her dosyanın amacını detaylı olarak açıklar.

## 🗂️ Klasör Yapısı

```
EZANVAKTI/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 [il]/                     # Dinamik il rotası
│   │   ├── 📁 [ilce]/               # Dinamik ilçe rotası
│   │   │   └── page.tsx             # İlçe sayfası (/istanbul/kadikoy)
│   │   └── page.tsx                 # İl sayfası (/istanbul)
│   ├── error.tsx                    # Global hata sayfası
│   ├── globals.css                  # Global CSS stilleri
│   ├── layout.tsx                   # Root layout (tüm sayfalar için)
│   ├── loading.tsx                  # Global loading state
│   ├── not-found.tsx                # 404 sayfası
│   ├── page.tsx                     # Ana sayfa (/)
│   ├── robots.ts                    # robots.txt generator
│   └── sitemap.ts                   # sitemap.xml generator
│
├── 📁 components/                   # React Bileşenleri
│   ├── CitySelector.tsx             # İl/İlçe seçici dropdown
│   ├── CountdownTimer.tsx           # Geri sayım timer
│   ├── JsonLd.tsx                   # JSON-LD schema wrapper
│   ├── Loading.tsx                  # Loading spinner
│   ├── MonthlyTable.tsx             # Aylık namaz vakitleri tablosu
│   ├── PrayerTimeCard.tsx           # Tek bir vakit kartı
│   └── ThemeToggle.tsx              # Dark/Light tema değiştirici
│
├── 📁 lib/                          # Yardımcı Fonksiyonlar & Data
│   ├── api.ts                       # Diyanet API fonksiyonları
│   ├── cities-helper.ts             # Şehir/ilçe helper fonksiyonları
│   ├── cities.json                  # Şehir ve ilçe veritabanı
│   ├── schema.ts                    # JSON-LD schema generators
│   ├── types.ts                     # TypeScript tip tanımları
│   └── utils.ts                     # Genel utility fonksiyonları
│
├── 📁 public/                       # Statik Dosyalar
│   ├── apple-icon.png               # Apple touch icon (180x180)
│   ├── icon-192x192.png             # PWA icon (192x192)
│   ├── icon-512x512.png             # PWA icon (512x512)
│   ├── icon.png                     # Favicon
│   ├── icon.svg                     # SVG logo
│   └── manifest.json                # PWA manifest dosyası
│
├── 📄 .eslintrc.json                # ESLint yapılandırması
├── 📄 .gitignore                    # Git ignore dosyası
├── 📄 CONTRIBUTING.md               # Katkı rehberi
├── 📄 DEPLOYMENT.md                 # Deploy rehberi
├── 📄 next.config.js                # Next.js yapılandırması
├── 📄 package.json                  # NPM dependencies
├── 📄 postcss.config.js             # PostCSS yapılandırması
├── 📄 PROJECT_STRUCTURE.md          # Bu dosya
├── 📄 QUICKSTART.md                 # Hızlı başlangıç rehberi
├── 📄 README.md                     # Ana dokümantasyon
├── 📄 tailwind.config.ts            # Tailwind CSS yapılandırması
└── 📄 tsconfig.json                 # TypeScript yapılandırması
```

## 📝 Dosya Açıklamaları

### 🔵 App Router (app/)

#### `app/layout.tsx`
- **Amaç**: Tüm sayfalar için ortak layout
- **İçerik**: HTML structure, font, metadata, theme provider
- **Özellikler**: SEO meta tags, PWA manifest, responsive viewport

#### `app/page.tsx`
- **Amaç**: Ana sayfa (İstanbul default)
- **Route**: `/`
- **Özellikler**: Bugünün vakitleri, geri sayım, aylık tablo
- **ISR**: 1 saat cache (revalidate: 3600)

#### `app/[il]/page.tsx`
- **Amaç**: İl sayfaları
- **Route**: `/istanbul`, `/ankara`, vb.
- **Dinamik**: generateStaticParams ile build time'da oluşturulur
- **Özellikler**: İl bazlı namaz vakitleri

#### `app/[il]/[ilce]/page.tsx`
- **Amaç**: İlçe sayfaları
- **Route**: `/istanbul/kadikoy`, `/ankara/cankaya`, vb.
- **Dinamik**: Tüm il-ilçe kombinasyonları için static pages
- **Özellikler**: İlçe bazlı namaz vakitleri, breadcrumb

#### `app/error.tsx`
- **Amaç**: Hata yakalama boundary
- **Client Component**: `'use client'` kullanır
- **Özellikler**: Retry butonu, ana sayfaya dön linki

#### `app/loading.tsx`
- **Amaç**: Loading state (React Suspense)
- **Gösterilir**: Sayfa yüklenirken
- **Tasarım**: Spinner + "Yükleniyor" mesajı

#### `app/not-found.tsx`
- **Amaç**: 404 sayfası
- **Tetiklenme**: Geçersiz il/ilçe URL'leri
- **Özellikler**: Ana sayfaya yönlendirme

#### `app/sitemap.ts`
- **Amaç**: SEO için dinamik sitemap oluşturur
- **URL**: `/sitemap.xml`
- **İçerik**: Tüm il ve ilçe sayfaları

#### `app/robots.ts`
- **Amaç**: Arama motorları için robots.txt
- **URL**: `/robots.txt`
- **İçerik**: Sitemap linki, crawl izinleri

#### `app/globals.css`
- **Amaç**: Global CSS stilleri
- **İçerik**: Tailwind directives, custom scrollbar, smooth scroll

### 🟢 Components (components/)

#### `CountdownTimer.tsx`
- **Tip**: Client Component
- **Amaç**: Bir sonraki vakte kalan süreyi gösterir
- **Özellikler**: 
  - Her saniye güncelleme (setInterval)
  - Saat, dakika, saniye kartları
  - Vakti girdiğinde "Vakit girdi" gösterir

#### `PrayerTimeCard.tsx`
- **Tip**: Client Component
- **Amaç**: Tek bir namaz vaktini gösterir
- **Özellikler**:
  - "Yaklaşıyor" badge (bir sonraki vakit)
  - "Geçti" badge (geçmiş vakitler)
  - Hover efektleri

#### `MonthlyTable.tsx`
- **Tip**: Client Component
- **Amaç**: Aylık namaz vakitleri tablosu
- **Özellikler**:
  - Açılır/kapanır (accordion)
  - Bugünü highlight eder
  - Responsive tablo
  - Hicri takvim gösterimi

#### `ThemeToggle.tsx`
- **Tip**: Client Component
- **Amaç**: Dark/Light tema değiştirici
- **Özellikler**:
  - LocalStorage ile tema kaydı
  - System preference desteği
  - Smooth geçişler
  - Güneş/ay ikonları

#### `CitySelector.tsx`
- **Tip**: Client Component
- **Amaç**: İl ve ilçe seçimi için dropdown
- **Özellikler**:
  - 2 adımlı seçim (önce il, sonra ilçe)
  - Arama/filter özelliği
  - Keyboard navigation
  - Outside click ile kapanma

#### `JsonLd.tsx`
- **Tip**: Server Component
- **Amaç**: JSON-LD schema wrapper
- **Kullanım**: SEO için structured data

#### `Loading.tsx`
- **Tip**: Server Component
- **Amaç**: Yeniden kullanılabilir loading component
- **Tasarım**: Spinner animasyonu

### 🔴 Library (lib/)

#### `api.ts`
- **Amaç**: Diyanet API entegrasyonu
- **Fonksiyonlar**:
  - `fetchPrayerTimes()`: API'den veri çekme
  - `getTodayPrayerTimes()`: Bugünün vakitleri
  - `getMonthlyPrayerTimes()`: Aylık vakitler
- **Cache**: ISR ile 1 saat cache

#### `cities.json`
- **Amaç**: Şehir ve ilçe veritabanı
- **Format**: JSON
- **İçerik**: 81 il + ilçeler, ID'ler, slug'lar

#### `cities-helper.ts`
- **Amaç**: Şehir/ilçe işlemleri
- **Fonksiyonlar**:
  - `getAllCities()`: Tüm şehirler
  - `getCityBySlug()`: Slug'dan şehir bul
  - `getDistrictBySlug()`: İlçe bul
  - `getAllCityDistrictCombinations()`: Sitemap için

#### `types.ts`
- **Amaç**: TypeScript tip tanımları
- **Tipler**:
  - `City`, `District`: Şehir/ilçe tipleri
  - `PrayerTime`: Namaz vakti tipi
  - `PrayerName`: Vakit isimleri enum

#### `utils.ts`
- **Amaç**: Genel yardımcı fonksiyonlar
- **Fonksiyonlar**:
  - `getNextPrayerTime()`: Bir sonraki vakti bul
  - `calculateTimeRemaining()`: Geri sayım hesapla
  - `formatTimeRemaining()`: Süre formatlama
  - `isPrayerTimePassed()`: Vakit geçti mi?
  - `formatDate()`: Tarih formatlama
  - `formatHijriDate()`: Hicri tarih

#### `schema.ts`
- **Amaç**: JSON-LD schema generators
- **Fonksiyonlar**:
  - `generateLocalBusinessSchema()`: LocalBusiness schema
  - `generatePrayerTimesSchema()`: Vakit listesi schema
  - `generateBreadcrumbSchema()`: Breadcrumb schema

### 🟡 Configuration Files

#### `next.config.js`
- Next.js yapılandırması
- Image optimization ayarları

#### `tailwind.config.ts`
- Tailwind CSS yapılandırması
- Custom renkler (primary, accent)
- Dark mode: 'class'

#### `tsconfig.json`
- TypeScript yapılandırması
- Path aliases (@/*)
- Strict mode aktif

#### `package.json`
- Proje dependencies
- Scripts (dev, build, start, lint)
- Versiyon bilgisi

#### `postcss.config.js`
- PostCSS yapılandırması
- Tailwind ve Autoprefixer

#### `.eslintrc.json`
- ESLint kuralları
- Next.js core-web-vitals

#### `.gitignore`
- Git'in ignore edeceği dosyalar
- node_modules, .next, .env, vb.

### 🟣 Public Files

#### `manifest.json`
- PWA manifest
- App ismi, renkler, ikonlar
- Standalone display mode

#### Icon Dosyaları
- `icon.svg`: Vector logo
- `icon.png`: 32x32 favicon
- `icon-192x192.png`: PWA small icon
- `icon-512x512.png`: PWA large icon
- `apple-icon.png`: Apple touch icon

## 🔄 Data Flow

```
User Request
    ↓
Next.js Router (App Router)
    ↓
Page Component (SSG/ISR)
    ↓
API Layer (lib/api.ts)
    ↓
Diyanet API
    ↓
Data Processing (lib/utils.ts)
    ↓
Components (components/)
    ↓
Rendered Page
```

## 🎯 Rendering Strategies

| Route | Strategi | Cache | Açıklama |
|-------|----------|-------|----------|
| `/` | SSG + ISR | 1 saat | Ana sayfa, build'de oluşturulur |
| `/[il]` | SSG + ISR | 1 saat | Tüm iller build'de oluşturulur |
| `/[il]/[ilce]` | SSG + ISR | 1 saat | Tüm ilçeler build'de oluşturulur |

## 📦 Bundle Size Optimization

- **Tree Shaking**: Kullanılmayan kod otomatik kaldırılır
- **Code Splitting**: Her route ayrı bundle
- **Dynamic Imports**: Lazy loading için
- **Image Optimization**: next/image ile otomatik
- **Font Optimization**: next/font ile otomatik

## 🚀 Build Process

```bash
npm run build
```

1. TypeScript compilation
2. Tailwind CSS processing
3. Static page generation (SSG)
4. Image optimization
5. Bundle minification
6. Sitemap generation

## 📊 Performance Metrics

- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.8s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 100KB (initial)

---

Bu dokümantasyon projenin yapısını anlamanıza yardımcı olur. Sorularınız için issue açabilirsiniz.
