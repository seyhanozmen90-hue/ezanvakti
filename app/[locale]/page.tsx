import HomeRedirect from './HomeRedirect';

/**
 * Root page - Kullanıcıyı seçili şehir sayfasına yönlendirir
 * 
 * Yönlendirme mantığı:
 * 1. localStorage'da selectedCitySlug varsa -> /{citySlug}
 * 2. Yoksa DEFAULT_CITY'ye -> /istanbul
 * 
 * Asıl içerik app/[locale]/[il]/page.tsx'te bulunur
 */
export default function RootPage() {
  return <HomeRedirect />;
}
