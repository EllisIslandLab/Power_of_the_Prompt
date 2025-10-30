/**
 * API Response Batching Types
 *
 * Defines types for batching multiple API requests into a single HTTP call.
 * Supports request deduplication, caching, and error isolation.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Individual request within a batch
 */
export interface BatchRequest {
  /** Unique identifier for this request within the batch */
  id: string

  /** HTTP method */
  method: HttpMethod

  /** API path (e.g., /api/services) */
  path: string

  /** Query parameters */
  params?: Record<string, string | number | boolean>

  /** Request body for POST/PUT/PATCH */
  body?: unknown

  /** Custom headers for this specific request */
  headers?: Record<string, string>
}

/**
 * Result of a single request within a batch
 */
export interface BatchResult<T = unknown> {
  /** Request ID from the original BatchRequest */
  id: string

  /** Whether the request succeeded */
  success: boolean

  /** Response data if successful */
  data?: T

  /** Error message if failed */
  error?: string

  /** HTTP status code */
  status: number

  /** Whether this result came from cache */
  cached?: boolean

  /** Execution time in milliseconds */
  duration?: number
}

/**
 * Complete batch request payload
 */
export interface BatchRequestPayload {
  /** Array of requests to execute */
  requests: BatchRequest[]

  /** Optional batch configuration */
  options?: BatchOptions
}

/**
 * Batch execution options
 */
export interface BatchOptions {
  /** Whether to stop batch execution on first error (default: false) */
  failFast?: boolean

  /** Maximum time to wait for the entire batch in ms (default: 30000) */
  timeout?: number

  /** Whether to use cache for GET requests (default: true) */
  useCache?: boolean

  /** Whether to execute requests in parallel (default: true) */
  parallel?: boolean
}

/**
 * Complete batch response
 */
export interface BatchResponse<T = unknown> {
  /** Whether the overall batch succeeded */
  success: boolean

  /** Array of individual results */
  results: BatchResult<T>[]

  /** Batch execution metadata */
  metadata: BatchMetadata
}

/**
 * Batch execution metadata
 */
export interface BatchMetadata {
  /** Total number of requests in batch */
  totalRequests: number

  /** Number of successful requests */
  successCount: number

  /** Number of failed requests */
  errorCount: number

  /** Number of cached responses */
  cachedCount: number

  /** Total batch execution time in ms */
  duration: number

  /** Whether any requests were deduplicated */
  deduplicated: boolean

  /** Number of deduplicated requests */
  deduplicatedCount?: number
}

/**
 * Internal batch processor configuration
 */
export interface BatchProcessorConfig {
  /** Maximum number of requests per batch */
  maxBatchSize: number

  /** Time window to collect requests before flushing (ms) */
  batchWindow: number

  /** Maximum time to wait for batch completion (ms) */
  timeout: number

  /** Whether to enable request deduplication */
  enableDeduplication: boolean

  /** Whether to use cache for GET requests */
  useCache: boolean
}

/**
 * Cache key generator for batch requests
 */
export interface BatchCacheKey {
  method: HttpMethod
  path: string
  params?: string // Stringified params
  body?: string // Stringified body
}

/**
 * Error types for batch processing
 */
export enum BatchErrorType {
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UPSTREAM_ERROR = 'UPSTREAM_ERROR'
}

/**
 * Structured error for batch operations
 */
export interface BatchError {
  type: BatchErrorType
  message: string
  requestId?: string
  details?: unknown
}
