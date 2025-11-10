# Demo Generator - Complete Feature Summary

## 🎯 Core Architecture

### Two-Tier Generation System

**Tier 1: FREE - Static Template Generation**
- Instant generation (< 1 second)
- No API costs
- Professional, customizable template
- Uses user's business info, services, and colors

**Tier 2: PREMIUM - AI Customization**
- Claude AI generates unique HTML
- Based on user's vision/additional details
- Costs $0.10-$0.50 per generation
- Only runs when explicitly requested
- Can be gated behind payment later

---

## 📋 5-Step Form Flow

### Step 1: Business Information
- Business Name *
- Tagline
- Phone
- Business Contact Email
- Address, City, State, ZIP

**Navigation:** Next button only (no back needed)

### Step 2: Your Services
- Add 1-5 services
- Each service has title and description
- Add/remove services dynamically
- Service cards with trash icons

**Navigation:** Back + Next buttons

### Step 3: Describe Your Vision ✨ NEW
- Optional but recommended textarea (20-2000 chars)
- Helps for AI customization
- Examples and tips provided
- Character counter
- Explains how AI will use their input

**Navigation:** Back + Next buttons
**Note:** Can skip, but disables AI customization

### Step 4: Customize Colors
- Primary, Secondary, Accent colors
- Color pickers + hex input
- Live color preview swatches

**Navigation:** Back + Next buttons

### Step 5: Your Contact Information
- User email *
- Preview summary showing all entered data

**Navigation:** Back + Generate Preview buttons

---

## 🎨 Preview Modal Features

### Main Preview
- Full iframe showing generated website
- Responsive and scrollable
- Sandbox enabled for scripts/forms

### Action Buttons (Top Row)

1. **Back to Edit**
   - Returns to form
   - Preserves all entered data
   - Can edit and regenerate

2. **AI Customize (Premium)** ✨
   - Only shows if NOT already customized
   - Disabled if no vision details provided
   - Gradient purple/blue styling
   - Shows loading overlay (10-30 seconds)
   - Updates preview with AI-generated HTML
   - Title changes to "✨ AI-Customized Preview"

3. **Regenerate**
   - Retry if generation fails
   - Reload preview if issues occur
   - Re-runs AI customization if already customized

### Purchase CTAs (Right Sidebar)

1. **Get Code & Walkthrough Guide ($9)**
   - Highlighted with "INCLUDES YOUR CODE" badge
   - Yellow urgency box: "⏰ Your code expires in 24 hours!"
   - Explains: Download exact HTML/CSS + deployment guide
   - Links to /portal/store

2. **Get Expert Help (Free)**
   - Book 30-min consultation call
   - Links to Calendly
   - For done-for-you service

---

## 🔧 Interactive Features in Generated HTML

### Feature Modal System
When users click calendar slots or contact form:

**Modal Shows:**
- Title: "Unlock Full Functionality"
- Explains: Requires external services (Airtable, calendars, email)
- Urgency: "Your demo code is stored for only 24 hours!"
- Solution: "Follow steps in Walkthrough Guide"

**Two CTA Buttons:**
1. 📚 Get Code & Walkthrough Guide ($9) → /portal/store
2. 📅 Book Free Consultation → Calendly

**Features Triggering Modal:**
- Calendar time slot clicks
- Contact form submission
- Any interactive element needing external integration

---

## 💾 Database Schema

### demo_projects Table

**Core Fields:**
- `id` (UUID)
- `template_id` (UUID) - which template was used
- `user_email` - for contact/access
- `business_contact_email` - shown on their site
- `business_name`, `tagline`, `phone`, `address`, `city`, `state`, `zip`
- `services` (JSON) - array of service objects
- `colors` (JSON) - {primary, secondary, accent}
- `custom_fields` (JSON) - stores `additionalDetails` for AI customization
- `generated_html` (TEXT) - the actual HTML code
- `status` - 'pending', 'generated', 'viewed', 'converted'
- `viewed_at` (TIMESTAMPTZ) - when they first viewed
- **`expires_at` (TIMESTAMPTZ)** - 24 hours from creation
- `created_at`, `updated_at`

