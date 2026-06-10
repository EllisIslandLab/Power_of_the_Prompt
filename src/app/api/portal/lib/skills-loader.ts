import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface SkillMetadata {
  name: string
  description: string
  compatibility?: string[]
}

interface Skill {
  metadata: SkillMetadata
  content: string
  path: string
}

interface SkillFilter {
  connectedServices?: string[]
  techStack?: string[]
  userMessage?: string
}

/**
 * Load skills from the user's .claude/skills directory
 * Skills are stored at /home/ellis/.claude/skills/
 * @param userId - User ID (reserved for future multi-user support)
 * @param filter - Optional filter to load only relevant skills
 */
export async function loadUserSkills(userId?: string, filter?: SkillFilter): Promise<Skill[]> {
  const skillsBasePath = '/home/ellis/.claude/skills'

  try {
    // Check if skills directory exists
    if (!fs.existsSync(skillsBasePath)) {
      console.log('[Skills] Skills directory not found:', skillsBasePath)
      return []
    }

    const skills: Skill[] = []

    // Read all directories in the skills folder
    const entries = fs.readdirSync(skillsBasePath, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const skillPath = path.join(skillsBasePath, entry.name)
      const skillFilePath = path.join(skillPath, 'SKILL.md')

      // Check if SKILL.md exists
      if (!fs.existsSync(skillFilePath)) continue

      try {
        const fileContent = fs.readFileSync(skillFilePath, 'utf-8')
        const parsed = matter(fileContent)

        // Extract metadata from frontmatter
        const metadata: SkillMetadata = {
          name: parsed.data.name || entry.name,
          description: parsed.data.description || '',
          compatibility: parsed.data.compatibility || []
        }

        // Always load core/essential skills
        const alwaysLoad = ['react-web', 'typescript', 'web-content', 'frontend-design']
        const isCore = alwaysLoad.includes(entry.name)

        // Apply filtering if provided
        if (filter && !isCore) {
          let isRelevant = false

          // Check if skill matches connected services
          if (filter.connectedServices && filter.connectedServices.length > 0) {
            const skillName = metadata.name.toLowerCase()
            const skillDesc = metadata.description.toLowerCase()
            for (const service of filter.connectedServices) {
              if (skillName.includes(service.toLowerCase()) || skillDesc.includes(service.toLowerCase())) {
                isRelevant = true
                break
              }
            }
          }

          // Check if skill matches tech stack
          if (!isRelevant && filter.techStack && filter.techStack.length > 0) {
            const skillName = metadata.name.toLowerCase()
            const skillDesc = metadata.description.toLowerCase()
            for (const tech of filter.techStack) {
              if (skillName.includes(tech.toLowerCase()) || skillDesc.includes(tech.toLowerCase())) {
                isRelevant = true
                break
              }
            }
          }

          // Check if skill matches user message keywords
          if (!isRelevant && filter.userMessage) {
            const keywords = filter.userMessage.toLowerCase().split(' ')
            const skillName = metadata.name.toLowerCase()
            const skillDesc = metadata.description.toLowerCase()
            for (const keyword of keywords) {
              if (keyword.length > 4 && (skillName.includes(keyword) || skillDesc.includes(keyword))) {
                isRelevant = true
                break
              }
            }
          }

          if (!isRelevant) continue
        }

        skills.push({
          metadata,
          content: parsed.content,
          path: skillPath
        })
      } catch (error) {
        console.error(`[Skills] Failed to load skill ${entry.name}:`, error)
      }
    }

    console.log(`[Skills] Loaded ${skills.length} skills from ${skillsBasePath}${filter ? ' (filtered)' : ' (all)'}`)
    return skills
  } catch (error) {
    console.error('[Skills] Failed to load skills:', error)
    return []
  }
}

/**
 * Format skills for inclusion in system prompt
 */
export function formatSkillsForPrompt(skills: Skill[]): string {
  if (skills.length === 0) return ''

  let prompt = '\n\n# Available Skills\n\n'
  prompt += 'You have access to the following specialized skills. Use them when the user\'s request matches the skill\'s purpose:\n\n'

  for (const skill of skills) {
    prompt += `## ${skill.metadata.name}\n\n`
    prompt += `**When to use:** ${skill.metadata.description}\n\n`
    prompt += `${skill.content}\n\n`
    prompt += '---\n\n'
  }

  return prompt
}
