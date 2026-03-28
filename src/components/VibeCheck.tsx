import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { getIssues, recordResponse, getProfile, reset } from '../engines/VibeCheckEngine';
import type { IssueStatement, IssueScore } from '../types';
import SwipeCard from './SwipeCard';

export default function VibeCheck() {
  const [issues, setIssues] = useState<IssueStatement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setIssueProfile } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    reset();
    setIssues(getIssues());
  }, []);

  const total = issues.length;
  const remaining = total - currentIndex;
  const progress = total > 0 ? (currentIndex / total) * 100 : 0;
  const currentIssue = issues[currentIndex] ?? null;

  const handleRespond = useCallback(
    (score: IssueScore) => {
      if (!currentIssue) return;
      recordResponse(currentIssue.id, score);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= total) {
        setIssueProfile(getProfile());
        navigate('/results');
      } else {
        setCurrentIndex(nextIndex);
      }
    },
    [currentIssue, currentIndex, total, setIssueProfile, navigate],
  );

  if (total === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6">
        <p className="text-text-secondary text-sm">Loading issues…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center px-6 pt-12 pb-8">
      {/* Header */}
      <div className="w-full max-w-sm">
        <p className="mb-1 text-center text-xs font-medium tracking-widest uppercase text-text-muted">
          Step 2 of 3
        </p>
        <h1 className="text-xl font-semibold text-text-primary text-center">
          Vibe Check
        </h1>
        <p className="mt-1 mb-6 text-center text-sm text-text-secondary">
          {remaining} {remaining === 1 ? 'question' : 'questions'} remaining
        </p>

        {/* Progress bar */}
        <div
          className="h-1 w-full overflow-hidden rounded-[var(--radius-full)] bg-border-default"
          role="progressbar"
          aria-valuenow={currentIndex}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          <div
            className="h-full rounded-[var(--radius-full)] bg-poly-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card area */}
      <div className="relative mt-10 flex w-full max-w-sm flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {currentIssue && (
            <SwipeCard key={currentIssue.id} issue={currentIssue} onRespond={handleRespond} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
