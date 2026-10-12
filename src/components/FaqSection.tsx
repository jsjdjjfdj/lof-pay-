import React from 'react';
import { Tag, Zap, HelpCircle } from 'lucide-react';
import { FAQItem } from '../types';

interface FaqSectionProps {
  faqs: FAQItem[];
  isBn: boolean;
  onOpenTrxModal?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs, isBn }) => {
  return (
    <div className="w-full max-w-md mx-auto my-6 space-y-6">
      {/* Two Highlight Feature Cards matching screenshot */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Zero hidden fees */}
        <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4 text-left flex flex-col justify-between">
          <div>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-2.5">
              <Tag className="w-4 h-4 fill-rose-500/20 stroke-rose-600" />
            </div>
            <h4 className="text-xs md:text-sm font-extrabold text-slate-900 leading-tight">
              {isBn ? 'জিরো হিডেন ফি' : 'Zero hidden fees'}
            </h4>
            <p className="mt-1.5 text-[11px] md:text-xs text-slate-500 leading-snug">
              {isBn
                ? 'কোনো অতিরিক্ত সেন্ড মানি বা ক্যাশআউট চার্জ নেই।'
                : 'There are no additional send money or cashout charges.'}
            </p>
          </div>
        </div>

        {/* Instant payment */}
        <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4 text-left flex flex-col justify-between">
          <div>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-2.5">
              <Zap className="w-4 h-4 fill-rose-500/20 stroke-rose-600" />
            </div>
            <h4 className="text-xs md:text-sm font-extrabold text-slate-900 leading-tight">
              {isBn ? 'ইনস্ট্যান্ট পেমেন্ট' : 'Instant payment'}
            </h4>
            <p className="mt-1.5 text-[11px] md:text-xs text-slate-500 leading-snug">
              {isBn
                ? 'কিউআর স্ক্যান করার সাথে সাথেই পেমেন্ট সম্পূর্ণ হয়।'
                : 'Payment will be completed immediately after scanning.'}
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) Card matching screenshot */}
      <div className="bg-white rounded-3xl p-6 md:p-7 border border-rose-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-left">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-rose-50 text-rose-700 font-extrabold text-base md:text-lg">
          <HelpCircle className="w-5 h-5 text-rose-600" />
          <span>{isBn ? 'সাধারণ প্রশ্নোত্তর (FAQ):' : 'Frequently Asked Questions (FAQ):'}</span>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isLast = index === faqs.length - 1;
            return (
              <div key={index} className="space-y-1.5 border-b border-slate-100 pb-3.5 last:border-0 last:pb-0">
                <div className="text-xs md:text-sm font-bold text-slate-900">
                  <span className="text-rose-600 font-black mr-1">Question:</span>{' '}
                  {isBn ? faq.questionBn : faq.question}
                </div>
                <div className="text-xs md:text-[13px] text-slate-600 font-medium leading-relaxed pl-1">
                  <span className="text-slate-400 font-semibold mr-1">Answer:</span>{' '}
                  {isBn ? faq.answerBn : faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
