# Design Pattern Reference Guide

This document provides detailed implementation guidance for design patterns used in the Web Launch Academy codebase.

## Table of Contents

1. [Data Architecture](#data-architecture)
2. [Service Integration](#service-integration)
3. [Code Organization](#code-organization)
4. [Request Handling](#request-handling)
5. [Object Creation](#object-creation)
6. [State & Events](#state--events)
7. [Performance Optimization](#performance-optimization)
8. [Type Safety](#type-safety)
9. [Testing & Quality](#testing--quality)

---

## Data Architecture

### Repository Pattern

**When to use:** Any time you need to interact with Supabase or Airtable.

**Structure:**
```typescript
// src/lib/repositories/StudentRepository.ts

import { createClient } from '@/lib/supabase';
import { cache } from '@/lib/cache';
import type { Database } from '@/types/database';

type Student = Database['public']['Tables']['users']['Row'];

export class StudentRepository {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  async findById(id: string): Promise<Student | null> {
    const cacheKey = `student:${id}`;

    // Check cache first
    const cached = await cache.get<Student>(cacheKey);
    if (cached) return cached;

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (data) {
      await cache.set(cacheKey, data, 3600);
    }

    return data;
  }

  async findByEmail(email: string): Promise<Student | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async create(studentData: Partial<Student>): Promise<Student> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(studentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<Student>): Promise<Student> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await cache.delete(`student:${id}`);

    return data;
  }
}
```

**Benefits:**
- One place to change data access logic
- Easy to swap databases
- Testable with mock data sources
- Built-in caching support

---

### Adapter Pattern

**When to use:** Working with multiple databases or external APIs.

**Structure:**
```typescript
// src/lib/adapters/DataSourceAdapter.ts

interface DataSourceAdapter {
  findOne<T>(table: string, filters: Record<string, unknown>): Promise<T | null>;
  findMany<T>(table: string, filters?: Record<string, unknown>): Promise<T[]>;
  create<T>(table: string, data: Partial<T>): Promise<T>;
  update<T>(table: string, id: string, updates: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<boolean>;
}

// src/lib/adapters/SupabaseAdapter.ts
export class SupabaseAdapter implements DataSourceAdapter {
  private client;

  constructor() {
    this.client = createClient();
  }

  async findOne<T>(table: string, filters: Record<string, unknown>): Promise<T | null> {
    let query = this.client.from(table).select('*');

    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    const { data, error } = await query.single();
    if (error) return null;
    return data as T;
  }

  // ... other methods
}

// src/lib/adapters/AirtableAdapter.ts
export class AirtableAdapter implements DataSourceAdapter {
  private base;

  constructor() {
    this.base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID!);
  }

  async findOne<T>(table: string, filters: Record<string, unknown>): Promise<T | null> {
    // Airtable-specific implementation
  }

  // ... other methods
}

// Usage - swap adapters without changing repository code
const repository = new StudentRepository(new SupabaseAdapter());
// Or: new StudentRepository(new AirtableAdapter());
```

---

### Data Caching Layer

**When to use:** Data that's fetched frequently but changes rarely.

**Structure:**
```typescript
// src/lib/cache.ts (already exists - reference pattern)

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    return redis.get(key);
  },

  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    await redis.set(key, value, { ex: ttl });
  },

  async delete(key: string): Promise<void> {
    await redis.del(key);
  },

  async wrap<T>(key: string, fetcher: () => Promise<T>, ttl = 3600): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttl);
    return fresh;
  },
};

// Usage in repository
async findById(id: string) {
  return cache.wrap(
    `student:${id}`,
    () => this.source.findOne('users', { id }),
    3600 // Cache for 1 hour
  );
}
```

---

### Query Builder System

**When to use:** Complex database queries with multiple filters.

**Structure:**
```typescript
// src/lib/query/QueryBuilder.ts

export class QueryBuilder<T> {
  private table: string;
  private filters: Array<{ field: string; operator: string; value: unknown }> = [];
  private sorts: Array<{ field: string; direction: 'asc' | 'desc' }> = [];
  private limitValue?: number;
  private offsetValue?: number;

  constructor(table: string) {
    this.table = table;
  }

  where(field: string, operator: string, value: unknown): this {
    this.filters.push({ field, operator, value });
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.sorts.push({ field, direction });
    return this;
  }

  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  offset(count: number): this {
    this.offsetValue = count;
    return this;
  }

  build() {
    return {
      table: this.table,
      filters: this.filters,
      sorts: this.sorts,
      limit: this.limitValue,
      offset: this.offsetValue,
    };
  }
}

// Usage
const query = new QueryBuilder('users')
  .where('role', '=', 'student')
  .where('tier', 'in', ['premium', 'vip'])
  .orderBy('created_at', 'desc')
  .limit(20)
  .build();
```

---

## Service Integration

### Multi-Service Factory

**When to use:** Need to create different service instances based on type.

**Structure:**
```typescript
// src/lib/factories/ServiceFactory.ts

import { Resend } from 'resend';
import Stripe from 'stripe';

type ServiceType = 'email' | 'payment' | 'storage';

interface ServiceConfig {
  email?: { apiKey: string };
  payment?: { apiKey: string };
  storage?: { bucket: string };
}

export class ServiceFactory {
  static create(type: 'email', config?: ServiceConfig['email']): Resend;
  static create(type: 'payment', config?: ServiceConfig['payment']): Stripe;
  static create(type: ServiceType, config?: ServiceConfig[ServiceType]) {
    switch (type) {
      case 'email':
        return new Resend(config?.apiKey || process.env.RESEND_API_KEY);

      case 'payment':
        return new Stripe(config?.apiKey || process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2023-10-16',
        });

      default:
        throw new Error(`Unknown service type: ${type}`);
    }
  }
}

// Usage
const emailService = ServiceFactory.create('email');
const stripeService = ServiceFactory.create('payment');
```

---

### Webhook Handler Framework

**When to use:** Receiving webhooks from Stripe, Airtable, etc.

**Structure:**
```typescript
// src/lib/webhooks/WebhookHandler.ts

type WebhookEventHandler<T = unknown> = (data: T) => Promise<void>;

export class WebhookHandler {
  private handlers = new Map<string, WebhookEventHandler>();

  register<T>(event: string, handler: WebhookEventHandler<T>): void {
    this.handlers.set(event, handler as WebhookEventHandler);
  }

  async handle(event: string, data: unknown): Promise<void> {
    const handler = this.handlers.get(event);

    if (!handler) {
      console.warn(`No handler for webhook event: ${event}`);
      return;
    }

    try {
      await handler(data);
    } catch (error) {
      console.error(`Webhook handler error for ${event}:`, error);
      throw error;
    }
  }
}

// src/app/api/stripe/webhook/route.ts
import { WebhookHandler } from '@/lib/webhooks/WebhookHandler';
import Stripe from 'stripe';

const webhookHandler = new WebhookHandler();

webhookHandler.register('checkout.session.completed', async (session: Stripe.Checkout.Session) => {
  // Handle successful payment
  await updateUserPaymentStatus(session.customer as string, 'paid');
});

webhookHandler.register('customer.subscription.updated', async (subscription: Stripe.Subscription) => {
  // Handle subscription update
  await updateUserTier(subscription.customer as string, subscription.items.data[0].price.id);
});

export async function POST(request: Request) {
  const event = await verifyStripeWebhook(request);
  await webhookHandler.handle(event.type, event.data.object);
  return Response.json({ received: true });
}
```

---

## Code Organization

### Dependency Injection

**When to use:** Services that depend on other services.

**Structure:**
```typescript
// Bad - hardcoded dependencies
class UserService {
  private email = new EmailService(); // Hardcoded!
  private db = new Database(); // Can't test!
}

// Good - injected dependencies
class UserService {
  constructor(
    private email: EmailService,
    private db: Database
  ) {}

  async createUser(userData: CreateUserInput) {
    const user = await this.db.create('users', userData);
    await this.email.sendWelcome(user.email);
    return user;
  }
}

// Usage in production
const userService = new UserService(
  new EmailService(),
  new Database()
);

// Usage in tests
const userService = new UserService(
  new MockEmailService(),
  new MockDatabase()
);
```

---

### Service Container

**When to use:** Managing multiple services with dependencies.

**Structure:**
```typescript
// src/lib/container/ServiceContainer.ts

type Factory<T> = (container: ServiceContainer) => T;

export class ServiceContainer {
  private services = new Map<string, unknown>();
  private factories = new Map<string, Factory<unknown>>();

  register<T>(name: string, factory: Factory<T>): void {
    this.factories.set(name, factory);
  }

  get<T>(name: string): T {
    if (this.services.has(name)) {
      return this.services.get(name) as T;
    }

    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Service not registered: ${name}`);
    }

    const service = factory(this);
    this.services.set(name, service);
    return service as T;
  }
}

// src/lib/container/services.ts
export const container = new ServiceContainer();

container.register('email', () => new EmailService());
container.register('database', () => new DatabaseService());
container.register('user', (c) => new UserService(
  c.get('email'),
  c.get('database')
));

// Usage
const userService = container.get<UserService>('user');
```

---

## Request Handling

### Middleware Stack

**When to use:** Repeated logic needed across API routes (auth, validation, logging).

**Structure:**
```typescript
// src/lib/middleware/auth.ts
import { createClient } from '@/lib/supabase';

export async function authMiddleware(request: Request): Promise<Response | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Attach user to request for later use
  (request as any).user = user;
  return null; // No error, continue
}

// src/lib/middleware/validation.ts
import { ZodSchema } from 'zod';

export function validationMiddleware<T>(schema: ZodSchema<T>) {
  return async (request: Request): Promise<Response | null> => {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    (request as any).validatedData = result.data;
    return null;
  };
}

// src/lib/middleware/stack.ts
type Middleware = (request: Request) => Promise<Response | null>;

export async function runMiddleware(
  request: Request,
  middlewares: Middleware[]
): Promise<Response | null> {
  for (const middleware of middlewares) {
    const result = await middleware(request);
    if (result) return result; // Error response
  }
  return null; // All passed
}

// Usage in API route
import { authMiddleware } from '@/lib/middleware/auth';
import { validationMiddleware } from '@/lib/middleware/validation';
import { runMiddleware } from '@/lib/middleware/stack';
import { createStudentSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const error = await runMiddleware(request, [
    authMiddleware,
    validationMiddleware(createStudentSchema),
  ]);

  if (error) return error;

  const data = (request as any).validatedData;
  const student = await createStudent(data);
  return Response.json(student);
}
```

---

### Rate Limiting

**When to use:** All public API routes.

**This project already has rate limiting configured in `src/lib/rate-limiter.ts`:**

```typescript
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  // Check rate limit first
  const { success, headers } = await checkRateLimit(request, 'auth'); // 'auth' | 'api' | 'strict'

  if (!success) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers }
    );
  }

  // Continue with request...
}
```

---

### Error Handling Framework

**When to use:** Every API route and async operation.

**Structure:**
```typescript
// src/lib/errors/AppError.ts

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

