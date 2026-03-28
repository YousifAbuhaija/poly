import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { loadCandidates, loadElections, loadIssues } from '../services/DataLoader';
import type { Candidate, Election, IssueStatement, IssueScore } from '../types';

function issueLabel(issueId: string, issues: IssueStatement[]): string {
  const issue = issues.find((i) => i.id === issueId);
  return issue ? `${issue.category}: ${issue.text}` : issueId;
}

function scoreLabel(score: IssueScore): string {
  if (score === 1) return 'Agree';
  if (score === -1) return 'Disagree';
  return 'No position';
}

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issueProfile, location } = useAppContext();

  const candidates = useMemo(() => loadCandidates(), []);
  const elections = useMemo(() => loadElections(), []);
  const issues = useMemo(() => loadIssues(), []);

  const candidate: Candidate | undefined = candidates.find((c) => c.id === id);

  const relevantElections: Election[] = useMemo(() => {
    if (!candidate) return [];
    return elections.filter(
      (e) =>
        e.state.toLowerCase() === candidate.state.toLowerCase() &&
        e.county.toLowerCase() === candidate.county.toLowerCase(),
    );
  }, [candidate, elections]);

  const { agreements, disagreements, answeredByBoth } = useMemo(() => {
    if (!candidate) return { agreements: [] as string[], disagreements: [] as string[], answeredByBoth: 0 };
    const ag: string[] = [];
    const dis: string[] = [];
    let count = 0;
    for (const [issueId, userScore] of Object.entries(issueProfile)) {
      if (userScore === 0) continue;
      const candScore = candidate.positions[issueId];
      if (candScore === undefined || candScore === 0) continue;
      count++;
      if (userScore === candScore) {
        ag.push(issueId);
      } else {
        dis.push(issueId);
      }
    }
    return { agreements: ag, disagreements: dis, answeredByBoth: count };
  }, [candidate, issueProfile]);

  const matchPercentage = answeredByBoth > 0
    ? Math.round((agreements.length / answeredByBoth) * 100)
    : 0;

  if (!candidate) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface-subtle">
        <div className="text-center">
          <p className="text-text-secondary text-sm">Candidate not found.</p>
          <button
            type="button"
            onClick={() => navigate('/results')}
            className="mt-4 px-6 py-2 rounded-lg bg-brand-purple text-white text-sm font-semibold hover:bg-brand-accent transition"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const matchColor = matchPercentage >= 70 ? '#22c55e' : matchPercentage >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-dvh relative">
      <div className="absolute top-20 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-[#6096BA]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#274C77]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        className="relative z-10 mx-auto max-w-4xl px-6 py-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Back button */}
        <motion.button
          type="button"
          onClick={() => navigate('/results')}
          className="flex items-center gap-1.5 text-sm font-medium mb-6 text-white hover:text-[#A3CEF1] transition"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
          aria-label="Back to results"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Results
        </motion.button>

        {/* Header card */}
        <motion.div 
          className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl mb-6 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Match percentage badge - top right */}
          <div className="absolute top-6 right-6">
            <div className="flex flex-col items-end">
              <span className="text-4xl font-bold" style={{ color: matchColor }}>{matchPercentage}%</span>
              <span className="text-xs text-gray-500 mt-0.5">Match Score</span>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-[#274C77] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg">
              {candidate.name[0]}
            </div>
            <div className="flex-1 min-w-0 pr-24">
              <h1 className="text-3xl font-bold text-gray-900 mb-1" data-testid="candidate-name">{candidate.name}</h1>
              <p className="text-gray-500 text-sm mb-4" data-testid="candidate-office">
                {candidate.office} · {candidate.district}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed" data-testid="candidate-bio">{candidate.bio}</p>
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="text-base font-semibold text-gray-900 mb-1">Where You Align</h2>
            <p className="text-xs text-gray-400 mb-4">Match scores reflect values alignment, not endorsements.</p>
            {agreements.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-sm font-semibold text-gray-900">You agree ({agreements.length})</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {agreements.map((issueId) => (
                    <div key={issueId} className="rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                      <p className="text-xs text-green-800 leading-relaxed">{issueLabel(issueId, issues)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {disagreements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <p className="text-sm font-semibold text-gray-900">You differ ({disagreements.length})</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {disagreements.map((issueId) => (
                    <div key={issueId} className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                      <p className="text-xs text-red-800 leading-relaxed">{issueLabel(issueId, issues)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {agreements.length === 0 && disagreements.length === 0 && (
              <p className="text-sm text-gray-400">No match data available. Complete the quiz to see how you align.</p>
            )}
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h2 className="text-base font-semibold text-gray-900 mb-4">All Positions</h2>
            <div className="flex flex-col gap-2" data-testid="candidate-positions">
              {Object.entries(candidate.positions).map(([issueId, score]) => {
                const issue = issues.find((i) => i.id === issueId);
                return (
                  <div key={issueId} className="flex items-start gap-2.5 pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                    <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      score === 1 ? 'bg-green-100 text-green-700' : score === -1 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {score === 1 ? '✓' : score === -1 ? '✕' : '—'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#274C77] mb-0.5">{issue?.category ?? issueId}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{issue?.text ?? issueId}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {relevantElections.length > 0 && (
          <motion.div 
            className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h2 className="text-sm font-semibold text-[#274C77] mb-3">Election Context</h2>
            {relevantElections.map((el) => (
              <div key={el.id} className="mb-3 last:mb-0">
                <p className="text-sm text-gray-900 font-medium">{el.name} · {el.date}</p>
                <p className="text-xs text-gray-500 mt-0.5">{el.county} County, {el.state} · {el.offices.join(', ')}</p>
              </div>
            ))}
            {location && (
              <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                Showing elections for {location.city}, {location.state} ({location.county} County)
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
