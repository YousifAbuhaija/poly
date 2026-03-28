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
      <div className="card relative w-full max-w-sm p-8">
        {/* Swipe hint overlays */}
        <motion.span
          style={{ opacity: agreeOpacity }}
          className="absolute top-4 right-4 rounded-[var(--radius-sm)] bg-agree-subtle px-3 py-1 text-xs font-semibold text-agree uppercase tracking-wide"
        >
          Agree
        </motion.span>
        <motion.span
          style={{ opacity: disagreeOpacity }}
          className="absolute top-4 left-4 rounded-[var(--radius-sm)] bg-disagree-subtle px-3 py-1 text-xs font-semibold text-disagree uppercase tracking-wide"
        >
          Disagree
        </motion.span>

        <span className="mb-4 inline-block rounded-[var(--radius-full)] bg-poly-primary-subtle px-3 py-1 text-xs font-medium text-poly-accent">
          {issue.category}
        </span>
        <p className="text-lg leading-relaxed text-text-primary">{issue.text}</p>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => triggerExit('left', -1)}
          aria-label="Disagree"
          className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-disagree-subtle text-disagree transition hover:bg-disagree/20 active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <button
          type="button"
          onClick={() => onRespond(0)}
          aria-label="Skip"
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] bg-surface-hover text-text-muted transition hover:bg-surface-input active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
        </button>
        <button
          type="button"
          onClick={() => triggerExit('right', 1)}
          aria-label="Agree"
          className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-agree-subtle text-agree transition hover:bg-agree/20 active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </button>
      </div>
    </motion.div>
  );
}
