import { useState } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import type { IssueStatement, IssueScore } from '../types';

interface SwipeCardProps {
  issue: IssueStatement;
  onRespond: (score: IssueScore) => void;
}

const SWIPE_THRESHOLD = 80;

export default function SwipeCard({ issue, onRespond }: SwipeCardProps) {
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const agreeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const disagreeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) triggerExit('right', 1);
    else if (info.offset.x < -SWIPE_THRESHOLD) triggerExit('left', -1);
  }

  function triggerExit(dir: 'left' | 'right', score: IssueScore) {
    setExiting(dir);
    setTimeout(() => onRespond(score), 180);
  }

  return (
    <motion.div
      className="w-full touch-none select-none"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={
        exiting
          ? { x: exiting === 'right' ? 400 : -400, opacity: 0, scale: 0.92 }
          : { x: 0, opacity: 1, scale: 1, y: 0 }
      }
      exit={{ opacity: 0, scale: 0.96, y: -15 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 28,
        opacity: { duration: 0.2, ease: 'easeOut' },
        scale: { duration: 0.2, ease: 'easeOut' },
        y: { duration: 0.2, ease: 'easeOut' }
      }}
    >
      <div className="relative bg-white/70 backdrop-blur-md rounded-2xl border border-white/30 p-8 shadow-lg">
        {/* Swipe overlays */}
        <motion.span
          style={{ opacity: agreeOpacity }}
          className="absolute top-5 right-5 rounded-lg bg-[#6096BA]/20 border border-[#6096BA]/40 px-3 py-1 text-sm font-bold text-[#274C77]"
        >
          AGREE
        </motion.span>
        <motion.span
          style={{ opacity: disagreeOpacity }}
          className="absolute top-5 left-5 rounded-lg bg-[#8B8C89]/20 border border-[#8B8C89]/40 px-3 py-1 text-sm font-bold text-[#274C77]"
        >
          DISAGREE
        </motion.span>

        <span className="inline-block rounded-full bg-gradient-to-r from-brand-lavender to-purple-100 px-3 py-1 text-xs font-semibold text-brand-accent mb-5">
          {issue.category}
        </span>
        <p className="text-lg text-text-primary leading-relaxed">{issue.text}</p>
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => triggerExit('left', -1)}
          aria-label="Disagree"
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#8B8C89]/40 bg-[#8B8C89]/30 backdrop-blur-sm text-[#274C77] text-sm font-semibold hover:bg-[#8B8C89]/40 hover:shadow-md transition-all"
        >
          <span>✕</span> Disagree
        </button>
        <button
          type="button"
          onClick={() => onRespond(0)}
          aria-label="Skip"
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/40 bg-white/70 backdrop-blur-sm text-text-secondary text-sm font-semibold hover:bg-white/90 hover:shadow-md transition-all"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={() => triggerExit('right', 1)}
          aria-label="Agree"
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#6096BA]/40 bg-[#6096BA]/30 backdrop-blur-sm text-[#274C77] text-sm font-semibold hover:bg-[#6096BA]/40 hover:shadow-md transition-all"
        >
          <span>✓</span> Agree
        </button>
      </div>
    </motion.div>
  );
}
