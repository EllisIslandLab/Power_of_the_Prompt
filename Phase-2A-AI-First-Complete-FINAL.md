# Web Launch Academy - AI-First Preview System
## Complete Implementation (Replaces Free Builder)

---

## 🎯 Strategic Overview

**The New Experience:**
1. User lands on site
2. Answers 3-5 smart questions (< 2 minutes)
3. Gets beautiful AI-generated preview (FREE - 1 generation)
4. Sees what's possible, wants to customize
5. Upgrades to AI Premium ($5 for 30 credits)
6. Deep customization with AI guidance
7. Purchases code/toolkit when ready

**Key Benefits:**
- ✅ Every visitor sees best AI capabilities
- ✅ No bad UX to compare against
- ✅ System learns from every generation
- ✅ Higher conversion via FOMO + time investment
- ✅ Clear value ladder
- ✅ Better component models over time

---

## 📋 Prerequisites

**Database:**
- ✅ All Phase 2A tables exist
- ✅ `demo_projects` ready
- ✅ `ai_interaction_logs` ready
- ✅ `users` with AI credit tracking

**Environment Variables:**
```env
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
STRIPE_PRODUCT_AI_PREMIUM_ID=prod_...
STRIPE_PRICE_AI_PREMIUM_ID=price_...
STRIPE_PRODUCT_TEXTBOOK_ID=prod_...
STRIPE_PRICE_TEXTBOOK_ID=price_...
STRIPE_PRODUCT_ARCHITECTURE_ID=prod_...
STRIPE_PRICE_ARCHITECTURE_ID=price_...
```

---

## 📁 File Structure

```
src/
├── app/
│   ├── get-started/
│   │   ├── page.tsx                           // NEW: Landing with questions
│   │   └── preview/
│   │       └── [projectId]/
│   │           └── page.tsx                   // NEW: Preview + upsell
│   │
│   └── api/
│       ├── ai/
│       │   ├── generate-preview/
│       │   │   └── route.ts                   // NEW: Free preview generation
│       │   ├── conversation/
│       │   │   └── route.ts                   // NEW: Paid customization
│       │   └── refine-component/
│       │       └── route.ts                   // NEW: Component refinement
│       │
│       ├── payments/
│       │   └── create-checkout/
│       │       └── route.ts                   // EXISTING: Keep as-is
│       │
│       └── webhooks/
│           └── stripe/
│               └── route.ts                   // EXISTING: Update
│
├── components/
│   ├── preview/
│   │   ├── PreviewFrame.tsx                   // NEW: Preview display
│   │   ├── CustomizationPanel.tsx             // NEW: AI refinement UI
│   │   └── UpgradePrompt.tsx                  // NEW: $5 upsell
│   │
│   └── questions/
│       ├── SmartQuestionFlow.tsx              // NEW: Efficient Q&A
│       └── QuestionCard.tsx                   // NEW: Individual question
│
└── lib/
    ├── ai/
    │   ├── prompts/
    │   │   ├── previewGeneration.ts           // NEW: Optimized prompts
    │   │   ├── componentRefinement.ts         // NEW: Refinement prompts
    │   │   └── questionGeneration.ts          // NEW: Smart question logic
    │   │
    │   └── tokenOptimization.ts               // NEW: Efficient token usage
    │
    └── analytics/
        └── trackGeneration.ts                 // NEW: Learning system
```

---

## 🎨 PART 1: Landing Page with Smart Questions

