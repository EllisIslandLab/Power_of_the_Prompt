"use client"

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function TestFreshClientPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testFreshClient = async () => {
    setLoading(true)
    try {
      // Create a completely fresh client with different options
      const supabase = createClient(
        'https://jmwfpumnyxuaelmkwbvf.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2ZwdW1ueXh1YWVsbWt3YnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Njg1NDcsImV4cCI6MjA2OTI0NDU0N30.7EuN5hMY44rlXEgcOC2IMdPnJXn5zd0Ftnx0EDdERKM',
        {
          db: {
            schema: 'public',
          },
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          global: {
            headers: { 'x-my-custom-header': 'test' },
          },
        }
      )
      
      console.log('Testing fresh client with timeout...')
      
      // Use fetch with timeout instead of supabase client
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      try {
        const response = await fetch('https://jmwfpumnyxuaelmkwbvf.supabase.co/rest/v1/admin_users?select=*&user_id=eq.c91e87c1-4293-40b2-aae5-8b4e91274356', {
          signal: controller.signal,
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2ZwdW1ueXh1YWVsbWt3YnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Njg1NDcsImV4cCI6MjA2OTI0NDU0N30.7EuN5hMY44rlXEgcOC2IMdPnJXn5zd0Ftnx0EDdERKM',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2ZwdW1ueXh1YWVsbWt3YnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Njg1NDcsImV4cCI6MjA2OTI0NDU0N30.7EuN5hMY44rlXEgcOC2IMdPnJXn5zd0Ftnx0EDdERKM',
            'Content-Type': 'application/json'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          setResult(`❌ HTTP Error: ${response.status} - ${response.statusText}`)
          return
        }
        
        const data = await response.json()
        setResult(`✅ Direct REST API Success!\n${JSON.stringify(data, null, 2)}`)
        
      } catch (fetchErr) {
        clearTimeout(timeoutId)
        if ((fetchErr as Error).name === 'AbortError') {
          setResult(`❌ Direct API timeout after 3 seconds`)
        } else {
          setResult(`❌ Direct API error: ${fetchErr}`)
        }
      }
      
    } catch (err) {
      setResult(`❌ Client creation error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Test Fresh Client & Direct API</h1>
        
        <button
          onClick={testFreshClient}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50 mb-4"
        >
          {loading ? 'Testing...' : 'Test Direct REST API'}
        </button>
        
        {result && (
          <div className="p-4 bg-gray-100 rounded-lg border">
            <pre className="text-sm whitespace-pre-wrap text-black font-mono">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}