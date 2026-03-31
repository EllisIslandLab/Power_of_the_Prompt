import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';
import { generateRefinementPrompt } from '@/lib/ai/prompts/componentRefinement';
import { rateLimiter } from '@/lib/rate-limiter';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting - prevent AI budget drain
    const ip = req.headers.get('x-real-ip') ||
               req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               'anonymous';

    const rateLimit = await rateLimiter.checkLimit(
      '/api/ai/refine-component',
      ip,
      { tier: 'custom', requests: 20, window: '1 h' }
    );

    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.reset - Date.now()) / 1000);
      return NextResponse.json({
        success: false,
        error: 'Too many refinement requests',
        retryAfter
      }, { status: 429 });
    }

    // Authenticate user - don't trust email from request body
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();

    if (!authUser || authError) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const userEmail = authUser.email!;
    const { projectId, componentName, userRequest } = await req.json();

    if (!userEmail || !projectId || !componentName || !userRequest) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userEmail, projectId, componentName, userRequest'
      }, { status: 400 });
    }

    const supabase = getSupabase(true);

    // Get the project
    const { data: project, error: projectError } = await (supabase as any)
      .from('demo_projects')
      .select('*')
      .eq('id', projectId)
      .eq('email', userEmail)
      .single();

    if (projectError || !project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 });
    }

    // Check user has available credits
    const { data: user, error: userError } = await (supabase as any)
      .from('users')
      .select('id, available_ai_credits, total_ai_credits, used_ai_credits')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const availableCredits = user.available_ai_credits ?? 0;

    if (availableCredits < 1) {
      return NextResponse.json({
        success: false,
        error: 'You need at least 1 AI credit to refine components',
        creditsAvailable: availableCredits,
        creditsNeeded: 1,
        needsUpgrade: true
      }, { status: 403 });
    }

    // Per-user rate limiting (20 refinements per hour)
    const userRateLimit = await rateLimiter.checkLimit(
      '/api/ai/refine-component',
      userEmail,
      { tier: 'custom', requests: 20, window: '1 h' }
    );

    if (!userRateLimit.success) {
      const retryAfter = Math.ceil((userRateLimit.reset - Date.now()) / 1000);
      return NextResponse.json({
        success: false,
        error: 'Refinement rate limit exceeded',
        retryAfter
      }, { status: 429 });
    }

    // Get current component
    const components = project.generated_components || {};
    const currentComponent = components[componentName];

    if (!currentComponent) {
      return NextResponse.json({
        success: false,
        error: `Component "${componentName}" not found in project`
      }, { status: 404 });
    }

    // Generate refinement prompt
    const refinementPrompt = generateRefinementPrompt({
      componentName,
      currentContent: currentComponent,
      userRequest,
      businessContext: {
        business_type: project.business_type,
        target_audience: project.target_audience
      }
    });

    // Call Claude Sonnet for refinement (premium model)
    console.log(`Refining ${componentName} with Claude Sonnet...`);
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `You are an expert web designer. Refine website components based on user feedback.

CRITICAL: Output ONLY valid JSON in this exact structure (matching the input component format):
{
  "code": "...",
  "props": {...}
}

Make the refinement professional, cohesive, and conversion-focused.`,
      messages: [{
        role: 'user',
        content: refinementPrompt
      }]
    });

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON response
    let refinedComponent;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        refinedComponent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse refinement response:', aiResponse);
      throw new Error('AI generated invalid response');
    }

    // Update component in project
    const updatedComponents = {
      ...components,
      [componentName]: refinedComponent
    };

    const { error: updateError } = await (supabase as any)
      .from('demo_projects')
      .update({
        generated_components: updatedComponents,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Failed to update project:', updateError);
      throw new Error('Failed to save refined component');
    }

    // Deduct 1 credit (increment used_ai_credits, not decrement available_ai_credits)
    // available_ai_credits is a generated column: (total_ai_credits - used_ai_credits)
    const { error: creditError } = await (supabase as any)
      .from('users')
      .update({
        used_ai_credits: (user.used_ai_credits ?? 0) + 1
      })
      .eq('email', userEmail);

    if (creditError) {
      console.error('Failed to update credits:', creditError);
      // Don't fail the request, we already saved the component
    }

    // Log the refinement
    await (supabase as any)
      .from('ai_interaction_logs')
      .insert({
        user_email: userEmail,
        user_id: user?.id,
        interaction_type: 'component_refinement',
        prompt_sent: refinementPrompt,
        response_received: aiResponse,
        credits_used: 1,
        demo_project_id: projectId,
        metadata: {
          component_name: componentName,
          user_request: userRequest
        }
      });

    return NextResponse.json({
      success: true,
      componentName,
      refinedComponent,
      creditsRemaining: availableCredits - 1
    });

  } catch (error) {
    console.error('Component refinement error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refine component. Please try again.'
    }, { status: 500 });
  }
}
