"use client"

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'

export function SupabaseDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    const runDiagnostics = () => {
      try {
        // Check environment variables
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        setDiagnostics({
          hasUrl: !!url,
          hasKey: !!key,
          urlFormat: url ? (url.startsWith('https://') && url.includes('.supabase.co')) : false,
          keyFormat: key ? key.startsWith('eyJ') : false,
          urlLength: url?.length || 0,
          keyLength: key?.length || 0,
          urlValue: url ? `${url.substring(0, 30)}...` : 'undefined',
          keyValue: key ? `${key.substring(0, 30)}...` : 'undefined'
        })

        // Test Supabase client creation
        try {
          const supabase = getSupabase()
          setTestResult('✅ Supabase client created successfully')
          
          // Test auth endpoint
          supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
              setTestResult(`⚠️ Auth test error: ${error.message}`)
            } else {
              setTestResult('✅ Auth endpoint accessible')
            }
          }).catch(err => {
            setTestResult(`❌ Auth test failed: ${err.message}`)
          })
          
        } catch (clientError) {
          setTestResult(`❌ Client creation failed: ${(clientError as Error).message}`)
        }
        
      } catch (error) {
        setTestResult(`❌ Diagnostics failed: ${(error as Error).message}`)
      }
    }

    runDiagnostics()
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg font-mono text-sm">
      <h3 className="font-bold mb-2">Supabase Diagnostics</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold mb-1">Environment Variables:</h4>
        <div>URL Present: {diagnostics.hasUrl ? '✅' : '❌'}</div>
        <div>Key Present: {diagnostics.hasKey ? '✅' : '❌'}</div>
        <div>URL Format Valid: {diagnostics.urlFormat ? '✅' : '❌'}</div>
        <div>Key Format Valid: {diagnostics.keyFormat ? '✅' : '❌'}</div>
        <div>URL: {diagnostics.urlValue}</div>
        <div>Key: {diagnostics.keyValue}</div>
      </div>
      
      <div>
        <h4 className="font-semibold mb-1">Client Test:</h4>
        <div>{testResult || 'Testing...'}</div>
      </div>
    </div>
  )
}