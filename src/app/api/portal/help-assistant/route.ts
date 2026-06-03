import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { calculateRevisionCost } from '@/app/portal/utils/trial'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { question, existingFaqs } = await request.json()

    // Get authenticated user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get client account
    const { data: clientAccount } = await supabase
      .from('client_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!clientAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Check if account has balance
    if (clientAccount.account_balance <= 0) {
      return NextResponse.json({
        answer: "Your account balance is $0. Please add funds to continue using the help assistant. Click the Account Balance icon at the bottom of the sidebar to add funds.",
        saveAsFaq: false,
        lowBalance: true
      })
    }

    const faqContext = existingFaqs && existingFaqs.length > 0
      ? '\n\nExisting FAQs:\n' + existingFaqs.map((f: any) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')
      : ''

    const systemPrompt = `You are a helpful assistant for the WebLaunch Portal, a tool that helps users build and manage their websites with AI assistance.

**Your role:** Help users understand how to use the portal in simple, non-technical language.

**Common topics:**
- **Explorer**: Browse GitHub repository files, click to view
- **Search**: Find files across the repository
- **Source Control**: See modified files, review changes
- **Making changes live**: After reviewing changes in Source Control, tell users to ask Claude in the main chat: "commit and push these changes" or "save to GitHub"
- **Connecting services (Stripe, Airtable, etc.)**: Direct users to click the Settings icon (gear) at the bottom of the sidebar, then go to the "Connectors" tab. That's where they manage all service connections. They can also ask Claude in the main chat for help setting up specific services.
- **Settings page**: Click the gear icon at bottom of sidebar to access Settings, which has tabs for General and Connectors
- **Account Balance**: Click the dollar sign icon at bottom of sidebar to add funds or view billing
- **Viewing changes**: Modified files show in Source Control with yellow dots indicating changes
- **File viewing**: Click any file in Explorer or Source Control to see its content in the preview panel
- **Fullscreen toggle**: Click the expand icon to focus on the preview panel
- **Chat with Claude**: Use the chat icon to get AI assistance - Claude can write code, fix bugs, add features, etc. This is where the main AI building happens.

**Important guidelines:**
- Use simple, non-technical terms (e.g., "save changes" instead of "git commit")
- Be concise (2-3 sentences max)
- CRITICAL: Respond with ONLY valid JSON, no markdown formatting, no code blocks, no backticks
- If this seems like a common question others might ask, respond with:
{"answer": "your helpful answer", "saveAsFaq": true, "question": "simplified version of their question", "faqAnswer": "concise FAQ-style answer"}
- Otherwise just respond with:
{"answer": "your helpful answer", "saveAsFaq": false}

${faqContext}

User question: ${question}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: systemPrompt
      }]
    })

    // Calculate cost - Help assistant uses 10x markup (same as main chat)
    const totalTokens = (response.usage.input_tokens || 0) + (response.usage.output_tokens || 0)
    const baseCost = calculateRevisionCost(totalTokens)
    const helpMarkup = 10 // 10x markup
    const costBeforeRounding = baseCost * helpMarkup

    // Round up to nearest cent (minimum $0.01)
    const finalCost = Math.max(0.01, Math.ceil(costBeforeRounding * 100) / 100)

    console.log(`[Help Assistant] Tokens: ${totalTokens}, Base: $${baseCost.toFixed(6)}, Before rounding: $${costBeforeRounding.toFixed(6)}, Final (10x, rounded up): $${finalCost.toFixed(2)}`)

    // Deduct from account balance
    if (finalCost > 0) {
      const adminClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
          },
        }
      )

      const { data: deductResult, error: deductError } = await adminClient.rpc('decrement_balance', {
        account_id: clientAccount.id,
        amount: finalCost,
      })

      if (deductError) {
        console.error('[Help Assistant] Failed to deduct balance:', deductError)
      } else {
        console.log(`[Help Assistant] ✅ Successfully deducted $${finalCost.toFixed(2)} from account (${totalTokens} tokens at 10x markup, rounded up)`)
      }
    }

    const content = response.content[0]
    if (content.type === 'text') {
      try {
        // Strip markdown code block markers if present
        let textToParse = content.text.trim()
        if (textToParse.startsWith('```')) {
          // Remove opening ```json or ``` and closing ```
          textToParse = textToParse.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
        }

        // Try to parse as JSON
        const parsed = JSON.parse(textToParse)
        return NextResponse.json({
          answer: parsed.faqAnswer || parsed.answer,
          saveAsFaq: parsed.saveAsFaq || false,
          question: parsed.question || question
        })
      } catch {
        // If not JSON, treat as plain text answer
        return NextResponse.json({
          answer: content.text,
          saveAsFaq: false
        })
      }
    }

    return NextResponse.json({
      answer: 'I apologize, but I had trouble understanding that. Could you rephrase your question?',
      saveAsFaq: false
    })

  } catch (error: any) {
    console.error('[Help Assistant] Error:', error)
    console.error('[Help Assistant] Error stack:', error.stack)
    return NextResponse.json(
      {
        error: error.message || 'Failed to get help',
        answer: `Sorry, I encountered an error: ${error.message}. Please try again or contact support.`,
        saveAsFaq: false
      },
      { status: 200 } // Return 200 so the UI can show the error message
    )
  }
}
