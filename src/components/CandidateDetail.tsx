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
      <div className="min-h-dvh flex items-center justify-center px-4 bg-gradient-to-br from-deep via-charcoal to-deep">
        <div className="text-center">
          <p className="text-slate">Candidate not found.</p>
          <button
            type="button"
            onClick={() => navigate('/results')}
            className="mt-4 rounded-full bg-slate px-6 py-2 text-sm font-medium text-deep min-h-[44px] min-w-[44px] hover:bg-opacity-90 transition"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-deep via-charcoal to-deep px-4 py-6">
      <div className="mx-auto max-w-sm">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => navigate('/results')}
          className="flex items-center gap-1 text-sm text-slate hover:text-cream transition min-h-[44px] min-w-[44px]"
          aria-label="Back to results"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Results
        </button>

        {/* Header: name, office, district, match ring */}
        <div className="mt-4 flex items-start gap-4">
          <div className="relative flex-shrink-0" aria-hidden="true">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(172,189,186,0.2)" strokeWidth="4" />
              <circle
                cx="36" cy="36" r="30" fill="none"
                stroke="#ACBDBA" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 30}
                strokeDashoffset={2 * Math.PI * 30 - (matchPercentage / 100) * 2 * Math.PI * 30}
                transform="rotate(-90 36 36)"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-cream">
              {matchPercentage}%
            </span>
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl font-bold text-cream" data-testid="candidate-name">{candidate.name}</h1>
            <p className="text-sm text-slate" data-testid="candidate-office">{candidate.office} · {candidate.district}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-5 rounded-xl bg-glass-bg border border-glass-border p-4 backdrop-blur-lg">
          <h2 className="text-sm font-semibold text-cream mb-1">About</h2>
          <p className="text-sm text-slate leading-relaxed" data-testid="candidate-bio">{candidate.bio}</p>
        </div>

        {/* Location relevance / election context */}
        {relevantElections.length > 0 && (
          <div className="mt-4 rounded-xl bg-glass-bg border border-glass-border p-4 backdrop-blur-lg">
            <h2 className="text-sm font-semibold text-cream mb-2">Election Context</h2>
            {relevantElections.map((el) => (
              <div key={el.id} className="mb-2 last:mb-0">
                <p className="text-sm text-slate">
                  <span className="text-cream font-medium">{el.name}</span> · {el.date}
                </p>
                <p className="text-xs text-teal">
                  {el.county} County, {el.state} · {el.offices.join(', ')}
                </p>
              </div>
            ))}
            {location && (
              <p className="mt-2 text-xs text-teal">
                Showing elections for: {location.city}, {location.state} ({location.county} County)
              </p>
            )}
          </div>
        )}

        {/* Match explanation with Pros/Cons */}
        <div className="mt-4 rounded-xl bg-glass-bg border border-glass-border p-4 backdrop-blur-lg">
          <h2 className="text-sm font-semibold text-cream mb-2">Why This Match?</h2>
          <p className="text-xs text-teal mb-3">
            Based on your responses, here's how you align with {candidate.name}.
          </p>

          {/* Pros */}
          {agreements.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-agree mb-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Pros - You agree on ({agreements.length})
              </p>
              <div className="flex flex-col gap-1.5">
                {agreements.map((issueId) => (
                  <span key={issueId} className="rounded-lg bg-agree/10 px-3 py-1.5 text-xs text-agree">
                    {issueLabel(issueId, issues)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cons */}
          {disagreements.length > 0 && (
            <div>
              <p className="text-xs font-medium text-disagree mb-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Cons - You differ on ({disagreements.length})
              </p>
              <div className="flex flex-col gap-1.5">
                {disagreements.map((issueId) => (
                  <span key={issueId} className="rounded-lg bg-disagree/10 px-3 py-1.5 text-xs text-disagree">
                    {issueLabel(issueId, issues)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {agreements.length === 0 && disagreements.length === 0 && (
            <p className="text-xs text-teal">
              No match data available. Complete the Vibe Check to see how you align.
            </p>
          )}
        </div>

        {/* All issue positions */}
        <div className="mt-4 rounded-xl bg-glass-bg border border-glass-border p-4 backdrop-blur-lg">
          <h2 className="text-sm font-semibold text-cream mb-2">All Positions</h2>
          <div className="flex flex-col gap-2" data-testid="candidate-positions">
            {Object.entries(candidate.positions).map(([issueId, score]) => (
              <div key={issueId} className="flex items-start justify-between gap-2">
                <p className="text-xs text-slate flex-1 leading-relaxed">
                  {issueLabel(issueId, issues)}
                </p>
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    score === 1
                      ? 'bg-agree/15 text-agree'
                      : score === -1
                        ? 'bg-disagree/15 text-disagree'
                        : 'bg-glass-bg text-teal'
                  }`}
                >
                  {scoreLabel(score)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
