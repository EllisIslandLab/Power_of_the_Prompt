"use client"

import Link from "next/link"
import Image from "next/image"

export function SpaceFooter() {
  return (
    <footer className="bg-[#080c25] border-t-2 border-white py-16 md:py-20 px-5 md:px-16">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Contact Information */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">Get In Touch</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hello@weblaunchacademy.com" className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] hover:text-white transition-colors">
                  hello@weblaunchacademy.com
                </a>
              </li>
              <li>
                <a href="tel:+14403549904" className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] hover:text-white transition-colors">
                  (440) 354-9904
                </a>
              </li>
              <li>
                <span className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8]">
                  Based in Ohio - Available worldwide
                </span>
              </li>
              <li>
                <div className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8]">
                  <strong className="text-white">Business Hours:</strong><br />
                  Monday - Friday: 9am - 6pm EST
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/#hero" className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/#showcase" className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] hover:text-white transition-colors">Showcase</Link></li>
              <li><Link href="/#testimonials" className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] hover:text-white transition-colors">Reviews</Link></li>
              <li><Link href="/signin" className="text-[13px] font-medium tracking-[0.05em] text-[#e8ea23] hover:text-white transition-colors">Mission Control</Link></li>
            </ul>
          </div>

          {/* Business Info & Badges */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">Web Launch Academy</h3>
            <p className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] leading-relaxed">
              Learn to build professional websites with Fortune 500 technology. Complete ownership, no monthly fees, modern tech stack.
            </p>

            {/* WLA Referral Badge */}
            <div>
              <Link
                href="/affiliate"
                className="inline-block transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,219,87,0.6)]"
                title="Get up to $250 per referral"
              >
                <div className="inline-flex items-center gap-2 rounded-md h-[40px] pl-[44px] pr-3 py-1 relative border-l-[3px]" style={{ backgroundColor: '#0a1840', borderLeftColor: '#ffdb57' }}>
                  <div className="absolute left-[6px] top-1/2 -translate-y-1/2 w-8 h-8">
                    <Image
                      src="/favicon-logo.png"
                      alt="WLA Logo"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-white text-xs font-semibold">Built with</span>
                    <span className="text-xs font-bold" style={{ color: '#ffdb57' }}>Web Launch Academy</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* YourWebsiteScore Badge */}
            <div>
              <a
                href="https://yourwebsitescore.com/certified-websites/weblaunchacademy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80 inline-block"
                title="View our website certification"
              >
                <Image
                  src="https://yourwebsitescore.com/api/badge/weblaunchacademy.com"
                  alt="YourWebsiteScore Certification"
                  height={40}
                  width={150}
                  className="h-[40px] w-auto"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8]">
              © 2026 Web Launch Academy. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/guarantee" className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] hover:text-white transition-colors">
                Guarantee
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </footer>
  )
}
