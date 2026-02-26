# Tüm Şehirler İçin Vakit Kaynakları Doğrulama

**İkindi (Asr):** Türkiye’de Diyanet uygulaması Şafii/standart hesaplama kullanır (gölge = cisim boyu → ~16:38). Hanafi (~17:23) sitede kullanılmıyor.

---

## Veri öncelik sırası (her şehir/ilçe)

| Sıra | Kaynak | İkindi | Kullanıldığı yer |
|------|--------|--------|------------------|
| 1 | **Diyanet API** | Doğru (resmi) | Koordinat olsun olmasın, önce denenir. |
| 2 | **Aladhan** (school=0, Shafi) | Doğru (~16:38) | Diyanet yanıt vermezse, koordinatı olan şehir/ilçeler. |
| 3 | **Legacy / mock** | Fallback | Hiç veri gelmezse boş sayfa dönmemek için. |

---

## Kodda kontrol edilen noktalar

- **`lib/providers/aladhan.ts`** – `school: '0'` (Shafi). Günlük vakit isteği.
- **`lib/providers/aladhan-monthly.ts`** – URL’de `&school=0`. Aylık takvim.
- **`lib/api.ts`** – Diyanet API; ekstra İkindi düzeltmesi yok.
- **`lib/services/prayerTimesService.ts`** – `skipCache: true` ile DB atlanıp provider’dan (Aladhan Shafi) taze veri alınabiliyor.

---

## Hangi sayfa nereden alıyor?

| Sayfa | Bugün için | Aylık / diğer tarih |
|-------|------------|----------------------|
| **Şehir** `/[locale]/[il]` | 1) Diyanet 2) getPrayerTimes(..., **skipCache: true**) | Diyanet veya fetchMonthlyPrayerTimes (school=0) |
| **İlçe** `/[locale]/[il]/[ilce]` | 1) Diyanet 2) getPrayerTimes(..., **skipCache: true**) | getPrayerTimes gün gün veya getMonthlyPrayerTimes |
| **Takvim** `/[locale]/[il]/takvim` | getPrayerTimes(..., **skipCache: true**) | - |
| **Takvim gün** `/.../ [day]` | date === today ise **skipCache: true** | - |
| **API** `/api/prayer-times` | date === bugün ise **skipCache: true** | - |

Böylece tüm şehir/ilçe sayfaları, takvim ve bugün için API çağrıları eski (Hanafi) cache’e düşmeden doğru İkindi (Shafi) alıyor.

---

## Şehir grupları

- **Koordinatı olan şehirler** (lib/geo/tr.ts): İstanbul, Ankara, İzmir, Bursa, Antalya, … Önce Diyanet, olmazsa Aladhan (school=0) + skipCache.
- **Sadece Diyanet ID’si olan şehirler** (cities.json’da id var, geo’da yok): Sadece Diyanet API; cevap gelirse o kullanılır.
- **İlçe sayfaları**: Aynı mantık (Diyanet → Aladhan + skipCache); ilçe koordinatı varsa Aladhan ilçe bazlı çalışır.

Sonuç: Tüm iller ve ilçeler için İkindi değeri ya Diyanet’ten ya da Aladhan Shafi (school=0) kaynağından gelir; Hanafi (17:23) artık kullanılmıyor.
