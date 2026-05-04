import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const { conversationId, clientAccountId, changeDescription } = await request.json()

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

    // Generate branch name from conversation ID
    const branchName = `revision-${conversationId.slice(0, 8)}-${Date.now()}`

    try {
      // Create and checkout new branch
      await execAsync(`git checkout -b ${branchName}`)

      // Stage all changes
      await execAsync('git add -A')

      // Create commit
      const commitMessage = `Revision: ${changeDescription}\n\nConversation ID: ${conversationId}\nClient Account: ${clientAccountId}`
      await execAsync(`git commit -m "${commitMessage}"`)

      // Push to remote
      await execAsync(`git push -u origin ${branchName}`)

      // Get the GitHub repo info
      const { stdout: remoteUrl } = await execAsync('git config --get remote.origin.url')
      const repoMatch = remoteUrl.match(/github\.com[:/](.+?)\.git/)
      const repoFullName = repoMatch ? repoMatch[1] : null

      if (!repoFullName) {
        throw new Error('Could not determine GitHub repository')
      }

      // Create deployment record
      const { data: deployment, error: deploymentError } = await supabase
        .from('deployment_history')
        .insert({
          conversation_id: conversationId,
          client_account_id: clientAccountId,
          branch_name: branchName,
          commit_message: commitMessage,
          deployment_status: 'pending',
          deployment_type: 'preview',
        })
        .select()
        .single()

      if (deploymentError) throw deploymentError

      // Vercel will automatically create preview deployment for new branch
      // The preview URL follows pattern: https://<project>-<branch>-<team>.vercel.app
      const projectName = process.env.VERCEL_PROJECT_NAME || 'weblaunchcoach'
      const teamSlug = process.env.VERCEL_TEAM_SLUG || 'your-team'
      const sanitizedBranch = branchName.replace(/[^a-z0-9-]/g, '-')
      const previewUrl = `https://${projectName}-${sanitizedBranch}-${teamSlug}.vercel.app`

      // Create notification
      const { data: clientAccount } = await supabase
        .from('client_accounts')
        .select('user_id')
        .eq('id', clientAccountId)
        .single()

      if (clientAccount) {
        await supabase.from('deployment_notifications').insert({
          user_id: clientAccount.user_id,
          notification_type: 'deployment',
          title: 'Preview Deployment Created',
          message: `Your changes are being deployed. Preview will be ready shortly.`,
          related_deployment_id: deployment.id,
        })
      }

      // Switch back to main branch
      await execAsync('git checkout main')

      return Response.json({
        success: true,
        deploymentId: deployment.id,
        branchName,
        previewUrl,
        message: 'Preview deployment initiated',
      })
    } catch (gitError) {
      // Cleanup: try to switch back to main and delete branch
      try {
        await execAsync('git checkout main')
        await execAsync(`git branch -D ${branchName}`)
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError)
      }

      throw gitError
    }
  } catch (error) {
    console.error('Deployment error:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed',
      },
      { status: 500 }
    )
  }
}

// Approve deployment - merge to main
export async function PUT(request: Request) {
  try {
    const { deploymentId, action } = await request.json()

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

    // Fetch deployment
    const { data: deployment } = await supabase
      .from('deployment_history')
      .select('*')
      .eq('id', deploymentId)
      .single()

    if (!deployment) {
      return Response.json({ success: false, error: 'Deployment not found' }, { status: 404 })
    }

    if (action === 'approve') {
      // Merge branch to main
      await execAsync('git checkout main')
      await execAsync('git pull origin main')
      await execAsync(`git merge ${deployment.branch_name}`)
      await execAsync('git push origin main')

      // Delete remote branch
      await execAsync(`git push origin --delete ${deployment.branch_name}`)
      await execAsync(`git branch -D ${deployment.branch_name}`)

      // Update deployment status
      await supabase
        .from('deployment_history')
        .update({
          deployment_status: 'deployed',
          deployed_at: new Date().toISOString(),
        })
        .eq('id', deploymentId)

      // Release held balance if any
      if (deployment.estimated_cost) {
        await supabase.rpc('release_held_balance', {
          account_id: deployment.client_account_id,
          amount: deployment.estimated_cost,
        })
      }

      // Notify user
      const { data: clientAccount } = await supabase
        .from('client_accounts')
        .select('user_id')
        .eq('id', deployment.client_account_id)
        .single()

      if (clientAccount) {
        await supabase.from('deployment_notifications').insert({
          user_id: clientAccount.user_id,
          notification_type: 'success',
          title: 'Changes Deployed!',
          message: 'Your changes are now live on your website.',
          related_deployment_id: deploymentId,
        })
      }

      return Response.json({ success: true, message: 'Changes deployed to production' })
    } else if (action === 'reject') {
      // Delete branch without merging
      await execAsync(`git push origin --delete ${deployment.branch_name}`)
      try {
        await execAsync('git checkout main')
        await execAsync(`git branch -D ${deployment.branch_name}`)
      } catch (e) {
        // Branch might not exist locally
      }

      // Update deployment status
      await supabase
        .from('deployment_history')
        .update({ deployment_status: 'rejected' })
        .eq('id', deploymentId)

      // Refund held balance if any
      if (deployment.estimated_cost) {
        await supabase.rpc('refund_held_balance', {
          account_id: deployment.client_account_id,
          amount: deployment.estimated_cost,
        })
      }

      return Response.json({ success: true, message: 'Changes discarded' })
    }

    return Response.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Deployment approval error:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Operation failed',
      },
      { status: 500 }
    )
  }
}
