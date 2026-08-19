export function Section({ kicker, title, children, className="", action }: {
  kicker?: string; title: string; children: React.ReactNode; className?: string; action?: React.ReactNode;
}) {
  return (
    <section className={`animate-fade-up ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          {kicker && <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-1 block font-mono">{kicker}</span>}
          <h2 className="text-display text-lg font-semibold text-sand-100">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
