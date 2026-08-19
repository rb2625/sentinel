"use client";
import { useEffect, useState } from "react";
import { KpiCard } from "../components/KpiCard";
import { Section } from "../components/Section";
import { SeverityBadge } from "../components/SeverityBadge";

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/data?view=overview").then(r => r.ok ? r.json() : null)
      .then(d => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return (<div className="space-y-6"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div><div className="skeleton h-64 rounded-2xl" /></div>);
  const byType = data?.by_type || {};
  const bySev = data?.by_severity || { critical:0, high:0, medium:0, low:0 };
  return (
    <div className="space-y-8">
      <div className="animate-fade-up"><h1 className="text-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">Command Center</h1><p className="text-zinc-500 text-sm mt-1 font-mono">Real-time urban incident monitoring</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Incidents" value={data?.total_incidents ?? 0} subtitle="since launch" color="text-indigo-400" delay={0} />
        <KpiCard title="Validated" value={data?.validated ?? 0} subtitle="network verified" color="text-emerald-400" delay={0.1} />
        <KpiCard title="Active Alerts" value={data?.active_alerts ?? 0} subtitle="requiring attention" color="text-rose-400" delay={0.2} />
        <KpiCard title="Avg Response" value={data?.avg_response_time ?? "N/A"} subtitle="time to validate" color="text-violet-400" delay={0.3} />
      </div>
      <Section kicker="Distribution" title="By Severity">
        <div className="grid grid-cols-4 gap-3">{Object.entries(bySev).map(([s,c]) => (<div key={s} className="glass rounded-xl p-3 text-center animate-fade-up"><SeverityBadge severity={s} /><div className="text-2xl font-bold text-display mt-2 text-sand-100">{String(c)}</div></div>))}</div>
      </Section>
      <Section kicker="Feed" title="Recent Incidents">
        <div className="space-y-3">{(data?.recent_incidents ?? []).length === 0 ? (<div className="glass rounded-2xl p-8 text-center"><p className="text-zinc-500 text-sm">No incidents yet.</p></div>) : (data?.recent_incidents ?? []).slice(0,5).map((inc:any,i:number) => (<div key={i} className="glass rounded-xl p-4 animate-fade-up"><div className="flex items-center gap-2 mb-1"><span className="text-sm font-semibold text-sand-100 capitalize">{(inc.type||"other").replace(/_/g," ")}</span><SeverityBadge severity={inc.severity || "medium"} /></div><p className="text-sm text-zinc-400 line-clamp-2">{inc.description || ""}</p></div>))}</div>
      </Section>
    </div>
  );
}