"use client"

export default function EnvCheckPage() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_JITSI_APP_ID: process.env.NEXT_PUBLIC_JITSI_APP_ID,
    NODE_ENV: process.env.NODE_ENV
  }

  const supabaseKeys = Object.keys(process.env).filter(key => key.includes('SUPABASE'))

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Check</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Expected Variables:</h2>
        <div className="space-y-2">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="font-mono text-sm">{key}:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {value ? `${value.substring(0, 20)}...` : 'MISSING'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">All Supabase Keys:</h2>
        <div className="space-y-1">
          {supabaseKeys.length > 0 ? (
            supabaseKeys.map(key => (
              <div key={key} className="font-mono text-sm text-blue-600">
                {key}
              </div>
            ))
          ) : (
            <span className="text-red-600">No Supabase environment variables found</span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment Info:</h2>
        <div className="space-y-1 text-sm">
          <div>Build Time: {typeof window === 'undefined' ? 'Server' : 'Client'}</div>
          <div>NODE_ENV: {process.env.NODE_ENV || 'undefined'}</div>
          <div>Total Env Vars: {Object.keys(process.env).length}</div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Fetch:</h2>
        <button 
          onClick={() => {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmwfpumnyxuaelmkwbvf.supabase.co'
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2ZwdW1ueXh1YWVsbWt3YnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Njg1NDcsImV4cCI6MjA2OTI0NDU0N30.7EuN5hMY44rlXEgcOC2IMdPnJXn5zd0Ftnx0EDdERKM'
            
            console.log('Testing fetch with FULL values:')
            console.log('  URL:', url)
            console.log('  URL length:', url.length)
            console.log('  Key length:', key.length)
            console.log('  URL from env:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
            console.log('  Key from env:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
            
            fetch(`${url}/rest/v1/`, {
              headers: { 'apikey': key }
            })
            .then(response => {
              console.log('✅ Fetch successful:', response.status)
            })
            .catch(error => {
              console.error('❌ Fetch failed:', error)
            })
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Fetch
        </button>
      </div>
    </div>
  )
}