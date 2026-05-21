"use client"

import Link from "next/link"
import Image from "next/image"

export function SpaceFooter() {
  return (
    <footer className="bg-[#080c25] border-t-2 border-white py-16 md:py-20 px-5 md:px-16">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16">
          {/* Brand Column */}
          <div className="space-y-5 md:space-y-6">
            <div className="text-xl md:text-2xl font-bold tracking-tighter uppercase text-white">
              WEB LAUNCH ACADEMY
            </div>
            <p className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] leading-relaxed max-w-xs">
              © 2024 CELESTIAL COMMAND SYSTEMS. ALL RIGHTS RESERVED.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <ul className="space-y-3 md:space-y-4">
              <li><Link href="/#hero" className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] hover:text-white transition-colors uppercase">Tactical Overview</Link></li>
              <li><Link href="/privacy" className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] hover:text-white transition-colors uppercase">Privacy Protocol</Link></li>
              <li><Link href="mailto:hello@weblaunchacademy.com" className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8] hover:text-white transition-colors uppercase">Signal Frequency</Link></li>
              <li><Link href="/signin" className="text-[13px] font-medium tracking-[0.05em] text-[#e8ea23] hover:text-white transition-colors uppercase">Command Center</Link></li>
            </ul>
          </div>

          {/* Empty Column for spacing */}
          <div></div>

          {/* Communications Column */}
          <div>
            <ul className="space-y-3 md:space-y-4">
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
                  Painesville, Ohio
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom transmission */}
        <div className="mt-12 md:mt-16 text-center opacity-30">
          <span className="text-[9px] md:text-[10px] tracking-widest text-[#c4c7c8] font-medium">TRANSMISSION ENCRYPTED // END OF LINE</span>
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
