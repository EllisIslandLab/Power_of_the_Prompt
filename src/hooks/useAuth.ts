'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface StudentProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  course_enrolled: 'Foundation' | 'Premium' | 'None'
  status: 'Active' | 'Inactive' | 'Completed'
  payment_status: 'Paid' | 'Pending' | 'Trial'
  progress: number
  created_at: string
  updated_at: string
}

export interface AdminProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  role: 'Super Admin' | 'Admin' | 'Support'
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface AuthUser extends User {
  userType: 'admin' | 'student' | null
  studentProfile?: StudentProfile
  adminProfile?: AdminProfile
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          // Clear any invalid session data
          if (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found')) {
            await supabase.auth.signOut()
            setUser(null)
            return
          }
          throw error
        }
        if (session?.user) {
          const userWithProfile = await getUserWithProfile(session.user)
          setUser(userWithProfile)
        }
      } catch (error) {
        console.error('Initial session error:', error)
        // Clear any corrupted auth state
        await supabase.auth.signOut()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            let userWithProfile = await getUserWithProfile(session.user)
            
            // Don't automatically create profiles - require explicit registration
            if (!userWithProfile.studentProfile && !userWithProfile.adminProfile) {
              console.log(`User has no profile (event: ${event}) - they may need to complete registration or contact admin`)
            }
            
            setUser(userWithProfile)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Auth state change error:', error)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const getUserWithProfile = async (user: User): Promise<AuthUser> => {
    try {
      console.log('Checking profile for user ID:', user.id)
      
      // Use direct fetch API since Supabase client is hanging
      const checkProfile = async (table: string) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        
        try {
          const response = await fetch(`https://jmwfpumnyxuaelmkwbvf.supabase.co/rest/v1/${table}?select=*&user_id=eq.${user.id}`, {
            signal: controller.signal,
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2ZwdW1ueXh1YWVsbWt3YnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Njg1NDcsImV4cCI6MjA2OTI0NDU0N30.7EuN5hMY44rlXEgcOC2IMdPnJXn5zd0Ftnx0EDdERKM',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2ZwdW1ueXh1YWVsbWt3YnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Njg1NDcsImV4cCI6MjA2OTI0NDU0N30.7EuN5hMY44rlXEgcOC2IMdPnJXn5zd0Ftnx0EDdERKM',
              'Content-Type': 'application/json'
            }
          })
          
          clearTimeout(timeoutId)
          
          if (response.ok) {
            const data = await response.json()
            return data.length > 0 ? data[0] : null
          }
          return null
        } catch (err) {
          clearTimeout(timeoutId)
          console.error(`Error checking ${table}:`, err)
          return null
        }
      }
      
      // Check admin first
      console.log('Starting admin check...')
      const adminData = await checkProfile('admin_users')
      
      if (adminData) {
        console.log('Found admin profile:', adminData)
        return {
          ...user,
          userType: 'admin',
          adminProfile: adminData
        }
      }

      // Check student if not admin
      console.log('Starting student check...')
      const studentData = await checkProfile('students')
      
      if (studentData) {
        console.log('Found student profile:', studentData)
        return {
          ...user,
          userType: 'student',
          studentProfile: studentData
        }
      }

      console.log('No profile found for user')
      return {
        ...user,
        userType: null
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return {
        ...user,
        userType: null
      }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const supabase = getSupabase()
    
    // SAFETY CHECK: Prevent admin emails from signing up as students
    console.log('🔍 Checking if email is already an admin...')
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()
    
    if (existingAdmin) {
      throw new Error('This email is registered as an admin. Please contact support if you need access.')
    }
    
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (error) throw error

    // If signup successful and user is created, manually create student profile
    if (data.user && !data.user.email_confirmed_at) {
      // User needs to confirm email first, profile will be created after confirmation
      console.log('User created, awaiting email confirmation')
    }

    return data
  }

  const createStudentProfile = async (userId: string, email: string, name: string) => {
    try {
      const supabase = getSupabase()
      
      // SAFETY CHECK: Double-check this email isn't an admin before creating student
      console.log('🔍 Final safety check before creating student profile...')
      const { data: adminCheck } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email.toLowerCase())
        .single()
      
      if (adminCheck) {
        throw new Error('Cannot create student profile: email is registered as admin')
      }
      
      // SAFETY CHECK: Ensure this user doesn't already have a student profile
      const { data: existingStudent } = await supabase
        .from('students')
        .select('user_id')
        .eq('user_id', userId)
        .single()
      
      if (existingStudent) {
        console.log('Student profile already exists')
        return existingStudent
      }
      
      const { data, error } = await supabase
        .from('students')
        .insert({
          user_id: userId,
          full_name: name,
          email: email.toLowerCase() // Normalize email
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create student profile: ${error.message}`)
      }
      
      console.log('✅ Student profile created successfully')
      return data
    } catch (error) {
      console.error('Failed to create student profile:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔧 DEBUGGING AUTH STEP BY STEP...')
    
    // Debug environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('ENV CHECK:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlType: typeof supabaseUrl,
      keyType: typeof supabaseKey,
      urlValue: supabaseUrl || 'MISSING',
      keyPreview: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING'
    })
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Environment variables missing in production')
    }
    
    // Validate formats
    if (typeof supabaseUrl !== 'string' || typeof supabaseKey !== 'string') {
      throw new Error(`Invalid env var types: url=${typeof supabaseUrl}, key=${typeof supabaseKey}`)
    }
    
    // Build URL and debug it
    const authUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`
    console.log('AUTH URL:', authUrl)
    
    // Debug headers
    const headers = {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
    console.log('HEADERS:', {
      'Content-Type': headers['Content-Type'],
      'apikey': `${supabaseKey.substring(0, 10)}...`,
      'Authorization': `Bearer ${supabaseKey.substring(0, 10)}...`
    })
    
    // Debug body
    const requestBody = JSON.stringify({ email, password: '***' })
    console.log('BODY:', requestBody.replace(password, '***'))
    
    try {
      console.log('🚀 MAKING FETCH REQUEST...')
      
      // Test basic fetch first
      const testResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: { 'apikey': supabaseKey }
      })
      
      console.log('✅ Basic fetch test passed:', testResponse.status)
      
      // Now try auth
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ email, password })
      })
      
      console.log('📡 AUTH RESPONSE:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: response.headers
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ AUTH ERROR RESPONSE:', errorText)
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`)
      }
      
      const authData = await response.json()
      console.log('✅ Auth successful! Setting session...')
      
      // Set the session in our main Supabase client
      try {
        const supabase = getSupabase()
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: authData.access_token,
          refresh_token: authData.refresh_token
        })
        
        if (sessionError) {
          console.warn('⚠️  Session setting warning:', sessionError)
        } else {
          console.log('✅ Session set successfully')
        }
      } catch (sessionErr) {
        console.warn('⚠️  Session setting failed:', sessionErr)
      }
      
      return {
        user: authData.user,
        session: {
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
          user: authData.user
        }
      }
    } catch (error) {
      console.error('❌ FETCH ERROR DETAILS:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  const signOut = async () => {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateStudentProfile = async (updates: Partial<StudentProfile>) => {
    if (!user?.id || user.userType !== 'student') throw new Error('No student logged in')

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    // Update local user state
    setUser(prev => prev ? { ...prev, studentProfile: data as unknown as StudentProfile } : null)
    return data
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateStudentProfile,
    isAdmin: user?.userType === 'admin',
    isStudent: user?.userType === 'student',
  }
}