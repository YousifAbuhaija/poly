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
      <div className="min-h-dvh flex items-center justify-center px-6">
        <p className="text-text-secondary text-sm">Please complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-6 pt-12 pb-24">
      <div className="mx-auto max-w-sm">
        <p className="mb-1 text-center text-xs font-medium tracking-widest uppercase text-text-muted">
          Step 3 of 3
        </p>
        <h1 className="text-xl font-semibold text-text-primary text-center">Your Matches</h1>
        <p className="mt-1 text-center text-sm text-text-secondary">
          {location.city}, {location.state} · {location.county} County
        </p>

        {/* Disclaimer */}
        <p className="mt-4 text-xs text-text-muted leading-relaxed text-center">
          Match scores reflect issue agreement and are not endorsements.
        </p>

        {/* Edge case: all issues skipped */}
        {allSkipped && (
          <div className="mt-6 card px-4 py-4 text-center">
            <p className="text-sm text-skip">
              You skipped all issues, so match scores are 0%. Go back and share your takes for
              better results.
            </p>
          </div>
        )}

        {/* Edge case: no candidates found */}
        {results.length === 0 && !allSkipped && (
          <div className="mt-6 card px-4 py-4 text-center">
            <p className="text-sm text-text-secondary">
              No candidates found for your area.
            </p>
          </div>
        )}

        {/* Candidate list */}
        <div className="mt-6 flex flex-col gap-3" role="list" aria-label="Candidate matches">
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
