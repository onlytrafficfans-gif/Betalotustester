// QRPreview — Modal showing QR code for mobile preview

import { X, Smartphone, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRPreviewProps { onClose: () => void; }

export function QRPreview({ onClose }: QRPreviewProps) {
  const previewUrl = window.location.href;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#141414] border border-white/5 rounded-2xl shadow-2xl p-6 w-full max-w-xs mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/80">Preview on Mobile</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-white/30"><X size={14} /></button>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG value={previewUrl} size={180} level="M" />
          </div>
          <div className="flex items-start gap-2 text-xs text-white/30">
            <Info size={14} className="shrink-0 mt-0.5" />
            <p>Scan this QR code with your phone to open the preview URL.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
