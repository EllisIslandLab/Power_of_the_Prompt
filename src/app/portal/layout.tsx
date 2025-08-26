import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
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
      {/* ANIMATED BACKGROUND - Only shows in dark mode now */}
      <AnimatedBackground />
      
      <Providers>
        {/* No Navigation component here - portal has its own navigation */}
        {children}
        <Analytics />
      </Providers>
      
      {/* Dark mode toggle in bottom right */}
      <DarkModeToggle />
    </DarkModeProvider>
  );
}