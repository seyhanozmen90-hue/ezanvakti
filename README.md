# 🕌 Ezan Vakitleri - Türkiye Namaz Vakitleri

Türkiye'nin tüm illeri ve ilçeleri için güncel ezan vakitleri sitesi. Next.js 14 App Router ile geliştirilmiştir.

## ✨ Özellikler

- 🌍 **81 İl + İlçeler**: Türkiye'nin tüm illeri ve ilçeleri için namaz vakitleri
- ⏱️ **Canlı Geri Sayım**: Bir sonraki namaz vaktine kalan süreyi anlık gösterir
- 📅 **Aylık Cetvel**: Tüm ay boyunca namaz vakitlerini görüntüleyin
- 🌙 **Dark/Light Tema**: Gece ve gündüz modları
- 📱 **Responsive Tasarım**: Mobil, tablet ve masaüstü uyumlu
- 🚀 **PWA Desteği**: Uygulama gibi kullanılabilir
- ⚡ **Hızlı ve Performanslı**: Next.js 14 ve ISR ile optimize edilmiş
- 🔍 **SEO Roket**: Her şehir için özel sayfalar, JSON-LD, Open Graph, sitemap.xml
- 🕋 **Diyanet Onaylı**: Diyanet İşleri Başkanlığı API'si kullanılmaktadır

## 🚀 Kurulum

### Gereksinimler

- Node.js 18.x veya üzeri
- npm veya yarn

### Adımlar

1. Bağımlılıkları yükleyin:

```bash
npm install
# veya
yarn install
```

2. Geliştirme sunucusunu başlatın:

```bash
npm run dev
# veya
yarn dev
```

3. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın

## 📦 Production Build

```bash
npm run build
npm start
# veya
yarn build
yarn start
```

## 🏗️ Proje Yapısı

```
EZANVAKTI/
├── app/
│   ├── [il]/
│   │   ├── [ilce]/
│   │   │   └── page.tsx      # İlçe sayfası
│   │   └── page.tsx           # İl sayfası
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Ana sayfa (İstanbul)
│   ├── globals.css            # Global stiller
│   ├── not-found.tsx          # 404 sayfası
│   ├── sitemap.ts             # Dinamik sitemap
│   └── robots.ts              # Robots.txt
├── components/
│   ├── CountdownTimer.tsx     # Geri sayım komponenti
│   ├── PrayerTimeCard.tsx     # Vakit kartı
│   ├── MonthlyTable.tsx       # Aylık tablo
│   ├── ThemeToggle.tsx        # Tema değiştirici
│   └── CitySelector.tsx       # İl/ilçe seçici
├── lib/
│   ├── api.ts                 # Diyanet API fonksiyonları
│   ├── cities.json            # İl/ilçe veritabanı
│   ├── cities-helper.ts       # İl/ilçe yardımcı fonksiyonlar
│   ├── types.ts               # TypeScript tipleri
│   └── utils.ts               # Yardımcı fonksiyonlar
└── public/
    ├── manifest.json          # PWA manifest
    └── icon.svg               # Logo
```

## 🔧 Teknolojiler

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Diyanet İşleri Başkanlığı API
- **Deployment**: Vercel (önerilen)

## 📱 PWA Desteği

Site, Progressive Web App (PWA) olarak kurulabilir:

1. Chrome/Edge'de sağ üst köşedeki "Yükle" butonuna tıklayın
2. Mobil cihazlarda "Ana ekrana ekle" seçeneğini kullanın

## 🔄 Cache Stratejisi

- **ISR (Incremental Static Regeneration)**: Her sayfa 1 saat (3600 saniye) süreyle cache'lenir
- Sayfalar build sırasında statik olarak oluşturulur
- Her 1 saatte bir yeniden oluşturulur

## 🌐 SEO Özellikleri

- Benzersiz title ve description tagları
- Open Graph meta tagları
- Twitter Card desteği
- Canonical URL'ler
- JSON-LD schema markup (yakında)
- Dinamik sitemap.xml
- Robots.txt

## 📊 API Kullanımı

Proje Diyanet İşleri Başkanlığı'nın resmi API'sini kullanır:

```
https://api.diyanet.gov.tr/api/PrayerTime/GetPrayerTimes?districtID={id}
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

## 🎯 SEO Index/Noindex Kontrolü

**YENİ ÖZELLIK:** İlçe sayfaları için kontrollü indexleme sistemi!

### Nasıl Çalışır?

**Şehir Sayfaları:** Her zaman INDEX ✅
- `/istanbul` → INDEX
- `/ankara` → INDEX
- Tüm 81 il → INDEX

**İlçe Sayfaları:** Seçici INDEX 🎚️
- Varsayılan: NOINDEX ❌
- Config'e eklenenler: INDEX ✅

### Kontrol Merkezi

**Dosya:** `lib/seo.config.ts`

```typescript
export const indexedDistricts = {
  istanbul: ['kadikoy', 'besiktas'],  // ✅ INDEX
  ankara: ['cankaya'],                 // ✅ INDEX
  // Listeye eklemediniz? → ❌ NOINDEX
};
```

### Test Etme

```bash
# INDEX edilmiş (listede var)
curl http://localhost:3000/istanbul/kadikoy
# → Robots: index, follow ✅

# NOINDEX (listede yok)
curl http://localhost:3000/istanbul/adalar
# → Robots: noindex, follow ❌
```

**Detaylı Rehber:** [SEO_INDEXING.md](./SEO_INDEXING.md) 📖

---

## 🚀 SEO Optimizasyonu

Bu proje, Google ve diğer arama motorları için **tamamen optimize edilmiştir**:

### ✅ Uygulanan SEO İyileştirmeleri

1. **Şehir Bazlı Sayfalar**: Her şehir için ayrı sayfa (`/istanbul`, `/ankara`, vs.)
2. **İlçe Bazlı Sayfalar**: 900+ ilçe için ayrı sayfalar (`/istanbul/kadikoy`)
3. **Meta Tags**: Her sayfa için unique title, description, keywords
4. **Open Graph**: Sosyal medya paylaşımları için optimize
5. **Twitter Card**: Twitter paylaşımları için özel kartlar
6. **JSON-LD Structured Data**: Google'ın sayfayı anlaması için yapılandırılmış veri
7. **Sitemap.xml**: Otomatik oluşturulan, saatlik güncelenen sitemap
8. **Robots.txt**: Arama motoru botları için yönlendirme
9. **Canonical URLs**: Duplicate content engelleme
10. **Mobile-First**: Mobil cihazlar öncelikli tasarım

### 📊 Beklenen SEO Performansı

- Lighthouse SEO Score: **100/100** ✅
- Core Web Vitals: **Pass** ✅
- Mobile Friendly: **Pass** ✅
- Structured Data: **Valid** ✅

### 🔧 SEO Kurulumu

Detaylı SEO kurulum ve optimizasyon rehberi için [SEO.md](./SEO.md) dosyasına bakın.

**Hızlı Kurulum:**

1. `.env.local` dosyası oluşturun:
```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

2. Google Search Console verification (opsiyonel)

3. Deploy sonrası sitemap'i Google'a submit edin

## 🙏 Teşekkürler

- Diyanet İşleri Başkanlığı - API sağladığı için
- Next.js ekibi - Harika framework için
- Tailwind CSS ekibi - Mükemmel CSS framework için

---

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!
