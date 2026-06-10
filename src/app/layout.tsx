import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpaceNavigation } from "@/components/sections/space-navigation";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import dynamic from "next/dynamic";
import { DarkModeProvider } from "@/contexts/DarkModeContext";

// Lazy load non-critical components
const AnimatedBackground = dynamic(() => import("@/components/effects/AnimatedBackground").then(mod => ({ default: mod.AnimatedBackground })));
// Environment variables updated - triggering redeploy

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload primary font
});

export const metadata: Metadata = {
  title: "Own Your Code, Take Back Control - Web Launch Academy",
  description: "Learn to create professional websites with AI assistance - no monthly fees, complete ownership. Build your digital presence with Web Launch Academy.",
  metadataBase: new URL('https://weblaunchacademy.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Own Your Code, Take Back Control - Web Launch Academy",
    description: "Learn to create professional websites with AI assistance - no monthly fees, complete ownership. Build your digital presence with Web Launch Academy.",
    url: 'https://weblaunchacademy.com',
    siteName: 'Web Launch Academy',
    type: 'website',
    images: [
      {
        url: 'https://weblaunchacademy.com/og-image-space.jpg',
        width: 1200,
        height: 630,
        alt: 'Web Launch Academy - Launch Your Digital Presence Into The Future',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Own Your Code, Take Back Control - Web Launch Academy",
    description: "Learn to create professional websites with AI assistance - no monthly fees, complete ownership. Build your digital presence with Web Launch Academy.",
    images: ['https://weblaunchacademy.com/og-image-space.jpg'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://qaaautcjhztvjhizklxr.supabase.co" />
        <link rel="dns-prefetch" href="https://yourwebsitescore.com" />

        {/* Material Symbols Icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Web Launch Academy",
              "description": "Learn to create professional websites with AI assistance - no monthly fees, complete ownership.",
              "url": "https://weblaunchacademy.com",
              "telephone": "+1-555-123-4567",
              "email": "hello@poweroftheprompt.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Painesville",
                "addressRegion": "OH",
                "postalCode": "44077",
                "addressCountry": "US"
              },
              "sameAs": [],
              "offers": {
                "@type": "EducationalOccupationalProgram",
                "name": "Web Development Training",
                "description": "4-week comprehensive web development course"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DarkModeProvider>
          <Providers>
            <SpaceNavigation />
            {children}
            <Analytics />
            <SpeedInsights />
          </Providers>
        </DarkModeProvider>

      </body>
    </html>
  );
}
