export default function PolyLogo({ size = 32 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size * 1.2} viewBox="0 0 100 120" aria-label="Poly logo">
      <defs>
        <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00aaff"/>
          <stop offset="40%" stopColor="#6633ff"/>
          <stop offset="70%" stopColor="#cc33ff"/>
          <stop offset="100%" stopColor="#ff3366"/>
        </linearGradient>
        <linearGradient id="swipeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4455ff" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#ff3366" stopOpacity="0.7"/>
        </linearGradient>
      </defs>
      <path d="M50 5 C27 5 8 24 8 47 C8 70 50 115 50 115 C50 115 92 70 92 47 C92 24 73 5 50 5 Z"
        fill="url(#pinGrad)"/>
      <path d="M50 5 C73 5 92 24 92 47 C92 60 80 75 65 90 C55 100 50 115 50 115 C50 115 30 88 18 68 Z"
        fill="url(#swipeGrad)"/>
      <polygon points="50,22 55,38 72,38 59,48 63,64 50,54 37,64 41,48 28,38 45,38"
        fill="#0a0a1a" opacity="0.85"/>
    </svg>
  );
}
