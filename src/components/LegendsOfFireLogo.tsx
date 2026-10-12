import React, { useState } from 'react';

interface LegendsOfFireLogoProps {
  className?: string;
  logoUrl?: string;
  size?: number;
  alt?: string;
  onClick?: () => void;
}

export const LegendsOfFireLogo: React.FC<LegendsOfFireLogoProps> = ({
  className = 'w-10 h-10',
  logoUrl,
  alt = 'Legends of Fire Esports Logo',
  onClick,
}) => {
  const [useFallback, setUseFallback] = useState(false);
  const activeUrl = logoUrl || '/logo.png';

  if (!useFallback) {
    return (
      <img
        src={activeUrl}
        alt={alt}
        onClick={onClick}
        onError={() => setUseFallback(true)}
        className={`${className} object-contain rounded-xl bg-black shadow-[0_2px_12px_rgba(234,88,12,0.4)] border border-orange-500/50 select-none`}
      />
    );
  }

  return (
    <img
      src="/logo.svg"
      alt={alt}
      onClick={onClick}
      className={`${className} object-contain rounded-xl bg-black shadow-[0_2px_12px_rgba(234,88,12,0.4)] border border-orange-500/50 select-none`}
    />
  );
};