### Helper Functions

**cleanup_expired_demos()**
- Deletes demos older than 24 hours
- Frees up storage
- Call via cron or manually

**is_demo_expired(uuid)**
- Returns boolean
- Check if specific demo has expired

**demo_time_remaining(uuid)**
- Returns interval
- Shows how much time left (negative if expired)

---

## 🔌 API Endpoints

### POST /api/demo-generator/generate
**Purpose:** Initial FREE generation (static template)

**Input:**
```json
{
  "templateId": "uuid",
  "businessName": "string",
  "services": [{"title": "string", "description": "string"}],
  "additionalDetails": "string (optional)",
  "primaryColor": "#hex",
  // ... other fields
}
```

**Output:**
```json
{
  "success": true,
  "demoProjectId": "uuid",
  "html": "<!DOCTYPE html>...",
  "businessName": "string"
}
```

**Process:**
1. Validates input
2. Generates static HTML template
3. Stores in database with `additionalDetails` in `custom_fields`
4. Sends confirmation email
5. Returns preview HTML

### POST /api/demo-generator/customize
**Purpose:** PREMIUM AI customization upgrade

**Input:**
```json
{
  "demoProjectId": "uuid"
}
```

**Output:**
```json
{
  "success": true,
  "html": "<!DOCTYPE html>...",
  "demoProjectId": "uuid"
}
```

**Process:**
1. Fetches demo project from DB
2. Checks if expired (returns 410 if expired)
3. Validates `additionalDetails` exists (min 20 chars)
4. Calls Claude API with full context + vision
5. Updates `generated_html` in database
6. Returns AI-customized HTML

**Cost:** ~$0.10-$0.50 per call

### POST /api/demo-generator/track-interaction
**Purpose:** Analytics tracking

**Events:**
- `viewed_preview`
- `clicked_textbook`
- `purchased_textbook`
- `clicked_book_call`
- `booked_call`

---

## 💰 Monetization Strategy

### Free Tier
- Static template generation
- Professional, customizable design
- Immediate preview
- 24-hour code access

### Paid Upgrades

**Option 1: Walkthrough Guide ($9)**
- Download their exact generated code
- Step-by-step deployment guide
- Learn to connect external services (Airtable, etc.)
- 24-hour urgency window

**Option 2: AI Customization (Future Pricing TBD)**
- Currently free if details provided
- Can be gated behind payment
- Could be bundled with Walkthrough Guide
- Or separate premium tier ($15-25?)

**Option 3: Done-For-You Service**
- Book free consultation
- Full website build
- All integrations included
- Premium service ($500-2000?)

---

## 🚀 User Journey & Conversion Funnel

1. **Landing Page** → Click "Get Your Free Website Preview"

2. **Form Steps 1-5** → Fill out business info, services, vision, colors, email

3. **Initial Preview** (FREE)
   - See static template preview
   - Looks professional and branded
   - Interactive elements show feature modal

4. **Decision Points:**

   **Path A: AI Customize**
   - Click "AI Customize (Premium)"
   - Wait 10-30 seconds
   - Get unique, tailored design
   - *(Currently free, can gate later)*

   **Path B: Buy Code + Guide**
   - Click "Get Code & Walkthrough Guide"
   - Pay $9
   - Download their code + deployment instructions
   - Limited time (24 hours)

   **Path C: Book Consultation**
   - Click "Book Free Call"
   - Schedule with Calendly
   - Discuss done-for-you service

   **Path D: Go Back & Edit**
   - Click "Back to Edit"
   - Modify any information
   - Regenerate with new data

---

## 🎯 Key Success Metrics to Track

1. **Form Completion Rate** - % who finish all 5 steps
2. **Vision Field Usage** - % who fill out Step 3 (additionalDetails)
3. **AI Customization Rate** - % who click "AI Customize"
4. **Purchase Conversion** - % who buy Walkthrough Guide
5. **Consultation Bookings** - % who schedule calls
6. **Time to Expire** - How many access code before 24hr expiry
7. **Back Button Usage** - % who edit and regenerate
8. **Feature Modal Triggers** - Which features get clicked most

