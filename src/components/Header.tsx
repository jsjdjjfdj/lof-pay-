import React from 'react';
import { PortalConfig } from '../types';
import { LegendsOfFireLogo } from './LegendsOfFireLogo';
import { Lock, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  portal: PortalConfig;
  onOpenAdmin?: () => void;
  isBn?: boolean;
  onToggleLang?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  portal,
  onOpenAdmin,
  isBn = true,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-4 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        
        {/* Left Branding with fiery Legends Of Fire logo */}
        <div className="flex items-center gap-2.5">
          <LegendsOfFireLogo
            logoUrl={portal.logoUrl || '/logo.png'}
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl border border-orange-500/40 shadow-sm"
          />

          <div className="text-left">
            <h1 className="text-xs md:text-sm font-black tracking-wide text-slate-900 leading-tight">
              {(!portal.name || portal.name === 'MR. FARDIN') ? 'LEGENDS OF FIRE' : portal.name}
            </h1>
            <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">
              {portal.subName || 'ESPORTS OFFICIAL PORTAL'}
            </p>
          </div>
        </div>

        {/* Right Controls: Verified badge */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 shadow-2xs"
            title="100% Verified Portal"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="text-[10px] md:text-xs font-bold text-rose-700 whitespace-nowrap">
              {portal.verifiedBadgeText || '100% Verified Portal'}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
