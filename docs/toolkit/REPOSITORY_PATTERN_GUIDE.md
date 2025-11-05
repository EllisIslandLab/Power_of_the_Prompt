# Repository Pattern Implementation Guide

## Overview

The Repository Pattern is a design pattern that abstracts data access logic and provides a centralized way to manage data operations. Think of it as a "translator" between your business logic and your database - it keeps them separate and makes your code more maintainable.

**Time to Implement:** 8-12 hours (from scratch) → **30 minutes** (with toolkit command)

**Difficulty:** Intermediate

---

## Table of Contents

1. [When to Use This Pattern](#when-to-use-this-pattern)
2. [Benefits](#benefits)
3. [Prerequisites](#prerequisites)
4. [Implementation Steps](#implementation-steps)
5. [Code Examples](#code-examples)
6. [Testing Your Implementation](#testing-your-implementation)
7. [Common Pitfalls](#common-pitfalls)
8. [Advanced Features](#advanced-features)

---

## When to Use This Pattern

### ✅ Use Repository Pattern When:

- **You have multiple data sources** (Airtable, Supabase, PostgreSQL, etc.)
- **You want to switch databases** without rewriting business logic
- **Your app has complex queries** that are repeated in multiple places
- **You need to mock database calls** for testing
- **You want centralized data access logic** instead of scattered queries
- **You're building an app** that will grow in complexity

### ❌ Don't Use Repository Pattern When:

- **You have a tiny app** with 1-2 database tables and simple CRUD
- **You're building a quick prototype** where speed matters more than architecture
- **Your queries are simple** and only used once (might be over-engineering)

---

## Benefits

### 1. Database Independence

```typescript
// Business logic doesn't care about the database
class UserService {
  constructor(private userRepo: IUserRepository) {}

  async registerUser(email: string) {
    // Works with Supabase, Airtable, PostgreSQL, anything!
    return await this.userRepo.create({ email })
  }
}
```

### 2. Centralized Query Logic

**Before (Scattered Queries):**
```typescript
// In signup route
const { data } = await supabase.from('users').select('*').eq('email', email).single()

// In signin route
const { data } = await supabase.from('users').select('*').eq('email', email).single()

// In profile route
const { data } = await supabase.from('users').select('*').eq('email', email).single()
```

**After (Centralized Repository):**
```typescript
// Everywhere
const user = await userRepo.findByEmail(email)
```

### 3. Easy Testing

```typescript
// Create a mock repository for tests
class MockUserRepository implements IUserRepository {
  async findByEmail(email: string) {
    return { id: '123', email, tier: 'pro' }
  }
}

// Test your service without touching the database
const service = new UserService(new MockUserRepository())
```

### 4. Performance Monitoring

```typescript
// BaseRepository automatically logs query performance
class BaseRepository {
  async findById(id: string) {
    const start = Date.now()
    const result = await this.db.query(...)
    logger.info({ duration: Date.now() - start }, 'Query completed')
    return result
  }
}
```

---

## Prerequisites

Before implementing the Repository Pattern, ensure you have:

- ✅ TypeScript configured in your project
- ✅ A database client (Supabase, Prisma, etc.)
- ✅ Basic understanding of async/await
- ✅ Familiarity with TypeScript interfaces

**Optional but recommended:**
- Logger configured (see [Logging Guide](../LOGGING_GUIDE.md))
- Error handling setup (see [Error Handling Guide](../ERROR_HANDLING_IMPROVEMENTS.md))

---

## Implementation Steps

### Step 1: Run the Toolkit Command

```bash
cd your-project
claude "create repository pattern with TypeScript interfaces for Airtable and Supabase, include example CRUD operations"
```

This generates:
- `src/repositories/BaseRepository.ts` - Abstract base class
- `src/repositories/UserRepository.ts` - Example implementation
- `src/repositories/index.ts` - Central exports

### Step 2: Review the Generated Code

Open `src/repositories/BaseRepository.ts` and understand the structure:

```typescript
export abstract class BaseRepository<T> {
  constructor(protected db: SupabaseClient) {}

  // Common CRUD operations
  abstract tableName: string

  async findById(id: string): Promise<T | null>
  async findOne(filters: object): Promise<T | null>
  async findMany(filters?: object): Promise<T[]>
  async create(data: Partial<T>): Promise<T>
  async update(id: string, data: Partial<T>): Promise<T>
  async delete(id: string): Promise<boolean>
}
```

### Step 3: Create Your First Repository

Create a repository for your main data model. Example with Users:

```typescript
// src/repositories/UserRepository.ts
import { BaseRepository } from './BaseRepository'
import { SupabaseClient } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  full_name: string
  tier: 'free' | 'pro' | 'expert'
  created_at: string
}

export class UserRepository extends BaseRepository<User> {
  tableName = 'users'

  constructor(db: SupabaseClient) {
    super(db)
  }

  // Custom query methods
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email })
  }

  async findByTier(tier: string): Promise<User[]> {
    return this.findMany({ tier })
  }

  async updateTier(userId: string, tier: string): Promise<User> {
    return this.update(userId, { tier })
  }
}
```

### Step 4: Update Your Routes to Use Repositories

**Before (Direct Database Access):**
```typescript
// app/api/users/route.ts
export async function GET(request: Request) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('tier', 'pro')

  if (error) throw error
  return Response.json(data)
}
```

**After (Repository Pattern):**
```typescript
// app/api/users/route.ts
import { UserRepository } from '@/repositories'
import { createClient } from '@/lib/supabase'

export async function GET(request: Request) {
  const supabase = createClient()
  const userRepo = new UserRepository(supabase)

  const users = await userRepo.findByTier('pro')
  return Response.json(users)
}
```

### Step 5: Create Repositories for All Main Tables

Repeat for your other tables:

```typescript
// src/repositories/LeadRepository.ts
export class LeadRepository extends BaseRepository<Lead> {
  tableName = 'leads'

  async findByEmail(email: string): Promise<Lead | null>
  async findByStatus(status: string): Promise<Lead[]>
  async markAsConverted(id: string): Promise<Lead>
}

// src/repositories/ProductRepository.ts
export class ProductRepository extends BaseRepository<Product> {
  tableName = 'products'

  async findBySlug(slug: string): Promise<Product | null>
  async findActive(): Promise<Product[]>
}
```

### Step 6: Export All Repositories

```typescript
// src/repositories/index.ts
export { BaseRepository } from './BaseRepository'
export { UserRepository } from './UserRepository'
export { LeadRepository } from './LeadRepository'
export { ProductRepository } from './ProductRepository'
```

Now you can import anywhere:
```typescript
import { UserRepository, LeadRepository } from '@/repositories'
```

---

## Code Examples

### Example 1: Simple CRUD Operations

```typescript
import { UserRepository } from '@/repositories'
import { createClient } from '@/lib/supabase'

const supabase = createClient()
const userRepo = new UserRepository(supabase)

// Create
const newUser = await userRepo.create({
  email: '[email protected]',
  full_name: 'John Doe',
  tier: 'free'
})

// Read
const user = await userRepo.findById('user-id-123')
const johnDoe = await userRepo.findByEmail('[email protected]')
const proUsers = await userRepo.findByTier('pro')

// Update
await userRepo.updateTier('user-id-123', 'pro')

// Delete
await userRepo.delete('user-id-123')
```

### Example 2: Complex Query

```typescript
// Add to UserRepository
async findRecentPaidUsers(limit: number = 10): Promise<User[]> {
  const { data, error } = await this.db
    .from(this.tableName)
    .select('*')
    .in('tier', ['pro', 'expert'])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    logger.error({ error }, `Failed to fetch recent paid users`)
    throw error
  }

  return data
}

// Usage
const recentPaidUsers = await userRepo.findRecentPaidUsers(20)
```

### Example 3: Transaction-Like Operations

```typescript
// Add to UserRepository
async upgradeUserToPro(userId: string, paymentId: string): Promise<User> {
  // Update multiple fields atomically
  return this.update(userId, {
    tier: 'pro',
    payment_status: 'paid',
    payment_id: paymentId,
    upgraded_at: new Date().toISOString()
  })
}

// Usage
const upgradedUser = await userRepo.upgradeUserToPro('user-123', 'payment-456')
```

### Example 4: Joining Data (Relationships)

```typescript
// Add to UserRepository
async findWithPurchases(userId: string) {
  const { data, error } = await this.db
    .from(this.tableName)
    .select(`
      *,
      purchases (
        id,
        product_id,
        amount_paid,
        created_at
      )
    `)
    .eq('id', userId)
    .single()

  if (error) {
    logger.error({ error, userId }, 'Failed to fetch user with purchases')
    throw error
  }

  return data
}

// Usage
const userWithPurchases = await userRepo.findWithPurchases('user-123')
console.log(userWithPurchases.purchases) // Array of purchases
```

---

## Testing Your Implementation

### Unit Tests

```typescript
// __tests__/repositories/UserRepository.test.ts
import { UserRepository } from '@/repositories'

describe('UserRepository', () => {
  let repo: UserRepository
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: '123', email: '[email protected]' },
        error: null
      })
    }

    repo = new UserRepository(mockSupabase)
  })

  it('should find user by email', async () => {
    const user = await repo.findByEmail('[email protected]')

    expect(user).toBeDefined()
    expect(user?.email).toBe('[email protected]')
    expect(mockSupabase.from).toHaveBeenCalledWith('users')
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/repositories.test.ts
import { UserRepository } from '@/repositories'
import { createClient } from '@/lib/supabase'

describe('UserRepository Integration', () => {
  let repo: UserRepository

  beforeAll(() => {
    const supabase = createClient() // Use test database
    repo = new UserRepository(supabase)
  })

  it('should create and find user', async () => {
    // Create
    const newUser = await repo.create({
      email: '[email protected]',
      full_name: 'Test User'
    })

    expect(newUser.id).toBeDefined()

    // Find
    const foundUser = await repo.findById(newUser.id)
    expect(foundUser?.email).toBe('[email protected]')

    // Cleanup
    await repo.delete(newUser.id)
  })
})
```

---

## Common Pitfalls

### 1. Creating Repository Instance on Every Call

❌ **Wrong:**
```typescript
export async function GET() {
  const repo = new UserRepository(createClient()) // New instance every time
  return repo.findAll()
}
```

✅ **Better:**
```typescript
// Create factory or singleton
export function createUserRepository() {
  return new UserRepository(createClient())
}

export async function GET() {
  const repo = createUserRepository()
  return repo.findAll()
}
```

### 2. Putting Business Logic in Repositories

❌ **Wrong:**
```typescript
// UserRepository
async registerUser(email: string, password: string) {
  // ❌ Business logic in repository
  const hashedPassword = await bcrypt.hash(password, 10)
  await this.sendWelcomeEmail(email)
  return this.create({ email, password: hashedPassword })
}
```

✅ **Better:**
```typescript
// UserService (business logic)
async registerUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await this.userRepo.create({ email, password: hashedPassword })
  await this.emailService.sendWelcome(email)
  return user
}

// UserRepository (data access only)
async create(data: Partial<User>) {
  return this.create(data)
}
```

### 3. Not Handling Errors

❌ **Wrong:**
```typescript
async findByEmail(email: string) {
  const { data } = await this.db.from('users').select('*').eq('email', email).single()
  return data // ❌ Ignoring error
}
```

✅ **Better:**
```typescript
async findByEmail(email: string) {
  const { data, error } = await this.db
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    logger.error({ error, email }, 'Failed to find user by email')
    throw new Error(`Failed to find user: ${error.message}`)
  }

  return data
}
```

---

## Advanced Features

### 1. Caching Layer

Add caching to BaseRepository:

```typescript
import { CacheService } from '@/lib/cache'

export abstract class BaseRepository<T> {
  protected cache = CacheService.getInstance()

  async findById(id: string): Promise<T | null> {
    // Check cache first
    const cacheKey = `${this.tableName}:${id}`
    const cached = await this.cache.get<T>(cacheKey)
    if (cached) return cached

    // Query database
    const result = await this.db.from(this.tableName).select('*').eq('id', id).single()

    // Cache result
    if (result.data) {
      await this.cache.set(cacheKey, result.data, 300) // 5 min TTL
    }

    return result.data
  }
}
```

### 2. Query Builder

Add a fluent query interface:

```typescript
class UserRepository extends BaseRepository<User> {
  query() {
    return new UserQueryBuilder(this.db, this.tableName)
  }
}

class UserQueryBuilder {
  private query: any

  constructor(private db: SupabaseClient, private tableName: string) {
    this.query = db.from(tableName).select('*')
  }

  whereTier(tier: string) {
    this.query = this.query.eq('tier', tier)
    return this
  }

  whereCreatedAfter(date: string) {
    this.query = this.query.gte('created_at', date)
    return this
  }

  async execute() {
    const { data, error } = await this.query
    if (error) throw error
    return data
  }
}

// Usage
const proUsers = await userRepo
  .query()
  .whereTier('pro')
  .whereCreatedAfter('2024-01-01')
  .execute()
```

### 3. Event Hooks

Add lifecycle hooks:

```typescript
export abstract class BaseRepository<T> {
  protected async beforeCreate(data: Partial<T>) {
    // Override in subclasses
    return data
  }

  protected async afterCreate(entity: T) {
    // Override in subclasses
  }

  async create(data: Partial<T>): Promise<T> {
    const processedData = await this.beforeCreate(data)
    const result = await this.db.from(this.tableName).insert(processedData).select().single()
    await this.afterCreate(result.data)
    return result.data
  }
}

// In UserRepository
protected async afterCreate(user: User) {
  logger.info({ userId: user.id }, 'New user created')
  await this.cache.invalidate(`users:*`)
}
```

---

## Next Steps

1. ✅ Implement BaseRepository
2. ✅ Create repositories for your main tables
3. ✅ Update your routes to use repositories
4. 📝 Write tests for your repositories
5. 🚀 Add caching layer (optional)
6. 📊 Monitor query performance

**Related Patterns:**
- [Adapter Pattern](./ADAPTER_PATTERN_GUIDE.md) - For external services
- [Caching Layer](./CACHING_GUIDE.md) - Add caching to repositories
- [Logging Setup](../LOGGING_GUIDE.md) - Monitor repository performance

---

**Need help?** Check the [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) for the recommended implementation order.
