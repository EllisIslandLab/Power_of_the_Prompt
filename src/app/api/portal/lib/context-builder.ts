// Build enhanced system prompt with project context
import { loadUserSkills, formatSkillsForPrompt } from './skills-loader'

interface ProjectContext {
  repoUrl?: string
  branch?: string
  vercelProject?: string
  websiteUrl?: string
  projectFiles: { [key: string]: string }
  connectedServices?: Record<string, any>
  userContext?: string
  userInstructions?: string
  userId?: string
}

export async function buildSystemPrompt(context: ProjectContext, userMessage: string): Promise<string> {
  let prompt = `You are an AI assistant helping a client make changes to their website.

**Your Role:**
- Help implement website changes clearly and safely
- Make ONE change per conversation turn
- Explain what you're doing in simple, non-technical terms
- Ask clarifying questions if the request is ambiguous

**Guidelines:**
- Keep responses concise and friendly
- Always confirm what you understood before implementing
- Suggest the simplest solution first
- For code changes, explain the impact in plain language
- **COMPLETE YOUR WORK**: Always finish what you start. If a task requires multiple steps, complete all of them
- **STAY FOCUSED**: Don't stop mid-task. If you start making changes, see them through to completion
- **BE THOROUGH**: When creating files or making edits, complete the entire implementation, not just part of it

**Important Limitations:**
- You can edit code, update content, fix bugs, and adjust styling
- You CANNOT modify database schema directly (tables, columns, RLS policies)
- For database work, explain what's needed and flag it for manual implementation

**Available Tools:**

**Reading Tools (use freely):**
- **read_file**: Read any file from the repository to examine its contents
- **list_directory**: List files in a directory to explore the project structure
- **search_files**: Search for files by name or pattern

**Writing Tools (use when implementing changes):**
- **create_branch**: Create a new branch for your changes (always do this FIRST before editing)
- **edit_file**: Propose an edit to an existing file (user will see a diff and approve)
- **create_file**: Propose creating a new file (user will review and approve)
- **create_pull_request**: Create a PR after all changes are approved

**Workflow for Making Changes:**
1. **Understand the task** - Read relevant files to understand current implementation
2. **Create branch** - Use create_branch with a descriptive name
3. **Make ALL changes** - Propose all edits/new files in sequence (don't wait between changes)
4. **Create PR** - After proposing all changes, create the pull request

**IMPORTANT WORKFLOW RULES:**
- Once you create a branch, **immediately** propose all the changes needed (edit_file, create_file)
- **Don't stop** after creating the branch - continue with the edits
- **Don't wait** for user confirmation between steps - the user will approve each diff as it appears
- After proposing all changes, **immediately** create the pull request
- The user sees diffs in real-time and approves each one - you don't need to wait

**Example of correct flow:**
1. create_branch → 2. edit_file → 3. edit_file → 4. create_file → 5. create_pull_request
   (All in one conversation turn, no stopping!)

The user will see a diff preview for every change and must approve before it's committed. Be thorough in your descriptions!
`

  // Add user's custom context if provided
  if (context.userContext) {
    prompt += `\n**About This Client:**\n${context.userContext}\n`
  }

  // Add user's custom instructions if provided
  if (context.userInstructions) {
    prompt += `\n**Client Preferences:**\n${context.userInstructions}\n`
  }

  // Add connected services information
  if (context.connectedServices && Object.keys(context.connectedServices).length > 0) {
    prompt += `\n**Connected Services:**\n`
    prompt += `The following third-party services are connected and ready to use:\n\n`

    for (const [serviceName, serviceInfo] of Object.entries(context.connectedServices)) {
      prompt += `**${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}:**\n`
      prompt += `- Status: ✅ Connected\n`
      prompt += `- Environment variables to use:\n`
      for (const [key, envVar] of Object.entries(serviceInfo.envVars)) {
        prompt += `  - ${key}: \`process.env.${envVar}\`\n`
      }
      prompt += `\n`
    }

    prompt += `**CRITICAL: When generating code that uses these services:**\n`
    prompt += `- ALWAYS use the environment variable names shown above (e.g., process.env.AIRTABLE_API_KEY)\n`
    prompt += `- NEVER hardcode actual API keys or secrets in the code\n`
    prompt += `- The actual credential values are already configured and will be injected at runtime\n`
    prompt += `- For example: const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })\n\n`
  }

  // Add project information
  if (context.repoUrl || context.websiteUrl) {
    prompt += `\n**Project Information:**\n`
    if (context.websiteUrl) {
      prompt += `- Live Site: ${context.websiteUrl}\n`
    }
    if (context.repoUrl) {
      prompt += `- Repository: ${context.repoUrl}\n`
      prompt += `- Branch: ${context.branch || 'main'}\n`
    }
    if (context.vercelProject) {
      prompt += `- Vercel Project: ${context.vercelProject}\n`
    }
  }

  // Add project files context
  if (Object.keys(context.projectFiles).length > 0) {
    prompt += `\n**Project Files:**\n\n`

    // Add package.json for tech stack info
    if (context.projectFiles['package.json']) {
      try {
        const pkg = JSON.parse(context.projectFiles['package.json'])
        prompt += `**Tech Stack (from package.json):**\n`
        prompt += `- Framework: ${pkg.dependencies?.next ? `Next.js ${pkg.dependencies.next}` : 'Unknown'}\n`
        prompt += `- React: ${pkg.dependencies?.react || 'Unknown'}\n`
        if (pkg.dependencies?.typescript || pkg.devDependencies?.typescript) {
          prompt += `- TypeScript: Yes\n`
        }
        if (pkg.dependencies?.tailwindcss || pkg.devDependencies?.tailwindcss) {
          prompt += `- Styling: Tailwind CSS\n`
        }

        // List all dependencies for context
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies
        }
        const relevantPackages = Object.keys(allDeps).filter(dep =>
          dep.includes('airtable') ||
          dep.includes('supabase') ||
          dep.includes('resend') ||
          dep.includes('stripe') ||
          dep.includes('form') ||
          dep.includes('mail')
        )
        if (relevantPackages.length > 0) {
          prompt += `- Installed packages: ${relevantPackages.join(', ')}\n`
        }
        prompt += `\n`
      } catch (e) {
        // Invalid JSON, skip
      }
    }

    // Add README if available
    if (context.projectFiles['README.md']) {
      const readme = context.projectFiles['README.md']
      const preview = readme.slice(0, 500)
      prompt += `**Project README (preview):**\n\`\`\`\n${preview}${readme.length > 500 ? '...' : ''}\n\`\`\`\n\n`
    }

    // List all loaded files for reference
    const loadedFiles = Object.keys(context.projectFiles)
    prompt += `**Pre-loaded Files (${loadedFiles.length} for quick reference):**\n`
    prompt += loadedFiles.map(f => `- ${f}`).join('\n') + '\n'
    prompt += `\nNote: These are pre-loaded for convenience, but you can read ANY file from the repository using the read_file tool.\n\n`

    // Add source code files if available
    const sourceFiles = loadedFiles.filter(f =>
      f.endsWith('.tsx') ||
      f.endsWith('.ts') ||
      f.endsWith('.jsx') ||
      f.endsWith('.js')
    )

    if (sourceFiles.length > 0) {
      prompt += `**Source Code Context:**\n\n`

      for (const filePath of sourceFiles) {
        const content = context.projectFiles[filePath]
        const preview = content.slice(0, 1000)
        prompt += `\`${filePath}\` (${content.length} chars):\n\`\`\`typescript\n${preview}${content.length > 1000 ? '\n... (truncated)' : ''}\n\`\`\`\n\n`
      }
    }

    // Add config file info
    const configFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts', 'tsconfig.json', 'tailwind.config.js', 'tailwind.config.ts']
    const availableConfigs = configFiles.filter(f => context.projectFiles[f])
    if (availableConfigs.length > 0) {
      prompt += `**Config Files Available:**\n${availableConfigs.map(f => `- ${f}`).join('\n')}\n\n`
    }
  }

  // Load and add user skills if available (filtered by connected services and tech stack)
  try {
    const connectedServices = context.connectedServices ? Object.keys(context.connectedServices) : []

    // Extract tech stack from project files
    const techStack: string[] = []
    if (context.projectFiles['package.json']) {
      try {
        const pkg = JSON.parse(context.projectFiles['package.json'])
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }

        // Add common framework names
        if (allDeps['next']) techStack.push('nextjs', 'react')
        if (allDeps['react']) techStack.push('react')
        if (allDeps['typescript']) techStack.push('typescript')
        if (allDeps['tailwindcss']) techStack.push('tailwind')
        if (allDeps['@supabase/supabase-js']) techStack.push('supabase')
        if (allDeps['stripe']) techStack.push('stripe')
        if (allDeps['resend']) techStack.push('resend')
        if (allDeps['airtable']) techStack.push('airtable')
      } catch (e) {
        // Invalid JSON, skip
      }
    }

    const skills = await loadUserSkills(context.userId, {
      connectedServices,
      techStack,
      userMessage
    })

    if (skills.length > 0) {
      prompt += formatSkillsForPrompt(skills)
      console.log(`[Context Builder] Added ${skills.length} relevant skills to prompt`)
    }
  } catch (error) {
    console.error('[Context Builder] Failed to load skills:', error)
  }

  prompt += `\n**Current Request:**\n${userMessage}\n`

  return prompt
}
