import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="min-h-dvh flex items-center justify-center px-4">
        <p className="text-text-secondary">Please complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-8">
      <div className="mx-auto max-w-sm">
        <h1 className="text-2xl font-bold text-white text-center">Your Matches</h1>
        <p className="mt-1 text-center text-sm text-text-secondary">
          {location.city}, {location.state} · {location.county} County
        </p>

        {/* Disclaimer banner */}
        <div className="mt-4 rounded-xl bg-white/5 border border-glass-border px-4 py-3">
          <p className="text-xs text-text-muted leading-relaxed">
            Match scores reflect issue agreement and are not endorsements. They represent
            values alignment based on your responses, not voting recommendations.
          </p>
        </div>

        {/* Edge case: all issues skipped */}
        {allSkipped && (
          <div className="mt-6 rounded-xl bg-skip/10 border border-skip/20 px-4 py-4 text-center">
            <p className="text-sm text-skip">
              You skipped all issues, so match scores are 0%. Go back and share your takes for
              better results.
            </p>
          </div>
        )}

        {/* Edge case: no candidates found */}
        {results.length === 0 && !allSkipped && (
          <div className="mt-6 rounded-xl bg-white/5 border border-glass-border px-4 py-4 text-center">
            <p className="text-sm text-text-secondary">
              No candidates found for your area. We're working on expanding coverage.
            </p>
          </div>
        )}

        {/* Candidate list */}
        <div className="mt-5 flex flex-col gap-4" role="list" aria-label="Candidate matches">
          {results.map((r) => (
            <div key={r.candidate.id} role="listitem">
              <CandidateCard
                result={r}
                issues={issues}
                onTap={(id) => navigate(`/candidate/${id}`)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
