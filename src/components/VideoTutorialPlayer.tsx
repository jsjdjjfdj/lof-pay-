import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Camera, CheckCircle, Image, Sparkles } from 'lucide-react';
import { LegendsOfFireLogo } from './LegendsOfFireLogo';

interface VideoTutorialPlayerProps {
  videoUrl?: string;
  portalName: string;
  portalSubName: string;
  qrImageUrl: string;
}

export const VideoTutorialPlayer: React.FC<VideoTutorialPlayerProps> = ({
  videoUrl,
  portalName,
  portalSubName,
  qrImageUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(20);
  const [fallbackStep, setFallbackStep] = useState(1);

  // Video element event listeners
  useEffect(() => {
    if (!videoUrl) return;

    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Stalled / waiting auto-recovery: ensures video never freezes
    const onStalled = () => {
      if (video && !video.paused) {
        try {
          video.currentTime += 0.05;
          video.play().catch(() => {});
        } catch {
          video.play().catch(() => {});
        }
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('stalled', onStalled);
    video.addEventListener('waiting', onStalled);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('stalled', onStalled);
      video.removeEventListener('waiting', onStalled);
    };
  }, [videoUrl]);

  // Fallback simulator timer (smooth 20-second dynamic tutorial)
  useEffect(() => {
    if (videoUrl) return;

    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.2;
          if (next >= duration) {
            setIsPlaying(false);
            setFallbackStep(1);
            return 0;
          }
          // Cycle through 4 steps smoothly every 5 seconds
          if (next < 5) setFallbackStep(1);
          else if (next < 10) setFallbackStep(2);
          else if (next < 15) setFallbackStep(3);
          else setFallbackStep(4);
          return next;
        });
      }, 200);
    }

    return () => clearInterval(timer);
  }, [isPlaying, videoUrl, duration]);

  const togglePlay = () => {
    if (videoUrl && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // IF ADMIN UPLOADED AN ACTUAL VIDEO
  if (videoUrl) {
    return (
      <div className="relative mx-auto w-full max-w-[330px] rounded-[32px] overflow-hidden border-[6px] border-slate-900 shadow-2xl bg-black aspect-[9/16] flex flex-col justify-between select-none">
        {/* Top Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            playsInline
            preload="auto"
            controls={true}
            loop={false}
          />
        </div>
      </div>
    );
  }

  // FALLBACK SIMULATION: Real, animated 4-step tutorial exactly as original
  return (
    <div className="relative mx-auto w-full max-w-[330px] rounded-[32px] overflow-hidden border-[6px] border-slate-900 shadow-2xl bg-white aspect-[9/16] flex flex-col justify-between select-none">
      {/* Top Phone Speaker / Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
      </div>

      {/* Internal Mini Screen Header */}
      <div className="pt-7 px-4 pb-2 border-b border-slate-100 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-2">
          <LegendsOfFireLogo className="w-6 h-6 rounded-md shadow-xs" />
          <div>
            <div className="text-[10px] font-black tracking-wide text-slate-900 leading-tight">
              {(!portalName || portalName === 'MR. FARDIN') ? 'LEGENDS OF FIRE' : portalName}
            </div>
            <div className="text-[7px] text-slate-500 font-semibold uppercase tracking-wider">
              {portalSubName || 'ESPORTS OFFICIAL PORTAL'}
            </div>
          </div>
        </div>
        <div className="w-4 h-4 rounded-full border border-rose-300 flex items-center justify-center text-[8px] text-rose-600 font-bold">
          🛡️
        </div>
      </div>

      {/* Dynamic Animated Body that actively transforms every 5 seconds */}
      <div className="flex-1 px-4 py-3 flex flex-col items-center justify-between text-center relative overflow-hidden bg-gradient-to-b from-rose-50/40 via-white to-slate-50">
        {/* Dynamic Step Header Badge */}
        <div className="inline-flex items-center gap-1.5 bg-rose-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-sm">
          <span>ধাপ {fallbackStep}/৪:</span>
          <span>
            {fallbackStep === 1 && 'কিউআর ছবি সেভ (Save)'}
            {fallbackStep === 2 && 'Scan QR ক্যামেরা চালু'}
            {fallbackStep === 3 && 'গ্যালারি থেকে ছবি সিলেক্ট'}
            {fallbackStep === 4 && 'পেমেন্ট সম্পন্ন (০% চার্জ)'}
          </span>
        </div>

        {/* STEP 1 (0-5s): Bangla QR Card with pulsing Save button */}
        {fallbackStep === 1 && (
          <div className="w-full bg-white border border-rose-200 rounded-2xl p-3 shadow-md flex flex-col items-center transition-all animate-fadeIn">
            <div className="text-[7px] font-black tracking-wider text-rose-600 uppercase mb-1">
              SCAN & PAY VIA BANGLA QR
            </div>
            <div className="w-24 h-24 bg-white p-1 rounded-xl border border-slate-200 relative flex items-center justify-center my-1 shadow-inner">
              <img src={qrImageUrl} alt="QR Code" className="w-full h-full object-contain" />
              {isPlaying && (
                <div className="absolute inset-0 border-2 border-dashed border-rose-500 rounded-xl animate-ping opacity-25" />
              )}
            </div>
            <div
              className={`mt-1 w-full py-1.5 rounded-lg text-[9px] font-bold shadow-sm transition-all ${
                isPlaying ? 'bg-emerald-600 text-white animate-pulse' : 'bg-rose-600 text-white'
              }`}
            >
              {isPlaying ? '✓ Image Saved!' : 'Save'}
            </div>
          </div>
        )}

        {/* STEP 2 (5-10s): Mobile App Camera Viewfinder Scanning with Laser Beam */}
        {fallbackStep === 2 && (
          <div className="w-full bg-slate-900 rounded-2xl p-3 shadow-lg flex flex-col items-center text-white relative overflow-hidden transition-all animate-fadeIn border border-slate-700">
            <div className="text-[8px] font-bold text-slate-300 flex items-center gap-1 mb-2">
              <Camera className="w-3 h-3 text-rose-400" />
              <span>bKash / Nagad Scan QR</span>
            </div>

            {/* Camera Viewfinder with animated laser scan beam */}
            <div className="w-28 h-28 border-2 border-rose-500 rounded-xl relative flex items-center justify-center bg-black/40 overflow-hidden">
              <div className="w-16 h-16 opacity-40">
                <img src={qrImageUrl} alt="Scanning" className="w-full h-full object-contain filter invert" />
              </div>
              {/* Laser scanner line moving up and down */}
              <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-bounce" />
            </div>

            <span className="text-[8px] text-slate-300 font-medium mt-2">
              কিউআর কোড স্ক্যান হচ্ছে...
            </span>
          </div>
        )}

        {/* STEP 3 (10-15s): Gallery Picker with lofpay.png selected */}
        {fallbackStep === 3 && (
          <div className="w-full bg-white border border-slate-200 rounded-2xl p-3 shadow-md flex flex-col items-center transition-all animate-fadeIn">
            <div className="text-[8px] font-bold text-slate-700 flex items-center gap-1 mb-2">
              <Image className="w-3 h-3 text-rose-600" />
              <span>Gallery Picker</span>
            </div>

            <div className="w-full bg-slate-50 border-2 border-dashed border-emerald-500 rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg p-0.5 flex items-center justify-center">
                  <img src={qrImageUrl} alt="Thumb" className="w-full h-full object-contain" />
                </div>
                <div className="text-left">
                  <div className="text-[9px] font-mono font-bold text-slate-800">lofpay.png</div>
                  <div className="text-[7px] text-emerald-600 font-bold">✓ Selected</div>
                </div>
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="mt-2 w-full py-1 rounded-lg bg-emerald-600 text-white text-[8px] font-bold">
              পরবর্তী ধাপে যান
            </div>
          </div>
        )}

        {/* STEP 4 (15-20s): Payment Success Animation with 0 Charge */}
        {fallbackStep === 4 && (
          <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-3 shadow-md flex flex-col items-center text-center transition-all animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1.5 shadow-md animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-black text-emerald-900 leading-tight">
              পেমেন্ট সফল হয়েছে!
            </div>
            <div className="text-[8px] font-bold text-emerald-700 mt-0.5">
              চার্জ: ৳০.০০ (সম্পূর্ণ ফ্রি)
            </div>
            <div className="mt-2 text-[7px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 text-slate-600">
              TrxID: 9X29A88L
            </div>
          </div>
        )}

        {/* Live Step Explanation Bar */}
        <div className="text-[9px] text-slate-700 bg-white/95 border border-slate-200 rounded-xl p-2 w-full font-semibold shadow-2xs leading-relaxed">
          {fallbackStep === 1 && '১. Save বাটনে চাপ দিয়ে কিউআর ছবিটি সেভ করুন।'}
          {fallbackStep === 2 && '২. বিকাশ বা নগদ অ্যাপে Scan QR অপশনে যান।'}
          {fallbackStep === 3 && '৩. গ্যালারি থেকে সেভ করা lofpay.png ছবিটি সিলেক্ট করুন।'}
          {fallbackStep === 4 && '৪. নির্ধারিত টাকা লিখে পেমেন্ট কনফার্ম করুন (০ টাকা চার্জ)।'}
        </div>

        {/* Big Center Play Button Overlay */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            aria-label="Play video tutorial"
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/70 hover:bg-black/85 backdrop-blur-xs flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-2xl z-30 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Video Controls Bar */}
      <div className="bg-black/95 text-white px-3 py-2 z-20 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-300">
          <button
            onClick={togglePlay}
            className="text-white hover:text-rose-400 p-0.5 transition cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <span className="font-mono text-[9px] text-slate-300">
            {formatTime(currentTime)} / 0:20
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-300 hover:text-white p-0.5 cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setCurrentTime(0);
                setFallbackStep(1);
                setIsPlaying(true);
              }}
              className="text-slate-300 hover:text-white p-0.5 cursor-pointer"
              title="Restart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Smooth Real-time Scrubber Bar */}
        <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-200"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
