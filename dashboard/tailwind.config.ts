import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: "#0A0A0B", raised: "#111113" },
        accent: { DEFAULT: "#F59E0B", dim: "#B45309", glow: "rgba(245,158,11,0.15)" },
        sand: { 100: "#FAF9F7", 200: "#E8E4DF", 300: "#C4B8A8" },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
        arabic: ["Noto Kufi Arabic", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(245,158,11,0.15)",
        "glow-indigo": "0 0 20px rgba(99,102,241,0.15)",
        "glow-emerald": "0 0 20px rgba(16,185,129,0.15)",
        "glow-violet": "0 0 20px rgba(139,92,246,0.15)",
        "glow-rose": "0 0 20px rgba(244,63,94,0.15)",
        "glow-cyan": "0 0 20px rgba(6,182,212,0.15)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out both",
        "slide-up": "slideUp 0.5s ease-out both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
