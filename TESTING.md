# Web Launch Academy Portal - Comprehensive Testing Guide

Complete test cases for all features, implemented and planned.

**Legend:**
- ✅ Implemented
- 🚧 Partially Implemented
- ❌ Not Yet Implemented
- 🔥 Critical Path
- ⚠️ Known Issue Area

---

## 1. Authentication & Sign-In

### 1.1 Sign Up (Email/Password) 🔥

**Status:** ✅ Implemented

**Test Cases:**

1. **Valid Sign Up**
   - [ ] Navigate to `/signup`
   - [ ] Enter valid email (e.g., `test@example.com`)
   - [ ] Enter strong password (min 8 chars)
   - [ ] Click "Sign Up"
   - [ ] Verify redirect to verification page
   - [ ] Check email for verification link
   - [ ] Click verification link
   - [ ] Verify redirect to onboarding

2. **Invalid Sign Up Attempts**
   - [ ] Weak password (< 8 chars) → Shows error
   - [ ] Invalid email format → Shows error
   - [ ] Existing email → Shows "Email already registered"
   - [ ] Missing fields → Shows validation errors
   - [ ] Password/confirm mismatch → Shows error

3. **Admin Sign Up**
   - [ ] Sign up with email in `ADMIN_EMAILS` env var
   - [ ] Verify starting balance = $100 (not $20)
   - [ ] Verify role = "admin" in database

**Expected Results:**
- New user created in `users` table
- Account created in `client_accounts` table
- Initial balance: $20 (regular) or $100 (admin)
- Email verification sent via Resend
- Welcome email sent

---

### 1.2 Sign In (Multiple Methods) 🔥

**Status:** ✅ Implemented

**Test Cases:**

1. **Email/Password Sign In**
   - [ ] Navigate to `/signin`
   - [ ] Enter valid credentials
   - [ ] Click "Sign In"
   - [ ] Verify redirect to `/portal`
   - [ ] Verify session persists after page refresh

2. **GitHub OAuth Sign In**
   - [ ] Click "Sign in with GitHub"
   - [ ] Authorize on GitHub
   - [ ] Verify redirect back to portal
   - [ ] Verify account created if new user
   - [ ] Verify existing account used if email matches

3. **Google OAuth Sign In** 
   - [ ] Click "Sign in with Google"
   - [ ] Authorize with Google
   - [ ] Verify redirect back to portal
   - [ ] Verify account created if new user

4. **Failed Sign In Attempts**
   - [ ] Wrong password → Shows error
   - [ ] Non-existent email → Shows error
   - [ ] Unverified email → Shows "Please verify email"
   - [ ] Rate limiting after 5 failed attempts → Shows cooldown

**Email Consistency Check:** ⚠️
   - [ ] Sign up with `user@gmail.com` (email/password)
   - [ ] Sign in with GitHub (primary email = `user@gmail.com`)
   - [ ] Verify SAME account is accessed (not duplicate)
   - [ ] Sign in with Google (email = `user@gmail.com`)
   - [ ] Verify SAME account is accessed

**Expected Results:**
- Session cookie set (`sb-access-token`, `sb-refresh-token`)
- User data in Supabase auth.users table
- User profile in public.users table
- No duplicate accounts for same email

---

### 1.3 Password Reset

**Status:** ✅ Implemented

**Test Cases:**

1. **Request Password Reset**
   - [ ] Navigate to `/signin`
   - [ ] Click "Forgot Password?"
   - [ ] Enter email
   - [ ] Verify email sent with reset link
   - [ ] Click reset link
   - [ ] Verify redirect to reset page

2. **Complete Password Reset**
   - [ ] Enter new password
   - [ ] Confirm new password
   - [ ] Click "Reset Password"
   - [ ] Verify success message
   - [ ] Try signing in with new password → Success
   - [ ] Try signing in with old password → Fails

3. **Invalid Reset Attempts**
   - [ ] Expired reset link → Shows error
   - [ ] Already used reset link → Shows error
   - [ ] Weak password → Shows validation error

---

### 1.4 Account Linking

**Status:** ✅ Implemented

**Test Cases:**

1. **Add Email/Password to OAuth Account**
   - [ ] Sign in with GitHub OAuth
   - [ ] Go to Settings → Account
   - [ ] Click "Add Email/Password Login"
   - [ ] Enter email and password
   - [ ] Click "Add"
   - [ ] Sign out
   - [ ] Sign in with email/password → Success
   - [ ] Verify SAME account data visible

2. **Email Mismatch Warning**
   - [ ] OAuth account email: `user@github.com`
   - [ ] Try adding email/password: `different@email.com`
   - [ ] Verify warning shown about email mismatch
   - [ ] Verify can still proceed if desired

---

## 2. Onboarding Flow 🔥

**Status:** 🚧 Partially Implemented

### 2.1 GitHub Connection

**Test Cases:**

1. **Fresh GitHub Connection**
   - [ ] After sign up, redirect to onboarding
   - [ ] See "Connect GitHub" step
   - [ ] Click "Connect GitHub"
   - [ ] Authorize GitHub App
   - [ ] Select repositories to give access
   - [ ] Verify redirect back to onboarding
   - [ ] Verify "Repository Selection" step appears

2. **Repository Selection**
   - [ ] See list of authorized repositories
   - [ ] Select a repository
   - [ ] Click "Continue"
   - [ ] Verify repository linked to project
   - [ ] Verify redirect to "Connect Vercel" step

3. **Skip Repository Selection**
   - [ ] Click "Skip" or "I'll do this later"
   - [ ] Verify can continue to next step
   - [ ] Verify can return later to link repo

**Expected Results:**
- GitHub installation created in database
- Repository linked to `client_projects.github_repository_id`
- Installation token cached and refreshed automatically

---

### 2.2 Vercel Connection & Service Detection

**Test Cases:**

