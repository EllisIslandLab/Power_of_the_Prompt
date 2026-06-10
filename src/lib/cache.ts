/**
 * Simple in-memory cache for API responses
 * Helps reduce redundant GitHub API calls
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  get<T>(key: string, ttl: number = this.defaultTTL): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    if (age > ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  clear(keyPattern?: string): void {
    if (!keyPattern) {
      this.cache.clear()
      return
    }

    // Clear keys matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key)
      }
    }
  }
}

export const apiCache = new SimpleCache()

// Export as 'cache' for backwards compatibility
export const cache = apiCache

/**
 * Cache key builders for consistency
 */
export const CacheKeys = {
  // Services
  services: {
    all: () => 'services:all',
    byId: (id: string) => `services:${id}`,
    byCategory: (category: string) => `services:category:${category}`,
  },

  // Users
  users: {
    byId: (id: string) => `users:${id}`,
    byEmail: (email: string) => `users:email:${email}`,
    byTier: (tier: string) => `users:tier:${tier}`,
  },

  // Leads
  leads: {
    byEmail: (email: string) => `leads:email:${email}`,
    byStatus: (status: string) => `leads:status:${status}`,
    recent: (days: number) => `leads:recent:${days}`,
  },

  // Stripe
  stripe: {
    products: () => 'stripe:products',
    product: (id: string) => `stripe:product:${id}`,
    customer: (id: string) => `stripe:customer:${id}`,
  },
}
