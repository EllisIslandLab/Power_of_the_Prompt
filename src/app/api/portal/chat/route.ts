import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { shouldWaiveCost, calculateRevisionCost } from '@/app/portal/utils/trial'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: Request) {
  try {
    const { conversationId, message, clientAccountId } = await request.json()

    const cookieStore = cookies()
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

    // Fetch conversation history
    const { data: history } = await supabase
      .from('revision_chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    // Build messages array for Claude
    const messages: Anthropic.MessageParam[] = (history || []).map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // System prompt for website revision context
    const systemPrompt = `You are a helpful AI assistant managing website revisions for a client.

**Your role:**
- Help the client make changes to their Next.js website
- Make ONE change per turn for clarity
- Explain what you're doing in simple terms
- If a request requires database schema changes, explain that it needs manual implementation

**Guidelines:**
- Keep responses concise and friendly
- Always confirm what you understood before implementing
- If unsure, ask clarifying questions
- Suggest the simplest solution first

**Important:**
- You can edit code, update content, fix bugs, and adjust styling
- You CANNOT modify database schema directly (tables, columns, RLS policies)
- For database work, explain what's needed and flag it for manual implementation

The client's current request is: "${message}"`

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const claudeStream = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages,
            system: systemPrompt,
            stream: true,
          })

          let fullResponse = ''
          let inputTokens = 0
          let outputTokens = 0

          for await (const event of claudeStream) {
            if (event.type === 'message_start') {
              inputTokens = event.message.usage.input_tokens
            } else if (event.type === 'content_block_delta') {
              if (event.delta.type === 'text_delta') {
                const text = event.delta.text
                fullResponse += text
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'content', text })}\n\n`)
                )
              }
            } else if (event.type === 'message_delta') {
              outputTokens = event.usage.output_tokens
            }
          }

          // Save assistant's response
          const { data: savedMessage } = await supabase
            .from('revision_chat_messages')
            .insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: fullResponse,
              tokens_used: inputTokens + outputTokens,
            })
            .select()
            .single()

          // Fetch client account to check trial status
          const { data: clientAccount } = await supabase
            .from('client_accounts')
            .select('*')
            .eq('id', clientAccountId)
            .single()

          // Calculate cost
          const totalTokens = inputTokens + outputTokens
          const cost = calculateRevisionCost(totalTokens)

          // Check if cost should be waived (bug fixes during trial)
          const waiveCost = clientAccount
            ? shouldWaiveCost(clientAccount, message, cost)
            : false

          // Update client account balance only if not waived
          if (!waiveCost && cost > 0) {
            await supabase.rpc('decrement_balance', {
              account_id: clientAccountId,
              amount: cost,
            })
          }

          // Send usage info
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'usage',
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                cost_usd: waiveCost ? 0 : cost,
                waived: waiveCost,
                original_cost: cost,
              })}\n\n`
            )
          )

          // If cost was waived, notify user
          if (waiveCost) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'system',
                  message: '🎉 Bug fix during trial - no charge!',
                })}\n\n`
              )
            )
          }

          // Detect if database work is needed
          const dbKeywords = [
            'database',
            'table',
            'column',
            'schema',
            'migration',
            'rls',
            'policy',
            'row level security',
          ]
          const needsDbWork = dbKeywords.some(keyword =>
            message.toLowerCase().includes(keyword)
          )

          if (needsDbWork) {
            await supabase.from('database_work_requests').insert({
              conversation_id: conversationId,
              client_account_id: clientAccountId,
              description: message,
              status: 'pending',
            })

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'system',
                  message:
                    '🔔 Database work detected. This will be reviewed and implemented manually.',
                })}\n\n`
              )
            )
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                message: 'Failed to get response from Claude',
              })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
