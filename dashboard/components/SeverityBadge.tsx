"use client";

const cfg: Record<string, {bg:string; text:string; dot:string}> = {
  critical: {bg:"bg-rose-500/10", text:"text-rose-400", dot:"bg-rose-400"},
  high: {bg:"bg-amber-500/10", text:"text-amber-400", dot:"bg-amber-400"},
  medium: {bg:"bg-violet-500/10", text:"text-violet-400", dot:"bg-violet-400"},
  low: {bg:"bg-emerald-500/10", text:"text-emerald-400", dot:"bg-emerald-400"},
};

export function SeverityBadge({ severity }: { severity: string }) {
  const c = cfg[severity] || cfg.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}
