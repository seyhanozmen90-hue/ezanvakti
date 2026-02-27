# View-Source Kontrol Cevapları

## 1. app/[locale]/[il]/page.tsx – "use client" var mı?
**Hayır.** Dosyanın en üstünde "use client" yok; sayfa Server Component.

## 2. Üst layout'lar – "use client" var mı?
- **app/[locale]/layout.tsx:** "use client" **yok** (Server Component). İçinde `NextIntlClientProvider` (client) kullanılıyor; children yine sunucuda render edilebilir.
- **app/[locale]/[il]/layout.tsx:** Sadece `<> {children} </>`; "use client" **yok**.
- **app/layout.tsx:** Projede **yok**; kök layout `app/[locale]/layout.tsx`.

## 3. Vakitleri gösteren kartlar – hangi component, "use client" var mı?
- **Component:** `PrayerTimeCard` (`components/PrayerTimeCard.tsx`).
- **"use client":** **Var** – dosyanın 1. satırında. Yani kartlar client component; ama server yine de ilk HTML’de prop’larla render eder. Sorun sadece buna bağlı olmayabilir.

## 4. TEST paragrafı
**Eklendi:** `return` içinde en üste:
```tsx
<p style={{ display: 'block' }}>TEST-{todayTimes?.imsak}</p>
```
Deploy sonrası kontrol:
- **Sayfada** "TEST-05:23" (veya o anki imsak saati) görünüyorsa → server çıktısı geliyor.
- **View-source’ta** aynı metin yoksa → HTML’e eklenmiyor veya CDN/cache eski yanıt veriyor.

## 5. next.config.js – output
- **output: 'export'** → **Yok**
- **output: 'standalone'** → **Yok**
Varsayılan Next.js üretimi kullanılıyor (Vercel’de otomatik).

---

**Yapılan kod değişikliği:** `app/[locale]/[il]/page.tsx` – return’ün en üstüne TEST paragrafı eklendi. Commit atıp push edin; deploy sonrası view-source’ta `TEST-` ile imsak saatini arayın.