---

## 🔒 Cost Control Measures

**Before (Bad):**
- Claude API on every submission
- Could cost $50-500/day with traffic
- No control over spending

**After (Good):**
- Static generation is FREE
- Claude only on explicit upgrade
- Can gate behind payment anytime
- Estimated cost: $10-50/month max

**Future Options:**
1. Charge $5-10 for AI customization
2. Bundle with Walkthrough Guide ($15 total)
3. Limit to 1 AI customization per email
4. Rate limit: 3 AI customizations per hour per IP

---

## 📝 TODO: Future Enhancements

1. **Payment Gate for AI Customization**
   - Add Stripe checkout before AI call
   - Price: $10-15 one-time

2. **Code Download Feature**
   - After purchase, show download button
   - ZIP file with HTML/CSS/assets
   - Deployment instructions

3. **Email with Preview Link**
   - Send link to preview their demo
   - Track email opens/clicks
   - Follow-up sequences

4. **A/B Testing**
   - Test different pricing ($9 vs $15)
   - Test urgency messaging (24hr vs 48hr)
   - Test CTA button copy

5. **Analytics Dashboard**
   - View all demos created
   - Conversion rates by template
   - Revenue by source

6. **More Templates**
   - Add different industry templates
   - Real estate, restaurants, coaches, etc.
   - Let users choose template before form

---

## 🐛 Error Handling

**What happens if Claude API fails?**
- User sees error toast
- Can click "Regenerate" to retry
- Falls back gracefully
- Doesn't lose their data

**What if demo expires?**
- API returns 410 Gone
- User prompted to create new demo
- Old HTML deleted automatically

**What if external services fail?**
- Feature modal explains limitations
- Directs to Walkthrough Guide
- Booking consultation as backup

---

## 🔧 Testing Checklist

Before deploying to production:

- [ ] Test all 5 form steps (back/next)
- [ ] Test form validation (required fields)
- [ ] Test static generation (no Claude)
- [ ] Test AI customization (with additionalDetails)
- [ ] Test AI customization disabled (no additionalDetails)
- [ ] Test "Back to Edit" preserves data
- [ ] Test "Regenerate" button
- [ ] Test feature modal triggers (calendar, contact form)
- [ ] Test 24-hour expiry (manually update DB timestamp)
- [ ] Test purchase CTAs link to correct pages
- [ ] Test email notifications sent
- [ ] Verify no Claude calls on initial generation (check logs)
- [ ] Verify Claude DOES call on AI customize (check logs)

---

## 📊 Environment Variables Needed

**Required:**
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx  # For AI customization
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

**For Full Functionality:**
```env
RESEND_API_KEY=re_xxx  # Email notifications
STRIPE_SECRET_KEY=sk_xxx  # Future payment gating
```

---

## 🚨 Important Notes

1. **ANTHROPIC_API_KEY is in .env.local but says "your_api_key_here"**
   - You MUST add your real API key to test AI customization
   - Get key from: https://console.anthropic.com/

2. **Database migration not yet run**
   - Run: `supabase/migrations/20251110000001_add_demo_expiry.sql`
   - Adds `expires_at` column

3. **All changes are LOCAL only**
   - Not yet pushed to Vercel
   - Test locally first: `npm run dev`
   - When ready: `git push`

4. **Add ANTHROPIC_API_KEY to Vercel**
   - Before deploying, add to Vercel env vars
   - Both Preview and Production environments

---

## 🎉 Summary

This demo generator now:
- ✅ Generates FREE static previews instantly
- ✅ Offers PREMIUM AI customization upgrade
- ✅ Has clear conversion funnel (code purchase, consultation, AI upgrade)
- ✅ Controls costs (no Claude on free tier)
- ✅ 24-hour urgency for code access
- ✅ Full back/next/regenerate functionality
- ✅ Professional UI with loading states
- ✅ Analytics tracking ready
- ✅ Scalable architecture

**Cost savings:** ~$500-5000/month by not running Claude on every free demo!