1. **Fresh Vercel Connection**
   - [ ] After GitHub, see "Connect Vercel" step
   - [ ] Click "Connect Vercel"
   - [ ] Authorize Vercel integration
   - [ ] Select Vercel project
   - [ ] Verify redirect back to onboarding
   - [ ] Verify "Detected Services" step appears

2. **Service Detection**
   - [ ] After Vercel connection, see detected services
   - [ ] Verify Stripe shown if `STRIPE_*` env vars exist
   - [ ] Verify Supabase shown if `SUPABASE_*` env vars exist
   - [ ] Verify Airtable shown if `AIRTABLE_*` env vars exist
   - [ ] Services show ✅ Configured or ⚠️ Incomplete
   - [ ] Click "Continue" to complete onboarding

3. **No Services Detected**
   - [ ] Vercel project has no service env vars
   - [ ] Verify message: "No services detected yet"
   - [ ] Verify can still continue
   - [ ] Verify can add services later in Settings

**Expected Results:**
- Vercel credentials stored in `client_service_credentials`
- Vercel project ID linked to `client_projects`
- Services auto-detected and stored
- User sees summary of what's configured

---

### 2.3 Onboarding Completion

**Test Cases:**

1. **Complete Onboarding**
   - [ ] Finish all onboarding steps
   - [ ] Click "Complete Setup" or "Go to Portal"
   - [ ] Verify redirect to `/portal`
   - [ ] Verify project is active
   - [ ] Verify can start chatting with Claude

2. **Incomplete Onboarding**
   - [ ] Skip some steps
   - [ ] Verify can still access portal
   - [ ] Verify prompts to complete missing steps
   - [ ] Complete missing steps from Settings

**Expected Results:**
- `client_projects.is_active = true`
- User preferences initialized
- Can start using portal immediately

---

### 2.4 Admin Onboarding Reset

**Status:** ✅ Implemented (Admin Only)

**Test Cases:**

1. **Reset Onboarding (Admin)**
   - [ ] Sign in as admin
   - [ ] Go to Settings → Account
   - [ ] Verify "Reset Onboarding" section visible
   - [ ] Click "Reset Onboarding Progress"
   - [ ] Confirm warning
   - [ ] Verify redirect to onboarding flow
   - [ ] Complete onboarding again
   - [ ] Verify new project created or existing updated

2. **Reset Preserves Data**
   - [ ] Before reset: Note GitHub/Vercel connections
   - [ ] After reset: Verify connections still exist
   - [ ] Verify billing info preserved
   - [ ] Verify account balance preserved

**Expected Results:**
- `is_active = false` on old project
- User can re-run onboarding for testing
- Critical data (auth, billing) preserved

---

## 3. Portal Interface

### 3.1 Chat with Claude 🔥

**Status:** ✅ Implemented

**Test Cases:**

1. **Basic Chat**
   - [ ] Navigate to `/portal`
   - [ ] Type message: "Hello, can you help me?"
   - [ ] Press Enter or click Send
   - [ ] Verify Claude responds
   - [ ] Verify message appears in chat history
   - [ ] Verify account balance decreases

2. **Code Generation**
   - [ ] Ask: "Create a React button component"
   - [ ] Verify Claude generates code
   - [ ] Verify file appears in Explorer
   - [ ] Verify can open and view file

3. **File Editing**
   - [ ] Ask: "Update Button.tsx to add a disabled prop"
   - [ ] Verify Claude proposes edit
   - [ ] Verify can see diff/preview
   - [ ] Accept changes
   - [ ] Verify file updated in Explorer

4. **Multi-File Operations**
   - [ ] Ask: "Create a login form with separate components"
   - [ ] Verify multiple files created
   - [ ] Verify all files appear in Explorer
   - [ ] Verify files are properly organized

5. **Chat Streaming**
   - [ ] Send message
   - [ ] Verify response streams in real-time (word by word)
   - [ ] Verify no lag or freezing
   - [ ] Verify can read response as it generates

6. **Error Handling**
   - [ ] Insufficient balance → Shows error, prompts to add funds
   - [ ] Network error → Shows retry option
   - [ ] Invalid request → Shows helpful error message

**Expected Results:**
- Messages saved to `chat_conversations` and `chat_messages`
- Balance deducted from `client_accounts.account_balance`
- Files created/updated in connected GitHub repo
- Streaming response works smoothly

---

### 3.2 File Explorer 🔥

**Status:** ✅ Implemented

**Test Cases:**

1. **View File Tree**
   - [ ] Click Explorer icon in sidebar
   - [ ] Verify file tree loads
   - [ ] Verify folders collapsible/expandable
   - [ ] Verify files show proper icons (JS, TS, CSS, etc.)

2. **Open File**
   - [ ] Click on a file in Explorer
   - [ ] Verify file content displays
   - [ ] Verify syntax highlighting works
   - [ ] Verify mobile preview stays visible
   - [ ] Verify chat stays visible

3. **File Viewer Layout**
   - [ ] Open file
   - [ ] Verify file shows in left 45% panel
   - [ ] Verify mobile preview visible on right
   - [ ] Verify chat output visible (right 33%)
   - [ ] Verify breadcrumb navigation shows file path

4. **Navigate Folders**
   - [ ] Click folder to expand
   - [ ] Verify sub-folders and files appear
   - [ ] Click folder again to collapse
   - [ ] Navigate deeply nested folders

5. **File Badges**
   - [ ] Modified files → Show "M" badge
   - [ ] New files → Show "A" badge
   - [ ] Deleted files → Show "D" badge
   - [ ] Verify badge colors correct

**Expected Results:**
- Files fetched from GitHub API
- File content cached for performance
- No layout issues with file viewer
- Breadcrumbs work correctly

---

### 3.3 Search Functionality

**Status:** ✅ Implemented

**Test Cases:**

1. **Search Files by Name**
   - [ ] Click Search icon in sidebar
   - [ ] Type: "button"
   - [ ] Verify matching files shown
   - [ ] Click result → Opens file

2. **Search File Contents**
   - [ ] Search for: "useState"
   - [ ] Verify files containing "useState" shown
   - [ ] Verify line numbers shown
   - [ ] Click result → Opens file at matching line

