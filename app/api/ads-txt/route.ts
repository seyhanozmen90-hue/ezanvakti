/**
 * AdSense ads.txt — /ads.txt isteği rewrite ile buraya gelir.
 * Google: tam olarak https://alanadi.com/ads.txt adresinde 200 + text/plain dönmeli.
 */
const ADS_TXT_CONTENT = 'google.com, pub-4966616802535023, DIRECT, f08c47fec0942fa0\n';

export function GET() {
  return new Response(ADS_TXT_CONTENT, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
