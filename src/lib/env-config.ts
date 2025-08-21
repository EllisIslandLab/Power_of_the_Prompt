// Environment configuration with validation and fallbacks
// This handles Vercel environment variable issues properly

interface EnvConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  jitsiAppId: string
  resendApiKey: string
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
  const envResend = process.env.RESEND_API_KEY
  
  // Validate each variable
  const validUrl = validateEnvVar('NEXT_PUBLIC_SUPABASE_URL', envUrl, 40)
  const validKey = validateEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', envKey, 200)
  const validJitsi = validateEnvVar('NEXT_PUBLIC_JITSI_APP_ID', envJitsi, 50)
  const validResend = validateEnvVar('RESEND_API_KEY', envResend, 30)
  
  // Known good fallback values
  const fallbacks = {
    supabaseUrl: 'https://jmwfpumnyxuaelmkwbvf.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2ZwdW1ueXh1YWVsbWt3YnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Njg1NDcsImV4cCI6MjA2OTI0NDU0N30.7EuN5hMY44rlXEgcOC2IMdPnJXn5zd0Ftnx0EDdERKM',
    jitsiAppId: 'vpaas-magic-cookie-1764593a618848cfa0023ac1a152f3c8',
    resendApiKey: 're_9EcX2S6Z_5XqAWExwMS7XKSiuMFf3Hsyf'
  }
  
  const config: EnvConfig = {
    supabaseUrl: validUrl || fallbacks.supabaseUrl,
    supabaseAnonKey: validKey || fallbacks.supabaseAnonKey,
    jitsiAppId: validJitsi || fallbacks.jitsiAppId,
    resendApiKey: validResend || fallbacks.resendApiKey
  }
  
  // Log final configuration
  const usingFallbacks = !validUrl || !validKey || !validJitsi || !validResend
  if (usingFallbacks) {
    console.warn('⚠️  Using fallback values for some environment variables')
    console.log('🔧 To fix: Check Vercel environment variables for truncation or encoding issues')
  } else {
    console.log('✅ All environment variables loaded successfully')
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
  return {
    apiKey: ENV.resendApiKey
  }
}