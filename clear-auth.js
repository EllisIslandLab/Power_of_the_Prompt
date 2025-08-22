// Simple script to clear all authentication data from browser storage
// Run this in browser console if you're having auth issues

console.log('🧹 Clearing all authentication storage...')

// Clear localStorage
const lsKeysToRemove = Object.keys(localStorage).filter(key => 
  key.includes('supabase') || 
  key.includes('auth') || 
  key.includes('sb-')
)

lsKeysToRemove.forEach(key => {
  console.log('Removing localStorage key:', key)
  localStorage.removeItem(key)
})

// Clear sessionStorage
const ssKeysToRemove = Object.keys(sessionStorage).filter(key => 
  key.includes('supabase') || 
  key.includes('auth') || 
  key.includes('sb-')
)

ssKeysToRemove.forEach(key => {
  console.log('Removing sessionStorage key:', key)
  sessionStorage.removeItem(key)
})

// Clear cookies (if any)
document.cookie.split(';').forEach(cookie => {
  const eqPos = cookie.indexOf('=')
  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
  if (name.includes('supabase') || name.includes('auth') || name.includes('sb-')) {
    console.log('Removing cookie:', name)
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  }
})

console.log('✅ Auth storage cleared. Please refresh the page.')