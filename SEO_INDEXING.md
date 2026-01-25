# 🎯 SEO Index/Noindex Stratejisi

Bu proje, Google indexlemesini **kontrollü bir şekilde** yönetir.

## 🎛️ Kontrol Merkezi

**Dosya:** `lib/seo.config.ts`

Bu dosyada hangi ilçelerin Google'da görüneceğini kontrol ediyorsunuz.

## 📊 Mevcut Durum

### ✅ Her Zaman INDEX (Google'da Görünür)

1. **Ana Sayfa:** `/` 
2. **Tüm Şehir Sayfaları:** `/istanbul`, `/ankara`, vs. (81 il)

### 🎚️ Seçici INDEX (Kontrollü)

**İlçe Sayfaları:** `/istanbul/kadikoy`, `/ankara/cankaya`, vs.

- **Varsayılan:** NOINDEX (Google'da görünmez)
- **Config'e eklenirse:** INDEX (Google'da görünür)

## 🔧 Nasıl Kullanılır?

### 1. İlçe Index Etmek İçin

`lib/seo.config.ts` dosyasını açın:

```typescript
export const indexedDistricts: Record<string, string[]> = {
  istanbul: [
    'kadikoy',    // ✅ INDEX
    'besiktas',   // ✅ INDEX
    'uskudar',    // ✅ INDEX
  ],
  
  ankara: [
    'cankaya',    // ✅ INDEX
  ],
};
```

### 2. Yeni Şehir Eklemek

```typescript
export const indexedDistricts: Record<string, string[]> = {
  // ... mevcut şehirler
  
  // Yeni şehir
  bursa: [
    'osmangazi',
    'nilufer',
  ],
};
```

### 3. İlçeyi Index'ten Çıkarmak

İlçe adını config'den silin. Sayfa çalışmaya devam eder ama Google'da görünmez.

## 📈 Strateji Önerileri

### Aşama 1: Başlangıç (İlk Ay)
```
✅ 81 şehir sayfası (INDEX)
✅ 50-100 ana ilçe (INDEX)
❌ Geri kalan ~850 ilçe (NOINDEX)
```

**Neden?**
- Google "thin content" cezası riskini azaltır
- İçerik kalitesini korur
- Trafik verilerini toplamaya başlar

### Aşama 2: Genişleme (2-3 Ay)
```
Trafik verilerine göre:
- Ziyaret edilen ilçeleri index'e ekle
- Bounce rate yüksek olanları beklet
```

### Aşama 3: Optimizasyon (6 Ay+)
```
Performance verilerine göre:
- Conversion yüksek ilçeleri önceliklendir
- Zero-traffic ilçeleri gözden geçir
```

## 🎯 Hedef Metrikler

| Metrik | Hedef | Durum |
|--------|-------|-------|
| **Indexed City Pages** | 81/81 | ✅ 100% |
| **Indexed District Pages** | ~100 | 🎚️ Ayarlanabilir |
| **SEO Score** | 100/100 | ✅ |
| **Crawl Budget** | Optimize | ✅ |

## 📝 Teknik Detaylar

### Şehir Sayfası (/istanbul)

```typescript
robots: {
  index: true,  // HER ZAMAN INDEX
  follow: true,
}
```

### İlçe Sayfası (/istanbul/kadikoy)

```typescript
const shouldIndex = isDistrictIndexed('istanbul', 'kadikoy');

robots: {
  index: shouldIndex,  // CONFIG'e GÖRE
  follow: true,        // HER ZAMAN FOLLOW
}
```

## 🔍 Test Etme

### 1. Index Edilmiş İlçe

```bash
curl -I https://ezanvakti.com/istanbul/kadikoy
```

Sonuç:
```
✅ Canonical URL var
✅ Robots: index, follow
✅ Google'a submit edilebilir
```

### 2. Noindex İlçe

```bash
curl -I https://ezanvakti.com/istanbul/adalar
```

Sonuç:
```
❌ Canonical URL yok
✅ Robots: noindex, follow
❌ Google'da görünmez
```

## 📊 İstatistikler

### Şu An Index Edilen İlçeler

```typescript
// lib/seo.config.ts dosyasında

getTotalIndexedDistricts()  // Toplam index edilen ilçe sayısı
getIndexedDistrictCount('istanbul')  // İstanbul'da index edilen ilçe sayısı
getIndexedDistricts('ankara')  // Ankara'nın index edilmiş ilçeleri
```

### Mevcut Dağılım

- **İstanbul:** 10 ilçe index
- **Ankara:** 5 ilçe index
- **İzmir:** 5 ilçe index
- **Bursa:** 3 ilçe index
- **Antalya:** 3 ilçe index
- **Diğer:** Toplamda ~50-60 ilçe

**Toplam:** ~60-70 ilçe index edilmiş (900+ ilçe içinden)

## ⚠️ Önemli Notlar

### ✅ Doğru Kullanım

```typescript
// Popüler ilçeleri ekle
istanbul: ['kadikoy', 'besiktas', 'uskudar']

// Yavaş yavaş genişlet
istanbul: ['kadikoy', 'besiktas', 'uskudar', 'sisli', 'beyoglu']
```

### ❌ Yanlış Kullanım

```typescript
// TÜM ilçeleri birden ekleme
istanbul: ['adalar', 'arnavutkoy', 'atasehir', ...] // 39 ilçe
```

**Neden yanlış?**
- Google crawl budget'i tükenir
- Thin content riski artar
- Sıralama düşer

## 🚀 Deployment Kontrol Listesi

Yeni ilçe ekledikten sonra:

- [ ] `lib/seo.config.ts` dosyasını güncelle
- [ ] Build al: `npm run build`
- [ ] Robots tag'i kontrol et (curl veya tarayıcı)
- [ ] Google Search Console'a submit et
- [ ] 1-2 hafta bekle ve trafik verilerini analiz et

## 📞 Destek

Sorular için:
- SEO.md - Genel SEO rehberi
- QUICKSTART.md - Hızlı başlangıç

---

✨ **İyi SEO stratejisi sabır gerektirir. Yavaş ve kontrollü büyüyün!**
