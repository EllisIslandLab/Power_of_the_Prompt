import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Vercel webhook handler
 * Receives deployment events from Vercel Integration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-vercel-signature')

    // Verify webhook signature (if configured)
    if (process.env.VERCEL_WEBHOOK_SECRET) {
      if (!signature) {
        console.error('Missing Vercel webhook signature')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const expectedSignature = crypto
        .createHmac('sha1', process.env.VERCEL_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('Invalid Vercel webhook signature')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    console.log('Vercel webhook received:', event.type, event.payload?.deployment?.id)

    // Handle different event types
    switch (event.type) {
      case 'deployment.created':
        await handleDeploymentCreated(event)
        break

      case 'deployment.succeeded':
        await handleDeploymentSucceeded(event)
        break

      case 'deployment.error':
        await handleDeploymentError(event)
        break

      case 'deployment.canceled':
        await handleDeploymentCanceled(event)
        break

      case 'project.removed':
        await handleProjectRemoved(event)
        break

      case 'project.renamed':
        await handleProjectRenamed(event)
        break

      default:
        console.log('Unhandled Vercel webhook event:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Vercel webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleDeploymentCreated(event: any) {
  const deployment = event.payload.deployment
  const project = event.payload.project

  // Find the conversation/project this deployment belongs to
  const { data: clientProject } = await supabase
    .from('client_projects')
    .select('user_id, id')
    .eq('vercel_project_id', project.id)
    .single()

  if (!clientProject) {
    console.log('No matching client project found for deployment')
    return
  }

  // Create deployment record
  await supabase.from('deployment_history').insert({
    user_id: clientProject.user_id,
    project_id: clientProject.id,
    deployment_id: deployment.id,
    deployment_url: deployment.url,
    deployment_status: 'building',
    branch_name: deployment.meta?.githubCommitRef || 'unknown',
    commit_sha: deployment.meta?.githubCommitSha,
    deployed_by: 'vercel_integration',
  })

  console.log('Deployment created record saved')
}

async function handleDeploymentSucceeded(event: any) {
  const deployment = event.payload.deployment

  // Update deployment status
  const { data, error } = await supabase
    .from('deployment_history')
    .update({
      deployment_status: 'deployed',
      deployed_at: new Date().toISOString(),
    })
    .eq('deployment_id', deployment.id)
    .select('user_id, project_id')
    .single()

  if (error) {
    console.error('Failed to update deployment:', error)
    return
  }

  // Create notification
  if (data) {
    await supabase.from('deployment_notifications').insert({
      user_id: data.user_id,
      notification_type: 'deployment',
      title: 'Deployment Successful',
      message: `Your website has been deployed successfully to ${deployment.url}`,
      action_url: deployment.url,
    })
  }

  console.log('Deployment succeeded notification sent')
}

async function handleDeploymentError(event: any) {
  const deployment = event.payload.deployment

  // Update deployment status
  const { data, error } = await supabase
    .from('deployment_history')
    .update({
      deployment_status: 'failed',
    })
    .eq('deployment_id', deployment.id)
    .select('user_id')
    .single()

  if (error) {
    console.error('Failed to update deployment:', error)
    return
  }

  // Create notification
  if (data) {
    await supabase.from('deployment_notifications').insert({
      user_id: data.user_id,
      notification_type: 'error',
      title: 'Deployment Failed',
      message: 'Your deployment encountered an error. Please check the logs.',
      action_url: `https://vercel.com/${event.payload.team?.slug || 'dashboard'}`,
    })
  }

  console.log('Deployment error notification sent')
}

async function handleDeploymentCanceled(event: any) {
  const deployment = event.payload.deployment

  await supabase
    .from('deployment_history')
    .update({
      deployment_status: 'cancelled',
    })
    .eq('deployment_id', deployment.id)

  console.log('Deployment canceled')
}

async function handleProjectRemoved(event: any) {
  const project = event.payload.project

  // Mark project as removed
  await supabase
    .from('client_projects')
    .update({
      vercel_project_id: null,
      metadata: {
        removed_at: new Date().toISOString(),
        removed_reason: 'project_deleted_on_vercel',
      },
    })
    .eq('vercel_project_id', project.id)

  console.log('Project removed')
}

async function handleProjectRenamed(event: any) {
  const project = event.payload.project

  // Update project name
  await supabase
    .from('client_projects')
    .update({
      vercel_project_name: project.name,
    })
    .eq('vercel_project_id', project.id)

  console.log('Project renamed')
}
