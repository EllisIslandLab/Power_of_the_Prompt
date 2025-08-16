import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/sections/navigation";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
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
  title: "Web Launch Academy - Build Websites You Own",
  description: "Learn to create professional websites with AI assistance - no monthly fees, complete ownership. Build your digital presence with Web Launch Academy.",
  metadataBase: new URL('https://weblaunchacademy.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Web Launch Academy - Build Websites You Own",
    description: "Learn to create professional websites with AI assistance - no monthly fees, complete ownership. Build your digital presence with Web Launch Academy.",
    url: 'https://weblaunchacademy.com',
    siteName: 'Web Launch Academy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Web Launch Academy - Build Websites You Own",
    description: "Learn to create professional websites with AI assistance - no monthly fees, complete ownership. Build your digital presence with Web Launch Academy.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
                "streetAddress": "123 Business St, Suite 100",
                "addressLocality": "Austin",
                "addressRegion": "TX",
                "postalCode": "78701",
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
          {/* ANIMATED BACKGROUND - Only shows in dark mode now */}
          <AnimatedBackground />
          
          <Providers>
            <Navigation />
            {children}
            <Analytics />
          </Providers>
          
          {/* Dark mode toggle in bottom right */}
          <DarkModeToggle />
        </DarkModeProvider>
      </body>
    </html>
  );
}
