interface ExplanationCardProps {
  icon: string;
  title: string;
  body: string;
  loading: boolean;
}

export default function ExplanationCard({ icon, title, body, loading }: ExplanationCardProps) {
  return (
    <div
      data-testid="explanation-card"
      className="rounded-2xl bg-white/10 backdrop-blur-lg border border-glass-border p-5"
    >
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-10 rounded bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-5/6 rounded bg-white/10" />
            <div className="h-3 w-2/3 rounded bg-white/10" />
          </div>
        </div>
      ) : (
        <>
          <span className="text-2xl" aria-hidden="true">{icon}</span>
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{body}</p>
        </>
      )}
    </div>
  );
}
