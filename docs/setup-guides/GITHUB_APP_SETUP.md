# GitHub App Setup Guide

## Why GitHub App vs OAuth App?

**GitHub App advantages:**
- Fine-grained repository permissions
- Can be installed on organizations
- Installation tokens expire automatically (more secure)
- Webhooks are built-in
- Better rate limits (5000/hour vs 60/hour)
- Can act on behalf of the app, not a specific user

**Perfect for:** Accessing client repositories, creating branches, making PRs

## Creating the GitHub App

### Step 1: Register New GitHub App

1. Go to: **https://github.com/settings/apps/new**
2. Fill in the form:

**Basic Information:**
- **GitHub App name:** `Web Launch Academy` (must be unique globally)
- **Homepage URL:** `https://weblaunchacademy.com`
- **Callback URL:** `https://weblaunchacademy.com/api/integrations/github/callback`
- **Setup URL (optional):** `https://weblaunchacademy.com/portal/projects/new?step=github_setup`
- **Webhook URL:** `https://weblaunchacademy.com/api/webhooks/github`
- **Webhook secret:** Generate with `openssl rand -hex 20` - save this!

**Repository Permissions (select "Read & write"):**
- ✅ Contents (read & write) - Read/modify files
- ✅ Pull requests (read & write) - Create PRs
- ✅ Metadata (read-only) - Required for all apps
- ✅ Commit statuses (read & write) - Optional: for CI integration
- ✅ Webhooks (read-only) - Receive repository events

**Organization Permissions:**
- ❌ None needed for now

**User Permissions:**
- ❌ None needed

**Subscribe to events (webhooks):**
- ✅ Push - When code is pushed
- ✅ Pull request - When PRs are opened/closed
- ✅ Repository - When repos are added/removed
- ✅ Installation - When app is installed/uninstalled

**Where can this GitHub App be installed?**
- ⚪ Any account (recommended for production)
- ⚪ Only on this account (for testing)

3. Click **Create GitHub App**

### Step 2: Generate Private Key

After creation:

1. Scroll down to **Private keys**
2. Click **Generate a private key**
3. A `.pem` file will download
4. Save this securely - you cannot download it again!

```bash
# Move to secure location
mv ~/Downloads/web-launch-academy.*.private-key.pem ~/.ssh/github-app-private-key.pem
chmod 600 ~/.ssh/github-app-private-key.pem
```

### Step 3: Get Your App Details

From the app settings page, note:

- **App ID:** (e.g., `123456`)
- **Client ID:** (e.g., `Iv1.a1b2c3d4e5f6g7h8`)
- **Client secret:** Click "Generate a new client secret" - copy it!

### Step 4: Add to Environment Variables

```bash
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_APP_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_APP_CLIENT_SECRET=your_client_secret_here
GITHUB_APP_PRIVATE_KEY_PATH=/home/ellis/.ssh/github-app-private-key.pem
GITHUB_APP_WEBHOOK_SECRET=your_webhook_secret_here

# Or store the private key directly (base64 encoded)
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"
```

### Step 5: Install on Test Repository

1. Go to app settings page
2. Click **Install App** (left sidebar)
3. Select your account/organization
4. Choose:
   - ⚪ All repositories (for testing)
   - ⚪ Only select repositories (for production)
5. Click **Install**
6. You'll be redirected to your callback URL with `?installation_id=XXXXX&setup_action=install`

## Installation Flow

### User Journey

1. **User clicks "Connect GitHub"** in portal
2. **Redirect to GitHub App installation page:**
   ```
   https://github.com/apps/web-launch-academy/installations/new
   ```
3. **User selects repositories** to give access
4. **User clicks "Install"**
5. **GitHub redirects to callback URL:**
   ```
   https://weblaunchacademy.com/api/integrations/github/callback?installation_id=12345&setup_action=install
   ```
6. **Your app:**
   - Receives `installation_id`
   - Exchanges for installation token
   - Fetches list of accessible repositories
   - Stores in database
   - Redirects to project setup flow

### Multiple Users, Same Repo

GitHub Apps handle this well:
- App is installed once on a repository
- Multiple users can authorize the app
- Each user gets their own OAuth token
- Installation tokens work for all users who've authorized

## API Authentication

### Installation Access Token

For accessing repositories:

```typescript
import { App } from '@octokit/app'

const app = new App({
  appId: process.env.GITHUB_APP_ID!,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
})

// Get installation token (expires after 1 hour)
const { data: { token } } = await app.octokit.request(
  'POST /app/installations/{installation_id}/access_tokens',
  { installation_id: installationId }
)

// Use token to access repos
const octokit = new Octokit({ auth: token })
```

### User Access Token

For acting on behalf of a user:

```typescript
// OAuth flow - user authorizes app
const { data: { access_token } } = await octokit.request(
  'POST /login/oauth/access_token',
  {
    client_id: process.env.GITHUB_APP_CLIENT_ID,
    client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
    code: authCode
  }
)
```

## Webhook Verification

Verify webhook signatures:

```typescript
import crypto from 'crypto'

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}

// In webhook handler
const signature = req.headers['x-hub-signature-256']
const rawBody = await req.text()

if (!verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET)) {
  return new Response('Invalid signature', { status: 401 })
}
```

## Testing Locally

Use GitHub CLI or ngrok:

### Option 1: GitHub CLI (smee.io)

```bash
# Install smee-client
npm install -g smee-client

# Start forwarding
smee --url https://smee.io/YOUR_CHANNEL --path /api/webhooks/github --port 3000
```

Update webhook URL to `https://smee.io/YOUR_CHANNEL`

### Option 2: Ngrok

```bash
# Start ngrok
ngrok http 3000

# Update webhook URL to:
https://YOUR_ID.ngrok.io/api/webhooks/github
```

### Option 3: Disable webhooks for local dev

Just skip webhook handling locally, manually trigger sync instead.

## Rate Limits

**With Installation Token:**
- 5,000 requests/hour per installation
- Resets every hour

**With User Token:**
- 5,000 requests/hour per user
- Separate from installation limit

**Authenticated vs Unauthenticated:**
- Authenticated: 5,000/hour
- Unauthenticated: 60/hour

## Security Best Practices

1. **Never commit private key** - Use environment variables or secret manager
2. **Rotate credentials** - Change webhook secret periodically
3. **Validate webhooks** - Always verify signature
4. **Minimal permissions** - Only request what you need
5. **Audit logs** - Monitor app usage in GitHub settings

## Common Operations

### List Repositories

```typescript
const { data: repos } = await octokit.request(
  'GET /installation/repositories',
  {
    headers: {
      authorization: `Bearer ${installationToken}`,
    },
  }
)
```

### Get File Contents

```typescript
const { data } = await octokit.request(
  'GET /repos/{owner}/{repo}/contents/{path}',
  {
    owner: 'username',
    repo: 'repo-name',
    path: 'package.json',
    headers: {
      authorization: `Bearer ${installationToken}`,
    },
  }
)

const content = Buffer.from(data.content, 'base64').toString('utf-8')
```

### Create Branch

```typescript
// Get main branch SHA
const { data: mainRef } = await octokit.request(
  'GET /repos/{owner}/{repo}/git/ref/{ref}',
  {
    owner,
    repo,
    ref: 'heads/main',
  }
)

// Create new branch
await octokit.request(
  'POST /repos/{owner}/{repo}/git/refs',
  {
    owner,
    repo,
    ref: 'refs/heads/feature-branch',
    sha: mainRef.object.sha,
  }
)
```

### Create Pull Request

```typescript
const { data: pr } = await octokit.request(
  'POST /repos/{owner}/{repo}/pulls',
  {
    owner,
    repo,
    title: 'Feature: Add new component',
    head: 'feature-branch',
    base: 'main',
    body: 'This PR adds...',
  }
)
```

## Troubleshooting

### "Bad credentials" error
- Check private key is correct
- Verify app ID matches
- Ensure installation token hasn't expired (1 hour TTL)

### "Not Found" error
- App not installed on that repository
- Installation was revoked
- Repository doesn't exist or was renamed

### Webhook not received
- Check webhook URL is publicly accessible
- Verify webhook secret matches
- Look at webhook deliveries in GitHub app settings
- Check payload signature verification

### Installation ID not found
- User didn't complete installation flow
- Installation was uninstalled
- Check `installation_id` is stored correctly

## Next Steps

After setup:
1. ✅ Test installation flow
2. ✅ Verify repository access
3. ✅ Test webhook delivery
4. ✅ Implement callback handler
5. ✅ Build repository selector UI

## Resources

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [Octokit.js](https://github.com/octokit/octokit.js)
- [@octokit/app](https://github.com/octokit/app.js)
- [Webhook Events](https://docs.github.com/en/webhooks-and-events/webhooks/webhook-events-and-payloads)
