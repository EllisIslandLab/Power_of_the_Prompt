/**
 * Parse API error responses and extract user-friendly error messages
 *
 * Handles Zod validation errors with field-specific details
 */

export interface ApiErrorResponse {
  error: string
  details?: Record<string, string | string[]>
}

/**
 * Parse error response from API and return user-friendly message
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/auth/signin', { ... })
 * const data = await response.json()
 *
 * if (!response.ok) {
 *   const errorMessage = parseApiError(data)
 *   setError(errorMessage) // "Invalid email address"
 * }
 * ```
 */
export function parseApiError(data: unknown, fallback = 'Something went wrong'): string {
  if (!data || typeof data !== 'object') {
    return fallback
  }

  const errorData = data as ApiErrorResponse

  // If there are validation details from Zod, format them nicely
  if (errorData.details && typeof errorData.details === 'object') {
    const fieldErrors: string[] = []

    Object.entries(errorData.details).forEach(([field, errors]) => {
      const errorMessages = Array.isArray(errors) ? errors : [errors]

      // For single-field forms (like email-only), skip the field name
      if (Object.keys(errorData.details!).length === 1) {
        fieldErrors.push(...errorMessages)
      } else {
        // For multi-field forms, include the field name
        const friendlyField = field
          .replace(/([A-Z])/g, ' $1') // camelCase to spaces
          .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        fieldErrors.push(`${friendlyField}: ${errorMessages.join(', ')}`)
      }
    })

    if (fieldErrors.length > 0) {
      return fieldErrors.join('; ')
    }
  }

  // Fall back to the generic error message
  return errorData.error || fallback
}

/**
 * Parse error and throw with formatted message
 * Useful in try/catch blocks
 *
 * @example
 * ```typescript
 * const data = await response.json()
 * if (!response.ok) {
 *   throwApiError(data) // Throws with formatted message
 * }
 * ```
 */
export function throwApiError(data: unknown, fallback = 'Something went wrong'): never {
  throw new Error(parseApiError(data, fallback))
}

/**
 * Extract validation errors by field name
 * Useful for showing errors next to specific form fields
 *
 * @example
 * ```typescript
 * const fieldErrors = extractFieldErrors(data)
 * // { email: ['Invalid email address'], password: ['Too short', 'Missing uppercase'] }
 * ```
 */
export function extractFieldErrors(data: unknown): Record<string, string[]> {
  if (!data || typeof data !== 'object') {
    return {}
  }

  const errorData = data as ApiErrorResponse

  if (!errorData.details || typeof errorData.details !== 'object') {
    return {}
  }

  const result: Record<string, string[]> = {}

  Object.entries(errorData.details).forEach(([field, errors]) => {
    result[field] = Array.isArray(errors) ? errors : [errors]
  })

  return result
}
