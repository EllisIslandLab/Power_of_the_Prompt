# Web Launch Academy - Phase 1: Component-Based Demo Builder

## 🎯 Project Overview

You are building a revolutionary website builder for Web Launch Academy (weblaunchacademy.com) that uses a component-based architecture with AI enhancement, contest gamification, and a referral system. This is NOT a traditional template builder - it's a crowdsourced platform where users create and improve website components that benefit everyone.

---

## 🏗️ Core Architecture Philosophy

### **Hybrid Storage System:**
- **GitHub Repository (Boilerplate):** Next.js framework, config files, standard components, Web Launch Academy badge
- **Supabase (User-Generated):** Template components, page structures, metadata, preview HTML
- **Dynamic Assembly:** Merge boilerplate + components at download time

### **Why This Matters:**
- 88% storage savings (10KB per template vs. 500KB self-contained)
- Easy global updates (fix boilerplate once, all templates benefit)
- Version control (boilerplate in Git, components in Supabase)
- Always current (users get latest Next.js, dependencies, badge)

---

## 💰 Pricing & Rollover System

### **The Core Principle:**
**"You'll never pay more than $3,000 total, and we reward commitment."**

### **Tier Structure:**

| Tier | Standalone | With Rollover | With 10% Skip |
|------|-----------|---------------|---------------|
| AI Premium | $5 | N/A | N/A |
| Textbook + Code | $19 | $14 (if bought AI first) | $17.10 (if skipping) |
| Basic ($300) | $300 | Varies by path | $270 (10% off) |
| Mid ($1K) | $1,000 | Varies by path | $900 (10% off) |
| Pro ($3K) | $3,000 | Varies by path | $2,700 (10% off) |

### **Rollover Rules:**
1. Every dollar spent rolls into the next tier
2. Maximum total spend: $3,000 (if buying all tiers progressively)
3. Skip discount: 10% off ANY tier if you skip lower tiers
4. Discount is on TOTAL price, not just the difference

### **Example Paths:**

**Progressive Buyer:**
```
$5 AI Premium
  → Pay $14 more for Textbook ($19 total)
  → Pay $281 more for Basic ($300 total)
  → Pay $700 more for Mid ($1,000 total)
  → Pay $2,000 more for Pro ($3,000 total)
```

**Skip-Ahead Buyer:**
```
Skip to Pro directly
  → Pay $2,700 (10% off $3,000)
  → Savings: $300 for commitment
```

**Mixed Path:**
```
$5 AI Premium
  → Skip to Pro: Pay $2,695 more
  → Total: $2,700 (gets rollover + skip discount)
```

---

## 🏆 Contest & Gamification System

### **Two Contest Types:**

**Grand Prize (Free Website - Pro Tier Worth $3,000):**
- Create new category template with AI = 1 entry
- Improve existing category template with AI = 1 entry
- Unlimited entries (build 10 templates = 10 entries)

**Secondary Prize (TBD - Architecture Toolkit or Similar):**
- Create new component with AI = 1 entry
- Improve existing component with AI = 1 entry
- Unlimited entries per user

### **Rules:**
- ✅ Only AI-generated improvements count (encourages $5 AI Premium)
- ✅ Using pre-built templates/components = no entry (but free to use)
- ✅ All submissions stored indefinitely (never deleted)
- ✅ Matt reviews and approves/rejects
- ✅ Contest entry counts even if rejected (they tried!)

---

## 🗄️ Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- ============================================
-- BOILERPLATE VERSIONS
-- ============================================

CREATE TABLE boilerplate_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_number text NOT NULL, -- "1.0.0", "1.1.0"
  github_repo_url text NOT NULL,
  github_commit_sha text NOT NULL,
  nextjs_version text NOT NULL,
  release_notes text,
  is_current boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Seed initial version
INSERT INTO boilerplate_versions (version_number, github_repo_url, github_commit_sha, nextjs_version, is_current, release_notes)
VALUES ('1.0.0', 'https://github.com/weblaunchacademy/nextjs-boilerplate', 'main', '15.0.0', true, 'Initial boilerplate with Web Launch Academy badge');

-- ============================================
-- BUSINESS CATEGORIES
-- ============================================

CREATE TABLE business_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text, -- Emoji or icon class
  suggested_components jsonb, -- Array of component suggestions
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- Seed initial category
INSERT INTO business_categories (name, slug, description, icon, suggested_components, display_order) VALUES
('Personal Finance', 'personal-finance', 'For financial coaches, advisors, and Ramsey Preferred Coaches', '💰', 
 '["budget_calculator", "debt_tracker", "mortgage_calculator", "booking_calendar", "email_signup", "contact_form", "testimonials"]', 1);

-- ============================================
-- COMPONENT LIBRARY
-- ============================================

CREATE TABLE components (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  component_name text UNIQUE NOT NULL, -- 'email_signup', 'booking_calendar'
  display_name text NOT NULL, -- 'Email Signup', 'Booking Calendar'
  icon text NOT NULL, -- Emoji or icon
  
  -- Categorization
  category text NOT NULL, -- 'collection', 'tools', 'content', 'visual'
  business_category_tags text[], -- Which business types this suits
  
  -- Current version (points to latest approved)
  current_version_id uuid, -- References component_versions(id)
  
  -- Metadata
  total_uses integer DEFAULT 0,
  average_rating decimal DEFAULT 0,
  
  created_at timestamp DEFAULT now()
);

CREATE TABLE component_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id uuid REFERENCES components(id) ON DELETE CASCADE,
  
  -- Version info
  version_number integer NOT NULL,
  created_by_email text NOT NULL,
  created_by_name text,
  
  -- What changed
  change_type text NOT NULL, -- 'initial', 'improvement', 'major_update'
  change_description text,
  
  -- The actual component code
  component_code text NOT NULL, -- React component TSX
  css_styles text, -- Tailwind classes or custom CSS
  required_props jsonb, -- What props it needs
  
  -- AI metadata
  was_ai_generated boolean DEFAULT false,
  ai_prompt_used text,
  ai_credits_spent integer DEFAULT 0,
  
  -- Preview assets
  preview_screenshot_url text, -- S3 URL
  preview_html text, -- Standalone demo
  
  -- Review status
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'superseded'
  reviewed_by text,
  reviewed_at timestamp,
  quality_score integer, -- 1-10
  review_notes text,
  
  -- Contest entry
  is_contest_entry boolean DEFAULT false,
  
  -- Usage tracking
  times_used integer DEFAULT 0,
  
  created_at timestamp DEFAULT now(),
  
  UNIQUE(component_id, version_number)
);

