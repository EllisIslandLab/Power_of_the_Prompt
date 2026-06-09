import { getFileContents, getMultipleFiles } from './github'

export interface DetectedService {
  name: string
  confidence: 'high' | 'medium' | 'low'
  detected: boolean
  requiredCredentials: string[]
  optionalCredentials: string[]
  metadata?: Record<string, any>
}

export interface DetectedFramework {
  name: string
  version?: string
  type: 'nextjs' | 'react' | 'vue' | 'svelte' | 'node' | 'unknown'
}

export interface ProjectAnalysis {
  framework: DetectedFramework
  services: DetectedService[]
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun'
  envVarsNeeded: string[]
}

const SERVICE_PATTERNS = {
  supabase: {
    dependencies: ['@supabase/supabase-js', '@supabase/ssr', '@supabase/auth-helpers-nextjs'],
    envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    requiredCreds: ['url', 'anonKey'],
    optionalCreds: ['serviceRoleKey'],
    imports: ['createClient', 'createBrowserClient', 'createServerClient']
  },
  stripe: {
    dependencies: ['stripe', '@stripe/stripe-js', '@stripe/react-stripe-js'],
    envVars: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
    requiredCreds: ['secretKey'],
    optionalCreds: ['webhookSecret', 'publishableKey'],
    imports: ['Stripe', 'loadStripe']
  },
  vercel: {
    dependencies: ['@vercel/analytics', '@vercel/speed-insights', '@vercel/postgres', '@vercel/blob', '@vercel/kv'],
    envVars: ['VERCEL_URL', 'VERCEL_ENV', 'VERCEL_GIT_COMMIT_SHA'],
    requiredCreds: ['token'],
    optionalCreds: [],
    imports: ['Analytics', 'track', 'vercelPostgres']
  },
  resend: {
    dependencies: ['resend'],
    envVars: ['RESEND_API_KEY'],
    requiredCreds: ['apiKey'],
    optionalCreds: [],
    imports: ['Resend']
  },
  clerk: {
    dependencies: ['@clerk/nextjs', '@clerk/clerk-sdk-node'],
    envVars: ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'],
    requiredCreds: ['secretKey'],
    optionalCreds: [],
    imports: ['ClerkProvider', 'useAuth', 'currentUser']
  },
  auth0: {
    dependencies: ['@auth0/nextjs-auth0', 'auth0'],
    envVars: ['AUTH0_SECRET', 'AUTH0_BASE_URL', 'AUTH0_ISSUER_BASE_URL', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET'],
    requiredCreds: ['clientId', 'clientSecret', 'domain'],
    optionalCreds: [],
    imports: ['handleAuth', 'getSession']
  },
  openai: {
    dependencies: ['openai'],
    envVars: ['OPENAI_API_KEY', 'OPENAI_ORG_ID'],
    requiredCreds: ['apiKey'],
    optionalCreds: ['orgId'],
    imports: ['OpenAI', 'Configuration']
  },
  anthropic: {
    dependencies: ['@anthropic-ai/sdk'],
    envVars: ['ANTHROPIC_API_KEY'],
    requiredCreds: ['apiKey'],
    optionalCreds: [],
    imports: ['Anthropic']
  },
  aws: {
    dependencies: ['aws-sdk', '@aws-sdk/client-s3', '@aws-sdk/client-dynamodb'],
    envVars: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
    requiredCreds: ['accessKeyId', 'secretAccessKey', 'region'],
    optionalCreds: [],
    imports: ['S3', 'DynamoDB', 'fromEnv']
  },
  sendgrid: {
    dependencies: ['@sendgrid/mail'],
    envVars: ['SENDGRID_API_KEY'],
    requiredCreds: ['apiKey'],
    optionalCreds: [],
    imports: ['setApiKey', 'send']
  },
  twilio: {
    dependencies: ['twilio'],
    envVars: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
    requiredCreds: ['accountSid', 'authToken'],
    optionalCreds: [],
    imports: ['Twilio']
  },
  firebase: {
    dependencies: ['firebase', 'firebase-admin'],
    envVars: ['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID'],
    requiredCreds: ['apiKey', 'projectId'],
    optionalCreds: ['authDomain'],
    imports: ['initializeApp', 'getAuth', 'getFirestore']
  },
  prisma: {
    dependencies: ['prisma', '@prisma/client'],
    envVars: ['DATABASE_URL'],
    requiredCreds: ['databaseUrl'],
    optionalCreds: [],
    imports: ['PrismaClient']
  },
  mongodb: {
    dependencies: ['mongodb', 'mongoose'],
    envVars: ['MONGODB_URI', 'MONGO_URL'],
    requiredCreds: ['uri'],
    optionalCreds: [],
    imports: ['MongoClient', 'mongoose']
  },
  redis: {
    dependencies: ['redis', 'ioredis'],
    envVars: ['REDIS_URL', 'UPSTASH_REDIS_REST_URL'],
    requiredCreds: ['url'],
    optionalCreds: [],
    imports: ['createClient', 'Redis']
  },
  airtable: {
    dependencies: ['airtable'],
    envVars: ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID', 'AIRTABLE_PAT'],
    requiredCreds: ['apiKey', 'baseId'],
    optionalCreds: ['pat'],
    imports: ['Airtable']
  },
  notion: {
    dependencies: ['@notionhq/client'],
    envVars: ['NOTION_API_KEY', 'NOTION_DATABASE_ID', 'NOTION_TOKEN'],
    requiredCreds: ['apiKey'],
    optionalCreds: ['databaseId'],
    imports: ['Client', 'APIErrorCode']
  },
  contentful: {
    dependencies: ['contentful', 'contentful-management'],
    envVars: ['CONTENTFUL_SPACE_ID', 'CONTENTFUL_ACCESS_TOKEN', 'CONTENTFUL_MANAGEMENT_TOKEN', 'CONTENTFUL_ENVIRONMENT'],
    requiredCreds: ['spaceId', 'accessToken'],
    optionalCreds: ['managementToken', 'environment'],
    imports: ['createClient', 'contentfulManagement']
  },
  sanity: {
    dependencies: ['@sanity/client', 'next-sanity', 'sanity'],
    envVars: ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_API_TOKEN', 'NEXT_PUBLIC_SANITY_PROJECT_ID'],
    requiredCreds: ['projectId', 'dataset'],
    optionalCreds: ['token'],
    imports: ['createClient', 'sanityClient']
  },
  mailchimp: {
    dependencies: ['@mailchimp/mailchimp_marketing'],
    envVars: ['MAILCHIMP_API_KEY', 'MAILCHIMP_SERVER_PREFIX', 'MAILCHIMP_LIST_ID'],
    requiredCreds: ['apiKey', 'serverPrefix'],
    optionalCreds: ['listId'],
    imports: ['setConfig', 'lists']
  },
  hubspot: {
    dependencies: ['@hubspot/api-client'],
    envVars: ['HUBSPOT_ACCESS_TOKEN', 'HUBSPOT_API_KEY'],
    requiredCreds: ['accessToken'],
    optionalCreds: [],
    imports: ['Client', 'ApiClient']
  },
  shopify: {
    dependencies: ['@shopify/shopify-api', 'shopify-buy'],
    envVars: ['SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET', 'SHOPIFY_STORE_DOMAIN', 'SHOPIFY_ACCESS_TOKEN'],
    requiredCreds: ['apiKey', 'apiSecret', 'storeDomain'],
    optionalCreds: ['accessToken'],
    imports: ['shopifyApi', 'ApiVersion']
  },
  wordpress: {
    dependencies: ['wpapi', '@wordpress/api-fetch'],
    envVars: ['WORDPRESS_URL', 'WORDPRESS_USERNAME', 'WORDPRESS_PASSWORD', 'WORDPRESS_APPLICATION_PASSWORD'],
    requiredCreds: ['url'],
    optionalCreds: ['username', 'password', 'applicationPassword'],
    imports: ['WPAPI', 'apiFetch']
  },
  google_sheets: {
    dependencies: ['googleapis', 'google-spreadsheet'],
    envVars: ['GOOGLE_SHEETS_CLIENT_EMAIL', 'GOOGLE_SHEETS_PRIVATE_KEY', 'GOOGLE_SHEETS_SPREADSHEET_ID'],
    requiredCreds: ['clientEmail', 'privateKey'],
    optionalCreds: ['spreadsheetId'],
    imports: ['google', 'GoogleSpreadsheet']
  },
  calendly: {
    dependencies: ['calendly'],
    envVars: ['CALENDLY_API_KEY', 'CALENDLY_WEBHOOK_SIGNING_KEY'],
    requiredCreds: ['apiKey'],
    optionalCreds: ['webhookSigningKey'],
    imports: ['Calendly']
  },
  zapier: {
    dependencies: ['zapier-platform-core'],
    envVars: ['ZAPIER_WEBHOOK_URL', 'ZAPIER_API_KEY'],
    requiredCreds: [],
    optionalCreds: ['webhookUrl', 'apiKey'],
    imports: ['ZapierPlatform']
  },
  make: {
    dependencies: [],
    envVars: ['MAKE_WEBHOOK_URL', 'MAKE_API_TOKEN'],
    requiredCreds: [],
    optionalCreds: ['webhookUrl', 'apiToken'],
    imports: []
  },
  algolia: {
    dependencies: ['algoliasearch'],
    envVars: ['ALGOLIA_APP_ID', 'ALGOLIA_API_KEY', 'ALGOLIA_SEARCH_KEY', 'NEXT_PUBLIC_ALGOLIA_APP_ID'],
    requiredCreds: ['appId', 'apiKey'],
    optionalCreds: ['searchKey'],
    imports: ['algoliasearch', 'SearchClient']
  },
  postmark: {
    dependencies: ['postmark'],
    envVars: ['POSTMARK_API_TOKEN', 'POSTMARK_SERVER_TOKEN'],
    requiredCreds: ['serverToken'],
    optionalCreds: [],
    imports: ['ServerClient', 'Client']
  },
  cloudinary: {
    dependencies: ['cloudinary'],
    envVars: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'],
    requiredCreds: ['cloudName', 'apiKey', 'apiSecret'],
    optionalCreds: [],
    imports: ['v2', 'cloudinary']
  }
}

/**
 * Analyze a repository and detect services, framework, and requirements
 */
export async function analyzeRepository(
  installationId: number,
  owner: string,
  repo: string
): Promise<ProjectAnalysis> {
  try {
    // Fetch key files in parallel
    const files = await getMultipleFiles(
      installationId,
      owner,
      repo,
      [
        'package.json',
        '.env.example',
        '.env.local.example',
        'next.config.js',
        'next.config.mjs',
        'next.config.ts',
        'vercel.json',
        'vercel.ts',
        'vite.config.ts',
        'tsconfig.json',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        'bun.lockb'
      ]
    )

    // Parse package.json
    let packageJson: any = {}
    if (files['package.json']) {
      try {
        packageJson = JSON.parse(files['package.json'])
      } catch (e) {
        console.error('Failed to parse package.json:', e)
      }
    }

    // Detect framework
    const framework = detectFramework(packageJson, files)

    // Detect package manager
    const packageManager = detectPackageManager(files)

    // Detect services
    const services = detectServices(packageJson, files)

    // Extract env vars
    const envVarsNeeded = extractEnvVars(files)

    return {
      framework,
      services,
      packageManager,
      envVarsNeeded
    }
  } catch (error) {
    console.error('Error analyzing repository:', error)
    throw new Error('Failed to analyze repository')
  }
}

/**
 * Detect framework from package.json and config files
 */
function detectFramework(packageJson: any, files: Record<string, string | null>): DetectedFramework {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  }

  // Next.js
  if (deps['next']) {
    return {
      name: 'Next.js',
      version: deps['next'],
      type: 'nextjs'
    }
  }

  // React (not Next.js)
  if (deps['react'] && files['vite.config.ts']) {
    return {
      name: 'React + Vite',
      version: deps['react'],
      type: 'react'
    }
  }

  if (deps['react']) {
    return {
      name: 'React',
      version: deps['react'],
      type: 'react'
    }
  }

  // Vue
  if (deps['vue']) {
    return {
      name: 'Vue',
      version: deps['vue'],
      type: 'vue'
    }
  }

  // Svelte
  if (deps['svelte']) {
    return {
      name: 'Svelte',
      version: deps['svelte'],
      type: 'svelte'
    }
  }

  // Node.js backend
  if (deps['express'] || deps['fastify'] || deps['koa']) {
    return {
      name: 'Node.js',
      type: 'node'
    }
  }

  return {
    name: 'Unknown',
    type: 'unknown'
  }
}

