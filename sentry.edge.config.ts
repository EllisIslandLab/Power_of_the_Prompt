/**
 * Sentry Edge Configuration
 *
 * This file configures Sentry for Edge runtime error tracking (middleware).
 */

import * as Sentry from '@sentry/nextjs'

// Uncomment this when you have your Sentry DSN

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  environment: process.env.NODE_ENV,
})