CREATE TABLE component_ratings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_version_id uuid REFERENCES component_versions(id) ON DELETE CASCADE,
  rated_by_email text NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  feedback text,
  created_at timestamp DEFAULT now(),
  UNIQUE(component_version_id, rated_by_email)
);

-- ============================================
-- TEMPLATE SUBMISSIONS
-- ============================================

CREATE TABLE template_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamp DEFAULT now(),
  
  -- User info
  submitted_by_email text NOT NULL,
  submitted_by_name text,
  
  -- Template identity
  template_name text NOT NULL,
  business_category_id uuid REFERENCES business_categories(id),
  
  -- Component-based structure
  components jsonb NOT NULL,
  -- Example:
  -- {
  --   "Header": "export function Header({ businessName }: Props) { return <header>...</header> }",
  --   "HeroSection": "export function Hero({ headline, subheadline }: Props) { return <section>...</section> }",
  --   "Footer": "export function Footer({ contact }: Props) { return <footer>...</footer> }"
  -- }
  
  page_structure jsonb NOT NULL,
  -- Example:
  -- {
  --   "home": ["Header", "HeroSection", "ServicesSection", "TestimonialsSection", "Footer"]
  -- }
  
  metadata jsonb NOT NULL,
  -- Example:
  -- {
  --   "theme": {
  --     "primaryColor": "#2d5016",
  --     "secondaryColor": "#8b6914"
  --   },
  --   "fonts": ["Inter", "Poppins"],
  --   "animations": true,
  --   "content_placeholders": {
  --     "businessName": "{{BUSINESS_NAME}}",
  --     "tagline": "{{TAGLINE}}"
  --   }
  -- }
  
  -- Preview (static HTML for fast display)
  preview_html text NOT NULL,
  preview_screenshot_url text,
  
  -- Boilerplate version used
  boilerplate_version_id uuid REFERENCES boilerplate_versions(id),
  
  -- AI metadata
  was_ai_generated boolean DEFAULT false,
  ai_prompts_used jsonb,
  ai_credits_spent integer DEFAULT 0,
  
  -- Review status
  status text DEFAULT 'pending',
  reviewed_by text,
  reviewed_at timestamp,
  quality_score integer,
  review_notes text,
  
  -- Contest tracking
  is_contest_entry boolean DEFAULT false,
  contest_type text, -- 'grand_prize'
  
  -- Versioning
  version_number integer DEFAULT 1,
  replaces_template_id uuid REFERENCES template_submissions(id), -- If improving existing
  
  is_featured boolean DEFAULT false
);

-- ============================================
-- DEMO SESSIONS (User Building Process)
-- ============================================

CREATE TABLE demo_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamp DEFAULT now(),
  last_activity timestamp DEFAULT now(),
  
  -- User info
  user_email text NOT NULL,
  business_name text,
  
  -- Builder choice
  builder_type text NOT NULL, -- 'free' or 'ai_premium'
  ai_premium_paid boolean DEFAULT false,
  ai_premium_payment_intent text, -- Stripe payment ID
  
  -- Form progress
  current_step integer DEFAULT 1,
  form_data jsonb, -- All their answers
  selected_components jsonb, -- Which components they chose
  
  -- AI tracking
  ai_credits_total integer DEFAULT 0,
  ai_credits_used integer DEFAULT 0,
  ai_interactions jsonb, -- Log of AI enhancements
  
  -- Generated outputs
  generated_template_id uuid REFERENCES template_submissions(id),
  preview_html text,
  
  -- Payment tracking
  purchased_tier text, -- 'textbook', 'basic', 'mid', 'pro'
  total_paid decimal DEFAULT 0,
  rollover_credit decimal DEFAULT 0,
  skip_discount_applied boolean DEFAULT false,
  
  -- State
  status text DEFAULT 'building' -- 'building', 'previewing', 'purchased', 'abandoned'
);

-- ============================================
-- CONTEST ENTRIES
-- ============================================

CREATE TABLE contest_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email text NOT NULL,
  contest_type text NOT NULL, -- 'grand_prize' or 'secondary_prize'
  contest_season text NOT NULL, -- 'Q1-2025', 'Q2-2025', etc.
  
  -- Entry tracking
  total_entries integer DEFAULT 0,
  submissions jsonb, -- Array of submission IDs
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(user_email, contest_type, contest_season)
);

-- ============================================
-- REFERRAL SYSTEM
-- ============================================

CREATE TABLE referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email text UNIQUE NOT NULL,
  referral_code text UNIQUE NOT NULL,
  
  -- Stats
  total_clicks integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  total_earnings decimal DEFAULT 0,
  pending_payout decimal DEFAULT 0,
  paid_out decimal DEFAULT 0,
  
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

CREATE TABLE referral_clicks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code text NOT NULL REFERENCES referrals(referral_code),
  
  clicked_at timestamp DEFAULT now(),
  source_domain text,
  user_ip text,
  user_agent text,
  
  converted boolean DEFAULT false,
  conversion_tier text,
  conversion_amount decimal,
  commission_earned decimal
);

CREATE TABLE referral_payouts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code text NOT NULL REFERENCES referrals(referral_code),
  
  amount decimal NOT NULL,
  payout_method text,
  payout_email text,
  
  status text DEFAULT 'pending',
  processed_at timestamp,
  
  created_at timestamp DEFAULT now()
);

-- ============================================
-- USER PURCHASES (Track Purchase Journey)
-- ============================================

