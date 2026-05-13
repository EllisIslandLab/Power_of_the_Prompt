/**
 * Instrumentation file for Next.js
 * This file is automatically loaded by Next.js to set up Sentry
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export async function onRequestError() {
  // This function is called when an error occurs during a request
  // Sentry will automatically capture these errors
}
