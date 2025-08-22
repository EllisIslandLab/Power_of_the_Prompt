'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { getSupabaseConfig } from '@/lib/env-config'
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
    
    // Clear any potentially corrupted session data first
    const clearCorruptedSession = async () => {
      try {
        // Clear local storage keys
        if (typeof window !== 'undefined') {
          const keysToRemove = [
            'sb-srnykdfmhnovdgypzmeg-auth-token',
            'supabase.auth.token',
            'sb-localhost-auth-token'
          ]
          keysToRemove.forEach(key => {
            localStorage.removeItem(key)
            sessionStorage.removeItem(key)
          })
        }
        await supabase.auth.signOut()
      } catch (err) {
        console.log('Session clear attempt completed')
      }
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          // Clear any invalid session data
          if (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found')) {
            console.log('Clearing invalid refresh token...')
            await clearCorruptedSession()
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
        await clearCorruptedSession()
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
      console.log('🔍 Looking up profile for user:', user.id)
      const supabase = getSupabase()
      
      // Check admin first
      console.log('🔍 Checking admin profile...')
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      console.log('🔍 Admin query result:', { adminData, adminError })
      
      if (adminData) {
        console.log('✅ Found admin profile:', adminData)
        return {
          ...user,
          userType: 'admin' as const,
          adminProfile: adminData as unknown as AdminProfile
        }
      }

      // Check student if not admin (ignore PGRST116 error - means no rows found)
      if (adminError?.code !== 'PGRST116') {
        console.warn('Admin profile check error:', adminError)
      }

      console.log('🔍 Checking student profile...')
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      console.log('🔍 Student query result:', { studentData, studentError })
      
      if (studentData) {
        console.log('✅ Found student profile:', studentData)
        return {
          ...user,
          userType: 'student' as const,
          studentProfile: studentData as unknown as StudentProfile
        }
      }

      // Log only if it's not a "no rows found" error
      if (studentError?.code !== 'PGRST116') {
        console.warn('Student profile check error:', studentError)
      }

      console.log('❌ No profile found for user:', user.id)
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
    console.log('🔄 Starting authentication...')
    const { url: finalUrl, anonKey: finalKey } = getSupabaseConfig()
    
    // Validate inputs
    if (!finalUrl || !finalKey || !email || !password) {
      throw new Error('Missing required authentication parameters')
    }
    
    try {
      console.log('📡 Making auth request...')
      const response = await fetch(`${finalUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': finalKey,
          'Authorization': `Bearer ${finalKey}`
        },
        body: JSON.stringify({ email, password })
      })
      
      console.log('📡 Auth response:', response.status, response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Auth failed:', response.status, errorText)
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`)
      }
      
      const authData = await response.json()
      console.log('✅ Auth successful, user:', authData.user?.id)
      
      // Set the session in our main Supabase client
      const supabase = getSupabase()
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token
      })
      
      if (sessionError) {
        console.warn('Session setting warning:', sessionError)
      } else {
        console.log('✅ Session set successfully')
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
      console.error('❌ Authentication error:', error)
      throw error
    }
  }

  const signOut = async () => {
    const supabase = getSupabase()
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn('Sign out error (non-critical):', error.message)
        // Don't throw for sign-out errors - just clear local state
      }
    } catch (error) {
      console.warn('Sign out failed (clearing local state):', error)
    }
    
    // Always clear local state regardless of API response
    setUser(null)
    
    // Clear localStorage/sessionStorage
    if (typeof window !== 'undefined') {
      const keysToRemove = [
        'sb-srnykdfmhnovdgypzmeg-auth-token',
        'supabase.auth.token',
        'sb-localhost-auth-token'
      ]
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
    }
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