```tsx
// src/app/get-started/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SmartQuestionFlow } from '@/components/questions/SmartQuestionFlow';

export default function GetStartedPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  async function handleGeneratePreview() {
    if (!userEmail) {
      alert('Please enter your email to continue');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate free preview
      const response = await fetch('/api/ai/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          answers,
          isFreeGeneration: true
        })
      });

      const { projectId, success, error } = await response.json();

      if (success) {
        // Redirect to preview
        router.push(`/get-started/preview/${projectId}`);
      } else {
        alert(error || 'Failed to generate preview');
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Something went wrong. Please try again.');
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 relative z-10">
            See Your Custom Website
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              In 60 Seconds
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 relative z-10">
            AI-powered website generation. No templates. No generic designs.
            <br />
            <strong>100% custom to your business.</strong>
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative z-10">
            {/* Smart Question Flow */}
            <SmartQuestionFlow
              onAnswersChange={setAnswers}
              onEmailChange={setUserEmail}
            />

            {/* Generate Button */}
            <button
              onClick={handleGeneratePreview}
              disabled={isGenerating || !userEmail || Object.keys(answers).length < 3}
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl relative z-10"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Your Website...
                </span>
              ) : (
                'Generate My Preview - FREE'
              )}
            </button>

            <p className="text-sm text-gray-500 mt-4 relative z-10">
              ✓ No credit card required
              <br />
              ✓ See your site in under 60 seconds
              <br />
              ✓ Customize with AI for just $5
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-3 gap-6 relative z-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">60s</div>
              <div className="text-sm text-gray-600">Average Generation Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">AI-Powered</div>
              <div className="text-sm text-gray-600">Claude Sonnet 4</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">Own Forever</div>
              <div className="text-sm text-gray-600">Your Code, Your Site</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📝 PART 2: Smart Question Flow

```tsx
// src/components/questions/SmartQuestionFlow.tsx

'use client';

import { useState, useEffect } from 'react';
import { QuestionCard } from './QuestionCard';

interface SmartQuestionFlowProps {
  onAnswersChange: (answers: Record<string, string>) => void;
  onEmailChange: (email: string) => void;
}

export function SmartQuestionFlow({ 
  onAnswersChange, 
  onEmailChange 
}: SmartQuestionFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');

  // Core questions optimized for token efficiency
  const questions = [
    {
      id: 'business_type',
      question: 'What type of business are you building a website for?',
      placeholder: 'e.g., Financial coaching, Dog grooming, Local restaurant',
      examples: ['Financial coaching', 'Personal training', 'Web design agency'],
      helpText: 'Be specific - this helps us generate better content'
    },
    {
      id: 'target_audience',
      question: 'Who is your ideal customer or client?',
      placeholder: 'e.g., Busy professionals, New parents, Small business owners',
      examples: ['Couples in debt', 'First-time homebuyers', 'Busy executives'],
      helpText: 'The more specific, the better we can tailor your site'
    },
    {
      id: 'main_service',
      question: 'What\'s your main service or product?',
      placeholder: 'e.g., 12-week coaching program, Custom meal plans',
      examples: ['Debt elimination coaching', 'Personal training packages', 'Web design services'],
      helpText: 'What do people hire you for?'
    },
    {
      id: 'unique_value',
      question: 'What makes you different from competitors?',
      placeholder: 'e.g., 20 years experience, Results guaranteed, Personal approach',
      examples: ['Results-focused', 'Science-based approach', 'Personalized plans'],
      helpText: 'Why should someone choose you?'
    },
    {
      id: 'email',
      question: 'Enter your email to see your preview',
      placeholder: 'your@email.com',
      type: 'email',
      helpText: 'We\'ll send you a link to access your preview anytime'
    }
  ];

  function handleAnswer(questionId: string, answer: string) {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    onAnswersChange(newAnswers);

    if (questionId === 'email') {
      setEmail(answer);
      onEmailChange(answer);
    }

    // Auto-advance to next question
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  }

  function canAdvance(step: number): boolean {
    const question = questions[step];
    return !!answers[question.id] && answers[question.id].length > 0;
  }

  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          {...question}
          isActive={index === currentStep}
          isCompleted={index < currentStep}
          answer={answers[question.id] || ''}
          onAnswer={(answer) => handleAnswer(question.id, answer)}
          canShow={index <= currentStep}
        />
      ))}

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 pt-4">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index < currentStep ? 'w-8 bg-green-500' :
              index === currentStep ? 'w-12 bg-blue-500' :
              'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 💬 PART 3: Question Card Component

