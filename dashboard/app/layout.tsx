import type { Metadata } from "next";
import "./globals.css";
import { FloatingNav } from "../components/FloatingNav";
import { LangProvider } from "../lib/lang-context";
import { LangToggle } from "../components/LangToggle";

export const metadata: Metadata = {
  title: "SENTINEL - Urban Incident Detection",
  description: "Real-time urban incident detection with network intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-display bg-surface text-sand-100 antialiased">
        <LangProvider>
          <div className="bg-gradient-animated" />
          <div className="bg-grid" />
          <div className="relative z-10 min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-glow">
                    <span className="text-sm font-bold text-black">S</span>
                  </div>
                  <div>
                    <h1 className="text-display text-base font-semibold tracking-tight">SENTINEL</h1>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Urban Incident Detection</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono">LIVE</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <span className="text-[10px] text-zinc-500 font-mono">Nokia NaC</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  </div>
                  <LangToggle />
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-24 pt-6">
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.06] py-6 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-black">S</span>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">SENTINEL</p>
                      <p className="text-[10px] text-zinc-600">GSMA MENA Ignite Hackathon 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-mono">
                    <span>Theme 2: Smart Cities</span>
                    <span>&middot;</span>
                    <span>CAMARA APIs</span>
                    <span>&middot;</span>
                    <span>MIT License</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <FloatingNav />
        </LangProvider>
      </body>
    </html>
  );
}