CREATE TABLE user_purchases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email text NOT NULL,
  
  -- Purchase details
  tier text NOT NULL,
  amount_paid decimal NOT NULL,
  stripe_payment_intent_id text,
  
  -- Rollover tracking
  previous_tier text,
  rollover_credit decimal DEFAULT 0,
  skip_discount_applied boolean DEFAULT false,
  
  -- Delivered assets
  demo_session_id uuid REFERENCES demo_sessions(id),
  referral_code text REFERENCES referrals(referral_code),
  
  created_at timestamp DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_components_category ON components(category);
CREATE INDEX idx_component_versions_status ON component_versions(status);
CREATE INDEX idx_component_versions_quality ON component_versions(quality_score DESC);
CREATE INDEX idx_template_submissions_status ON template_submissions(status);
CREATE INDEX idx_template_submissions_category ON template_submissions(business_category_id);
CREATE INDEX idx_demo_sessions_email ON demo_sessions(user_email);
CREATE INDEX idx_demo_sessions_status ON demo_sessions(status);
CREATE INDEX idx_contest_entries_lookup ON contest_entries(user_email, contest_season);
CREATE INDEX idx_referral_clicks_code ON referral_clicks(referral_code);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access demo_sessions" ON demo_sessions
  FOR ALL USING (auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com');

CREATE POLICY "Admin full access templates" ON template_submissions
  FOR ALL USING (auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com');

-- Users can insert demo sessions (anonymous)
CREATE POLICY "Anyone can create demo" ON demo_sessions
  FOR INSERT WITH CHECK (true);

-- Users can view their own sessions
CREATE POLICY "View own sessions" ON demo_sessions
  FOR SELECT USING (user_email = auth.jwt() ->> 'email' OR auth.jwt() ->> 'email' IS NULL);

-- Users can submit templates
CREATE POLICY "Anyone can submit templates" ON template_submissions
  FOR INSERT WITH CHECK (true);

-- Everyone can view approved templates
CREATE POLICY "View approved templates" ON template_submissions
  FOR SELECT USING (status = 'approved');
```

---

## 📂 Project File Structure

```
weblaunchacademy.com/
├── app/
│   ├── get-started/
│   │   ├── page.tsx                       // Landing: Free vs AI Premium choice
│   │   └── build/
│   │       ├── [sessionId]/
│   │       │   └── page.tsx               // Main builder interface
│   │       └── preview/
│   │           └── [sessionId]/
│   │               └── page.tsx           // Preview modal page
│   ├── api/
│   │   ├── sessions/
│   │   │   ├── create/route.ts            // Create new demo session
│   │   │   └── [id]/
│   │   │       ├── save/route.ts          // Save form progress
│   │   │       └── generate/route.ts      // Generate preview
│   │   ├── ai/
│   │   │   ├── enhance/route.ts           // AI enhancement requests
│   │   │   └── clarify/route.ts           // Clarifying questions
│   │   ├── components/
│   │   │   ├── list/route.ts              // Get components by category
│   │   │   └── preview/route.ts           // Get component preview
│   │   ├── payments/
│   │   │   ├── ai-premium/route.ts        // Process $5 AI payment
│   │   │   └── tier/route.ts              // Process tier purchases
│   │   ├── referrals/
│   │   │   ├── generate/route.ts          // Generate referral code
│   │   │   └── track/route.ts             // Track clicks
│   │   └── download/
│   │       └── [sessionId]/route.ts       // Assemble & deliver code
│   ├── admin/
│   │   ├── page.tsx                       // Dashboard
│   │   ├── submissions/
│   │   │   ├── page.tsx                   // Review queue
│   │   │   └── [id]/
│   │   │       └── page.tsx               // Individual review
│   │   └── contest/
│   │       └── page.tsx                   // Leaderboard & winners
│   └── portal/                            // Existing portal (don't touch)
│
├── components/
│   ├── builder/
│   │   ├── BuilderLanding.tsx             // Free vs AI Premium choice
│   │   ├── FormContainer.tsx              // Multi-step form wrapper
│   │   ├── ProgressBar.tsx                // Visual progress indicator
│   │   ├── steps/
│   │   │   ├── Step1-BasicInfo.tsx        // Business name, email, etc.
│   │   │   ├── Step2-CategorySelection.tsx // Choose business category
│   │   │   ├── Step3-SectionBuilder.tsx   // Main builder interface
│   │   │   └── Step4-Review.tsx           // Final review before preview
│   │   ├── SectionBuilder.tsx             // Add/remove sections
│   │   ├── SectionPurposeSelector.tsx     // Content/Tools/Collection/Visual
│   │   ├── ComponentLibrary.tsx           // Browse components
│   │   ├── ComponentCard.tsx              // Individual component display
│   │   ├── ComponentPreview.tsx           // Hover/click preview
│   │   └── AIEnhancementPrompt.tsx        // "Upgrade to AI" notifications
│   ├── preview/
│   │   ├── PreviewModal.tsx               // Full preview display
│   │   ├── PreviewFrame.tsx               // Iframe for HTML
│   │   └── CTASection.tsx                 // Upsell after preview
│   ├── payments/
│   │   ├── PaymentGate.tsx                // Pre-preview payment prompt
│   │   ├── TierPricing.tsx                // Show all tiers with rollover
│   │   └── StripeCheckout.tsx             // Embedded Stripe
│   ├── admin/
│   │   ├── SubmissionCard.tsx             // Review queue card
│   │   ├── ComponentVersionHistory.tsx    // Version browser
│   │   └── Leaderboard.tsx                // Contest standings
│   └── shared/
│       ├── SaveIndicator.tsx              // "Saving..." / "Saved"
│       └── AICreditsCounter.tsx           // "X/30 credits remaining"
│
├── lib/
│   ├── supabase/
│   │   └── client.ts                      // Existing Supabase client
│   ├── generators/
│   │   ├── assembleTemplate.ts            // Merge boilerplate + components
│   │   ├── generatePreviewHTML.ts         // Create static preview
│   │   └── captureScreenshot.ts           // Puppeteer screenshot
│   ├── ai/
│   │   ├── claude.ts                      // Anthropic API client
│   │   ├── generateComponent.ts           // AI component generation
│   │   └── generateClarifyingQuestions.ts // AI clarification
│   ├── payments/
│   │   ├── stripe.ts                      // Stripe client
│   │   ├── calculateRollover.ts           // Pricing logic
│   │   └── processPayment.ts              // Handle transactions
│   ├── referrals/
│   │   ├── generateCode.ts                // Create referral code
│   │   └── trackClick.ts                  // Log referral traffic
│   └── utils/
│       ├── slugify.ts                     // Generate URL slugs
│       └── validateEmail.ts               // Email validation
│
└── types/
    ├── database.ts                        // Supabase types
    ├── builder.ts                         // Builder interfaces
    └── payments.ts                        // Payment interfaces
```

---

## 🎨 UI/UX Implementation

### **Landing Page: /get-started**

```tsx
// app/get-started/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuilderLanding } from '@/components/builder/BuilderLanding';

export default function GetStartedPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  
  async function handleBuilderChoice(type: 'free' | 'ai_premium') {
    setIsCreating(true);
    
    // Create new demo session
    const response = await fetch('/api/sessions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ builderType: type })
    });
    
    const { sessionId } = await response.json();
    
    // Redirect to builder
    router.push(`/get-started/build/${sessionId}`);
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Build Your Professional Website
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your path: Free template builder or AI-powered precision
          </p>
        </div>
        
        <BuilderLanding 
          onChoose={handleBuilderChoice}
          isLoading={isCreating}
        />
      </div>
    </div>
  );
}
```

### **Builder Landing Component:**

```tsx
// components/builder/BuilderLanding.tsx

