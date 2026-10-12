import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Video,
  QrCode,
  Link,
  Copy,
  Check,
  Plus,
  Trash2,
  Eye,
  ShieldCheck,
  Save,
  Users,
  Lock,
  Sliders,
  Download,
  Maximize2,
  CheckCircle2,
  ZoomIn,
  Move,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { PortalConfig } from '../types';
import { savePortal, saveMediaBlob, deletePortal } from '../services/storage';
import { INITIAL_PORTALS } from '../services/defaultData';
import { LegendsOfFireLogo } from './LegendsOfFireLogo';

interface AdminModalProps {
  currentPortal: PortalConfig;
  allPortals: PortalConfig[];
  isOpen: boolean;
  onClose: () => void;
  onPortalUpdated: (updatedPortal: PortalConfig) => void;
  onSwitchPortal: (portalSlug: string) => void;
  onPortalsListChanged: () => void;
  isBn: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  currentPortal,
  allPortals,
  isOpen,
  onClose,
  onPortalUpdated,
  onSwitchPortal,
  onPortalsListChanged,
  isBn,
}) => {
  // Only 2 tabs: 'media' (Logo, Video, QR & Size) and 'admins' (Add Admin, Public Links, Delete Admin)
  const [activeTab, setActiveTab] = useState<'media' | 'admins'>('media');

  // Currently selected portal to edit (defaults to currentPortal)
  const [editingPortalId, setEditingPortalId] = useState<string>(currentPortal.id);

  // Form states for the currently selected portal
  const activeEditingPortal = allPortals.find((p) => p.id === editingPortalId) || currentPortal;

  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | undefined>(activeEditingPortal.logoUrl);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(activeEditingPortal.videoUrl);
  const [videoFileName, setVideoFileName] = useState(activeEditingPortal.videoFileName);
  const [videoFileSize, setVideoFileSize] = useState<string>('');
  const [qrPreview, setQrPreview] = useState(activeEditingPortal.qrImageUrl);
  const [qrFileName, setQrFileName] = useState(activeEditingPortal.qrFileName);
  const [qrImageSize, setQrImageSize] = useState<number>(activeEditingPortal.qrImageSize || 240);
  const [qrZoom, setQrZoom] = useState<number>(activeEditingPortal.qrZoom || 100);
  const [qrPanX, setQrPanX] = useState<number>(activeEditingPortal.qrPanX || 0);
  const [qrPanY, setQrPanY] = useState<number>(activeEditingPortal.qrPanY || 0);
  const [adminPasscode, setAdminPasscode] = useState(activeEditingPortal.adminPasscode || 'Asif4545');

  // Interactive controls state
  const [showFullQrModal, setShowFullQrModal] = useState<boolean>(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Multi-Admin Form state
  const [newAdminName, setNewAdminName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newAdminPasscode, setNewAdminPasscode] = useState('Asif4545');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [confirmDeletePortalId, setConfirmDeletePortalId] = useState<string | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Security Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

  // Drag state for interactive live preview
  const [isDraggingQr, setIsDraggingQr] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);

  // Synchronize when currentPortal or editingPortalId changes
  useEffect(() => {
    const target = allPortals.find((p) => p.id === editingPortalId) || currentPortal;
    setLogoPreviewUrl(target.logoUrl || '/logo.png');
    setVideoPreviewUrl(target.videoUrl);
    setVideoFileName(target.videoFileName);
    setQrPreview(target.qrImageUrl);
    setQrFileName(target.qrFileName || 'lofpay.png');
    setQrImageSize(target.qrImageSize || 240);
    setQrZoom(target.qrZoom || 100);
    setQrPanX(target.qrPanX || 0);
    setQrPanY(target.qrPanY || 0);
    setAdminPasscode(target.adminPasscode || 'Asif4545');
  }, [editingPortalId, currentPortal, allPortals]);

  // Sync editingPortalId when currentPortal changes externally
  useEffect(() => {
    setEditingPortalId(currentPortal.id);
  }, [currentPortal.id]);

  // Ensure admin panel is always locked whenever modal is closed or on fresh load
  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setEnteredPasscode('');
      setPasscodeError(false);
    }
  }, [isOpen]);

  const handleVerifyPasscode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input = enteredPasscode.trim();
    const targetPortal = allPortals.find((p) => p.id === editingPortalId) || currentPortal;
    const correctCode = (targetPortal.adminPasscode || 'Asif4545').trim();

    // STRICT MATCH: Only allow the exact passcode configured by the admin (no 1234 or backdoor bypass)
    if (input && input === correctCode) {
      setIsAuthenticated(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleLockAdmin = () => {
    setIsAuthenticated(false);
    setEnteredPasscode('');
    setPasscodeError(false);
    onClose();
  };

  if (!isOpen) return null;

  // Security Lock Screen: Public cannot view or modify anything without admin passcode
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-black text-slate-900 mb-1">
            {isBn ? 'এডমিন সিকিউরিটি লক' : 'Admin Security Lock'}
          </h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            {isBn
              ? 'এডমিন প্যানেলে প্রবেশ করতে আপনার এডমিন পাসকোড দিন।'
              : 'Enter admin passcode to access admin settings.'}
          </p>

          <form onSubmit={handleVerifyPasscode} className="space-y-4">
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={enteredPasscode}
                onChange={(e) => {
                  setEnteredPasscode(e.target.value);
                  setPasscodeError(false);
                }}
                placeholder={isBn ? 'পাসওয়ার্ড দিন' : 'Enter admin passcode'}
                autoFocus
                className={`w-full px-4 py-3 rounded-xl border text-center font-mono text-lg font-black tracking-widest focus:outline-none transition ${
                  passcodeError
                    ? 'border-rose-500 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {passcodeError && (
              <p className="text-xs font-bold text-rose-600 flex items-center justify-center gap-1">
                <span>⚠️</span> {isBn ? 'ভুল পাসকোড! সঠিক পাসকোড দিয়ে চেষ্টা করুন।' : 'Incorrect passcode! Please try again.'}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black shadow-md hover:brightness-105 active:scale-98 transition cursor-pointer"
              >
                {isBn ? 'লগইন করুন' : 'Unlock Panel'}
              </button>
            </div>
          </form>

          <p className="mt-4 text-[11px] text-slate-400 font-medium">
            🔒 {isBn ? 'শুধুমাত্র অনুমোদিত এডমিন এক্সেস' : 'Authorized Admin Access Only'}
          </p>
        </div>
      </div>
    );
  }

  // 1. Handle DIRECT VIDEO upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setVideoFileSize(`${sizeMb} MB`);
    setVideoFileName(file.name);

    const mediaKey = `video_${activeEditingPortal.id}`;

    // Try server endpoint for byte-range streaming
    let finalVideoUrl = '';
    try {
      const formData = new FormData();
      formData.append('video', file);
      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const uploadedFilename = data.url ? data.url.replace('/uploads/', '') : '';
        finalVideoUrl = uploadedFilename ? `/api/stream-video/${uploadedFilename}` : data.url;
      }
    } catch {
      // Fallback to client storage
    }

    if (!finalVideoUrl) {
      finalVideoUrl = await saveMediaBlob(mediaKey, file);
    } else {
      await saveMediaBlob(mediaKey, finalVideoUrl);
    }

    setVideoPreviewUrl(finalVideoUrl);
    const updatedVideoPortal: PortalConfig = {
      ...activeEditingPortal,
      videoUrl: finalVideoUrl,
      videoFileName: file.name,
      updatedAt: Date.now(),
    };
    await savePortal(updatedVideoPortal);
    onPortalUpdated(updatedVideoPortal);
    onPortalsListChanged();
    setIsUploadingMedia(false);
  };

  // 2. Handle DIRECT QR image upload
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    const mediaKey = `qr_${activeEditingPortal.id}`;
    let finalQrUrl = '';

    try {
      const formData = new FormData();
      formData.append('qr', file);
      const res = await fetch('/api/upload-qr', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        finalQrUrl = data.url;
      }
    } catch {
      // Fallback
    }

    if (!finalQrUrl) {
      finalQrUrl = await saveMediaBlob(mediaKey, file);
    } else {
      await saveMediaBlob(mediaKey, finalQrUrl);
    }

    setQrPreview(finalQrUrl);
    const newQrName = (!qrFileName || qrFileName === 'mrfqr.png' || qrFileName === 'lofpay.png') ? file.name : qrFileName;
    setQrFileName(newQrName);

    const updatedQrPortal: PortalConfig = {
      ...activeEditingPortal,
      qrImageUrl: finalQrUrl,
      qrFileName: newQrName,
      updatedAt: Date.now(),
    };
    await savePortal(updatedQrPortal);
    onPortalUpdated(updatedQrPortal);
    onPortalsListChanged();
    setIsUploadingMedia(false);
  };

  // 3. Handle Website Logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    const mediaKey = `logo_${activeEditingPortal.id}`;
    let finalLogoUrl = '';

    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        finalLogoUrl = data.url;
      }
    } catch {
      // Fallback
    }

    if (!finalLogoUrl) {
      finalLogoUrl = await saveMediaBlob(mediaKey, file);
    } else {
      await saveMediaBlob(mediaKey, finalLogoUrl);
    }

    setLogoPreviewUrl(finalLogoUrl);
    const updatedLogoPortal: PortalConfig = {
      ...activeEditingPortal,
      logoUrl: finalLogoUrl,
      updatedAt: Date.now(),
    };
    await savePortal(updatedLogoPortal);
    onPortalUpdated(updatedLogoPortal);
    onPortalsListChanged();
    setIsUploadingMedia(false);
  };

  // Save changes to the selected portal
  const handleSavePortal = async () => {
    const updated: PortalConfig = {
      ...activeEditingPortal,
      logoUrl: logoPreviewUrl !== undefined ? logoPreviewUrl : (activeEditingPortal.logoUrl || '/logo.png'),
      videoUrl: videoPreviewUrl,
      videoFileName: videoFileName || 'tutorial.mp4',
      qrImageUrl: qrPreview,
      qrFileName: qrFileName || 'lofpay.png',
      qrImageSize: Number(qrImageSize) || 240,
      qrZoom: Number(qrZoom) || 100,
      qrPanX: Number(qrPanX) || 0,
      qrPanY: Number(qrPanY) || 0,
      adminPasscode: adminPasscode.trim() || activeEditingPortal.adminPasscode || 'Asif4545',
      updatedAt: Date.now(),
    };

    await savePortal(updated);
    onPortalUpdated(updated);
    onPortalsListChanged();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Add new Admin & create public links
  const handleCreateNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim()) return;

    const slug = (newSlug.trim() || newAdminName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')) || `admin-${Date.now()}`;
    const newId = `portal_${Date.now()}`;

    const newPortal: PortalConfig = {
      ...currentPortal,
      id: newId,
      slug,
      name: newAdminName.trim(),
      subName: 'OFFICIAL PAYMENT PORTAL',
      qrFileName: `${slug}_qr.png`,
      adminName: newAdminName.trim(),
      adminPasscode: newAdminPasscode.trim() || 'Asif4545',
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await savePortal(newPortal);
    onPortalsListChanged();
    setNewAdminName('');
    setNewSlug('');
    setNewAdminPasscode('Asif4545');

    // Switch editing to this new admin so they can upload their own video and QR immediately
    setEditingPortalId(newId);
  };

  // Delete admin (user can delete any admin they want anytime)
  const handleExecuteDeleteAdmin = async (pId: string) => {
    setConfirmDeletePortalId(null);
    const p = allPortals.find((item) => item.id === pId);
    if (!p) return;

    await deletePortal(pId);

    const remaining = allPortals.filter((item) => item.id !== pId);
    if (remaining.length === 0) {
      // If user deleted the only portal, initialize a clean default portal
      const freshPortal: PortalConfig = {
        ...INITIAL_PORTALS[0],
        id: `portal_${Date.now()}`,
        slug: 'main',
        name: 'LEGENDS OF FIRE',
        subName: 'OFFICIAL PAYMENT PORTAL',
        videoUrl: INITIAL_PORTALS[0].videoUrl,
        qrImageUrl: INITIAL_PORTALS[0].qrImageUrl,
        qrZoom: 100,
        qrPanX: 0,
        qrPanY: 0,
        adminPasscode: 'Asif4545',
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await savePortal(freshPortal);
      setEditingPortalId(freshPortal.id);
      onSwitchPortal(freshPortal.slug);
    } else {
      if (editingPortalId === pId) {
        setEditingPortalId(remaining[0].id);
      }
      if (currentPortal.id === pId) {
        onSwitchPortal(remaining[0].slug);
      }
    }

    onPortalsListChanged();
    setDeleteSuccessMsg(isBn ? `"${p.name}" এডমিন সফলভাবে ডিলিট করা হয়েছে!` : `Admin "${p.name}" was deleted successfully!`);
    setTimeout(() => setDeleteSuccessMsg(null), 3500);
  };

  const getPortalBaseUrl = (slug: string, isAdmin = false) => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    return `${origin}${path}?portal=${slug}${isAdmin ? '&admin=true' : ''}`;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Test download the full original QR/Scan picture
  const handleTestDownloadQr = async () => {
    try {
      let downloadUrl = qrPreview;
      if (qrPreview.startsWith('http')) {
        try {
          const resp = await fetch(qrPreview);
          const blob = await resp.blob();
          downloadUrl = URL.createObjectURL(blob);
        } catch {}
      }
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = qrFileName || 'lofpay.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      const link = document.createElement('a');
      link.href = qrPreview;
      link.download = qrFileName || 'lofpay.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Interactive Drag & Pan handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    if (qrZoom <= 100) return;
    setIsDraggingQr(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      startPanX: qrPanX,
      startPanY: qrPanY,
    };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDraggingQr || !dragStartRef.current) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    const sensitivity = 0.35;
    const newPanX = Math.round(Math.min(75, Math.max(-75, dragStartRef.current.startPanX + dx * sensitivity)));
    const newPanY = Math.round(Math.min(75, Math.max(-75, dragStartRef.current.startPanY + dy * sensitivity)));
    setQrPanX(newPanX);
    setQrPanY(newPanY);
  };

  const handleDragEnd = () => {
    setIsDraggingQr(false);
    dragStartRef.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[92vh] shadow-2xl relative flex flex-col overflow-hidden border border-slate-200">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <LegendsOfFireLogo logoUrl={logoPreviewUrl || '/logo.png'} className="w-10 h-10 rounded-xl shadow-xs" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black text-slate-900">
                  {isBn ? 'এডমিন কন্ট্রোল প্যানেল' : 'Admin Control Panel'}
                </h2>
                <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-mono">
                  {activeEditingPortal.slug}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {isBn
                  ? 'ভিডিও, কিউআর ও কাস্টমস সাইজ, এডমিন ম্যানেজমেন্ট এবং ওয়েবসাইট লোগো'
                  : 'Video, QR & Custom Size, Admin Management & Website Logo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLockAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition border border-slate-200 cursor-pointer"
              title={isBn ? 'এডমিন প্যানেল লক করুন' : 'Lock Admin Panel'}
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>{isBn ? 'লক করুন' : 'Lock'}</span>
            </button>

            <button
              type="button"
              onClick={handleLockAdmin}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation: STRICTLY the 2 required sections */}
        <div className="px-6 pt-2 border-b border-slate-200 bg-white flex items-center gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('media')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'media'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{isBn ? 'ভিডিও, কিউআর ও লোগো' : 'Video, QR & Logo'}</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'admins'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isBn ? 'এডমিন এড ও পাবলিক লিংক' : 'Admins & Public Links'}</span>
            {allPortals.length > 1 && (
              <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {allPortals.length}
              </span>
            )}
          </button>
        </div>

        {/* Delete notification toast banner */}
        {deleteSuccessMsg && (
          <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
              {deleteSuccessMsg}
            </span>
            <button
              type="button"
              onClick={() => setDeleteSuccessMsg(null)}
              className="text-red-500 hover:text-red-800 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* TAB 1: VIDEO, QR & SIZE, LOGO (এডমিন নিজের ভিডিও ও কিউআর আপলোড করতে পারবে) */}
          {activeTab === 'media' && (
            <div className="space-y-6">

              {/* Active Admin Switcher: Allows any admin to select and upload their own video & QR */}
              {allPortals.length > 1 && (
                <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="text-xs font-extrabold text-slate-900">
                      {isBn ? 'বর্তমান এডিটিং এডমিন:' : 'Currently Editing Admin:'}
                    </span>
                    <span className="text-xs font-bold text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
                      {activeEditingPortal.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-slate-600">
                      {isBn ? 'এডমিন পরিবর্তন করুন:' : 'Switch Admin:'}
                    </label>
                    <select
                      value={editingPortalId}
                      onChange={(e) => {
                        setEditingPortalId(e.target.value);
                        onSwitchPortal(allPortals.find(p => p.id === e.target.value)?.slug || '');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500 shadow-2xs cursor-pointer"
                    >
                      {allPortals.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 1. Website Logo Section */}
              <div className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    <span>{isBn ? '১. Website লোগো' : '1. Website Logo'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                    {isBn ? 'ওয়েবসাইটের লোগো পরিবর্তন' : 'Header Logo'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="relative group shrink-0">
                    {logoPreviewUrl ? (
                      <LegendsOfFireLogo
                        logoUrl={logoPreviewUrl}
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl shadow-md border-2 border-orange-500/50 bg-black"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                        {isBn ? 'লোগো নেই' : 'No Logo'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                    <p className="text-xs text-slate-600">
                      {isBn
                        ? 'আপনার ওয়েবসাইটের উপরের হেডারে প্রদর্শিত লোগোটি সিলেক্ট করুন।'
                        : 'Upload or customize the website logo displayed in the header.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingMedia ? (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBn ? 'লোগো আপলোড / পরিবর্তন' : 'Upload Logo')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setLogoPreviewUrl('/logo.png')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        {isBn ? 'ডিফল্ট লোগো' : 'Default Logo'}
                      </button>

                      {logoPreviewUrl && logoPreviewUrl !== '/logo.png' && (
                        <button
                          type="button"
                          onClick={() => setLogoPreviewUrl('')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          <span>{isBn ? 'লোগো রিমুভ' : 'Remove'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Direct Video Upload & 3. QR Upload with Custom Size in 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 2. VIDEO UPLOAD (ভিডিও আপলোড) */}
                <div className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                        <Video className="w-4 h-4 text-rose-600" />
                        <span>{isBn ? '২. ভিডিও আপলোড' : '2. Video Upload'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        MP4 / WebM
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      {isBn
                        ? 'আপনার পেমেন্ট টিউটোরিয়াল ভিডিও ফাইলটি আপলোড করুন। গ্রাহকরা পেজে সরাসরি কোনো ল্যাগ ছাড়া দেখতে পারবে।'
                        : 'Upload your payment tutorial video. Customers will watch it smoothly directly on the page.'}
                    </p>

                    {/* Video File Picker */}
                    <label className="border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-xl p-4 bg-white flex flex-col items-center justify-center text-center cursor-pointer transition">
                      <Upload className="w-6 h-6 text-rose-500 mb-1" />
                      <span className="text-xs font-bold text-slate-800">
                        {isUploadingMedia ? (isBn ? 'ভিডিও প্রসেস হচ্ছে...' : 'Processing video...') : (isBn ? 'ভিডিও ফাইল সিলেক্ট করুন' : 'Choose Video File')}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        MP4, WebM, MOV (সরাসরি আপনার মোবাইল বা কম্পিউটার থেকে)
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>

                    {videoFileName && (
                      <div className="mt-2 text-[11px] font-mono text-slate-600 flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="truncate max-w-[190px]">📁 {videoFileName}</span>
                        {videoFileSize && <span className="text-rose-600 font-bold">{videoFileSize}</span>}
                      </div>
                    )}
                  </div>

                  {/* Video Live Preview */}
                  {videoPreviewUrl && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span>{isBn ? 'ভিডিও লাইভ প্রিভিউ:' : 'Video Preview:'}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">● Active</span>
                      </div>
                      <div className="rounded-xl overflow-hidden bg-black max-h-40 flex items-center justify-center border border-slate-300 shadow-xs">
                        <video src={videoPreviewUrl} controls playsInline preload="auto" className="max-h-40 w-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. QR UPLOAD & CUSTOM SIZE (কিউআর আপলোড ও কিউআর কাস্টমস সাইজ) */}
                <div className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/50 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                        <QrCode className="w-4 h-4 text-rose-600" />
                        <span>{isBn ? '৩. কিউআর আপলোড ও কাস্টমস সাইজ' : '3. QR Upload & Custom Size'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        PNG / JPG / WebP
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      {isBn
                        ? 'আপনার বাংলা কিউআর বা পেমেন্ট স্ক্রিনশট আপলোড করুন এবং ইচ্ছেমতো ডিসপ্লে সাইজ ও জুম নির্ধারণ করুন।'
                        : 'Upload Bangla QR screenshot and adjust display size, zoom, and pan position.'}
                    </p>

                    {/* QR Image File Picker */}
                    <label className="border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-xl p-3.5 bg-white flex flex-col items-center justify-center text-center cursor-pointer transition">
                      <Upload className="w-5 h-5 text-rose-500 mb-1" />
                      <span className="text-xs font-bold text-slate-800">
                        {isBn ? 'কিউআর বা স্কিনশর্ট সিলেক্ট করুন' : 'Choose QR / Scan Image'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, WebP (বিকাশ / নগদ / বাংলা কিউআর স্ক্রিনশট)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Download Filename with Quick Presets */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600">
                          {isBn ? 'ডাউনলোড ফাইল নাম:' : 'Downloaded Filename:'}
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setQrFileName('lofpay.png')}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded transition cursor-pointer ${
                              qrFileName === 'lofpay.png'
                                ? 'bg-rose-600 text-white font-bold'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            lofpay.png
                          </button>
                          <button
                            type="button"
                            onClick={() => setQrFileName('mrfqr.png')}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded transition cursor-pointer ${
                              qrFileName === 'mrfqr.png'
                                ? 'bg-rose-600 text-white font-bold'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            mrfqr.png
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={qrFileName}
                        onChange={(e) => setQrFileName(e.target.value)}
                        placeholder="lofpay.png"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-rose-600 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    {/* QR CUSTOM SIZE CONTROLLERS (এখন যেরকম আছে সেইরকম থাকবে) */}
                    <div className="mt-3.5 pt-3 border-t border-slate-200 bg-white p-3 rounded-xl border space-y-3">
                      
                      {/* A. Display Size */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <Sliders className="w-3.5 h-3.5 text-rose-600" />
                            <span>{isBn ? 'স্ক্যান ছবির ডিসপ্লে সাইজ:' : 'Scan Image Display Size:'}</span>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            {qrImageSize}px
                          </span>
                        </div>

                        {/* 3 Quick Preset Buttons */}
                        <div className="flex items-center gap-2 mb-2">
                          {[
                            { label: isBn ? 'ছোট' : 'Small', size: 190 },
                            { label: isBn ? 'মাঝারি' : 'Medium', size: 250 },
                            { label: isBn ? 'বড়' : 'Large', size: 320 },
                          ].map((p) => (
                            <button
                              key={p.size}
                              type="button"
                              onClick={() => setQrImageSize(p.size)}
                              className={`flex-1 py-1.5 text-xs rounded-lg font-bold transition cursor-pointer ${
                                qrImageSize === p.size
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {p.label} ({p.size}px)
                            </button>
                          ))}
                        </div>

                        {/* Precision Size Slider */}
                        <input
                          type="range"
                          min="150"
                          max="380"
                          step="10"
                          value={qrImageSize}
                          onChange={(e) => setQrImageSize(Number(e.target.value))}
                          className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                        />
                      </div>

                      {/* B. Zoom In / Crop Controller */}
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <ZoomIn className="w-3.5 h-3.5 text-rose-600" />
                            <span>{isBn ? 'ছবি জুম করুন (Zoom In):' : 'Zoom Image (Zoom In):'}</span>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            {qrZoom}%
                          </span>
                        </div>

                        {/* Quick Zoom Buttons */}
                        <div className="grid grid-cols-4 gap-1.5 mb-2">
                          {[
                            { label: isBn ? '১০০% (মূল)' : '100% (Full)', zoom: 100 },
                            { label: '১৫০%', zoom: 150 },
                            { label: isBn ? '২০০% (QR)' : '200% (QR)', zoom: 200 },
                            { label: '২৫০%', zoom: 250 },
                          ].map((z) => (
                            <button
                              key={z.zoom}
                              type="button"
                              onClick={() => {
                                setQrZoom(z.zoom);
                                if (z.zoom === 100) {
                                  setQrPanX(0);
                                  setQrPanY(0);
                                }
                              }}
                              className={`py-1.5 text-[11px] rounded-lg font-bold transition cursor-pointer text-center ${
                                qrZoom === z.zoom
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {z.label}
                            </button>
                          ))}
                        </div>

                        {/* Precision Zoom Slider */}
                        <input
                          type="range"
                          min="100"
                          max="350"
                          step="5"
                          value={qrZoom}
                          onChange={(e) => setQrZoom(Number(e.target.value))}
                          className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                          <span>{isBn ? '১০০% (স্বাভাবিক)' : '100% (Normal)'}</span>
                          <span>{isBn ? '৩৫০% (সর্বোচ্চ জুম)' : '350% (Max Zoom)'}</span>
                        </div>

                        {/* C. Pan / Move Controls (when zoomed) */}
                        {qrZoom > 105 && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                <Move className="w-3.5 h-3.5 text-rose-600" />
                                {isBn ? 'পজিশন ঠিক করুন (Pan / Move):' : 'Adjust Pan Position:'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setQrPanX(0);
                                  setQrPanY(0);
                                }}
                                className="text-[10px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-200"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>{isBn ? 'মাঝখানে রিসেট' : 'Reset Center'}</span>
                              </button>
                            </div>

                            {/* 4 Direction Nudge Buttons */}
                            <div className="flex flex-col items-center gap-1.5 py-1">
                              <button
                                type="button"
                                onClick={() => setQrPanY((prev) => Math.max(-75, prev - 5))}
                                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs text-slate-700 hover:text-rose-600 cursor-pointer transition active:scale-95"
                                title={isBn ? 'উপরে সরান' : 'Move Up'}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setQrPanX((prev) => Math.max(-75, prev - 5))}
                                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs text-slate-700 hover:text-rose-600 cursor-pointer transition active:scale-95"
                                  title={isBn ? 'বামে সরান' : 'Move Left'}
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                                  X:{qrPanX}% Y:{qrPanY}%
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setQrPanX((prev) => Math.min(75, prev + 5))}
                                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs text-slate-700 hover:text-rose-600 cursor-pointer transition active:scale-95"
                                  title={isBn ? 'ডানে সরান' : 'Move Right'}
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => setQrPanY((prev) => Math.min(75, prev + 5))}
                                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs text-slate-700 hover:text-rose-600 cursor-pointer transition active:scale-95"
                                title={isBn ? 'নিচে সরান' : 'Move Down'}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Horizontal Slider */}
                            <div>
                              <div className="flex justify-between text-[10px] text-slate-500 mb-0.5 font-medium">
                                <span>{isBn ? 'ডানে / বামে (X):' : 'Horizontal (X):'}</span>
                                <span className="font-mono">{qrPanX}%</span>
                              </div>
                              <input
                                type="range"
                                min="-75"
                                max="75"
                                step="1"
                                value={qrPanX}
                                onChange={(e) => setQrPanX(Number(e.target.value))}
                                className="w-full accent-slate-700 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                              />
                            </div>

                            {/* Vertical Slider */}
                            <div>
                              <div className="flex justify-between text-[10px] text-slate-500 mb-0.5 font-medium">
                                <span>{isBn ? 'উপরে / নিচে (Y):' : 'Vertical (Y):'}</span>
                                <span className="font-mono">{qrPanY}%</span>
                              </div>
                              <input
                                type="range"
                                min="-75"
                                max="75"
                                step="1"
                                value={qrPanY}
                                onChange={(e) => setQrPanY(Number(e.target.value))}
                                className="w-full accent-slate-700 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* QR Live Preview Frame with Drag & Drop */}
                  {qrPreview && (
                    <div className="mt-2 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[11px] font-bold text-slate-700">
                          {isBn ? 'লাইভ প্রিভিউ (পাবলিক পেজে যেমন দেখাবে):' : 'Live Preview (as seen by public):'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowFullQrModal(true)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 transition cursor-pointer"
                          >
                            <Maximize2 className="w-2.5 h-2.5" />
                            <span>{isBn ? 'মূল ছবি' : 'Full Image'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleTestDownloadQr}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 transition cursor-pointer"
                          >
                            <Download className="w-2.5 h-2.5" />
                            <span>{isBn ? 'ডাউনলোড টেস্ট' : 'Test Save'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-100 rounded-xl flex flex-col items-center justify-center border border-slate-200 select-none">
                        <div
                          className={`relative overflow-hidden rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center select-none ${
                            qrZoom > 100 ? 'cursor-grab active:cursor-grabbing' : ''
                          }`}
                          style={{
                            width: `${Math.min(qrImageSize * 0.7, 210)}px`,
                            height: qrZoom > 105 || qrPanX !== 0 || qrPanY !== 0 ? `${Math.min(qrImageSize * 0.7, 210)}px` : 'auto',
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleDragStart(e.clientX, e.clientY);
                          }}
                          onMouseMove={(e) => {
                            if (isDraggingQr) handleDragMove(e.clientX, e.clientY);
                          }}
                          onMouseUp={handleDragEnd}
                          onMouseLeave={handleDragEnd}
                          onTouchStart={(e) => {
                            const t = e.touches[0];
                            if (t) handleDragStart(t.clientX, t.clientY);
                          }}
                          onTouchMove={(e) => {
                            const t = e.touches[0];
                            if (t && isDraggingQr) handleDragMove(t.clientX, t.clientY);
                          }}
                          onTouchEnd={handleDragEnd}
                        >
                          <img
                            src={qrPreview}
                            alt="QR Preview"
                            style={{
                              width: qrZoom > 105 || qrPanX !== 0 || qrPanY !== 0 ? '100%' : `${Math.min(qrImageSize * 0.7, 210)}px`,
                              height: qrZoom > 105 || qrPanX !== 0 || qrPanY !== 0 ? '100%' : 'auto',
                              objectFit: qrZoom > 105 || qrPanX !== 0 || qrPanY !== 0 ? 'cover' : 'contain',
                              transform: qrZoom > 105 || qrPanX !== 0 || qrPanY !== 0
                                ? `scale(${qrZoom / 100}) translate(${qrPanX}%, ${qrPanY}%)`
                                : 'none',
                              transformOrigin: 'center center',
                            }}
                            className="transition-transform duration-75 pointer-events-none"
                            draggable={false}
                          />

                          {qrZoom > 100 && (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold pointer-events-none backdrop-blur-xs">
                              {qrZoom}%
                            </div>
                          )}
                        </div>

                        {qrZoom > 100 && (
                          <p className="mt-2 text-[10px] text-slate-500 font-medium text-center">
                            {isBn
                              ? '👆 আঙুল বা মাউস দিয়ে ছবিতে টেনে (Drag) ইচ্ছেমতো পজিশন সেট করুন'
                              : '👆 Drag on image with mouse or finger to position'}
                          </p>
                        )}

                        <div className="mt-3 w-full p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-left">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{isBn ? 'পাবলিক শুধুমাত্র এই জুম অংশটি দেখতে পাবে' : 'Public will only see this cropped/zoomed part'}</span>
                          </div>
                          <p className="mt-0.5 text-[10.5px] text-emerald-700 leading-relaxed font-medium">
                            {isBn
                              ? '📥 কিন্তু পাবলিক যখন লাল "Save" বাটনে চাপ দিবে, তখন মূল পুরো এইচডি ছবি ডাউনলোড হবে।'
                              : '📥 When user clicks the "Save" button, the full original picture will be downloaded.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* 4. Admin Passcode & Save Bar */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>{isBn ? '৪. এডমিন সিকিউরিটি পাসকোড' : '4. Admin Security Passcode'}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'এডমিন প্যানেল সুরক্ষার জন্য পাসকোড (ডিফল্ট: Asif4545)। আপনি চাইলে পরিবর্তন করতে পারেন।'
                    : 'Secret passcode protecting the admin panel (default: Asif4545).'}
                </p>
                <div className="max-w-xs">
                  <input
                    type="text"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Asif4545"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    বর্তমান পাসকোড: <span className="font-mono font-bold text-slate-600">{activeEditingPortal.adminPasscode || 'Asif4545'}</span>
                  </p>
                </div>
              </div>

              {/* Save Bar */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {saveSuccess ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {isBn ? 'সফলভাবে সংরক্ষিত হয়েছে!' : 'Saved successfully!'}
                      </span>
                    ) : (
                      isBn ? 'ভিডিও, কিউআর ও লোগো পরিবর্তন করার পর সেভ বাটনে চাপুন।' : 'Click save to apply your updates.'
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSavePortal}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs md:text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isBn ? 'সংরক্ষণ করুন (Save)' : 'Save Changes'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: ADMIN MANAGEMENT & PUBLIC LINKS (এডমিন এড করা, পাবলিক লিংক ও এডমিন ডিলেট) */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              
              {/* Highlight card */}
              <div className="p-4 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                <Users className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-700">
                  <strong className="text-slate-900 block font-bold mb-0.5">
                    {isBn ? 'এডমিন এড করা ও পাবলিক লিংক তৈরি করা:' : 'Add Admins & Generate Public Links:'}
                  </strong>
                  {isBn
                    ? 'আপনি নতুন এডমিন তৈরি করে তার পাবলিক কাস্টমার লিংক এবং এডমিন লিংক পেতে পারেন। প্রতিটি এডমিন নিজের লিংকে ঢুকে নিজস্ব ভিডিও এবং কিউআর কোড আপলোড করতে পারবে।'
                    : 'Create new admin portals with public and admin links. Each admin can upload their own video and QR code.'}
                </div>
              </div>

              {/* 1. Add New Admin Form */}
              <form onSubmit={handleCreateNewAdmin} className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <Plus className="w-4 h-4 text-rose-600" />
                  <span>{isBn ? 'নতুন এডমিন এড করুন' : 'Add New Admin'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isBn ? 'এডমিন বা শপের নাম' : 'Admin / Shop Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ROBIUL GAMING"
                      value={newAdminName}
                      onChange={(e) => {
                        setNewAdminName(e.target.value);
                        if (!newSlug) {
                          setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isBn ? 'লিংক স্লাগ (Unique URL Slug)' : 'Link Slug'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. robiul"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isBn ? 'এডমিন পাসকোড' : 'Admin Passcode'}
                    </label>
                    <input
                      type="text"
                      placeholder="Asif4545"
                      value={newAdminPasscode}
                      onChange={(e) => setNewAdminPasscode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isBn ? 'এডমিন এড করুন ও পাবলিক লিংক তৈরি করুন' : 'Add Admin & Generate Public Link'}</span>
                </button>
              </form>

              {/* 2. Active Admin Portals List (with Copy Links, Edit own Video/QR, Delete Admin) */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {isBn ? 'সক্রিয় এডমিনদের তালিকা' : 'Active Admins'} ({allPortals.length})
                </h4>

                <div className="grid grid-cols-1 gap-3.5">
                  {allPortals.map((portal) => {
                    const isCurrent = portal.id === currentPortal.id;
                    const isEditing = portal.id === editingPortalId;
                    const clientUrl = getPortalBaseUrl(portal.slug, false);
                    const adminUrl = getPortalBaseUrl(portal.slug, true);

                    return (
                      <div
                        key={portal.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isEditing
                            ? 'bg-rose-50/50 border-rose-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-sm text-slate-900">
                                {portal.name}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                                ?portal={portal.slug}
                              </span>
                              {portal.isDefault && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                                  Default
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-600 text-white rounded-full">
                                  Active View
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              QR File: <span className="font-mono text-rose-600">{portal.qrFileName}</span>
                              {portal.videoFileName && (
                                <> • Video: <span className="font-mono text-slate-700">{portal.videoFileName}</span></>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Copy Public Customer Link */}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(clientUrl, `client_${portal.id}`)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                              title="Public customer link for this admin"
                            >
                              {copiedLink === `client_${portal.id}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">{isBn ? 'কপি হয়েছে!' : 'Copied!'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>{isBn ? 'পাবলিক লিংক' : 'Public Link'}</span>
                                </>
                              )}
                            </button>

                            {/* Copy Admin Setup Link */}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(adminUrl, `admin_${portal.id}`)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                              title="Send to admin so they can upload their own video and QR"
                            >
                              {copiedLink === `admin_${portal.id}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-rose-600" />
                                  <span className="text-rose-600">{isBn ? 'কপি হয়েছে!' : 'Copied!'}</span>
                                </>
                              ) : (
                                <>
                                  <Link className="w-3.5 h-3.5" />
                                  <span>{isBn ? 'এডমিন লিংক' : 'Admin Link'}</span>
                                </>
                              )}
                            </button>

                            {/* Edit this admin's Video & QR */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPortalId(portal.id);
                                onSwitchPortal(portal.slug);
                                setActiveTab('media');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                              title="Upload video and QR for this admin"
                            >
                              <Upload className="w-3.5 h-3.5 text-orange-600" />
                              <span>{isBn ? 'নিজের ভিডিও ও QR আপলোড' : 'Edit Media'}</span>
                            </button>

                            {/* Switch customer view */}
                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => onSwitchPortal(portal.slug)}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{isBn ? 'ভিউ দেখুন' : 'View'}</span>
                              </button>
                            )}

                            {/* Delete Admin Button - Can delete any admin user wants */}
                            {confirmDeletePortalId === portal.id ? (
                              <div className="flex items-center gap-1.5 p-1 bg-red-100/90 border border-red-300 rounded-xl animate-in fade-in">
                                <span className="text-[11px] font-bold text-red-800 px-1">
                                  {isBn ? 'ডিলিট করবেন?' : 'Delete?'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleExecuteDeleteAdmin(portal.id)}
                                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-black cursor-pointer shadow-xs transition active:scale-95"
                                >
                                  {isBn ? 'হ্যাঁ, ডিলিট' : 'Yes, Delete'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeletePortalId(null)}
                                  className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold cursor-pointer transition"
                                >
                                  {isBn ? 'না' : 'Cancel'}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePortalId(portal.id)}
                                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                title={isBn ? 'এই এডমিনটি সম্পূর্ণ ডিলিট করুন' : 'Delete this admin'}
                              >
                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                <span>{isBn ? 'ডিলেট' : 'Delete'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Full QR Original Image Modal inside Admin */}
      {showFullQrModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowFullQrModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-extrabold text-slate-800">
                  {isBn ? 'সম্পূর্ণ কিউআর ছবি প্রিভিউ (Full Image)' : 'Full Original Image Preview'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullQrModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-900/5 min-h-[250px]">
              <img
                src={qrPreview}
                alt="Full Scan Preview"
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-md border border-slate-200 bg-white"
              />
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-mono">
                {qrFileName || 'lofpay.png'}
              </span>
              <button
                type="button"
                onClick={handleTestDownloadQr}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isBn ? 'মূল ছবি ডাউনলোড করুন' : 'Download Original'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
