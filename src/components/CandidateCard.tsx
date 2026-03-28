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
      className="w-full bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-[#6096BA] transition group"
      aria-label={`View details for ${candidate.name}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-[#274C77] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          {candidate.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#274C77] transition">{candidate.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{candidate.office} · {candidate.district}</p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-xl font-bold" style={{ color: matchColor }}>{matchPercentage}%</span>
          <span className="text-xs text-gray-400">match</span>
        </div>
      </div>
      <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${matchPercentage}%`, backgroundColor: matchColor }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {agreements.slice(0, 3).map((id) => (
          <span key={id} className="rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs text-green-700 font-medium">
            ✓ {issueLabel(id, issues)}
          </span>
        ))}
        {disagreements.slice(0, 2).map((id) => (
          <span key={id} className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs text-red-600 font-medium">
            ✕ {issueLabel(id, issues)}
          </span>
        ))}
      </div>
    </button>
  );
}
