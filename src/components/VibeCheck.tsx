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
    <div className="min-h-dvh relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#6096BA]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-[#274C77]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* Top bar */}
      <header className="relative z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xl font-bold text-[#274C77] hover:opacity-80 transition"
        >
          Poly
        </button>
        <span className="text-sm text-gray-500">{remaining} {remaining === 1 ? 'question' : 'questions'} left</span>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center px-4 py-10">
        {/* Progress */}
        <div className="w-full max-w-xl mb-8">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Question {quizIndex + 1} of {total}</span>
            <span style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{Math.round(progress)}% complete</span>
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
