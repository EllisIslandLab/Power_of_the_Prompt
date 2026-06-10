import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Vercel Deployment Webhook Handler
 *
 * Receives deployment events from Vercel and updates preview URLs
 *
 * Events:
 * - deployment.created: New deployment started
 * - deployment.ready: Deployment is live and accessible (PRIMARY EVENT)
 * - deployment.error: Deployment failed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-vercel-signature')

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      console.error('[Vercel Webhook] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const payload = JSON.parse(body)
    const { type, payload: eventPayload } = payload

    console.log('[Vercel Webhook] Received event:', type)
    console.log('[Vercel Webhook] Deployment:', {
      id: eventPayload.deployment?.id,
      url: eventPayload.deployment?.url,
      state: eventPayload.deployment?.state,
      target: eventPayload.deployment?.target,
    })

    // Only process deployment.ready events (when deployment is accessible)
    if (type !== 'deployment.ready') {
      console.log('[Vercel Webhook] Ignoring event type:', type)
      return NextResponse.json({ received: true })
    }

    const deployment = eventPayload.deployment
    const project = eventPayload.project

    if (!deployment || !project) {
      console.error('[Vercel Webhook] Missing deployment or project data')
      return NextResponse.json(
        { error: 'Missing data' },
        { status: 400 }
      )
    }

    // Find the client project by Vercel project ID
    const { data: clientProject, error: findError } = await supabaseAdmin
      .from('client_projects')
      .select('id, project_name, vercel_project_id, user_id')
      .eq('vercel_project_id', project.id)
      .single()

    if (findError || !clientProject) {
      console.log('[Vercel Webhook] No matching project found for:', project.id)
      // Not an error - might be a project we're not tracking
      return NextResponse.json({ received: true })
    }

    console.log('[Vercel Webhook] Found project:', clientProject.project_name)

    // Build the preview URL
    // Vercel URLs are in format: https://{deployment.url}
    const previewUrl = deployment.url.startsWith('http')
      ? deployment.url
      : `https://${deployment.url}`

    // Update the project with the latest preview URL
    const { error: updateError } = await supabaseAdmin
      .from('client_projects')
      .update({
        vercel_preview_url: previewUrl,
        vercel_preview_updated_at: new Date().toISOString(),
      })
      .eq('id', clientProject.id)

    if (updateError) {
      console.error('[Vercel Webhook] Failed to update project:', updateError)
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      )
    }

    console.log('[Vercel Webhook] ✅ Updated preview URL:', previewUrl)

    // Vercel-First Auto-Connection: Sync env vars on first deployment
    // Check if this is the first deployment (no services connected yet)
    const { data: existingServices } = await supabaseAdmin
      .from('client_service_credentials')
      .select('service_name')
      .eq('user_id', clientProject.user_id)
      .neq('service_name', 'vercel') // Exclude Vercel itself
      .neq('service_name', 'github') // Exclude GitHub
      .limit(1)

    if (!existingServices || existingServices.length === 0) {
      console.log('[Vercel Webhook] First deployment detected - syncing env vars...')

      try {
        // Trigger env sync in background (don't block webhook response)
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/integrations/vercel/sync-env`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: project.id,
            user_id: clientProject.user_id,
          })
        }).catch(err => {
          console.error('[Vercel Webhook] Background env sync failed:', err)
        })

        console.log('[Vercel Webhook] ✓ Triggered env sync in background')
      } catch (error) {
        console.error('[Vercel Webhook] Failed to trigger env sync:', error)
        // Don't fail the webhook - env sync is optional
      }
    }

    return NextResponse.json({
      success: true,
      project: clientProject.project_name,
      previewUrl,
    })
  } catch (error: any) {
    console.error('[Vercel Webhook] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Verify Vercel webhook signature
 * https://vercel.com/docs/observability/webhooks-overview/webhooks-api#securing-webhooks
 */
function verifySignature(body: string, signature: string | null): boolean {
  // Skip verification in development if no secret is set
  if (process.env.NODE_ENV === 'development' && !process.env.VERCEL_WEBHOOK_SECRET) {
    console.warn('[Vercel Webhook] ⚠️ Skipping signature verification in development')
    return true
  }

  if (!signature || !process.env.VERCEL_WEBHOOK_SECRET) {
    return false
  }

  try {
    // Vercel sends: sha1=<hash>
    const [algorithm, hash] = signature.split('=')

    if (algorithm !== 'sha1') {
      return false
    }

    // Calculate expected signature
    const hmac = crypto.createHmac('sha1', process.env.VERCEL_WEBHOOK_SECRET)
    hmac.update(body)
    const expectedHash = hmac.digest('hex')

    // Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(expectedHash)
    )
  } catch (error) {
    console.error('[Vercel Webhook] Signature verification error:', error)
    return false
  }
}
