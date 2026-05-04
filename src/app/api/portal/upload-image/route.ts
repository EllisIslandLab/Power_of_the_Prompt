import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const conversationId = formData.get('conversationId') as string

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return Response.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get client account
    const { data: clientAccount } = await supabase
      .from('client_accounts')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!clientAccount) {
      return Response.json({ error: 'Client account not found' }, { status: 404 })
    }

    // Get website config
    const { data: websiteConfig } = await supabase
      .from('client_website_config')
      .select('*')
      .eq('client_account_id', clientAccount.id)
      .single()

    if (!websiteConfig || !websiteConfig.is_configured) {
      return Response.json(
        { error: 'Website not configured. Please configure your website settings first.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storedFilename = `${timestamp}-${sanitizedName}`

    // Get file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine project root (assumes API is in src/app/api)
    const projectRoot = process.cwd()
    const imagesPath = join(projectRoot, websiteConfig.images_folder_path.replace(/^\//, ''))

    // Create directory if it doesn't exist
    await mkdir(imagesPath, { recursive: true })

    // Write file to disk
    const filePath = join(imagesPath, storedFilename)
    await writeFile(filePath, buffer)

    // Add to git and commit
    const relativePath = websiteConfig.images_folder_path.replace(/^\//, '') + '/' + storedFilename
    await execAsync(`git add "${relativePath}"`)
    await execAsync(
      `git commit -m "feat: Add uploaded image ${sanitizedName}\n\nUploaded by: ${session.user.email}\nConversation ID: ${conversationId || 'N/A'}"`
    )

    // Push to remote
    await execAsync(`git push origin ${websiteConfig.github_branch}`)

    // Save to database
    const { data: uploadRecord, error: dbError } = await supabase
      .from('client_uploaded_images')
      .insert({
        client_account_id: clientAccount.id,
        conversation_id: conversationId || null,
        original_filename: file.name,
        stored_filename: storedFilename,
        file_path: relativePath,
        file_size_bytes: file.size,
        mime_type: file.type,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // File is already uploaded, so we don't fail the request
    }

    return Response.json({
      success: true,
      filename: storedFilename,
      path: relativePath,
      url: `${websiteConfig.images_folder_path}/${storedFilename}`,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload image',
      },
      { status: 500 }
    )
  }
}
