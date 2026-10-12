/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SupportedMethods } from './components/SupportedMethods';
import { BanglaQRCard } from './components/BanglaQRCard';
import { PaymentRules } from './components/PaymentRules';
import { VideoTutorialPlayer } from './components/VideoTutorialPlayer';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { AdminModal } from './components/AdminModal';
import { TrxSubmissionModal } from './components/TrxSubmissionModal';
import { PortalConfig } from './types';
import { DEFAULT_PORTAL } from './services/defaultData';
import { getAllPortals } from './services/storage';
import { PlayCircle, Zap } from 'lucide-react';

export default function App() {
  const [portals, setPortals] = useState<PortalConfig[]>([DEFAULT_PORTAL]);
  const [currentPortal, setCurrentPortal] = useState<PortalConfig>(DEFAULT_PORTAL);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
  const [isBn, setIsBn] = useState(true); // Default to Bengali as requested by the user, bilingual toggle available
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load portals from IndexedDB and handle URL queries
  useEffect(() => {
    async function loadData() {
      try {
        const loadedPortals = await getAllPortals();
        setPortals(loadedPortals);

        // Check URL parameters for ?portal=xxx or ?p=xxx and ?admin=true
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('portal') || params.get('p');
        const adminFlag = params.get('admin') === 'true';

        if (slug) {
          const match = loadedPortals.find(
            (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
          );
          if (match) {
            setCurrentPortal(match);
          }
        } else {
          // Always default to LEGENDS OF FIRE
          const lof = loadedPortals.find((p) => p.name === 'LEGENDS OF FIRE') || loadedPortals[0];
          if (lof) {
            setCurrentPortal(lof);
          }
        }

        if (adminFlag) {
          setIsAdminOpen(true);
        }
      } catch (err) {
        console.error('Failed to load portals:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    // Secret keyboard shortcut (Alt+A or Ctrl+Shift+A) to toggle admin panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePortalSwitch = (slug: string) => {
    const target = portals.find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
    );
    if (target) {
      setCurrentPortal(target);
      // update URL without page reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('portal', target.slug);
      window.history.pushState({}, '', newUrl.toString());
    }
  };

  const handlePortalUpdated = (updated: PortalConfig) => {
    setCurrentPortal(updated);
    setPortals((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const reloadPortals = async () => {
    const loaded = await getAllPortals();
    setPortals(loaded);
    // If current portal was deleted, switch to the first available portal
    if (!loaded.find((p) => p.id === currentPortal.id) && loaded.length > 0) {
      setCurrentPortal(loaded[0]);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('portal', loaded[0].slug);
      window.history.pushState({}, '', newUrl.toString());
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 flex flex-col selection:bg-rose-100 selection:text-rose-900">
      
      {/* Top Header matching screenshot */}
      <Header
        portal={currentPortal}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isBn={isBn}
        onToggleLang={() => setIsBn(!isBn)}
      />

      {/* Main Page Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-6 pb-12 flex flex-col items-center text-center">
        
        {/* 1. Promo Badge Capsule matching screenshot */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md text-xs md:text-sm font-black mb-5 tracking-tight animate-bounce-subtle">
          <Zap className="w-4 h-4 fill-amber-300 stroke-amber-300 shrink-0" />
          <span>{isBn ? currentPortal.promoBadgeBn : currentPortal.promoBadge}</span>
        </div>

        {/* 2. Main Hero Heading matching screenshot */}
        <h2 className="text-xl md:text-2xl lg:text-[26px] font-black text-slate-900 leading-snug md:leading-snug max-w-lg mb-2">
          {isBn ? (
            <span>
              বিকাশ, নগদ, রকেট যেকোনো মাধ্যম থেকে{' '}
              <span className="text-rose-600">বাংলা কিউআর</span> ব্যবহার করে পেমেন্ট করুন কোনো চার্জ ছাড়াই!
            </span>
          ) : (
            <span>
              Make payments using{' '}
              <span className="text-rose-600">Bangla QR</span> from any medium like bKash, Nagad, Rocket without any charges!
            </span>
          )}
        </h2>

        {/* Subtitle */}
        <p className="text-xs md:text-sm text-slate-500 font-medium max-w-md mb-2">
          {isBn ? currentPortal.subHeadlineBn : currentPortal.subHeadline}
        </p>

        {/* 3. Supported Methods banner */}
        <SupportedMethods isBn={isBn} />

        {/* 4. Core Bangla QR Payment Card with Save Button */}
        <BanglaQRCard
          qrImageUrl={currentPortal.qrImageUrl}
          qrFileName={currentPortal.qrFileName}
          portalName={currentPortal.name}
          isBn={isBn}
          qrImageSize={currentPortal.qrImageSize}
          qrZoom={currentPortal.qrZoom}
          qrPanX={currentPortal.qrPanX}
          qrPanY={currentPortal.qrPanY}
          qrFitMode={currentPortal.qrFitMode}
          qrShowFrame={currentPortal.qrShowFrame}
          qrAspectRatio={currentPortal.qrAspectRatio}
        />

        {/* 5. Payment Rules Section */}
        <PaymentRules
          rules={currentPortal.paymentRules}
          qrFileName={currentPortal.qrFileName}
          isBn={isBn}
        />

        {/* 6. Video Tutorial Section (Direct Video File Upload supported!) */}
        <div className="w-full max-w-md mx-auto my-6 text-left">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-4 text-rose-700 font-extrabold text-base md:text-lg">
            <PlayCircle className="w-5 h-5 text-rose-600" />
            <span>{isBn ? 'ভিডিও টিউটোরিয়াল (পেমেন্ট নিয়ম):' : 'Video tutorial (payment rules):'}</span>
          </div>

          {/* Direct Video Player Component */}
          <VideoTutorialPlayer
            videoUrl={currentPortal.videoUrl}
            portalName={currentPortal.name}
            portalSubName={currentPortal.subName}
            qrImageUrl={currentPortal.qrImageUrl}
          />

          {/* Subtext below video matching screenshot */}
          <p className="mt-3 text-center text-xs text-slate-500 font-medium">
            {isBn ? currentPortal.videoCaptionBn : currentPortal.videoCaption}
          </p>
        </div>

        {/* 7. Zero Hidden Fees & Instant Payment Cards + FAQs */}
        <FaqSection
          faqs={currentPortal.faqs}
          isBn={isBn}
          onOpenTrxModal={() => setIsTrxModalOpen(true)}
        />

      </main>

      {/* Footer matching screenshot */}
      <Footer
        portal={currentPortal}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isBn={isBn}
      />

      {/* Customer TrxID Submission Modal */}
      <TrxSubmissionModal
        portal={currentPortal}
        isOpen={isTrxModalOpen}
        onClose={() => setIsTrxModalOpen(false)}
        isBn={isBn}
      />

      {/* Admin Panel Modal (Upload Video, QR screenshot, generate other admin links) */}
      <AdminModal
        currentPortal={currentPortal}
        allPortals={portals}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onPortalUpdated={handlePortalUpdated}
        onSwitchPortal={handlePortalSwitch}
        onPortalsListChanged={reloadPortals}
        isBn={isBn}
      />

    </div>
  );
}