/**
 * Detect package manager from lockfiles
 */
function detectPackageManager(files: Record<string, string | null>): 'npm' | 'yarn' | 'pnpm' | 'bun' {
  if (files['bun.lockb']) return 'bun'
  if (files['pnpm-lock.yaml']) return 'pnpm'
  if (files['yarn.lock']) return 'yarn'
  return 'npm'
}

/**
 * Detect services from dependencies and env vars
 */
function detectServices(packageJson: any, files: Record<string, string | null>): DetectedService[] {
  const detected: DetectedService[] = []
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  }

  const envExamples = [
    files['.env.example'] || '',
    files['.env.local.example'] || ''
  ].join('\n')

  for (const [serviceName, config] of Object.entries(SERVICE_PATTERNS)) {
    let confidence: 'high' | 'medium' | 'low' = 'low'
    let detected_flag = false

    // Check dependencies
    const hasDependency = config.dependencies.some(dep => dep in deps)

    // Check env vars
    const hasEnvVar = config.envVars.some(envVar => envExamples.includes(envVar))

    if (hasDependency && hasEnvVar) {
      confidence = 'high'
      detected_flag = true
    } else if (hasDependency) {
      confidence = 'medium'
      detected_flag = true
    } else if (hasEnvVar) {
      confidence = 'low'
      detected_flag = true
    }

    if (detected_flag) {
      detected.push({
        name: serviceName,
        confidence,
        detected: true,
        requiredCredentials: config.requiredCreds,
        optionalCredentials: config.optionalCreds
      })
    }
  }

  // Special detection for Vercel (check for config files)
  if (files['vercel.json'] || files['vercel.ts']) {
    const hasVercel = detected.find(s => s.name === 'vercel')
    if (!hasVercel) {
      detected.push({
        name: 'vercel',
        confidence: 'high',
        detected: true,
        requiredCredentials: ['token'],
        optionalCredentials: []
      })
    } else {
      hasVercel.confidence = 'high'
    }
  }

  // Special detection for Airtable (check package.json for usage patterns)
  const packageJsonStr = JSON.stringify(packageJson)
  if (packageJsonStr.includes('airtable') || envExamples.toLowerCase().includes('airtable')) {
    const hasAirtable = detected.find(s => s.name === 'airtable')
    if (!hasAirtable) {
      detected.push({
        name: 'airtable',
        confidence: 'medium',
        detected: true,
        requiredCredentials: ['apiKey', 'baseId'],
        optionalCredentials: ['pat']
      })
    }
  }

  // Sort by confidence
  detected.sort((a, b) => {
    const order = { high: 3, medium: 2, low: 1 }
    return order[b.confidence] - order[a.confidence]
  })

  return detected
}