3. **Search Filters**
   - [ ] Filter by file type (.tsx, .ts, .css)
   - [ ] Filter by folder
   - [ ] Combine multiple filters

4. **Empty Search Results**
   - [ ] Search for: "asdfghjklqwerty"
   - [ ] Verify "No results found" message
   - [ ] Verify helpful suggestions shown

**Expected Results:**
- Fast search (< 500ms)
- Accurate results
- Proper highlighting of matches
- Case-insensitive search

---

### 3.4 Source Control 🔥

**Status:** ✅ Implemented (Recently Fixed)

**Test Cases:**

1. **View Changes**
   - [ ] Make file changes via Claude
   - [ ] Click Source Control icon
   - [ ] Verify changed files listed
   - [ ] Verify diff preview available
   - [ ] Verify proper badges (M, A, D)

2. **Commit Changes**
   - [ ] Stage files (select checkboxes)
   - [ ] Enter commit message
   - [ ] Click "Commit"
   - [ ] Verify success message
   - [ ] Verify changes committed to GitHub

3. **Push to GitHub**
   - [ ] After committing, click "Push"
   - [ ] Verify push succeeds
   - [ ] Check GitHub → Verify commit appears

4. **Source Control Layout** (Recent Fix)
   - [ ] Click Source Control icon
   - [ ] Verify opens in sidebar (NOT full screen)
   - [ ] Verify mobile preview stays visible
   - [ ] Verify behaves like Explorer/Search (sidebar panel)
   - [ ] Click Explorer → Verify Source Control closes

5. **Multiple Commits**
   - [ ] Make changes
   - [ ] Commit with message "First commit"
   - [ ] Make more changes
   - [ ] Commit with message "Second commit"
   - [ ] Verify both commits in history

**Expected Results:**
- Source Control shows in sidebar
- No tab/full-screen takeover
- Changes properly tracked
- Commits go to correct branch
- Mobile preview always visible

---

### 3.5 Preview Panel (Mobile & Desktop) 🔥

**Status:** ✅ Implemented (Recently Fixed)

**Test Cases:**

1. **Mobile Preview (Default)**
   - [ ] Open portal
   - [ ] Verify mobile phone frame visible
   - [ ] Verify website renders inside frame
   - [ ] Verify preview is interactive (clickable)
   - [ ] Verify scrolling works

2. **Desktop Preview**
   - [ ] Click "Desktop" layout icon
   - [ ] Verify full browser frame shown
   - [ ] Verify sidebar/panels collapse
   - [ ] Verify website gets full screen
   - [ ] Verify can interact with site fully

3. **Preview Modes**
   - [ ] Switch between: Bottom, Left, Right, Top, Floating
   - [ ] Verify layout changes appropriately
   - [ ] Verify preview stays functional in all modes
   - [ ] Verify chat still accessible

4. **Preview Updates**
   - [ ] Ask Claude to change website
   - [ ] Wait for deployment (or use preview build)
   - [ ] Verify preview updates automatically
   - [ ] Verify no manual refresh needed

5. **Preview Responsiveness**
   - [ ] Resize browser window
   - [ ] Verify preview scales appropriately
   - [ ] Verify no overflow issues
   - [ ] Verify maintains aspect ratio

**Expected Results:**
- Mobile: Shows in phone frame (375x667px default)
- Desktop: Full-screen browser frame
- Preview loads actual deployed site
- Real-time updates (via webhooks)

---

### 3.6 Help & Tips

**Status:** ✅ Implemented

**Test Cases:**

1. **View FAQs**
   - [ ] Click Help icon in sidebar
   - [ ] Verify FAQ list shown
   - [ ] Click FAQ → Expands answer
   - [ ] Verify includes GitHub email consistency warning

2. **Ask Help Assistant**
   - [ ] Type question in help chat
   - [ ] Click Send
   - [ ] Verify AI assistant responds
   - [ ] Verify helpful answer provided

3. **Search FAQs**
   - [ ] Search for: "GitHub"
   - [ ] Verify matching FAQs highlighted
   - [ ] Verify relevant results first

**Expected Results:**
- FAQs stored in localStorage
- Help assistant uses separate balance tracking
- New users see default FAQs
- Custom FAQs can be added

---

## 4. Settings Tabs

### 4.1 Account Tab

**Status:** ✅ Implemented

**Test Cases:**

1. **View Account Info**
   - [ ] Navigate to Settings → Account
   - [ ] Verify email displayed
   - [ ] Verify role displayed (admin/client)
   - [ ] Verify tier displayed (basic/vip)
   - [ ] Verify join date shown

2. **Account Linking**
   - [ ] See "Add Email/Password Login" section
   - [ ] Add credentials if using OAuth
   - [ ] Verify can now sign in both ways

3. **Admin Onboarding Reset** (Admin Only)
   - [ ] Verify section visible if admin
   - [ ] Verify NOT visible for regular users
   - [ ] Test reset functionality (see 2.4)

4. **Profile Picture/Avatar**
   - [ ] Upload profile picture
   - [ ] Verify shows in sidebar
   - [ ] Verify shows in chat messages

**Expected Results:**
- Account info accurate
- Linking works correctly
- Admin features gated properly

---

### 4.2 Billing Tab 🔥

**Status:** ✅ Implemented

**Test Cases:**

1. **View Balance**
   - [ ] Navigate to Settings → Billing
   - [ ] Verify current balance displayed
   - [ ] Verify usage history shown
   - [ ] Verify recent transactions listed

2. **Add Funds (Regular User)**
   - [ ] Click "Add Funds"
   - [ ] Select amount ($20, $50, $100, Custom)
   - [ ] Click "Checkout"
   - [ ] Complete Stripe payment
   - [ ] Verify redirected back to portal
   - [ ] Verify balance increased

3. **Admin Auto-Refill**
   - [ ] Sign in as admin
   - [ ] Reduce balance to $15 (below $20 threshold)
   - [ ] Send chat message
   - [ ] Verify balance auto-refilled to $100
   - [ ] Verify message sent successfully

