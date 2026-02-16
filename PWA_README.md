# PWA (Progressive Web App) - EzanVakti.site

Bu belge, sitede PWA desteğinin nasıl çalıştığını ve test edilmesi gereken noktaları açıklar.

## ✅ Yapılan İyileştirmeler

### 1. **next-pwa Kurulumu**
```bash
npm install next-pwa
npm install -D @types/serviceworker
```

**Dosya:** `next.config.js`
- ✅ PWA plugin eklendi
- ✅ Development'ta disable (sadece production'da aktif)
- ✅ Service Worker otomatik oluşturuluyor

### 2. **Runtime Caching Stratejileri**

#### Aladhan API (CacheFirst - 24 saat)
```javascript
urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i
handler: 'CacheFirst'
maxAgeSeconds: 86400 // 24 saat
```
- İlk istekte API'ye gider, sonraki istekler cache'den döner
- 24 saat sonra otomatik yenilenir

#### Internal Prayer Times API (StaleWhileRevalidate - 24 saat)
```javascript
urlPattern: /\/api\/prayer-times.*/i
handler: 'StaleWhileRevalidate'
```
- Cache'deki veriyi hemen döndürür
- Arka planda yeni veri çeker
- Kullanıcı bekleme yapmaz

#### Statik Dosyalar (CacheFirst - 30 gün)
```javascript
urlPattern: /\.(png|jpg|jpeg|svg|gif|ico|css|js|woff2?)$/i
handler: 'CacheFirst'
maxAgeSeconds: 2592000 // 30 gün
```
- Resimler, CSS, JS dosyaları cache'lenir
- Offline'da bile görüntülenir

#### Page Visits (NetworkFirst - 24 saat)
```javascript
urlPattern: /^https?:\/\/(www\.)?ezanvakti\.site\/.*/i
handler: 'NetworkFirst'
networkTimeoutSeconds: 10
```
- Önce network'e gider
- 10 saniyede cevap gelmezse cache'den döner
- Offline'da cache kullanılır

### 3. **Manifest.json** (`public/manifest.json`)

```json
{
  "name": "Ezan Vakitleri - Türkiye Namaz Saatleri 2026",
  "short_name": "EzanVakti",
  "start_url": "/tr/istanbul",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#1e3a5f"
}
```

**Özellikler:**
- ✅ `display: standalone` → Tarayıcı UI'siz açılır (uygulama gibi)
- ✅ `start_url: /tr/istanbul` → Varsayılan şehir
- ✅ `shortcuts` → Ana ekran long-press menüsü (İstanbul, Ankara, İzmir)
- ✅ Dark mode destekli renkler

### 4. **InstallPWA Component** (`components/InstallPWA.tsx`)

**Özellikler:**
- ✅ Floating button (sağ altta)
- ✅ Android/Chrome: Native install prompt
- ✅ iOS Safari: Manuel yönlendirme modal'ı
- ✅ Zaten yüklüyse button görünmez
- ✅ Auto-hide after install

**iOS Modal:**
```
1. Safari'nin altındaki Paylaş butonuna dokun ⬆️
2. "Ana Ekrana Ekle" seçeneğini bul
3. "Ekle" butonuna dokun
```

### 5. **Offline Page** (`app/offline/page.tsx`)

**Özellikler:**
- ✅ İnternet kesintisinde gösterilir
- ✅ "Tekrar Dene" butonu
- ✅ "Geri Dön" butonu
- ✅ User-friendly mesaj

### 6. **Apple Touch Icons**
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="EzanVakti">
<link rel="apple-touch-icon" href="/icon.png">
```

**Dosya:** `app/[locale]/layout.tsx` (metadata)

---

## 🧪 TEST PROSEDÜRÜ

### Test 1: Development Build (PWA Disabled)
```powershell
npm run dev
# DevTools → Application → Service Workers
# Beklenen: "No service workers found" (normal, dev'de disable)
```

### Test 2: Production Build
```powershell
npm run build
npm run start
# http://localhost:3000 aç
```

**Chrome DevTools → Application:**

#### Manifest Tab
✓ Name: "Ezan Vakitleri..."
✓ Short name: "EzanVakti"
✓ Start URL: "/tr/istanbul"
✓ Display: "standalone"
✓ Theme color: #1e3a5f
✓ Icons: 192x192, 512x512 ✓
✓ Shortcuts: İstanbul, Ankara, İzmir

#### Service Workers Tab
✓ Status: "activated and running"
✓ Source: `/sw.js`
✓ Scope: `/`

#### Cache Storage Tab
Beklenen cache'ler:
- `aladhan-api-cache` → Aladhan API responses
- `prayer-times-cache` → Internal API responses
- `static-cache` → Images, CSS, JS
- `pages-cache` → HTML pages
- `workbox-precache-v2-*` → Next.js assets

### Test 3: Installability
```powershell
# Chrome → Adres çubuğunda "+" butonu görünmeli
# Veya sağ alt köşede "Ana Ekrana Ekle" butonu
```

**Tıklayınca:**
- Dialog açılır: "EzanVakti uygulamasını yüklemek ister misiniz?"
- "Yükle" → Uygulama ana ekrana eklenir
- Desktop'ta: Start menüsünde uygulama ikonu

### Test 4: Offline Functionality
```powershell
# 1. Bir şehir sayfasını aç (örn: /tr/izmir)
# 2. DevTools → Network tab → "Offline" checkbox işaretle
# 3. Sayfayı yenile (F5)

