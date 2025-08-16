"use client"

import { useEffect, useState } from "react"

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState("")

  const sections = [
    { id: "new-hero", label: "Home", offset: 0 },
    { id: "site-samples", label: "Samples", offset: 0 },
    { id: "unique-approach", label: "Approach", offset: 0 },
    { id: "build-with-you", label: "Learn", offset: 0 },
    { id: "build-4-you", label: "Build", offset: 0 },
    { id: "site-tlc", label: "Maintenance", offset: 0 },
    { id: "test-audit", label: "Audit", offset: 0 }
  ]

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setScrollProgress(scrollPercent)

      // Find active section
      const sectionElements = sections.map(section => ({
        ...section,
        element: document.getElementById(section.id),
        offset: document.getElementById(section.id)?.offsetTop || 0
      }))

      const currentSection = sectionElements.find((section, index) => {
        if (!section.element) return false
        const nextSection = sectionElements[index + 1]
        const sectionTop = section.offset - 100
        const sectionBottom = nextSection ? nextSection.offset - 100 : document.documentElement.scrollHeight

        return scrollTop >= sectionTop && scrollTop < sectionBottom
      })

      if (currentSection) {
        setActiveSection(currentSection.id)
      }
    }

    window.addEventListener("scroll", updateScrollProgress)
    updateScrollProgress() // Initial call

    return () => window.removeEventListener("scroll", updateScrollProgress)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted/20 z-50">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Section Navigation */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className="bg-background/80 backdrop-blur border border-border rounded-full p-2 shadow-lg">
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`group relative w-3 h-3 rounded-full transition-all duration-300 ${
                  activeSection === section.id
                    ? "bg-primary scale-150"
                    : "bg-muted hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to ${section.label} section`}
              >
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                    {section.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}