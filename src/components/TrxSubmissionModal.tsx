import React, { useState } from 'react';
import { X, Check, Upload, Send, MessageCircle } from 'lucide-react';
import { PaymentSubmission, PortalConfig } from '../types';
import { saveSubmission } from '../services/storage';
import confetti from 'canvas-confetti';

interface TrxSubmissionModalProps {
  portal: PortalConfig;
  isOpen: boolean;
  onClose: () => void;
  isBn: boolean;
}

export const TrxSubmissionModal: React.FC<TrxSubmissionModalProps> = ({
  portal,
  isOpen,
  onClose,
  isBn,
}) => {
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Other'>('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId || !senderNumber) return;

    setIsSubmitting(true);
    const submission: PaymentSubmission = {
      id: `sub_${Date.now()}`,
      portalId: portal.id,
      method,
      senderNumber,
      trxId: trxId.trim().toUpperCase(),
      amount: amount.trim(),
      notes,
      screenshotUrl: screenshotPreview || undefined,
      status: 'pending',
      createdAt: Date.now(),
    };

    await saveSubmission(submission);
    setIsSubmitting(false);
    setSubmitted(true);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const openWhatsApp = () => {
    const cleanNum = portal.whatsappNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${portal.name}, I have completed payment via Bangla QR.\n\n` +
      `Method: ${method}\n` +
      `Sender Number: ${senderNumber || 'N/A'}\n` +
      `TrxID: ${trxId || 'N/A'}\n` +
      `Amount: ${amount ? `${amount} BDT` : 'N/A'}`
    );
    window.open(`https://wa.me/${cleanNum}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {isBn ? 'পেমেন্ট তথ্য গৃহীত হয়েছে!' : 'Payment Proof Submitted!'}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {isBn
                ? `ধন্যবাদ! ${portal.name} এডমিন আপনার TrxID ভেরিফাই করে শীঘ্রই কনফার্ম করবেন।`
                : `Thank you! The admin will verify your TrxID and confirm shortly.`}
            </p>

            {portal.whatsappNumber && (
              <button
                onClick={openWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 mb-3 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isBn ? 'WhatsApp-এ তথ্য পাঠান' : 'Send Proof on WhatsApp'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {portal.name}
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {isBn ? 'পেমেন্ট ট্রানজেকশন আইডি কনফার্মেশন' : 'Confirm Payment Transaction'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBn
                  ? 'পেমেন্ট সফল হওয়ার পর TrxID বা স্ক্রিনশট সাবমিট করুন'
                  : 'Enter your transaction details for quick verification'}
              </p>
            </div>

            {/* Select Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'পেমেন্ট মেথড' : 'Payment App'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['bKash', 'Nagad', 'Rocket', 'Upay'] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      method === m
                        ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Sender Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'প্রেরক নম্বর (যে নম্বর থেকে টাকা পাঠিয়েছেন)' : 'Sender Account Number'}
              </label>
              <input
                type="text"
                required
                placeholder="017XXXXXXXX"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>

            {/* TrxID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID (TrxID)'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BL9A28XK90"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm uppercase font-mono tracking-wider focus:border-rose-500 focus:outline-none"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'টাকার পরিমাণ (ঐচ্ছিক)' : 'Paid Amount (Optional)'}
              </label>
              <input
                type="number"
                placeholder="৳ Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'পেমেন্ট স্ক্রিনশট (যদি থাকে)' : 'Payment Screenshot (Optional)'}
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-rose-300 rounded-xl py-3 px-4 text-xs font-semibold text-slate-600 transition bg-slate-50/50">
                  <Upload className="w-4 h-4 text-rose-500" />
                  <span>{screenshotPreview ? 'ছবি পরিবর্তন করুন' : 'ছবি নির্বাচন করুন'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {screenshotPreview && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                    <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'সাবমিট হচ্ছে...' : (isBn ? 'সাবমিট করুন' : 'Submit Proof')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
