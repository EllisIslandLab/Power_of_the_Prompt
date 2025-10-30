/**
 * Adapter Exports
 *
 * Centralized exports for all service adapters.
 * This provides a single point of import for all adapter functionality.
 *
 * Usage:
 * ```typescript
 * import { stripeAdapter, resendAdapter, getAdminClient } from '@/adapters'
 * ```
 */

export { BaseAdapter } from './BaseAdapter'
export type { RetryOptions } from './BaseAdapter'

export { StripeAdapter, stripeAdapter } from './StripeAdapter'

export { ResendAdapter, resendAdapter } from './ResendAdapter'
export type { SendEmailParams, SendEmailResult } from './ResendAdapter'

export { SupabaseAdapter, getAdminClient, getPublicClient } from './SupabaseAdapter'
