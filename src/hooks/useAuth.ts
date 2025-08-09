'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase'

export interface AuthUser extends User {
  profile?: Profile
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return { ...user, profile: profile || undefined }
  }

  const signUp = async (email: string, password: string, name: string) => {
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) throw new Error('No user logged in')

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