"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function SpaceNavigation() {
  const pathname = usePathname()
  const isInPortal = pathname?.startsWith('/portal')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Hide navigation in portal pages
  if (isInPortal) {
    return null
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0d112a]/80 backdrop-blur-md border-b border-white/10">
      <div className="flex justify-between items-center px-5 md:px-16 py-4 max-w-[1440px] mx-auto">
        {/* Logo/Brand */}
        <Link href="/" className="font-bold text-lg md:text-xl text-white tracking-tight uppercase flex items-center gap-3">
          <Image
            src="/favicon-logo.png"
            alt="Web Launch Academy Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="tracking-tighter">WEB LAUNCH ACADEMY</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#hero" className="text-xs font-bold text-white uppercase tracking-[0.1em] border-b-2 border-white pb-1">
            Home
          </Link>
          <Link href="/#showcase" className="text-xs font-bold text-[#c4c7c8] hover:text-white transition-colors uppercase tracking-[0.1em]">
            Showcase
          </Link>
          <Link href="/#testimonials" className="text-xs font-bold text-[#c4c7c8] hover:text-white transition-colors uppercase tracking-[0.1em]">
            Reviews
          </Link>
          <Link href="/signin" className="text-xs font-bold text-[#c4c7c8] hover:text-white transition-colors uppercase tracking-[0.1em]">
            Mission Control
          </Link>
        </nav>

        {/* Sign In Button - Desktop */}
        <button className="hidden md:block bg-[#e8ea23] text-[#1c1d00] px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider gold-glow hover:brightness-110 active:scale-95 transition-all">
          ENLIST NOW
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden material-symbols-outlined text-white text-[24px]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? 'close' : 'menu'}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d112a]/95 backdrop-blur-md border-t border-white/10">
          <nav className="flex flex-col px-5 py-4 space-y-3">
            <Link
              href="/#hero"
              className="text-xs font-bold text-white uppercase tracking-[0.1em] py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/#showcase"
              className="text-xs font-bold text-[#c4c7c8] hover:text-white transition-colors uppercase tracking-[0.1em] py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Showcase
            </Link>
            <Link
              href="/#testimonials"
              className="text-xs font-bold text-[#c4c7c8] hover:text-white transition-colors uppercase tracking-[0.1em] py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Reviews
            </Link>
            <Link
              href="/signin"
              className="text-xs font-bold text-[#c4c7c8] hover:text-white transition-colors uppercase tracking-[0.1em] py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mission Control
            </Link>
            <button
              className="bg-[#e8ea23] text-[#1c1d00] px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider gold-glow hover:brightness-110 active:scale-95 transition-all mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              ENLIST NOW
            </button>
          </nav>
        </div>
      )}

      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </header>
  )
}
