import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { shouldWaiveCost, calculateRevisionCost } from '@/app/portal/utils/trial'
import { fetchKeyProjectFiles } from '../lib/github'
import { buildSystemPrompt } from '../lib/context-builder'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Service env var mappings
const SERVICE_ENV_VARS: Record<string, Record<string, string>> = {
  airtable: {
    apiKey: 'AIRTABLE_API_KEY',
    baseId: 'AIRTABLE_BASE_ID',
  },
  resend: {
    apiKey: 'RESEND_API_KEY',
  },
  supabase: {
    url: 'NEXT_PUBLIC_SUPABASE_URL',
    anonKey: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    serviceRoleKey: 'SUPABASE_SERVICE_ROLE_KEY',
  },
  stripe: {
    secretKey: 'STRIPE_SECRET_KEY',
    publishableKey: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    webhookSecret: 'STRIPE_WEBHOOK_SECRET',
  },
  vercel: {
    token: 'VERCEL_TOKEN',
  },
  openai: {
    apiKey: 'OPENAI_API_KEY',
  },
  anthropic: {
    apiKey: 'ANTHROPIC_API_KEY',
  },
}

function buildServiceContext(connectedServices: string[]) {
  const context: Record<string, any> = {}

  for (const serviceName of connectedServices) {
    const envVars = SERVICE_ENV_VARS[serviceName]
    if (envVars) {
      context[serviceName] = {
        connected: true,
        envVars,
      }
    }
  }

  return context
}