4. **Payment Methods**
   - [ ] Add credit card via Stripe
   - [ ] Verify card saved
   - [ ] Set as default payment method
   - [ ] Delete old payment method

5. **Invoice History**
   - [ ] View past invoices
   - [ ] Download PDF invoice
   - [ ] Verify amounts correct

6. **Usage Breakdown**
   - [ ] View usage by date
   - [ ] View usage by conversation
   - [ ] See cost per message
   - [ ] Export usage data (CSV)

**Expected Results:**
- Stripe integration works correctly
- Payments processed securely
- Balance updates in real-time
- Admin refill triggers automatically

---

### 4.3 Connectors Tab 🔥

**Status:** ✅ Implemented (Just Completed!)

**Test Cases:**

1. **View Core Services**
   - [ ] Navigate to Settings → Connectors
   - [ ] Verify GitHub section visible
   - [ ] Verify Vercel section visible
   - [ ] Verify both show connection status

2. **Connect GitHub**
   - [ ] Click "Connect" on GitHub
   - [ ] Authorize GitHub App
   - [ ] Select repositories
   - [ ] Verify redirect back to settings
   - [ ] Verify status = "Connected"

3. **Reconnect GitHub**
   - [ ] Click "Reconnect" on GitHub
   - [ ] Confirm dialog
   - [ ] Re-authorize on GitHub
   - [ ] Verify connection refreshed
   - [ ] Verify repositories updated

4. **Manage GitHub on GitHub**
   - [ ] Click "Manage →" button
   - [ ] Verify opens GitHub settings in new tab
   - [ ] Verify can manage app permissions
   - [ ] Verify can revoke access

5. **Connect Vercel**
   - [ ] Click "Connect" on Vercel
   - [ ] Authorize Vercel integration
   - [ ] Select Vercel project
   - [ ] Verify redirect back
   - [ ] Verify status = "Connected"

6. **Reconnect Vercel & Detect Services** (New Feature!)
   - [ ] Click "Reconnect & Detect Services"
   - [ ] Verify confirmation dialog explains:
     - Will refresh Vercel connection
     - Will detect services from env vars
     - Will enable Claude Code to use them
   - [ ] Confirm
   - [ ] Re-authorize Vercel (if needed)
   - [ ] Verify redirect back
   - [ ] Verify detected services section appears

7. **Auto-Detected Services**
   - [ ] Verify "Detected Services from Vercel" section
   - [ ] Verify services shown if env vars exist:
     - Supabase (if `SUPABASE_*` vars)
     - Stripe (if `STRIPE_*` vars)
     - Airtable (if `AIRTABLE_*` vars)
     - Resend (if `RESEND_*` vars)
     - Clerk (if `CLERK_*` vars)
     - OpenAI (if `OPENAI_*` vars)
     - Anthropic (if `ANTHROPIC_*` or `CLAUDE_*` vars)
   - [ ] Each service shows:
     - Service icon and name
     - Description
     - ✅ Configured (all required vars present)
     - OR ⚠️ Incomplete (missing vars listed)
     - Number of env vars found

8. **Refresh Detected Services**
   - [ ] Add new env vars to Vercel (e.g., `OPENAI_API_KEY`)
   - [ ] Click "🔄 Refresh" button in portal
   - [ ] Verify OpenAI now appears in detected services
   - [ ] Verify shows ✅ Configured

9. **No Services Detected**
   - [ ] Vercel connected but no service env vars
   - [ ] Verify message shown: "No services detected yet"
   - [ ] Verify explains to add env vars to Vercel
   - [ ] Verify button to reconnect/detect

10. **Vercel Not Connected**
    - [ ] Disconnect Vercel
    - [ ] Verify blue info box shown
    - [ ] Verify explains services will auto-detect after Vercel connected
    - [ ] Verify prompts to connect Vercel

11. **Service Configuration Status**
    - [ ] Add only `STRIPE_SECRET_KEY` to Vercel (missing publishable key)
    - [ ] Detect services
    - [ ] Verify Stripe shows ⚠️ Incomplete
    - [ ] Verify lists missing var: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
    - [ ] Add missing var to Vercel
    - [ ] Refresh detection
    - [ ] Verify Stripe now shows ✅ Configured

12. **No Manual Connect/Disconnect for Auto-Detected**
    - [ ] Verify Supabase has NO "Connect" button
    - [ ] Verify Stripe has NO "Connect" button
    - [ ] Verify Airtable has NO "Connect" button
    - [ ] Verify only status badge and info shown
    - [ ] Verify if want to "disconnect", remove from Vercel

**Expected Results:**
- GitHub/Vercel: OAuth connection, manual connect/disconnect
- Other services: Auto-detected, read-only status
- Services detect correctly from env var patterns
- Configuration status accurate
- Missing vars clearly listed
- Refresh works instantly

---

### 4.4 Context Tab

**Status:** ✅ Implemented

**Test Cases:**

1. **Set Claude Context**
   - [ ] Enter context about your project
   - [ ] Example: "This is an e-commerce site for selling plants"
   - [ ] Click Save
   - [ ] Ask Claude: "Add a product page"
   - [ ] Verify Claude uses context (mentions plants/e-commerce)

2. **Set Claude Instructions**
   - [ ] Enter instructions: "Always use TypeScript. Prefer functional components."
   - [ ] Click Save
   - [ ] Ask Claude to create a component
   - [ ] Verify follows instructions (uses TS, functional)

3. **Clear Context**
   - [ ] Delete context text
   - [ ] Click Save
   - [ ] Verify Claude behavior changes (more generic)

**Expected Results:**
- Context persists across sessions
- Claude uses context in responses
- Instructions followed consistently

---

### 4.5 Preferences Tab

**Status:** ✅ Implemented

**Test Cases:**

