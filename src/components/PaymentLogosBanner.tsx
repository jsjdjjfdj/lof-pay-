import React from 'react';

export const PaymentLogosBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs px-2 sm:px-4 py-2.5 sm:py-3.5 overflow-hidden transition-all ${className}`}>
      <div className="grid grid-cols-3 items-center divide-x divide-slate-200/90">
        
        {/* ================= 1. Official bKash Logo ================= */}
        <div className="flex items-center justify-center px-2 sm:px-3 py-1.5 h-10 sm:h-12">
          <img
            src="/bkash-logo.png"
            alt="bKash"
            className="w-auto h-6 sm:h-7 max-w-[85%] object-contain select-none transition-transform hover:scale-105 duration-200"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* ================= 2. Official Nagad Logo ================= */}
        <div className="flex items-center justify-center px-2 sm:px-3 py-1.5 h-10 sm:h-12">
          <img
            src="/nagad-logo.svg"
            alt="Nagad"
            className="w-auto h-6 sm:h-7 max-w-[85%] object-contain select-none transition-transform hover:scale-105 duration-200"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* ================= 3. Official Rocket Logo ================= */}
        <div className="flex items-center justify-center px-2 sm:px-3 py-1.5 h-10 sm:h-12">
          <img
            src="/rocket-logo.svg"
            alt="Dutch-Bangla Bank Rocket"
            className="w-auto h-7 sm:h-8.5 max-w-[85%] object-contain select-none transition-transform hover:scale-105 duration-200"
            loading="eager"
            draggable={false}
          />
        </div>

      </div>
    </div>
  );
};
