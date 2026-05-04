# AI-Powered Website Revision Portal

Complete portal system for managing client website revisions using Claude AI.

## Overview

This portal replaces the old cohort-based textbook system with an individual client service model. Clients can chat with Claude AI to request website changes, preview updates, and manage deployments—all through a clean, responsive interface.

## Architecture

### Database Schema (7 Tables)

1. **client_accounts** - Client billing and trial management
2. **revision_conversations** - Chat session containers
3. **revision_chat_messages** - Individual messages in conversations
4. **database_work_requests** - Complex DB work requiring manual implementation
5. **deployment_notifications** - User notifications (toasts)
6. **client_preferences** - User settings (auto-deploy, email notifications, etc.)
7. **deployment_history** - Audit trail of all deployments

### Key Features

#### 1. Chat Interface (`/portal`)
- Real-time streaming responses from Claude API
- Token tracking and cost transparency
- One-change-per-turn design for clarity
- Database work detection (flags schema changes for manual implementation)

#### 2. Live Preview Panel
- Side-by-side layout (desktop) or stacked (mobile)
- Automatic Vercel preview deployments
- Navigate between multiple changes
- Approve/reject workflow before production merge

#### 3. Trial Period Management
- 90-day trial from account creation
- Free bug fixes during trial (revisions under $0.50)
- Automatic cost waiving for qualifying bug fixes
- Clear trial status display

#### 4. Token-Based Pricing
- Pay-as-you-go: $0.003 per 1K tokens (Claude Sonnet 3.5)
- Typical small change: ~$0.05 - $0.15
- Typical medium change: ~$0.20 - $0.50
- Monthly support plans: $5 basic, $9 enhanced (optional)

#### 5. Balance Management
- Stripe integration for adding funds
- Real-time balance display
- Budget warnings (customizable threshold)
- Held balance for pending deployments

#### 6. Deployment Flow
- Auto-creates git branch per conversation
- Pushes to GitHub
- Triggers Vercel preview deployment
- User approves → merge to main → production deploy
- User rejects → delete branch, refund held balance

#### 7. Admin Dashboard (`/admin/revisions`)
- Overview of all client accounts
- Pending database work queue
- Pending deployment review
- Revenue and activity metrics

## File Structure

```
src/app/
├── portal/
│   ├── page.tsx                          # Main portal entry (server component)
│   ├── middleware.ts                     # Auth guard
│   ├── components/
│   │   ├── PortalLayout.tsx              # Responsive layout container
│   │   ├── ChatInterface.tsx             # Chat UI with streaming
│   │   ├── PreviewPanel.tsx              # iframe preview display
│   │   ├── TokenBudgetBar.tsx            # Thin "life bar" at top
│   │   ├── HamburgerMenu.tsx             # Navigation menu
│   │   ├── BalanceDisplay.tsx            # Account balance footer
│   │   └── DeploymentNotifications.tsx   # Toast notifications
│   ├── billing/
│   │   ├── page.tsx                      # Billing page (server)
│   │   └── BillingInterface.tsx          # Stripe checkout & history
│   ├── deployments/
│   │   ├── page.tsx                      # Deployment history (server)
│   │   └── DeploymentHistory.tsx         # Approve/reject UI
│   ├── history/
│   │   ├── page.tsx                      # Conversation history (server)
│   │   └── ConversationHistory.tsx       # Message viewer
│   ├── preferences/
│   │   ├── page.tsx                      # User preferences (server)
│   │   └── PreferencesInterface.tsx      # Settings UI
│   └── utils/
│       └── trial.ts                      # Trial period & pricing utilities
│
├── api/portal/
│   ├── chat/route.ts                     # Claude API streaming endpoint
│   ├── deploy/route.ts                   # Git + Vercel deployment
│   ├── create-checkout/route.ts          # Stripe checkout session
│   └── stripe-webhook/route.ts           # Stripe payment webhook
│
└── admin/revisions/
    ├── page.tsx                          # Admin dashboard (server)
    └── AdminDashboard.tsx                # Multi-tenant management UI

supabase/migrations/
├── 20260503000001_create_portal_system.sql    # Main schema
└── 20260503000002_add_balance_functions.sql   # RPC functions
```

## Business Rules

### Trial Period (90 days)
1. Auto-created on user signup via database trigger
2. Free bug fixes for revisions under $0.50
3. Bug detection keywords: "bug", "fix", "broken", "error", "issue", "problem"
4. Status shown in portal header and hamburger menu

### Pricing Tiers
- **Trial** (90 days): Free bug fixes, pay for features
- **Pay-as-you-go**: $0.003 per 1K tokens (no monthly fee)
- **Basic Support**: $5/month (future implementation)
- **Enhanced Support**: $9/month (future implementation)

### Deployment Workflow
1. User requests change via chat
2. Claude implements change
3. System creates git branch and pushes
4. Vercel auto-deploys preview
5. User reviews preview
6. **Option A (Auto-deploy enabled)**: Merge to main automatically
7. **Option B (Manual review)**: User approves → merge, or rejects → delete branch

