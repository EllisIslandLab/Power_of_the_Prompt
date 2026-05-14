# Service Integration Shortcuts for Client Projects

## Quick Reference: OAuth & API Setup

### GitHub
**Best approach:** GitHub App (not OAuth App)
- **Why:** Can install on specific repos, fine-grained permissions
- **Setup:** https://github.com/settings/apps/new
- **Permissions needed:** 
  - Contents: Read & Write (to create branches, PRs)
  - Pull Requests: Read & Write
  - Metadata: Read
- **Webhook:** Optional for real-time sync
- **Redirect:** `https://weblaunchacademy.com/api/integrations/github/callback`

**Alternative:** Simple OAuth
- **Client ID/Secret:** https://github.com/settings/developers
- **Scopes:** `repo`, `read:user`

### Vercel
**Best approach:** OAuth + API
- **OAuth:** https://vercel.com/integrations
- **Create Integration:** https://vercel.com/dashboard/integrations/new
- **API Docs:** https://vercel.com/docs/rest-api
- **Key endpoints:**
  - List projects: `GET /v9/projects`
  - Create deployment: `POST /v13/deployments`
  - Link to GitHub: Auto-detected if GitHub connected

**Manual fallback:** User provides Vercel token
- **Token:** Settings → Tokens → Create
- **Store in:** `client_service_credentials.api_key_encrypted`

### Supabase
**No OAuth available** - Use API keys
- **What to collect:**
  - Project URL: `https://xxx.supabase.co`
  - Anon key (public): `eyJhbGc...`
  - Service role key (secret): `eyJhbGc...` - for admin operations
- **Detection:** Scan for `@supabase/supabase-js` in package.json
- **Management API:** https://api.supabase.com (requires access token)

### Stripe
**Best approach:** Stripe Connect (Express)
- **Why:** Users authorize without sharing API keys
- **Setup:** https://dashboard.stripe.com/settings/applications
- **Flow:** OAuth → get connected account ID → make API calls on their behalf
- **Docs:** https://stripe.com/docs/connect

**Manual fallback:** Test/Live keys
- **Detect:** Scan for `stripe` in package.json
- **Keys:** Test Secret Key, Live Secret Key, Webhook Secret

### Resend
**No OAuth** - API key only
- **Key:** https://resend.com/api-keys
- **Detect:** Scan for `resend` in package.json

### Clerk / Auth0 / Supabase Auth
**Depends on provider:**
- **Clerk:** API keys (no OAuth)
- **Auth0:** Machine-to-Machine app
- **Supabase Auth:** Included in Supabase project keys

### Database Detection
**Scan for:**
- PostgreSQL: `pg`, `@vercel/postgres`, `@supabase/supabase-js`
- MySQL: `mysql2`, `@planetscale/database`
- MongoDB: `mongodb`, `mongoose`
- Prisma: `prisma` (read schema.prisma for provider)

## Implementation Strategy

### Phase 1: MVP (Week 1)
1. GitHub OAuth → user selects repo
2. Manual text inputs for other services
3. Store encrypted in `client_service_credentials`
4. Show connection status: ✅ Connected | ⚠️ Not Connected

### Phase 2: Smart Detection (Week 2)
1. Clone repo to temp directory
2. Scan `package.json` dependencies
3. Scan for common env var patterns in `.env.example`
4. Show: "We detected: Stripe, Supabase, Vercel - connect them?"

### Phase 3: OAuth Everything (Week 3)
1. Add Vercel OAuth
2. Add Stripe Connect
3. Auto-link GitHub repo → Vercel project
4. Validate connections before allowing chat

### Phase 4: Automatic Sync (Future)
1. GitHub webhooks → detect new commits
2. Vercel webhooks → detect deployments
3. Keep codebase context fresh for AI

## Security Best Practices

### Encryption
```typescript
// Use Supabase Vault or encryption function
import { createCipheriv, createDecipheriv } from 'crypto'

const ENCRYPTION_KEY = process.env.CREDENTIALS_ENCRYPTION_KEY! // 32 bytes
const IV_LENGTH = 16

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts.shift()!, 'hex')
  const encrypted = Buffer.from(parts.join(':'), 'hex')
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let decrypted = decipher.update(encrypted)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
```

