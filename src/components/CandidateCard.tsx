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
    matchPercentage >= 70 ? '#274C77' : matchPercentage >= 40 ? '#6B8E7F' : '#6096BA';

  return (
    <button
      type="button"
      onClick={() => onTap(candidate.id)}
      className="w-full bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-sm rounded-xl border border-white/30 p-5 text-left hover:shadow-md hover:border-[#6096BA]/50 transition group"
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
        <div className="flex-shrink-0">
          <span className="text-xl font-bold drop-shadow-md" style={{ color: matchColor }}>{matchPercentage}%</span>
        </div>
      </div>
      <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${matchPercentage}%`, backgroundColor: matchColor }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {agreements.slice(0, 3).map((id) => (
          <span key={id} className="rounded-full bg-[#6096BA]/20 border border-[#6096BA]/50 px-2.5 py-0.5 text-xs text-[#274C77] font-semibold">
            ✓ {issueLabel(id, issues)}
          </span>
        ))}
        {disagreements.slice(0, 2).map((id) => (
          <span key={id} className="rounded-full bg-[#E7ECEF]/30 border border-[#8B8C89]/30 px-2.5 py-0.5 text-xs text-[#274C77]/80 font-medium">
            ✕ {issueLabel(id, issues)}
          </span>
        ))}
      </div>
    </button>
  );
}
