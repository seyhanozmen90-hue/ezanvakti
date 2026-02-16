# SEO İyileştirmeleri - EzanVakti.site

Bu belge, sitede yapılan SEO optimizasyonlarını ve test edilmesi gereken noktaları açıklar.

## ✅ Yapılan İyileştirmeler

### 1. **Metadata Base URL**
- Root layout'a `metadataBase` eklendi
- Tüm relative URL'ler otomatik olarak absolute'a çevrilecek
- Base URL: `https://www.ezanvakti.site`

**Dosya:** `app/[locale]/layout.tsx`

### 2. **Title Template**
```typescript
title: {
  default: 'Ezan Vakitleri | Namaz Saatleri',
  template: '%s | Ezan Vakitleri',
}
```
- Her sayfa için dinamik title oluşturulur
- Format: "[Şehir] Namaz Vakitleri 2026 | Ezan Vakitleri"

### 3. **Şehir Sayfası Metadata** (`app/[locale]/[il]/page.tsx`)
- ✅ Unique title her şehir için
- ✅ Dinamik description (imsak, öğle, ikindi saatleri dahil)
- ✅ Canonical URL (`/tr/{city}`)
- ✅ Open Graph tags
- ✅ Twitter Card
- ✅ Structured keywords

**Örnek Title:**
```
İzmir Namaz Vakitleri 2026 | Diyanet Onaylı Ezan Saatleri
```

**Örnek Description:**
```
İzmir namaz vakitleri 2026. Güncel imsak, güneş, öğle, ikindi, akşam, yatsı saatleri. 
Diyanet İşleri Başkanlığı onaylı İzmir ezan vakitleri ve aylık takvim.
```

### 4. **İlçe Sayfası Metadata** (`app/[locale]/[il]/[ilce]/page.tsx`)
- ✅ Unique title her ilçe için
- ✅ Şehir + İlçe kombinasyonlu SEO
- ✅ Canonical URL (`/tr/{city}/{district}`)
- ✅ Selective indexing (önemli ilçeler index, diğerleri noindex)

**Örnek Title:**
```
İzmir Bornova Namaz Vakitleri 2026 | Diyanet Onaylı
```

### 5. **Schema.org JSON-LD** (`app/[locale]/[il]/page.tsx`)

#### Event Schema
Her vakit için ayrı Event nesnesi:
```json
{
  "@type": "Event",
  "name": "İmsak Vakti",
  "startDate": "2026-02-10T06:15:00+03:00",
  "location": {
    "@type": "Place",
    "name": "İzmir"
  }
}
```

#### BreadcrumbList Schema
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "position": 1, "name": "Ana Sayfa", "item": "https://www.ezanvakti.site/tr" },
    { "position": 2, "name": "İzmir Namaz Vakitleri", "item": "https://www.ezanvakti.site/tr/izmir" }
  ]
}
```

#### Schedule Schema
Tüm günlük namaz vakitlerini içeren schedule objesi.

### 6. **Sitemap.xml** (`app/[locale]/sitemap.ts`)
- ✅ Tüm şehir sayfaları dahil
- ✅ Tüm ilçe sayfaları dahil
- ✅ Priority ayarları:
  - Ana sayfa: 1.0
  - Şehirler: 0.9
  - İlçeler: 0.8
  - Kıble: 0.5
- ✅ `changeFrequency: daily`
- ✅ `lastModified`: Her build'de güncellenir

**URL:** `https://www.ezanvakti.site/tr/sitemap.xml`

### 7. **Robots.txt** (`app/[locale]/robots.ts`)
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

Sitemap: https://www.ezanvakti.site/tr/sitemap.xml
```

**URL:** `https://www.ezanvakti.site/robots.txt`

### 8. **Robots Meta Tags**
```typescript
robots: {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}
```

### 9. **Open Graph & Twitter Cards**
- ✅ `og:title`
- ✅ `og:description`
- ✅ `og:url`
- ✅ `og:type: website`
- ✅ `og:locale: tr_TR`
- ✅ `og:site_name: EzanVakti.site`
- ✅ `og:image: /icon-512x512.png`
- ✅ `twitter:card: summary`

### 10. **H1/H2 Hiyerarşisi**
```html
<h1>İzmir Namaz Vakitleri – 10 Şubat 2026</h1>
<h2>Bir Sonraki Vakit: Öğle Namazı</h2>
<h2>Bugünün Namaz Vakitleri</h2>
```
- ✅ Sadece 1 adet H1
- ✅ H2 alt bölümler için

## 🧪 Test Listesi

### 1. **View Source Test**
```bash
# Tarayıcıda aç:
https://www.ezanvakti.site/tr/izmir

# Sağ tık → "Sayfa kaynağını görüntüle"
# Kontrol et:
✓ <title>İzmir Namaz Vakitleri 2026...</title>
✓ <meta name="description" content="İzmir namaz vakitleri...">
✓ <link rel="canonical" href="https://www.ezanvakti.site/tr/izmir">
✓ <meta property="og:title" content="...">
✓ <script type="application/ld+json">
```

