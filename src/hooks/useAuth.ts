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
            
            // If no profile exists and user is confirmed, create student profile
            if (!userWithProfile.studentProfile && !userWithProfile.adminProfile && session.user.email_confirmed_at) {
              try {
                const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
                const studentProfile = await createStudentProfile(session.user.id, session.user.email!, name)
                userWithProfile = {
                  ...session.user,
                  userType: 'student',
                  studentProfile: studentProfile
                }
              } catch (error) {
                console.error('Failed to create student profile on auth change:', error)
              }
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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('https://jmwfpumnyxuaelmkwbvf.supabase.co/rest/v1/students', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2ZwdW1ueXh1YWVsbWt3YnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Njg1NDcsImV4cCI6MjA2OTI0NDU0N30.7EuN5hMY44rlXEgcOC2IMdPnJXn5zd0Ftnx0EDdERKM',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2ZwdW1ueXh1YWVsbWt3YnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Njg1NDcsImV4cCI6MjA2OTI0NDU0N30.7EuN5hMY44rlXEgcOC2IMdPnJXn5zd0Ftnx0EDdERKM',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: userId,
          full_name: name,
          email: email
        })
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to create student profile: ${response.status} - ${error}`)
      }
      
      const data = await response.json()
      return Array.isArray(data) ? data[0] : data
    } catch (error) {
      console.error('Failed to create student profile:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    console.log('Attempting direct auth API call...')
    
    try {
      // Direct REST API call to Supabase Auth
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          email,
          password
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error_description || `Authentication failed: ${response.status}`)
      }
      
      const authData = await response.json()
      console.log('Auth successful, setting session...')
      
      // Set the session in our main Supabase client
      const supabase = getSupabase()
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token
      })
      
      if (sessionError) {
        console.warn('Session setting failed:', sessionError)
        // Continue anyway as auth was successful
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
      console.error('Direct auth failed:', error)
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