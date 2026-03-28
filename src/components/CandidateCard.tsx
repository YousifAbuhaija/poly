import type { MatchResult, IssueStatement } from '../types';

interface CandidateCardProps {
  result: MatchResult;
  issues: IssueStatement[];
  onTap: (candidateId: string) => void;
}

function issueLabel(issueId: string, issues: IssueStatement[]): string {
  return issues.find((i) => i.id === issueId)?.category ?? issueId;
}

export default function CandidateCard({ result, issues, onTap }: CandidateCardProps) {
  const { candidate, matchPercentage, agreements, disagreements } = result;

  const matchColor =
    matchPercentage >= 70 ? '#22c55e' : matchPercentage >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <button
      type="button"
      onClick={() => onTap(candidate.id)}
      className="w-full bg-white rounded-xl border border-surface-border p-5 text-left hover:shadow-md hover:border-brand-violet transition group"
      aria-label={`View details for ${candidate.name}`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-brand-lavender flex items-center justify-center text-brand-accent font-bold text-base flex-shrink-0">
          {candidate.name[0]}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-brand-purple transition">{candidate.name}</h3>
          <p className="text-xs text-text-muted mt-0.5">{candidate.office} · {candidate.district}</p>
        </div>

        {/* Match score */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-xl font-bold" style={{ color: matchColor }}>{matchPercentage}%</span>
          <span className="text-xs text-text-muted">match</span>
        </div>
      </div>

      {/* Match bar */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-surface-border overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${matchPercentage}%`, backgroundColor: matchColor }} />
      </div>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {agreements.slice(0, 3).map((id) => (
          <span key={id} className="rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs text-agree font-medium">
            ✓ {issueLabel(id, issues)}
          </span>
        ))}
        {disagreements.slice(0, 2).map((id) => (
          <span key={id} className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs text-disagree font-medium">
            ✕ {issueLabel(id, issues)}
          </span>
        ))}
      </div>
    </button>
  );
}