### 2. **Sitemap Test**
```bash
# URL'i aç:
https://www.ezanvakti.site/tr/sitemap.xml

# Kontrol et:
✓ XML formatında
✓ Tüm şehirler listeleniyor
✓ <loc> tag'leri doğru
✓ <lastmod> güncel
```

### 3. **Robots.txt Test**
```bash
# URL'i aç:
https://www.ezanvakti.site/robots.txt

# Kontrol et:
✓ User-agent: *
✓ Allow: /
✓ Sitemap URL doğru
```

### 4. **Google Rich Results Test**
```bash
# Test aracı:
https://search.google.com/test/rich-results

# Test URL:
https://www.ezanvakti.site/tr/izmir

# Kontrol et:
✓ Event schema tespit edildi
✓ BreadcrumbList tespit edildi
✓ Hata yok
```

### 5. **Meta Tags Inspector**
```bash
# Araç:
https://metatags.io/

# Test URL:
https://www.ezanvakti.site/tr/izmir

# Kontrol et:
✓ Title doğru
✓ Description doğru
✓ OG image görünüyor
✓ Twitter card preview doğru
```

### 6. **Google Search Console**
1. https://search.google.com/search-console adresine git
2. "URL Inspection" aracını kullan
3. Herhangi bir şehir URL'i test et
4. Kontrol et:
   - ✓ "URL is on Google"
   - ✓ Canonical URL doğru
   - ✓ Indexing allowed

### 7. **Lighthouse SEO Score**
```bash
# Chrome DevTools → Lighthouse
# "SEO" seçeneğini işaretle
# Run audit

# Hedef:
SEO Score: 95+
```

### 8. **Mobile Friendly Test**
```bash
# Test aracı:
https://search.google.com/test/mobile-friendly

# Test URL:
https://www.ezanvakti.site/tr/izmir

# Kontrol et:
✓ "Page is mobile friendly"
```

## 📊 Beklenen SEO Sonuçları

### Google Arama Sonuçları
```
İzmir Namaz Vakitleri 2026 | Diyanet Onaylı Ezan Saatleri
https://www.ezanvakti.site › tr › izmir

İzmir namaz vakitleri 2026. Güncel imsak, güneş, öğle, ikindi, 
akşam, yatsı saatleri. Diyanet İşleri Başkanlığı onaylı İzmir...

Ana Sayfa > İzmir Namaz Vakitleri
```

### Rich Snippets
- ✅ Breadcrumb navigation görünecek
- ✅ Event schema sayesinde "Events" badge (olası)
- ✅ Sitelinks (site içi linkler) Google tarafından otomatik eklenebilir

## 🔧 Ek Öneriler

### 1. **Google Search Console**
- Site'yi ekle ve ownership doğrula
- Sitemap'i submit et: `/tr/sitemap.xml`
- Core Web Vitals'ı takip et

### 2. **Google Analytics / Plausible**
- Hangi şehirler popüler?
- Hangi sayfalar bounce rate yüksek?
- Organik trafik takibi

### 3. **Internal Linking**
- Ana sayfadan top 10 şehre direkt link
- İlgili şehirler bölümü (İzmir'den → Manisa, Aydın, Denizli)
- Footer'da popüler şehirler

### 4. **Content Freshness**
- Ramazan ayı özel sayfa
- Dini günler takvimi
- Blog/Haberler bölümü (opsiyonel)

### 5. **Performance**
- Lighthouse Performance score 90+
- First Contentful Paint < 1.8s
- Time to Interactive < 3.9s

## 📝 Notlar

- **Base URL değişikliği:** Tüm `ezanvakti.com` → `www.ezanvakti.site` güncellendi
- **Locale prefix:** Tüm URL'ler `/tr/` prefix'i ile başlıyor
- **Year dynamic:** Title'larda `2026` dinamik olarak `new Date().getFullYear()` ile ekleniyor
- **Canonical URLs:** Her sayfa için unique canonical URL var
- **No duplicate content:** Canonical tag'ler sayesinde duplicate content sorunu yok

## 🚀 Deploy Sonrası Yapılacaklar

1. ✅ Production'da sitemap.xml kontrol et
2. ✅ robots.txt kontrol et
3. ✅ Google Search Console'a sitemap ekle
4. ✅ Bing Webmaster Tools'a site ekle
5. ✅ Rich Results Test yap
6. ✅ Mobile Friendly Test yap
7. ✅ Lighthouse audit yap
8. 📅 1 hafta sonra Google Search Console'da indexing status kontrol et

---

**Son Güncelleme:** 2026-02-10
**Sorumlu:** SEO Optimization Team
