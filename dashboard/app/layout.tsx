import type { Metadata } from "next";
import "./globals.css";
import { FloatingNav } from "../components/FloatingNav";
import { LangProvider } from "../lib/lang-context";
import { HeaderFooter } from "../components/HeaderFooter";

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
            <HeaderFooter>{children}</HeaderFooter>
          </div>
          <FloatingNav />
        </LangProvider>
      </body>
    </html>
  );
}
