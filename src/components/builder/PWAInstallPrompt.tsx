// PWAInstallPrompt — "Add to Home Screen" prompt

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { X, Download, Smartphone } from 'lucide-react';

const DISMISS_KEY = 'lotus_pwa_dismissed';

export function PWAInstallPrompt() {
  const { canInstall, install, dismiss } = usePWA();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!canInstall) { setShow(false); return; }
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) setShow(true);
  }, [canInstall]);

  const handleInstall = async () => { const ok = await install(); if (ok) setShow(false); };
  const handleDismiss = () => { localStorage.setItem(DISMISS_KEY, '1'); dismiss(); setShow(false); };

  if (!show) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[55] w-full max-w-sm px-4">
      <div className="bg-[#141414] border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-lotus-400/10 flex items-center justify-center shrink-0">
            <Smartphone size={18} className="text-lotus-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white/80 mb-0.5">Install LOTUS</h3>
            <p className="text-xs text-white/40 leading-relaxed">Add to your home screen for the best builder experience. Works offline.</p>
          </div>
          <button onClick={handleDismiss} className="p-1 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/50 transition-all shrink-0"><X size={14} /></button>
        </div>
        <div className="flex items-center gap-2 px-4 pb-4">
          <button onClick={handleInstall} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium bg-lotus-400/10 text-lotus-400 hover:bg-lotus-400/20 transition-all">
            <Download size={13} />Install App
          </button>
          <button onClick={handleDismiss} className="px-4 py-2.5 rounded-xl text-xs font-medium text-white/30 hover:text-white/50 hover:bg-white/5 transition-all">Later</button>
        </div>
      </div>
    </div>
  );
}
