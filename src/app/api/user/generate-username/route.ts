import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Lists for generating creative anonymous usernames
const adjectives = [
  'Swift', 'Silent', 'Brave', 'Clever', 'Wise', 'Bold', 'Quick', 'Sharp',
  'Bright', 'Agile', 'Noble', 'Calm', 'Keen', 'Fierce', 'Gentle', 'Mighty',
  'Serene', 'Vibrant', 'Radiant', 'Graceful', 'Stellar', 'Cosmic', 'Azure',
  'Golden', 'Silver', 'Crystal', 'Mystic', 'Ancient', 'Modern', 'Digital'
]

const nouns = [
  'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Wolf', 'Hawk', 'Falcon', 'Lion',
  'Bear', 'Panther', 'Fox', 'Owl', 'Raven', 'Crane', 'Dolphin', 'Shark',
  'Star', 'Moon', 'Sun', 'Cloud', 'Storm', 'Wave', 'River', 'Mountain',
  'Forest', 'Ocean', 'Thunder', 'Lightning', 'Wind', 'Shadow', 'Light',
  'Code', 'Pixel', 'Byte', 'Nova', 'Cosmos', 'Nebula', 'Orbit', 'Comet'
]

function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 999) + 1

  return `${adjective}${noun}${number}`
}

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate username and check uniqueness
    let username = generateRandomUsername()
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      // Check if username exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

      if (!existing) {
        // Username is unique, update user
        const { error: updateError } = await supabase
          .from('users')
          .update({ username })
          .eq('id', user.id)

        if (updateError) {
          return NextResponse.json(
            { error: 'Failed to update username' },
            { status: 500 }
          )
        }

        return NextResponse.json({ username })
      }

      // Try a new username
      username = generateRandomUsername()
      attempts++
    }

    return NextResponse.json(
      { error: 'Could not generate unique username. Please try again.' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Username generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