// src/lib/errors/errorHandler.ts
import { logger } from '@/lib/logger';

export function handleError(error: unknown): Response {
  if (error instanceof AppError && error.isOperational) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Log unexpected errors
  logger.error({ err: error }, 'Unexpected error');

  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Usage
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const student = await studentRepository.findById(params.id);
    if (!student) {
      throw new NotFoundError('Student');
    }
    return Response.json(student);
  } catch (error) {
    return handleError(error);
  }
}
```

---

## Performance Optimization

### Static Data Generation

**When to use:** Content that rarely changes (course catalog, service pages).

**Structure:**
```typescript
// src/app/courses/[slug]/page.tsx

// This runs at BUILD TIME, not on every request
export async function generateStaticParams() {
  const courses = await fetchCourses();

  return courses.map((course) => ({
    slug: course.slug,
  }));
}

// This ALSO runs at build time
export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await fetchCourseBySlug(params.slug);

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
    </div>
  );
}

// Optional: Regenerate every hour
export const revalidate = 3600;
```

---

### Data Snapshot System

**When to use:** Reference data (categories, pricing tiers, countries).

**Structure:**
```typescript
// scripts/generate-snapshots.ts
import fs from 'fs';
import { fetchFromSupabase } from '../src/lib/supabase';

async function generateSnapshots() {
  const services = await fetchFromSupabase('services');
  const categories = await fetchFromSupabase('template_categories');

  fs.writeFileSync(
    'src/data/services.json',
    JSON.stringify(services, null, 2)
  );

  fs.writeFileSync(
    'src/data/categories.json',
    JSON.stringify(categories, null, 2)
  );

  console.log('Snapshots generated!');
}

generateSnapshots();

// package.json
{
  "scripts": {
    "generate-data": "tsx scripts/generate-snapshots.ts",
    "build": "npm run generate-data && next build"
  }
}

// Usage in your app - NO API call needed
import services from '@/data/services.json';
```

---

## Quick Reference

| When Claude detects... | Suggest pattern... |
|------------------------|-------------------|
| Direct DB calls in components | Repository Pattern |
| Multiple service types | Factory Pattern |
| Repeated auth/validation code | Middleware Stack |
| Complex object construction | Builder Pattern |
| Tightly coupled features | Event-Driven Architecture |
| Slow data fetching | Caching Layer or Static Generation |
| Missing input validation | Zod Schema Library |
| No error handling | Error Handling Framework |
| Hard to test code | Dependency Injection |
| Expensive re-renders | Memoization Strategy |

---

## Related Documentation

- See `.claudeconfig/templates/` for implementation templates
- See `.claudeconfig/diagnostics.md` for pattern detection rules
- See `src/lib/schemas.ts` for existing validation schemas
- See `src/lib/rate-limiter.ts` for rate limiting implementation
