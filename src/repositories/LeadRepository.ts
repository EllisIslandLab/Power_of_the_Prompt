import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './BaseRepository'
import { logger } from '@/lib/logger'

/**
 * Lead Repository
 *
 * Handles all database operations for leads table.
 * Provides domain-specific methods for lead management and conversion tracking.
 *
 * Features:
 * - Lead CRUD operations
 * - Email-based lookups
 * - Status management (new, contacted, converted, lost)
 * - Conversion tracking
 * - Source tracking
 *
 * Usage:
 * ```typescript
 * const leadRepo = new LeadRepository(supabaseClient)
 * const lead = await leadRepo.findByEmail('lead@example.com')
 * await leadRepo.markAsConverted(leadId)
 * ```
 */

export interface Lead {
  id: string
  email: string
  name: string
  phone?: string
  source?: string
  status: 'new' | 'contacted' | 'converted' | 'lost'
  notes?: string
  converted_at?: string
  created_at: string
  updated_at: string
}

export interface CreateLeadInput {
  email: string
  name: string
  phone?: string
  source?: string
  notes?: string
}

export interface UpdateLeadInput {
  name?: string
  phone?: string
  status?: 'new' | 'contacted' | 'converted' | 'lost'
  notes?: string
}

export class LeadRepository extends BaseRepository<Lead> {
  constructor(client: SupabaseClient) {
    super(client, 'leads')
  }

  /**
   * Find lead by email address
   */
  async findByEmail(email: string): Promise<Lead | null> {
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
          `Lead not found by email (${duration}ms)`
        )
        return null
      }

      logger.debug(
        { type: 'database', table: this.tableName, operation: 'findByEmail', email, duration },
        `Found lead by email (${duration}ms)`
      )

      return data as Lead
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
   * Create a new lead
   */
  async createLead(input: CreateLeadInput): Promise<Lead | null> {
    const startTime = Date.now()

    try {
      const leadData = {
        email: input.email.toLowerCase(),
        name: input.name,
        phone: input.phone,
        source: input.source || 'website',
        status: 'new' as const,
        notes: input.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await this.client
        .from(this.tableName)
        .insert(leadData)
        .select()
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'createLead', email: input.email, error, duration },
          `Failed to create lead`
        )
        return null
      }

      logger.info(
        { type: 'database', table: this.tableName, operation: 'createLead', leadId: data.id, email: input.email, duration },
        `Created lead (${duration}ms)`
      )

      return data as Lead
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'createLead', error, duration },
        `Exception in createLead`
      )
      return null
    }
  }

  /**
   * Update lead status
   */
  async updateStatus(
    leadId: string,
    status: 'new' | 'contacted' | 'converted' | 'lost'
  ): Promise<Lead | null> {
    const startTime = Date.now()

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      // Set converted_at timestamp when marking as converted
      if (status === 'converted') {
        updateData.converted_at = new Date().toISOString()
      }

      const { data, error } = await this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', leadId)
        .select()
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'updateStatus', leadId, status, error, duration },
          `Failed to update lead status`
        )
        return null
      }

      logger.info(
        { type: 'database', table: this.tableName, operation: 'updateStatus', leadId, status, duration },
        `Updated lead status to ${status} (${duration}ms)`
      )

      return data as Lead
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'updateStatus', leadId, error, duration },
        `Exception in updateStatus`
      )
      return null
    }
  }

  /**
   * Mark lead as converted (shorthand for updateStatus)
   */
  async markAsConverted(leadId: string): Promise<Lead | null> {
    return this.updateStatus(leadId, 'converted')
  }

  /**
   * Mark lead as converted by email (common use case)
   */
  async markAsConvertedByEmail(email: string): Promise<Lead | null> {
    const startTime = Date.now()

    try {
      const updateData = {
        status: 'converted' as const,
        converted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await this.client
        .from(this.tableName)
        .update(updateData)
        .eq('email', email.toLowerCase())
        .select()
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'markAsConvertedByEmail', email, error, duration },
          `Failed to mark lead as converted`
        )
        return null
      }

      logger.info(
        { type: 'database', table: this.tableName, operation: 'markAsConvertedByEmail', email, duration },
        `Marked lead as converted (${duration}ms)`
      )

      return data as Lead
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'markAsConvertedByEmail', email, error, duration },
        `Exception in markAsConvertedByEmail`
      )
      return null
    }
  }

  /**
   * Update lead information
   */
  async updateLead(leadId: string, updates: UpdateLeadInput): Promise<Lead | null> {
    const startTime = Date.now()

    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select()
        .single()

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'updateLead', leadId, error, duration },
          `Failed to update lead`
        )
        return null
      }

      logger.info(
        { type: 'database', table: this.tableName, operation: 'updateLead', leadId, duration },
        `Updated lead (${duration}ms)`
      )

      return data as Lead
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'updateLead', leadId, error, duration },
        `Exception in updateLead`
      )
      return null
    }
  }

  /**
   * Get all leads by status
   */
  async findByStatus(status: 'new' | 'contacted' | 'converted' | 'lost'): Promise<Lead[]> {
    return this.findMany({ status } as Partial<Lead>)
  }

  /**
   * Get all leads by source
   */
  async findBySource(source: string): Promise<Lead[]> {
    return this.findMany({ source } as Partial<Lead>)
  }

  /**
   * Check if lead exists by email
   */
  async exists(email: string): Promise<boolean> {
    const lead = await this.findByEmail(email)
    return lead !== null
  }

  /**
   * Get recent leads (last N days)
   */
  async getRecentLeads(days: number = 7, limit: number = 50): Promise<Lead[]> {
    const startTime = Date.now()

    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit)

      const duration = Date.now() - startTime

      if (error) {
        logger.error(
          { type: 'database', table: this.tableName, operation: 'getRecentLeads', days, error, duration },
          `Failed to get recent leads`
        )
        return []
      }

      logger.debug(
        { type: 'database', table: this.tableName, operation: 'getRecentLeads', count: data?.length || 0, days, duration },
        `Found ${data?.length || 0} recent leads (${duration}ms)`
      )

      return (data || []) as Lead[]
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'database', table: this.tableName, operation: 'getRecentLeads', error, duration },
        `Exception in getRecentLeads`
      )
      return []
    }
  }
}
