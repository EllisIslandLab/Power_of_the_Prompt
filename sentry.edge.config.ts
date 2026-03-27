/**
 * Sentry Edge Configuration
 *
 * This file configures Sentry for Edge runtime error tracking (middleware).
 */

import * as Sentry from '@sentry/nextjs'

// Only initialize Sentry if DSN is configured
const SENTRY_DSN = process.env.SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
    environment: process.env.NODE_ENV,
  })
} else {
  console.log('Sentry DSN not configured - edge error tracking disabled')
}

