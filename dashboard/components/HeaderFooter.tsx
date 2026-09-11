"use client";
import { useLang } from "../lib/lang-context";

export function HeaderFooter({ children }: { children: React.ReactNode }) {
  const { t } = useLang();

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-glow">
              <span className="text-sm font-bold text-black">S</span>
            </div>
            <div>
              <h1 className="text-display text-base font-semibold tracking-tight">{t("header.title")}</h1>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{t("header.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono">{t("header.live")}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="text-[10px] text-zinc-500 font-mono">Nokia NaC</span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            </div>
            <LangToggleInline />
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
                <p className="text-xs text-zinc-400">{t("header.title")}</p>
                <p className="text-[10px] text-zinc-600">{t("footer.hackathon")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-mono">
              <span>{t("footer.theme")}</span>
              <span>&middot;</span>
              <span>{t("footer.apis")}</span>
              <span>&middot;</span>
              <span>{t("footer.license")}</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function LangToggleInline() {
  const { locale, setLocale } = useLang();
  return (
    <button
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-300 group"
      title={locale === "en" ? "\u062a\u0628\u062f\u064a\u0644 \u0625\u0644\u0649 \u0627\u0644\u0639\u0631\u0628\u064a\u0629" : "Switch to English"}
    >
      <span className="text-xs font-mono text-zinc-500 group-hover:text-amber-400 transition-colors">
        {locale === "en" ? "AR" : "EN"}
      </span>
      <svg className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    </button>
  );
}
