import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DarkModeProvider>
      <AnimatedBackground />

      <Providers>
        <AdminAuthGuard>
          <AdminNavigation />
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </AdminAuthGuard>
        <Analytics />
      </Providers>

      <DarkModeToggle />
    </DarkModeProvider>
  );
}