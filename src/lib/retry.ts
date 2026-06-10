/**
 * Retry utility for handling transient failures
 */

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delayMs?: number
    backoff?: boolean
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = true,
    onRetry,
  } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // Don't retry on certain errors
      if (
        error.status === 401 || // Unauthorized
        error.status === 403 || // Forbidden
        error.status === 404    // Not Found
      ) {
        throw error
      }

      if (attempt < maxRetries) {
        const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs
        
        if (onRetry) {
          onRetry(attempt, error)
        }

        console.log(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms...`, error.message)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}
