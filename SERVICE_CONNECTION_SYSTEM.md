# Service Connection System - Complete Implementation

## Overview
Unified system for connecting external services with support for both OAuth and manual credential entry.

## Components

### 1. ConnectServiceModal (`/src/app/portal/components/ConnectServiceModal.tsx`)
**Universal modal for connecting all services**

**Features:**
- Supports both OAuth and manual credential entry
- Service-specific field validation
- Real-time credential validation before saving
- Links to service documentation
- Visual mode selection (Quick Connect vs Manual Entry)

**Supported Services:**

| Service | OAuth | Manual | Fields |
|---------|-------|--------|--------|
| **GitHub** | ✅ | ✅ | Personal Access Token |
| **Vercel** | ✅ | ✅ | Access Token |
| **Stripe** | ✅ | ✅ | Publishable Key, Secret Key, Webhook Secret |
| **Supabase** | ❌ | ✅ | Project URL, Anon Key, Service Role Key |
| **Airtable** | ❌ | ✅ | API Key, Base ID |
| **Resend** | ❌ | ✅ | API Key |

### 2. OAuth Install Routes
**Handle OAuth initiation with redirect support**

#### GitHub (`/api/integrations/github/install/route.ts`)
- Accepts `redirect_to` query parameter
- Stores redirect URL in cookie
- Redirects to GitHub App installation

#### Vercel (`/api/integrations/vercel/install/route.ts`)
- Accepts `redirect_to` query parameter
- Stores redirect URL in cookie
- Redirects to Vercel OAuth

#### Stripe (`/api/integrations/stripe/install/route.ts`)
- Accepts `redirect_to` query parameter
- Stores redirect URL in cookie
- Redirects to Stripe Connect OAuth

### 3. OAuth Callback Routes
**Process OAuth responses and redirect back**

All callback routes now:
- Read redirect cookie
- Process authorization
- Store encrypted credentials in database
- Redirect to original page or default location
- Clean up cookies

### 4. Validation API (`/api/integrations/validate/route.ts`)
**Two modes of operation:**

#### Mode 1: Validate New Credentials (Before Saving)
```typescript
POST /api/integrations/validate
{
  "service": "stripe",
  "credentials": {
    "secret_key": "sk_test_...",
    "publishable_key": "pk_test_..."
  }
}
```

#### Mode 2: Validate Existing Credentials (From Database)
```typescript
POST /api/integrations/validate
{
  "services": ["github", "vercel", "stripe"]
}
```

**Validation Functions:**
- Tests actual API connectivity
- Validates credential formats
- Returns detailed error messages
- Updates validation timestamps

### 5. Save Credentials API (`/api/integrations/save-credentials/route.ts`)
**Supports both user-level and project-level credentials**

**User-Level** (Settings page):
```typescript
POST /api/integrations/save-credentials
{
  "service": "stripe",
  "credentials": { ... },
  "userId": "..."
  // No projectId
}
```

**Project-Level** (Project wizard):
```typescript
POST /api/integrations/save-credentials
{
  "service": "stripe",
  "credentials": { ... },
  "projectId": "...",
  "userId": "..."
}
```

## Workflows

### Workflow 1: Developer Setup (You set up everything except Stripe)

```
1. Create client portal account
2. Go to Settings → Connectors
3. Connect GitHub (OAuth - one click)
4. Connect Vercel (OAuth - one click)
5. Connect Supabase (Manual - paste keys)
6. Connect Airtable (Manual - paste keys)
7. Leave Stripe disconnected
8. Hand off portal to client
```

### Workflow 2: Client Self-Service (Client connects their Stripe)

```
1. Client logs into portal
2. Go to Settings → Connectors
3. Click "Connect" on Stripe
4. Choose "Quick Connect"
5. Authorize with their Stripe account
6. Redirected back to Settings
7. Done! ✅
```

### Workflow 3: Manual Entry Fallback

```
1. Click "Connect" on any service
2. Choose "Manual Entry"
3. Follow instructions to get keys
4. Paste keys into form
5. System validates credentials
6. If valid, saves encrypted to database
7. Done! ✅
```

## Security Model

### Encryption
- All sensitive credentials encrypted with `encrypt()` function
- Uses AES-256-GCM encryption
- Encryption key stored securely in env vars

### Storage Levels
**User-Level** (No project_id):
- Accessible across all user's projects
- Stored once, used everywhere
- Examples: GitHub, Vercel

**Project-Level** (With project_id):
- Specific to one project
- Isolated from other projects
- Examples: Supabase, Stripe (when project-specific)

### RLS (Row Level Security)
```sql
-- Users can only see their own credentials
CREATE POLICY "Users can view own credentials"
  ON client_service_credentials
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Cookie Security
- HTTP-only cookies for OAuth state
- Secure flag in production
- SameSite=lax
- 10-minute expiration
- Auto-cleanup after use

## Database Schema

```sql
client_service_credentials {
  id: uuid
  user_id: uuid (FK to users)
  project_id: uuid (FK to client_projects) -- Nullable for user-level
  service_name: text
  access_token_encrypted: text
  api_key_encrypted: text
  api_secret_encrypted: text
  refresh_token_encrypted: text
  metadata: jsonb
  is_valid: boolean
  last_validated_at: timestamptz
  created_at: timestamptz
  updated_at: timestamptz
}
```

## Benefits

### For Developers (You)
✅ Set up all services yourself with one-click OAuth
✅ Leave client-owned services for them to connect
✅ Manual entry fallback when OAuth fails
✅ All credentials encrypted and secure
✅ Easy to add new services

### For Clients
✅ One-click connection for their services
✅ No need to find/copy API keys
✅ OAuth keeps their credentials private
✅ Can reconnect anytime
✅ Clear instructions when needed

### For the System
✅ Consistent interface for all services
✅ Validated before saving
✅ Encrypted at rest
✅ User and project-level support
✅ Backward compatible with existing flows

## Adding New Services

To add a new service:

1. **Add config to ConnectServiceModal.tsx:**
```typescript
servicename: {
  displayName: 'Service Name',
  supportsOAuth: true/false,
  oauthUrl: () => '/api/integrations/servicename/install?redirect_to=/portal/settings',
  fields: [...],
  docsUrl: '...',
  getKeysInstructions: '...'
}
```

2. **Add validation to validate/route.ts:**
```typescript
async function validateServicenamePlain(credentials: any): Promise<ValidationResult> {
  // Validate credentials by calling service API
}
```

3. **Add save logic to save-credentials/route.ts:**
```typescript
case 'servicename':
  encryptedData = {
    api_key_encrypted: encrypt(credentials.api_key)
  }
  break
```

4. **If OAuth: Create install and callback routes**
   - `/api/integrations/servicename/install/route.ts`
   - `/api/integrations/servicename/callback/route.ts`

## Testing Checklist

- [ ] OAuth flow redirects back to settings
- [ ] Manual entry validates before saving
- [ ] Invalid credentials show error message
- [ ] Valid credentials save successfully
- [ ] Reconnect updates existing credentials
- [ ] User-level credentials work across projects
- [ ] Project-level credentials stay isolated
- [ ] All cookies cleaned up after OAuth
- [ ] RLS prevents accessing other users' credentials
- [ ] Credentials encrypted in database
