import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/sections/navigation";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
// Environment variables updated - triggering redeploy

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web Launch Academy - Learn & Build Websites You Actually Own",
  description: "Learn to create professional websites with AI assistance - no monthly fees, complete ownership. Build your digital presence with Web Launch Academy.",
  metadataBase: new URL('https://weblaunchacademy.com'),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ANIMATED BACKGROUND - Easy to remove by deleting these 3 lines */}
        <AnimatedBackground particleCount={40} opacity={0.12} speed={0.8} />
        
        <Providers>
          <Navigation />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