1. **Change Theme**
   - [ ] Select "Dark" theme
   - [ ] Verify UI switches to dark mode immediately
   - [ ] Refresh page → Verify theme persists
   - [ ] Select "Light" theme
   - [ ] Verify UI switches to light mode
   - [ ] Select "System" → Follows OS preference

2. **Change Chat Font**
   - [ ] Select "Monospace" font
   - [ ] Verify chat uses monospace
   - [ ] Select "Sans Serif"
   - [ ] Verify chat font changes

3. **Notification Preferences**
   - [ ] Toggle "Error notifications" off
   - [ ] Trigger error → Verify no notification
   - [ ] Toggle back on → Verify notifications work
   - [ ] Toggle "Deployment notifications"
   - [ ] Toggle "Email notifications"

4. **Username for Claude**
   - [ ] Enter preferred name: "Alex"
   - [ ] Save
   - [ ] Chat with Claude
   - [ ] Verify Claude addresses you as "Alex"

**Expected Results:**
- Preferences saved to `user_settings` table
- Changes apply immediately
- Persist across sessions

---

## 5. Advanced Features

### 5.1 Deployments

**Status:** 🚧 Partially Implemented

**Test Cases:**

1. **View Deployment History**
   - [ ] Navigate to `/portal/deployments`
   - [ ] Verify list of deployments shown
   - [ ] Verify shows: date, status, branch, commit

2. **Trigger Deployment**
   - [ ] Make changes via Claude
   - [ ] Commit to GitHub
   - [ ] Verify Vercel auto-deploys
   - [ ] Verify webhook updates deployment status
   - [ ] Verify preview updates

3. **Deployment Status**
   - [ ] Building → Shows spinner, "Building..."
   - [ ] Success → Shows ✅, deployment URL
   - [ ] Failed → Shows ❌, error logs
   - [ ] Cancelled → Shows appropriate status

4. **View Deployment Logs**
   - [ ] Click on deployment
   - [ ] Verify build logs shown
   - [ ] Verify can download logs
   - [ ] Verify errors highlighted

5. **Rollback Deployment**
   - [ ] Select previous successful deployment
   - [ ] Click "Rollback"
   - [ ] Confirm
   - [ ] Verify Vercel rolls back
   - [ ] Verify preview shows old version

**Expected Results:**
- Deployments tracked in database
- Vercel webhooks update status
- Can view logs and rollback

---

### 5.2 Git Operations

**Status:** ✅ Implemented

**Test Cases:**

1. **Create Branch**
   - [ ] Ask Claude: "Create a new branch called feature-x"
   - [ ] Verify branch created in GitHub
   - [ ] Verify switched to new branch
   - [ ] Make changes on branch

2. **Switch Branches**
   - [ ] Ask Claude: "Switch to main branch"
   - [ ] Verify branch switched
   - [ ] Verify file tree updates to main branch

3. **Merge Branch**
   - [ ] Complete work on feature branch
   - [ ] Ask Claude: "Merge feature-x into main"
   - [ ] Verify merge completes
   - [ ] Verify no conflicts

4. **Resolve Merge Conflicts**
   - [ ] Create conflicting changes
   - [ ] Attempt merge
   - [ ] Verify conflict detected
   - [ ] Ask Claude to resolve
   - [ ] Verify resolution applied

5. **View Git History**
   - [ ] Ask Claude: "Show recent commits"
   - [ ] Verify commit history shown
   - [ ] Verify shows: hash, message, author, date

6. **Revert Commit**
   - [ ] Select a commit
   - [ ] Ask Claude: "Revert this commit"
   - [ ] Verify revert commit created
   - [ ] Verify changes undone

**Expected Results:**
- All Git operations use GitHub API
- Installation tokens refresh automatically
- No authentication errors
- Changes reflect in GitHub immediately

---

### 5.3 Project Management

**Status:** 🚧 Partially Implemented

**Test Cases:**

1. **Create New Project**
   - [ ] Navigate to `/portal/projects/new`
   - [ ] Enter project name
   - [ ] Select template (Next.js, React, etc.)
   - [ ] Click Create
   - [ ] Verify GitHub repo created
   - [ ] Verify Vercel project created
   - [ ] Verify project linked

2. **Switch Projects**
   - [ ] Have multiple projects
   - [ ] Click project switcher
   - [ ] Select different project
   - [ ] Verify UI switches to new project
   - [ ] Verify file tree loads new project
   - [ ] Verify preview shows new project

3. **Archive Project**
   - [ ] Select project
   - [ ] Click "Archive"
   - [ ] Confirm
   - [ ] Verify `is_active = false`
   - [ ] Verify hidden from project list

4. **Delete Project**
   - [ ] Select project
   - [ ] Click "Delete"
   - [ ] Verify warning about irreversible action
   - [ ] Confirm
   - [ ] Verify project deleted from database
   - [ ] Verify GitHub repo NOT deleted (safety)

**Expected Results:**
- Multiple projects supported
- Can switch seamlessly
- Each project independent

---

## 6. Error Handling & Edge Cases

### 6.1 Network Errors

**Test Cases:**

1. **Offline Mode**
   - [ ] Disconnect internet
   - [ ] Try to send chat message
   - [ ] Verify error: "No internet connection"
   - [ ] Reconnect internet
   - [ ] Verify retry button works

2. **Slow Network**
   - [ ] Throttle network (Chrome DevTools)
   - [ ] Send message
   - [ ] Verify loading state shown
   - [ ] Verify timeout after reasonable duration (30s)
   - [ ] Verify can retry

3. **API Timeout**
   - [ ] Trigger long-running operation
   - [ ] Verify timeout after 2 minutes
   - [ ] Verify helpful error message
   - [ ] Verify can retry

**Expected Results:**
- Graceful degradation
- Clear error messages
- Retry options available

---

### 6.2 Authentication Errors

**Test Cases:**

1. **Session Expiration**
   - [ ] Sign in
   - [ ] Wait for session to expire (or manually delete cookies)
   - [ ] Try to use portal
   - [ ] Verify redirected to sign in
   - [ ] Verify can sign back in
   - [ ] Verify returns to where you were

