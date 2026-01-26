# 🚀 PRODUCTION DEPLOYMENT GUIDE

## ✅ Ön Hazırlık Kontrol Listesi

### 1. Build Testi
```bash
npm run build
```
✅ Build başarılı olmalı (365 gün static generation ~10-15 dk sürer)

### 2. Local Test
```bash
npm run start
```
✅ Production build local'de çalışmalı

### 3. Dosya Kontrolü
- ✅ `.env.production` oluşturuldu
- ✅ `vercel.json` eklendi
- ✅ `robots.ts` güncellendi
- ✅ SEO metadata hazır
- ✅ README.md güncellendi

---

## 🌐 VERCEL DEPLOYMENT

### Adım 1: GitHub Repository Oluştur

1. https://github.com/new adresine git
2. Repository adı: `ezanvakti`
3. **Public** seç
4. "Create repository" tıkla

### Adım 2: Kodu GitHub'a Push Et

Terminal'de (Git Bash veya PowerShell):

```bash
cd c:\EZANVAKTI

# Remote ekle (KULLANICI_ADIN yerine kendi kullanıcı adınızı yazın)
git remote add origin https://github.com/KULLANICI_ADIN/ezanvakti.git

# Main branch'e geç
git branch -M main

# Push et
git push -u origin main
```

### Adım 3: Vercel'e Bağlan

1. https://vercel.com adresine git
2. GitHub hesabınla giriş yap
3. "Import Project" veya "New Project" tıkla
4. GitHub'dan `ezanvakti` reposunu seç

### Adım 4: Vercel Ayarları

**Framework Preset:** Next.js (otomatik algılanır)

**Build Command:** 
```
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```
npm install
```

**Environment Variables:**
```
NEXT_PUBLIC_BASE_URL = https://ezanvakti.vercel.app
```

NOT: Vercel otomatik olarak production URL'i atayacak. İlk deploy sonrası URL'i kopyalayıp env variable'a ekleyebilirsiniz.

### Adım 5: Deploy!

"Deploy" butonuna tıkla ve bekle (~2-5 dakika)

---

## 🎉 DEPLOY SONRASI

### 1. URL'i Al

Vercel size şöyle bir URL verecek:
```
https://ezanvakti.vercel.app
```

veya

```
https://ezanvakti-xyz123.vercel.app
```

### 2. Mobil Test

📱 **HTTPS olduğu için pusula özellikleri çalışacak!**

Test edin:
- `https://your-domain.vercel.app` - Ana sayfa
- `https://your-domain.vercel.app/takvim` - Takvim
- `https://your-domain.vercel.app/kible` - Kıble pusulası (MOBİL'den test!)

### 3. SEO Test

Google Search Console'a ekle:
1. https://search.google.com/search-console
2. Property ekle: `https://your-domain.vercel.app`
3. Sitemap submit et: `https://your-domain.vercel.app/sitemap.xml`

---

## 🔧 ÖZEL DOMAIN (OPSİYONEL)

Kendi domain'iniz varsa (örn: ezanvakti.com):

1. Vercel Dashboard > Settings > Domains
2. Domain ekle: `ezanvakti.com`
3. DNS kayıtlarını güncelle (Vercel'in talimatlarına göre)
4. SSL otomatik aktif olacak

---

## 📊 PERFORMANS İZLEME

### Vercel Analytics (Ücretsiz)

Otomatik aktif! Dashboard'da görebilirsiniz:
- Ziyaretçi sayısı
- Sayfa yükleme süreleri
- Core Web Vitals

### Google Analytics (Opsiyonel)

`app/layout.tsx`'e eklenebilir.

---

## ⚠️ ÖNEMLİ NOTLAR

### 1. Build Süresi
- İlk build ~10-15 dakika sürebilir (365 gün + ilçeler)
- Sonraki deploylar daha hızlı (Incremental Static Regeneration)

### 2. Limits (Vercel Free)
- ✅ 100 GB bandwidth/ay
- ✅ 6000 build minutes/ay
- ✅ Unlimited requests
- ✅ Automatic HTTPS

### 3. Güncelleme
Her git push otomatik deploy tetikler!

```bash
git add .
git commit -m "Update prayer times"
git push
```

Vercel otomatik build alıp yayına alır.

---

## 🐛 SORUN GİDERME

### Build Hatası

1. Local'de test edin: `npm run build`
2. Hata loglarını Vercel Dashboard'da kontrol edin
3. Environment variables'ı kontrol edin

### 404 Hatası

- `next.config.js` doğru mu?
- Routing paths doğru mu?

### API Hatası

- Environment variables Vercel'de ekli mi?
- API endpointleri production'da erişilebilir mi?

---

## 📞 DESTEK

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

## ✨ TEBRİKLER!

Projeniz artık canlıda! 🚀🕋

Kıble pusulası özelliği mobil cihazlarda HTTPS sayesinde çalışacak!
