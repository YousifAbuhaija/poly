import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/** Abstract geometric background — clean, not a crude map */
function GeometricBG() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="w-full h-auto opacity-[0.07]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Grid of dots */}
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 16 }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={50 + col * 48}
            cy={50 + row * 48}
            r="1.5"
            fill="currentColor"
            className="text-poly-accent"
          />
        )),
      )}
      {/* Connecting lines — sparse, geometric */}
      <path d="M 200 150 L 400 250 L 600 200" stroke="currentColor" strokeWidth="0.5" className="text-poly-primary" />
      <path d="M 150 350 L 350 300 L 550 400" stroke="currentColor" strokeWidth="0.5" className="text-poly-primary" />
      <circle cx="400" cy="250" r="60" stroke="currentColor" strokeWidth="0.5" className="text-poly-primary" />
      <circle cx="400" cy="250" r="120" stroke="currentColor" strokeWidth="0.3" className="text-poly-primary" />
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Background pattern */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <div className="w-full max-w-4xl">
          <GeometricBG />
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full text-center">
        {/* Logo mark */}
        <motion.div
          className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] bg-poly-primary"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-2xl font-bold text-white">P</span>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl font-semibold text-text-primary tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Poly
        </motion.h1>

        <motion.p
          className="mt-4 text-lg text-text-secondary leading-relaxed"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Understand your candidates.<br />
          Match your values. Vote informed.
        </motion.p>

        <motion.button
          onClick={() => navigate('/onboarding')}
          className="mt-10 inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-md)] bg-poly-primary px-8 py-3 text-base font-medium text-white transition-colors hover:bg-poly-primary-hover cursor-pointer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          whileTap={{ scale: 0.98 }}
        >
          Get started
        </motion.button>

        <motion.p
          className="mt-6 text-xs text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          Non-partisan. Values-based. Transparent.
        </motion.p>
      </div>
    </div>
  );
}
