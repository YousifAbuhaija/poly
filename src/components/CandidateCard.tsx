import type { MatchResult, IssueStatement } from '../types';

interface CandidateCardProps {
  result: MatchResult;
  issues: IssueStatement[];
  onTap: (candidateId: string) => void;
}

function issueLabel(issueId: string, issues: IssueStatement[]): string {
  const issue = issues.find((i) => i.id === issueId);
  return issue?.category ?? issueId;
}

export default function CandidateCard({ result, issues, onTap }: CandidateCardProps) {
  const { candidate, matchPercentage, agreements, disagreements } = result;

  // SVG progress ring values
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (matchPercentage / 100) * circumference;

  return (
    <button
      type="button"
      onClick={() => onTap(candidate.id)}
      className="w-full rounded-2xl bg-white/10 p-5 backdrop-blur-lg border border-glass-border text-left transition hover:bg-glass-hover active:scale-[0.98] min-h-[44px]"
      aria-label={`View details for ${candidate.name}`}
    >
      <div className="flex items-start gap-4">
        {/* Match ring */}
        <div className="relative flex-shrink-0" aria-hidden="true">
          <svg width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="34" cy="34" r={radius} fill="none"
              stroke="url(#matchGrad)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              transform="rotate(-90 34 34)"
            />
            <defs>
              <linearGradient id="matchGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7b2ff7" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
            {matchPercentage}%
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">{candidate.name}</h3>
          <p className="text-sm text-text-secondary">{candidate.office} · {candidate.district}</p>
        </div>
      </div>

      {/* Agreements */}
      {agreements.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-agree mb-1">You agree on</p>
          <div className="flex flex-wrap gap-1.5">
            {agreements.map((id) => (
              <span key={id} className="rounded-full bg-agree/15 px-2.5 py-0.5 text-xs text-agree">
                {issueLabel(id, issues)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Disagreements */}
      {disagreements.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-disagree mb-1">You differ on</p>
          <div className="flex flex-wrap gap-1.5">
            {disagreements.map((id) => (
              <span key={id} className="rounded-full bg-disagree/15 px-2.5 py-0.5 text-xs text-disagree">
                {issueLabel(id, issues)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Disclaimer */}
      {candidate.positionsInferred && (
        <div className="mt-3 flex items-start gap-1.5 text-text-secondary" data-testid="ai-disclaimer">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 0l2 5h5l-4 3.5 1.5 5L8 10.5 3.5 13.5 5 8.5 1 5h5z" />
          </svg>
          <p className="text-[10px] leading-tight">
            Issue positions were inferred by AI from public information and may not reflect this candidate's actual stated positions.
          </p>
        </div>
      )}

    </button>
  );
}
