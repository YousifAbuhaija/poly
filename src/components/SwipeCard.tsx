import { motion } from 'framer-motion';
import type { IssueStatement, IssueScore } from '../types';

interface SwipeCardProps {
  issue: IssueStatement;
  onRespond: (score: IssueScore) => void;
}

export default function SwipeCard({ issue, onRespond }: SwipeCardProps) {
  return (
    <motion.div
      className="w-full max-w-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Card */}
      <div className="rounded-2xl border border-glass-border bg-glass-bg p-8 backdrop-blur-md shadow-2xl max-w-lg">
        <p className="text-xl leading-relaxed text-cream mb-6">{issue.text}</p>

        {/* Multiple choice buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onRespond(1)}
            className="w-full min-h-[56px] rounded-xl border-2 border-agree/30 bg-agree/10 px-6 py-4 text-left backdrop-blur-sm transition-all hover:border-agree/50 hover:bg-agree/20 active:scale-[0.98] active:border-agree/60 active:bg-agree/25"
          >
            <div className="flex items-center gap-3 pointer-events-none">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-agree/50">
                <div className="h-3 w-3 rounded-full bg-agree/0" />
              </div>
              <span className="text-base font-medium text-cream">For</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onRespond(-1)}
            className="w-full min-h-[56px] rounded-xl border-2 border-disagree/30 bg-disagree/10 px-6 py-4 text-left backdrop-blur-sm transition-all hover:border-disagree/50 hover:bg-disagree/20 active:scale-[0.98] active:border-disagree/60 active:bg-disagree/25"
          >
            <div className="flex items-center gap-3 pointer-events-none">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-disagree/50">
                <div className="h-3 w-3 rounded-full bg-disagree/0" />
              </div>
              <span className="text-base font-medium text-cream">Against</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onRespond(0)}
            className="w-full min-h-[56px] rounded-xl border-2 border-slate/30 bg-slate/10 px-6 py-4 text-left backdrop-blur-sm transition-all hover:border-slate/50 hover:bg-slate/20 active:scale-[0.98] active:border-slate/60 active:bg-slate/25"
          >
            <div className="flex items-center gap-3 pointer-events-none">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate/50">
                <div className="h-3 w-3 rounded-full bg-slate/0" />
              </div>
              <span className="text-base font-medium text-cream">No Opinion</span>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
