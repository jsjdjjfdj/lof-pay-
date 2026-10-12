import { PortalConfig } from '../types';

// Generate a crisp, realistic Bangla QR SVG data URL matching the screenshots
export function generateDefaultBanglaQR(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <rect width="400" height="400" fill="#ffffff" rx="16" />
    
    <!-- Outer decorative finder patterns (top-left) -->
    <rect x="40" y="40" width="80" height="80" fill="#111827" rx="8" />
    <rect x="52" y="52" width="56" height="56" fill="#ffffff" rx="4" />
    <rect x="64" y="64" width="32" height="32" fill="#e11d48" rx="2" />

    <!-- Top-right finder pattern -->
    <rect x="280" y="40" width="80" height="80" fill="#111827" rx="8" />
    <rect x="292" y="52" width="56" height="56" fill="#ffffff" rx="4" />
    <rect x="304" y="64" width="32" height="32" fill="#e11d48" rx="2" />

    <!-- Bottom-left finder pattern -->
    <rect x="40" y="280" width="80" height="80" fill="#111827" rx="8" />
    <rect x="52" y="292" width="56" height="56" fill="#ffffff" rx="4" />
    <rect x="64" y="304" width="32" height="32" fill="#e11d48" rx="2" />

    <!-- Realistic Bangla QR grid dots -->
    <g fill="#1e293b">
      <!-- Top middle dots -->
      <rect x="140" y="45" width="12" height="24" rx="2"/>
      <rect x="165" y="45" width="24" height="12" rx="2"/>
      <rect x="200" y="45" width="12" height="12" rx="2"/>
      <rect x="225" y="45" width="30" height="12" rx="2"/>
      <rect x="150" y="70" width="12" height="12" rx="2"/>
      <rect x="180" y="70" width="12" height="24" rx="2"/>
      <rect x="210" y="70" width="24" height="12" rx="2"/>
      <rect x="250" y="70" width="12" height="12" rx="2"/>
      <rect x="135" y="100" width="36" height="12" rx="2"/>
      <rect x="190" y="100" width="12" height="12" rx="2"/>
      <rect x="220" y="95" width="15" height="20" rx="2"/>

      <!-- Left vertical dots -->
      <rect x="45" y="140" width="12" height="30" rx="2"/>
      <rect x="70" y="150" width="24" height="12" rx="2"/>
      <rect x="105" y="140" width="12" height="20" rx="2"/>
      <rect x="55" y="190" width="12" height="20" rx="2"/>
      <rect x="80" y="180" width="20" height="12" rx="2"/>
      <rect x="45" y="230" width="30" height="12" rx="2"/>
      <rect x="90" y="220" width="12" height="30" rx="2"/>

      <!-- Right vertical dots -->
      <rect x="285" y="140" width="24" height="12" rx="2"/>
      <rect x="325" y="150" width="30" height="12" rx="2"/>
      <rect x="285" y="170" width="12" height="30" rx="2"/>
      <rect x="315" y="180" width="40" height="12" rx="2"/>
      <rect x="285" y="220" width="30" height="12" rx="2"/>
      <rect x="330" y="230" width="25" height="24" rx="2"/>

      <!-- Bottom middle dots -->
      <rect x="140" y="285" width="24" height="12" rx="2"/>
      <rect x="180" y="285" width="12" height="24" rx="2"/>
      <rect x="210" y="285" width="30" height="12" rx="2"/>
      <rect x="255" y="285" width="12" height="12" rx="2"/>
      <rect x="140" y="320" width="12" height="30" rx="2"/>
      <rect x="170" y="330" width="30" height="12" rx="2"/>
      <rect x="220" y="320" width="20" height="20" rx="2"/>
      <rect x="250" y="330" width="15" height="20" rx="2"/>
      <rect x="285" y="320" width="24" height="12" rx="2"/>
      <rect x="320" y="300" width="12" height="30" rx="2"/>
      <rect x="345" y="330" width="15" height="15" rx="2"/>

      <!-- Timing tracks and random matrix elements -->
      <rect x="145" y="130" width="12" height="12" rx="2"/>
      <rect x="170" y="130" width="15" height="15" rx="2"/>
      <rect x="240" y="130" width="20" height="12" rx="2"/>
      <rect x="130" y="160" width="25" height="12" rx="2"/>
      <rect x="245" y="160" width="20" height="25" rx="2"/>
      <rect x="135" y="210" width="12" height="30" rx="2"/>
      <rect x="250" y="210" width="15" height="15" rx="2"/>
      <rect x="140" y="250" width="30" height="12" rx="2"/>
      <rect x="230" y="250" width="25" height="12" rx="2"/>
      <rect x="190" y="250" width="20" height="12" rx="2"/>
    </g>

    <!-- Center Bangla QR official style badge -->
    <rect x="160" y="160" width="80" height="80" fill="#ffffff" rx="14" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" stroke="#e2e8f0" stroke-width="2"/>
    
    <!-- Red circle & green circle symbol of Bangla QR / BD Flag -->
    <circle cx="200" cy="190" r="22" fill="#059669" />
    <circle cx="200" cy="190" r="13" fill="#dc2626" />
    
    <!-- Bangla text under logo -->
    <text x="200" y="228" font-size="10" font-family="'Hind Siliguri', sans-serif" font-weight="bold" fill="#0f172a" text-anchor="middle">বাংলা কিউআর</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const LOF_PAY_PORTAL: PortalConfig = {
  id: 'lof-pay-portal',
  slug: 'lof',
  name: 'LEGENDS OF FIRE',
  subName: 'ESPORTS OFFICIAL PORTAL',
  logoUrl: '/logo.png',
  verifiedBadgeText: '100% Verified Portal',
  promoBadge: '0% Cashout Charge | Save 5 Taka Charge!',
  promoBadgeBn: '০% ক্যাশআউট চার্জ | ৫ টাকা বাচান!',
  headline: 'Make payments using Bangla QR from any medium like bKash, Nagad, Rocket without any charges!',
  headlineBn: 'বিকাশ, নগদ, রকেট যেকোনো মাধ্যম থেকে বাংলা কিউআর ব্যবহার করে পেমেন্ট করুন কোনো চার্জ ছাড়াই!',
  subHeadline: 'There will be no five taka send money or cashout charge.',
  subHeadlineBn: 'পাঁচ টাকা সেন্ড মানি বা ক্যাশআউট চার্জ লাগবে না।',
  
  qrImageUrl: generateDefaultBanglaQR(),
  qrFileName: 'lofpay.png',
  qrImageSize: 240,
  qrZoom: 100,
  qrPanX: 0,
  qrPanY: 0,
  qrFitMode: 'contain',
  qrShowFrame: true,
  qrAspectRatio: 'square',
  videoUrl: '',
  videoFileName: 'lof_tutorial.mp4',
  videoCaption: 'Watch the short video to make payments easily (with sound)',
  videoCaptionBn: 'ভিডিওটি দেখে খুব সহজে পেমেন্ট সম্পন্ন করুন (সাউন্ড সহ)',

  paymentRules: [
    {
      step: 1,
      text: 'Download the QR image by clicking the "Save" button above .',
      textBn: 'উপরের "Save" বাটনে ক্লিক করে কিউআর (QR) ছবিটি ডাউনলোড বা সেভ করুন।'
    },
    {
      step: 2,
      text: 'Log in to the bKash, Nagad or Rocket app and go to the "Scan QR / Bangla QR" option.',
      textBn: 'বিকাশ, নগদ অথবা রকেট অ্যাপে লগইন করে "Scan QR / বাংলা কিউআর" অপশনে যান।'
    },
    {
      step: 3,
      text: 'Click on the gallery icon and select the downloaded lofpay.png image.',
      textBn: 'গ্যালারি আইকনে ক্লিক করে ডাউনলোড করা lofpay.png ছবিটি সিলেক্ট করুন।'
    },
    {
      step: 4,
      text: 'Complete the payment by entering the specified amount (no additional charges will be deducted).',
      textBn: 'নির্ধারিত টাকার পরিমাণ লিখে পেমেন্ট সম্পন্ন করুন (কোনো অতিরিক্ত চার্জ কাটা হবে না)।'
    }
  ],

  faqs: [
    {
      question: 'Is there any charge for using Bangla QR?',
      questionBn: 'বাংলা কিউআর ব্যবহারে কোনো অতিরিক্ত চার্জ আছে কি?',
      answer: 'No, there is no additional charge of even 1 taka when making payments using Bangla QR. The send money charge of 5 taka is completely waived.',
      answerBn: 'না, বাংলা কিউআর ব্যবহার করে পেমেন্ট করলে ১ টাকাও অতিরিক্ত চার্জ নেই। সেন্ড মানির ৫ টাকা চার্জ সম্পূর্ণ ফ্রি।'
    },
    {
      question: 'Which app can be used to scan?',
      questionBn: 'কোন কোন অ্যাপ দিয়ে স্ক্যান করা যাবে?',
      answer: 'You can scan it using the "Scan QR" option of bKash, Nagad, Rocket, Upay, Cellfin or any banking app.',
      answerBn: 'বিকাশ, নগদ, রকেট, উপায়, সেলফিন অথবা যেকোনো ব্যাংকিং অ্যাপের "স্ক্যান কিউআর" অপশন ব্যবহার করে স্ক্যান করতে পারবেন।'
    },
    {
      question: 'What to do after the payment is successful?',
      questionBn: 'পেমেন্ট সফল হওয়ার পর কি করতে হবে?',
      answer: 'After the payment is completed, please confirm by sending us the Transaction ID (TrxID) or screenshot.',
      answerBn: 'পেমেন্ট সম্পন্ন হওয়ার পর ট্রানজেকশন আইডি (TrxID) বা স্ক্রিনশট পাঠিয়ে কনফার্ম করুন।'
    }
  ],

  adminName: 'Admin Legends Of Fire',
  adminPasscode: 'Asif4545',
  whatsappNumber: '8801700000000',
  contactNumber: '01700000000',
  telegramUsername: '@legendsoffire',
  footerBrand: 'LEGENDS OF FIRE',
  footerPoweredBy: 'LEGENDS OF FIRE',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isDefault: true,
};

export const DEFAULT_PORTAL: PortalConfig = LOF_PAY_PORTAL;

export const INITIAL_PORTALS: PortalConfig[] = [
  LOF_PAY_PORTAL,
  {
    ...LOF_PAY_PORTAL,
    id: 'admin2-portal',
    slug: 'admin2',
    name: 'LEGENDS OF FIRE',
    subName: 'OFFICIAL PORTAL (ADMIN 2)',
    qrFileName: 'lof_admin2_qr.png',
    footerBrand: 'LEGENDS OF FIRE',
    footerPoweredBy: 'LEGENDS OF FIRE',
    adminName: 'Admin 2 (Legends Of Fire)',
    isDefault: false,
  }
];

