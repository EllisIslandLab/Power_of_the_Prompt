"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export function SpaceNavigation() {
  const pathname = usePathname()
  const isInPortal = pathname?.startsWith('/portal')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const sections = [
      { id: "hero", offset: 0 },
      { id: "showcase", offset: 0 },
      { id: "testimonials", offset: 0 }
    ]

    const updateActiveSection = () => {
      const scrollTop = window.scrollY + 150 // Offset for header height

      const sectionElements = sections.map(section => ({
        ...section,
        element: document.getElementById(section.id),
        offset: document.getElementById(section.id)?.offsetTop || 0
      }))

      const currentSection = sectionElements.find((section, index) => {
        if (!section.element) return false
        const nextSection = sectionElements[index + 1]
        const sectionTop = section.offset
        const sectionBottom = nextSection ? nextSection.offset : document.documentElement.scrollHeight

        return scrollTop >= sectionTop && scrollTop < sectionBottom
      })

      if (currentSection) {
        setActiveSection(currentSection.id)
      }
    }

    window.addEventListener("scroll", updateActiveSection)
    updateActiveSection() // Initial call

    return () => window.removeEventListener("scroll", updateActiveSection)
  }, [])

  // Hide navigation in portal pages
  if (isInPortal) {
    return null
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0d112a]/80 backdrop-blur-md border-b border-white/10">
      <div className="relative flex justify-between items-center px-5 md:px-16 py-4 max-w-[1440px] mx-auto">
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

        {/* Desktop Navigation - Centered on viewport */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link
            href="/#hero"
            className={`text-xs font-bold uppercase tracking-[0.1em] pb-1 transition-all ${
              activeSection === "hero"
                ? "text-white border-b-2 border-white"
                : "text-[#c4c7c8] hover:text-white border-b-2 border-transparent"
            }`}
          >
            Home
          </Link>
          <Link
            href="/#showcase"
            className={`text-xs font-bold uppercase tracking-[0.1em] pb-1 transition-all ${
              activeSection === "showcase"
                ? "text-white border-b-2 border-white"
                : "text-[#c4c7c8] hover:text-white border-b-2 border-transparent"
            }`}
          >
            Showcase
          </Link>
          <Link
            href="/#testimonials"
            className={`text-xs font-bold uppercase tracking-[0.1em] pb-1 transition-all ${
              activeSection === "testimonials"
                ? "text-white border-b-2 border-white"
                : "text-[#c4c7c8] hover:text-white border-b-2 border-transparent"
            }`}
          >
            Reviews
          </Link>
        </nav>

        {/* Sign In Button - Desktop */}
        <Link href="/signin" className="hidden md:block bg-[#e8ea23] text-[#1c1d00] px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider gold-glow hover:brightness-110 active:scale-95 transition-all">
          MISSION CONTROL
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white text-2xl w-8 h-8 flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
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
              className="bg-[#e8ea23] text-[#1c1d00] px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider gold-glow hover:brightness-110 active:scale-95 transition-all mt-2 inline-block text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              MISSION CONTROL
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
