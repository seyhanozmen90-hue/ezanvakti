# SEO Audit – Doğrulama Adımları

Bu doküman, GSC noindex ve Event structured data düzeltmeleri sonrası doğrulama adımlarını içerir.

## 1. Robots meta (sayfa kaynağı)

- **Şehir:** `/tr/istanbul`, `/tr/ankara` vb. sayfa kaynağında şunu kontrol edin:
  - `<meta name="robots" content="index, follow">` (veya equivalent) olmalı.
  - `noindex` **olmamalı**.
- **İlçe:** `/tr/adana/merkez`, `/tr/ankara/altindag` vb. sayfa kaynağında:
  - Aynı şekilde `index, follow` olmalı, `noindex` olmamalı.

## 2. Response header (X-Robots-Tag)

- Şehir/ilçe sayfalarına HTTP isteği atın (curl veya tarayıcı geliştirici araçları).
- Response header’da **`X-Robots-Tag: noindex`** **olmamalı**.
- `next.config.js` ve middleware’de noindex header’ı eklenmediğini doğrulayın.

## 3. Event JSON-LD (HTML kaynağı)

- Şehir veya ilçe sayfasının HTML kaynağında (View Source):
  - `"@type":"Event"` **içeren** bir JSON-LD script **olmamalı**.
  - WebPage ve BreadcrumbList schema’ları kalmalı.

## 4. Geçersiz URL’ler → 404

- Tanımsız şehir/ilçe (örn. `/tr/olmayan-sehir`, `/tr/adana/olmayan-ilce`) **404** dönmeli.
  - Bu sayfalar artık “Yakında Eklenecek” + noindex ile 200 dönmüyor; `notFound()` ile 404 dönüyor.

## Değişen dosyalar (özet)

| Dosya | Değişiklik |
|-------|------------|
| `app/[locale]/[il]/page.tsx` | Bilinmeyen şehirde `notFound()`; Event schema kaldırıldı; title "Ezan Vakti" |
| `app/[locale]/[il]/[ilce]/page.tsx` | Bilinmeyen ilçede `notFound()`; tüm ilçelerde `robots: index, follow`; Event schema kaldırıldı, WebPage+BreadcrumbList @graph |
| `lib/seo.config.ts` | Artık ilçe sayfalarında kullanılmıyor (index her zaman true) |
