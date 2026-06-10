import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * GitHub App Webhook Handler
 * Handles installation lifecycle events to keep database in sync
 *
 * Events handled:
 * - installation.deleted: Clean up when app is uninstalled
 * - installation.suspended: Mark installation as suspended
 * - installation.unsuspend: Reactivate installation
 * - installation_repositories.added: Add new repos
 * - installation_repositories.removed: Remove repos
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Verify GitHub webhook signature
 */
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (!secret) {
    console.error('[GitHub Webhook] No webhook secret configured')
    return false
  }

  const hmac = crypto.createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature
    const signature = request.headers.get('x-hub-signature-256')
    if (!signature) {
      console.error('[GitHub Webhook] Missing signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Get raw body for signature verification
    const payload = await request.text()

    // Verify signature
    if (!verifySignature(payload, signature)) {
      console.error('[GitHub Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse payload
    const event = JSON.parse(payload)
    const eventType = request.headers.get('x-github-event')

    console.log('[GitHub Webhook] Received event:', eventType)

    switch (eventType) {
      case 'installation':
        await handleInstallationEvent(event)
        break

      case 'installation_repositories':
        await handleRepositoriesEvent(event)
        break

      default:
        console.log('[GitHub Webhook] Unhandled event type:', eventType)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[GitHub Webhook] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * Handle installation lifecycle events
 */
async function handleInstallationEvent(event: any) {
  const action = event.action
  const installation = event.installation
  const installationId = installation.id

  console.log('[GitHub Webhook] Installation event:', action, installationId)

  switch (action) {
    case 'deleted':
      // App was uninstalled - clean up everything
      console.log('[GitHub Webhook] Cleaning up deleted installation:', installationId)

      // Get repositories to clean up projects
      const { data: repos } = await supabaseAdmin
        .from('github_repositories')
        .select('id, full_name')
        .eq('installation_id', installationId)

      if (repos && repos.length > 0) {
        console.log('[GitHub Webhook] Unlinking projects from deleted repos:', repos.map(r => r.full_name))

        // Unlink projects (don't delete them, just clear the github_repository_id)
        await supabaseAdmin
          .from('client_projects')
          .update({ github_repository_id: null })
          .in('github_repository_id', repos.map(r => r.id))
      }

      // Delete repositories
      await supabaseAdmin
        .from('github_repositories')
        .delete()
        .eq('installation_id', installationId)

      // Delete installation
      await supabaseAdmin
        .from('github_installations')
        .delete()
        .eq('installation_id', installationId)

      console.log('[GitHub Webhook] Deleted installation:', installationId)
      break

    case 'suspend':
      // Installation was suspended
      await supabaseAdmin
        .from('github_installations')
        .update({ suspended_at: new Date().toISOString() })
        .eq('installation_id', installationId)

      console.log('[GitHub Webhook] Suspended installation:', installationId)
      break

    case 'unsuspend':
      // Installation was reactivated
      await supabaseAdmin
        .from('github_installations')
        .update({ suspended_at: null })
        .eq('installation_id', installationId)

      console.log('[GitHub Webhook] Unsuspended installation:', installationId)
      break

    case 'created':
      // New installation - this is usually handled by callback, but we can sync here too
      console.log('[GitHub Webhook] New installation created:', installationId)
      // We don't store it here because the callback handles it with full repo list
      break

    default:
      console.log('[GitHub Webhook] Unhandled installation action:', action)
  }
}

/**
 * Handle repository add/remove events
 */
async function handleRepositoriesEvent(event: any) {
  const action = event.action
  const installation = event.installation
  const installationId = installation.id

  console.log('[GitHub Webhook] Repository event:', action, installationId)

  if (action === 'added') {
    // Repositories were added to installation
    const addedRepos = event.repositories_added || []

    for (const repo of addedRepos) {
      console.log('[GitHub Webhook] Adding repository:', repo.full_name)

      await supabaseAdmin
        .from('github_repositories')
        .upsert({
          installation_id: installationId,
          repository_id: repo.id,
          repository_name: repo.name,
          full_name: repo.full_name,
          owner: repo.full_name.split('/')[0],
          private: repo.private,
          default_branch: 'main', // Default, will be updated on first fetch
          html_url: `https://github.com/${repo.full_name}`,
          language: null,
          updated_at: new Date().toISOString()
        })
    }

    console.log('[GitHub Webhook] Added repositories:', addedRepos.map((r: any) => r.full_name))
  }

  if (action === 'removed') {
    // Repositories were removed from installation
    const removedRepos = event.repositories_removed || []

    for (const repo of removedRepos) {
      console.log('[GitHub Webhook] Removing repository:', repo.full_name)

      // Get the repo record to find projects
      const { data: repoRecord } = await supabaseAdmin
        .from('github_repositories')
        .select('id')
        .eq('installation_id', installationId)
        .eq('repository_id', repo.id)
        .single()

      if (repoRecord) {
        // Unlink projects (don't delete them)
        await supabaseAdmin
          .from('client_projects')
          .update({ github_repository_id: null })
          .eq('github_repository_id', repoRecord.id)

        // Delete the repository record
        await supabaseAdmin
          .from('github_repositories')
          .delete()
          .eq('id', repoRecord.id)
      }
    }

    console.log('[GitHub Webhook] Removed repositories:', removedRepos.map((r: any) => r.full_name))
  }
}