### Never Log Credentials
```typescript
// BAD
console.log('Token:', token)

// GOOD
console.log('Token received:', token ? 'yes' : 'no')
console.log('Token length:', token?.length)
```

### Rotate Tokens
- GitHub tokens: No expiry (but can revoke)
- Vercel tokens: No expiry (but can revoke)
- Stripe: Use OAuth (tokens refresh automatically)

### Least Privilege
- GitHub: Only request repo access, not org admin
- Vercel: Only request deployment access, not billing
- Stripe: Use Connect (restricted access)

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── integrations/
│   │   │   ├── github/
│   │   │   │   ├── callback/route.ts
│   │   │   │   └── install/route.ts
│   │   │   ├── vercel/
│   │   │   │   └── callback/route.ts
│   │   │   ├── stripe/
│   │   │   │   └── connect/route.ts
│   │   │   └── detect-services/route.ts
│   │   └── projects/
│   │       ├── create/route.ts
│   │       ├── [id]/
│   │       │   ├── sync/route.ts
│   │       │   └── validate/route.ts
│   └── portal/
│       ├── projects/
│       │   ├── page.tsx (list projects)
│       │   ├── new/page.tsx (connect new project)
│       │   └── [id]/
│       │       ├── page.tsx (project dashboard)
│       │       └── settings/page.tsx (connections)
├── lib/
│   ├── integrations/
│   │   ├── github.ts
│   │   ├── vercel.ts
│   │   ├── stripe.ts
│   │   └── detector.ts
│   └── encryption.ts
```

## Recommended UX Flow

1. **After Payment Success:**
   ```
   ✅ Payment received! Your account balance is $50.00
   
   🚀 Let's connect your project
   
   [Connect GitHub Repository]
   ```

2. **GitHub Connection:**
   ```
   🔗 Connect Your Repository
   
   [Authorize with GitHub]
   
   → User authorizes
   → Shows list of repos
   → User selects "acme-app"
   → Clones repo metadata (not full code)
   ```

3. **Service Detection:**
   ```
   🔍 Analyzing your project...
   
   We detected these services in your package.json:
   
   ✅ Next.js 15.1.0
   ✅ Supabase (needs connection)
   ✅ Stripe (needs connection)
   ✅ Resend (needs connection)
   
   [Connect All Services →]
   ```

4. **Credential Collection:**
   ```
   🔧 Connect Supabase
   
   Project URL: [https://xxx.supabase.co    ]
   Anon Key:    [eyJhbGc...                  ]
   Service Key: [eyJhbGc...                  ] (optional, for migrations)
   
   💡 Where to find: supabase.com/dashboard → Settings → API
   
   [Save & Continue]
   ```

5. **Ready State:**
   ```
   ✅ All set! Your project is connected.
   
   Project: acme-app
   Repository: github.com/user/acme-app
   Framework: Next.js 15
   
   Connected Services:
   ✅ GitHub
   ✅ Vercel (production: acme-app.vercel.app)
   ✅ Supabase
   ✅ Stripe
   
   [Start Building →]
   ```

## Environment Variable Template Detection

Scan `.env.example` or `.env.local.example` for patterns:

```typescript
const SERVICE_PATTERNS = {
  supabase: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ],
  stripe: [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ],
  resend: ['RESEND_API_KEY'],
  clerk: ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'],
  vercel: ['VERCEL_URL', 'VERCEL_ENV'],
  openai: ['OPENAI_API_KEY'],
  anthropic: ['ANTHROPIC_API_KEY'],
}

async function detectServices(repoContent: string) {
  const envExample = await getFileContent(repo, '.env.example')
  const packageJson = await getFileContent(repo, 'package.json')
  
  const detected = []
  
  // Check env vars
  for (const [service, patterns] of Object.entries(SERVICE_PATTERNS)) {
    if (patterns.some(p => envExample.includes(p))) {
      detected.push(service)
    }
  }
  
  // Check package.json
  const deps = JSON.parse(packageJson).dependencies || {}
  if (deps['@supabase/supabase-js']) detected.push('supabase')
  if (deps['stripe']) detected.push('stripe')
  if (deps['resend']) detected.push('resend')
  
  return [...new Set(detected)] // unique
}
```
