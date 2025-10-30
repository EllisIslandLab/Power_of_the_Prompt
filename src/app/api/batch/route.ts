/**
 * Batch API Route
 *
 * Endpoint for executing multiple API requests in a single HTTP call.
 *
 * POST /api/batch
 * Body: {
 *   requests: [
 *     { id: "1", method: "GET", path: "/api/services", params: {...} },
 *     { id: "2", method: "POST", path: "/api/store-lead", body: {...} }
 *   ],
 *   options?: {
 *     failFast?: boolean,
 *     timeout?: number,
 *     useCache?: boolean,
 *     parallel?: boolean
 *   }
 * }
 *
 * Response: {
 *   success: true,
 *   results: [...],
 *   metadata: { totalRequests, successCount, errorCount, cachedCount, duration }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getBatchProcessor } from '@/lib/batch-processor'
import { rateLimiter } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import type {
  BatchRequestPayload,
  BatchResponse,
  BatchMetadata,
} from '@/types/batch'

// Validation schema for batch requests
const BatchRequestSchema = z.object({
  id: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  path: z.string().startsWith('/api/'),
  params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  body: z.unknown().optional(),
  headers: z.record(z.string(), z.string()).optional(),
})

const BatchPayloadSchema = z.object({
  requests: z.array(BatchRequestSchema).min(1).max(20),
  options: z
    .object({
      failFast: z.boolean().optional(),
      timeout: z.number().min(100).max(30000).optional(),
      useCache: z.boolean().optional(),
      parallel: z.boolean().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  logger.info({ requestId }, 'Batch request received')

  try {
    // Apply rate limiting - batch counts as multiple requests
    // Get identifier from IP or use a default
    const identifier = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'anonymous'

    const rateLimitResult = await rateLimiter.checkLimit(
      'api:batch',
      identifier,
      {
        tier: 'custom',
        requests: 10,
        window: '1 m', // 10 batches per minute
      }
    )

    if (!rateLimitResult.success) {
      logger.warn(
        {
          requestId,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        'Batch request rate limited'
      )

      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'Retry-After': String(
              Math.ceil(
                (rateLimitResult.reset - Date.now()) / 1000
              )
            ),
          },
        }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = BatchPayloadSchema.safeParse(body)

    if (!validationResult.success) {
      logger.warn(
        {
          requestId,
          errors: validationResult.error.issues,
        },
        'Invalid batch request payload'
      )

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request payload',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const payload: BatchRequestPayload = validationResult.data

    // Validate request IDs are unique
    const requestIds = new Set(payload.requests.map((r) => r.id))
    if (requestIds.size !== payload.requests.length) {
      logger.warn({ requestId }, 'Duplicate request IDs in batch')

      return NextResponse.json(
        {
          success: false,
          error: 'Request IDs must be unique within a batch',
        },
        { status: 400 }
      )
    }

    // Process the batch
    const batchProcessor = getBatchProcessor()
    const results = await batchProcessor.processBatch(
      payload.requests,
      payload.options
    )

    // Calculate metadata
    const successCount = results.filter((r) => r.success).length
    const errorCount = results.filter((r) => !r.success).length
    const cachedCount = results.filter((r) => r.cached).length
    const duration = Date.now() - startTime

    // Check for deduplication
    const uniqueIds = new Set(results.map((r) => r.id))
    const deduplicated = uniqueIds.size < payload.requests.length

    const metadata: BatchMetadata = {
      totalRequests: payload.requests.length,
      successCount,
      errorCount,
      cachedCount,
      duration,
      deduplicated,
      deduplicatedCount: deduplicated
        ? payload.requests.length - uniqueIds.size
        : undefined,
    }

    const response: BatchResponse = {
      success: errorCount === 0,
      results,
      metadata,
    }

    logger.info(
      {
        requestId,
        metadata,
      },
      'Batch request completed'
    )

    return NextResponse.json(response, {
      headers: {
        'X-Request-ID': requestId,
        'X-Batch-Size': String(payload.requests.length),
        'X-Cache-Hits': String(cachedCount),
        'X-Duration': String(duration),
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime

    logger.error(
      {
        requestId,
        error,
        duration,
      },
      'Batch request failed'
    )

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
      },
      {
        status: 500,
        headers: {
          'X-Request-ID': requestId,
          'X-Duration': String(duration),
        },
      }
    )
  }
}

// GET endpoint to retrieve batch configuration
export async function GET() {
  const batchProcessor = getBatchProcessor()
  const config = batchProcessor.getConfig()

  return NextResponse.json({
    success: true,
    config: {
      maxBatchSize: config.maxBatchSize,
      batchWindow: config.batchWindow,
      timeout: config.timeout,
      enableDeduplication: config.enableDeduplication,
      useCache: config.useCache,
    },
  })
}
