import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * AI Conversation Endpoint
 *
 * Handles AI-powered conversations for demo website improvements.
 * Uses Claude to provide intelligent suggestions and answer questions.
 *
 * Features:
 * - Checks user has AI credits available
 * - Consumes 1 credit per question
 * - Logs all interactions to ai_interaction_logs
 * - Updates demo_projects with AI usage stats
 * - Provides context-aware responses based on project data
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId, question, projectContext } = await req.json()

    if (!sessionId || !question) {
      return NextResponse.json(
        { error: 'Session ID and question are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase(true)

    // 1. Get demo project and verify AI credits
    const { data: project, error: projectError } = await supabase
      .from('demo_projects' as any)
      .select('*')
      .eq('id', sessionId)
      .single() as any

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Demo project not found' },
        { status: 404 }
      )
    }

    // Check if user has paid for AI Premium
    if (!(project as any).ai_premium_paid) {
      return NextResponse.json(
        { error: 'AI Premium required. Please upgrade to use AI features.' },
        { status: 403 }
      )
    }

    // Check if credits are available
    const creditsUsed = (project as any).ai_credits_used || 0
    const creditsTotal = (project as any).ai_credits_total || 30
    const creditsRemaining = creditsTotal - creditsUsed

    if (creditsRemaining <= 0) {
      return NextResponse.json(
        { error: 'No AI credits remaining. You have used all 30 credits.' },
        { status: 403 }
      )
    }

    // 2. Build context for AI
    const systemPrompt = `You are an expert website consultant helping a user build their demo website.

Project Details:
- Business Name: ${(project as any).business_name || 'Not specified'}
- Industry: ${projectContext?.industry || 'Not specified'}
- Goals: ${projectContext?.goals || 'Create a professional website'}

Current Project State:
${JSON.stringify(projectContext?.currentState || {}, null, 2)}

Your role:
- Provide specific, actionable advice
- Keep responses concise (2-3 paragraphs max)
- Focus on practical improvements
- Be encouraging and supportive

The user has ${creditsRemaining} AI questions remaining.`

    // 3. Call Claude API
    const startTime = Date.now()
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
    })

    const responseTime = Date.now() - startTime
    const aiResponse = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Unable to generate response'

    // 4. Consume 1 AI credit
    const newCreditsUsed = creditsUsed + 1
    
    const existingQuestions = project.ai_questions_asked || []
    await supabase
      .from('demo_projects' as any)
      .update({
        ai_credits_used: newCreditsUsed,
        ai_questions_asked: [
          ...existingQuestions,
          {
            question,
            timestamp: new Date().toISOString(),
          },
        ],
      } as any)
      .eq('id', sessionId)

    // 5. Log interaction
    await supabase
      .from('ai_interaction_logs' as any)
      .insert({
        demo_project_id: sessionId,
        user_id: (project as any).user_id,
        interaction_type: 'question',
        user_message: question,
        ai_response: aiResponse,
        credits_used: 1,
        response_time_ms: responseTime,
        model_used: 'claude-3-5-sonnet-20241022',
      })

    // 6. Return response
    return NextResponse.json({
      success: true,
      response: aiResponse,
      creditsRemaining: creditsRemaining - 1,
      creditsTotal,
      creditsUsed: newCreditsUsed,
    })

  } catch (error) {
    console.error('Error in AI conversation:', error)

    // Check for Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI service error: ${error.message}` },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}
