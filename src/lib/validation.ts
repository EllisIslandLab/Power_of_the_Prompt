import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

/**
 * Validation helper utilities for API routes
 *
 * Usage:
 * ```typescript
 * import { validateRequest } from '@/lib/validation'
 * import { signInSchema } from '@/lib/schemas'
 *
 * export async function POST(request: NextRequest) {
 *   const result = await validateRequest(request, signInSchema)
 *   if (!result.success) {
 *     return result.error // Returns NextResponse with formatted errors
 *   }
 *
 *   const { email, password } = result.data
 *   // ... your logic here
 * }
 * ```
 */

export interface ValidationSuccess<T> {
  success: true
  data: T
}

export interface ValidationError {
  success: false
  error: NextResponse
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError

/**
 * Validates request body against a Zod schema
 * Returns typed data on success, or formatted error response on failure
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    // Parse request body
    const body = await request.json()

    // Validate against schema
    const data = schema.parse(body)

    return {
      success: true,
      data,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod errors into user-friendly response
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: formatZodErrors(error),
          },
          { status: 400 }
        ),
      }
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        ),
      }
    }

    // Unexpected error
    console.error('Validation error:', error)
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Failed to validate request' },
        { status: 400 }
      ),
    }
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const { searchParams } = new URL(request.url)

    // Convert URLSearchParams to plain object
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    // Validate against schema
    const data = schema.parse(params)

    return {
      success: true,
      data,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Invalid query parameters',
            details: formatZodErrors(error),
          },
          { status: 400 }
        ),
      }
    }

    console.error('Query validation error:', error)
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Failed to validate query parameters' },
        { status: 400 }
      ),
    }
  }
}

/**
 * Format Zod errors into user-friendly messages
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}

  error.issues.forEach((err) => {
    const path = err.path.join('.')
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(err.message)
  })

  return formatted
}

/**
 * Validates data synchronously (for non-request validation)
 */
export function validate<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error),
      }
    }
    throw error
  }
}

/**
 * Type guard to check if validation was successful
 */
export function isValidationSuccess<T>(
  result: ValidationResult<T>
): result is ValidationSuccess<T> {
  return result.success === true
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}