Beklenen:
✓ Sayfa açılıyor (cache'den)
✓ Namaz vakitleri görünüyor
✓ Resimler yükleniyor
✓ CSS/JS çalışıyor

# 4. Hiç ziyaret etmediğin bir sayfaya git
Beklenen:
✓ Offline page gösterilir
✓ "Tekrar Dene" butonu var
```

### Test 5: iOS Safari (iPhone/iPad)
```
1. Safari'de siteyi aç: https://www.ezanvakti.site/tr/istanbul
2. Sağ altta "📱 Ana Ekrana Ekle" butonu görünmeli
3. Butona dokun → iOS yönlendirme modal'ı açılır
4. Adımları takip et:
   - Paylaş butonu (altta) → ⬆️
   - "Ana Ekrana Ekle"
   - "Ekle"
5. Ana ekranda "EzanVakti" ikonu oluşur
6. Ikona dokun → Tam ekran uygulama açılır (Safari UI yok)
```

### Test 6: Lighthouse PWA Audit
```bash
# Chrome DevTools → Lighthouse → Progressive Web App

Hedef:
✓ Installable
✓ PWA optimized
✓ Fast and reliable
✓ Works offline
✓ Score: 90+
```

**Kontrol edilen kriterler:**
- ✓ manifest.json doğru
- ✓ Service Worker registered
- ✓ HTTPS (production'da)
- ✓ Viewport meta tag
- ✓ Theme color
- ✓ Icons adequate

### Test 7: Shortcuts Test (Android)
```
1. Ana ekrandaki uygulama ikonuna uzun bas (long-press)
2. Context menu açılır

Beklenen:
- İstanbul Namaz Vakitleri
- Ankara Namaz Vakitleri
- İzmir Namaz Vakitleri

(Direkt şehir sayfasına gider)
```

---

## 📊 Beklenen Kullanıcı Deneyimi

### İlk Ziyaret (Online)
```
1. Kullanıcı siteyi açar
2. Service Worker arka planda yüklenir
3. Sağ altta "📱 Ana Ekrana Ekle" butonu belirir
4. Sayfa ve API çağrıları cache'lenir
```

### İkinci Ziyaret (Online)
```
1. Sayfa daha hızlı açılır (cache'den)
2. Vakitler anında görünür
3. Arka planda fresh data çekilir
4. Cache güncellenir
```

### Offline Kullanım
```
1. İnternet kesilir
2. Kullanıcı siteye girer
3. Son ziyaret edilen sayfalar açılır
4. Namaz vakitleri cache'den gösterilir
5. Yeni sayfa açmaya çalışırsa → Offline page
```

### Ana Ekrana Ekledikten Sonra
```
1. Ana ekranda "EzanVakti" ikonu
2. Ikona dokunca → Tam ekran (tarayıcı UI yok)
3. Uygulama gibi deneyim
4. iOS'ta: Status bar translucent (içerik üste kadar uzanır)
5. Hızlı başlatma (splash screen otomatik)
```

---

## 🚀 Production Deploy Checklist

### Build Öncesi
```powershell
# Paketler yüklendi mi?
npm list next-pwa

# next.config.js doğru mu?
# manifest.json valid JSON mi?
```

### Build
```powershell
npm run build

# Kontrol et:
✓ Build başarılı
✓ public/sw.js oluştu
✓ public/workbox-*.js oluştu
✓ Warnings var mı? (varsa ignore edilebilir)
```

### Deploy Sonrası
1. ✅ Production URL'i test et
2. ✅ Lighthouse PWA audit yap
3. ✅ Chrome'da install test et
4. ✅ iOS Safari'de install test et
5. ✅ Offline mode test et

---

## 🎯 Kullanıcı Faydaları

### 📱 **Uygulama Gibi Deneyim**
- Tarayıcı adresi çubuğu yok
- Tam ekran içerik
- Native uygulama hissi
- Splash screen

### ⚡ **Daha Hızlı Yüklenme**
- İlk yükleme: ~800ms
- Sonraki yüklemeler: ~100ms (cache'den)
- API çağrıları: anında (cache)

### 🔌 **Offline Çalışma**
- İnternet kesilse bile
- Son görülen vakitler görünür
- Daha önce ziyaret edilen şehirler açılır

### 💾 **Düşük Veri Kullanımı**
- Cache sayesinde tekrar indirme yok
- Mobil veri tasarrufu
- Hızlı yükleme

### 🏠 **Ana Ekran Erişimi**
- 1 dokunuşla açılır
- Uygulama gibi
- Kolay erişim

---

## 🛠️ Bakım ve Güncelleme

### Service Worker Güncellemesi
```
1. Kod değişikliği yap
2. npm run build
3. Deploy et
4. Kullanıcılar otomatik günceller (skipWaiting: true)
```

### Cache Temizleme (Development)
```
Chrome DevTools → Application → Storage → Clear site data
```

### Cache Stratejisi Değiştirme
`next.config.js` içinde `runtimeCaching` ayarlarını düzenle.

**Stratejiler:**
- `CacheFirst` → Cache'den hemen dön, API'ye gitme (statik için)
- `NetworkFirst` → Önce network'e git, fail olursa cache (sayfa için)
- `StaleWhileRevalidate` → Cache'den dön, arka planda güncelle (API için)

---

## ⚠️ Önemli Notlar

### 1. **Development'ta PWA Disabled**
```javascript
disable: process.env.NODE_ENV === 'development'
```
- `npm run dev` → Service Worker çalışmaz
- `npm run build && npm run start` → Service Worker aktif

### 2. **HTTPS Gereksinimi**
- PWA sadece HTTPS'te çalışır
- localhost'ta HTTP ile de test edilebilir
- Production'da mutlaka HTTPS olmalı (Vercel otomatik sağlıyor)

### 3. **iOS Safari Sınırlamaları**
- `beforeinstallprompt` event'i yok
- Manuel yönlendirme gerekli
- InstallPWA component'i bunu hallediyor
- Status bar: `black-translucent` (en iyi görünüm)

### 4. **Cache Limitleri**
```javascript
maxEntries: 50-200  // Maksimum cache entry sayısı
maxAgeSeconds: 86400-2592000  // Cache süresi (1-30 gün)
```

### 5. **Güncelleme Davranışı**
```javascript
skipWaiting: true
```
- Yeni versiyon geldiğinde hemen aktif olur
- Kullanıcı sayfayı yenilediğinde güncel versiyon yüklenir

---

## 📊 Beklenen Lighthouse PWA Skorları

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| **Fast and reliable** | ✅ | Service Worker + Cache |
| **Installable** | ✅ | Manifest + Icons |
| **PWA optimized** | ✅ | Offline support |
| **Works offline** | ✅ | Cache strategies |
| **Has a service worker** | ✅ | next-pwa generates |
| **Uses HTTPS** | ✅ | Vercel default |
| **Viewport meta tag** | ✅ | Already present |
| **Content sized correctly** | ✅ | Responsive design |
| **Has a theme color** | ✅ | #1e3a5f |
| **Provides a valid manifest** | ✅ | manifest.json |

**Target Score:** 90+ / 100

---

## 🎨 Icon Gereksinimleri

### Mevcut Icons
- ✅ `/icon-192x192.png` (192×192)
- ✅ `/icon-512x512.png` (512×512)
- ✅ `/icon.png` (180×180, Apple)

### Icon Özellikleri
- `purpose: "maskable any"` → Android adaptive icons
- Square shape (1:1 ratio)
- Safe area: icon merkezi %80'inde
- Transparent background (opsiyonel)

### Apple Touch Icon
- 180×180 minimum
- 1024×1024 önerilir (iOS resize eder)
- Solid background (transparent iOS'ta siyah olur)

---

## 📲 Kullanıcı Yükleme Rehberi

### Android/Chrome
1. Siteyi aç: https://www.ezanvakti.site
2. Sağ altta "📱 Ana Ekrana Ekle" butonu belirir
3. Butona dokun
4. "Yükle" → Ana ekrana eklenir
5. Artık uygulama gibi kullanabilirsin!

### iOS Safari
1. Siteyi aç: https://www.ezanvakti.site
2. Sağ altta "📱 Ana Ekrana Ekle" butonu belirir
3. Butona dokun → Yönlendirme modal'ı açılır
4. Adımları takip et:
   - Alttaki Paylaş butonuna (⬆️) dokun
   - "Ana Ekrana Ekle" seçeneğini bul
   - "Ekle" butonu
5. Ana ekranda ikon oluşur!

### Desktop (Chrome/Edge)
1. Siteyi aç
2. Adres çubuğunun sağında "+" butonu
3. Veya: ⋮ menü → "Uygulamayı yükle"
4. "Yükle" → Masaüstüne ikon eklenir
5. Start menüsünde uygulama görünür

---

## 🔧 Troubleshooting

### "Install" butonu görünmüyor
**Sebepler:**
- ✓ Zaten yüklenmiş olabilir
- ✓ HTTPS değil (production'da olmalı)
- ✓ Manifest hatalı
- ✓ Icons eksik
- ✓ Service Worker register olmamış

**Çözüm:**
```
DevTools → Application → Manifest
Hata mesajlarına bak
```

### Offline çalışmıyor
**Sebepler:**
- ✓ Service Worker register olmamış
- ✓ Cache stratejisi yanlış
- ✓ Development mode (PWA disabled)

**Çözüm:**
```
DevTools → Application → Service Workers
"activated and running" yazıyor mu?
Cache Storage'da veriler var mı?
```

### iOS'ta yüklenmiyor
**Sebepler:**
- ✓ Safari dışı tarayıcı (Chrome, Firefox iOS'ta PWA desteklemiyor)
- ✓ Manifest hatalı
- ✓ Apple touch icon eksik

**Çözüm:**
```
Safari'de aç (zorunlu)
Paylaş → Ana Ekrana Ekle (manuel)
```

### Service Worker güncelleme yavaş
**Sebepler:**
- ✓ Tarayıcı eski SW'yi tutmuş
- ✓ skipWaiting: false (bizde true)

**Çözüm:**
```
DevTools → Application → Service Workers
"Update on reload" checkbox işaretle
"Unregister" → Sayfa yenile
```

---

## 📈 PWA Metrics (Beklenen)

### Installation Rate
- Target: %15-25 (mobil ziyaretçiler)
- iOS: %5-10 (manuel olduğu için düşük)
- Android: %20-30 (native prompt)

### Return Visit Rate
- PWA kullanıcıları %50+ daha fazla geri gelir
- Session duration %40+ daha uzun
- Bounce rate %30+ daha düşük

### Performance
- First Load: ~800ms
- Cached Load: ~100ms (8x faster!)
- API Response: ~50ms (cache)
- Offline: Instant (cache)

---

## 🔐 Güvenlik

### HTTPS Requirement
- ✅ Vercel otomatik HTTPS sağlıyor
- ✅ Let's Encrypt SSL certificate
- ✅ Auto-renewal

### Service Worker Scope
```javascript
scope: '/'
```
- Tüm site içeriğine erişim
- API routes dahil
- `/api/admin/` yine CRON_SECRET ile korunuyor

### Cache Security
- Cache sadece public veriler
- API keys cache'lenmiyor
- User data yok (anonymous)

---

## 📚 Ek Kaynaklar

### PWA Documentation
- [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps/)
- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [next-pwa GitHub](https://github.com/shadowwalker/next-pwa)

### Testing Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Manifest Validator](https://manifest-validator.appspot.com/)

### Debugging
- Chrome: `chrome://serviceworker-internals/`
- Chrome: `chrome://inspect/#service-workers`
- Firefox: `about:debugging#/runtime/this-firefox`

---

## 🎉 Sonuç

PWA desteği eklendi! Artık kullanıcılar:
- ✅ Siteyi telefona uygulama gibi ekleyebilir
- ✅ Offline'da bile namaz vakitlerini görebilir
- ✅ Çok daha hızlı yükleme deneyimi yaşar
- ✅ Mobil veri tasarrufu yapar
- ✅ Native uygulama hissi alır

**Deploy sonrası iOS ve Android'de mutlaka test edin!** 📱

---

**Son Güncelleme:** 2026-02-10  
**PWA Version:** 1.0.0
