# Quick Reference - Project Connection System

## 🚀 Start Here

```bash
# 1. Generate encryption key
openssl rand -hex 32 >> .env.local

# 2. Run migrations
npx supabase db push

# 3. Start dev server
npm run dev

# 4. Visit
open http://localhost:3000/portal/projects/new
```

## 🔑 Required Environment Variables

```bash
CREDENTIALS_ENCRYPTION_KEY=<64-char-hex>
GITHUB_APP_ID=<number>
GITHUB_APP_CLIENT_ID=Iv1.<string>
GITHUB_APP_CLIENT_SECRET=<secret>
GITHUB_APP_PRIVATE_KEY_PATH=<path>
GITHUB_APP_WEBHOOK_SECRET=<secret>
GITHUB_APP_SLUG=<slug>
VERCEL_CLIENT_ID=oac_<string>
VERCEL_CLIENT_SECRET=<secret>
STRIPE_CLIENT_ID=ca_<string>
NEXT_PUBLIC_STRIPE_CLIENT_ID=ca_<string>
```

## 📋 Setup Checklist

- [ ] Run migrations
- [ ] Generate encryption key
- [ ] Create GitHub App
- [ ] Create Vercel Integration
- [ ] Enable Stripe Connect
- [ ] Test locally
- [ ] Deploy to production
- [ ] Update OAuth URLs to production

## 🔗 Important URLs

**GitHub App:** https://github.com/settings/apps/new
**Vercel Integration:** https://vercel.com/dashboard/integrations/console
**Stripe Connect:** https://dashboard.stripe.com/settings/connect

## 📁 Key Files

```
src/app/portal/projects/new/page.tsx          # Wizard UI
src/app/portal/projects/[id]/page.tsx         # Dashboard
src/app/api/integrations/github/callback/     # GitHub OAuth
src/app/api/integrations/vercel/callback/     # Vercel OAuth
src/app/api/integrations/stripe/callback/     # Stripe OAuth
src/app/api/integrations/validate/            # Test connections
src/lib/integrations/github.ts                # GitHub operations
src/lib/integrations/vercel.ts                # Vercel operations
src/lib/integrations/stripe-connect.ts        # Stripe operations
src/lib/integrations/detector.ts              # Service detection
src/lib/encryption.ts                         # Encryption utilities
```

## 🧪 Testing Commands

```bash
# Test GitHub API locally
curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user

# Test Vercel API
curl -H "Authorization: Bearer $VERCEL_TOKEN" https://api.vercel.com/v2/user

# Test Stripe connection
stripe listen --forward-to localhost:3000/api/webhooks/stripe-connect

# View database
npx supabase db diff
npx supabase db push
```

## 🎨 User Flow

```
1. Payment Success
2. → /portal/projects/new
3. → Install GitHub App
4. → Select Repository
5. → Analyze Project
6. → Connect Services
7. → Validate
8. → Complete!
9. → /portal (start building)
```

## 🔐 Security Notes

- All credentials encrypted at rest (AES-256-CBC)
- RLS policies enforce user isolation
- OAuth tokens never exposed to client
- Webhook signatures verified
- Tokens auto-refresh where supported

## 🐛 Quick Fixes

**Installation not found:**
```sql
SELECT * FROM github_installations WHERE user_id = '<user-id>';
```

**Credentials not decrypting:**
```typescript
// Check CREDENTIALS_ENCRYPTION_KEY is exactly 64 hex chars
console.log(process.env.CREDENTIALS_ENCRYPTION_KEY.length) // Should be 64
```

**Validation failing:**
```bash
# Test directly
curl -X POST http://localhost:3000/api/integrations/validate \
  -H "Content-Type: application/json" \
  -d '{"services":["github","vercel","stripe"]}'
```

## 📊 Database Queries

```sql
-- Check projects
SELECT * FROM client_projects WHERE user_id = '<user-id>';

-- Check services
SELECT * FROM client_service_credentials WHERE user_id = '<user-id>';

-- Check GitHub installs
SELECT * FROM github_installations WHERE user_id = '<user-id>';

-- Check repositories
SELECT * FROM github_repositories WHERE installation_id = <id>;
```

## 🎯 Production Deployment

```bash
# 1. Set all env vars in Vercel
vercel env add CREDENTIALS_ENCRYPTION_KEY
vercel env add GITHUB_APP_ID
# ... (add all)

# 2. Deploy
vercel --prod

# 3. Update OAuth URLs
# GitHub App → Settings → Update URLs
# Vercel Integration → Settings → Update URL
# Stripe Connect → Settings → Update URL

# 4. Test
# Visit https://yoursite.com/portal/projects/new
```

## 📞 Support

**Documentation:**
- FINAL_SETUP_GUIDE.md - Complete setup
- GITHUB_APP_SETUP.md - GitHub details
- VERCEL_OAUTH_SETUP.md - Vercel details
- STRIPE_CONNECT_SETUP.md - Stripe details

**Issues:**
- Check Vercel logs: `vercel logs --follow`
- Check Supabase logs: Supabase Dashboard → Logs
- Check browser console for client errors

## ✨ Feature Checklist

- ✅ GitHub App integration
- ✅ Vercel OAuth
- ✅ Stripe Connect
- ✅ Service detection
- ✅ Real-time validation
- ✅ Wizard UI
- ✅ Project dashboard
- ✅ Encrypted storage
- ✅ RLS policies
- ✅ Error handling

---

**You're ready to ship! 🚀**
