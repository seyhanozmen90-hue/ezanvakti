# ⚡ Hızlı Başlangıç Rehberi

Bu rehber, projeyi 5 dakikada çalıştırmanıza yardımcı olur.

## 📋 Gereksinimler

- Node.js 18.x veya üzeri ([İndir](https://nodejs.org/))
- npm (Node.js ile birlikte gelir)

## 🚀 Kurulum (3 Adım)

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

### 3. Tarayıcıda Aç

[http://localhost:3000](http://localhost:3000)

🎉 **Tebrikler!** Proje çalışıyor.

## 📂 Proje Yapısı (Basit)

```
EZANVAKTI/
├── app/               # Sayfalar (Next.js App Router)
│   ├── page.tsx       # Ana sayfa
│   ├── [il]/          # İl sayfaları
│   └── [il]/[ilce]/   # İlçe sayfaları
├── components/        # React bileşenleri
├── lib/               # API ve yardımcı fonksiyonlar
│   ├── api.ts         # Diyanet API
│   └── cities.json    # İl/ilçe listesi
└── public/            # Statik dosyalar
```

## 🛠️ Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Production sunucusu |
| `npm run lint` | Kod kontrolü |

## 🎨 Özelleştirme

### Renkler Değiştir

`tailwind.config.ts` dosyasını düzenleyin:

```typescript
colors: {
  primary: {
    // Yeşil-mavi renk paleti
    600: '#0ea5e9',
    700: '#0c4a6e',
  },
}
```

### Şehir Listesi Güncelle

`lib/cities.json` dosyasına yeni şehir/ilçe ekleyin:

```json
{
  "id": "9999",
  "name": "Yeni Şehir",
  "slug": "yeni-sehir",
  "districts": [...]
}
```

## 🐛 Sorun Giderme

### Port zaten kullanımda

```bash
# Farklı port kullan
PORT=3001 npm run dev
```

### Modül bulunamıyor

```bash
# Temizle ve yeniden yükle
rm -rf node_modules .next
npm install
```

### API çalışmıyor

- İnternet bağlantınızı kontrol edin
- Diyanet API'si erişilebilir mi kontrol edin
- Cache süresini artırın (ISR revalidate değeri)

## 📖 Detaylı Dokümantasyon

- 📘 [README.md](./README.md) - Genel bilgiler
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy rehberi
- 🤝 [CONTRIBUTING.md](./CONTRIBUTING.md) - Katkı rehberi

## 💡 Hızlı İpuçları

1. **Dark Mode**: Sağ üstteki ay/güneş ikonuna tıklayın
2. **Şehir Değiştir**: Üstteki lokasyon seçiciden değiştirin
3. **Aylık Tablo**: Sayfanın altındaki "Aylık Namaz Vakitleri" açılır menüsüne tıklayın
4. **PWA**: Chrome'da "Yükle" butonuna tıklayarak uygulamayı yükleyin

## 🎯 Sonraki Adımlar

- ⭐ GitHub'da projeyi yıldızlayın
- 🐛 Bug bulursanız issue açın
- 💡 Özellik öneriniz varsa paylaşın
- 🤝 Katkıda bulunmak için PR gönderin

## ❓ Sorular

Sorularınız için:
- 💬 GitHub Discussions kullanın
- 🐛 GitHub Issues açın

---

İyi geliştirmeler! 🚀