interface BuilderLandingProps {
  onChoose: (type: 'free' | 'ai_premium') => void;
  isLoading: boolean;
}

export function BuilderLanding({ onChoose, isLoading }: BuilderLandingProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Free Builder Option */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-gray-300 transition-all">
        <div className="text-center">
          <div className="text-4xl mb-4">🆓</div>
          <h2 className="text-2xl font-bold mb-2">Free Template Builder</h2>
          <p className="text-gray-600 mb-6">
            Quick & simple, great for testing the waters
          </p>
          
          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Pre-built component library</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Basic customization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Instant preview</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Professional result</span>
            </li>
          </ul>
          
          <button
            onClick={() => onChoose('free')}
            disabled={isLoading}
            className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Start Free Build'}
          </button>
        </div>
      </div>
      
      {/* AI Premium Option */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 border-2 border-blue-400 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          🏆 Enter Contest
        </div>
        
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold mb-2">AI Premium Builder</h2>
          <p className="text-3xl font-bold text-blue-600 mb-2">$5</p>
          <p className="text-gray-600 mb-6">
            In-depth analysis, clarifying prompts, precision-built demo
          </p>
          
          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span><strong>30 AI-powered refinements</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Natural language descriptions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Clarifying questions for precision</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Better source code</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">🏆</span>
              <span><strong>Contest entries for prizes!</strong></span>
            </li>
          </ul>
          
          <div className="bg-white/80 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              💎 <strong>This $5 rolls into any package you buy!</strong>
              <br />Never pay extra - it's an investment in better results.
            </p>
          </div>
          
          <button
            onClick={() => onChoose('ai_premium')}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Start AI Build - $5'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 Core Functionality Implementation

### **Session Creation API:**

```typescript
// app/api/sessions/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const { builderType } = await req.json();
    
    const supabase = createClient();
    
    // Create new demo session
    const { data: session, error } = await supabase
      .from('demo_sessions')
      .insert({
        id: nanoid(),
        builder_type: builderType,
        ai_premium_paid: builderType === 'ai_premium' ? false : null,
        ai_credits_total: builderType === 'ai_premium' ? 30 : 0,
        status: 'building'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ 
      sessionId: session.id,
      builderType: session.builder_type
    });
    
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
```

### **Multi-Step Form Container:**

```tsx
// components/builder/FormContainer.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from './ProgressBar';
import { Step1BasicInfo } from './steps/Step1-BasicInfo';
import { Step2CategorySelection } from './steps/Step2-CategorySelection';
import { Step3SectionBuilder } from './steps/Step3-SectionBuilder';
import { Step4Review } from './steps/Step4-Review';
import { SaveIndicator } from '@/components/shared/SaveIndicator';

interface FormContainerProps {
  sessionId: string;
  builderType: 'free' | 'ai_premium';
}

export function FormContainer({ sessionId, builderType }: FormContainerProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const totalSteps = 4;
  
  // Auto-save to localStorage
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem(`session-${sessionId}`, JSON.stringify({
        currentStep,
        formData,
        lastSaved: new Date()
      }));
    }, 500);
    
    return () => clearTimeout(saveTimer);
  }, [formData, currentStep, sessionId]);
  
  // Auto-save to Supabase (debounced)
  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      setIsSaving(true);
      
      await fetch(`/api/sessions/${sessionId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep,
          formData
        })
      });
      
      setIsSaving(false);
      setLastSaved(new Date());
    }, 2000);
    
    return () => clearTimeout(saveTimer);
  }, [formData, currentStep, sessionId]);
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`session-${sessionId}`);
    if (saved) {
      const { currentStep: savedStep, formData: savedData } = JSON.parse(saved);
      setCurrentStep(savedStep);
      setFormData(savedData);
    }
  }, [sessionId]);
  
  function handleNext() {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - redirect to payment gate
      router.push(`/get-started/build/${sessionId}/preview`);
    }
  }
  
  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }
  
  function updateFormData(stepData: any) {
    setFormData(prev => ({ ...prev, ...stepData }));
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Build Your Website</h1>
            <SaveIndicator 
              isSaving={isSaving} 
              lastSaved={lastSaved} 
            />
          </div>
          <ProgressBar 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
          />
        </div>
        
        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && (
            <Step1BasicInfo
              data={formData}
              onChange={updateFormData}
              builderType={builderType}
            />
          )}
          
          {currentStep === 2 && (
            <Step2CategorySelection
              data={formData}
              onChange={updateFormData}
            />
          )}
          
          {currentStep === 3 && (
            <Step3SectionBuilder
              data={formData}
              onChange={updateFormData}
              sessionId={sessionId}
              builderType={builderType}
            />
          )}
          
          {currentStep === 4 && (
            <Step4Review
              data={formData}
              onChange={updateFormData}
            />
          )}
        </div>
        
        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            {currentStep === totalSteps ? 'Generate Preview →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### **Section Builder (The Core UI):**

```tsx
// components/builder/SectionBuilder.tsx

'use client';

import { useState } from 'react';
import { SectionPurposeSelector } from './SectionPurposeSelector';
import { ComponentLibrary } from './ComponentLibrary';
import { AIEnhancementPrompt } from './AIEnhancementPrompt';

interface Section {
  id: string;
  purpose: 'content' | 'tools' | 'collection' | 'visual' | 'custom';
  selectedComponent?: string;
  componentData?: any;
  aiEnhanced?: boolean;
}

export function SectionBuilder({ 
  sections, 
  onChange,
  builderType,
  sessionId 
}: any) {
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  
  function addSection() {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      purpose: 'content'
    };
    
    onChange([...sections, newSection]);
    
    // Show warning if >3 sections
    if (sections.length >= 3) {
      // Show toast notification
      alert('⚠️ Pages with more than 5 sections may feel overwhelming to visitors. Consider keeping it focused!');
    }
  }
  
  function removeSection(id: string) {
    onChange(sections.filter((s: Section) => s.id !== id));
  }
  
  function updateSection(id: string, updates: Partial<Section>) {
    onChange(sections.map((s: Section) => 
      s.id === id ? { ...s, ...updates } : s
    ));
    
    // Check if AI enhancement needed
    if (updates.componentData && isComplexData(updates.componentData)) {
      setShowAIPrompt(true);
    }
  }
  
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Build Your Page</h2>
        <p className="text-gray-600">
          Add sections to create your website. First section is required.
        </p>
      </div>
      
      {/* Sections */}
      {sections.map((section: Section, index: number) => (
        <div 
          key={section.id}
          className="border-2 border-gray-200 rounded-lg p-6 relative"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Section {index + 1}
              {index === 0 && <span className="text-red-500 ml-2">*Required</span>}
            </h3>
            
            {index > 0 && (
              <button
                onClick={() => removeSection(section.id)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
          
          {/* Section Purpose */}
          {!section.selectedComponent && (
            <SectionPurposeSelector
              selected={section.purpose}
              onChange={(purpose) => updateSection(section.id, { purpose })}
            />
          )}
          
          {/* Component Selection */}
          {section.purpose && !section.selectedComponent && (
            <ComponentLibrary
              purpose={section.purpose}
              builderType={builderType}
              onSelect={(componentId) => 
                updateSection(section.id, { selectedComponent: componentId })
              }
              sessionId={sessionId}
            />
          )}
          
          {/* Component Configuration */}
          {section.selectedComponent && (
            <div>
              {/* Component-specific form fields */}
              {/* This would be dynamic based on component requirements */}
            </div>
          )}
        </div>
      ))}
      
      {/* Add Section Button */}
      <button
        onClick={addSection}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600 font-semibold"
      >
        + Add Another Section
      </button>
      
      {/* Finish Button */}
      <div className="text-center">
        <button
          disabled={sections.length === 0}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          I'm Done Building
        </button>
      </div>
      
      {/* AI Enhancement Prompt */}
      {showAIPrompt && builderType === 'free' && (
        <AIEnhancementPrompt
          onUpgrade={() => {/* Handle upgrade */}}
          onDismiss={() => setShowAIPrompt(false)}
        />
      )}
    </div>
  );
}

function isComplexData(data: any): boolean {
  // Detect if user's input requires AI
  // Simple heuristics: long descriptions, complex logic keywords, etc.
  const text = JSON.stringify(data);
  const complexKeywords = ['if', 'based on', 'depending', 'show different', 'integrate'];
  return text.length > 200 || complexKeywords.some(kw => text.includes(kw));
}
```

---

## 💳 Payment Integration

### **Payment Gate Component:**

```tsx
// components/payments/PaymentGate.tsx

'use client';

import { useState } from 'react';
import { TierPricing } from './TierPricing';
import { StripeCheckout } from './StripeCheckout';

interface PaymentGateProps {
  sessionId: string;
  hasAIPremium: boolean;
  hasComplexFeatures: boolean;
  onPaymentComplete: () => void;
  onSkip: () => void;
}

export function PaymentGate({
  sessionId,
  hasAIPremium,
  hasComplexFeatures,
  onPaymentComplete,
  onSkip
}: PaymentGateProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Your Site is Ready to Preview!
          </h2>
          
          {/* Conditional messaging */}
          {hasComplexFeatures && !hasAIPremium ? (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h3 className="text-lg font-bold mb-2">
                    We Detected Advanced Features
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Your site includes complex functionality that works best with AI Premium.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold mb-2">Without AI Premium:</p>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Basic template version</li>
                        <li>• Standard functionality</li>
                        <li>• May not match your exact vision</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-2">With AI Premium ($5):</p>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Precise implementation</li>
                        <li>• 30 AI-powered refinements</li>
                        <li>• Professional-grade code</li>
                        <li>• Rolls into any package!</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => {
                        setSelectedTier('ai_premium');
                        setShowCheckout(true);
                      }}
                      className="flex-1 bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700"
                    >
                      Upgrade to AI Premium - $5
                    </button>
                    
                    <button
                      onClick={onSkip}
                      className="flex-1 border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Use Free Version
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : !hasAIPremium ? (
            <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <span className="text-3xl">💡</span>
                <div>
                  <h3 className="text-lg font-bold mb-2">
                    Your Site Looks Good!
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Want to take it further? AI Premium can make it exceptional.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Ask clarifying questions for precision</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Suggest improvements you hadn't thought of</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Generate more sophisticated features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Give you better source code</span>
                    </li>
                  </ul>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setSelectedTier('ai_premium');
                        setShowCheckout(true);
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Add AI Enhancement - $5
                    </button>
                    
                    <button
                      onClick={onSkip}
                      className="flex-1 border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Preview As-Is
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          
          {/* Stripe Checkout (if upgrading) */}
          {showCheckout && selectedTier && (
            <StripeCheckout
              sessionId={sessionId}
              tier={selectedTier}
              onSuccess={onPaymentComplete}
              onCancel={() => setShowCheckout(false)}
            />
          )}
          
          {/* Skip to preview */}
          {!showCheckout && (
            <div className="text-center">
              <button
                onClick={onSkip}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                Skip and preview now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### **Rollover Pricing Calculator:**

```typescript
// lib/payments/calculateRollover.ts

interface PurchaseHistory {
  tiers: Array<{
    tier: string;
    amountPaid: number;
  }>;
}

interface PricingResult {
  originalPrice: number;
  rolloverCredit: number;
  skipDiscount: number;
  finalPrice: number;
  totalSpentSoFar: number;
}

const TIER_PRICES = {
  ai_premium: 5,
  textbook: 19,
  basic: 300,
  mid: 1000,
  pro: 3000
};

export function calculateRolloverPrice(
  targetTier: string,
  purchaseHistory: PurchaseHistory
): PricingResult {
  const originalPrice = TIER_PRICES[targetTier as keyof typeof TIER_PRICES];
  
  // Calculate total spent so far
  const totalSpentSoFar = purchaseHistory.tiers.reduce(
    (sum, purchase) => sum + purchase.amountPaid,
    0
  );
  
  // Determine if skip discount applies
  const lastTier = purchaseHistory.tiers[purchaseHistory.tiers.length - 1]?.tier;
  const isSkipping = lastTier && !isConsecutiveTier(lastTier, targetTier);
  
  // Calculate skip discount (10% of target tier)
  const skipDiscount = isSkipping ? originalPrice * 0.1 : 0;
  
  // Calculate rollover credit (what they've paid already)
  const rolloverCredit = totalSpentSoFar;
  
  // Final price = (Original - Skip Discount) - Rollover Credit
  const priceAfterDiscount = originalPrice - skipDiscount;
  const finalPrice = Math.max(0, priceAfterDiscount - rolloverCredit);
  
  return {
    originalPrice,
    rolloverCredit,
    skipDiscount,
    finalPrice,
    totalSpentSoFar: totalSpentSoFar + finalPrice
  };
}

function isConsecutiveTier(fromTier: string, toTier: string): boolean {
  const order = ['ai_premium', 'textbook', 'basic', 'mid', 'pro'];
  const fromIndex = order.indexOf(fromTier);
  const toIndex = order.indexOf(toTier);
  return toIndex === fromIndex + 1;
}
```

---

## 🤖 AI Integration

### **Claude API Integration:**

```typescript
// lib/ai/claude.ts

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function generateComponent(
  userDescription: string,
  componentType: string,
  existingSimilar: any[] = []
): Promise<string> {
  const prompt = `
You are an expert React/Next.js developer building a website component.

User Request: ${userDescription}
Component Type: ${componentType}

${existingSimilar.length > 0 ? `
Here are similar components we've built successfully:
${existingSimilar.map(c => c.component_code).join('\n\n')}

Create a new version inspired by these but customized for the user's needs.
` : ''}

Generate a professional React component (TypeScript) that:
1. Uses Tailwind CSS for styling
2. Is fully responsive (mobile-first)
3. Includes proper TypeScript types
4. Has accessibility features (ARIA labels, semantic HTML)
5. Includes hover/focus states
6. Is production-ready

Return ONLY the component code, no explanations.
  `;
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });
  
  return response.content[0].text;
}

