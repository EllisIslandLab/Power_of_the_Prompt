/**
 * Repository Pattern Index
 *
 * Central export for all repositories.
 * Provides easy access to all database repositories with consistent interface.
 *
 * Usage:
 * ```typescript
 * import { UserRepository, LeadRepository } from '@/repositories'
 *
 * const userRepo = new UserRepository(supabaseClient)
 * const user = await userRepo.findByEmail('user@example.com')
 * ```
 */

export { BaseRepository } from './BaseRepository'
export { UserRepository } from './UserRepository'
export { LeadRepository } from './LeadRepository'

export type { User, CreateUserInput, UpdateUserInput } from './UserRepository'
export type { Lead, CreateLeadInput, UpdateLeadInput } from './LeadRepository'
