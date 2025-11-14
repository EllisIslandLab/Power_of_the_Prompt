// This route is now handled by /get-started/[sessionId]
// Redirect to the main get-started page
import { redirect } from 'next/navigation'

export default function GetStartedBuildPage() {
  redirect('/get-started')
}
