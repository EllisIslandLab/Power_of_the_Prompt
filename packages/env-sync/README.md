# @weblaunchacademy/env-sync

Automatically sync environment variables from your Web Launch Academy portal to your local development environment.

## Features

- 🔐 **Secure** - Credentials encrypted in transit
- 🚀 **Zero Config** - One-time setup, automatic thereafter
- 🔄 **Always in Sync** - Fetches latest values on every run
- 🎯 **No Manual Files** - No more downloading and moving .env files

## Installation

```bash
npm install @weblaunchacademy/env-sync
```

## Setup

### 1. Initialize

```bash
npx wla init
```

This will:
- Prompt you for your Web Launch Academy auth token
- Save it to `.wla` file (add this to `.gitignore`!)

### 2. Get Your Auth Token

1. Go to https://weblaunchacademy.com/portal/settings
2. Click "Generate API Token"
3. Copy the token and paste it when prompted

### 3. Auto-Load in Your App

**Option A: In `next.config.js` (Recommended)**

```js
// At the top of next.config.js
require('@weblaunchacademy/env-sync/auto')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // your config...
}

module.exports = nextConfig
```

**Option B: Manual Sync**

```js
const { syncEnv } = require('@weblaunchacademy/env-sync')

// Sync before starting your app
await syncEnv()
```

## How It Works

1. Package reads auth token from `.wla` file
2. Calls Web Launch Academy API with token
3. Fetches your project's environment variables
4. Injects them into `process.env`
5. Your app runs with all credentials loaded!

## Security

- ✅ Auth token stored locally in `.wla` (git-ignored)
- ✅ API requires valid authentication
- ✅ Credentials encrypted in transit (HTTPS)
- ✅ Only server-side - never exposed to browser
- ✅ Only returns env vars for authenticated user's active project

## Troubleshooting

**"No .wla config found"**
- Run `npx wla init` first

**"Invalid or expired token"**
- Generate a new token in portal settings
- Run `npx wla init` again

**Variables not loading**
- Make sure `require('@weblaunchacademy/env-sync/auto')` is at the TOP of your config
- Check that `.wla` file exists in project root
- Verify token in portal settings

## What Gets Synced

All credentials connected in your Web Launch Academy portal:
- Supabase (URL, anon key, service role key)
- Vercel (token, team ID)
- Stripe (publishable & secret keys, webhook secret)
- Airtable (API key, base ID)
- GitHub (token)
- And more as you connect them!

## License

MIT
