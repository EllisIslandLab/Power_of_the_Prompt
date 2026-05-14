# Project Connection Implementation Guide

## Overview

This guide explains how to implement the "Connect Your Project" feature after a client has paid. The system allows clients to connect their GitHub repo and all associated services (Vercel, Supabase, Stripe, etc.) so you can make changes, test them, and deploy.

## ✅ What I've Created

### 1. Database Schema (`supabase/migrations/20260511000001_add_client_projects.sql`)

Three new tables:

**`client_projects`** - Main project information
- GitHub repo details
- Vercel project info  
- Framework & package manager detection
- Connection status

**`client_service_credentials`** - Encrypted service credentials
- Stores API keys, OAuth tokens
- Encrypted at rest
- One row per service per project

**`client_environment_variables`** - Client env vars
- For services not requiring OAuth
- Encrypted values
- Can mark as required/optional

### 2. UI Flow (`src/app/portal/projects/new/page.tsx`)

Three-step wizard:
1. **GitHub Connection** - OAuth or manual URL entry
2. **Service Detection** - Auto-detect services from package.json
3. **Credentials Input** - Collect API keys for each service
4. **Completion** - Ready to start building

### 3. API Routes

**`/api/integrations/detect-services`** - Analyzes GitHub repo
- Fetches package.json
- Fetches .env.example
- Detects frameworks & services
- Returns list of detected services

**`/api/integrations/save-credentials`** - Saves encrypted credentials
- Validates user owns project
- Encrypts sensitive data
- Stores in `client_service_credentials`

### 4. Encryption Library (`src/lib/encryption.ts`)

Secure credential storage:
- AES-256-CBC encryption
- Unique IV per encryption
- One-way hashing for sensitive comparisons

### 5. Documentation (`INTEGRATION_SHORTCUTS.md`)

Complete reference for:
- OAuth setup for GitHub, Vercel, Stripe
- API key collection for Supabase, Resend, etc.
- Security best practices
- Recommended UX flows

## 🚀 Implementation Steps

### Step 1: Database Setup

```bash
# Run the migration
cd supabase
supabase db push

# Or if using hosted Supabase
psql <your-connection-string> -f migrations/20260511000001_add_client_projects.sql
```

### Step 2: Environment Variables

Add to your `.env.local`:

```bash
# Generate with: openssl rand -hex 32
CREDENTIALS_ENCRYPTION_KEY=<64-character-hex-string>

# GitHub OAuth (create at https://github.com/settings/developers)
NEXT_PUBLIC_GITHUB_CLIENT_ID=Iv1.xxxxx
GITHUB_CLIENT_SECRET=xxxxx
GITHUB_REDIRECT_URI=https://weblaunchacademy.com/api/integrations/github/callback

# Optional: Vercel OAuth (for auto-detection of projects)
VERCEL_CLIENT_ID=xxxxx
VERCEL_CLIENT_SECRET=xxxxx

# Optional: Stripe Connect (for secure Stripe integration)
STRIPE_CONNECT_CLIENT_ID=ca_xxxxx
```

Generate encryption key:
```bash
openssl rand -hex 32
```

### Step 3: Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** Web Launch Academy
   - **Homepage URL:** https://weblaunchacademy.com
   - **Authorization callback URL:** https://weblaunchacademy.com/api/integrations/github/callback
4. Copy Client ID & Secret to .env.local

### Step 4: Create GitHub Callback Handler

Create `/src/app/api/integrations/github/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect('/portal/projects/new?error=no_code')
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    })

    const { access_token } = await tokenResponse.json()

    if (!access_token) {
      throw new Error('No access token received')
    }

    // Get user's repositories
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github+json'
      }
    })

    const repos = await reposResponse.json()

    // Store access token in session (temporary)
    // You'll need to implement session storage here
    // For now, redirect to project selection with repos in URL (not recommended for production)

    // Better: Store in temporary session/cookie and redirect
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect('/signin')
    }

    // Temporarily store GitHub access token in user_settings or similar
    // This is just for the project setup flow
    await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        github_access_token_temp: access_token
      })

    return NextResponse.redirect('/portal/projects/new?step=select_repo')
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.redirect('/portal/projects/new?error=oauth_failed')
  }
}
```

### Step 5: Modify Billing Success Flow

In your Stripe webhook or checkout success handler, redirect to project connection:

```typescript
// After successful payment
if (paymentSuccess) {
  // Update account balance
  await supabase
    .from('client_accounts')
    .update({ account_balance: amount })
    .eq('user_id', userId)

  // Redirect to project connection if they don't have a project yet
  const { data: existingProjects } = await supabase
    .from('client_projects')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (!existingProjects || existingProjects.length === 0) {
    return NextResponse.redirect('/portal/projects/new')
  } else {
    return NextResponse.redirect('/portal')
  }
}
```

