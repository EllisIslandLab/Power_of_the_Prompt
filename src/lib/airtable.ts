import Airtable from 'airtable'

// Lazy Airtable initialization to avoid build-time errors
export function getAirtableBase() {
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    throw new Error('Airtable configuration missing: AIRTABLE_API_KEY and AIRTABLE_BASE_ID are required')
  }
  
  return new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE_ID)
}