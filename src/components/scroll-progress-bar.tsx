"use client"

import { useEffect, useState } from "react"

export function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setScrollProgress(scrollPercent)
    }

    window.addEventListener("scroll", updateScrollProgress)
    updateScrollProgress() // Initial call

    return () => window.removeEventListener("scroll", updateScrollProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-50">
      <div
        className="h-full bg-gradient-to-r from-[#b0c6ff] to-[#e8ea23] transition-all duration-300 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}
