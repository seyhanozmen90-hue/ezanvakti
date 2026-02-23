/**
 * Şehir slug → görüntülenecek ad eşlemesi (Türkçe karakterli).
 * Sadece slug bilindiğinde doğru yazım için kullanılabilir.
 */
export const SEHIR_ADLARI: Record<string, string> = {
  istanbul: 'İstanbul',
  izmir: 'İzmir',
  igdir: 'Iğdır',
  sanliurfa: 'Şanlıurfa',
};

/** Slug'dan şehir adını döndürür; yoksa slug'ı olduğu gibi döner. */
export function getSehirAdi(slug: string): string {
  return SEHIR_ADLARI[slug] ?? slug;
}
