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
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const agreeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const disagreeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      triggerExit('right', 1);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      triggerExit('left', -1);
    }
  }

  function triggerExit(dir: 'left' | 'right', score: IssueScore) {
    setExiting(dir);
    setTimeout(() => onRespond(score), 250);
  }

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center touch-none select-none"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={
        exiting
          ? { x: exiting === 'right' ? 400 : -400, opacity: 0 }
          : { x: 0, opacity: 1 }
      }
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Card */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white/10 p-8 backdrop-blur-lg border border-glass-border">
        {/* Swipe hint overlays */}
        <motion.span
          style={{ opacity: agreeOpacity }}
          className="absolute top-4 right-4 rounded-lg bg-agree/20 px-3 py-1 text-sm font-bold text-agree"
        >
          AGREE
        </motion.span>
        <motion.span
          style={{ opacity: disagreeOpacity }}
          className="absolute top-4 left-4 rounded-lg bg-disagree/20 px-3 py-1 text-sm font-bold text-disagree"
        >
          DISAGREE
        </motion.span>

        <span className="mb-4 inline-block rounded-full bg-poly-violet/20 px-3 py-1 text-xs font-medium text-poly-accent">
          {issue.category}
        </span>
        <p className="text-lg leading-relaxed text-text-primary">{issue.text}</p>
      </div>

      {/* Tap buttons */}
      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={() => triggerExit('left', -1)}
          aria-label="Disagree"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-disagree/20 px-5 py-3 font-semibold text-disagree transition hover:bg-disagree/30 active:scale-95"
        >
          ✕
        </button>
        <button
          type="button"
          onClick={() => onRespond(0)}
          aria-label="Skip"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-skip/20 px-5 py-3 font-semibold text-skip transition hover:bg-skip/30 active:scale-95"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={() => triggerExit('right', 1)}
          aria-label="Agree"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-agree/20 px-5 py-3 font-semibold text-agree transition hover:bg-agree/30 active:scale-95"
        >
          ✓
        </button>
      </div>
    </motion.div>
  );
}
