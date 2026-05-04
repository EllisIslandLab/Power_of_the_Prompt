# Portal System Testing Checklist

Complete testing guide for validating the AI-powered revision portal.

## Pre-Test Setup

### 1. Local Environment
```bash
# Start dev server
npm run dev

# In another terminal, start Supabase local (optional)
npx supabase start

# Verify environment variables loaded
curl http://localhost:3000/api/health # Should return 200
```

### 2. Test User Accounts

Create test accounts with different states:

```sql
-- Test user 1: Active trial
INSERT INTO users (id, email, full_name, role)
VALUES ('test-user-1', 'trial@test.com', 'Trial User', 'client');

INSERT INTO client_accounts (user_id, trial_status, account_balance)
VALUES ('test-user-1', 'active', 5.00);

-- Test user 2: Expired trial, low balance
INSERT INTO users (id, email, full_name, role)
VALUES ('test-user-2', 'lowbalance@test.com', 'Low Balance User', 'client');

INSERT INTO client_accounts (
  user_id,
  trial_status,
  trial_expiration_date,
  account_balance
)
VALUES (
  'test-user-2',
  'expired',
  NOW() - INTERVAL '10 days',
  0.50
);

-- Test user 3: Admin
INSERT INTO users (id, email, full_name, role)
VALUES ('test-admin', 'admin@test.com', 'Admin User', 'admin');
```

## Core Functionality Tests

### 1. Authentication & Portal Access

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Sign in redirect | Go to `/portal` while logged out | Redirect to `/signin?redirect=/portal` | ☐ |
| Portal access | Sign in, navigate to `/portal` | Portal loads with chat interface | ☐ |
| User data loading | Check portal header | Shows correct user name and balance | ☐ |
| Session persistence | Refresh page | Stays logged in, data persists | ☐ |

### 2. Chat Interface

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Initial greeting | Load portal | Shows personalized greeting with user's first name | ☐ |
| Send message | Type "Hello" and click Send | Message appears in chat | ☐ |
| Streaming response | Send a longer request | Response streams in real-time | ☐ |
| Token tracking | Complete a conversation | Token count and cost displayed | ☐ |
| Budget bar update | Send multiple messages | Budget bar increases from left to right | ☐ |
| Loading state | Send message | Shows typing indicator while waiting | ☐ |
| Error handling | Disconnect internet, send message | Shows error message | ☐ |

### 3. Trial Period Logic

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Trial status display | Sign in as trial user | Shows "X days remaining" in menu | ☐ |
| Bug fix detection | Send "Fix the broken link on homepage" | Detects as bug fix | ☐ |
| Cost waiving | Complete bug fix during trial (<$0.50) | Shows "Bug fix during trial - no charge!" | ☐ |
| Feature request charge | Request "Add a contact form" | Charges normal rate | ☐ |
| Expired trial | Sign in as expired trial user | No bug fix waiver offered | ☐ |

### 4. Preview Panel

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Empty state | Load portal (no changes yet) | Shows placeholder with eye icon | ☐ |
| Preview URL display | Complete a change request | Preview URL appears in panel | ☐ |
| iframe loading | Wait for preview to load | Website preview renders in iframe | ☐ |
| Responsive layout (desktop) | View on desktop | Chat left (40%), preview right (60%) | ☐ |
| Responsive layout (mobile) | View on mobile | Preview top, chat bottom, stacked | ☐ |
| Preview link | Click preview URL | Opens in new tab | ☐ |

### 5. Deployment Flow

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Create deployment | Request change | Creates git branch `revision-{id}-{timestamp}` | ☐ |
| Push to GitHub | Check GitHub | Branch appears in repository | ☐ |
| Vercel preview | Wait 1-2 minutes | Vercel creates preview deployment | ☐ |
| Deployment notification | Check notifications | Shows "Preview deployment created" toast | ☐ |
| View deployment history | Go to `/portal/deployments` | Shows pending deployment | ☐ |
| Approve deployment | Click "Approve" | Merges to main, deletes branch | ☐ |
| Production deploy | Check Vercel | Main branch deploys to production | ☐ |
| Reject deployment | Create another change, click "Reject" | Deletes branch, refunds balance | ☐ |

