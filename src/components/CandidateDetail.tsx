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
      <div className="min-h-dvh flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="text-center">
          <p className="text-text-secondary">Candidate not found.</p>
          <button
            type="button"
            onClick={() => navigate('/results')}
            className="mt-4 rounded-full bg-poly-accent px-6 py-2 text-sm font-medium text-white min-h-[44px] min-w-[44px]"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-6">
      <div className="mx-auto max-w-sm">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => navigate('/results')}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-white transition min-h-[44px] min-w-[44px]"
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
              <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              <circle
                cx="36" cy="36" r="30" fill="none"
                stroke="url(#detailMatchGrad)" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 30}
                strokeDashoffset={2 * Math.PI * 30 - (matchPercentage / 100) * 2 * Math.PI * 30}
                transform="rotate(-90 36 36)"
              />
              <defs>
                <linearGradient id="detailMatchGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7b2ff7" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-white">
              {matchPercentage}%
            </span>
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl font-bold text-white" data-testid="candidate-name">{candidate.name}</h1>
            <p className="text-sm text-text-secondary" data-testid="candidate-office">{candidate.office} · {candidate.district}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-5 rounded-xl bg-white/10 border border-glass-border p-4 backdrop-blur-lg">
          <h2 className="text-sm font-semibold text-white mb-1">About</h2>
          <p className="text-sm text-text-secondary leading-relaxed" data-testid="candidate-bio">{candidate.bio}</p>
        </div>

        {/* Location relevance / election context */}
        {relevantElections.length > 0 && (
          <div className="mt-4 rounded-xl bg-white/10 border border-glass-border p-4 backdrop-blur-lg">
            <h2 className="text-sm font-semibold text-white mb-2">Election Context</h2>
            {relevantElections.map((el) => (
              <div key={el.id} className="mb-2 last:mb-0">
                <p className="text-sm text-text-secondary">
                  <span className="text-white font-medium">{el.name}</span> · {el.date}
                </p>
                <p className="text-xs text-text-muted">
                  {el.county} County, {el.state} · {el.offices.join(', ')}
                </p>
              </div>
            ))}
            {location && (
              <p className="mt-2 text-xs text-text-muted">
                Showing elections for: {location.city}, {location.state} ({location.county} County)
              </p>
            )}
          </div>
        )}

        {/* Match explanation */}
        <div className="mt-4 rounded-xl bg-white/10 border border-glass-border p-4 backdrop-blur-lg">
          <h2 className="text-sm font-semibold text-white mb-2">Match Breakdown</h2>
          <p className="text-xs text-text-muted mb-3">
            Match scores reflect values alignment based on your issue responses. They are not endorsements.
          </p>

          {agreements.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-agree mb-1">You agree on ({agreements.length})</p>
              <div className="flex flex-col gap-1.5">
                {agreements.map((issueId) => (
                  <span key={issueId} className="rounded-lg bg-agree/10 px-3 py-1.5 text-xs text-agree">
                    {issueLabel(issueId, issues)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {disagreements.length > 0 && (
            <div>
              <p className="text-xs font-medium text-disagree mb-1">You differ on ({disagreements.length})</p>
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
            <p className="text-xs text-text-muted">
              No match data available. Complete the Vibe Check to see how you align.
            </p>
          )}
        </div>

        {/* All issue positions */}
        <div className="mt-4 rounded-xl bg-white/10 border border-glass-border p-4 backdrop-blur-lg">
          <h2 className="text-sm font-semibold text-white mb-2">All Positions</h2>
          <div className="flex flex-col gap-2" data-testid="candidate-positions">
            {Object.entries(candidate.positions).map(([issueId, score]) => (
              <div key={issueId} className="flex items-start justify-between gap-2">
                <p className="text-xs text-text-secondary flex-1 leading-relaxed">
                  {issueLabel(issueId, issues)}
                </p>
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    score === 1
                      ? 'bg-agree/15 text-agree'
                      : score === -1
                        ? 'bg-disagree/15 text-disagree'
                        : 'bg-white/10 text-text-muted'
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
