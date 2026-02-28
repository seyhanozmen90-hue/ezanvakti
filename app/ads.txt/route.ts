/**
 * AdSense ads.txt - hem public/ads.txt hem bu route ile erişilebilir.
 * Route Handler bazı hostlarda daha güvenilir olabilir.
 */
const ADS_TXT = `google.com, pub-4966616802535023, DIRECT, f08c47fec0942fa0
`;

export function GET() {
  return new Response(ADS_TXT.trim(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
