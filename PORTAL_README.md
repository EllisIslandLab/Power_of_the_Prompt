# AI-Powered Website Revision Portal

Transform your website management with AI-powered revisions, real-time previews, and seamless deployments.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
# Copy .env.portal.example to .env.local and fill in values

# 3. Run database migrations
npx supabase db push

# 4. Start development server
npm run dev

# 5. Open portal
# Navigate to http://localhost:3000/portal
```

## What's Included

### For Clients
- **💬 AI Chat Interface** - Request website changes by chatting with Claude AI
- **👀 Live Preview** - See changes before they go live
- **💰 Transparent Pricing** - Pay only for what you use (~$0.05-$0.50 per change)
- **🎉 90-Day Trial** - Free bug fixes during your trial period
- **📊 Usage Tracking** - See exactly how much you're spending
- **🚀 Deployment Control** - Approve or reject changes before production

### For Admins
- **📈 Dashboard** - Monitor all client activity
- **💳 Revenue Tracking** - Track balances and payments
- **⚙️ Database Work Queue** - Review complex schema changes
- **🔍 Analytics** - Client activity and usage metrics

## Core Features

### 1. Chat-Based Revisions
Send a message like "Change the homepage title to 'Welcome!'" and Claude handles the implementation.

### 2. Trial Period (90 Days)
- Free bug fixes (under $0.50)
- Automatic cost waiving
- Clear days-remaining countdown

### 3. Pay-As-You-Go Pricing
- $0.003 per 1,000 tokens
- Small change: ~$0.05 - $0.15
- Medium change: ~$0.20 - $0.50
- Add funds via Stripe anytime

### 4. Smart Deployment
- Auto-creates git branch
- Generates Vercel preview
- You approve → merges to production
- You reject → deletes branch, refunds balance

### 5. Database Protection
- Detects schema change requests
- Flags for manual implementation
- Prevents accidental data loss

## File Structure

```
src/app/
├── portal/                  # Main portal
│   ├── components/          # Chat, preview, navigation
│   ├── billing/            # Stripe integration
│   ├── deployments/        # Deployment history
│   ├── history/            # Conversation history
│   ├── preferences/        # User settings
│   └── utils/              # Trial logic
├── admin/revisions/        # Admin dashboard
└── api/portal/             # Backend endpoints

supabase/migrations/        # Database schema
├── 20260503000001_create_portal_system.sql
├── 20260503000002_add_balance_functions.sql
└── 20260503000003_add_analytics_views.sql
```

## Documentation

- **[PORTAL_SYSTEM.md](./PORTAL_SYSTEM.md)** - Complete system overview and architecture
- **[PORTAL_DEPLOYMENT.md](./PORTAL_DEPLOYMENT.md)** - Production deployment guide
- **[PORTAL_TESTING.md](./PORTAL_TESTING.md)** - Full testing checklist
- **[PORTAL_BUILD_SUMMARY.md](./PORTAL_BUILD_SUMMARY.md)** - What was built in this session

## Environment Variables

Required for production:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Claude AI
ANTHROPIC_API_KEY=sk-ant-your-api-key

# Stripe
STRIPE_SECRET_KEY=sk_your-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_your-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Vercel
VERCEL_PROJECT_NAME=weblaunchcoach
VERCEL_TEAM_SLUG=your-team-slug

# App
NEXT_PUBLIC_BASE_URL=https://yourwebsite.com
```

## Database Schema

7 tables power the portal:

1. **client_accounts** - Client billing and trial management
2. **revision_conversations** - Chat session containers
3. **revision_chat_messages** - Individual chat messages
4. **database_work_requests** - Flagged schema changes
5. **deployment_notifications** - User notifications
6. **client_preferences** - User settings
7. **deployment_history** - Deployment audit trail

All tables have Row Level Security enabled for multi-tenant isolation.

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/portal/chat` | POST | Stream Claude AI responses |
| `/api/portal/deploy` | POST | Create deployment |
| `/api/portal/deploy` | PUT | Approve/reject deployment |
| `/api/portal/create-checkout` | POST | Create Stripe checkout |
| `/api/portal/stripe-webhook` | POST | Process Stripe payments |

## Common Tasks

### Add funds to test account
```sql
SELECT add_funds('account-uuid', 10.00);
```

### Check pending database work
```sql
SELECT * FROM database_work_requests WHERE status = 'pending';
```

### View client activity
```sql
SELECT * FROM client_account_summary ORDER BY message_count DESC;
```

### Test trial period logic
```typescript
import { shouldWaiveCost } from '@/app/portal/utils/trial'

const account = { trial_status: 'active', /* ... */ }
const waive = shouldWaiveCost(account, 'Fix broken link', 0.15)
// Returns: true (bug fix during trial < $0.50)
```

## Security

- ✅ Row Level Security on all tables
- ✅ JWT authentication required
- ✅ Stripe webhook signature verification
- ✅ Input sanitization and validation
- ✅ Server-side environment variables
- ✅ Git operations sandboxed

## Monitoring

### Key Metrics
```sql
-- Active clients
SELECT COUNT(*) FROM client_accounts WHERE trial_status = 'active';

-- Total revenue
SELECT SUM(account_balance + held_balance) FROM client_accounts;

-- Daily activity
SELECT * FROM daily_activity ORDER BY activity_date DESC LIMIT 7;
```

### Logs to Watch
- Supabase: Database errors, RLS denials
- Vercel: Function timeouts, API errors
- Stripe: Webhook failures
- Anthropic: Rate limits, token usage

## Troubleshooting

### Chat not streaming
- Check `ANTHROPIC_API_KEY` is valid
- Verify Vercel function timeout (increase to 60s)
- Review Anthropic API status

### Balance not updating after payment
- Check Stripe webhook is receiving events
- Verify `STRIPE_WEBHOOK_SECRET` matches
- Review webhook signature verification

### Preview URL not loading
- Wait 1-2 minutes for Vercel deployment
- Check Vercel dashboard for build errors
- Verify branch was pushed to GitHub

## Support

- **Documentation**: See files in project root (PORTAL_*.md)
- **Database Issues**: Check Supabase logs
- **API Errors**: Check Vercel function logs
- **Payment Problems**: Check Stripe dashboard

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Components
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude 3.5 Sonnet (Anthropic API)
- **Payments**: Stripe Checkout + Webhooks
- **Deployment**: Vercel
- **Version Control**: Git + GitHub

## License

Private - Web Launch Coach

---

**Status**: ✅ Complete - Ready for Testing & Deployment

**Build Date**: May 3, 2026

**Questions?** Review the comprehensive documentation in PORTAL_SYSTEM.md
