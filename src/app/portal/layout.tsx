import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { ThemeScript } from "./ThemeScript";
import { Suspense } from "react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="space"
      className="dark min-h-screen"
      style={{
        backgroundColor: '#050714',
        color: '#e5e7eb'
      }}
    >
      <ThemeScript />
      <DarkModeProvider>
        {/* Space-themed background */}
        <div className="starfield"></div>
        <div className="nebula-glow" style={{ top: '15%', left: '10%' }}></div>
        <div className="nebula-glow" style={{ bottom: '15%', right: '10%' }}></div>

        <Providers>
          {/* No Navigation component here - portal has its own navigation */}
          <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#050714' }} />}>
            <div style={{ minHeight: '100vh', backgroundColor: '#050714' }}>
              {children}
            </div>
          </Suspense>
          <Analytics />
        </Providers>
      </DarkModeProvider>
    </div>
  );
}