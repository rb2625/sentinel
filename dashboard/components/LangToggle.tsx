"use client";
import { useLang } from "../lib/lang-context";

export function LangToggle() {
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
