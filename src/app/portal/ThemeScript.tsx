'use client'

import { useEffect } from 'react'

export function ThemeScript() {
  useEffect(() => {
    // Set theme on html element for CSS variables
    document.documentElement.setAttribute('data-theme', 'space')
    document.documentElement.classList.add('dark')

    // Force background color
    document.body.style.backgroundColor = '#050714'
    document.body.style.color = '#e5e7eb'

    return () => {
      // Cleanup when leaving portal
      document.documentElement.removeAttribute('data-theme')
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
    }
  }, [])

  return null
}
