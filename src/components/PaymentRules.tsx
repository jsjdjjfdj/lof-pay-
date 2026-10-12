import React from 'react';
import { ListOrdered, CheckCircle2 } from 'lucide-react';
import { PaymentRule } from '../types';

interface PaymentRulesProps {
  rules: PaymentRule[];
  qrFileName: string;
  isBn: boolean;
}

export const PaymentRules: React.FC<PaymentRulesProps> = ({ rules, qrFileName, isBn }) => {
  return (
    <div className="w-full max-w-md mx-auto my-6 bg-white rounded-3xl p-6 md:p-7 border border-rose-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-left">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-rose-50 text-rose-700 font-extrabold text-base md:text-lg">
        <ListOrdered className="w-5 h-5 text-rose-600" />
        <span>{isBn ? 'পেমেন্ট করার নিয়ম:' : 'Payment rules:'}</span>
      </div>

      {/* Rules list */}
      <ol className="space-y-3.5 text-xs md:text-sm text-slate-700 font-medium leading-relaxed">
        {rules.map((rule) => {
          const rawText = isBn ? rule.textBn : rule.text;
          // highlight Save and filename
          return (
            <li key={rule.step} className="flex items-start gap-2.5">
              <span className="font-bold text-slate-900 shrink-0 select-none">
                {rule.step}.
              </span>
              <div className="flex-1">
                {formatRuleText(rawText, qrFileName)}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

function formatRuleText(text: string, qrFileName: string) {
  const currentFileName = qrFileName || 'lofpay.png';

  // Replace any hardcoded filename like mrfqr.png or lofpay.png or *.png with the current file name
  const dynamicText = text.replace(/(mrfqr\.png|lofpay\.png|[a-zA-Z0-9_\-\.]+\.(?:png|jpg|jpeg|webp))/gi, currentFileName);

  // Split safely by the target filename, Save, and Bangla QR keywords
  const escapedFileName = currentFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedFileName}|["']Save["']|["']Scan QR \\/ Bangla QR["']|["']বাংলা কিউআর["'])`, 'gi');
  const parts = dynamicText.split(regex);

  return (
    <span>
      {parts.map((part, idx) => {
        if (part.toLowerCase() === currentFileName.toLowerCase()) {
          return (
            <span
              key={idx}
              className="text-[#dc2626] font-bold bg-[#ffe4e6]/70 border border-rose-200/50 px-1.5 py-0.5 rounded-md inline-block font-sans text-xs tracking-tight shadow-2xs mx-0.5 select-all"
            >
              {currentFileName}
            </span>
          );
        }
        if (/["']Save["']/i.test(part)) {
          return (
            <strong key={idx} className="text-rose-700 font-bold">
              {part}
            </strong>
          );
        }
        if (/Scan QR/i.test(part) || /বাংলা কিউআর/i.test(part)) {
          return (
            <strong key={idx} className="text-slate-900 font-bold">
              {part}
            </strong>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}
