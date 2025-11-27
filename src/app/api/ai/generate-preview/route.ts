import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';
import { generatePreviewPrompt } from '@/lib/ai/prompts/previewGeneration';
import { trackGeneration } from '@/lib/analytics/trackGeneration';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { userEmail, answers, isFreeGeneration } = await req.json();

    if (!userEmail || !answers) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const supabase = getSupabase(true); // Use service role for server-side

    // Get or create user
    let { data: user, error: userQueryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle() as any; // Use maybeSingle to avoid error if not found

    console.log('User lookup for generation:', { email: userEmail, user, userQueryError });

    if (!user) {
      // Create user (they should have been created during verification, but just in case)
      console.log('Creating user during generation:', userEmail);
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ email: userEmail })
        .select()
        .single() as any;

      if (insertError) {
        console.error('Error creating user:', insertError);
        // Try to get them again
        const { data: retryUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', userEmail)
          .single() as any;
        user = retryUser;
      } else {
        user = newUser;
      }
    }

    console.log('User state:', {
      email: userEmail,
      claimed: user?.free_tokens_claimed,
      used: user?.free_tokens_used
    });

    // Check if user has free tokens available (claimed but not used)
    if (isFreeGeneration) {
      // User must have claimed tokens (verified email) and not used them yet
      if (!user || !user.free_tokens_claimed) {
        console.log('User has not claimed free tokens:', userEmail);
        return NextResponse.json({
          success: false,
          error: 'Please verify your email first to claim your free AI tokens',
          needsVerification: true
        }, { status: 403 });
      }

      if (user.free_tokens_used) {
        console.log('User has already used free tokens:', userEmail);
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
    // Free tier uses Haiku (efficient tokens), premium uses Sonnet
    const model = isFreeGeneration ? 'claude-3-5-haiku-20241022' : 'claude-sonnet-4-20250514';
    const modelName = isFreeGeneration ? 'Claude Haiku' : 'Claude Sonnet 4.5';
    console.log(`Generating preview with ${modelName}...`);
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 4096, // Increased from 1500 to prevent truncation
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

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';

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
    const insertData = {
      user_email: userEmail,
      user_id: user?.id,
      business_name: generatedData.metadata?.businessName || answers.business_type,
      generated_components: generatedData.components,
      theme_settings: generatedData.theme,
      metadata: generatedData.metadata,
      was_free_generation: isFreeGeneration,
      ai_credits_used: 1,
      status: 'preview_generated',
      // Store answers in metadata for later reference
      // Filter out emailVerified and only include actual question answers
      custom_category: JSON.stringify({
        business_type: String(answers.business_type || ''),
        target_audience: String(answers.target_audience || ''),
        main_service: String(answers.main_service || ''),
        unique_value: String(answers.unique_value || '')
      })
    };

    console.log('Inserting project data:', JSON.stringify(insertData, null, 2));

    const { data: project, error: projectError } = await (supabase as any)
      .from('demo_projects')
      .insert(insertData)
      .select()
      .single() as any;

    if (projectError) {
      console.error('Project creation error:', projectError);
      throw new Error('Failed to save project');
    }

    // Mark free tokens as used (if this was a free generation)
    if (isFreeGeneration) {
      await (supabase as any)
        .from('users')
        .update({
          free_tokens_used: true,
          free_tokens_used_at: new Date().toISOString()
        })
        .eq('email', userEmail);

      console.log(`Free tokens used for ${userEmail}`);
    }

    // Log AI interaction
    await (supabase as any)
      .from('ai_interaction_logs')
      .insert({
        user_email: userEmail,
        user_id: user?.id,
        interaction_type: 'preview_generation',
        prompt_sent: prompt,
        response_received: aiResponse,
        credits_used: isFreeGeneration ? 0 : 1,
        demo_project_id: project.id
      });

    // Track for learning/analytics
    const generationTimeMs = Date.now() - startTime;
    await trackGeneration({
      projectId: project.id,
      answers,
      generatedData,
      wasFree: isFreeGeneration,
      generationTimeMs
    });

    console.log(`Preview generated in ${generationTimeMs}ms`);

    return NextResponse.json({
      success: true,
      projectId: project.id,
      preview: generatedData
    });

  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate preview. Please try again.'
    }, { status: 500 });
  }
}