export async function generateClarifyingQuestions(
  userDescription: string,
  componentType: string
): Promise<Array<{ question: string; options: string[] }>> {
  const prompt = `
The user wants to create a ${componentType} component and said:
"${userDescription}"

Generate 2-3 clarifying questions to make this component more specific and useful.

Return JSON format:
{
  "questions": [
    {
      "question": "...",
      "options": ["...", "..."],
      "why_asking": "..."
    }
  ]
}
  `;
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const result = JSON.parse(response.content[0].text);
  return result.questions;
}
```

### **AI Enhancement API Route:**

```typescript
// app/api/ai/enhance/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateComponent } from '@/lib/ai/claude';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, componentDescription, componentType } = await req.json();
    
    const supabase = createClient();
    
    // Get session
    const { data: session } = await supabase
      .from('demo_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    // Check AI credits
    if (session.ai_credits_used >= session.ai_credits_total) {
      return NextResponse.json(
        { error: 'No AI credits remaining' },
        { status: 403 }
      );
    }
    
    // Search for similar approved components
    const { data: similarComponents } = await supabase
      .from('component_versions')
      .select('component_code')
      .eq('status', 'approved')
      .textSearch('change_description', componentDescription)
      .limit(3);
    
    // Generate component with AI
    const componentCode = await generateComponent(
      componentDescription,
      componentType,
      similarComponents || []
    );
    
    // Update AI credits used
    await supabase
      .from('demo_sessions')
      .update({
        ai_credits_used: session.ai_credits_used + 1,
        ai_interactions: [
          ...(session.ai_interactions || []),
          {
            type: 'component_generation',
            description: componentDescription,
            timestamp: new Date().toISOString()
          }
        ]
      })
      .eq('id', sessionId);
    
    return NextResponse.json({
      componentCode,
      creditsRemaining: session.ai_credits_total - session.ai_credits_used - 1
    });
    
  } catch (error) {
    console.error('AI enhancement error:', error);
    return NextResponse.json(
      { error: 'AI enhancement failed' },
      { status: 500 }
    );
  }
}
```

---

## 📦 Code Assembly & Delivery

### **Template Assembly Function:**

```typescript
// lib/generators/assembleTemplate.ts