### Database Work Policy
- Claude cannot modify database schema directly
- System detects DB keywords: "database", "table", "column", "schema", "migration", "rls", "policy"
- Creates record in `database_work_requests` table
- Admin reviews and implements manually
- Prevents accidental data loss or schema corruption

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For webhooks

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=sk-ant-...

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Vercel (for deployment URLs)
VERCEL_PROJECT_NAME=weblaunchcoach
VERCEL_TEAM_SLUG=your-team

# App
NEXT_PUBLIC_BASE_URL=https://yourwebsite.com
```

## Setup Instructions

### 1. Run Database Migrations
```bash
# Apply portal schema
supabase db push

# Verify tables exist
supabase db diff
```

### 2. Configure Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourwebsite.com/api/portal/stripe-webhook`
3. Select event: `checkout.session.completed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Configure Vercel Auto-Deploy
Vercel automatically creates preview deployments for all branches. No additional configuration needed—just push a branch and Vercel handles it.

### 4. Test the Flow
1. Sign up as a test user
2. Navigate to `/portal`
3. Send a chat message: "Change the homepage title to 'Test'"
4. Verify preview URL appears
5. Check deployment in `/portal/deployments`
6. Approve or reject the change

## Security Considerations

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Admin role can access all data (for dashboard)
- Service role used for webhooks (bypasses RLS)

### Git Safety
- Each conversation creates a unique branch
- Main branch protected (requires approval)
- No force pushes allowed
- Branch auto-deleted after merge or rejection

### Stripe Security
- Webhook signature verification required
- Service role key stored server-side only
- Checkout sessions expire after 24 hours
- Metadata includes client account ID for verification

## Common Operations

### Add Funds to Account
```typescript
// Via Stripe checkout (client-side)
POST /api/portal/create-checkout
{ amount: 10, clientAccountId: "..." }

// Manual credit (admin only, use Supabase SQL)
SELECT add_funds('account-uuid', 10.00);
```

### Manually Implement Database Work
```sql
-- 1. Review request
SELECT * FROM database_work_requests WHERE status = 'pending';

-- 2. Implement the change (write migration, test locally)

-- 3. Mark as completed
UPDATE database_work_requests
SET status = 'completed', completed_at = NOW()
WHERE id = 'request-uuid';
```

### Refund a Deployment
```sql
-- If a deployment was charged but needs refund
SELECT refund_held_balance('account-uuid', 0.15);

UPDATE deployment_history
SET deployment_status = 'refunded'
WHERE id = 'deployment-uuid';
```

## Monitoring & Metrics

### Key Metrics to Track
- Active conversations per day
- Average tokens per conversation
- Trial conversion rate (trial → paid)
- Average account balance
- Deployment approval rate
- Bug fix waiver usage

### Database Queries
```sql
-- Active trial accounts
SELECT COUNT(*) FROM client_accounts
WHERE trial_status = 'active'
AND trial_expiration_date > NOW();

-- Revenue (total held + available balance)
SELECT SUM(account_balance + held_balance) as total_revenue
FROM client_accounts;

-- Most active clients (by message count)
SELECT ca.id, u.full_name, COUNT(rcm.id) as message_count
FROM client_accounts ca
JOIN users u ON ca.user_id = u.id
LEFT JOIN revision_conversations rc ON rc.client_account_id = ca.id
LEFT JOIN revision_chat_messages rcm ON rcm.conversation_id = rc.id
GROUP BY ca.id, u.full_name
ORDER BY message_count DESC
LIMIT 10;
```

## Future Enhancements

1. **Email Notifications** - Send emails for deployments, budget warnings
2. **Subscription Plans** - Monthly billing for $5/$9 tiers via Stripe
3. **Mobile App** - React Native app for on-the-go revisions
4. **Revision Templates** - Pre-built prompts for common changes
5. **Multi-site Support** - Manage multiple websites per account
6. **Team Collaboration** - Share access with team members
7. **Revision History Diff** - Show code changes in UI
8. **Voice Input** - Speak revision requests instead of typing
9. **Scheduled Revisions** - Queue changes for future deployment
10. **A/B Testing** - Deploy multiple variants for comparison

## Troubleshooting

### "Invalid API key" error
- Verify `ANTHROPIC_API_KEY` is set in `.env.local`
- Check that key starts with `sk-ant-`
- Ensure key has not expired or been revoked

### Preview URL not updating
- Check Vercel deployment status in Vercel dashboard
- Verify branch was pushed successfully (`git log --oneline --all`)
- Check for build errors in Vercel logs

### Balance not updating after payment
- Verify Stripe webhook is receiving events (check Stripe dashboard)
- Check webhook signature is valid (`STRIPE_WEBHOOK_SECRET`)
- Review webhook logs in Vercel Functions

### Trial status not showing correctly
- Verify `trial_expiration_date` is set correctly in database
- Check that user's account was created via signup (auto-trigger should fire)
- Manually set if needed: `UPDATE client_accounts SET trial_status = 'active' WHERE id = '...'`

## Contact & Support

For issues or questions about the portal system:
- Check this documentation first
- Review Supabase logs for database errors
- Review Vercel logs for API/deployment errors
- Check Stripe dashboard for payment issues
