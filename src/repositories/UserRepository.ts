import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './BaseRepository'
import { logger } from '@/lib/logger'

/**
 * User Repository
 *
 * Handles all database operations for users table.
 * Provides domain-specific methods for user management.
 *
 * Features:
 * - User CRUD operations
 * - Email-based lookups
 * - Tier and payment status management
 * - User profile management
 *
 * Usage:
 * ```typescript
 * const userRepo = new UserRepository(supabaseClient)
 * const user = await userRepo.findByEmail('user@example.com')
 * await userRepo.updateTier(userId, 'vip')
 * ```
 */

export interface User {
  id: string
  email: string
  full_name: string
  role: 'student' | 'admin'
  tier: 'basic' | 'premium' | 'vip'
  payment_status: 'pending' | 'paid' | 'failed' | 'trial'
  email_verified: boolean
  invited_by?: string
  invited_at?: string
  created_at: string
  updated_at: string
}

export interface CreateUserInput {
  id: string // Auth user ID
  email: string
  full_name: string
  role?: 'student' | 'admin'
  tier?: 'basic' | 'premium' | 'vip'
  payment_status?: 'pending' | 'paid' | 'failed' | 'trial'
  email_verified?: boolean
  invited_by?: string
  invited_at?: string
}

export interface UpdateUserInput {
  full_name?: string
  tier?: 'basic' | 'premium' | 'vip'
  payment_status?: 'pending' | 'paid' | 'failed' | 'trial'
  email_verified?: boolean
}

export class UserRepository extends BaseRepository<User> {
  constructor(client: SupabaseClient) {
    super(client, 'users')
  }

  /**
   * Find user by email address
   */
  async findByEmail(email: string): Promise<User | null> {
    const startTime = Date.now()

    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.debug(
          { type: 'database', table: this.tableName, operation: 'findByEmail', email, duration },
          `User not found by email (${duration}ms)`
        )
        return null
      }

      logger.debug(
        { type: 'database', table: this.tableName, operation: 'findByEmail', email, duration },
        `Found user by email (${duration}ms)`
      )

      return data as User
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'findByEmail', email, error, duration },
        `Exception in findByEmail`
      )
      return null
    }
  }

  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput): Promise<User | null> {
    const startTime = Date.now()

    try {
      const userData = {
        id: input.id,
        email: input.email.toLowerCase(),
        full_name: input.full_name,
        role: input.role || 'student',
        tier: input.tier || 'basic',
        payment_status: input.payment_status || 'pending',
        email_verified: input.email_verified || false,
        invited_by: input.invited_by,
        invited_at: input.invited_at,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await this.client
        .from(this.tableName)
        .insert(userData)
        .select()
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'createUser', email: input.email, error, duration },
          `Failed to create user`
        )
        return null
      }

      logger.info(
        { type: 'database', table: this.tableName, operation: 'createUser', userId: data.id, email: input.email, duration },
        `Created user (${duration}ms)`
      )

      return data as User
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'createUser', error, duration },
        `Exception in createUser`
      )
      return null
    }
  }

  /**
   * Update user's tier
   */
  async updateTier(userId: string, tier: 'basic' | 'premium' | 'vip'): Promise<User | null> {
    const startTime = Date.now()

    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .update({
          tier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'updateTier', userId, tier, error, duration },
          `Failed to update user tier`
        )
        return null
      }

      logger.info(
        { type: 'database', table: this.tableName, operation: 'updateTier', userId, tier, duration },
        `Updated user tier to ${tier} (${duration}ms)`
      )

      return data as User
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'updateTier', userId, error, duration },
        `Exception in updateTier`
      )
      return null
    }
  }

  /**
   * Update user's payment status
   */
  async updatePaymentStatus(
    userId: string,
    paymentStatus: 'pending' | 'paid' | 'failed' | 'trial'
  ): Promise<User | null> {
    const startTime = Date.now()

    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'updatePaymentStatus', userId, paymentStatus, error, duration },
          `Failed to update payment status`
        )
        return null
      }

      logger.info(
        { type: 'database', table: this.tableName, operation: 'updatePaymentStatus', userId, paymentStatus, duration },
        `Updated payment status to ${paymentStatus} (${duration}ms)`
      )

      return data as User
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'updatePaymentStatus', userId, error, duration },
        `Exception in updatePaymentStatus`
      )
      return null
    }
  }

  /**
   * Update user's tier and payment status together (common operation)
   */
  async updateTierAndPayment(
    userId: string,
    tier: 'basic' | 'premium' | 'vip',
    paymentStatus: 'pending' | 'paid' | 'failed' | 'trial'
  ): Promise<User | null> {
    const startTime = Date.now()

    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .update({
          tier,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'updateTierAndPayment', userId, tier, paymentStatus, error, duration },
          `Failed to update tier and payment status`
        )
        return null
      }

      logger.info(
        { type: 'database', table: this.tableName, operation: 'updateTierAndPayment', userId, tier, paymentStatus, duration },
        `Updated tier to ${tier} and payment to ${paymentStatus} (${duration}ms)`
      )

      return data as User
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'updateTierAndPayment', userId, error, duration },
        `Exception in updateTierAndPayment`
      )
      return null
    }
  }

  /**
   * Update user profile (full name, etc.)
   */
  async updateProfile(userId: string, updates: UpdateUserInput): Promise<User | null> {
    const startTime = Date.now()

    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'updateProfile', userId, error, duration },
          `Failed to update user profile`
        )
        return null
      }

      logger.info(
        { type: 'database', table: this.tableName, operation: 'updateProfile', userId, duration },
        `Updated user profile (${duration}ms)`
      )

      return data as User
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'updateProfile', userId, error, duration },
        `Exception in updateProfile`
      )
      return null
    }
  }

  /**
   * Get all users by tier
   */
  async findByTier(tier: 'basic' | 'premium' | 'vip'): Promise<User[]> {
    return this.findMany({ tier } as Partial<User>)
  }

  /**
   * Get all users by role
   */
  async findByRole(role: 'student' | 'admin'): Promise<User[]> {
    return this.findMany({ role } as Partial<User>)
  }

  /**
   * Check if user exists by email
   */
  async exists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email)
    return user !== null
  }
}
