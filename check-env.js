// Check environment variables at build time
console.log('🔍 ENVIRONMENT VARIABLE CHECK:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('NEXT_PUBLIC_JITSI_APP_ID exists:', !!process.env.NEXT_PUBLIC_JITSI_APP_ID)

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
} else {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing!')
}

if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('Supabase Key preview:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...')
} else {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!')
}

if (process.env.NEXT_PUBLIC_JITSI_APP_ID) {
  console.log('Jitsi App ID:', process.env.NEXT_PUBLIC_JITSI_APP_ID)
} else {
  console.error('❌ NEXT_PUBLIC_JITSI_APP_ID is missing!')
}