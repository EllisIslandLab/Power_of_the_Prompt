import { redirect } from 'next/navigation'

export default async function BillingPage() {
  // Redirect to unified billing in Settings
  redirect('/portal/settings?tab=billing')
}