export async function POST(request: Request) {
  try {
    const { conversationId, message, clientAccountId, projectId, connectedServices } = await request.json()

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

    // Fetch client account to get user_id and other info
    const { data: clientAccount } = await supabase
      .from('client_accounts')
      .select('*')
      .eq('id', clientAccountId)
      .single()

    if (!clientAccount) {
      throw new Error('Client account not found')
    }

    // Fetch project details
    let project: any = null
    let projectFiles: { [key: string]: string } = {}

    if (projectId) {
      const { data: projectData, error: projectError } = await supabase
        .from('client_projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (projectError) {
        console.error('[Chat] Failed to fetch project:', projectError)
      }

      project = projectData

      // Fetch repository details
      if (project?.github_repository_id) {
        const { data: repo, error: repoError } = await supabase
          .from('github_repositories')
          .select('*')
          .eq('id', project.github_repository_id)
          .single()

        if (repoError) {
          console.error('[Chat] Failed to fetch repository:', repoError)
        }

        if (repo) {
          console.log('[Chat] Fetching files from:', repo.full_name)

          try {
            const { getMultipleFiles } = await import('@/lib/integrations/github')

            const filesToFetch = [
              // Config files
              'package.json',
              'README.md',
              'next.config.js',
              'next.config.mjs',
              'next.config.ts',
              'tsconfig.json',
              'tailwind.config.js',
              'tailwind.config.ts',
              'tailwind.config.mjs',
              '.env.example',
              '.env.local.example',

              // App Router (Next.js 13+)
              'app/page.tsx',
              'app/page.js',
              'app/layout.tsx',
              'app/layout.js',
              'src/app/page.tsx',
              'src/app/page.js',
              'src/app/layout.tsx',
              'src/app/layout.js',

              // Pages Router (Next.js 12 and earlier)
              'pages/index.tsx',
              'pages/index.js',
              'pages/_app.tsx',
              'pages/_app.js',
              'pages/_document.tsx',
              'pages/_document.js',
              'src/pages/index.tsx',
              'src/pages/index.js',
              'src/pages/_app.tsx',
              'src/pages/_app.js',

              // API routes - both routers
              'pages/api/booking.ts',
              'pages/api/booking.js',
              'pages/api/bookings.ts',
              'pages/api/availability.ts',
              'pages/api/booked-dates.ts',
              'src/pages/api/booking.ts',
              'src/pages/api/booking.js',
              'src/pages/api/bookings.ts',
              'src/pages/api/availability.ts',
              'src/pages/api/booked-dates.ts',
              'app/api/booking/route.ts',
              'app/api/booking/route.js',
              'src/app/api/booking/route.ts',
              'src/app/api/booking/route.js',

              // Components - booking related
              'components/Booking.tsx',
              'components/Booking.jsx',
              'components/BookingForm.tsx',
              'components/BookingForm.jsx',
              'components/BookingModal.tsx',
              'components/BookingModal.jsx',
              'components/Contact.tsx',
              'components/ContactForm.tsx',
              'src/components/Booking.tsx',
              'src/components/Booking.jsx',
              'src/components/BookingForm.tsx',
              'src/components/BookingForm.jsx',
              'src/components/BookingModal.tsx',
              'src/components/BookingModal.jsx',
              'src/components/Contact.tsx',
              'src/components/ContactForm.tsx',

              // Lib/utils
              'lib/airtable.ts',
              'lib/airtable.js',
              'lib/timezone.ts',
              'lib/timezone.js',
              'src/lib/airtable.ts',
              'src/lib/airtable.js',
              'src/lib/timezone.ts',
              'src/lib/timezone.js',
              'utils/airtable.ts',
              'utils/airtable.js',
              'src/utils/airtable.ts',
              'src/utils/airtable.js',
            ]

            console.log('[Chat] Attempting to fetch', filesToFetch.length, 'files from', repo.full_name, 'on branch', repo.default_branch)

            const files = await getMultipleFiles(
              project.github_installation_id,
              repo.owner,
              repo.repository_name,
              filesToFetch,
              repo.default_branch
            )

            // Filter out null values and log what was found
            const foundFiles = Object.entries(files).filter(([_, content]) => content !== null)
            const notFoundFiles = Object.entries(files).filter(([_, content]) => content === null).map(([path]) => path)

            projectFiles = Object.fromEntries(foundFiles) as { [key: string]: string }

            console.log('[Chat] Successfully loaded', foundFiles.length, 'files:', Object.keys(projectFiles))
            console.log('[Chat] Not found:', notFoundFiles.length, 'files')

            // Log booking-related files specifically
            const bookingFiles = Object.keys(projectFiles).filter(f =>
              f.toLowerCase().includes('booking') ||
              f.toLowerCase().includes('contact') ||
              f.toLowerCase().includes('airtable')
            )
            if (bookingFiles.length > 0) {
              console.log('[Chat] Found booking-related files:', bookingFiles)
            } else {
              console.log('[Chat] WARNING: No booking-related files found')
            }
          } catch (error) {
            console.error('[Chat] Failed to fetch files from GitHub:', error)
          }
        }
      }
    }

    // Fetch user settings for custom context/instructions
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('claude_context, claude_instructions')
      .eq('user_id', clientAccount.user_id)
      .single()

    // Build service context for connected services
    const serviceContext = buildServiceContext(connectedServices || [])

    // Fetch conversation history
    const { data: history } = await supabase
      .from('revision_chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    // Build messages array for Claude
    const messages: Anthropic.MessageParam[] = []

    // Add conversation history
    for (const msg of history || []) {
      messages.push({
        role: msg.message_type === 'user_message' ? 'user' : 'assistant',
        content: msg.message_text,
      })
    }

    // Fetch repository for URL
    let repoUrl = null
    if (project?.github_repository_id) {
      const { data: repo } = await supabase
        .from('github_repositories')
        .select('html_url')
        .eq('id', project.github_repository_id)
        .single()
      repoUrl = repo?.html_url
    }

    // Build enhanced system prompt with project context
    const systemPrompt = buildSystemPrompt(
      {
        repoUrl,
        branch: project?.github_default_branch || 'main',
        vercelProject: project?.vercel_project_name,
        websiteUrl: project?.vercel_production_url,
        projectFiles,
        connectedServices: serviceContext,
        userContext: userSettings?.claude_context || undefined,
        userInstructions: userSettings?.claude_instructions || undefined,
      },
      message
    )

    // Define tools for Claude to use
    const tools: Anthropic.Tool[] = [
      {
        name: 'read_file',
        description: 'Read the contents of a file from the repository. Use this to examine source code, configuration files, or any other file you need to see.',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The file path relative to the repository root (e.g., "src/components/Booking.tsx")',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'list_directory',
        description: 'List the contents of a directory in the repository. Use this to explore the project structure and find files.',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The directory path relative to the repository root (e.g., "src/components"). Use empty string or "." for root directory.',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'search_files',
        description: 'Search for files by name or pattern in the repository. Returns matching file paths.',
        input_schema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Search pattern (e.g., "*.tsx", "Booking", "api/*/route.ts")',
            },
          },
          required: ['pattern'],
        },
      },
      {
        name: 'create_branch',
        description: 'Create a new git branch for making changes. Always create a branch before editing files. Use descriptive names like "add-airtable-availability" or "fix-booking-form".',
        input_schema: {
          type: 'object',
          properties: {
            branch_name: {
              type: 'string',
              description: 'Name for the new branch (e.g., "add-airtable-availability"). Use lowercase with hyphens.',
            },
            description: {
              type: 'string',
              description: 'Brief description of what changes will be made on this branch.',
            },
          },
          required: ['branch_name', 'description'],
        },
      },
      {
        name: 'edit_file',
        description: 'Propose an edit to a file. The changes will be shown as a diff for user approval before being committed. You must create a branch first.',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The file path to edit',
            },
            old_content: {
              type: 'string',
              description: 'The exact content to replace (must match existing content exactly)',
            },
            new_content: {
              type: 'string',
              description: 'The new content to insert',
            },
            description: {
              type: 'string',
              description: 'Brief description of what this change does',
            },
          },
          required: ['path', 'old_content', 'new_content', 'description'],
        },
      },
      {
        name: 'create_file',
        description: 'Propose creating a new file. The file content will be shown for user approval before being committed. You must create a branch first.',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The path for the new file',
            },
            content: {
              type: 'string',
              description: 'The complete file content',
            },
            description: {
              type: 'string',
              description: 'Brief description of what this file does',
            },
          },
          required: ['path', 'content', 'description'],
        },
      },
      {
        name: 'commit_all_changes',
        description: 'Commit all pending changes to the working branch. Call this BEFORE creating a pull request when the user approves the changes. This will push all pending edits to GitHub.',
        input_schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Optional commit message summary',
            },
          },
          required: [],
        },
      },
      {
        name: 'create_pull_request',
        description: 'Create a pull request with all the changes made on the current branch. Only call this AFTER calling commit_all_changes.',
        input_schema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'PR title summarizing the changes',
            },
            description: {
              type: 'string',
              description: 'Detailed description of what was changed and why',
            },
          },
          required: ['title', 'description'],
        },
      },
    ]

    // Track working branch for this conversation
    let workingBranch: string | null = null

    // Check if conversation already has a working branch
    const { data: conversationData } = await supabase
      .from('revision_conversations')
      .select('metadata')
      .eq('id', conversationId)
      .single()

    if (conversationData?.metadata?.working_branch) {
      workingBranch = conversationData.metadata.working_branch
    }

    // Helper function to execute tools
    async function executeTool(toolName: string, toolInput: any) {
      if (!project?.github_repository_id) {
        return { error: 'No repository connected to this project' }
      }

      const { data: repo } = await supabase
        .from('github_repositories')
        .select('*')
        .eq('id', project.github_repository_id)
        .single()

      if (!repo) {
        return { error: 'Repository not found' }
      }

      try {
        const {
          getFileContents,
          listDirectory,
          createBranch,
          createOrUpdateFile,
          createPullRequest,
        } = await import('@/lib/integrations/github')

        if (toolName === 'read_file') {
          console.log('[Tool] read_file:', toolInput.path)

          try {
            const content = await getFileContents(
              project.github_installation_id,
              repo.owner,
              repo.repository_name,
              toolInput.path,
              repo.default_branch
            )
            console.log('[Tool] read_file success:', toolInput.path, `(${content.length} chars)`)

            // Truncate very large files to reduce token usage and avoid rate limits
            const MAX_FILE_SIZE = 8000
            if (content.length > MAX_FILE_SIZE) {
              const truncated = content.slice(0, MAX_FILE_SIZE)
              return {
                content: truncated,
                path: toolInput.path,
                truncated: true,
                original_size: content.length,
                note: `⚠️ File truncated to ${MAX_FILE_SIZE} chars (original: ${content.length} chars). This shows enough to understand the structure. Focus on the visible portion.`
              }
            }

            return { content, path: toolInput.path }
          } catch (error: any) {
            console.error('[Tool] read_file failed:', toolInput.path, error.message)

            // Check if it's a directory by trying to list it
            try {
              const files = await listDirectory(
                project.github_installation_id,
                repo.owner,
                repo.repository_name,
                toolInput.path,
                repo.default_branch
              )
              return {
                error: `"${toolInput.path}" is a directory, not a file. It contains ${files.length} items. Use list_directory to see its contents.`,
                suggestion: `Use list_directory with path "${toolInput.path}" to see what's inside.`
              }
            } catch {
              return {
                error: `File not found: "${toolInput.path}". Make sure the path is correct and relative to the repository root.`
              }
            }
          }
        } else if (toolName === 'list_directory') {
          const dirPath = toolInput.path || ''
          console.log('[Tool] list_directory:', dirPath || '(root)')

          const files = await listDirectory(
            project.github_installation_id,
            repo.owner,
            repo.repository_name,
            dirPath,
            repo.default_branch
          )
          console.log('[Tool] list_directory success:', dirPath || '(root)', `(${files.length} items)`)
          return {
            path: dirPath || '(root)',
            files: files.map(f => ({ name: f.name, path: f.path, type: f.type }))
          }
        } else if (toolName === 'search_files') {
          const pattern = toolInput.pattern.toLowerCase()
          console.log('[Tool] search_files:', pattern)

          // Simple file search using listDirectory recursively
          const allFiles = await listDirectory(
            project.github_installation_id,
            repo.owner,
            repo.repository_name,
            '',
            repo.default_branch
          )
          const matches = allFiles.filter(f =>
            f.path.toLowerCase().includes(pattern) ||
            f.name.toLowerCase().includes(pattern)
          )
          console.log('[Tool] search_files success:', pattern, `(${matches.length} matches)`)
          return {
            pattern,
            matches: matches.map(f => ({ path: f.path, type: f.type }))
          }
        } else if (toolName === 'create_branch') {
          const branchName = toolInput.branch_name
          console.log('[Tool] create_branch:', branchName)

          // Create branch from default branch
          await createBranch(
            project.github_installation_id,
            repo.owner,
            repo.repository_name,
            branchName,
            repo.default_branch
          )

          // Save branch to conversation metadata
          workingBranch = branchName
          await supabase
            .from('revision_conversations')
            .update({
              metadata: { working_branch: branchName, branch_description: toolInput.description },
            })
            .eq('id', conversationId)

          console.log('[Tool] create_branch success:', branchName)
          return {
            success: true,
            branch: branchName,
            message: `Created branch "${branchName}". All file edits will be made on this branch.`,
          }
        } else if (toolName === 'edit_file') {
          if (!workingBranch) {
            return { error: 'No working branch. Create a branch first using create_branch.' }
          }

          const filePath = toolInput.path
          console.log('[Tool] edit_file:', filePath, 'on branch:', workingBranch)

          // Read current file content to get SHA
          let currentContent = ''
          let fileSha = ''
          try {
            const { getInstallationOctokit } = await import('@/lib/integrations/github')
            const octokit = await getInstallationOctokit(project.github_installation_id)
            const { data: fileData } = await octokit.repos.getContent({
              owner: repo.owner,
              repo: repo.repository_name,
              path: filePath,
              ref: workingBranch,
            })

            if (!Array.isArray(fileData) && fileData.type === 'file') {
              currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8')
              fileSha = fileData.sha
            }
          } catch (error: any) {
            if (error.status !== 404) {
              throw error
            }
            // File doesn't exist, that's ok for new files
          }

          // Verify old_content matches current content
          if (currentContent && !currentContent.includes(toolInput.old_content)) {
            return {
              error: `The old_content doesn't match the current file content. The file may have changed. Read the file again to get the current content.`,
              current_content_preview: currentContent.slice(0, 500),
            }
          }

          // Perform the replacement
          const newFileContent = currentContent.replace(toolInput.old_content, toolInput.new_content)

          // Create diff for preview
          const diff = {
            path: filePath,
            old_content: toolInput.old_content,
            new_content: toolInput.new_content,
            description: toolInput.description,
          }

          // Store pending change for approval
          const { data: pendingChange } = await supabase
            .from('pending_code_changes')
            .insert({
              conversation_id: conversationId,
              user_id: clientAccount.user_id,
              file_path: filePath,
              change_type: 'edit',
              old_content: toolInput.old_content,
              new_content: toolInput.new_content,
              full_file_content: newFileContent,
              description: toolInput.description,
              status: 'pending_approval',
              branch_name: workingBranch,
              file_sha: fileSha,
            })
            .select()
            .single()

          console.log('[Tool] edit_file created pending change:', pendingChange?.id)

          return {
            success: true,
            awaiting_approval: true,
            change_id: pendingChange?.id,
            message: `Edit proposed for "${filePath}". Showing diff for user approval...`,
            diff,
          }
        } else if (toolName === 'create_file') {
          if (!workingBranch) {
            return { error: 'No working branch. Create a branch first using create_branch.' }
          }

          const filePath = toolInput.path
          console.log('[Tool] create_file:', filePath, 'on branch:', workingBranch)

          // Store pending change for approval
          const { data: pendingChange } = await supabase
            .from('pending_code_changes')
            .insert({
              conversation_id: conversationId,
              user_id: clientAccount.user_id,
              file_path: filePath,
              change_type: 'create',
              new_content: toolInput.content,
              full_file_content: toolInput.content,
              description: toolInput.description,
              status: 'pending_approval',
              branch_name: workingBranch,
            })
            .select()
            .single()

          console.log('[Tool] create_file created pending change:', pendingChange?.id)

          return {
            success: true,
            awaiting_approval: true,
            change_id: pendingChange?.id,
            message: `New file proposed: "${filePath}". Showing content for user approval...`,
            preview: toolInput.content.slice(0, 500),
          }
        } else if (toolName === 'commit_all_changes') {
          if (!workingBranch) {
            return { error: 'No working branch. Create a branch and make changes first.' }
          }

          console.log('[Tool] commit_all_changes: Committing pending changes to', workingBranch)

          // Call the commit-all-changes API
          const commitResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/portal/commit-all-changes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId }),
          })

          if (!commitResponse.ok) {
            const error = await commitResponse.json()
            throw new Error(error.error || 'Failed to commit changes')
          }

          const result = await commitResponse.json()

          console.log('[Tool] commit_all_changes success:', result.message)

          return {
            success: result.success,
            committed: result.committed,
            failed: result.failed,
            branch_name: result.branchName,
            message: result.message,
            details: result.results,
          }
        } else if (toolName === 'create_pull_request') {
          if (!workingBranch) {
            return { error: 'No working branch. Create a branch and make changes first.' }
          }

          console.log('[Tool] create_pull_request:', toolInput.title)

          // Create the PR
          const pr = await createPullRequest(
            project.github_installation_id,
            repo.owner,
            repo.repository_name,
            toolInput.title,
            workingBranch,
            repo.default_branch,
            toolInput.description
          )

          console.log('[Tool] create_pull_request success:', pr.html_url)

          // Update conversation metadata
          await supabase
            .from('revision_conversations')
            .update({
              metadata: {
                working_branch: workingBranch,
                pr_number: pr.number,
                pr_url: pr.html_url,
              },
            })
            .eq('id', conversationId)

          return {
            success: true,
            pr_number: pr.number,
            pr_url: pr.html_url,
            message: `Pull request created: ${pr.html_url}`,
          }
        }
      } catch (error: any) {
        console.error('[Tool] Error:', toolName, error.message)
        return { error: error.message || 'Tool execution failed' }
      }

      return { error: 'Unknown tool' }
    }

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let conversationMessages = [...messages]
          let fullResponse = ''
          let totalInputTokens = 0
          let totalOutputTokens = 0
          let continueLoop = true

          // Tool use loop - Claude may request tools multiple times
          while (continueLoop) {
            const claudeStream = await anthropic.messages.create({
              model: 'claude-sonnet-4-6',
              max_tokens: 4096, // Reduced from 8192 to help with rate limits
              messages: conversationMessages,
              system: [
                {
                  type: 'text',
                  text: systemPrompt,
                  cache_control: { type: 'ephemeral' }, // Cache the system prompt
                },
              ],
              tools,
              stream: true,
            })

            let currentInputTokens = 0
            let currentOutputTokens = 0
            let toolUses: Array<{ id: string; name: string; input: any }> = []
            const toolInputAccumulator = new Map<string, string>()
            let textContent = ''
            let currentToolId: string | null = null

            for await (const event of claudeStream) {
              if (event.type === 'message_start') {
                currentInputTokens = event.message.usage.input_tokens
              } else if (event.type === 'content_block_start') {
                if (event.content_block.type === 'tool_use') {
                  const toolId = event.content_block.id
                  currentToolId = toolId
                  toolUses.push({
                    id: toolId,
                    name: event.content_block.name,
                    input: {},
                  })
                  toolInputAccumulator.set(toolId, '')
                  console.log('[Tool] Started:', event.content_block.name, 'ID:', toolId)
                }
              } else if (event.type === 'content_block_delta') {
                if (event.delta.type === 'text_delta') {
                  const text = event.delta.text
                  textContent += text
                  fullResponse += text
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'content', text })}\n\n`)
                  )
                } else if (event.delta.type === 'input_json_delta') {
                  // Accumulate tool input JSON by tool ID
                  if (currentToolId) {
                    const accumulated = toolInputAccumulator.get(currentToolId) || ''
                    toolInputAccumulator.set(currentToolId, accumulated + event.delta.partial_json)
                  }
                }
              } else if (event.type === 'content_block_stop') {
                // Parse complete tool input when block stops
                if (currentToolId && toolInputAccumulator.has(currentToolId)) {
                  const inputJson = toolInputAccumulator.get(currentToolId)!
                  const tool = toolUses.find(t => t.id === currentToolId)
                  if (tool && inputJson) {
                    try {
                      tool.input = JSON.parse(inputJson)
                      console.log('[Tool] Parsed input for', tool.name, ':', JSON.stringify(tool.input))
                    } catch (error) {
                      console.error('[Tool] Failed to parse input JSON:', inputJson, error)
                      tool.input = {}
                    }
                  }
                  currentToolId = null
                }
              } else if (event.type === 'message_delta') {
                currentOutputTokens = event.usage.output_tokens
              }
            }

            totalInputTokens += currentInputTokens
            totalOutputTokens += currentOutputTokens

            // If Claude used tools, execute them and continue
            if (toolUses.length > 0) {
              // Notify user that tools are being executed with specific actions
              const toolSummary = toolUses.map(t => {
                if (t.name === 'read_file') return `📖 Reading ${t.input.path}`
                if (t.name === 'list_directory') return `📁 Listing ${t.input.path || 'root'}`
                if (t.name === 'create_branch') return `🌿 Creating branch "${t.input.branch_name}"`
                if (t.name === 'edit_file') return `✏️ Editing ${t.input.path}`
                if (t.name === 'create_file') return `➕ Creating ${t.input.path}`
                if (t.name === 'create_pull_request') return `🔀 Creating PR`
                return t.name
              }).join(' • ')

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'system',
                    message: toolSummary,
                  })}\n\n`
                )
              )

              // Execute all tools
              const toolResults = await Promise.all(
                toolUses.map(async (tool) => {
                  const result = await executeTool(tool.name, tool.input)

                  // If tool created a branch, notify frontend
                  if (tool.name === 'create_branch' && result.success) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: 'branch_created',
                          branch_name: tool.input.branch_name,
                          description: tool.input.description,
                        })}\n\n`
                      )
                    )
                  }

                  // If tool returned a diff, send it to the frontend
                  if (result.diff) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: 'diff',
                          change_id: result.change_id,
                          file_path: result.diff.path,
                          old_content: result.diff.old_content,
                          new_content: result.diff.new_content,
                          description: result.diff.description,
                        })}\n\n`
                      )
                    )
                  }

                  // If tool created a new file, send preview
                  if (result.preview && tool.name === 'create_file') {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: 'file_preview',
                          change_id: result.change_id,
                          file_path: tool.input.path,
                          content: tool.input.content,
                          description: tool.input.description,
                        })}\n\n`
                      )
                    )
                  }

                  return {
                    type: 'tool_result' as const,
                    tool_use_id: tool.id,
                    content: JSON.stringify(result, null, 2),
                  }
                })
              )

              // Add assistant message with tool uses
              conversationMessages.push({
                role: 'assistant',
                content: [
                  ...(textContent ? [{ type: 'text' as const, text: textContent }] : []),
                  ...toolUses.map(tool => ({
                    type: 'tool_use' as const,
                    id: tool.id,
                    name: tool.name,
                    input: tool.input,
                  })),
                ],
              })

              // Add tool results
              conversationMessages.push({
                role: 'user',
                content: toolResults,
              })

              // Continue loop to get Claude's response with tool results
            } else {
              // No more tools, we're done
              continueLoop = false
            }
          }

          // Save assistant's response
          const { data: savedMessage } = await supabase
            .from('revision_chat_messages')
            .insert({
              conversation_id: conversationId,
              user_id: clientAccount.user_id,
              message_type: 'claude_response',
              message_text: fullResponse,
              tokens_in: totalInputTokens,
              tokens_out: totalOutputTokens,
            })
            .select()
            .single()

          // Calculate cost
          const totalTokens = totalInputTokens + totalOutputTokens
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
                input_tokens: totalInputTokens,
                output_tokens: totalOutputTokens,
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
