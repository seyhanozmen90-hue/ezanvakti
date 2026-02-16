'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // iOS kontrolü
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone = (window.navigator as any).standalone;
    setIsIOS(ios);
    
    // iOS'ta zaten kurulu değilse butonu göster
    if (ios && !standalone) {
      setShowButton(true);
    }

    // Android/Chrome install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowButton(true);
    };

    const handleAppInstalled = () => {
      setShowButton(false);
      setDeferredPrompt(null);
      console.log('PWA installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
      setShowButton(false);
    }
    
    setDeferredPrompt(null);
  };

  if (!showButton) return null;

  return (
    <>
      {/* Install Button */}
      <button
        onClick={handleInstall}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-blue-500"
        aria-label="Uygulamayı Ana Ekrana Ekle"
      >
        <span className="text-xl">📱</span>
        <span className="font-semibold text-sm">Ana Ekrana Ekle</span>
      </button>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div 
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 animate-in fade-in"
          onClick={() => setShowIOSInstructions(false)}
        >
          <div 
            className="bg-white dark:bg-navy-dark rounded-2xl p-6 w-full max-w-sm shadow-2xl transform animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-4 text-navy-900 dark:text-gold-400 flex items-center gap-2">
              <span className="text-2xl">📱</span>
              Ana Ekrana Ekle
            </h3>
            <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-6">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                <span>Safari&apos;nin altındaki <strong>Paylaş</strong> butonuna dokun <span className="text-xl">⬆️</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                <span>Menüde <strong>&quot;Ana Ekrana Ekle&quot;</strong> seçeneğini bul</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                <span>Sağ üstteki <strong>&quot;Ekle&quot;</strong> butonuna dokun</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Tamam, Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}
