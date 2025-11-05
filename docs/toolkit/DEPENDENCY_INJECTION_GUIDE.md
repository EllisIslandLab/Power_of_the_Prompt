# Dependency Injection Implementation Guide

## Overview

Dependency Injection (DI) is a design pattern where objects receive their dependencies from external sources rather than creating them internally. Think of it as a "waiter service" - instead of going to the kitchen yourself to get each ingredient, the waiter brings you everything you need.

**Time to Implement:** 10-14 hours (from scratch) → **45 minutes** (with toolkit command)

**Difficulty:** Intermediate

---

## Table of Contents

1. [When to Use This Pattern](#when-to-use-this-pattern)
2. [Benefits](#benefits)
3. [Prerequisites](#prerequisites)
4. [Implementation Steps](#implementation-steps)
5. [Code Examples](#code-examples)
6. [Testing with DI](#testing-with-di)
7. [Common Pitfalls](#common-pitfalls)
8. [Advanced Features](#advanced-features)

---

## When to Use This Pattern

### ✅ Use Dependency Injection When:

- **You want testable code** - Mock dependencies easily in tests
- **You have complex service dependencies** - UserService needs EmailService, PaymentService, etc.
- **You want to swap implementations** - Use MockEmailService in dev, SendGridService in production
- **You're building a large application** - Managing dependencies manually becomes painful
- **You want loose coupling** - Services don't create their own dependencies

### ❌ Don't Use DI When:

- **You have a tiny app** - 1-2 files, simple logic (over-engineering)
- **Dependencies are simple** - Just importing a utility function is fine
- **You're prototyping quickly** - DI adds initial setup time

---

## Benefits

### 1. Testability

**Without DI:**
```typescript
class UserService {
  async registerUser(email: string) {
    // ❌ Hard to test - creates real dependencies
    const emailService = new SendGridService()
    await emailService.send(email, 'Welcome!')
  }
}

// Test requires real SendGrid API calls 😱
```

**With DI:**
```typescript
class UserService {
  constructor(private emailService: IEmailService) {}

  async registerUser(email: string) {
    // ✅ Easy to test - dependencies injected
    await this.emailService.send(email, 'Welcome!')
  }
}

// Test with mock - no API calls needed! 🎉
const service = new UserService(new MockEmailService())
```

### 2. Flexibility

Swap implementations without changing code:

```typescript
// Development - log emails to console
const emailService = new ConsoleEmailService()

// Production - use SendGrid
const emailService = new SendGridService()

// Testing - use mock
const emailService = new MockEmailService()

// Same service, different implementations!
const userService = new UserService(emailService)
```

### 3. Single Responsibility

Services focus on their job, not on creating dependencies:

```typescript
// ❌ Without DI - too many responsibilities
class PaymentService {
  processPayment(amount: number) {
    const stripe = new Stripe(process.env.STRIPE_KEY!) // Creating dependency
    const logger = new Logger() // Creating dependency
    const emailService = new EmailService() // Creating dependency
    // ... process payment
  }
}

// ✅ With DI - single responsibility
class PaymentService {
  constructor(
    private stripe: IStripeAdapter,
    private logger: ILogger,
    private emailService: IEmailService
  ) {}

  processPayment(amount: number) {
    // Just process the payment!
  }
}
```

### 4. Configuration Management

Configure once, use everywhere:

```typescript
// Configure services at startup
const container = new DIContainer()
container.register('stripeKey', process.env.STRIPE_KEY)
container.register('emailFrom', '[email protected]')

// All services get correct configuration automatically
const paymentService = container.resolve<PaymentService>('PaymentService')
```

---

## Prerequisites

Before implementing Dependency Injection:

- ✅ TypeScript configured
- ✅ Understanding of interfaces
- ✅ Familiarity with async/await
- ✅ Basic OOP concepts (classes, constructors)

**Optional but recommended:**
- Repository Pattern implemented (pairs well with DI)
- Adapter Pattern for external services

---

## Implementation Steps

### Step 1: Run the Toolkit Command

```bash
cd your-project
claude "create dependency injection container with TypeScript, include service registration and resolution with examples"
```

This generates:
- `src/di/DIContainer.ts` - Main container class
- `src/di/types.ts` - TypeScript interfaces
- `src/services/` - Example service implementations

### Step 2: Understand the Container Structure

```typescript
// src/di/DIContainer.ts
export class DIContainer {
  private services = new Map<string, any>()
  private singletons = new Map<string, any>()

  // Register a service
  register<T>(name: string, service: T | (() => T), singleton = false) {
    this.services.set(name, { factory: service, singleton })
  }

  // Resolve (get) a service
  resolve<T>(name: string): T {
    const registration = this.services.get(name)

    if (!registration) {
      throw new Error(`Service '${name}' not registered`)
    }

    // Return singleton if already created
    if (registration.singleton && this.singletons.has(name)) {
      return this.singletons.get(name)
    }

    // Create new instance
    const instance = typeof registration.factory === 'function'
      ? registration.factory()
      : registration.factory

    // Store singleton
    if (registration.singleton) {
      this.singletons.set(name, instance)
    }

    return instance
  }
}
```

### Step 3: Define Service Interfaces

Create interfaces for your services:

```typescript
// src/services/types.ts

export interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>
  sendBatch(emails: Array<{ to: string; subject: string; body: string }>): Promise<void>
}

export interface IPaymentService {
  createPaymentIntent(amount: number, currency: string): Promise<string>
  confirmPayment(paymentId: string): Promise<boolean>
}

export interface ILogger {
  info(message: string, meta?: object): void
  error(message: string, meta?: object): void
  debug(message: string, meta?: object): void
}
```

### Step 4: Implement Services with DI

```typescript
// src/services/UserService.ts
import { IEmailService, ILogger } from './types'
import { UserRepository } from '@/repositories'

export class UserService {
  constructor(
    private userRepo: UserRepository,
    private emailService: IEmailService,
    private logger: ILogger
  ) {}

  async registerUser(email: string, password: string) {
    this.logger.info('Registering user', { email })

    try {
      // Create user
      const user = await this.userRepo.create({
        email,
        password: await this.hashPassword(password),
        tier: 'free'
      })

      // Send welcome email
      await this.emailService.send(
        email,
        'Welcome!',
        'Thanks for signing up!'
      )

      this.logger.info('User registered successfully', { userId: user.id })
      return user

    } catch (error) {
      this.logger.error('Failed to register user', { email, error })
      throw error
    }
  }

  private async hashPassword(password: string): Promise<string> {
    // Hash logic here
    return password // Simplified
  }
}
```

### Step 5: Create the DI Configuration

```typescript
// src/di/container.ts
import { DIContainer } from './DIContainer'
import { UserService } from '@/services/UserService'
import { EmailService } from '@/services/EmailService'
import { Logger } from '@/lib/logger'
import { UserRepository } from '@/repositories'
import { createClient } from '@/lib/supabase'

export function createContainer(): DIContainer {
  const container = new DIContainer()

  // Register infrastructure (singletons)
  container.register('supabase', createClient(), true)
  container.register('logger', new Logger(), true)

  // Register repositories
  container.register('userRepository', () => {
    return new UserRepository(container.resolve('supabase'))
  })

  // Register services
  container.register('emailService', () => {
    return new EmailService(
      process.env.RESEND_API_KEY!,
      container.resolve('logger')
    )
  }, true)

  container.register('userService', () => {
    return new UserService(
      container.resolve('userRepository'),
      container.resolve('emailService'),
      container.resolve('logger')
    )
  })

  return container
}

// Create global container instance
export const container = createContainer()
```

### Step 6: Use DI in Your Routes

```typescript
// app/api/auth/signup/route.ts
import { container } from '@/di/container'
import { UserService } from '@/services/UserService'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Resolve service with all dependencies injected
  const userService = container.resolve<UserService>('userService')

  const user = await userService.registerUser(email, password)

  return Response.json({ success: true, user })
}
```

---

## Code Examples

### Example 1: Basic Service with Dependencies

```typescript
// src/services/PaymentService.ts
import { IStripeAdapter, ILogger, IEmailService } from './types'

export class PaymentService {
  constructor(
    private stripe: IStripeAdapter,
    private logger: ILogger,
    private emailService: IEmailService
  ) {}

  async processPayment(userId: string, amount: number) {
    this.logger.info('Processing payment', { userId, amount })

    try {
      // Create payment intent
      const paymentIntent = await this.stripe.createPaymentIntent(amount, 'usd')

      // Send confirmation email
      await this.emailService.send(
        userId,
        'Payment Received',
        `Your payment of $${amount} was successful!`
      )

      this.logger.info('Payment processed', { userId, paymentIntent })
      return paymentIntent

    } catch (error) {
      this.logger.error('Payment failed', { userId, amount, error })
      throw error
    }
  }
}

// Register in container
container.register('paymentService', () => {
  return new PaymentService(
    container.resolve('stripeAdapter'),
    container.resolve('logger'),
    container.resolve('emailService')
  )
})
```

### Example 2: Factory Pattern with DI

```typescript
// src/factories/ServiceFactory.ts
export class ServiceFactory {
  constructor(private container: DIContainer) {}

  createUserService(): UserService {
    return this.container.resolve<UserService>('userService')
  }

  createPaymentService(): PaymentService {
    return this.container.resolve<PaymentService>('paymentService')
  }

  createEmailService(): IEmailService {
    return this.container.resolve<IEmailService>('emailService')
  }
}

// Usage
const factory = new ServiceFactory(container)
const userService = factory.createUserService()
```

### Example 3: Conditional Registration (Environment-Based)

```typescript
// src/di/container.ts
export function createContainer(): DIContainer {
  const container = new DIContainer()

  // Different implementations based on environment
  if (process.env.NODE_ENV === 'production') {
    // Production - use real services
    container.register('emailService', () => {
      return new SendGridEmailService(process.env.SENDGRID_KEY!)
    }, true)

    container.register('paymentService', () => {
      return new StripePaymentService(process.env.STRIPE_KEY!)
    }, true)

  } else if (process.env.NODE_ENV === 'development') {
    // Development - log to console
    container.register('emailService', () => {
      return new ConsoleEmailService()
    }, true)

    container.register('paymentService', () => {
      return new MockPaymentService()
    }, true)

  } else {
    // Test - use mocks
    container.register('emailService', new MockEmailService(), true)
    container.register('paymentService', new MockPaymentService(), true)
  }

  return container
}
```

### Example 4: Nested Dependencies

```typescript
// EmailService depends on Logger and HttpClient
class EmailService implements IEmailService {
  constructor(
    private logger: ILogger,
    private httpClient: IHttpClient
  ) {}

  async send(to: string, subject: string, body: string) {
    this.logger.info('Sending email', { to, subject })
    await this.httpClient.post('/send', { to, subject, body })
  }
}

// UserService depends on EmailService (which has its own dependencies)
class UserService {
  constructor(
    private userRepo: UserRepository,
    private emailService: IEmailService // Already has logger and httpClient injected!
  ) {}
}

// Container handles nested dependencies automatically
container.register('logger', new Logger(), true)
container.register('httpClient', new HttpClient(), true)

container.register('emailService', () => {
  return new EmailService(
    container.resolve('logger'),
    container.resolve('httpClient')
  )
}, true)

container.register('userService', () => {
  return new UserService(
    container.resolve('userRepository'),
    container.resolve('emailService') // Nested dependencies resolved!
  )
})
```

---

## Testing with DI

### Creating Mock Services

```typescript
// __tests__/mocks/MockEmailService.ts
export class MockEmailService implements IEmailService {
  public sentEmails: Array<{ to: string; subject: string; body: string }> = []

  async send(to: string, subject: string, body: string) {
    this.sentEmails.push({ to, subject, body })
  }

  async sendBatch(emails: any[]) {
    this.sentEmails.push(...emails)
  }

  // Helper for assertions
  wasSentTo(email: string): boolean {
    return this.sentEmails.some(e => e.to === email)
  }

  getSentCount(): number {
    return this.sentEmails.length
  }

  reset() {
    this.sentEmails = []
  }
}
```

### Test Example

```typescript
// __tests__/services/UserService.test.ts
import { UserService } from '@/services/UserService'
import { MockEmailService } from '../mocks/MockEmailService'
import { MockLogger } from '../mocks/MockLogger'
import { MockUserRepository } from '../mocks/MockUserRepository'

describe('UserService', () => {
  let userService: UserService
  let mockEmailService: MockEmailService
  let mockLogger: MockLogger
  let mockUserRepo: MockUserRepository

  beforeEach(() => {
    // Create mocks
    mockEmailService = new MockEmailService()
    mockLogger = new MockLogger()
    mockUserRepo = new MockUserRepository()

    // Inject dependencies manually
    userService = new UserService(
      mockUserRepo,
      mockEmailService,
      mockLogger
    )
  })

  it('should register user and send welcome email', async () => {
    const email = '[email protected]'
    const password = 'password123'

    await userService.registerUser(email, password)

    // Assert email was sent
    expect(mockEmailService.wasSentTo(email)).toBe(true)
    expect(mockEmailService.getSentCount()).toBe(1)

    // Assert user was created
    expect(mockUserRepo.users.length).toBe(1)
    expect(mockUserRepo.users[0].email).toBe(email)

    // Assert logging happened
    expect(mockLogger.logs).toContain('Registering user')
  })

  it('should handle registration errors', async () => {
    // Simulate database error
    mockUserRepo.shouldFail = true

    await expect(
      userService.registerUser('[email protected]', 'pass')
    ).rejects.toThrow()

    // Email should NOT have been sent
    expect(mockEmailService.getSentCount()).toBe(0)

    // Error should be logged
    expect(mockLogger.errors).toContain('Failed to register user')
  })
})
```

### Test Container Setup

```typescript
// __tests__/setup/testContainer.ts
import { DIContainer } from '@/di/DIContainer'
import { MockEmailService } from '../mocks/MockEmailService'
import { MockLogger } from '../mocks/MockLogger'

export function createTestContainer(): DIContainer {
  const container = new DIContainer()

  // Register all mocks
  container.register('logger', new MockLogger(), true)
  container.register('emailService', new MockEmailService(), true)
  container.register('userRepository', new MockUserRepository())

  container.register('userService', () => {
    return new UserService(
      container.resolve('userRepository'),
      container.resolve('emailService'),
      container.resolve('logger')
    )
  })

  return container
}

// Usage in tests
const container = createTestContainer()
const userService = container.resolve<UserService>('userService')
```

---

## Common Pitfalls

### 1. Creating Dependencies Instead of Injecting

❌ **Wrong:**
```typescript
class UserService {
  private emailService = new EmailService() // ❌ Created inside

  async registerUser(email: string) {
    await this.emailService.send(email, 'Welcome')
  }
}
```

✅ **Correct:**
```typescript
class UserService {
  constructor(private emailService: IEmailService) {} // ✅ Injected

  async registerUser(email: string) {
    await this.emailService.send(email, 'Welcome')
  }
}
```

### 2. Circular Dependencies

❌ **Problem:**
```typescript
// UserService depends on PaymentService
class UserService {
  constructor(private paymentService: PaymentService) {}
}

// PaymentService depends on UserService
class PaymentService {
  constructor(private userService: UserService) {} // ❌ Circular!
}
```

✅ **Solution:**
```typescript
// Extract shared logic to a third service
class NotificationService {
  notifyUser(userId: string, message: string) {}
}

class UserService {
  constructor(private notificationService: NotificationService) {}
}

class PaymentService {
  constructor(private notificationService: NotificationService) {}
}
```

### 3. Not Using Interfaces

❌ **Wrong:**
```typescript
class UserService {
  constructor(private emailService: SendGridEmailService) {} // ❌ Concrete class
}
```

✅ **Correct:**
```typescript
class UserService {
  constructor(private emailService: IEmailService) {} // ✅ Interface
}

// Can swap implementations:
const service1 = new UserService(new SendGridEmailService())
const service2 = new UserService(new ResendEmailService())
const service3 = new UserService(new MockEmailService())
```

### 4. Registering Too Much

Not everything needs DI:

❌ **Over-engineering:**
```typescript
// Don't register simple utilities
container.register('formatDate', (date: Date) => date.toISOString())
container.register('math', Math)
```

✅ **Better:**
```typescript
// Just import simple utilities
import { formatDate } from '@/utils/dates'
import { calculateTotal } from '@/utils/math'
```

---

## Advanced Features

### 1. Automatic Dependency Resolution

```typescript
// Enhanced container with reflection
export class SmartDIContainer extends DIContainer {
  autoRegister<T>(constructor: new (...args: any[]) => T) {
    const dependencies = this.getDependencies(constructor)
    const resolvedDeps = dependencies.map(dep => this.resolve(dep))
    return new constructor(...resolvedDeps)
  }

  private getDependencies(constructor: any): string[] {
    // Use TypeScript metadata or manual mapping
    return constructor.dependencies || []
  }
}

// Usage
@Injectable(['userRepository', 'emailService'])
class UserService {
  static dependencies = ['userRepository', 'emailService']
  constructor(private userRepo: UserRepository, private emailService: IEmailService) {}
}

const service = container.autoRegister(UserService)
```

### 2. Scoped Lifetime Management

```typescript
enum ServiceLifetime {
  Transient, // New instance every time
  Singleton, // One instance for entire app
  Scoped     // One instance per request
}

container.register('userService', UserService, ServiceLifetime.Scoped)
```

### 3. Named Registrations

```typescript
// Register multiple implementations
container.register('emailService:sendgrid', new SendGridEmailService())
container.register('emailService:resend', new ResendEmailService())

// Resolve specific implementation
const sendgrid = container.resolve<IEmailService>('emailService:sendgrid')
const resend = container.resolve<IEmailService>('emailService:resend')
```

---

## Next Steps

1. ✅ Implement DIContainer
2. ✅ Define service interfaces
3. ✅ Convert existing services to use DI
4. ✅ Update routes to resolve services from container
5. 📝 Write tests with mock dependencies
6. 🚀 Add environment-based configuration

**Related Patterns:**
- [Repository Pattern](./REPOSITORY_PATTERN_GUIDE.md) - Works great with DI
- [Adapter Pattern](./ADAPTER_PATTERN_GUIDE.md) - External services via DI
- [Testing Guide](./TESTING_GUIDE.md) - Test with DI mocks

---

**Need help?** Check the [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) for the complete implementation strategy.
