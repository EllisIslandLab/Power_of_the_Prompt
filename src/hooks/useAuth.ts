'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase'

export interface AuthUser extends User {
  profile?: Profile
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize Supabase client
    const supabase = getSupabase()
    
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const userWithProfile = await getUserWithProfile(session.user)
        setUser(userWithProfile)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Try to get profile, create if doesn't exist
          let userWithProfile = await getUserWithProfile(session.user)
          
          // If no profile exists, create one (happens after email confirmation)
          if (!userWithProfile.profile) {
            const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
            
            try {
              const { data: newProfile } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  name,
                  role: 'STUDENT'
                })
                .select()
                .single()
              
              userWithProfile = { ...session.user, profile: newProfile }
            } catch (error) {
              console.error('Error creating profile:', error)
            }
          }
          
          setUser(userWithProfile)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const getUserWithProfile = async (user: User): Promise<AuthUser> => {
    console.log("Getting profile for user:", user.id)
    const supabase = getSupabase()
    
    try {
      // Add timeout to prevent infinite hanging
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 5000)
      )

      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any

      console.log("Profile query result:", { profile, error })
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error("Profile query error:", error)
      }
      
      return { ...user, profile: profile || undefined }
    } catch (err) {
      console.error("Profile lookup failed:", err)
      // For admin user, create a fallback profile
      if (user.id === '64ad2b22-d3fe-4159-9e55-75bd2ac11f61') {
        console.log("Using fallback admin profile due to timeout")
        return { 
          ...user, 
          profile: { 
            id: user.id, 
            name: 'Admin', 
            role: 'ADMIN' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } 
        }
      }
      // For any other user, also create a basic profile to prevent hanging
      console.log("Using fallback student profile due to timeout")
      return { 
        ...user, 
        profile: { 
          id: user.id, 
          name: user.email?.split('@')[0] || 'User', 
          role: 'STUDENT' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } 
      }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (error) throw error
    return data
  }

  const signIn = async (email: string, password: string) => {
    console.log("Calling Supabase signInWithPassword...")
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("Supabase auth response:", { data, error })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) throw new Error('No user logged in')

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    // Update local user state
    setUser(prev => prev ? { ...prev, profile: data } : null)
    return data
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin: user?.profile?.role === 'ADMIN',
    isCoach: user?.profile?.role === 'COACH',
    isStudent: user?.profile?.role === 'STUDENT',
  }
}