```tsx
// src/components/questions/QuestionCard.tsx

'use client';

import { useState } from 'react';

interface QuestionCardProps {
  id: string;
  question: string;
  placeholder: string;
  examples?: string[];
  helpText?: string;
  type?: 'text' | 'email';
  isActive: boolean;
  isCompleted: boolean;
  canShow: boolean;
  answer: string;
  onAnswer: (answer: string) => void;
}

export function QuestionCard({
  question,
  placeholder,
  examples,
  helpText,
  type = 'text',
  isActive,
  isCompleted,
  canShow,
  answer,
  onAnswer
}: QuestionCardProps) {
  const [showExamples, setShowExamples] = useState(false);

  if (!canShow) return null;

  return (
    <div
      className={`transition-all duration-300 ${
        isActive ? 'scale-100 opacity-100' :
        isCompleted ? 'scale-95 opacity-60' :
        'scale-95 opacity-40'
      }`}
    >
      <div className={`p-6 rounded-xl border-2 ${
        isActive ? 'border-blue-500 bg-blue-50' :
        isCompleted ? 'border-green-500 bg-green-50' :
        'border-gray-200 bg-gray-50'
      }`}>
        {/* Question */}
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          {isCompleted && '✓ '}
          {question}
        </label>

        {/* Help Text */}
        {helpText && (
          <p className="text-sm text-gray-600 mb-3">{helpText}</p>
        )}

        {/* Input */}
        {isActive ? (
          <div>
            <input
              type={type}
              value={answer}
              onChange={(e) => onAnswer(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              autoFocus
            />

            {/* Examples */}
            {examples && examples.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showExamples ? 'Hide' : 'Show'} examples
                </button>

                {showExamples && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {examples.map((example, i) => (
                      <button
                        key={i}
                        onClick={() => onAnswer(example)}
                        className="px-3 py-1 bg-white border border-blue-300 rounded-full text-sm hover:bg-blue-50 transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-700 font-medium">
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🤖 PART 4: Free Preview Generation API

```typescript
// src/app/api/ai/generate-preview/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { generatePreviewPrompt } from '@/lib/ai/prompts/previewGeneration';
import { trackGeneration } from '@/lib/analytics/trackGeneration';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function POST(req: NextRequest) {
  try {
    const { userEmail, answers, isFreeGeneration } = await req.json();
    
    const supabase = createClient();
    
    // Create or get user
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single();
    
    if (!user) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({ email: userEmail })
        .select()
        .single();
      user = newUser;
    }
    
    // Check if user has already used free generation
    if (isFreeGeneration) {
      const { data: existingProjects, count } = await supabase
        .from('demo_projects')
        .select('id', { count: 'exact' })
        .eq('email', userEmail)
        .eq('was_free_generation', true);
      
      if (count && count > 0) {
        return NextResponse.json({
          success: false,
          error: 'You\'ve already used your free preview. Upgrade to AI Premium for $5 to create more!',
          needsUpgrade: true
        }, { status: 403 });
      }
    }
    
    // Generate optimized prompt
    const prompt = generatePreviewPrompt(answers);
    
    // Call Claude API
    console.log('Generating preview with Claude...');
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `You are an expert web designer and copywriter. Generate beautiful, cohesive website designs with compelling content.

CRITICAL: Output ONLY valid JSON in this exact structure:
{
  "components": {
    "header": { "code": "...", "props": {...} },
    "hero": { "code": "...", "props": {...} },
    "services": { "code": "...", "props": {...} },
    "about": { "code": "...", "props": {...} },
    "contact": { "code": "...", "props": {...} },
    "footer": { "code": "...", "props": {...} }
  },
  "theme": {
    "primaryColor": "#...",
    "secondaryColor": "#...",
    "fontHeading": "...",
    "fontBody": "..."
  },
  "metadata": {
    "businessName": "...",
    "headline": "...",
    "description": "..."
  }
}

Make the content compelling, specific to their business, and professionally written.`,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const aiResponse = response.content[0].text;
    
    // Parse JSON response
    let generatedData;
    try {
      // Strip markdown if present
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('AI generated invalid response');
    }
    
    // Create demo project
    const { data: project } = await supabase
      .from('demo_projects')
      .insert({
        email: userEmail,
        user_id: user.id,
        business_name: answers.business_type,
        business_type: answers.business_type,
        target_audience: answers.target_audience,
        main_service: answers.main_service,
        unique_value: answers.unique_value,
        generated_components: generatedData.components,
        theme_settings: generatedData.theme,
        metadata: generatedData.metadata,
        was_free_generation: isFreeGeneration,
        ai_credits_used: 1,
        status: 'preview_generated'
      })
      .select()
      .single();
    
    // Log AI interaction
    await supabase
      .from('ai_interaction_logs')
      .insert({
        user_email: userEmail,
        user_id: user.id,
        interaction_type: 'preview_generation',
        prompt_sent: prompt,
        response_received: aiResponse,
        credits_used: isFreeGeneration ? 0 : 1,
        demo_project_id: project.id
      });
    
    // Track for learning/analytics
    await trackGeneration({
      projectId: project.id,
      answers,
      generatedData,
      wasFree: isFreeGeneration
    });
    
    return NextResponse.json({
      success: true,
      projectId: project.id,
      preview: generatedData
    });
    
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate preview. Please try again.'
    }, { status: 500 });
  }
}
```

---

## 🎨 PART 5: Preview Page with Upsell

```tsx
// src/app/get-started/preview/[projectId]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { PreviewFrame } from '@/components/preview/PreviewFrame';
import { UpgradePrompt } from '@/components/preview/UpgradePrompt';
import { redirect } from 'next/navigation';

