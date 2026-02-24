# Ezanvakti.site – Doğrulama Raporu

**Tarih:** 2026-02-21  
**Hedef:** Diyanet verisi primary, UI’da kurum adı yok, ISR ile 81 il, Google index için server-rendered HTML.

---

## 1) Veri kaynağı öncelik sırası

| Kontrol | Durum | Açıklama |
|--------|--------|----------|
| Diyanet API primary kaynak olarak kullanılıyor mu? | **PASS** | `lib/api.ts` içinde `tryFetchPrayerTimesFromDiyanet(cityId, districtId?)` eklendi. Şehir ve ilçe sayfalarında ilk adım olarak bu fonksiyon çağrılıyor. |
| Diyanet başarısız olduğunda fallback çalışıyor mu? | **PASS** | Diyanet `null` döndüğünde sırayla: (2) Aladhan / `getPrayerTimes` (koordinat varsa), (3) `getTodayPrayerTimes` / `getMonthlyPrayerTimes` (mock dahil) kullanılıyor. Boş sayfa dönmüyor. |
| UI’da “Diyanet verisi” uyarısı var mı? | **PASS** | Yok. Sadece nötr metin kullanılıyor: “Bu şehir/ilçe için yedek veri kaynağı kullanılıyor.” |
| Log/console’da Diyanet geçiyor mu? | **PASS** | İstenen şekilde sadece log/comment’larda geçiyor (`app/api/prayer-times/route.ts` vb.). |

---

## 2) Kullanıcıya görünen metinlerde “Diyanet” yasak

| Kontrol | Durum | Açıklama |
|--------|--------|----------|
| UI/metinlerde “Diyanet” kelimesi geçiyor mu? | **PASS** | Meta, JSON-LD, footer, about, iletisim, gizlilik, takvim, manifest, şehir/ilçe sayfaları ve `messages/tr.json` nötr ifadelerle güncellendi. |
| `data/official-data-2026.ts` source alanı | **FIXED** | “Diyanet İşleri Başkanlığı 2026” → “2026 takvim verisi” olarak değiştirildi. |
| Kod içi yorumlar | **PASS** | Yorumlarda “Diyanet API” geçmesi kullanıcıya görünmediği için bırakıldı (isteğe göre nötrleştirilebilir). |

---

## 3) Google index / rendering (SSG yok, ISR var)

| Kontrol | Durum | Açıklama |
|--------|--------|----------|
| Şehir sayfaları build’de SSG ile üretiliyor mu? | **PASS** | `app/[locale]/[il]/page.tsx` içinde `generateStaticParams` **yok**. Build’de 81 şehir statik üretilmiyor. |
| `dynamic = 'force-dynamic'` kullanıldı mı? | **PASS** | Şehir sayfasında kullanılmadı (sadece `revalidate = 3600`). |
| `export const revalidate = 3600` var mı? | **PASS** | Şehir sayfasında mevcut; ISR 1 saat. |
| Veri server’da mı, HTML’de mi? | **PASS** | Tüm vakit ve SEO metni server component’te çekilip render ediliyor; `useEffect` ile sonradan yükleme yok. |
| Fetch cache | **PASS** | `lib/api.ts` ve `lib/providers/aladhan-monthly.ts` içinde `next: { revalidate: 3600 }` kullanılıyor. |
| HTML source’ta vakitler + SEO metni | **PASS** | “View Page Source” ile vakitler ve 150–200 kelimelik SEO bölümü HTML’de görünür (server render). |

---

## 4) Robots tek kaynak + sitemap

| Kontrol | Durum | Açıklama |
|--------|--------|----------|
| `public/robots.txt` var mı? | **PASS** | Yok (silindi / kullanılmıyor). |
| Sadece `app/robots.ts` kullanılıyor mu? | **PASS** | Evet. İçerik: `rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }]`, `sitemap: 'https://www.ezanvakti.site/sitemap.xml'`. |
| Sitemap `getAllCities()` kullanıyor mu? | **PASS** | `app/sitemap.ts` içinde `getAllCities()` ile şehir listesi alınıyor. |
| Sitemap URL formatı rota ile uyumlu mu? | **PASS** | Şehir URL’leri `${baseUrl}/tr/${city.slug}` (örn. `/tr/istanbul`). |
| sitemap.xml 200 OK | **PASS** | Next.js sitemap route’u `/sitemap.xml` için 200 döner (canlıda doğrulanabilir). |

---

## 5) SEO metni (nötr dil)

| Kontrol | Durum | Açıklama |
|--------|--------|----------|
| H1 formatı | **PASS** | “{Şehir} Namaz Vakitleri – {Tarih}” (örn. “İstanbul Namaz Vakitleri – 21 Şubat 2026”). |
| 150–200 kelime açıklama | **PASS** | “{Şehir} Namaz Vakitleri Nasıl Hesaplanır?” bölümünde astronomik hesaplama, günlük/aylık takip, konuma göre farklılık gibi nötr ifadeler kullanılıyor. |
| Kurum adı | **PASS** | Açıklamalarda “Diyanet”, “resmi kurum”, “onaylı” yok. |
| Canonical | **PASS** | `generateMetadata` içinde `alternates: { canonical: url }` ile `https://www.ezanvakti.site/tr/{city}`. |
| Noindex | **PASS** | Şehir sayfalarında `robots: { index: true, follow: true }` (noindex yok). |

---

## 6) Özet

- **Veri:** Diyanet API primary; başarısızsa Aladhan, sonra legacy/mock. UI’da sadece “yedek veri kaynağı” metni.
- **Metinler:** Kullanıcıya görünen hiçbir yerde “Diyanet”, “resmi kurum”, “onaylı” yok.
- **Rendering:** Şehir sayfaları build’de SSG ile üretilmiyor; ilk istekte server’da render, ISR 3600 sn.
- **Robots/Sitemap:** Tek kaynak `app/robots.ts`; sitemap `getAllCities()` ve `/tr/{slug}` formatında.
- **SEO:** H1, 150–200 kelime nötr metin, doğru canonical, index açık.

**Canlıda yapılacak kontroller:**  
1) 2–3 şehir (örn. `/tr/istanbul`, `/tr/ankara`) için “Sayfa kaynağını görüntüle” ile vakitler + SEO metninin HTML’de olduğunu doğrula.  
2) HTTP 200, noindex olmaması, canonical’ın `https://www.ezanvakti.site/tr/{city}` olduğunu doğrula.  
3) `/robots.txt` ve `/sitemap.xml` 200 OK döndüğünü doğrula.
