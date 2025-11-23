# Repository Pattern Template

## Quick Start

Create a repository for any entity that needs database access.

## Structure

```typescript
// src/lib/repositories/[Entity]Repository.ts

import { createClient } from '@/lib/supabase';
import { cache } from '@/lib/cache';
import type { Database } from '@/types/database';

// Use generated types from Supabase
type [Entity] = Database['public']['Tables']['[table_name]']['Row'];
type [Entity]Insert = Database['public']['Tables']['[table_name]']['Insert'];
type [Entity]Update = Database['public']['Tables']['[table_name]']['Update'];

export class [Entity]Repository {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Find entity by ID with caching
   */
  async findById(id: string): Promise<[Entity] | null> {
    const cacheKey = `[entity]:${id}`;

    // Check cache first
    const cached = await cache.get<[Entity]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await this.supabase
      .from('[table_name]')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      await cache.set(cacheKey, data, 3600); // 1 hour TTL
    }

    return data;
  }

  /**
   * Find all entities with optional filters
   */
  async findAll(filters?: Partial<[Entity]>): Promise<[Entity][]> {
    let query = this.supabase.from('[table_name]').select('*');

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) {
          query = query.eq(key, value);
        }
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Find with pagination
   */
  async findPaginated(
    page = 1,
    limit = 20,
    filters?: Partial<[Entity]>
  ): Promise<{ items: [Entity][]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('[table_name]')
      .select('*', { count: 'exact' });

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) {
          query = query.eq(key, value);
        }
      }
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      items: data || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  /**
   * Create new entity
   */
  async create(data: [Entity]Insert): Promise<[Entity]> {
    const { data: created, error } = await this.supabase
      .from('[table_name]')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return created;
  }

  /**
   * Update existing entity
   */
  async update(id: string, updates: [Entity]Update): Promise<[Entity]> {
    const { data, error } = await this.supabase
      .from('[table_name]')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await cache.delete(`[entity]:${id}`);

    return data;
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('[table_name]')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Invalidate cache
    await cache.delete(`[entity]:${id}`);

    return true;
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }
}

// Export singleton instance
export const [entity]Repository = new [Entity]Repository();
```

## Usage Example

```typescript
// src/lib/repositories/StudentRepository.ts
import { createClient } from '@/lib/supabase';
import { cache } from '@/lib/cache';
import type { Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];

export class StudentRepository {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Find student by email (custom method)
   */
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Find active students by role
   */
  async findActiveStudents(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Find students by tier
   */
  async findByTier(tier: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('tier', tier)
      .eq('role', 'student');

    if (error) throw error;
    return data || [];
  }
}

export const studentRepository = new StudentRepository();
```

## API Route Usage

```typescript
// src/app/api/students/[id]/route.ts
import { studentRepository } from '@/lib/repositories/StudentRepository';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const student = await studentRepository.findById(params.id);

    if (!student) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    return Response.json(student);
  } catch (error) {
    logger.error({ err: error, studentId: params.id }, 'Failed to fetch student');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const student = await studentRepository.update(params.id, updates);
    return Response.json(student);
  } catch (error) {
    logger.error({ err: error, studentId: params.id }, 'Failed to update student');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await studentRepository.delete(params.id);
    return Response.json({ success: true });
  } catch (error) {
    logger.error({ err: error, studentId: params.id }, 'Failed to delete student');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## When to Use

**Use Repository Pattern when:**
- You need to query Supabase or Airtable
- You want testable data access code
- You might switch databases in the future
- You want to add caching without changing business logic

**Don't use when:**
- Simple one-time data fetch with no reuse
- Static data that never changes

## Benefits

1. **Single Responsibility:** All data access for an entity in one place
2. **Testability:** Easy to mock for tests
3. **Flexibility:** Swap databases without changing business logic
4. **Caching:** Add caching layer without touching API routes
5. **Consistency:** Same interface for all data operations
6. **Type Safety:** Full TypeScript support with generated types

## Related Patterns

- **Adapter Pattern** - Abstract different databases behind common interface
- **Data Caching Layer** - Add caching to repositories
- **Query Builder** - Build complex queries for repositories