export default async function PreviewPage({ 
  params 
}: { 
  params: { projectId: string } 
}) {
  const supabase = createClient();
  
  // Get project
  const { data: project } = await supabase
    .from('demo_projects')
    .select('*')
    .eq('id', params.projectId)
    .single();
  
  if (!project) {
    redirect('/get-started');
  }
  
  // Check if user has AI Premium
  const { data: user } = await supabase
    .from('users')
    .select('available_ai_credits')
    .eq('email', project.email)
    .single();
  
  const hasAIPremium = user && user.available_ai_credits > 0;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Your Website Preview
          </h1>
          <p className="text-xl text-gray-600">
            {project.was_free_generation && !hasAIPremium
              ? 'Love it? Customize every element with AI for just $5'
              : 'Refine and customize with AI'}
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preview */}
          <div className="lg:col-span-2">
            <PreviewFrame 
              project={project}
              hasAIPremium={hasAIPremium}
            />
          </div>
          
          {/* Upgrade/Customization Panel */}
          <div className="lg:col-span-1">
            <UpgradePrompt 
              project={project}
              hasAIPremium={hasAIPremium}
              userEmail={project.email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 💳 PART 6: Upgrade Prompt Component

```tsx
// src/components/preview/UpgradePrompt.tsx

'use client';

import { useState } from 'react';

interface UpgradePromptProps {
  project: any;
  hasAIPremium: boolean;
  userEmail: string;
}

export function UpgradePrompt({ 
  project, 
  hasAIPremium, 
  userEmail 
}: UpgradePromptProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  async function handleUpgrade() {
    setIsUpgrading(true);
    
    const response = await fetch('/api/payments/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: 'ai_premium',
        userEmail,
        userName: userEmail.split('@')[0],
        projectId: project.id,
        returnState: {
          projectId: project.id,
          action: 'customize'
        }
      })
    });
    
    const { url } = await response.json();
    window.location.href = url;
  }
  
  if (hasAIPremium) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">✨</div>
          <h2 className="text-2xl font-bold mb-2">Customize with AI</h2>
          <p className="text-gray-600">
            You have AI Premium! Use your credits to refine any element.
          </p>
        </div>
        
        {/* Show customization options */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">What You Can Do:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Refine any section with AI</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Change colors and fonts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Add or remove sections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Rewrite content</span>
              </li>
            </ul>
          </div>
          
          {/* Download options shown below */}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-xl p-6 border-2 border-blue-400 sticky top-8">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🚀</div>
        <h2 className="text-2xl font-bold mb-2">Love What You See?</h2>
        <p className="text-gray-700">
          Unlock deep customization with AI for just <strong>$5</strong>
        </p>
      </div>
      
      {/* What's Included */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3">With AI Premium ($5):</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span><strong>30 AI-powered refinements</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Refine any section instantly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Change design elements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Rewrite content with AI</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Add/remove sections</span>
          </li>
        </ul>
      </div>
      
      {/* FOMO Trigger */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-6">
        <p className="text-sm text-yellow-900">
          ⏱️ <strong>You've invested 2 minutes.</strong>
          <br />
          Don't let this preview go to waste!
        </p>
      </div>
      
      {/* Upgrade Button */}
      <button
        onClick={handleUpgrade}
        disabled={isUpgrading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg"
      >
        {isUpgrading ? 'Processing...' : 'Upgrade to AI Premium - $5'}
      </button>
      
      <p className="text-xs text-center text-gray-500 mt-3">
        💎 This $5 rolls into any higher package!
      </p>
    </div>
  );
}
```

---

## 📊 PART 7: Analytics Tracking

```typescript
// src/lib/analytics/trackGeneration.ts

import { createClient } from '@/lib/supabase/server';

interface GenerationData {
  projectId: string;
  answers: Record<string, string>;
  generatedData: any;
  wasFree: boolean;
}

export async function trackGeneration(data: GenerationData) {
  const supabase = createClient();
  
  // Store for learning and optimization
  await supabase
    .from('generation_analytics')
    .insert({
      project_id: data.projectId,
      business_type: data.answers.business_type,
      target_audience: data.answers.target_audience,
      main_service: data.answers.main_service,
      unique_value: data.answers.unique_value,
      generated_components: data.generatedData.components,
      theme_generated: data.generatedData.theme,
      was_free_generation: data.wasFree,
      created_at: new Date()
    });
  
  // This data can be used to:
  // 1. Train better question flows
  // 2. Improve component generation
  // 3. Understand conversion patterns
  // 4. Optimize token usage
}
```

---

## ✅ Testing Checklist

### **Free Preview Flow:**
- [ ] User answers 3-5 questions
- [ ] Preview generates in < 60 seconds
- [ ] Components are cohesive
- [ ] Content is specific to their answers
- [ ] Theme looks professional
- [ ] Can only generate 1 free preview per email

### **Upgrade Flow:**
- [ ] Upgrade button works
- [ ] Redirects to Stripe
- [ ] Returns to preview after payment
- [ ] 30 credits added to account
- [ ] Customization panel appears

### **Token Optimization:**
- [ ] Free preview uses ~2000 tokens
- [ ] Questions are efficient
- [ ] No wasted AI calls
- [ ] Responses are parseable JSON

---

## 🚀 Deployment

```bash
# 1. Commit
git add .
git commit -m "feat: AI-first preview system (replaces free builder)"

# 2. Push
git push origin main

# 3. Vercel auto-deploys

# 4. Test in production
```

---

## 💡 Key Advantages of This System

1. **Better First Impression**
   - Everyone sees best AI quality
   - No bad UX to compare against

2. **Higher Conversion**
   - FOMO from seeing preview
   - Time investment (2 mins = sunk cost)
   - Clear value of customization

3. **Learning System**
   - Every generation improves the model
   - Better questions over time
   - Better component library

4. **Token Efficiency**
   - Optimized prompts
   - Single generation for preview
   - Credits only for customization

5. **Natural Upsell**
   - "You can make this even better!"
   - Not "pay to try"
   - Clear value proposition

---

## 🎯 Success Metrics

Phase 2A AI-First is successful when:
1. ✅ Free preview generates in < 60s
2. ✅ Preview looks professional
3. ✅ Content is specific and compelling
4. ✅ Upgrade conversion > 25%
5. ✅ Users complete question flow > 80%
6. ✅ No user sees bad UX
7. ✅ System learns from every generation

---

**This is the right strategy. Let's build it!** 🚀
