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
      <div className="min-h-dvh flex items-center justify-center px-4">
        <p className="text-slate">Loading issues…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col px-4 py-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-teal/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-lavender/5 rounded-full blur-3xl" />
      
      {/* Progress dots - 11 total (10 questions + 1 for completion) */}
      <div className="w-full max-w-md mx-auto mb-8 relative z-10">
        <div className="flex gap-2 justify-center">
          {Array.from({ length: 11 }).map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all duration-300`}
              style={{
                backgroundColor: index < currentIndex
                  ? '#416165'
                  : index === currentIndex
                  ? 'rgba(65, 97, 101, 0.6)'
                  : '#E8E8E8'
              }}
            />
          ))}
        </div>
      </div>

      {/* Card area */}
      <div className="flex w-full max-w-md mx-auto flex-1 items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {currentIssue && (
            <SwipeCard key={currentIssue.id} issue={currentIssue} onRespond={handleRespond} />
          )}
        </AnimatePresence>
      </div>

      {/* Question counter */}
      <div className="w-full max-w-md mx-auto mt-6 text-center relative z-10">
        <p className="text-sm text-slate">
          Question {currentIndex + 1} of {total}
        </p>
      </div>
    </div>
  );
}
