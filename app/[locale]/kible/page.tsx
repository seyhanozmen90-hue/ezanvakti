import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const KiblePusulasi = dynamic(() => import('@/components/KiblePusulasi'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
      Pusula yükleniyor…
    </div>
  ),
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kıble Yönü | Kıble Pusulası - Ezan Vakitleri',
    description: 'Bulunduğunuz konumdan Kabe\'ye yönü bulmak için dijital kıble pusulası.',
    keywords: 'kıble yönü, kıble pusulası, kabe yönü, namaz kılma yönü',
    openGraph: {
      title: 'Kıble Yönü | Kıble Pusulası',
      description: 'Dijital kıble pusulası ile Kabe yönünü bulun',
      type: 'website',
    },
  };
}

export default function KiblePage() {
  return <KiblePusulasi />;
}
