# Data Caching Layer Template

## Quick Start

Use caching to reduce database calls and improve performance. This project uses Upstash Redis.

## Existing Cache Utility

The project already has a cache utility at `src/lib/cache.ts`. Use it as the foundation.

## Structure

```typescript
// src/lib/cache.ts (enhanced version)

import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const cache = {
  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await redis.get(key);
    } catch (error) {
      logger.warn({ err: error, key }, 'Cache get failed');
      return null;
    }
  },

  /**
   * Set a value in cache with TTL (default 1 hour)
   */
  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    try {
      await redis.set(key, value, { ex: ttl });
    } catch (error) {
      logger.warn({ err: error, key }, 'Cache set failed');
    }
  },

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.warn({ err: error, key }, 'Cache delete failed');
    }
  },

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.warn({ err: error, pattern }, 'Cache delete pattern failed');
    }
  },

  /**
   * Get or fetch: return cached value or execute fetcher and cache result
   */
  async wrap<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 3600
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();

    // Cache it (don't await to not block response)
    this.set(key, fresh, ttl);

    return fresh;
  },

  /**
   * Increment a counter (for rate limiting, view counts, etc.)
   */
  async increment(key: string, ttl?: number): Promise<number> {
    try {
      const value = await redis.incr(key);
      if (ttl && value === 1) {
        await redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      logger.warn({ err: error, key }, 'Cache increment failed');
      return 0;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      return false;
    }
  },
};
```

## Cache Key Patterns

```typescript
// src/lib/cache/keys.ts

/**
 * Centralized cache key generation
 * Use consistent patterns to make invalidation easier
 */
export const cacheKeys = {
  // User-related
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  userProfile: (id: string) => `user:${id}:profile`,

  // Student-related
  student: (id: string) => `student:${id}`,
  studentsList: () => 'students:list',
  studentsByTier: (tier: string) => `students:tier:${tier}`,

  // Course-related
  course: (id: string) => `course:${id}`,
  coursesList: () => 'courses:list',
  courseBySlug: (slug: string) => `course:slug:${slug}`,

  // Session-related
  session: (id: string) => `session:${id}`,
  sessionsByUser: (userId: string) => `sessions:user:${userId}`,

  // Reference data (longer TTL)
  services: () => 'ref:services',
  categories: () => 'ref:categories',
  holidays: () => 'ref:holidays',

  // Patterns for bulk invalidation
  patterns: {
    user: (id: string) => `user:${id}:*`,
    allStudents: () => 'students:*',
    allCourses: () => 'courses:*',
  },
};
```

## Usage in Repository

```typescript
// src/lib/repositories/StudentRepository.ts

import { cache } from '@/lib/cache';
import { cacheKeys } from '@/lib/cache/keys';

export class StudentRepository {
  async findById(id: string): Promise<Student | null> {
    return cache.wrap(
      cacheKeys.student(id),
      async () => {
        const { data } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
        return data;
      },
      3600 // 1 hour
    );
  }

  async findAll(): Promise<Student[]> {
    return cache.wrap(
      cacheKeys.studentsList(),
      async () => {
        const { data } = await this.supabase
          .from('users')
          .select('*')
          .eq('role', 'student');
        return data || [];
      },
      300 // 5 minutes (list changes more often)
    );
  }

  async update(id: string, updates: Partial<Student>): Promise<Student> {
    const { data } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    // Invalidate related caches
    await cache.delete(cacheKeys.student(id));
    await cache.delete(cacheKeys.studentsList());

    return data;
  }

  async delete(id: string): Promise<void> {
    await this.supabase.from('users').delete().eq('id', id);

    // Invalidate all related caches
    await cache.deletePattern(cacheKeys.patterns.user(id));
    await cache.delete(cacheKeys.studentsList());
  }
}
```

## Cache Decorator Pattern

```typescript
// src/lib/cache/decorators.ts

import { cache } from '@/lib/cache';

/**
 * Method decorator for automatic caching
 * Usage: @cached('user', 3600)
 */
export function cached(keyPrefix: string, ttl = 3600) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${keyPrefix}:${args.join(':')}`;

      return cache.wrap(cacheKey, () => originalMethod.apply(this, args), ttl);
    };

    return descriptor;
  };
}

// Usage in class
class UserService {
  @cached('user', 3600)
  async getUserById(id: string): Promise<User> {
    // This will be cached automatically
    return await db.users.findById(id);
  }
}
```

## Cache Warming

```typescript
// scripts/warm-cache.ts

import { cache } from '@/lib/cache';
import { cacheKeys } from '@/lib/cache/keys';
import { supabase } from '@/lib/supabase';

/**
 * Warm the cache with frequently accessed data
 * Run this on deploy or via cron job
 */
async function warmCache() {
  console.log('Warming cache...');

  // Cache all services
  const { data: services } = await supabase.from('services').select('*');
  if (services) {
    await cache.set(cacheKeys.services(), services, 86400); // 24 hours
    console.log(`Cached ${services.length} services`);
  }

  // Cache all categories
  const { data: categories } = await supabase.from('template_categories').select('*');
  if (categories) {
    await cache.set(cacheKeys.categories(), categories, 86400);
    console.log(`Cached ${categories.length} categories`);
  }

  // Cache holidays
  const { data: holidays } = await supabase.from('federal_holidays').select('*');
  if (holidays) {
    await cache.set(cacheKeys.holidays(), holidays, 86400);
    console.log(`Cached ${holidays.length} holidays`);
  }

  console.log('Cache warming complete!');
}

warmCache().catch(console.error);
```

## TTL Guidelines

| Data Type | TTL | Reason |
|-----------|-----|--------|
| User profile | 1 hour | Changes occasionally |
| User list | 5 minutes | Changes frequently |
| Reference data (services, categories) | 24 hours | Rarely changes |
| Session data | 30 minutes | Matches session duration |
| Rate limit counters | 1 hour | Rolling window |
| Search results | 5 minutes | Balance freshness vs performance |

## When to Use

**Use Caching when:**
- Data is read frequently but changes rarely
- Database queries are expensive
- Same data is requested by multiple users
- API responses are slow

**Don't use when:**
- Data must always be real-time
- Data is unique per request
- Cache storage cost exceeds benefit

## Benefits

1. **Performance:** Faster response times
2. **Cost Reduction:** Fewer database queries
3. **Scalability:** Handle more traffic
4. **Reliability:** Serve stale data if DB is down

## Related Patterns

- **Repository Pattern** - Integrate caching in data layer
- **Static Generation** - For truly static content
- **Rate Limiting** - Uses same Redis infrastructure
