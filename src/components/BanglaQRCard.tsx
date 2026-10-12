import React, { useState } from 'react';
import { Download, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BanglaQRCardProps {
  qrImageUrl: string;
  qrFileName: string;
  portalName: string;
  isBn: boolean;
  qrImageSize?: number; // e.g. 160 to 400px
  qrZoom?: number; // e.g. 100 to 350%
  qrPanX?: number; // e.g. -50 to 50%
  qrPanY?: number; // e.g. -50 to 50%
  qrFitMode?: 'contain' | 'cover' | 'fill';
  qrShowFrame?: boolean;
  qrAspectRatio?: 'square' | 'auto' | 'portrait';
}

export const BanglaQRCard: React.FC<BanglaQRCardProps> = ({
  qrImageUrl,
  qrFileName,
  portalName,
  isBn,
  qrImageSize = 250,
  qrZoom = 100,
  qrPanX = 0,
  qrPanY = 0,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const [isFullImageOpen, setIsFullImageOpen] = useState(false);

  const zoomScale = Math.max(1, (qrZoom || 100) / 100);
  const isZoomed = zoomScale > 1.04 || qrPanX !== 0 || qrPanY !== 0;

  const handleDownload = async () => {
    try {
      let downloadUrl = qrImageUrl;

      // If SVG (e.g. default Bangla QR), convert to crisp 1000x1000 PNG so mobile gallery scanner (bKash/Nagad/Rocket) can scan it
      if (qrImageUrl.startsWith('data:image/svg') || qrImageUrl.includes('<svg')) {
        try {
          downloadUrl = await new Promise<string>((resolve) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = 1000;
              canvas.height = 1000;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, 1000, 1000);
                ctx.drawImage(img, 0, 0, 1000, 1000);
                resolve(canvas.toDataURL('image/png'));
                return;
              }
              resolve(qrImageUrl);
            };
            img.onerror = () => resolve(qrImageUrl);
            img.src = qrImageUrl;
          });
        } catch {
          downloadUrl = qrImageUrl;
        }
      } else if (qrImageUrl.startsWith('http')) {
        try {
          const resp = await fetch(qrImageUrl);
          const blob = await resp.blob();
          downloadUrl = URL.createObjectURL(blob);
        } catch {
          // fallback
        }
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      const targetFileName = qrFileName || 'lofpay.png';
      link.download = targetFileName.endsWith('.png') || targetFileName.endsWith('.jpg') ? targetFileName : `${targetFileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloaded(true);
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#dc2626', '#16a34a', '#fbbf24'],
        });
      } catch {
        // ignore
      }

      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
      // Direct open fallback
      const link = document.createElement('a');
      link.href = qrImageUrl;
      link.download = qrFileName || 'lofpay.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Outer Card - Simple, clean, elegant */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm text-center">
        
        {/* QR / Scan Image Container - Clean display at user-selected size & zoom */}
        <div className="flex items-center justify-center mb-6">
          <div
            style={{
              width: `${qrImageSize}px`,
              height: isZoomed ? `${qrImageSize}px` : 'auto',
              maxWidth: '100%',
            }}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 flex items-center justify-center select-none cursor-pointer group transition hover:shadow-xs"
            onClick={() => setIsFullImageOpen(true)}
            title={isBn ? 'সম্পূর্ণ মূল ছবি দেখতে ক্লিক করুন' : 'Click to view full original image'}
          >
            <img
              src={qrImageUrl}
              alt={`${portalName} QR Code`}
              style={{
                width: isZoomed ? '100%' : `${qrImageSize}px`,
                height: isZoomed ? '100%' : 'auto',
                maxWidth: '100%',
                objectFit: isZoomed ? 'cover' : 'contain',
                transform: isZoomed
                  ? `scale(${zoomScale}) translate(${qrPanX}%, ${qrPanY}%)`
                  : 'none',
                transformOrigin: 'center center',
              }}
              className="rounded-2xl transition-transform duration-200 pointer-events-none"
            />

            {isZoomed && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/70 text-white text-[10px] font-medium backdrop-blur-xs opacity-0 group-hover:opacity-100 transition pointer-events-none">
                {isBn ? '🔍 মূল ছবি' : '🔍 Full'}
              </div>
            )}
          </div>
        </div>

        {/* Big Bold Red "Save" Action Button */}
        <div>
          <button
            onClick={handleDownload}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white font-black text-lg md:text-xl shadow-[0_8px_20px_rgba(220,38,38,0.28)] hover:shadow-[0_10px_24px_rgba(220,38,38,0.38)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {downloaded ? (
              <>
                <Check className="w-6 h-6 stroke-[3]" />
                <span>{isBn ? 'ডাউনলোড সম্পন্ন!' : 'Saved!'}</span>
              </>
            ) : (
              <>
                <Download className="w-6 h-6 stroke-[2.5]" />
                <span className="tracking-wide">Save</span>
              </>
            )}
          </button>

          {/* Simple Caption */}
          <p className="mt-3 text-xs md:text-sm text-slate-500 font-medium">
            {isBn
              ? 'ছবিটি ডাউনলোড করে আপনার যেকোনো পেমেন্ট অ্যাপে স্ক্যান করুন।'
              : 'Download the image and scan it into any of your payment apps.'}
          </p>
        </div>
      </div>

      {/* Clean Full Picture Modal */}
      {isFullImageOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsFullImageOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {isBn ? 'সম্পূর্ণ ছবি' : 'Full Image'}
              </span>
              <button
                type="button"
                onClick={() => setIsFullImageOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-50">
              <img
                src={qrImageUrl}
                alt={`${portalName} Full Image`}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>{isBn ? 'ডাউনলোড করুন' : 'Download'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

