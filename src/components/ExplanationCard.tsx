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
      className="card p-5"
    >
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-8 rounded-[var(--radius-sm)] bg-surface-hover" />
          <div className="h-4 w-2/5 rounded-[var(--radius-sm)] bg-surface-hover" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded-[var(--radius-sm)] bg-surface-hover" />
            <div className="h-3 w-5/6 rounded-[var(--radius-sm)] bg-surface-hover" />
            <div className="h-3 w-2/3 rounded-[var(--radius-sm)] bg-surface-hover" />
          </div>
        </div>
      ) : (
        <>
          <span className="text-xl" aria-hidden="true">{icon}</span>
          <h3 className="mt-2 text-sm font-medium text-text-primary">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{body}</p>
        </>
      )}
    </div>
  );
}
