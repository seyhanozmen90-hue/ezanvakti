# 🌍 i18n (Çok Dilli) Altyapı Rehberi

Bu proje **next-intl** kullanarak çok dilli altyapı ile geliştirilmiştir.

## 🎯 Mevcut Durum

- ✅ **Aktif Dil**: Türkçe (tr)
- ✅ **URL Yapısı**: Prefix YOK - `/istanbul/kadikoy` (tr için)
- ✅ **Altyapı**: Hazır ve çalışıyor
- ⏳ **Diğer Diller**: Hazır değil (ama eklenebilir)

## 📁 Dosya Yapısı

```
EZANVAKTI/
├── i18n.ts                      # i18n konfigürasyonu
├── middleware.ts                # Dil yönlendirme
├── messages/
│   ├── tr.json                  # Türkçe çeviriler
│   ├── en.json                  # (Gelecek) İngilizce
│   └── ar.json                  # (Gelecek) Arapça
├── app/
│   └── [locale]/                # Dil parametresi
│       ├── layout.tsx
│       ├── page.tsx
│       └── [il]/[ilce]/page.tsx
└── components/
    └── *.tsx                    # Tüm component'ler i18n kullanıyor
```

## 🔧 Mevcut Yapı

### 1. Desteklenen Diller (i18n.ts)

```typescript
export const locales = ['tr'] as const;
export const defaultLocale = 'tr' as const;
```

### 2. Çeviri Dosyası (messages/tr.json)

```json
{
  "site": {
    "title": "Ezan Vakitleri",
    "subtitle": "Türkiye Namaz Vakitleri 2026"
  },
  "prayerNames": {
    "imsak": "İmsak",
    "gunes": "Güneş"
  }
}
```

### 3. Component Kullanımı

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('site');
  
  return <h1>{t('title')}</h1>; // "Ezan Vakitleri"
}
```

### 4. Server Component

```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'site' });
  
  return <h1>{t('title')}</h1>;
}
```

## 🚀 Yeni Dil Ekleme (İngilizce Örneği)

### Adım 1: i18n.ts Güncelle

```typescript
// i18n.ts
export const locales = ['tr', 'en'] as const; // 'en' ekle
```

### Adım 2: messages/en.json Oluştur

```bash
# Kopyala ve çevir
cp messages/tr.json messages/en.json
```

```json
{
  "site": {
    "title": "Prayer Times",
    "subtitle": "Turkey Prayer Times 2026"
  },
  "prayerNames": {
    "imsak": "Fajr",
    "gunes": "Sunrise",
    "ogle": "Dhuhr",
    "ikindi": "Asr",
    "aksam": "Maghrib",
    "yatsi": "Isha"
  }
}
```

### Adım 3: HEPSI BU KADAR! 🎉

- ✅ Middleware otomatik çalışır
- ✅ Routing hazır
- ✅ Component'ler çevrilmiş
- ✅ URL'ler: `/en/istanbul/besiktas`

## 🔗 URL Yapısı

### Türkçe (Varsayılan - Prefix YOK)
```
/                              → Ana sayfa
/istanbul                      → İstanbul sayfası
/istanbul/kadikoy              → Kadıköy sayfası
```

### İngilizce (Gelecek - Prefix VAR)
```
/en                            → Home page
/en/istanbul                   → Istanbul page
/en/istanbul/kadikoy           → Kadıköy page
```

### Arapça (Gelecek - Prefix VAR)
```
/ar                            → الصفحة الرئيسية
/ar/istanbul                   → صفحة اسطنبول
/ar/istanbul/kadikoy           → صفحة كاديكوي
```

## 📝 Çeviri Anahtarları

### Site Genel

- `site.title` - Site başlığı
- `site.subtitle` - Alt başlık
- `site.description` - Açıklama

### Namaz Vakitleri

- `prayer.nextPrayer` - Bir sonraki vakit
- `prayer.todaysPrayers` - Bugünün vakitleri
- `prayerNames.imsak` - İmsak
- `prayerNames.gunes` - Güneş
- `prayerNames.ogle` - Öğle
- `prayerNames.ikindi` - İkindi
- `prayerNames.aksam` - Akşam
- `prayerNames.yatsi` - Yatsı

### Konum

- `location.select` - Konum seç
- `location.search` - İl ara
- `location.back` - Geri

### Durum

- `status.loading` - Yükleniyor
- `status.error` - Hata
- `status.passed` - Geçti
- `status.approaching` - Yaklaşıyor

## 💡 İpuçları

### 1. Parametreli Çeviri

```typescript
// messages/tr.json
{
  "greeting": "Merhaba {name}"
}

// Component
t('greeting', { name: 'Ali' }) // "Merhaba Ali"
```

### 2. Çoğul Formlar

```typescript
// messages/tr.json
{
  "itemCount": "{count, plural, =0 {Öğe yok} one {1 öğe} other {# öğe}}"
}

// Component
t('itemCount', { count: 5 }) // "5 öğe"
```

### 3. Tarih/Saat Formatı

```typescript
import { useFormatter } from 'next-intl';

const format = useFormatter();
format.dateTime(new Date(), {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

## 🎨 Dil Seçici Ekleme (İleride)

```tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    // Mevcut path'i koru, sadece dili değiştir
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <select value={locale} onChange={(e) => changeLanguage(e.target.value)}>
      <option value="tr">🇹🇷 Türkçe</option>
      <option value="en">🇬🇧 English</option>
      <option value="ar">🇸🇦 العربية</option>
    </select>
  );
}
```

## 🔍 SEO ve Metadata

### hreflang Etiketleri (İleride)

```tsx
// app/[locale]/layout.tsx
export async function generateMetadata({ params: { locale } }) {
  return {
    alternates: {
      languages: {
        'tr': '/',
        'en': '/en',
        'ar': '/ar',
      },
    },
  };
}
```

## ⚠️ Dikkat Edilmesi Gerekenler

1. **Şehir/İlçe İsimleri**: i18n DIŞINDA (data'dan gelir)
2. **Namaz Saatleri**: Sayısal, çevrilmez
3. **Tarih Formatı**: Locale'e göre otomatik
4. **UI Metinleri**: %100 i18n'den

## 📊 Çeviri Durumu

| Dil | Durum | Progress |
|-----|-------|----------|
| 🇹🇷 Türkçe | ✅ Aktif | 100% |
| 🇬🇧 İngilizce | ⏳ Hazırlanıyor | 0% |
| 🇸🇦 Arapça | ⏳ Hazırlanıyor | 0% |

## 🚀 Test

### Türkçe (Şu An)
```bash
http://localhost:3000/istanbul
```

### İngilizce (Gelecek)
```bash
# Aktif olduktan sonra:
http://localhost:3000/en/istanbul
```

## 📞 Yardım

Sorularınız için:
- `messages/tr.json` - Tüm çevirileri görün
- `i18n.ts` - Konfigürasyonu inceleyin
- `middleware.ts` - Routing mantığını anlayın

---

**NOT**: Bu altyapı production-ready ve genişletilebilir! Yeni dil eklemek 5 dakika sürer. 🚀
