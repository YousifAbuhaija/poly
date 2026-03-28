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
  const progress = total > 0 ? ((currentIndex) / total) * 100 : 0;
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
      <div className="min-h-dvh flex items-center justify-center px-4">
        <p className="text-text-secondary">Loading issues…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-white">Vibe Check</h1>
        <p className="mb-4 text-center text-sm text-text-secondary">
          Swipe or tap to share your take — {remaining} left
        </p>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={currentIndex} aria-valuemin={0} aria-valuemax={total}>
          <div
            className="h-full rounded-full bg-poly-violet transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card area */}
      <div className="relative mt-8 flex w-full max-w-sm flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {currentIssue && (
            <SwipeCard key={currentIssue.id} issue={currentIssue} onRespond={handleRespond} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