### 6. Balance Management

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| View balance | Load portal | Shows balance in footer | ☐ |
| Low balance warning | Set balance < $2 | Shows yellow warning color | ☐ |
| Critical balance | Set balance < $0.50 | Shows red color + "Add Funds" button | ☐ |
| Navigate to billing | Click "Add Funds" | Opens `/portal/billing` | ☐ |
| Preset amounts | View billing page | Shows $5, $10, $20, $50 buttons | ☐ |
| Custom amount | Enter $7.50 | Input accepts decimal | ☐ |
| Stripe checkout | Click "Add Funds" | Redirects to Stripe checkout | ☐ |
| Payment success | Complete payment | Redirects back, balance updated | ☐ |
| Webhook processing | Check Supabase | `client_accounts.account_balance` increased | ☐ |
| Transaction history | Check billing page | Shows conversation costs | ☐ |

### 7. Database Work Detection

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| DB keyword detection | Send "Add a new table for users" | Detects database work | ☐ |
| DB work notification | Complete message | Shows "Database work detected" toast | ☐ |
| DB work record | Check `database_work_requests` | Record created with status 'pending' | ☐ |
| Admin visibility | Check admin dashboard | Shows in pending DB work tab | ☐ |
| Non-DB request | Send "Change button color to blue" | No DB work detection | ☐ |

### 8. Hamburger Menu & Navigation

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Open menu | Click hamburger icon | Menu slides in | ☐ |
| User info display | View menu | Shows name, email | ☐ |
| Trial status | View menu (trial user) | Shows trial days remaining | ☐ |
| Navigation links | Click each link | Opens correct page | ☐ |
| - Conversation History | Click | Opens `/portal/history` | ☐ |
| - Deployment History | Click | Opens `/portal/deployments` | ☐ |
| - Billing & Balance | Click | Opens `/portal/billing` | ☐ |
| - Preferences | Click | Opens `/portal/preferences` | ☐ |
| Sign out | Click "Sign Out" | Logs out, redirects to home | ☐ |

### 9. Conversation History

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| View conversations | Go to `/portal/history` | Lists all conversations | ☐ |
| Conversation metadata | Check list | Shows date, message count, cost | ☐ |
| Select conversation | Click a conversation | Shows full message thread | ☐ |
| Message display | View messages | User messages right, Claude left | ☐ |
| Token info | Check messages | Shows tokens + cost per message | ☐ |
| Total cost | View summary | Shows total cost for conversation | ☐ |
| Empty state | New user with no conversations | Shows "No conversations yet" | ☐ |

### 10. User Preferences

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Load preferences | Go to `/portal/preferences` | Shows current settings | ☐ |
| Auto-deploy toggle | Click toggle | Changes state | ☐ |
| Email notifications toggle | Click toggle | Changes state | ☐ |
| Budget threshold | Change to $3.00 | Updates value | ☐ |
| Save preferences | Click "Save" | Shows "Saved!" confirmation | ☐ |
| Persistence | Reload page | Settings persist | ☐ |
| Account info | View bottom section | Shows name, email, created date, trial status | ☐ |

### 11. Admin Dashboard

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Admin access | Sign in as admin, go to `/admin/revisions` | Dashboard loads | ☐ |
| Non-admin redirect | Sign in as client, go to `/admin/revisions` | Redirects to `/portal` | ☐ |
| Stats overview | View top cards | Shows total/active clients, conversations, balance | ☐ |
| Client overview tab | Click "Client Overview" | Shows table of all clients | ☐ |
| Client data | Check table | Shows name, email, balance, trial status | ☐ |
| DB work tab | Click "Database Work" | Shows pending DB requests | ☐ |
| Deployments tab | Click "Pending Deployments" | Shows pending deployments | ☐ |
| Deployment actions | Click "Approve" or "Reject" | Processes action (same as client view) | ☐ |

