import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { BaseAdapter } from './BaseAdapter'
import { logger } from '@/lib/logger'

/**
 * Supabase Adapter
 *
 * Centralized adapter for Supabase database client creation.
 * Provides consistent client configuration and error handling.
 *
 * Features:
 * - Consistent client creation with proper configuration
 * - Admin client with service role key (bypasses RLS)
 * - Server client with SSR support (for Next.js routes)
 * - Proper environment variable validation
 * - Type-safe client instances
 *
 * Usage:
 * ```typescript
 * // Admin client (bypasses RLS, use carefully!)
 * const supabase = SupabaseAdapter.getAdminClient()
 *
 * // Public client (respects RLS)
 * const supabase = SupabaseAdapter.getPublicClient()
 * ```
 */

export class SupabaseAdapter extends BaseAdapter {
  private static adminClient: SupabaseClient | null = null
  private static publicClient: SupabaseClient | null = null

  constructor() {
    super('supabase')
  }

  /**
   * Get admin client with service role key (bypasses RLS)
   * Use this for server-side operations that need full access
   */
  public static getAdminClient(): SupabaseClient {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
    }

    if (!SupabaseAdapter.adminClient) {
      SupabaseAdapter.adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )

      logger.info(
        { type: 'service', service: 'supabase' },
        'Supabase admin client initialized'
      )
    }

    return SupabaseAdapter.adminClient
  }

  /**
   * Get public client with anon key (respects RLS)
   * Use this for client-side operations or when RLS should be enforced
   */
  public static getPublicClient(): SupabaseClient {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured')
    }

    if (!SupabaseAdapter.publicClient) {
      SupabaseAdapter.publicClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      logger.info(
        { type: 'service', service: 'supabase' },
        'Supabase public client initialized'
      )
    }

    return SupabaseAdapter.publicClient
  }

  /**
   * Create a server client for SSR (Next.js App Router)
   * This is a factory method - creates a new client each time for request isolation
   */
  public static createServerClient(
    cookieGetter: () => Array<{ name: string; value: string }>,
    cookieSetter: (cookies: Array<{ name: string; value: string; options?: any }>) => void
  ) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured')
    }

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: cookieGetter,
          setAll: cookieSetter,
        },
      }
    )
  }
}

// Export convenience methods
export const getAdminClient = () => SupabaseAdapter.getAdminClient()
export const getPublicClient = () => SupabaseAdapter.getPublicClient()
