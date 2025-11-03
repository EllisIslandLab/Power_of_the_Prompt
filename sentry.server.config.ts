/**
 * Sentry Server Configuration
 *
 * This file configures Sentry for server-side error tracking.
 *
 * To activate:
 * 1. Sign up at sentry.io
 * 2. Get your DSN
 * 3. Add to .env.local: SENTRY_DSN=your_dsn_here
 * 4. Uncomment the Sentry.init() call below
 */

import * as Sentry from '@sentry/nextjs'

// Uncomment this when you have your Sentry DSN

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production (0.1 = 10%)
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: process.env.NODE_ENV,

  // Ignore common errors
  ignoreErrors: [
    'PGRST116', // Supabase "not found" errors (expected)
  ],
})

