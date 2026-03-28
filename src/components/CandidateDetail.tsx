import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      <div className="min-h-dvh flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-text-secondary text-sm">Candidate not found.</p>
          <button
            type="button"
            onClick={() => navigate('/results')}
            className="mt-4 rounded-[var(--radius-md)] bg-poly-primary px-6 py-2.5 text-sm font-medium text-white min-h-[44px]"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-6 pt-6 pb-24">
      <div className="mx-auto max-w-sm">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => navigate('/results')}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition min-h-[44px]"
          aria-label="Back to results"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-poly-primary-subtle">
            <span className="text-xl font-semibold text-poly-accent">{matchPercentage}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-text-primary" data-testid="candidate-name">{candidate.name}</h1>
            <p className="text-sm text-text-muted" data-testid="candidate-office">{candidate.office} · {candidate.district}</p>
          </div>
        </div>

        {/* Bio */}
        <section className="mt-6">
          <h2 className="text-xs font-medium tracking-widest uppercase text-text-muted mb-2">About</h2>
          <p className="text-sm text-text-secondary leading-relaxed" data-testid="candidate-bio">{candidate.bio}</p>
        </section>

        {/* Election context */}
        {relevantElections.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs font-medium tracking-widest uppercase text-text-muted mb-2">Election</h2>
            <div className="card p-4 space-y-2">
              {relevantElections.map((el) => (
                <div key={el.id}>
                  <p className="text-sm text-text-primary font-medium">{el.name}</p>
                  <p className="text-xs text-text-muted">
                    {el.date} · {el.county} County, {el.state}
                  </p>
                </div>
              ))}
              {location && (
                <p className="text-xs text-text-muted pt-1 border-t border-border-subtle">
                  Showing elections for {location.city}, {location.state}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Match breakdown */}
        <section className="mt-6">
          <h2 className="text-xs font-medium tracking-widest uppercase text-text-muted mb-2">Match Breakdown</h2>
          <p className="text-xs text-text-muted mb-3">
            Based on your issue responses. Not an endorsement.
          </p>

          {agreements.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-agree mb-2">Agree ({agreements.length})</p>
              <div className="flex flex-col gap-1.5">
                {agreements.map((issueId) => (
                  <span key={issueId} className="rounded-[var(--radius-sm)] bg-agree-subtle px-3 py-2 text-xs text-agree leading-relaxed">
                    {issueLabel(issueId, issues)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {disagreements.length > 0 && (
            <div>
              <p className="text-xs font-medium text-disagree mb-2">Disagree ({disagreements.length})</p>
              <div className="flex flex-col gap-1.5">
                {disagreements.map((issueId) => (
                  <span key={issueId} className="rounded-[var(--radius-sm)] bg-disagree-subtle px-3 py-2 text-xs text-disagree leading-relaxed">
                    {issueLabel(issueId, issues)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {agreements.length === 0 && disagreements.length === 0 && (
            <p className="text-xs text-text-muted">
              Complete the Vibe Check to see how you align.
            </p>
          )}
        </section>

        {/* All positions */}
        <section className="mt-6">
          <h2 className="text-xs font-medium tracking-widest uppercase text-text-muted mb-2">All Positions</h2>
          <div className="card divide-y divide-border-subtle" data-testid="candidate-positions">
            {Object.entries(candidate.positions).map(([issueId, score]) => (
              <div key={issueId} className="flex items-start justify-between gap-3 px-4 py-3">
                <p className="text-xs text-text-secondary flex-1 leading-relaxed">
                  {issueLabel(issueId, issues)}
                </p>
                <span
                  className={`flex-shrink-0 rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-medium ${
                    score === 1
                      ? 'bg-agree-subtle text-agree'
                      : score === -1
                        ? 'bg-disagree-subtle text-disagree'
                        : 'bg-surface-hover text-text-muted'
                  }`}
                >
                  {scoreLabel(score)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
