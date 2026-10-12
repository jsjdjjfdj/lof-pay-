import React, { useRef } from 'react';
import { PortalConfig } from '../types';
import { Lock } from 'lucide-react';

interface FooterProps {
  portal: PortalConfig;
  onOpenAdmin?: () => void;
  isBn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ portal, onOpenAdmin, isBn }) => {
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);

  // Hidden secret trigger for portal owner: 3 quick taps on the copyright
  const handleSecretTap = () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current > 2500) {
      tapCountRef.current = 1;
    } else {
      tapCountRef.current += 1;
    }
    lastTapTimeRef.current = now;

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      onOpenAdmin?.();
    }
  };

  return (
    <footer className="mt-12 pb-10 pt-6 border-t border-slate-100 text-center text-slate-400 select-none">
      <div className="max-w-md mx-auto space-y-1.5 px-4 text-xs">
        <p
          onClick={handleSecretTap}
          className="font-semibold text-slate-600 select-none cursor-default"
        >
          © {new Date().getFullYear()} <span className="text-slate-900 font-bold">{portal.footerBrand || 'LEGENDS OF FIRE'}</span>. All Rights Reserved.
        </p>
        <p className="text-[11px] text-slate-400 font-medium">
          Bangla QR Payment Gateway Integration
        </p>
        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase pt-1">
          POWERED BY: <span className="text-slate-900 font-extrabold">{portal.footerPoweredBy || 'LEGENDS OF FIRE'}</span>
        </p>
      </div>
    </footer>
  );
};