### 12. Notifications System

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Deployment notification | Create deployment | Toast appears top-right | ☐ |
| Notification content | View toast | Shows icon, title, message, timestamp | ☐ |
| Dismiss notification | Click X | Toast disappears | ☐ |
| Multiple notifications | Create several events | Stacks vertically (max 5) | ☐ |
| Real-time updates | Create notification in DB | Appears without refresh | ☐ |
| Auto-mark read | Dismiss notification | Updates `read = true` in DB | ☐ |

## Edge Cases & Error Handling

### 1. Network Errors

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| API timeout | Mock slow API response | Shows error after timeout | ☐ |
| Network offline | Disconnect internet, send message | Shows "Failed to get response" | ☐ |
| Stripe failure | Use test card 4000000000000002 | Shows payment error | ☐ |
| Webhook failure | Stop webhook endpoint | Payment succeeds but balance doesn't update | ☐ |

### 2. Invalid Data

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Negative balance | Manually set balance < 0 | Shows critical warning | ☐ |
| Invalid trial date | Set expiration in past | Shows "Trial expired" | ☐ |
| Missing user data | Delete user's full_name | Falls back to "there" in greeting | ☐ |
| Empty conversation | Create conversation with no messages | Doesn't crash, shows empty state | ☐ |

### 3. Concurrent Actions

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Multiple messages | Send 3 messages rapidly | Queues and processes in order | ☐ |
| Simultaneous deploys | Create 2 deployments at once | Both succeed with unique branches | ☐ |
| Race condition | Approve deployment while it's processing | Handles gracefully | ☐ |

## Performance Tests

### 1. Load Times

| Test | Target | Actual | Status |
|------|--------|--------|--------|
| Portal initial load | < 2s | ___ | ☐ |
| Chat message send | < 500ms | ___ | ☐ |
| Claude response start | < 3s | ___ | ☐ |
| Preview URL generation | < 2s | ___ | ☐ |
| Billing page load | < 2s | ___ | ☐ |

### 2. Streaming Performance

| Test | Expected Result | Status |
|------|-----------------|--------|
| Large response (5000 tokens) | Streams smoothly, no lag | ☐ |
| Multiple concurrent users | No slowdown for other users | ☐ |
| Memory usage | Stays under 512MB per function | ☐ |

## Security Tests

### 1. Authentication

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| RLS enforcement | Query another user's data | Returns empty set | ☐ |
| JWT tampering | Modify session token | Rejects request | ☐ |
| Admin escalation | Client tries to access admin route | Redirects or 403 | ☐ |

### 2. Input Validation

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| SQL injection | Send `'; DROP TABLE users; --` | Escaped properly, no damage | ☐ |
| XSS attempt | Send `<script>alert('XSS')</script>` | Rendered as text, not executed | ☐ |
| Large input | Send 50,000 character message | Truncates or rejects | ☐ |

### 3. Payment Security

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| Webhook signature | Send unsigned webhook | Rejects with 400 | ☐ |
| Duplicate payment | Send same checkout.session twice | Only credits once | ☐ |
| Amount tampering | Modify checkout amount | Uses server-side amount only | ☐ |

## Browser Compatibility

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | Latest | ☐ | |
| Firefox | Latest | ☐ | |
| Safari | Latest | ☐ | |
| Edge | Latest | ☐ | |
| Mobile Safari | iOS 15+ | ☐ | |
| Mobile Chrome | Android 10+ | ☐ | |

## Accessibility Tests

| Test | Expected Result | Status |
|------|-----------------|--------|
| Keyboard navigation | Can navigate entire portal with Tab | ☐ |
| Screen reader | All buttons/links have labels | ☐ |
| Color contrast | Meets WCAG AA standards | ☐ |
| Focus indicators | Visible focus rings on interactive elements | ☐ |

## Test Summary

### Pass Criteria
- ✅ 90%+ of core functionality tests passing
- ✅ All security tests passing
- ✅ No critical bugs
- ✅ Performance targets met

### Test Results
- Total tests: ___
- Passed: ___
- Failed: ___
- Skipped: ___

### Known Issues
1. ___ (Issue description)
2. ___ (Issue description)

### Next Steps
- [ ] Fix critical bugs
- [ ] Retest failed cases
- [ ] Deploy to staging
- [ ] Run smoke tests in staging
- [ ] Deploy to production
