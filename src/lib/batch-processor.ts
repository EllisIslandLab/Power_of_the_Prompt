/**
 * API Response Batching Processor
 *
 * Core logic for batching multiple API requests into efficient bulk operations.
 * Features:
 * - Request deduplication within time windows
 * - Cache-aware batching
 * - Error isolation (one failure doesn't affect others)
 * - Configurable batch size and time windows
 * - Integration with existing cache and logger
 */

import { cache, CacheKeys } from './cache'
import { logger } from './logger'
import type {
  BatchRequest,
  BatchResult,
  BatchProcessorConfig,
  BatchCacheKey,
  BatchErrorType,
} from '@/types/batch'

/**
 * Batch Processor - Aggregates and executes API requests efficiently
 */
export class BatchProcessor {
  private config: BatchProcessorConfig

  constructor(config?: Partial<BatchProcessorConfig>) {
    this.config = {
      maxBatchSize: config?.maxBatchSize ?? 20,
      batchWindow: config?.batchWindow ?? 50,
      timeout: config?.timeout ?? 30000,
      enableDeduplication: config?.enableDeduplication ?? true,
      useCache: config?.useCache ?? true,
    }

    logger.info(
      { config: this.config },
      'BatchProcessor initialized'
    )
  }

  /**
   * Process a batch of requests
   */
  async processBatch(
    requests: BatchRequest[],
    options?: {
      failFast?: boolean
      parallel?: boolean
      useCache?: boolean
    }
  ): Promise<BatchResult[]> {
    const startTime = Date.now()
    const requestCount = requests.length

    logger.info(
      { requestCount, options },
      'Processing batch'
    )

    try {
      // Validate batch size
      if (requestCount > this.config.maxBatchSize) {
        throw new Error(
          `Batch size ${requestCount} exceeds maximum ${this.config.maxBatchSize}`
        )
      }

      // Deduplicate requests if enabled
      const { uniqueRequests, deduplicationMap } =
        this.config.enableDeduplication
          ? this.deduplicateRequests(requests)
          : { uniqueRequests: requests, deduplicationMap: new Map() }

      // Check cache for GET requests
      const useCache = options?.useCache ?? this.config.useCache
      const { cachedResults, uncachedRequests } = useCache
        ? await this.checkCache(uniqueRequests)
        : { cachedResults: [], uncachedRequests: uniqueRequests }

      // Execute uncached requests
      const freshResults = await this.executeRequests(
        uncachedRequests,
        {
          failFast: options?.failFast ?? false,
          parallel: options?.parallel ?? true,
        }
      )

      // Combine cached and fresh results
      let allResults = [...cachedResults, ...freshResults]

      // Map deduplicated requests back to original request IDs
      if (deduplicationMap.size > 0) {
        allResults = this.expandDeduplicatedResults(
          allResults,
          deduplicationMap
        )
      }

      // Ensure results match original request order
      const orderedResults = this.orderResults(requests, allResults)

      const duration = Date.now() - startTime
      logger.info(
        {
          totalRequests: requestCount,
          uniqueRequests: uniqueRequests.length,
          cachedCount: cachedResults.length,
          duration,
        },
        'Batch processing complete'
      )

      return orderedResults
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { error, requestCount, duration },
        'Batch processing failed'
      )
      throw error
    }
  }

  /**
   * Deduplicate identical requests within a batch
   */
  private deduplicateRequests(requests: BatchRequest[]): {
    uniqueRequests: BatchRequest[]
    deduplicationMap: Map<string, string[]> // cacheKey -> original request IDs
  } {
    const seen = new Map<string, BatchRequest>()
    const deduplicationMap = new Map<string, string[]>()

    for (const request of requests) {
      const cacheKey = this.generateCacheKey(request)

      if (seen.has(cacheKey)) {
        // Duplicate found - add original ID to map
        const existingIds = deduplicationMap.get(cacheKey) || []
        existingIds.push(request.id)
        deduplicationMap.set(cacheKey, existingIds)
      } else {
        // First occurrence
        seen.set(cacheKey, request)
        deduplicationMap.set(cacheKey, [request.id])
      }
    }

    const uniqueRequests = Array.from(seen.values())
    const duplicateCount = requests.length - uniqueRequests.length

    if (duplicateCount > 0) {
      logger.info(
        { duplicateCount, uniqueCount: uniqueRequests.length },
        'Deduplicated requests'
      )
    }

    return { uniqueRequests, deduplicationMap }
  }

  /**
   * Check cache for GET requests
   */
  private async checkCache(
    requests: BatchRequest[]
  ): Promise<{
    cachedResults: BatchResult[]
    uncachedRequests: BatchRequest[]
  }> {
    const cachedResults: BatchResult[] = []
    const uncachedRequests: BatchRequest[] = []

    await Promise.all(
      requests.map(async (request) => {
        // Only cache GET requests
        if (request.method !== 'GET') {
          uncachedRequests.push(request)
          return
        }

        const cacheKey = this.generateCacheKey(request)
        const cached = await cache.get<unknown>(cacheKey)

        if (cached !== null) {
          cachedResults.push({
            id: request.id,
            success: true,
            data: cached,
            status: 200,
            cached: true,
            duration: 0,
          })
        } else {
          uncachedRequests.push(request)
        }
      })
    )

    return { cachedResults, uncachedRequests }
  }

  /**
   * Execute requests (either parallel or sequential)
   */
  private async executeRequests(
    requests: BatchRequest[],
    options: {
      failFast: boolean
      parallel: boolean
    }
  ): Promise<BatchResult[]> {
    if (requests.length === 0) {
      return []
    }

    if (options.parallel) {
      // Execute all requests in parallel
      return Promise.all(
        requests.map((request) =>
          this.executeSingleRequest(request).catch((error) => ({
            id: request.id,
            success: false,
            error: error.message || 'Request failed',
            status: 500,
            cached: false,
          }))
        )
      )
    } else {
      // Execute requests sequentially
      const results: BatchResult[] = []

      for (const request of requests) {
        try {
          const result = await this.executeSingleRequest(request)
          results.push(result)
        } catch (error) {
          const errorResult: BatchResult = {
            id: request.id,
            success: false,
            error:
              error instanceof Error ? error.message : 'Request failed',
            status: 500,
            cached: false,
          }
          results.push(errorResult)

          // Stop on first error if failFast is enabled
          if (options.failFast) {
            logger.warn(
              { requestId: request.id },
              'Stopping batch due to failFast'
            )
            break
          }
        }
      }

      return results
    }
  }

  /**
   * Execute a single request
   * In production, this would make actual API calls or call route handlers
   */
  private async executeSingleRequest(
    request: BatchRequest
  ): Promise<BatchResult> {
    const startTime = Date.now()

    try {
      // Build URL with query parameters
      const url = new URL(request.path, 'http://localhost:3000')
      if (request.params) {
        Object.entries(request.params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value))
        })
      }

      // Make internal fetch call
      const response = await fetch(url.toString(), {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers,
        },
        body: request.body ? JSON.stringify(request.body) : undefined,
      })

      const data = await response.json()
      const duration = Date.now() - startTime

      // Cache successful GET requests
      if (request.method === 'GET' && response.ok && this.config.useCache) {
        const cacheKey = this.generateCacheKey(request)
        await cache.set(cacheKey, data, 300) // 5 minute TTL
      }

      return {
        id: request.id,
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || 'Request failed',
        status: response.status,
        cached: false,
        duration,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { error, requestId: request.id, duration },
        'Request execution failed'
      )

      return {
        id: request.id,
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
        status: 500,
        cached: false,
        duration,
      }
    }
  }

  /**
   * Expand deduplicated results back to original request IDs
   */
  private expandDeduplicatedResults(
    results: BatchResult[],
    deduplicationMap: Map<string, string[]>
  ): BatchResult[] {
    const expandedResults: BatchResult[] = []

    for (const result of results) {
      // Find the cache key for this result
      const cacheKey = Array.from(deduplicationMap.keys()).find((key) =>
        deduplicationMap.get(key)?.includes(result.id)
      )

      if (!cacheKey) {
        expandedResults.push(result)
        continue
      }

      // Get all original request IDs that were deduplicated to this one
      const originalIds = deduplicationMap.get(cacheKey) || []

      // Create a result for each original request ID
      for (const originalId of originalIds) {
        expandedResults.push({
          ...result,
          id: originalId,
        })
      }
    }

    return expandedResults
  }

  /**
   * Order results to match original request order
   */
  private orderResults(
    requests: BatchRequest[],
    results: BatchResult[]
  ): BatchResult[] {
    const resultMap = new Map(results.map((r) => [r.id, r]))

    return requests.map((request) => {
      const result = resultMap.get(request.id)
      if (!result) {
        // This should never happen, but provide a fallback
        logger.error(
          { requestId: request.id },
          'Result not found for request'
        )
        return {
          id: request.id,
          success: false,
          error: 'Result not found',
          status: 500,
          cached: false,
        }
      }
      return result
    })
  }

  /**
   * Generate cache key for a request
   */
  private generateCacheKey(request: BatchRequest): string {
    const key: BatchCacheKey = {
      method: request.method,
      path: request.path,
      params: request.params ? JSON.stringify(request.params) : undefined,
      body: request.body ? JSON.stringify(request.body) : undefined,
    }

    return `batch:${JSON.stringify(key)}`
  }

  /**
   * Get current configuration
   */
  getConfig(): BatchProcessorConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BatchProcessorConfig>): void {
    this.config = { ...this.config, ...config }
    logger.info({ config: this.config }, 'BatchProcessor config updated')
  }
}

// Singleton instance
let batchProcessorInstance: BatchProcessor | null = null

/**
 * Get or create the singleton batch processor instance
 */
export function getBatchProcessor(): BatchProcessor {
  if (!batchProcessorInstance) {
    batchProcessorInstance = new BatchProcessor()
  }
  return batchProcessorInstance
}

/**
 * Reset the batch processor (useful for testing)
 */
export function resetBatchProcessor(): void {
  batchProcessorInstance = null
}
