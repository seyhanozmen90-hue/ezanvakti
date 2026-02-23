/**
 * Ramazan iftar bildirimi – tarayıcı Notification + sayfa içi toast
 * Sadece Ramazan 2026 (1–30 Mart) boyunca akşam vakti geldiğinde tetiklenir.
 */

const RAMAZAN_BASLANGIC = new Date('2026-03-01');
const RAMAZAN_BITIS = new Date('2026-03-30');

export function ramazandaMiyiz(): boolean {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const baslangic = new Date(RAMAZAN_BASLANGIC);
  const bitis = new Date(RAMAZAN_BITIS);
  baslangic.setHours(0, 0, 0, 0);
  bitis.setHours(23, 59, 59, 999);
  return bugun >= baslangic && bugun <= bitis;
}

export function showIftarToast(sehirAdi: string, saat: string): void {
  if (typeof document === 'undefined') return;
  const toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <div style="
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      background:linear-gradient(135deg,#065f46,#047857);
      color:white; padding:20px 32px; border-radius:16px;
      box-shadow:0 20px 60px rgba(0,0,0,0.4);
      font-size:18px; font-weight:600; text-align:center;
      z-index:9999; animation: slideUp 0.4s ease;
      border:1px solid rgba(255,255,255,0.15);
      min-width:320px;
    ">
      <div style="font-size:28px;margin-bottom:8px">🌙</div>
      <div style="font-size:20px;font-weight:800">${sehirAdi} İftar Vakti!</div>
      <div style="font-size:15px;opacity:0.85;margin-top:4px">
        Hayırlı iftarlar 🕌 · Akşam Ezanı: ${saat}
      </div>
    </div>
  `;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { opacity: 0; transform: translateX(-50%) translateY(20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    style.remove();
  }, 12000);
}

/**
 * Ramazan ayındaysak ve akşam vakti ise tarayıcı bildirimi + toast gösterir.
 */
export function iftarBildirimi(sehirAdi: string, iftarSaati: string): void {
  if (!ramazandaMiyiz()) return;

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`🌙 ${sehirAdi} İftar Vakti!`, {
        body: `${sehirAdi}'nda iftar vakti geldi! Hayırlı iftarlar 🕌\nİftar saati: ${iftarSaati}`,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'iftar-bildirimi',
      });
    } catch {
      // Notification hatası sessizce yoksay
    }
  }

  showIftarToast(sehirAdi, iftarSaati);
}
