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

  return (
    <button
      type="button"
      onClick={() => onTap(candidate.id)}
      className="card w-full p-5 text-left transition hover:bg-surface-hover active:scale-[0.99] min-h-[44px]"
      aria-label={`View details for ${candidate.name}`}
    >
      <div className="flex items-center gap-4">
        {/* Match percentage — clean number, no ring */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-poly-primary-subtle">
          <span className="text-lg font-semibold text-poly-accent">{matchPercentage}%</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-text-primary truncate">{candidate.name}</h3>
          <p className="text-sm text-text-muted">{candidate.office} · {candidate.district}</p>
        </div>

        {/* Chevron */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-text-muted" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {/* Tags */}
      {(agreements.length > 0 || disagreements.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agreements.map((id) => (
            <span key={id} className="rounded-[var(--radius-sm)] bg-agree-subtle px-2 py-0.5 text-xs text-agree">
              {issueLabel(id, issues)}
            </span>
          ))}
          {disagreements.map((id) => (
            <span key={id} className="rounded-[var(--radius-sm)] bg-disagree-subtle px-2 py-0.5 text-xs text-disagree">
              {issueLabel(id, issues)}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
