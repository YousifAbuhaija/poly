import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Simplified SVG US map outline — recognizable but lightweight.
 */
function USMapSVG() {
  return (
    <svg
      viewBox="0 0 960 600"
      className="w-full h-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Continental US simplified outline */}
      <path
        d="M 120 200 L 160 180 L 200 170 L 240 160 L 280 155 L 320 150 L 360 145
           L 400 140 L 440 138 L 480 140 L 520 145 L 560 150 L 600 155
           L 640 160 L 680 170 L 700 180 L 720 175 L 740 180 L 760 190
           L 780 200 L 800 220 L 810 240 L 820 260 L 830 280 L 835 300
           L 830 320 L 820 340 L 800 360 L 780 370 L 760 375 L 740 380
           L 720 390 L 700 400 L 680 410 L 660 415 L 640 420 L 620 425
           L 600 430 L 580 432 L 560 430 L 540 425 L 520 420 L 500 418
           L 480 420 L 460 425 L 440 430 L 420 435 L 400 440 L 380 438
           L 360 432 L 340 425 L 320 420 L 300 418 L 280 420 L 260 425
           L 240 430 L 220 428 L 200 420 L 180 410 L 160 395 L 140 380
           L 125 360 L 115 340 L 110 320 L 108 300 L 110 280 L 112 260
           L 115 240 L 118 220 Z"
        stroke="rgba(168, 85, 247, 0.3)"
        strokeWidth="2"
        fill="rgba(168, 85, 247, 0.05)"
      />
      {/* Florida peninsula */}
      <path
        d="M 680 410 L 700 430 L 720 460 L 730 490 L 725 510 L 710 500 L 695 480 L 680 450 L 670 430 L 680 410"
        stroke="rgba(168, 85, 247, 0.3)"
        strokeWidth="2"
        fill="rgba(168, 85, 247, 0.05)"
      />
      {/* Texas bulge */}
      <path
        d="M 400 440 L 410 460 L 420 480 L 430 500 L 425 510 L 410 505 L 395 490 L 385 470 L 380 450 L 380 438"
        stroke="rgba(168, 85, 247, 0.3)"
        strokeWidth="2"
        fill="rgba(168, 85, 247, 0.05)"
      />
      {/* Scatter dots for major cities */}
      {[
        [220, 310], [350, 280], [480, 260], [620, 250],
        [750, 220], [300, 400], [500, 380], [680, 350],
        [400, 200], [550, 300], [200, 250], [650, 300],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="3"
          fill="rgba(192, 132, 252, 0.5)"
        />
      ))}
      {/* Subtle grid lines */}
      {[200, 300, 400].map((y) => (
        <line
          key={`h-${y}`}
          x1="100"
          y1={y}
          x2="850"
          y2={y}
          stroke="rgba(168, 85, 247, 0.08)"
          strokeWidth="1"
        />
      ))}
      {[250, 450, 650].map((x) => (
        <line
          key={`v-${x}`}
          x1={x}
          y1="130"
          x2={x}
          y2="520"
          stroke="rgba(168, 85, 247, 0.08)"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* 3D-tilted US map background */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ perspective: '800px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <div
          className="w-full max-w-3xl px-8"
          style={{ transform: 'rotateX(15deg)' }}
        >
          <USMapSVG />
        </div>
      </motion.div>

      {/* Glassmorphism card overlay */}
      <motion.div
        className="relative z-10 bg-white/10 backdrop-blur-lg border border-glass-border rounded-2xl p-8 sm:p-10 max-w-md w-full text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      >
        {/* App title */}
        <motion.h1
          className="text-5xl sm:text-6xl font-bold text-poly-accent tracking-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          Poly
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="mt-4 text-text-secondary text-lg sm:text-xl leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          Know your candidates. Match your values. Vote with confidence.
        </motion.p>

        {/* CTA button */}
        <motion.button
          onClick={() => navigate('/onboarding')}
          className="mt-8 min-h-[44px] min-w-[44px] px-8 py-3 bg-poly-violet hover:bg-poly-purple text-white font-semibold text-lg rounded-xl transition-colors duration-200 cursor-pointer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  );
}
