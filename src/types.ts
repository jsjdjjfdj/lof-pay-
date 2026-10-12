export interface FAQItem {
  question: string;
  answer: string;
  questionBn: string;
  answerBn: string;
}

export interface PaymentRule {
  step: number;
  text: string;
  textBn: string;
}

export interface PortalConfig {
  id: string;
  slug: string; // e.g. 'fardin', 'robiul', 'gaming-hub'
  name: string; // e.g. "MR. FARDIN"
  subName: string; // e.g. "ESPORTS OFFICIAL PORTAL"
  verifiedBadgeText: string;
  promoBadge: string;
  promoBadgeBn: string;
  headline: string;
  headlineBn: string;
  subHeadline: string;
  subHeadlineBn: string;
  
  // Media
  logoUrl?: string;
  qrImageUrl: string;
  qrFileName: string;
  qrImageSize?: number; // Custom display size in px (e.g., 160 - 450)
  qrZoom?: number; // Custom zoom percentage (e.g., 100 - 350%)
  qrPanX?: number; // Pan offset X in percent (-50 to 50)
  qrPanY?: number; // Pan offset Y in percent (-50 to 50)
  qrFitMode?: 'contain' | 'cover' | 'fill'; // Display fit mode
  qrShowFrame?: boolean; // Whether to show corner brackets & top scan badge
  qrAspectRatio?: 'square' | 'auto' | 'portrait'; // Aspect ratio mode
  videoUrl: string; // direct video blob or base64 or generated
  videoFileName: string;
  videoCaption: string;
  videoCaptionBn: string;

  // Instructions
  paymentRules: PaymentRule[];
  faqs: FAQItem[];

  // Admin and Contact
  adminName: string;
  adminPasscode: string;
  whatsappNumber: string;
  contactNumber: string;
  telegramUsername?: string;
  footerBrand: string;
  footerPoweredBy: string;

  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
}

export interface PaymentSubmission {
  id: string;
  portalId: string;
  method: 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Other';
  senderNumber: string;
  trxId: string;
  amount: string;
  notes?: string;
  screenshotUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: number;
}
