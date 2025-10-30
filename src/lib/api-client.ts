/**
 * API Client with Batch Support
 *
 * Client-side utility for making batched API requests.
 * Automatically collects requests within a time window and sends them as a batch.
 *
 * Usage:
 * ```typescript
 * const client = new BatchApiClient()
 *
 * // Individual requests are automatically batched
 * const [services, portfolio, testimonials] = await Promise.all([
 *   client.get('/api/services'),
 *   client.get('/api/portfolio'),
 *   client.get('/api/testimonials')
 * ])
 * ```
 */

import type {
  BatchRequest,
  BatchRequestPayload,
  BatchResponse,
  BatchResult,
  HttpMethod,
} from '@/types/batch'

export interface ApiClientConfig {
  /** Maximum number of requests per batch */
  maxBatchSize?: number

  /** Time window to collect requests before sending (ms) */
  batchWindow?: number

  /** Base URL for API requests */
  baseUrl?: string

  /** Default headers for all requests */
  defaultHeaders?: Record<string, string>

  /** Whether to use batching (default: true) */
  enableBatching?: boolean

  /** Whether to automatically retry failed requests */
  retryFailedRequests?: boolean

  /** Maximum number of retries */
  maxRetries?: number
}

interface PendingRequest {
  request: BatchRequest
  resolve: (result: BatchResult) => void
  reject: (error: Error) => void
}

/**
 * API Client with automatic request batching
 */
export class BatchApiClient {
  private config: Required<ApiClientConfig>
  private pendingRequests: PendingRequest[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private requestIdCounter = 0

  constructor(config?: ApiClientConfig) {
    this.config = {
      maxBatchSize: config?.maxBatchSize ?? 10,
      batchWindow: config?.batchWindow ?? 50,
      baseUrl: config?.baseUrl ?? '',
      defaultHeaders: config?.defaultHeaders ?? {},
      enableBatching: config?.enableBatching ?? true,
      retryFailedRequests: config?.retryFailedRequests ?? false,
      maxRetries: config?.maxRetries ?? 2,
    }
  }

  /**
   * Make a GET request
   */
  async get<T = unknown>(
    path: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>('GET', path, { params })
  }

  /**
   * Make a POST request
   */
  async post<T = unknown>(
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>('POST', path, { body, params })
  }

  /**
   * Make a PUT request
   */
  async put<T = unknown>(
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>('PUT', path, { body, params })
  }

  /**
   * Make a PATCH request
   */
  async patch<T = unknown>(
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>('PATCH', path, { body, params })
  }

  /**
   * Make a DELETE request
   */
  async delete<T = unknown>(
    path: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>('DELETE', path, { params })
  }

  /**
   * Make a request (automatically batched if enabled)
   */
  private async request<T>(
    method: HttpMethod,
    path: string,
    options?: {
      params?: Record<string, string | number | boolean>
      body?: unknown
      headers?: Record<string, string>
    }
  ): Promise<T> {
    // If batching is disabled, make direct request
    if (!this.config.enableBatching) {
      return this.makeDirectRequest<T>(method, path, options)
    }

    // Create batch request
    const batchRequest: BatchRequest = {
      id: this.generateRequestId(),
      method,
      path,
      params: options?.params,
      body: options?.body,
      headers: options?.headers,
    }

    // Add to pending requests and return a promise
    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.push({
        request: batchRequest,
        resolve: (result) => {
          if (result.success) {
            resolve(result.data as T)
          } else {
            reject(
              new Error(result.error || 'Request failed')
            )
          }
        },
        reject,
      })

      // Schedule batch flush
      this.scheduleBatchFlush()

      // Flush immediately if batch size limit reached
      if (this.pendingRequests.length >= this.config.maxBatchSize) {
        this.flushBatch()
      }
    })
  }

  /**
   * Make a direct (non-batched) request
   */
  private async makeDirectRequest<T>(
    method: HttpMethod,
    path: string,
    options?: {
      params?: Record<string, string | number | boolean>
      body?: unknown
      headers?: Record<string, string>
    }
  ): Promise<T> {
    const url = new URL(path, this.config.baseUrl)

    // Add query parameters
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    // Make fetch request
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.defaultHeaders,
        ...options?.headers,
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Request failed with status ${response.status}`)
    }

    return response.json()
  }

  /**
   * Schedule a batch flush after the batch window
   */
  private scheduleBatchFlush(): void {
    if (this.flushTimer) {
      return // Timer already scheduled
    }

    this.flushTimer = setTimeout(() => {
      this.flushBatch()
    }, this.config.batchWindow)
  }

  /**
   * Flush pending requests as a batch
   */
  private async flushBatch(): Promise<void> {
    // Clear timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }

    // Get pending requests
    const requests = this.pendingRequests.splice(0)

    if (requests.length === 0) {
      return
    }

    try {
      // Send batch request
      const payload: BatchRequestPayload = {
        requests: requests.map((r) => r.request),
        options: {
          parallel: true,
          useCache: true,
        },
      }

      const response = await fetch(`${this.config.baseUrl}/api/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.defaultHeaders,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Batch request failed with status ${response.status}`)
      }

      const batchResponse: BatchResponse = await response.json()

      // Resolve individual promises
      for (const pendingRequest of requests) {
        const result = batchResponse.results.find(
          (r) => r.id === pendingRequest.request.id
        )

        if (result) {
          pendingRequest.resolve(result)
        } else {
          pendingRequest.reject(
            new Error('Result not found in batch response')
          )
        }
      }
    } catch (error) {
      // Reject all pending requests on batch failure
      for (const pendingRequest of requests) {
        pendingRequest.reject(
          error instanceof Error
            ? error
            : new Error('Batch request failed')
        )
      }
    }
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestIdCounter}`
  }

  /**
   * Manually flush any pending requests
   */
  async flush(): Promise<void> {
    await this.flushBatch()
  }

  /**
   * Get the current configuration
   */
  getConfig(): ApiClientConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config } as Required<ApiClientConfig>
  }
}

// Singleton instance for convenient usage
let defaultClientInstance: BatchApiClient | null = null

/**
 * Get the default batch API client instance
 */
export function getDefaultClient(): BatchApiClient {
  if (!defaultClientInstance) {
    defaultClientInstance = new BatchApiClient()
  }
  return defaultClientInstance
}

/**
 * Create a new batch API client with custom configuration
 */
export function createClient(config?: ApiClientConfig): BatchApiClient {
  return new BatchApiClient(config)
}

/**
 * Reset the default client (useful for testing)
 */
export function resetDefaultClient(): void {
  defaultClientInstance = null
}
