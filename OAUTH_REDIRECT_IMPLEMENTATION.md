# OAuth Redirect Implementation Summary

## Problem
When users connected external services (GitHub, Vercel, Stripe) from the Settings page, after OAuth authorization, they were redirected to `/portal/projects/new` instead of being returned to Settings.

## Solution
Implemented a redirect parameter system for all OAuth-based integrations that allows the initiating page to specify where users should be redirected after authorization.

## Changes Made

### 1. GitHub Integration ✅
**Modified Files:**
- `/src/app/api/integrations/github/install/route.ts`
  - Added support for `redirect_to` query parameter
  - Stores redirect URL in `github_install_redirect` cookie

- `/src/app/api/integrations/github/callback/route.ts`
  - Reads `github_install_redirect` cookie
  - Redirects to stored URL or falls back to default `/portal/projects/new`
  - Cleans up cookies after use
  - Applied to both installation and OAuth flows

- `/src/app/portal/settings/SettingsInterface.tsx`
  - Updated Connect/Reconnect buttons to use: `/api/integrations/github/install?redirect_to=/portal/settings`

### 2. Vercel Integration ✅
**Created Files:**
- `/src/app/api/integrations/vercel/install/route.ts`
  - New route to initiate Vercel OAuth with redirect support
  - Accepts `redirect_to` query parameter
  - Stores in `vercel_install_redirect` cookie

**Modified Files:**
- `/src/app/api/integrations/vercel/callback/route.ts`
  - Added redirect cookie support
  - Falls back to default if no redirect specified
  - Cleans up cookies after use

### 3. Stripe Integration ✅
**Created Files:**
- `/src/app/api/integrations/stripe/install/route.ts`
  - New route to initiate Stripe Connect OAuth with redirect support
  - Accepts `redirect_to` query parameter
  - Stores in `stripe_install_redirect` cookie

**Modified Files:**
- `/src/app/api/integrations/stripe/callback/route.ts`
  - Added redirect cookie support
  - Falls back to default if no redirect specified
  - Cleans up cookies after use

## How It Works

### From Settings Page:
1. User clicks "Connect" or "Reconnect" on a service
2. Browser navigates to `/api/integrations/{service}/install?redirect_to=/portal/settings`
3. Install route stores the redirect URL in a cookie and redirects to OAuth provider
4. User authorizes on the OAuth provider (GitHub, Vercel, Stripe)
5. OAuth provider redirects back to `/api/integrations/{service}/callback`
6. Callback route processes the authorization, reads the redirect cookie
7. User is redirected back to `/portal/settings`

### From Project Wizard:
1. User connects a service during project creation
2. If using install route: No redirect parameter is passed
3. Callback falls back to default behavior: redirect to `/portal/projects/new`
4. Maintains backward compatibility with existing flows

## Services Not Requiring OAuth Redirects

The following services use modals or API keys (not OAuth redirects) and don't need this mechanism:
- **Airtable** - Uses modal for API key input
- **Supabase** - Uses `ConnectSupabaseModal` component
- **Resend** - Uses modal for API key input

## Backward Compatibility

All changes are backward compatible:
- If no `redirect_to` parameter is provided, the system behaves as before
- Existing direct OAuth initiations (like from the project wizard) continue to work
- The redirect cookie mechanism is optional and falls back to defaults

## Future Integrations

Any new OAuth-based integration should follow this pattern:
1. Create an `/install` route that accepts `redirect_to` and stores it in a cookie
2. Update the `/callback` route to read the cookie and redirect accordingly
3. Clean up cookies after use
4. Always provide a sensible default redirect
