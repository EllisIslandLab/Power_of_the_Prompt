// Environment configuration with validation and fallbacks
// This handles Vercel environment variable issues properly

interface EnvConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  jitsiAppId: string
  resendApiKey?: string // Optional since it's server-side only
}

function validateEnvVar(name: string, value: string | undefined, expectedLength?: number): string {
  if (!value) {
    console.warn(`❌ ${name} is missing`)
    return ''
  }
  
  if (expectedLength && value.length < expectedLength) {
    console.warn(`⚠️  ${name} appears truncated: ${value.length} chars, expected ~${expectedLength}`)
    return ''
  }
  
  console.log(`✅ ${name} loaded: ${value.substring(0, 20)}... (${value.length} chars)`)
  return value
}

function getEnvConfig(): EnvConfig {
  console.log('🔧 Loading environment configuration...')
  
  // Get environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const envJitsi = process.env.NEXT_PUBLIC_JITSI_APP_ID
  
  // Only check RESEND_API_KEY on server side
  const envResend = typeof window === 'undefined' ? process.env.RESEND_API_KEY : undefined
  
  // Validate each variable
  const validUrl = validateEnvVar('NEXT_PUBLIC_SUPABASE_URL', envUrl, 40)
  const validKey = validateEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', envKey, 200)
  const validJitsi = validateEnvVar('NEXT_PUBLIC_JITSI_APP_ID', envJitsi, 50)
  
  // Only validate Resend on server side
  const validResend = typeof window === 'undefined' 
    ? validateEnvVar('RESEND_API_KEY', envResend, 30) 
    : ''
  
  // Fallback values - these will be used if environment variables are missing
  // NOTE: These should only be used in development/testing scenarios
  const fallbacks = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    jitsiAppId: 'vpaas-magic-cookie-1764593a618848cfa0023ac1a152f3c8',
    resendApiKey: typeof window === 'undefined' ? (process.env.RESEND_API_KEY || '') : undefined
  }
  
  const config: EnvConfig = {
    supabaseUrl: validUrl || fallbacks.supabaseUrl,
    supabaseAnonKey: validKey || fallbacks.supabaseAnonKey,
    jitsiAppId: validJitsi || fallbacks.jitsiAppId,
    resendApiKey: validResend || fallbacks.resendApiKey
  }
  
  // Log final configuration (client-side only checks required vars)
  const clientRequiredMissing = !validUrl || !validKey || !validJitsi
  const serverRequiredMissing = typeof window === 'undefined' && !validResend
  
  if (clientRequiredMissing || serverRequiredMissing) {
    console.warn('⚠️  Some required environment variables are missing')
    console.log('🔧 To fix: Check Vercel environment variables for truncation or encoding issues')
  } else {
    const context = typeof window === 'undefined' ? 'server' : 'client'
    console.log(`✅ All ${context}-side environment variables loaded successfully`)
  }
  
  return config
}

// Export singleton configuration
export const ENV = getEnvConfig()

// Helper functions for common use cases
export function getSupabaseConfig() {
  return {
    url: ENV.supabaseUrl,
    anonKey: ENV.supabaseAnonKey
  }
}

export function getJitsiConfig() {
  return {
    appId: ENV.jitsiAppId
  }
}

export function getResendConfig() {
  // Only available on server side
  if (typeof window !== 'undefined') {
    throw new Error('Resend API key is only available on server side')
  }
  return {
    apiKey: ENV.resendApiKey || process.env.RESEND_API_KEY || ''
  }
}