2. **Token Refresh Failure**
   - [ ] Corrupt refresh token
   - [ ] Try to use portal
   - [ ] Verify signs out gracefully
   - [ ] Verify no infinite redirect loop

3. **Concurrent Sessions**
   - [ ] Sign in on Browser A
   - [ ] Sign in on Browser B (same account)
   - [ ] Make changes on Browser A
   - [ ] Verify Browser B shows updates
   - [ ] Sign out on Browser A
   - [ ] Verify Browser B still works

**Expected Results:**
- Sessions handled correctly
- No data loss on session expire
- Multi-device support works

---

### 6.3 GitHub Integration Errors

**Test Cases:**

1. **Token Expiration** ⚠️
   - [ ] Installation token expires (after 1 hour)
   - [ ] Try to fetch files
   - [ ] Verify auto-refresh happens
   - [ ] Verify operation succeeds
   - [ ] Verify no user intervention needed

2. **Installation Revoked**
   - [ ] Revoke GitHub App on GitHub
   - [ ] Try to use portal
   - [ ] Verify error: "GitHub connection lost"
   - [ ] Verify prompted to reconnect
   - [ ] Reconnect → Verify works again

3. **Rate Limiting**
   - [ ] Trigger many GitHub API calls
   - [ ] Hit rate limit
   - [ ] Verify error message
   - [ ] Verify retry after rate limit resets

4. **Repository Deleted**
   - [ ] Delete linked repository on GitHub
   - [ ] Try to load portal
   - [ ] Verify error: "Repository not found"
   - [ ] Verify can link different repository

**Expected Results:**
- Token manager handles refresh automatically
- Clear errors when connection issues
- Can recover from all error states

---

### 6.4 Vercel Integration Errors

**Test Cases:**

1. **Deployment Failures**
   - [ ] Introduce build error
   - [ ] Trigger deployment
   - [ ] Verify deployment fails
   - [ ] Verify error logs shown
   - [ ] Fix error, redeploy
   - [ ] Verify succeeds

2. **Webhook Failures**
   - [ ] Vercel webhook fails to deliver
   - [ ] Verify deployment status eventually updates
   - [ ] Verify can manually refresh

3. **Environment Variable Sync Issues**
   - [ ] Add env var to Vercel
   - [ ] Verify not immediately in portal
   - [ ] Click "Refresh" or reconnect
   - [ ] Verify appears

**Expected Results:**
- Deployment errors clear and actionable
- Webhooks resilient to failures
- Env var sync works reliably

---

### 6.5 Payment & Billing Errors

**Test Cases:**

1. **Declined Payment**
   - [ ] Use test card that declines
   - [ ] Try to add funds
   - [ ] Verify error: "Payment declined"
   - [ ] Verify can try different card

2. **Stripe Webhook Failure**
   - [ ] Complete payment
   - [ ] Webhook fails to deliver
   - [ ] Verify payment eventually processed
   - [ ] Verify balance updated

3. **Insufficient Funds**
   - [ ] Reduce balance to $0
   - [ ] Try to send message
   - [ ] Verify blocked
   - [ ] Verify prompted to add funds
   - [ ] Add funds → Can continue

4. **Refund**
   - [ ] Request refund (contact support)
   - [ ] Verify refund processed
   - [ ] Verify balance adjusted
   - [ ] Verify invoice updated

**Expected Results:**
- Payments always correct
- Clear error messages
- No lost money

---

## 7. Performance & Load Testing

### 7.1 Chat Performance

**Test Cases:**

1. **Large Conversation**
   - [ ] Chat for 50+ messages
   - [ ] Verify no slowdown
   - [ ] Verify scrolling smooth
   - [ ] Verify no memory leaks

2. **Long Messages**
   - [ ] Ask Claude to generate 1000+ lines of code
   - [ ] Verify streams without lag
   - [ ] Verify rendering performant
   - [ ] Verify can scroll smoothly

3. **Concurrent Users** (Load Test)
   - [ ] Simulate 10 concurrent users
   - [ ] All sending messages
   - [ ] Verify response times acceptable
   - [ ] Verify no timeouts

**Expected Results:**
- Response time < 3s (after API call)
- Streaming latency < 100ms
- UI stays responsive

---

### 7.2 File Tree Performance

**Test Cases:**

1. **Large Repository**
   - [ ] Repository with 1000+ files
   - [ ] Load file tree
   - [ ] Verify loads in < 5s
   - [ ] Verify can expand/collapse smoothly

2. **Deep Nesting**
   - [ ] Repository with 10+ levels deep
   - [ ] Navigate to deepest folder
   - [ ] Verify no lag

3. **Large File**
   - [ ] Open file with 10,000+ lines
   - [ ] Verify loads completely
   - [ ] Verify syntax highlighting works
   - [ ] Verify scrolling smooth

**Expected Results:**
- File tree virtualized for performance
- Large files load incrementally
- No UI freezing

---

### 7.3 Preview Performance

**Test Cases:**

1. **Preview Load Time**
   - [ ] Trigger deployment
   - [ ] Measure time until preview shows
   - [ ] Target: < 10s after deployment ready

2. **Preview Interactions**
   - [ ] Click buttons in preview
   - [ ] Fill forms
   - [ ] Navigate pages
   - [ ] Verify no iframe lag

3. **Preview Updates**
   - [ ] Make change via Claude
   - [ ] Deployment completes
   - [ ] Verify preview auto-updates
   - [ ] Verify no manual refresh needed

**Expected Results:**
- Preview loads fast
- Interactions feel native
- Updates seamless

---

## 8. Security Testing

### 8.1 Authentication Security

**Test Cases:**

1. **SQL Injection**
   - [ ] Try SQL injection in email field
   - [ ] Try in password field
   - [ ] Verify sanitized, no injection

2. **XSS Attacks**
   - [ ] Enter `<script>alert('XSS')</script>` in chat
   - [ ] Verify escaped/sanitized
   - [ ] Verify not executed

