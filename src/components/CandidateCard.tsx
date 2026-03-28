import { motion } from 'framer-motion';
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function CandidateCard({ result, issues, onTap }: CandidateCardProps) {
  const { candidate, matchPercentage, agreements, disagreements } = result;

  // SVG progress ring values
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (matchPercentage / 100) * circumference;

  return (
    <button
      type="button"
      onClick={() => onTap(candidate.id)}
      className="w-full rounded-2xl border border-glass-border bg-glass-bg p-5 text-left backdrop-blur-sm transition hover:border-lavender/30 hover:bg-glass-hover active:scale-[0.98] min-h-[44px]"
      aria-label={`View details for ${candidate.name}`}
    >
      <div className="flex items-center gap-4">
        {/* Photo placeholder or real photo */}
        {candidate.photoUrl ? (
          <img 
            src={candidate.photoUrl} 
            alt={candidate.name}
            className="flex-shrink-0 w-16 h-16 rounded-full object-cover border border-teal/30"
          />
        ) : (
          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-teal/20 border border-teal/30 text-lg font-medium text-cream">
            {getInitials(candidate.name)}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-cream truncate">{candidate.name}</h3>
          <p className="text-sm text-slate">{candidate.office} · {candidate.district}</p>
        </div>

        {/* Animated match ring */}
        <div className="relative flex-shrink-0" aria-hidden="true">
          <svg width="76" height="76" viewBox="0 0 76 76">
            <circle cx="38" cy="38" r={radius} fill="none" stroke="rgba(172,176,189,0.15)" strokeWidth="4" />
            <motion.circle
              cx="38" cy="38" r={radius} fill="none"
              stroke="#416165" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              transform="rotate(-90 38 38)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            />
          </svg>
          <motion.span 
            className="absolute inset-0 flex items-center justify-center text-base font-medium text-cream"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {matchPercentage}%
          </motion.span>
        </div>
      </div>

      {/* Agreements */}
      {agreements.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-agree mb-1.5">You agree on</p>
          <div className="flex flex-wrap gap-1.5">
            {agreements.map((id) => (
              <span key={id} className="rounded-full border border-agree/20 bg-agree/10 px-2.5 py-0.5 text-xs text-agree">
                {issueLabel(id, issues)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Disagreements */}
      {disagreements.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-disagree mb-1.5">You differ on</p>
          <div className="flex flex-wrap gap-1.5">
            {disagreements.map((id) => (
              <span key={id} className="rounded-full border border-disagree/20 bg-disagree/10 px-2.5 py-0.5 text-xs text-disagree">
                {issueLabel(id, issues)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-4 text-[10px] leading-tight text-teal">
        Match scores reflect issue agreement and are not endorsements.
      </p>
    </button>
  );
}
