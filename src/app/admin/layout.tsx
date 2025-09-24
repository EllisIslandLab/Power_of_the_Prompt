import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DarkModeProvider>
      <AnimatedBackground />

      <Providers>
        <AdminNavigation />
        <main className="min-h-screen bg-background">
          {children}
        </main>
        <Analytics />
      </Providers>

      <DarkModeToggle />
    </DarkModeProvider>
  );
}