3. **CSRF Protection**
   - [ ] Check CSRF tokens on forms
   - [ ] Try submitting without token
   - [ ] Verify rejected

4. **Session Hijacking**
   - [ ] Copy session cookie to different browser
   - [ ] Verify session invalidated after logout
   - [ ] Verify secure, httpOnly flags set

**Expected Results:**
- No vulnerabilities exploitable
- All inputs sanitized
- Sessions secure

---

### 8.2 API Security

**Test Cases:**

1. **Unauthorized Access**
   - [ ] Try API calls without authentication
   - [ ] Verify 401 Unauthorized
   - [ ] Try accessing other users' data
   - [ ] Verify 403 Forbidden

2. **Rate Limiting**
   - [ ] Make 100 requests in 1 minute
   - [ ] Verify rate limited after threshold
   - [ ] Verify cool-down period works

3. **Input Validation**
   - [ ] Send malformed JSON
   - [ ] Send invalid data types
   - [ ] Send negative amounts
   - [ ] Verify all rejected with clear errors

**Expected Results:**
- All endpoints protected
- Rate limiting enforced
- Input validation strict

---

### 8.3 Data Privacy

**Test Cases:**

1. **Env Vars Not Exposed**
   - [ ] Check client-side code
   - [ ] Verify no `STRIPE_SECRET_KEY` exposed
   - [ ] Verify no `SUPABASE_SERVICE_ROLE_KEY` exposed
   - [ ] Verify only `NEXT_PUBLIC_*` vars in client

2. **User Data Isolation**
   - [ ] Sign in as User A
   - [ ] Verify can't see User B's projects
   - [ ] Verify can't access User B's files
   - [ ] Verify can't see User B's billing

3. **RLS Enforcement**
   - [ ] Check Supabase RLS policies
   - [ ] Verify every table has RLS enabled
   - [ ] Verify policies use `auth.uid()`
   - [ ] Try bypassing with direct SQL → Fails

**Expected Results:**
- No secrets leaked to client
- Complete data isolation
- RLS policies bulletproof

---

## 9. Browser & Device Compatibility

### 9.1 Browser Testing

**Test Cases:**

1. **Chrome**
   - [ ] All features work
   - [ ] No console errors
   - [ ] UI renders correctly

2. **Firefox**
   - [ ] All features work
   - [ ] No console errors
   - [ ] UI renders correctly

3. **Safari**
   - [ ] All features work
   - [ ] No console errors
   - [ ] UI renders correctly
   - [ ] Verify WebKit-specific issues handled

4. **Edge**
   - [ ] All features work
   - [ ] No console errors
   - [ ] UI renders correctly

**Expected Results:**
- Works in all modern browsers
- Graceful degradation in older browsers

---

### 9.2 Mobile Testing

**Test Cases:**

1. **Mobile Chrome (Android)**
   - [ ] Sign in works
   - [ ] Chat interface usable
   - [ ] File explorer works
   - [ ] Touch interactions smooth

2. **Mobile Safari (iOS)**
   - [ ] Sign in works
   - [ ] Chat interface usable
   - [ ] File explorer works
   - [ ] No scroll issues

3. **Tablet (iPad)**
   - [ ] Optimal layout for tablet
   - [ ] Preview panel sized correctly
   - [ ] Sidebar accessible

4. **Responsive Design**
   - [ ] Test at 320px width (small phone)
   - [ ] Test at 768px width (tablet)
   - [ ] Test at 1024px width (laptop)
   - [ ] Test at 1920px width (desktop)
   - [ ] Verify no overflow or broken layouts

**Expected Results:**
- Mobile-first design works
- Touch-friendly UI
- No horizontal scroll

---

## 10. Accessibility (a11y)

### 10.1 Keyboard Navigation

**Test Cases:**

1. **Tab Navigation**
   - [ ] Tab through entire interface
   - [ ] Verify logical tab order
   - [ ] Verify all interactive elements reachable
   - [ ] Verify focus visible

2. **Keyboard Shortcuts**
   - [ ] `Cmd/Ctrl + /` → Focus search
   - [ ] `Cmd/Ctrl + K` → Focus chat
   - [ ] `Esc` → Close modals
   - [ ] Verify shortcuts work consistently

3. **Screen Reader Support**
   - [ ] Use VoiceOver (Mac) or NVDA (Windows)
   - [ ] Verify all content readable
   - [ ] Verify labels on inputs
   - [ ] Verify ARIA attributes correct

**Expected Results:**
- Fully keyboard accessible
- Screen reader friendly
- WCAG 2.1 AA compliant

---

### 10.2 Visual Accessibility

**Test Cases:**

1. **Color Contrast**
   - [ ] Run contrast checker
   - [ ] Verify text contrast ratio ≥ 4.5:1
   - [ ] Verify UI elements contrast ≥ 3:1

2. **Font Size**
   - [ ] Increase browser zoom to 200%
   - [ ] Verify text readable
   - [ ] Verify no overflow

3. **Dark Mode**
   - [ ] Switch to dark mode
   - [ ] Verify contrast still good
   - [ ] Verify no eye strain

**Expected Results:**
- High contrast everywhere
- Readable at all sizes
- Dark mode comfortable

---

## 11. Known Issues & Workarounds

### 11.1 Email Consistency (Account Duplication) ⚠️

**Issue:** If user signs up with one email but connects GitHub with different primary email, duplicate accounts created.

**Test:**
- [ ] Sign up: `user@personal.com`
- [ ] Connect GitHub: primary = `user@work.com`
- [ ] Verify: TWO accounts created (BUG)

**Workaround:**
- Ensure GitHub primary email matches sign-in email
- Use Account Linking feature to merge accounts
- See Help & Tips warning

**Fix Status:** ✅ Fixed via auto-detection (no manual Supabase connection)

---

### 11.2 Token Expiration (GitHub) ⚠️

**Issue:** Installation tokens expire after 1 hour, causing intermittent failures.

