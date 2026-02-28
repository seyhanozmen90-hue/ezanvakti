/**
 * AdSense ads.txt içeriği.
 * next.config.js rewrite ile /ads.txt bu route'a yönlendirilir (Google bulabilsin).
 */
const ADS_TXT = 'google.com, pub-4966616802535023, DIRECT, f08c47fec0942fa0';

export function GET() {
  return new Response(ADS_TXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
