# 🚀 SEO Optimizasyonu Rehberi

Bu proje, Google ve diğer arama motorları için tamamen optimize edilmiştir.

## ✅ Uygulanan SEO İyileştirmeleri

### 1. **Şehir Bazlı Sayfalar**

Her şehir için ayrı sayfa ve SEO:
- `/istanbul` - İstanbul Ezan Vakitleri
- `/ankara` - Ankara Ezan Vakitleri  
- `/izmir` - İzmir Ezan Vakitleri
- ... ve tüm Türkiye illeri

### 2. **İlçe Bazlı Sayfalar**

Her ilçe için ayrı sayfa:
- `/istanbul/kadikoy` - Kadıköy Ezan Vakitleri
- `/ankara/cankaya` - Çankaya Ezan Vakitleri
- ... 900+ ilçe sayfası

### 3. **Meta Tags (Her Sayfa İçin)**

```html
<title>İstanbul Ezan Vakitleri | Namaz Saatleri 2026</title>
<meta name="description" content="İstanbul için güncel ezan vakitleri. İmsak: 06:15, Öğle: 13:10...">
<meta name="keywords" content="istanbul ezan vakitleri, istanbul namaz vakitleri...">
```

### 4. **Open Graph Tags (Sosyal Medya)**

Facebook, WhatsApp, Telegram paylaşımları için:

```html
<meta property="og:title" content="İstanbul Ezan Vakitleri">
<meta property="og:description" content="İstanbul için güncel namaz vakitleri">
<meta property="og:image" content="/icon-512x512.png">
<meta property="og:url" content="https://ezanvakti.com/istanbul">
```

### 5. **Twitter Card**

Twitter paylaşımları için optimize edilmiş:

```html
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="İstanbul Ezan Vakitleri">
<meta name="twitter:image" content="/icon-512x512.png">
```

### 6. **JSON-LD Structured Data**

Google'ın sayfayı anlaması için yapılandırılmış veri:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "İstanbul Ezan Vakitleri",
  "mainEntity": {
    "@type": "Schedule",
    "event": [
      {
        "@type": "Event",
        "name": "İmsak",
        "startDate": "2026-01-25T06:15:00+03:00"
      }
      // ... diğer vakitler
    ]
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [...]
  }
}
```

### 7. **Sitemap.xml**

Otomatik oluşturulan sitemap:
- Ana sayfa
- 81 il sayfası
- 900+ ilçe sayfası
- Saatlik güncelleme

Erişim: `https://ezanvakti.com/sitemap.xml`

### 8. **Robots.txt**

Arama motorları için yönlendirme:

```
User-agent: *
Allow: /

Sitemap: https://ezanvakti.com/sitemap.xml
```

Erişim: `https://ezanvakti.com/robots.txt`

### 9. **Canonical URLs**

Duplicate content problemini önler:

```html
<link rel="canonical" href="https://ezanvakti.com/istanbul">
```

### 10. **Mobile-First & Responsive**

- Mobil cihazlar için optimize
- Fast loading
- Core Web Vitals uyumlu

## 🔧 Kurulum Sonrası Yapılacaklar

### 1. Google Search Console Ekleme

1. [Google Search Console](https://search.google.com/search-console) hesabı açın
2. Sitenizi ekleyin
3. Verification code'u alın
4. `.env.local` dosyasına ekleyin:

```bash
NEXT_PUBLIC_GOOGLE_VERIFICATION=your_verification_code_here
```

5. `app/[locale]/page.tsx` dosyasında verification kodunu güncelleyin

### 2. Base URL Ayarlama

Production için `.env.production` oluşturun:

```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. Sitemap Güncelleme

`app/[locale]/sitemap.ts` dosyasında base URL'i güncelleyin:

```typescript
const baseUrl = 'https://your-domain.com';
```

### 4. Google Analytics (Opsiyonel)

Google Analytics eklemek için:

1. `app/[locale]/layout.tsx` dosyasına GA script'i ekleyin
2. Tracking ID'nizi `.env.local`'e ekleyin

## 📊 SEO Performans Metrikleri

### Target Metrikler

- **Lighthouse SEO Score:** 100/100 ✅
- **Core Web Vitals:** Pass ✅
- **Mobile Friendly:** Pass ✅
- **Structured Data:** Valid ✅

### Test Araçları

1. **Google Lighthouse**
   - Chrome DevTools > Lighthouse
   - Run audit for SEO

2. **Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - Test your pages for structured data

3. **Google Mobile-Friendly Test**
   - https://search.google.com/test/mobile-friendly
   - Check mobile optimization

4. **PageSpeed Insights**
   - https://pagespeed.web.dev/
   - Measure Core Web Vitals

## 🎯 Hedef Anahtar Kelimeler

### Ana Sayfa
- ezan vakitleri
- namaz vakitleri
- namaz saatleri
- ezan vakitleri 2026

### Şehir Sayfaları
- {şehir} ezan vakitleri
- {şehir} namaz vakitleri
- {şehir} namaz saatleri
- {şehir} imsak vakti
- {şehir} akşam ezanı

### İlçe Sayfaları
- {şehir} {ilçe} ezan vakitleri
- {şehir} {ilçe} namaz vakitleri
- {ilçe} ezan vakitleri

## 📈 Beklenen Sonuçlar

1. **İlk Ay:** Google'da indexlenme başlar
2. **2-3 Ay:** İlk sıralamalar gelmeye başlar
3. **6 Ay:** Şehir bazlı aramalarda ilk 10'da
4. **1 Yıl:** Çoğu şehir için ilk 3'te

## 💡 İpuçları

1. **Content is King:** Düzenli olarak content güncelleyin
2. **Backlinks:** Diyanet, cami dernekleri gibi sitelerden link alın
3. **Social Signals:** Sosyal medyada paylaşın
4. **User Experience:** Site hızını ve kullanılabilirliği optimize edin
5. **Local SEO:** Google My Business kaydı oluşturun

## 🔍 İzleme ve Analiz

### Google Search Console'da İzlenecekler

1. **Search Performance**
   - Impressions (Gösterim)
   - Clicks (Tıklama)
   - CTR (Click-Through Rate)
   - Average Position (Ortalama Sıralama)

2. **Coverage**
   - Indexed pages
   - Crawl errors
   - Sitemap status

3. **Core Web Vitals**
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

## ✅ SEO Checklist

- [x] Meta titles optimize edildi
- [x] Meta descriptions eklendi
- [x] Keywords belirlendi
- [x] Open Graph tags eklendi
- [x] Twitter Card eklendi
- [x] JSON-LD structured data eklendi
- [x] Sitemap.xml oluşturuldu
- [x] Robots.txt eklendi
- [x] Canonical URLs ayarlandı
- [x] Mobile-responsive design
- [x] Fast loading (< 3s)
- [ ] Google Search Console verification
- [ ] Google Analytics ekleme (opsiyonel)
- [ ] Backlink strategy

## 🚀 Deployment Sonrası

1. Sitemap'i Google'a submit edin
2. İlk indexleme için "Request Indexing" yapın
3. Core Web Vitals'ı kontrol edin
4. Structured data testlerini yapın
5. Haftada bir performance takibi yapın

---

**Not:** SEO bir maraton, sprint değildir. Sabırlı olun ve düzenli takip edin! 🎯