**Test:**
- [ ] Wait 1 hour after connecting GitHub
- [ ] Try to fetch files
- [ ] May see "Installation not found" error

**Workaround:**
- Auto-refresh implemented in token manager
- Should self-heal

**Fix Status:** ✅ Fixed (token manager with 5-min buffer)

---

### 11.3 Service Detection Delay

**Issue:** After adding env vars to Vercel, may not appear immediately in portal.

**Test:**
- [ ] Add `OPENAI_API_KEY` to Vercel
- [ ] Check portal immediately
- [ ] May not show yet

**Workaround:**
- Click "🔄 Refresh" button
- Or click "Reconnect & Detect Services"

**Fix Status:** ✅ Expected behavior (manual refresh needed)

---

## 12. Testing Checklist Summary

### Critical Path (Must Work) 🔥

- [ ] Sign Up (email/password)
- [ ] Sign In (email/password, GitHub, Google)
- [ ] Connect GitHub
- [ ] Connect Vercel
- [ ] Auto-detect services from Vercel env vars
- [ ] Send chat message to Claude
- [ ] View file in Explorer
- [ ] Commit changes via Source Control
- [ ] View preview (mobile & desktop)
- [ ] Add funds to account
- [ ] No duplicate accounts (email consistency)

### High Priority (Should Work)

- [ ] Account linking
- [ ] GitHub reconnect
- [ ] Vercel reconnect & detect services
- [ ] File search
- [ ] Git operations (branch, merge)
- [ ] Deployment tracking
- [ ] Settings (all tabs)
- [ ] Theme switching
- [ ] Admin features (auto-refill, onboarding reset)

### Medium Priority (Nice to Have)

- [ ] Help assistant
- [ ] Usage analytics
- [ ] Invoice download
- [ ] Project switching
- [ ] Advanced Git operations
- [ ] Rollback deployments

### Future Enhancements (Not Yet Implemented) ❌

- [ ] Real-time collaboration (multiple users, same project)
- [ ] Code editor with syntax highlighting (currently read-only viewer)
- [ ] Terminal access in portal
- [ ] AI code review before commit
- [ ] Automated testing integration
- [ ] Performance monitoring dashboard
- [ ] Custom domain management
- [ ] Team management & permissions
- [ ] Webhook configuration UI
- [ ] Environment variable management UI (currently Vercel only)
- [ ] Database schema viewer/editor
- [ ] API playground
- [ ] Component library browser

---

## 13. Test Data & Setup

### Test Accounts

**Admin Account:**
- Email: `hello@weblaunchacademy.com` or `mattjellis1@gmail.com`
- Role: `admin`
- Features: Auto-refill, onboarding reset, unlimited access

**Regular User:**
- Create fresh account for testing
- Email: `test+[timestamp]@example.com`
- Role: `client`

### Test Payment Cards (Stripe Test Mode)

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Exp: Any future date
- CVC: Any 3 digits

**Declined Payment:**
- Card: `4000 0000 0000 0002`
- Exp: Any future date
- CVC: Any 3 digits

**3D Secure:**
- Card: `4000 0025 0000 3155`
- Requires additional authentication

### Test Repositories

**Simple Next.js App:**
- Use for basic testing
- Few files, fast deployments

**Complex App:**
- 1000+ files
- Test performance
- Deep nesting

**With Services:**
- Has Stripe integration
- Has Supabase integration
- Has Airtable integration
- Tests service detection

---

## 14. Reporting Issues

### When Reporting Bugs:

**Include:**
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser & version**
5. **Screenshots/videos**
6. **Console errors** (F12 → Console)
7. **Network errors** (F12 → Network)

**Example:**
```
Title: Source Control takes entire screen

Steps:
1. Go to /portal
2. Click Source Control icon in sidebar
3. Observe layout

Expected: Source Control shows in sidebar, preview stays visible
Actual: Source Control takes full screen, preview hidden

Browser: Chrome 120.0
Screenshot: [attached]
Console: No errors
```

### Where to Report:

- GitHub Issues: `https://github.com/EllisIslandLab/Power_of_the_Prompt/issues`
- Email: `hello@weblaunchacademy.com`
- Slack: Web Launch Academy team channel

---

## 15. Automated Testing (Future)

### Unit Tests (Not Yet Implemented) ❌

**Framework:** Jest + React Testing Library

**Coverage Targets:**
- [ ] Components: 80%
- [ ] Utilities: 90%
- [ ] API routes: 70%

**Key Tests:**
- [ ] Chat message sending
- [ ] File tree rendering
- [ ] Service detection logic
- [ ] Balance calculations
- [ ] Token refresh logic

### Integration Tests (Not Yet Implemented) ❌

**Framework:** Playwright

**Key Flows:**
- [ ] Complete onboarding (signup → GitHub → Vercel → chat)
- [ ] Add funds → Send message → Verify balance deducted
- [ ] Connect service → Detect from Vercel → Use in chat
- [ ] Make change → Commit → Deploy → Preview updates

### E2E Tests (Not Yet Implemented) ❌

**Framework:** Cypress or Playwright

**Critical Paths:**
- [ ] Sign up → Onboard → First message
- [ ] Sign in → View files → Make change → Commit
- [ ] Add service env vars → Detect → Use in project

---

## Conclusion

This testing guide covers all implemented features and planned enhancements. Use it to:

1. **Manual QA** - Work through test cases systematically
2. **Regression Testing** - After changes, verify nothing broke
3. **User Acceptance Testing** - Validate features work as expected
4. **Planning** - See what's implemented vs. what's planned

**Priority Order for Testing:**

1. 🔥 **Critical Path** - Test first, these must work
2. **Core Features** - Portal, chat, files, settings
3. **Integrations** - GitHub, Vercel, services
4. **Edge Cases** - Errors, failures, weird states
5. **Performance** - Load testing, stress testing
6. **Security** - Auth, API, data privacy
7. **Accessibility** - Keyboard, screen reader, contrast

**Good luck testing!** 🚀

Report issues immediately so they can be fixed before more users affected.
