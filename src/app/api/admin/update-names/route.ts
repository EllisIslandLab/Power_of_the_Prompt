import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase(true) // Use service role

// Lead data to update
const leads = [
  {
    email: 'barnabas.financial.coach.1@gmail.com',
    display_name: 'Barnabas, Jordan',
    first_name: 'Jordan',
    last_name: 'Barnabas'
  },
  {
    email: 'frare.patrick@gmail.com',
    display_name: 'Frare, Patrick',
    first_name: 'Patrick',
    last_name: 'Frare'
  },
  {
    email: 'kayla.jain.irish@gmail.com',
    display_name: 'Irish, Kayla',
    first_name: 'Kayla',
    last_name: 'Irish'
  },
  {
    email: 'coachkaibel@gmail.com',
    display_name: 'Kaibel, Natalie',
    first_name: 'Natalie',
    last_name: 'Kaibel'
  },
  {
    email: 'mecaekstrom@aim.com',
    display_name: 'Mecaestrom, Mitch',
    first_name: 'Mitch',
    last_name: 'Mecaestrom'
  },
  {
    email: 'purposeandplenty@gmail.com',
    display_name: 'Paschall, John',
    first_name: 'John',
    last_name: 'Paschall'
  },
  {
    email: 'ewarrick1@gmail.com',
    display_name: 'Warrick, Erika',
    first_name: 'Erika',
    last_name: 'Warrick'
  }
]

export async function POST() {
  try {
    const results: any[] = []

    for (const lead of leads) {
      const { data, error } = await supabase
        .from('leads')
        .update({
          display_name: lead.display_name,
          first_name: lead.first_name,
          last_name: lead.last_name
        })
        .eq('email', lead.email)
        .select()

      if (error) {
        results.push({
          email: lead.email,
          success: false,
          error: error.message
        })
      } else if (data && data.length > 0) {
        results.push({
          email: lead.email,
          success: true,
          updated: `${lead.first_name} ${lead.last_name}`
        })
      } else {
        results.push({
          email: lead.email,
          success: false,
          error: 'Lead not found'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} leads, ${failureCount} failed`,
      results
    })

  } catch (error) {
    console.error('Update names error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