/**
 * Extract all environment variables from .env.example files
 */
function extractEnvVars(files: Record<string, string | null>): string[] {
  const envExamples = [
    files['.env.example'] || '',
    files['.env.local.example'] || ''
  ].join('\n')

  const envVars: string[] = []
  const lines = envExamples.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue

    // Extract variable name
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/)
    if (match) {
      envVars.push(match[1])
    }
  }

  return Array.from(new Set(envVars)) // Remove duplicates
}

/**
 * Get recommended setup steps based on detected services
 */
export function getSetupRecommendations(analysis: ProjectAnalysis): string[] {
  const recommendations: string[] = []

  // Framework-specific
  if (analysis.framework.type === 'nextjs') {
    recommendations.push('✅ Next.js detected - ready for server-side rendering and API routes')
  }

  // Service-specific
  for (const service of analysis.services) {
    if (service.confidence === 'high' || service.confidence === 'medium') {
      switch (service.name) {
        case 'supabase':
          recommendations.push('🔹 Connect Supabase for database and authentication')
          break
        case 'stripe':
          recommendations.push('💳 Connect Stripe for payment processing')
          break
        case 'vercel':
          recommendations.push('▲ Connect Vercel for automatic deployments')
          break
        case 'resend':
          recommendations.push('📧 Connect Resend for transactional emails')
          break
        case 'airtable':
          recommendations.push('📊 Connect Airtable for spreadsheet database')
          break
        case 'notion':
          recommendations.push('📝 Connect Notion for content management')
          break
        case 'contentful':
          recommendations.push('📰 Connect Contentful headless CMS')
          break
        case 'sanity':
          recommendations.push('🎨 Connect Sanity CMS for content')
          break
        case 'mailchimp':
          recommendations.push('📬 Connect Mailchimp for email marketing')
          break
        case 'hubspot':
          recommendations.push('🎯 Connect HubSpot CRM')
          break
        case 'shopify':
          recommendations.push('🛒 Connect Shopify for e-commerce')
          break
        case 'wordpress':
          recommendations.push('📄 Connect WordPress for content')
          break
        case 'google_sheets':
          recommendations.push('📈 Connect Google Sheets for data')
          break
        case 'calendly':
          recommendations.push('📅 Connect Calendly for scheduling')
          break
        case 'algolia':
          recommendations.push('🔍 Connect Algolia for search')
          break
        case 'cloudinary':
          recommendations.push('🖼️ Connect Cloudinary for media management')
          break
        case 'postmark':
          recommendations.push('✉️ Connect Postmark for transactional emails')
          break
        case 'sendgrid':
          recommendations.push('📨 Connect SendGrid for email delivery')
          break
      }
    }
  }

  return recommendations
}
