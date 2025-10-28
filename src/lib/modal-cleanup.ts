/**
 * Utility to clean up modal/dialog artifacts
 * Fixes issues where modals leave behind overlays or body styles
 */

export function cleanupModalArtifacts() {
  // Remove any stray dialog overlays
  const overlays = document.querySelectorAll('[data-radix-portal] [data-state="closed"]')
  overlays.forEach(overlay => {
    overlay.remove()
  })

  // Reset body styles that might be left behind
  document.body.style.removeProperty('pointer-events')
  document.body.style.removeProperty('overflow')

  // Remove any lingering scroll locks
  const dataAttributes = ['data-scroll-locked', 'data-body-scroll-locked']
  dataAttributes.forEach(attr => {
    if (document.body.hasAttribute(attr)) {
      document.body.removeAttribute(attr)
    }
  })
}

/**
 * Use this hook to ensure modal cleanup when component unmounts
 */
export function useModalCleanup() {
  if (typeof window === 'undefined') return

  return () => {
    cleanupModalArtifacts()
  }
}