### Step 6: Update Chat Interface to Use Project Context

Modify `/src/app/portal/components/ChatInterface.tsx` to:

1. Check if user has a connected project
2. If not, show "Connect Project" button
3. If yes, use project context in AI prompts

```typescript
// In ChatInterface.tsx
useEffect(() => {
  async function checkProject() {
    const { data: project } = await supabase
      .from('client_projects')
      .select('*, client_service_credentials(*)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!project) {
      setShowConnectProjectPrompt(true)
    } else {
      setCurrentProject(project)
    }
  }

  checkProject()
}, [user])
```

## 🔒 Security Considerations

### 1. Encryption
- All API keys, secrets, and tokens are encrypted at rest
- Unique IV (initialization vector) per encryption
- 256-bit AES encryption
- Never log decrypted credentials

### 2. Access Control
- RLS policies ensure users only see their own projects
- Server-side validation that user owns project before operations
- Credentials never sent to client (only metadata)

### 3. Token Scope
- Request minimal GitHub permissions (repo access only)
- Vercel tokens scoped to deployments, not billing
- Stripe Connect for restricted access to customer accounts

### 4. Audit Trail
- Log all credential access
- Track last_validated_at for each service
- Monitor for invalid credentials

## 📋 Integration Checklist

### GitHub Integration
- [ ] Create OAuth App
- [ ] Add callback route
- [ ] Store access token securely
- [ ] Test repo access
- [ ] Handle token expiration

### Vercel Integration (Optional)
- [ ] Create Vercel integration
- [ ] OAuth flow for project linking
- [ ] Test deployment creation
- [ ] Handle team vs personal projects

### Supabase Integration
- [ ] Collect Project URL
- [ ] Collect Anon Key
- [ ] Optionally collect Service Role Key
- [ ] Validate connection
- [ ] Test RLS policies

### Stripe Integration (If Applicable)
- [ ] Decide: OAuth or API keys
- [ ] If OAuth: Setup Stripe Connect
- [ ] If keys: Collect Secret Key
- [ ] Validate test vs production mode

## 🎯 Next Steps

### MVP (Week 1)
1. ✅ Database schema created
2. ✅ Basic UI flow created
3. ✅ Service detection API created
4. ✅ Encryption library created
5. ⏳ Run migration
6. ⏳ Create GitHub OAuth app
7. ⏳ Implement callback handler
8. ⏳ Test full flow

### Phase 2 (Week 2)
1. Add Vercel OAuth integration
2. Auto-detect Vercel projects from GitHub repo
3. Add service validation (test credentials work)
4. Add project dashboard (show connection status)

### Phase 3 (Week 3)
1. Implement Stripe Connect
2. Add multiple project support
3. Add project switching in chat
4. Add webhooks for sync

## 🐛 Troubleshooting

### "Failed to detect services"
- Check GitHub repo is public OR access token is valid
- Verify package.json exists in repo root
- Check .env.example file format

### "Encryption key error"
- Verify CREDENTIALS_ENCRYPTION_KEY is exactly 64 characters (hex)
- Generate new key: `openssl rand -hex 32`
- Don't lose this key or you can't decrypt existing credentials!

### "GitHub OAuth fails"
- Verify callback URL matches exactly (trailing slash matters)
- Check client ID/secret are correct
- Ensure OAuth app is not suspended

### "Credentials not saving"
- Check RLS policies are correct
- Verify user owns the project
- Check encryption key is set
- Look for errors in server logs

## 📚 Additional Resources

- GitHub OAuth: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps
- Vercel API: https://vercel.com/docs/rest-api
- Stripe Connect: https://stripe.com/docs/connect
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security

## 💡 Tips

1. **Start Simple**: Begin with manual entry for all services, add OAuth later
2. **Test with Public Repos**: Easier to test without managing access tokens
3. **Use Test Mode**: All services should use test/sandbox credentials initially
4. **Validate Early**: Test credentials immediately after saving
5. **Clear Errors**: Show helpful error messages for common issues

## Example .env.local

```bash
# Existing vars
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# New vars for project connection
CREDENTIALS_ENCRYPTION_KEY=<run: openssl rand -hex 32>
NEXT_PUBLIC_GITHUB_CLIENT_ID=Iv1.xxxxx
GITHUB_CLIENT_SECRET=xxxxx
GITHUB_REDIRECT_URI=http://localhost:3000/api/integrations/github/callback

# Optional: Vercel
VERCEL_CLIENT_ID=xxxxx
VERCEL_CLIENT_SECRET=xxxxx

# Optional: Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_xxxxx
```

---

**Ready to implement?** Start with Step 1 (run migration) and work through the checklist!
