const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tempDir = path.join(__dirname, '../temp_frames');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 4 distinct slides for the 4 payment steps (each 4 seconds = 16 seconds total)
const slides = [
  {
    step: "ধাপ ১: কিউআর ছবি সেভ (Save)",
    title: "1. Save Bangla QR Image",
    desc: "উপরের Save বাটনে ক্লিক করে lofpay.png ছবিটি আপনার গ্যালারিতে সেভ করুন",
    badge: "0% Fee | Instant Download",
    bg: "#1e1b4b",
    color: "#e11d48",
  },
  {
    step: "ধাপ ২: পেমেন্ট অ্যাপে Scan QR অপশন",
    title: "2. Open bKash / Nagad Scan QR",
    desc: "আপনার বিকাশ, নগদ বা রকেট অ্যাপে লগইন করে Scan QR বাটনে চাপ দিন",
    badge: "bKash • Nagad • Rocket",
    bg: "#0f172a",
    color: "#f59e0b",
  },
  {
    step: "ধাপ ৩: গ্যালারি থেকে lofpay.png সিলেক্ট",
    title: "3. Select lofpay.png from Gallery",
    desc: "স্ক্যানার স্ক্রিনে গ্যালারি আইকনে ক্লিক করে ডাউনলোড করা কিউআর ছবিটি সিলেক্ট করুন",
    badge: "lofpay.png Selected",
    bg: "#111827",
    color: "#3b82f6",
  },
  {
    step: "ধাপ ৪: টাকার পরিমাণ ও পেমেন্ট সম্পন্ন",
    title: "4. Enter Amount & Pay with 0% Fee",
    desc: "টাকার পরিমাণ লিখে পিন দিয়ে সেন্ড করুন, ৫ টাকা ক্যাশআউট চার্জ সম্পূর্ণ ফ্রি!",
    badge: "✓ Payment Successful (0 Tk Fee)",
    bg: "#064e3b",
    color: "#10b981",
  }
];

// Generate SVG files for each slide
slides.forEach((slide, idx) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="50%" stopColor="${slide.bg}" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
    </defs>
    
    <rect width="720" height="1280" fill="url(#bgGrad)" />

    <!-- Top Branding -->
    <rect x="60" y="80" width="600" height="90" rx="45" fill="#ffffff" fill-opacity="0.1" />
    <text x="360" y="138" font-family="sans-serif" font-size="34" font-weight="900" fill="#f8fafc" text-anchor="middle" letter-spacing="2">
      LEGENDS OF FIRE
    </text>

    <!-- Step Badge -->
    <rect x="160" y="220" width="400" height="70" rx="35" fill="${slide.color}" />
    <text x="360" y="266" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">
      ${slide.step}
    </text>

    <!-- Center Phone Screen Mockup -->
    <rect x="90" y="340" width="540" height="620" rx="40" fill="#ffffff" stroke="#334155" stroke-width="8" />

    <!-- Mockup Header -->
    <rect x="90" y="340" width="540" height="80" rx="40" fill="#f1f5f9" />
    <text x="360" y="392" font-family="sans-serif" font-size="24" font-weight="bold" fill="#0f172a" text-anchor="middle">
      ${slide.title}
    </text>

    <!-- Mockup Content: QR Code Frame -->
    <rect x="200" y="460" width="320" height="320" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="4" />
    
    <!-- QR Corner brackets -->
    <path d="M 220 500 L 220 480 L 240 480" stroke="${slide.color}" stroke-width="8" fill="none" stroke-linecap="round" />
    <path d="M 500 500 L 500 480 L 480 480" stroke="${slide.color}" stroke-width="8" fill="none" stroke-linecap="round" />
    <path d="M 220 740 L 220 760 L 240 760" stroke="${slide.color}" stroke-width="8" fill="none" stroke-linecap="round" />
    <path d="M 500 740 L 500 760 L 480 760" stroke="${slide.color}" stroke-width="8" fill="none" stroke-linecap="round" />

    <!-- Center icon/badge in QR -->
    <circle cx="360" cy="620" r="45" fill="${slide.color}" />
    <text x="360" y="632" font-family="sans-serif" font-size="36" font-weight="bold" fill="#ffffff" text-anchor="middle">
      ${idx === 0 ? '⬇' : (idx === 1 ? '📷' : (idx === 2 ? '🖼' : '✓'))}
    </text>

    <!-- Big Action Button in Mockup -->
    <rect x="150" y="820" width="420" height="80" rx="24" fill="${slide.color}" />
    <text x="360" y="872" font-family="sans-serif" font-size="32" font-weight="bold" fill="#ffffff" text-anchor="middle">
      ${slide.badge}
    </text>

    <!-- Bottom Explanation Card -->
    <rect x="60" y="1000" width="600" height="180" rx="28" fill="#1e293b" fill-opacity="0.9" stroke="#334155" stroke-width="2" />
    <text x="360" y="1065" font-family="sans-serif" font-size="24" font-weight="bold" fill="#f1f5f9" text-anchor="middle">
      ${slide.desc.slice(0, 38)}
    </text>
    <text x="360" y="1115" font-family="sans-serif" font-size="22" font-weight="normal" fill="#94a3b8" text-anchor="middle">
      ${slide.desc.slice(38) || 'বিকাশ, নগদ, রকেট বাংলা কিউআর পেমেন্ট'}
    </text>

    <!-- Progress indicator dots -->
    <circle cx="300" cy="1220" r="10" fill="${idx === 0 ? slide.color : '#475569'}" />
    <circle cx="340" cy="1220" r="10" fill="${idx === 1 ? slide.color : '#475569'}" />
    <circle cx="380" cy="1220" r="10" fill="${idx === 2 ? slide.color : '#475569'}" />
    <circle cx="420" cy="1220" r="10" fill="${idx === 3 ? slide.color : '#475569'}" />
  </svg>`;

  fs.writeFileSync(path.join(tempDir, `slide_${idx}.svg`), svg);
});

console.log('SVGs created. Converting to PNG and MP4 using ffmpeg...');

try {
  // Convert SVGs to PNG
  for (let i = 0; i < 4; i++) {
    execSync(`ffmpeg -y -i "${path.join(tempDir, `slide_${i}.svg`)}" "${path.join(tempDir, `slide_${i}.png`)}"`, { stdio: 'inherit' });
  }

  // Create video clips for each slide (4 seconds each = 16 seconds total)
  for (let i = 0; i < 4; i++) {
    execSync(`ffmpeg -y -loop 1 -t 4 -i "${path.join(tempDir, `slide_${i}.png`)}" -c:v libx264 -pix_fmt yuv420p -r 30 "${path.join(tempDir, `clip_${i}.mp4`)}"`, { stdio: 'inherit' });
  }

  // Create concat file
  const concatFile = path.join(tempDir, 'concat.txt');
  fs.writeFileSync(concatFile, `file '${path.join(tempDir, 'clip_0.mp4')}'\nfile '${path.join(tempDir, 'clip_1.mp4')}'\nfile '${path.join(tempDir, 'clip_2.mp4')}'\nfile '${path.join(tempDir, 'clip_3.mp4')}'\n`);

  // Concat all 4 clips into single MP4 with smooth audio tone
  const outputMp4 = path.join(__dirname, '../public/tutorial.mp4');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -f lavfi -i "sine=frequency=440:beep_factor=4:duration=16" -c:v copy -c:a aac -shortest -movflags +faststart "${outputMp4}"`, { stdio: 'inherit' });

  console.log('Successfully generated public/tutorial.mp4!');
} catch (err) {
  console.error('Error generating video:', err);
}
