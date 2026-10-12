import React from 'react';
import { PaymentLogosBanner } from './PaymentLogosBanner';

export const SupportedMethods: React.FC<{ isBn?: boolean }> = () => {
  return (
    <div className="w-full max-w-md mx-auto my-4">
      {/* Official MFS Brand Logos Banner */}
      <PaymentLogosBanner />
    </div>
  );
};