import { simpleGit } from 'simple-git';
import * as fs from 'fs/promises';
import * as path from 'path';
import archiver from 'archiver';

interface TemplateData {
  components: Record<string, string>; // Component name → TSX code
  pageStructure: { home: string[] }; // Which components on home page
  metadata: any; // Theme, user data, etc.
}

export async function assembleTemplate(
  templateData: TemplateData,
  userData: any,
  referralCode: string
): Promise<Buffer> {
  const tempDir = `/tmp/build-${Date.now()}`;
  
  try {
    // 1. Clone boilerplate from GitHub
    await cloneBoilerplate(tempDir);
    
    // 2. Inject user's components
    for (const [name, code] of Object.entries(templateData.components)) {
      const componentPath = path.join(tempDir, 'components', `${name}.tsx`);
      await fs.writeFile(componentPath, code);
    }
    
    // 3. Generate app/page.tsx using page structure
    const pageCode = generatePageFromStructure(
      templateData.pageStructure,
      templateData.metadata
    );
    await fs.writeFile(path.join(tempDir, 'app', 'page.tsx'), pageCode);
    
    // 4. Inject user data into lib/siteData.ts
    const siteDataCode = generateSiteData(userData, templateData.metadata);
    await fs.writeFile(path.join(tempDir, 'lib', 'siteData.ts'), siteDataCode);
    
    // 5. Inject referral code into badge
    await injectReferralCode(tempDir, referralCode);
    
    // 6. Update package.json with site name
    await updatePackageJson(tempDir, userData.businessName);
    
    // 7. Create ZIP
    const zipBuffer = await createZip(tempDir);
    
    // 8. Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
    
    return zipBuffer;
    
  } catch (error) {
    // Cleanup on error
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

async function cloneBoilerplate(targetDir: string) {
  const git = simpleGit();
  await git.clone(
    'https://github.com/weblaunchacademy/nextjs-boilerplate.git',
    targetDir,
    ['--depth', '1']
  );
  // Remove .git folder
  await fs.rm(path.join(targetDir, '.git'), { recursive: true, force: true });
}

function generatePageFromStructure(
  structure: { home: string[] },
  metadata: any
): string {
  const imports = structure.home
    .map(comp => `import { ${comp} } from '@/components/${comp}';`)
    .join('\n');
  
  const components = structure.home
    .map(comp => `      <${comp} />`)
    .join('\n');
  
  return `
${imports}
import { getSiteConfig } from '@/lib/siteData';

export default function HomePage() {
  const config = getSiteConfig();
  
  return (
    <main>
${components}
    </main>
  );
}
  `.trim();
}

function generateSiteData(userData: any, metadata: any): string {
  return `
export interface SiteConfig {
  businessName: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  referralCode: string;
}

export function getSiteConfig(): SiteConfig {
  return ${JSON.stringify({
    businessName: userData.businessName,
    tagline: userData.tagline,
    email: userData.email,
    phone: userData.phone,
    location: userData.location,
    theme: metadata.theme,
    referralCode: userData.referralCode
  }, null, 2)};
}
  `.trim();
}

async function injectReferralCode(tempDir: string, referralCode: string) {
  const layoutPath = path.join(tempDir, 'app', 'layout.tsx');
  let layoutContent = await fs.readFile(layoutPath, 'utf-8');
  
  // Replace placeholder with actual referral code
  layoutContent = layoutContent.replace(
    /referralCode={['"].*?['"]}/,
    `referralCode="${referralCode}"`
  );
  
  await fs.writeFile(layoutPath, layoutContent);
}

async function updatePackageJson(tempDir: string, businessName: string) {
  const pkgPath = path.join(tempDir, 'package.json');
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
  
  pkg.name = businessName.toLowerCase().replace(/\s+/g, '-');
  pkg.description = `Website for ${businessName}`;
  
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
}

async function createZip(sourceDir: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);
    
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}
```

### **Download API Route:**

```typescript
// app/api/download/[sessionId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { assembleTemplate } from '@/lib/generators/assembleTemplate';
import { generateReferralCode } from '@/lib/referrals/generateCode';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = createClient();
    
    // Get session and verify purchase
    const { data: session } = await supabase
      .from('demo_sessions')
      .select('*, generated_template:template_submissions(*)')
      .eq('id', params.sessionId)
      .single();
    
    if (!session || !session.purchased_tier) {
      return NextResponse.json(
        { error: 'Purchase required to download code' },
        { status: 403 }
      );
    }
    
    // Generate or get referral code
    let referralCode = session.generated_template.referral_code;
    if (!referralCode) {
      referralCode = await generateReferralCode(session.user_email);
    }
    
    // Assemble template
    const zipBuffer = await assembleTemplate(
      {
        components: session.generated_template.components,
        pageStructure: session.generated_template.page_structure,
        metadata: session.generated_template.metadata
      },
      {
        businessName: session.business_name,
        email: session.user_email,
        ...session.form_data
      },
      referralCode
    );
    
    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${session.business_name.replace(/\s+/g, '-')}-website.zip"`
      }
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download' },
      { status: 500 }
    );
  }
}
```

---

## 🏷️ Web Launch Academy Badge

### **Badge Component (Goes in Boilerplate Repo):**

```tsx
// components/WebLaunchBadge.tsx

