"use client";
import { useEffect, useState } from "react";
import { useLang } from "../../lib/lang-context";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, tData } = useLang();

  useEffect(() => {
    fetch("/api/data?view=analytics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-xl" />
        ))}
      </div>
    );

  const byType = data?.by_type || {};
  const bySector = data?.by_sector || {};
  const bySeverity = data?.by_severity || { critical: 0, high: 0, medium: 0, low: 0 };
  const maxType = Math.max(...Object.values(byType).map(Number), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("analytics.title")}</h1>
        <p className="text-zinc-500 text-sm mt-1">{data?.total || 0} {t("analytics.total_analyzed")}</p>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">{t("analytics.by_type")}</h3>
        <div className="space-y-3">
          {Object.entries(byType).sort(([, a]: [string, any], [, b]: [string, any]) => b - a).map(([type, count]: [string, any]) => (
            <div key={type} className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 w-28 truncate">{tData(type.replace(/_/g, " "))}</span>
              <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                  style={{ width: `${(count / maxType) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-zinc-500 w-8 text-right">{count}</span>
            </div>
          ))}
          {Object.keys(byType).length === 0 && (
            <p className="text-zinc-600 text-sm">{t("analytics.no_data")}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">{t("analytics.by_sector")}</h3>
          <div className="space-y-2">
            {Object.entries(bySector).sort(([, a]: [string, any], [, b]: [string, any]) => b - a).map(([sector, count]: [string, any]) => (
              <div key={sector} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-zinc-300">{tData(sector)}</span>
                <span className="text-sm font-mono text-zinc-500">{count}</span>
              </div>
            ))}
            {Object.keys(bySector).length === 0 && (
              <p className="text-zinc-600 text-sm">{t("common.no_data")}</p>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">{t("analytics.by_severity")}</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(bySeverity).map(([sev, count]: [string, any]) => {
              const colors: Record<string, string> = {
                critical: "text-rose-400 bg-rose-400/10",
                high: "text-amber-400 bg-amber-400/10",
                medium: "text-violet-400 bg-violet-400/10",
                low: "text-emerald-400 bg-emerald-400/10",
              };
              return (
                <div key={sev} className={`rounded-xl p-4 text-center ${colors[sev] || "text-zinc-400 bg-white/5"}`}>
                  <p className="text-xs font-mono uppercase opacity-70">{t(`severity.${sev}`) || tData(sev)}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
