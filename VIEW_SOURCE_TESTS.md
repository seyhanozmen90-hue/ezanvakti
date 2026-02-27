# View-Source Boş – Bulgular ve Düzeltme

## 1. curl / HTML kontrolü (PowerShell)

Canlı siteden alınan yanıtta:
- **İlk HTML’de** sadece **"Yükleniyor...", "Lütfen bekleyin"** ve spinner vardı.
- **İmsak, Öğle, Akşam** ve saat değerleri ilk yanıtta **yoktu**; içerik sonradan (stream) geliyordu.

## 2. Neden: loading.tsx

- **Dosya:** `app/[locale]/[il]/loading.tsx`
- Next.js App Router’da `loading.tsx` bir **Suspense fallback** oluşturur.
- Sayfa async Server Component olduğu için önce bu fallback (Yükleniyor...) gönderiliyor, asıl içerik ikinci chunk’ta stream ediliyordu.
- **View-source** ve **crawler** sadece ilk yanıtı gördüğü için vakitler “boş” görünüyordu.

**Yapılan:** `app/[locale]/[il]/loading.tsx` **silindi**. Böylece şehir sayfası için stream fallback kalktı; sunucu sayfayı bitirip tek seferde tam HTML dönecek.

## 3. Vakitleri render eden JSX (page.tsx)

```tsx
<section className="sr-only" aria-label="Namaz vakitleri">
  <h2>{city.name} Namaz Vakitleri</h2>
  <ul>
    <li>İmsak: {todayTimes.imsak}</li>
    <li>Güneş: {todayTimes.gunes}</li>
    <li>Öğle: {todayTimes.ogle}</li>
    <li>İkindi: {todayTimes.ikindi}</li>
    <li>Akşam: {todayTimes.aksam}</li>
    <li>Yatsı: {todayTimes.yatsi}</li>
  </ul>
</section>
```

- `sr-only` bırakıldı (ekranda tek görünen yer kartlar kalsın diye).
- Asıl düzeltme: **loading.tsx kaldırıldı**; artık bu blok ilk HTML yanıtında gelecek.

## 4. console.log (sunucu terminali)

- `[CityPage] VAKITLER:` log’u eklendi (başarılı veri).
- `[CityPage] VAKITLER YOK:` log’u eklendi (todayTimes null ise).

**Kontrol:** `npm run dev` → tarayıcıda `http://localhost:3000/tr/sakarya` aç → **Terminalde** (Next.js çalışan pencere) şuna benzer satır görünmeli:

`[CityPage] VAKITLER: {"il":"sakarya","imsak":"05:23","ogle":"12:45","aksam":"18:20"}`

## 5. API testi (Diyanet)

- **URL (lib/api.ts):** `https://api.diyanet.gov.tr/api/PrayerTime/GetPrayerTimes?districtID=XXXX`
- Sakarya il ID (cities.json): **9202**
- Tarayıcıda aç:  
  https://api.diyanet.gov.tr/api/PrayerTime/GetPrayerTimes?districtID=9202  
- JSON’da `data` dizisi ve içinde `Imsak`, `Ogle`, `Aksam` vb. alanlar gelmeli.

## 6. Mock veri (lib/mock-data.ts)

- `getMockTodayPrayerTimes()` **dolu** dönüyor:  
  imsak: 06:15, gunes: 07:45, ogle: 13:10, ikindi: 15:45, aksam: 18:20, yatsi: 19:50  
- API hata verirse bu mock kullanılıyor; sayfa tamamen boş kalmıyor.

---

## Yapılan dosya değişiklikleri

| Dosya | İşlem |
|-------|--------|
| `app/[locale]/[il]/loading.tsx` | **Silindi** (view-source’un dolması için gerekli) |
| `app/[locale]/[il]/page.tsx` | `console.log` eklendi (VAKITLER / VAKITLER YOK) |

Deploy sonrası **view-source:https://www.ezanvakti.site/tr/sakarya** içinde "İmsak:", "Öğle:", "Akşam:" ve saat değerleri görünmeli.
