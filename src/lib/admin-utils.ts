/**
 * Admin Utilities
 * Helper functions for admin-specific features
 */

const ADMIN_BALANCE_START = 100 // Starting balance for admin
const ADMIN_REFILL_THRESHOLD = 20 // Auto-refill when balance drops below this
const ADMIN_REFILL_AMOUNT = 100 // Refill to this amount

/**
 * Check if a user is an admin
 * @param email - User's email address
 * @returns true if user is admin
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
  return adminEmails.includes(email.toLowerCase())
}

/**
 * Check and auto-refill admin balance if needed
 * @param email - User's email
 * @param currentBalance - Current account balance
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns New balance if refilled, null if not admin or no refill needed
 */
export async function checkAdminAutoRefill(
  email: string | null | undefined,
  currentBalance: number,
  supabase: any,
  userId: string
): Promise<number | null> {
  // Only applies to admins
  if (!isAdmin(email)) {
    return null
  }

  // Check if refill is needed
  if (currentBalance >= ADMIN_REFILL_THRESHOLD) {
    return null
  }

  console.log(`[Admin Auto-Refill] Balance ${currentBalance} < ${ADMIN_REFILL_THRESHOLD}, refilling to ${ADMIN_REFILL_AMOUNT}`)

  try {
    // Update balance to refill amount
    const { error } = await supabase
      .from('client_accounts')
      .update({
        account_balance: ADMIN_REFILL_AMOUNT,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) {
      console.error('[Admin Auto-Refill] Failed to update balance:', error)
      return null
    }

    console.log(`[Admin Auto-Refill] ✓ Refilled to $${ADMIN_REFILL_AMOUNT}`)
    return ADMIN_REFILL_AMOUNT
  } catch (error) {
    console.error('[Admin Auto-Refill] Error:', error)
    return null
  }
}

/**
 * Get initial balance for new account
 * Admins get $100, regular users get standard amount
 */
export function getInitialBalance(email: string | null | undefined): number {
  return isAdmin(email) ? ADMIN_BALANCE_START : 4 // Regular users get $4
}
