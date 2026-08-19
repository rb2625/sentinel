"use client";
import { useEffect, useRef, useState } from "react";

export function KpiCard({ title, value, subtitle, color="text-amber-400", delay=0 }: {
  title: string; value: number|string; subtitle?: string; color?: string; delay?: number;
}) {
  const [display, setDisplay] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, {threshold:0.1});
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || typeof value !== "number") return;
    let cur = 0; const steps = 60; const inc = value/steps;
    const t = setInterval(() => { cur += inc; if (cur >= value) { setDisplay(value); clearInterval(t); } else setDisplay(Math.floor(cur)); }, 1500/steps);
    return () => clearInterval(t);
  }, [visible, value]);

  return (
    <div ref={ref} className="glass rounded-2xl p-5 animate-fade-up hover:border-accent/20 hover:shadow-glow transition-all duration-300" style={{animationDelay:`${delay}s`}}>
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</span>
      <div className={`text-3xl font-bold ${color} text-display tracking-tight mt-1`}>
        {typeof value === "number" ? display.toLocaleString() : value}
      </div>
      {subtitle && <p className="text-xs text-zinc-500 mt-1.5 font-mono">{subtitle}</p>}
    </div>
  );
}
