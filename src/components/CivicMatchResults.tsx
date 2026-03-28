import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { computeMatches } from '../engines/CivicMatchEngine';
import { loadIssues } from '../services/DataLoader';
import CandidateCard from './CandidateCard';

export default function CivicMatchResults() {
  const { location, issueProfile } = useAppContext();
  const navigate = useNavigate();
  const issues = useMemo(() => loadIssues(), []);
  const results = useMemo(() => {
    if (!location) return [];
    return computeMatches(issueProfile, location);
  }, [issueProfile, location]);

  const allSkipped = Object.values(issueProfile).every((s) => s === 0);

  if (!location) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-text-secondary text-sm">Please complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#6096BA]/15 to-[#A3CEF1]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-[#274C77]/15 to-[#6096BA]/10 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        className="relative z-10 mx-auto max-w-4xl px-6 py-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Page header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-text-primary">Your Matches</h1>
          <p className="mt-1 text-text-secondary text-sm">
            {location.city}, {location.state} · {location.county} County
          </p>
        </motion.div>

        {/* Disclaimer */}
        <motion.div 
          className="mb-6 rounded-xl bg-gradient-to-r from-brand-lavender/80 to-purple-100/80 backdrop-blur-sm border border-surface-border px-5 py-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-xs text-brand-accent leading-relaxed">
            Match scores reflect issue agreement and are not endorsements. They represent values alignment based on your responses, not voting recommendations.
          </p>
        </motion.div>

        {allSkipped && (
          <motion.div 
            className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p className="text-sm text-amber-700">
              You skipped all questions - match scores are 0%. Retake the quiz to get better results.
            </p>
            <button
              type="button"
              onClick={() => navigate('/vibe-check')}
              className="mt-2 text-sm font-semibold text-brand-purple hover:underline"
            >
              Retake quiz →
            </button>
          </motion.div>
        )}

        {results.length === 0 && !allSkipped && (
          <motion.div 
            className="rounded-xl bg-white/80 backdrop-blur-sm border border-surface-border px-5 py-8 text-center shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p className="text-text-secondary text-sm">No candidates found for your area. We're working on expanding coverage.</p>
          </motion.div>
        )}

        {/* Results grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Candidate matches">
          {results.map((r, index) => (
            <motion.div 
              key={r.candidate.id} 
              role="listitem"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
            >
              <CandidateCard result={r} issues={issues} onTap={(id) => navigate(`/candidate/${id}`)} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
