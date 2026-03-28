import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { getIssues, recordResponse, getProfile, reset } from '../engines/VibeCheckEngine';
import type { IssueStatement, IssueScore } from '../types';
import SwipeCard from './SwipeCard';

export default function VibeCheck() {
  const [issues, setIssues] = useState<IssueStatement[]>([]);
  const { setIssueProfile, quizIndex, setQuizIndex, setQuizComplete } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    reset();
    setIssues(getIssues());
  }, []);

  const total = issues.length;
  const remaining = total - quizIndex;
  const progress = total > 0 ? (quizIndex / total) * 100 : 0;
  const currentIssue = issues[quizIndex] ?? null;

  const handleRespond = useCallback(
    (score: IssueScore) => {
      if (!currentIssue) return;
      recordResponse(currentIssue.id, score);
      const nextIndex = quizIndex + 1;
      if (nextIndex >= total) {
        setIssueProfile(getProfile());
        setQuizComplete(true);
        setQuizIndex(0);
        navigate('/results');
      } else {
        setQuizIndex(nextIndex);
      }
    },
    [currentIssue, quizIndex, total, setIssueProfile, setQuizComplete, setQuizIndex, navigate],
  );

  if (total === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-text-secondary text-sm">Loading questions…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#E7ECEF] via-white to-[#A3CEF1] relative">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#6096BA]/35 via-[#A3CEF1]/25 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-[#274C77]/30 via-[#6096BA]/25 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#A3CEF1]/20 via-white/30 to-[#6096BA]/20 rounded-full blur-3xl" />
      
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(96,150,186,0.1),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(39,76,119,0.08),transparent_50%),radial-gradient(circle_at_50%_80%,rgba(163,206,241,0.1),transparent_50%)]" />
      
      {/* Top bar */}
      <header className="relative z-10 bg-white/50 backdrop-blur-xl border-b border-white/20 px-6 py-3 flex items-center justify-between shadow-sm">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xl font-bold bg-gradient-to-r from-brand-purple to-brand-violet bg-clip-text text-transparent hover:opacity-80 transition"
        >
          Poly
        </button>
        <span className="text-sm text-text-muted">{remaining} {remaining === 1 ? 'question' : 'questions'} left</span>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center px-4 py-10">
        {/* Progress */}
        <div className="w-full max-w-xl mb-8">
          <div className="flex justify-between text-xs text-text-muted mb-2">
            <span>Question {quizIndex + 1} of {total}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div
            className="h-1.5 w-full rounded-full bg-white/60 backdrop-blur-sm overflow-hidden shadow-sm"
            role="progressbar"
            aria-valuenow={quizIndex}
            aria-valuemin={0}
            aria-valuemax={total}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-violet transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card area */}
        <div className="relative w-full max-w-xl flex-1 flex items-start justify-center">
          <AnimatePresence mode="wait">
            {currentIssue && (
              <SwipeCard key={currentIssue.id} issue={currentIssue} onRespond={handleRespond} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
