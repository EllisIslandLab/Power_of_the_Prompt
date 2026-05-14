import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DarkModeProvider>
      {/* Connection lines background - subtle animation in dark mode */}
      <AnimatedBackground />

      <Providers>
        {/* No Navigation component here - portal has its own navigation */}
        {children}
        <Analytics />
      </Providers>
    </DarkModeProvider>
  );
}