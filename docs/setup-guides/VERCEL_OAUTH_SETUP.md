# Vercel OAuth Integration Setup

## Creating a Vercel Integration

### Step 1: Create Integration

1. Go to: **https://vercel.com/dashboard/integrations/console**
2. Click **Create Integration**

**Basic Information:**
- **Integration Name:** `Web Launch Academy`
- **Logo:** Upload your logo (optional)
- **Description:** `AI-powered website revision and deployment assistant`
- **Website URL:** `https://weblaunchacademy.com`
- **Redirect URL:** `https://weblaunchacademy.com/api/integrations/vercel/callback`

**Scopes (select these):**
- ✅ **Projects** - Read & Write (access and modify projects)
- ✅ **Deployments** - Read & Write (create and manage deployments)
- ✅ **Logs** - Read (access deployment logs)
- ❌ **Teams** - Not needed initially
- ❌ **Domains** - Not needed initially

### Step 2: Get Credentials

After creation, you'll receive:
- **Client ID:** `oac_XXXXXXXX`
- **Client Secret:** Click "Create Client Secret"

### Step 3: Configuration Webhook (Optional)

If you want to be notified when users install/uninstall:
- **Configuration URL:** `https://weblaunchacademy.com/api/integrations/vercel/configure`

### Step 4: Add to Environment

```bash
# Vercel OAuth
VERCEL_CLIENT_ID=oac_XXXXXXXX
VERCEL_CLIENT_SECRET=your_secret_here
VERCEL_REDIRECT_URI=https://weblaunchacademy.com/api/integrations/vercel/callback
```

## OAuth Flow

### User Journey

1. **User clicks "Connect Vercel"**
2. **Redirect to Vercel OAuth:**
   ```
   https://vercel.com/integrations/YOUR_INTEGRATION_SLUG/new
   ```
3. **User selects team/personal account**
4. **User authorizes scopes**
5. **Vercel redirects to callback:**
   ```
   https://weblaunchacademy.com/api/integrations/vercel/callback?code=XXX&next=XXX
   ```
6. **Your app exchanges code for token**

### Token Exchange

```typescript
const response = await fetch('https://api.vercel.com/v2/oauth/access_token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: VERCEL_CLIENT_ID,
    client_secret: VERCEL_CLIENT_SECRET,
    code: authCode,
    redirect_uri: VERCEL_REDIRECT_URI
  })
})

const { access_token, team_id, user_id } = await response.json()
```

## Common API Operations

### List Projects

```typescript
const response = await fetch('https://api.vercel.com/v9/projects', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

### Create Deployment

```typescript
const response = await fetch(`https://api.vercel.com/v13/deployments`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'my-project',
    gitSource: {
      type: 'github',
      repo: 'user/repo',
      ref: 'feature-branch'
    }
  })
})
```

### Get Deployment Status

```typescript
const response = await fetch(
  `https://api.vercel.com/v13/deployments/${deploymentId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
)
```

## Auto-Linking GitHub to Vercel

When a user connects both GitHub and Vercel, you can:

1. **Detect matching projects:**
   - Compare GitHub repo name with Vercel project name
   - Check git provider settings on Vercel project

2. **Suggest linking:**
   - "We found a Vercel project that matches your GitHub repo"
   - Show confirmation dialog

3. **Store association:**
   - Link in `client_projects` table
   - Store both `github_repository_id` and `vercel_project_id`

## Rate Limits

- **Free tier:** 100 requests / hour / user
- **Pro tier:** 300 requests / hour / user
- **Enterprise:** Higher limits

## Security

- **Token storage:** Encrypt access tokens
- **Token refresh:** Vercel tokens don't expire (until revoked)
- **Revocation:** User can revoke in Vercel dashboard
- **Scopes:** Only request minimum required scopes

## Testing

### Local Development

Use ngrok or similar:
```bash
ngrok http 3000
# Update redirect URI to: https://YOUR_ID.ngrok.io/api/integrations/vercel/callback
```

### Test Installation

1. Install on your own Vercel account
2. Verify OAuth flow works
3. Test API calls with returned token
4. Test deployment creation

## Resources

- [Vercel Integrations Docs](https://vercel.com/docs/integrations)
- [OAuth Documentation](https://vercel.com/docs/integrations/oauth)
- [API Reference](https://vercel.com/docs/rest-api)
