"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Overview", color: "text-indigo-400", glow: "shadow-glow-indigo" },
  { href: "/validate", label: "Validate", color: "text-violet-400", glow: "shadow-glow-violet" },
  { href: "/incidents", label: "Incidents", color: "text-rose-400", glow: "shadow-glow-rose" },
  { href: "/alerts", label: "Alerts", color: "text-amber-400", glow: "shadow-glow" },
  { href: "/map", label: "Map", color: "text-emerald-400", glow: "shadow-glow-emerald" },
  { href: "/analytics", label: "Analytics", color: "text-cyan-400", glow: "shadow-glow-cyan" },
];

const icons: Record<string, string> = {
  Overview: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  Validate: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  Incidents: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z",
  Alerts: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  Map: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  Analytics: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
};

export function FloatingNav() {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="glass rounded-2xl px-2 py-2 flex items-center gap-1 shadow-2xl border border-white/[0.08]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href}
              className={"relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300 " +
                (isActive ? tab.color + " " + tab.glow + " bg-white/[0.06]" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]")}>
              {isActive && <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-current" />}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icons[tab.label] || ""} />
              </svg>
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
