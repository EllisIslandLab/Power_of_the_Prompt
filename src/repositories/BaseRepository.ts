import { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

/**
 * Base Repository
 *
 * Abstract base class providing common CRUD operations for all repositories.
 * Handles error logging, performance tracking, and consistent query patterns.
 *
 * Benefits:
 * - Centralized database access logic
 * - Consistent error handling across all repositories
 * - Performance monitoring with automatic timing
 * - Easy to add caching layer later
 * - Simplifies testing with mock implementations
 *
 * Usage:
 * ```typescript
 * class UserRepository extends BaseRepository<User> {
 *   constructor(client: SupabaseClient) {
 *     super(client, 'users')
 *   }
 * }
 * ```
 */

export abstract class BaseRepository<T> {
  protected client: SupabaseClient
  protected tableName: string

  constructor(client: SupabaseClient, tableName: string) {
    this.client = client
    this.tableName = tableName
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string): Promise<T | null> {
    const startTime = Date.now()

    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'findById', id, error, duration },
          `Failed to find ${this.tableName} by ID`
        )
        return null
      }

      logger.debug(
        { type: 'database', table: this.tableName, operation: 'findById', id, duration },
        `Found ${this.tableName} by ID (${duration}ms)`
      )

      return data as T
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'findById', id, error, duration },
        `Exception in findById`
      )
      return null
    }
  }

  /**
   * Find a single record by any field
   */
  async findOne(field: keyof T, value: any): Promise<T | null> {
    const startTime = Date.now()

    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq(field as string, value)
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'findOne', field: field as string, value, error, duration },
          `Failed to find ${this.tableName}`
        )
        return null
      }

      logger.debug(
        { type: 'database', table: this.tableName, operation: 'findOne', field: field as string, duration },
        `Found ${this.tableName} (${duration}ms)`
      )

      return data as T
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'findOne', field: field as string, error, duration },
        `Exception in findOne`
      )
      return null
    }
  }

  /**
   * Find multiple records matching criteria
   */
  async findMany(filters?: Partial<T>, limit?: number): Promise<T[]> {
    const startTime = Date.now()

    try {
      let query = this.client.from(this.tableName).select('*')

      // Apply filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply limit if provided
      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'findMany', filters, error, duration },
          `Failed to find ${this.tableName} records`
        )
        return []
      }

      logger.debug(
        { type: 'database', table: this.tableName, operation: 'findMany', count: data?.length || 0, duration },
        `Found ${data?.length || 0} ${this.tableName} records (${duration}ms)`
      )

      return (data || []) as T[]
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'findMany', error, duration },
        `Exception in findMany`
      )
      return []
    }
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T | null> {
    const startTime = Date.now()

    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(data)
        .select()
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'create', error, duration },
          `Failed to create ${this.tableName}`
        )
        return null
      }

      logger.info(
        { type: 'database', table: this.tableName, operation: 'create', duration },
        `Created ${this.tableName} (${duration}ms)`
      )

      return result as T
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'create', error, duration },
        `Exception in create`
      )
      return null
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    const startTime = Date.now()

    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'update', id, error, duration },
          `Failed to update ${this.tableName}`
        )
        return null
      }

      logger.info(
        { type: 'database', table: this.tableName, operation: 'update', id, duration },
        `Updated ${this.tableName} (${duration}ms)`
      )

      return result as T
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'update', id, error, duration },
        `Exception in update`
      )
      return null
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<boolean> {
    const startTime = Date.now()

    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id)

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'delete', id, error, duration },
          `Failed to delete ${this.tableName}`
        )
        return false
      }

      logger.info(
        { type: 'database', table: this.tableName, operation: 'delete', id, duration },
        `Deleted ${this.tableName} (${duration}ms)`
      )

      return true
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'delete', id, error, duration },
        `Exception in delete`
      )
      return false
    }
  }

  /**
   * Count records matching criteria
   */
  async count(filters?: Partial<T>): Promise<number> {
    const startTime = Date.now()

    try {
      let query = this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })

      // Apply filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { count, error } = await query

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'count', filters, error, duration },
          `Failed to count ${this.tableName}`
        )
        return 0
      }

      logger.debug(
        { type: 'database', table: this.tableName, operation: 'count', count, duration },
        `Counted ${count} ${this.tableName} records (${duration}ms)`
      )

      return count || 0
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'count', error, duration },
        `Exception in count`
      )
      return 0
    }
  }
}
