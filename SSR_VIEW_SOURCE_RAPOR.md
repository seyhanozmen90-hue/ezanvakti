# View-Source Boş – SSR ve Veri Akışı Raporu

## 1. İncelenen dosyalar

### Şehir sayfası
- **Dosya:** `app/[locale]/[il]/page.tsx`
- **"use client":** YOK (sayfa Server Component)
- **async/await:** VAR – `export default async function CityPage({ params })` ve tüm veri `await` ile çekiliyor:
  - `await tryFetchPrayerTimesFromDiyanet(city.id)`
  - `await getPrayerTimes({ city_slug, date, ... })`
  - `await getTodayPrayerTimes(city.id)` / `await getMonthlyPrayerTimes(city.id)`

### Namaz vakti verisini çeken yerler
- **lib/api.ts:** `getTodayPrayerTimes`, `getMonthlyPrayerTimes`, `tryFetchPrayerTimesFromDiyanet` – Diyanet API + mock fallback
- **lib/services/prayerTimesService.ts:** `getPrayerTimes` – DB + Aladhan/koordinat tabanlı sağlayıcı

### Veri kaynağı
- **Birincil:** Diyanet harici API – `https://api.diyanet.gov.tr/api/PrayerTime/GetPrayerTimes?districtID=...`
- **İkincil:** Aladhan / kendi API + DB (koordinat + cache)
- **Son yedek:** `lib/api.ts` içinde `getMockTodayPrayerTimes()` (sabit saatler)

---

## 2. Olası “view-source boş” nedeni

Build sırasında `generateStaticParams` ile 51 şehir sayfası **statik** üretiliyor. Build ortamında:
- Diyanet API zaman aşımına uğrayabilir veya rate limit dönebilir,
- Ağ kısıtı olabilir,

Bu durumda üretilen statik HTML hata/boş durumunda kalabilir ve CDN/cache bu haliyle sunuyor olabilir.

**Çözüm:** Bu rotayı her istekte sunucuda render etmek: `export const dynamic = 'force-dynamic'`. Böylece view-source her zaman sunucunun o anki veriyle ürettiği HTML’i gösterir.

---

## 3. Yapılan değişiklik

- `app/[locale]/[il]/page.tsx` içine `export const dynamic = 'force-dynamic'` eklendi.
- Şehir sayfası artık build’de statik üretilmiyor; her istekte (Google dahil) sunucuda çalışıyor ve namaz vakti verisi o anki API/fallback’ten alınıyor.
- `revalidate` ve `generateStaticParams` aynen bırakıldı (path listesi için kullanılabilir; sayfa yine de dynamic render edilir).

---

## 4. Doğrulama

Deploy sonrası:
- `view-source:https://www.ezanvakti.site/tr/sakarya` (veya ilgili şehir) açıldığında HTML içinde "İmsak:", "Öğle:", "Akşam:" ve gerçek saat değerleri (örn. 05:23, 12:45) görünmeli.
