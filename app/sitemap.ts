import { MetadataRoute } from 'next';

const ILLER = [
  'adana', 'adiyaman', 'afyonkarahisar', 'agri', 'aksaray', 'amasya', 'ankara',
  'antalya', 'ardahan', 'artvin', 'aydin', 'balikesir', 'bartin', 'batman',
  'bayburt', 'bilecik', 'bingol', 'bitlis', 'bolu', 'burdur', 'bursa', 'canakkale',
  'cankiri', 'corum', 'denizli', 'diyarbakir', 'duzce', 'edirne', 'elazig',
  'erzincan', 'erzurum', 'eskisehir', 'gaziantep', 'giresun', 'gumushane',
  'hakkari', 'hatay', 'igdir', 'isparta', 'istanbul', 'izmir', 'kahramanmaras',
  'karabuk', 'karaman', 'kars', 'kastamonu', 'kayseri', 'kilis', 'kirikkale',
  'kirklareli', 'kirsehir', 'kocaeli', 'konya', 'kutahya', 'malatya', 'manisa',
  'mardin', 'mersin', 'mugla', 'mus', 'nevsehir', 'nigde', 'ordu', 'osmaniye',
  'rize', 'sakarya', 'samsun', 'sanliurfa', 'siirt', 'sinop', 'sirnak', 'sivas',
  'tekirdag', 'tokat', 'trabzon', 'tunceli', 'usak', 'van', 'yalova', 'yozgat', 'zonguldak',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ezanvakti.site';
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1,
      lastModified: now,
    },
    {
      url: `${baseUrl}/tr/kible`,
      changeFrequency: 'monthly',
      priority: 0.8,
      lastModified: now,
    },
    {
      url: `${baseUrl}/tr/hakkimizda`,
      changeFrequency: 'monthly',
      priority: 0.5,
      lastModified: now,
    },
    {
      url: `${baseUrl}/tr/iletisim`,
      changeFrequency: 'monthly',
      priority: 0.5,
      lastModified: now,
    },
    {
      url: `${baseUrl}/tr/gizlilik-politikasi`,
      changeFrequency: 'monthly',
      priority: 0.5,
      lastModified: now,
    },
  ];

  const cityPages: MetadataRoute.Sitemap = ILLER.map((il) => ({
    url: `${baseUrl}/tr/${il}`,
    changeFrequency: 'daily' as const,
    priority: 0.9,
    lastModified: now,
  }));

  return [...staticPages, ...cityPages];
}
