/**
 * Script to update lead names in Supabase
 * Run this with: npx tsx scripts/update-lead-names.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

async function updateLeadNames() {
  console.log('Starting lead names update...\n')

  for (const lead of leads) {
    console.log(`Updating ${lead.email}...`)

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
      console.error(`  ❌ Error updating ${lead.email}:`, error.message)
    } else if (data && data.length > 0) {
      console.log(`  ✅ Updated: ${lead.first_name} ${lead.last_name}`)
    } else {
      console.log(`  ⚠️  Lead not found: ${lead.email}`)
    }
  }

  console.log('\n✨ Lead names update complete!')
}

updateLeadNames().catch(console.error)
