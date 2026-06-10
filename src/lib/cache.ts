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
