/**
 * Sentry Client Configuration
 *
 * This file configures Sentry for client-side error tracking.
 *
 * To activate:
 * 1. Sign up at sentry.io
 * 2. Create a Next.js project
 * 3. Get your DSN
 * 4. Add to .env.local: NEXT_PUBLIC_SENTRY_DSN=your_dsn_here
 * 5. Uncomment the Sentry.init() call below
 */

import * as Sentry from '@sentry/nextjs'

// Uncomment this when you have your Sentry DSN

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production (0.1 = 10%)
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Configure email alerts in your Sentry dashboard:
  // 1. Go to Alerts → Create Alert Rule
  // 2. Choose "Issues"
  // 3. Set conditions (e.g., "When an issue is first seen")
  // 4. Add action: "Send a notification via email to hello@weblaunchacademy.com"

  environment: process.env.NODE_ENV,

  // Ignore common errors that don't need alerts
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Network errors that are expected
    'Network request failed',
    'NetworkError',
    // ResizeObserver errors (harmless)
    'ResizeObserver loop limit exceeded',
  ],
})