'use client';

import { useEffect, useState } from 'react';

interface BadgeProps {
  referralCode: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  theme?: 'light' | 'dark';
}

export function WebLaunchBadge({ 
  referralCode, 
  position = 'bottom-right',
  theme = 'light' 
}: BadgeProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = async () => {
    // Track referral click
    await fetch('https://weblaunchacademy.com/api/referrals/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        referralCode,
        timestamp: Date.now(),
        source: window.location.hostname
      })
    });
    
    // Open in new tab
    window.open(`https://weblaunchacademy.com?ref=${referralCode}`, '_blank');
  };
  
  if (!isVisible) return null;
  
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };
  
  const themeClasses = {
    light: 'bg-white text-gray-800 border-gray-200 shadow-lg',
    dark: 'bg-gray-900 text-white border-gray-700 shadow-xl'
  };
  
  return (
    <div 
      className={`
        fixed ${positionClasses[position]} z-[9999]
        flex items-center gap-2 px-4 py-2 rounded-full
        border-2 ${themeClasses[theme]}
        hover:shadow-2xl transition-all duration-300
        cursor-pointer
        ${isHovered ? 'scale-105' : 'scale-100'}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <svg 
        className="w-5 h-5" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      
      {/* Text */}
      <div className="text-xs font-medium">
        <div className="flex items-center gap-1">
          <span className={isHovered ? 'text-blue-600 font-bold' : ''}>
            Built with Web Launch Academy
          </span>
        </div>
      </div>
      
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
          // Save preference to localStorage
          localStorage.setItem('wla-badge-hidden', 'true');
        }}
        className={`
          ml-1 p-1 rounded-full transition-colors
          ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}
        `}
        aria-label="Hide badge"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  );
}
```

### **Referral Tracking API:**

```typescript
// app/api/referrals/track/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { referralCode, timestamp, source } = await req.json();
    
    const supabase = createClient();
    
    // Log the click
    await supabase
      .from('referral_clicks')
      .insert({
        referral_code: referralCode,
        clicked_at: new Date(timestamp),
        source_domain: source,
        user_ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      });
    
    // Increment total clicks
    await supabase.rpc('increment_referral_clicks', {
      code: referralCode
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Referral tracking error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// Create this SQL function in Supabase:
/*
CREATE OR REPLACE FUNCTION increment_referral_clicks(code text)
RETURNS void AS $$
BEGIN
  UPDATE referrals
  SET total_clicks = total_clicks + 1
  WHERE referral_code = code;
END;
$$ LANGUAGE plpgsql;
*/
```

---

## 🎯 Admin Dashboard

### **Admin Review Queue:**

```tsx
// app/admin/submissions/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SubmissionCard } from '@/components/admin/SubmissionCard';

export default async function AdminSubmissionsPage() {
  const supabase = createClient();
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== 'hello@weblaunchacademy.com') {
    redirect('/');
  }
  
  // Fetch pending submissions
  const { data: submissions } = await supabase
    .from('template_submissions')
    .select('*, submitter:submitted_by_email')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  const { data: pendingComponents } = await supabase
    .from('component_versions')
    .select('*, component:components(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Pending Submissions</h1>
        
        {/* Templates */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Category Templates ({submissions?.length || 0})
          </h2>
          
          <div className="grid gap-6">
            {submissions?.map(submission => (
              <SubmissionCard 
                key={submission.id}
                submission={submission}
                type="template"
              />
            ))}
          </div>
        </section>
        
        {/* Components */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Components ({pendingComponents?.length || 0})
          </h2>
          
          <div className="grid gap-6">
            {pendingComponents?.map(component => (
              <SubmissionCard 
                key={component.id}
                submission={component}
                type="component"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

## ✅ Implementation Checklist

### **Phase 1 Must-Haves:**

- [ ] Landing page with Free vs AI Premium choice
- [ ] Multi-step form (4 steps) with section builder
- [ ] Component library with preview system
- [ ] Section purpose selector
- [ ] Payment gate before preview
- [ ] AI Premium payment ($5 via Stripe)
- [ ] Preview generation (static HTML)
- [ ] Preview modal display
- [ ] Upsell CTA after preview
- [ ] Rollover pricing calculator
- [ ] Database schema fully implemented
- [ ] Auto-save (localStorage + Supabase)
- [ ] Contest entry tracking
- [ ] Template assembly system
- [ ] Referral code generation
- [ ] Badge auto-injection
- [ ] Admin review queue
- [ ] Component version control

### **Integration Points for Phase 2:**

- [ ] Stripe webhook handlers
- [ ] AI clarification questions
- [ ] Component improvement flow
- [ ] Leaderboard display
- [ ] Referral dashboard
- [ ] Email notifications
- [ ] Portal redirect after purchase

---

## 🚀 Success Criteria

This implementation is successful when:

1. ✅ Users can choose Free or AI Premium builder
2. ✅ Multi-step form saves progress automatically
3. ✅ Component library displays with previews
4. ✅ Payment gate shows appropriate messaging
5. ✅ AI Premium payment processes correctly
6. ✅ Preview generates and displays properly
7. ✅ Rollover pricing calculates accurately
8. ✅ Code downloads as assembled ZIP
9. ✅ Badge appears on all sites with referral tracking
10. ✅ Contest entries count correctly
11. ✅ Admin can review and approve submissions
12. ✅ Component versions store properly

---

## 💡 Implementation Notes

### **Critical Design Decisions:**

1. **Hybrid Storage:** Boilerplate in Git, components in Supabase = 88% storage savings
2. **Component-Based:** Infinitely scalable, user-driven innovation
3. **Version Control:** Never delete, always improve
4. **Contest System:** Gamification drives AI Premium purchases
5. **Referral Badge:** Automatic marketing, commission tracking
6. **Rollover Pricing:** Simple, transparent, rewards commitment

### **Performance Considerations:**

- Use React.memo for expensive components
- Lazy load preview modal
- Debounce auto-save (2 seconds)
- Cache boilerplate clone (in /tmp)
- Optimize component preview images (WebP format)
- Use Supabase indexes for fast queries

### **Security:**

- RLS policies prevent unauthorized access
- Stripe payment validation server-side
- AI credits checked before API calls
- Admin routes check email address
- Referral clicks validated for abuse

---

## 🎓 Web Launch Academy Best Practices

- Clean, readable code with comments
- TypeScript for type safety
- Tailwind CSS for styling (mobile-first)
- Supabase for data (with RLS)
- Next.js App Router patterns
- Component composition over inheritance
- Error boundaries for graceful failures
- Loading states for all async operations

---

## 🔥 Let's Build This!

Use all the patterns, schemas, and code examples above to create a production-ready implementation. This is the foundation for a revolutionary website builder that will change how Web Launch Academy operates.

**Make it beautiful, functional, and scalable.** 

This is Phase 1 - the beginning of something massive. 🚀
