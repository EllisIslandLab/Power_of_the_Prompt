"use client"

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export default function TestDbPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testDirectQuery = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      
      console.log('Testing basic connection...')
      // First test basic connection
      const { data: basicData, error: basicError } = await supabase
        .from('users')
        .select('count', { count: 'exact' })
      
      if (basicError) {
        setResult(`❌ Basic connection failed: ${basicError.message}`)
        return
      }
      
      console.log('Basic connection works, testing specific query...')
      // Now test specific query with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .abortSignal(controller.signal)
        .single()
      
      clearTimeout(timeoutId)
      console.log('Query result:', { data, error })
      
      if (error) {
        setResult(`❌ Error: ${error.message}\nCode: ${error.code}\nDetails: ${error.details}`)
      } else {
        setResult(`✅ Success! Found admin:\n${JSON.stringify(data, null, 2)}`)
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setResult(`❌ Query timeout after 5 seconds`)
      } else {
        setResult(`❌ Exception: ${err}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Test Database Connection</h1>
        
        <button
          onClick={testDirectQuery}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
        >
          {loading ? 'Testing...' : 'Test Direct Admin Query'}
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