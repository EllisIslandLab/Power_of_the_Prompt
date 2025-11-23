# Factory Pattern Template

## Quick Start

Use factories to create service instances with proper configuration.

## Structure

```typescript
// src/lib/factories/ServiceFactory.ts

import { Resend } from 'resend';
import Stripe from 'stripe';

export type ServiceType = 'email' | 'payment' | 'storage' | 'ai';

interface ServiceConfig {
  email?: { apiKey?: string; from?: string };
  payment?: { apiKey?: string };
  ai?: { apiKey?: string; model?: string };
}

export class ServiceFactory {
  private static instances = new Map<string, unknown>();

  /**
   * Create or retrieve a service instance (singleton pattern)
   */
  static create<T extends ServiceType>(
    type: T,
    config?: ServiceConfig[T]
  ): ReturnType<typeof ServiceFactory.createInstance> {
    const cacheKey = `${type}:${JSON.stringify(config || {})}`;

    if (this.instances.has(cacheKey)) {
      return this.instances.get(cacheKey);
    }

    const instance = this.createInstance(type, config);
    this.instances.set(cacheKey, instance);
    return instance;
  }

  private static createInstance(type: ServiceType, config?: unknown) {
    switch (type) {
      case 'email':
        return this.createEmailService(config as ServiceConfig['email']);

      case 'payment':
        return this.createPaymentService(config as ServiceConfig['payment']);

      case 'ai':
        return this.createAIService(config as ServiceConfig['ai']);

      default:
        throw new Error(`Unknown service type: ${type}`);
    }
  }

  private static createEmailService(config?: ServiceConfig['email']) {
    return new Resend(config?.apiKey || process.env.RESEND_API_KEY);
  }

  private static createPaymentService(config?: ServiceConfig['payment']) {
    return new Stripe(config?.apiKey || process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  private static createAIService(config?: ServiceConfig['ai']) {
    const Anthropic = require('@anthropic-ai/sdk');
    return new Anthropic({
      apiKey: config?.apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Clear all cached instances (useful for testing)
   */
  static clearInstances(): void {
    this.instances.clear();
  }
}
```

## Usage Examples

```typescript
// Basic usage
import { ServiceFactory } from '@/lib/factories/ServiceFactory';

// Get email service
const emailService = ServiceFactory.create('email');
await emailService.emails.send({
  from: 'noreply@weblaunchacademy.com',
  to: 'student@example.com',
  subject: 'Welcome!',
  html: '<p>Welcome to Web Launch Academy!</p>',
});

// Get payment service
const stripe = ServiceFactory.create('payment');
const session = await stripe.checkout.sessions.create({
  // ... checkout config
});

// Get AI service
const anthropic = ServiceFactory.create('ai');
const response = await anthropic.messages.create({
  model: 'claude-3-sonnet-20240229',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

## Notification Factory Example

```typescript
// src/lib/factories/NotificationFactory.ts

interface Notification {
  send(): Promise<void>;
}

interface NotificationData {
  recipient: string;
  subject: string;
  message: string;
}

class EmailNotification implements Notification {
  constructor(private data: NotificationData) {}

  async send(): Promise<void> {
    const emailService = ServiceFactory.create('email');
    await emailService.emails.send({
      from: 'noreply@weblaunchacademy.com',
      to: this.data.recipient,
      subject: this.data.subject,
      html: `<p>${this.data.message}</p>`,
    });
  }
}

class SlackNotification implements Notification {
  constructor(private data: NotificationData) {}

  async send(): Promise<void> {
    // Slack webhook implementation
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      body: JSON.stringify({
        text: `${this.data.subject}: ${this.data.message}`,
      }),
    });
  }
}

export class NotificationFactory {
  static create(
    type: 'email' | 'slack',
    data: NotificationData
  ): Notification {
    switch (type) {
      case 'email':
        return new EmailNotification(data);
      case 'slack':
        return new SlackNotification(data);
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }
}

// Usage
const notification = NotificationFactory.create('email', {
  recipient: 'student@example.com',
  subject: 'Course Reminder',
  message: 'Your class starts in 1 hour!',
});

await notification.send();
```

## Payment Product Factory

```typescript
// src/lib/factories/ProductFactory.ts

interface Product {
  name: string;
  price: number;
  features: string[];
  createCheckoutSession(customerId: string): Promise<string>;
}

class BasicTier implements Product {
  name = 'Basic';
  price = 97;
  features = ['Course access', 'Community forum'];

  async createCheckoutSession(customerId: string): Promise<string> {
    const stripe = ServiceFactory.create('payment');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: 'price_basic_id', quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    });
    return session.url!;
  }
}

class PremiumTier implements Product {
  name = 'Premium';
  price = 197;
  features = ['Everything in Basic', '1-on-1 coaching', 'Priority support'];

  async createCheckoutSession(customerId: string): Promise<string> {
    const stripe = ServiceFactory.create('payment');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: 'price_premium_id', quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    });
    return session.url!;
  }
}

export class ProductFactory {
  static create(tier: 'basic' | 'premium' | 'vip' | 'enterprise'): Product {
    switch (tier) {
      case 'basic':
        return new BasicTier();
      case 'premium':
        return new PremiumTier();
      // ... other tiers
      default:
        throw new Error(`Unknown tier: ${tier}`);
    }
  }
}
```

## When to Use

**Use Factory Pattern when:**
- Creating different types of services based on configuration
- Need singleton instances of services
- Want to centralize service configuration
- Building polymorphic objects (different classes, same interface)

**Don't use when:**
- Only one type of object ever needed
- Simple object creation with no variations

## Benefits

1. **Centralized Configuration:** All service setup in one place
2. **Singleton Support:** Reuse expensive service instances
3. **Testability:** Easy to mock factories for testing
4. **Type Safety:** Full TypeScript support
5. **Encapsulation:** Hide complex creation logic

## Related Patterns

- **Dependency Injection** - Inject factory-created services
- **Service Container** - Manage multiple factories
- **Builder Pattern** - For complex object construction
