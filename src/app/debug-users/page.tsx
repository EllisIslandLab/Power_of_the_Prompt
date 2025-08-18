"use client"

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export default function DebugUsersPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const checkUsers = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      
      // Get current user to see what we're working with
      const { data: { session } } = await supabase.auth.getSession()
      
      let output = `Current session user: ${session?.user?.email || 'None'}\n`
      output += `User ID: ${session?.user?.id || 'None'}\n`
      output += `Email confirmed: ${session?.user?.email_confirmed_at ? 'Yes' : 'No'}\n\n`
      
      // Check admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
      
      output += `Admin users table:\n`
      if (adminError) {
        output += `Error: ${adminError.message}\n`
      } else {
        output += `Count: ${adminData?.length || 0}\n`
        if (adminData?.length) {
          output += JSON.stringify(adminData, null, 2) + '\n'
        }
      }
      
      // Check students table
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
      
      output += `\nStudents table:\n`
      if (studentError) {
        output += `Error: ${studentError.message}\n`
      } else {
        output += `Count: ${studentData?.length || 0}\n`
        if (studentData?.length) {
          output += JSON.stringify(studentData, null, 2) + '\n'
        }
      }
      
      setResult(output)
    } catch (err) {
      setResult(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const createAdminProfile = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setResult('No user logged in')
        return
      }
      
      // Create admin profile for current user
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          user_id: session.user.id,
          full_name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Admin',
          email: session.user.email!,
          role: 'Super Admin',
          permissions: ['all']
        })
        .select()
        .single()
      
      if (error) {
        setResult(`Error creating admin profile: ${error.message}`)
      } else {
        setResult(`Admin profile created successfully:\n${JSON.stringify(data, null, 2)}`)
      }
    } catch (err) {
      setResult(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Debug Users</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={checkUsers}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Users & Tables'}
          </button>
          
          <button
            onClick={createAdminProfile}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Admin Profile for Current User'}
          </button>
        </div>
        
        {result && (
          <div className="p-4 bg-gray-100 rounded-lg border">
            <pre className="text-sm whitespace-pre-wrap text-black font-mono overflow-auto max-h-96">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}