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

  const { agreements, disagreements } = useMemo(() => {
    if (!candidate) return { agreements: [] as string[], disagreements: [] as string[] };
    const ag: string[] = [];
    const dis: string[] = [];
    for (const [issueId, userScore] of Object.entries(issueProfile)) {
      if (userScore === 0) continue;
      const candScore = candidate.positions[issueId];
      if (candScore === undefined || candScore === 0) continue;
      if (userScore === candScore) {
        ag.push(issueId);
      } else {
        dis.push(issueId);
      }
    }
    return { agreements: ag, disagreements: dis };
  }, [candidate, issueProfile]);

  const answeredCount = Object.values(issueProfile).filter((s) => s !== 0).length;
  const matchPercentage = answeredCount > 0
    ? Math.round((agreements.length / answeredCount) * 100)
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
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition mb-6"
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
          className="bg-white/90 backdrop-blur-sm rounded-2xl border border-surface-border p-8 shadow-xl mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-purple to-brand-violet flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg">
              {candidate.name[0]}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-text-primary mb-1" data-testid="candidate-name">{candidate.name}</h1>
              <p className="text-text-secondary text-sm mb-4" data-testid="candidate-office">
                {candidate.office} · {candidate.district}
              </p>

              {/* Match badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-surface-subtle to-purple-50/50 border border-surface-border shadow-sm">
                <span className="text-2xl font-bold" style={{ color: matchColor }}>{matchPercentage}%</span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-primary">Match Score</span>
                  <span className="text-xs text-text-muted">Based on {answeredCount} {answeredCount === 1 ? 'issue' : 'issues'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6 pt-6 border-t border-surface-border">
            <h2 className="text-sm font-semibold text-text-primary mb-2">About</h2>
            <p className="text-sm text-text-secondary leading-relaxed" data-testid="candidate-bio">{candidate.bio}</p>
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Match breakdown */}
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-surface-border p-6 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-text-primary mb-1">Where You Align</h2>
            <p className="text-xs text-text-muted mb-5">
              Match scores reflect values alignment, not endorsements.
            </p>

            {agreements.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-agree" />
                  <p className="text-sm font-semibold text-text-primary">You agree ({agreements.length})</p>
                </div>
                <div className="flex flex-col gap-2">
                  {agreements.map((issueId) => (
                    <div key={issueId} className="rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 shadow-sm">
                      <p className="text-xs text-green-800 leading-relaxed">{issueLabel(issueId, issues)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {disagreements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-disagree" />
                  <p className="text-sm font-semibold text-text-primary">You differ ({disagreements.length})</p>
                </div>
                <div className="flex flex-col gap-2">
                  {disagreements.map((issueId) => (
                    <div key={issueId} className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 shadow-sm">
                      <p className="text-xs text-red-800 leading-relaxed">{issueLabel(issueId, issues)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {agreements.length === 0 && disagreements.length === 0 && (
              <p className="text-sm text-text-muted">
                No match data available. Complete the quiz to see how you align.
              </p>
            )}
          </motion.div>

          {/* Right: All positions */}
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-surface-border p-6 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold text-text-primary mb-5">All Positions</h2>
            <div className="flex flex-col gap-3" data-testid="candidate-positions">
              {Object.entries(candidate.positions).map(([issueId, score]) => {
                const issue = issues.find((i) => i.id === issueId);
                return (
                  <div key={issueId} className="flex items-start gap-3 pb-3 border-b border-surface-border last:border-0 last:pb-0">
                    <span
                      className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                        score === 1
                          ? 'bg-green-100 text-agree'
                          : score === -1
                            ? 'bg-red-100 text-disagree'
                            : 'bg-surface-muted text-text-muted'
                      }`}
                    >
                      {score === 1 ? '✓' : score === -1 ? '✕' : '—'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-brand-accent mb-0.5">{issue?.category ?? issueId}</p>
                      <p className="text-xs text-text-secondary leading-relaxed">{issue?.text ?? issueId}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Election context */}
        {relevantElections.length > 0 && (
          <motion.div 
            className="mt-6 bg-gradient-to-r from-brand-lavender/80 to-purple-100/80 backdrop-blur-sm rounded-2xl border border-surface-border p-6 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h2 className="text-sm font-semibold text-brand-accent mb-3">Election Context</h2>
            {relevantElections.map((el) => (
              <div key={el.id} className="mb-3 last:mb-0">
                <p className="text-sm text-text-primary font-medium">{el.name} · {el.date}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {el.county} County, {el.state} · {el.offices.join(', ')}
                </p>
              </div>
            ))}
            {location && (
              <p className="mt-3 pt-3 border-t border-surface-border text-xs text-text-muted">
                Showing elections for {location.city}, {location.state} ({location.county} County)
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
