import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Security: Only allow access to markdown files in the textbook directory
    const safeFilePath = filePath.replace(/\.\./g, '').replace(/\\/g, '/')
    // Extract the chapter filename from the path (e.g., /textbook/01-accounts-and-installations -> 01-accounts-and-installations)
    const chapterName = safeFilePath.replace('/textbook/', '')
    const markdownFilePath = path.join(process.cwd(), 'src/content/textbook', `${chapterName}.md`)
    
    // Check if file exists
    if (!fs.existsSync(markdownFilePath)) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }

    // Read the markdown file
    const markdown = fs.readFileSync(markdownFilePath, 'utf8')
    
    // Process markdown to HTML
    const processedContent = await remark()
      .use(remarkGfm) // GitHub Flavored Markdown
      .use(remarkHtml, { 
        sanitize: false // We trust our own content
      })
      .process(markdown)

    const htmlContent = processedContent.toString()
    
    // Add custom styling and enhancements
    const enhancedContent = htmlContent
      // Add IDs to headings for navigation
      .replace(/<h2>([^<]+)<\/h2>/g, (match, content) => {
        // Extract section number from heading like "🔐 1.1 Account Setup Strategy and Security"
        const sectionMatch = content.match(/(\d+\.\d+)/)
        if (sectionMatch) {
          const sectionId = sectionMatch[1]
          return `<h2 id="section-${sectionId}">${content}</h2>`
        }
        // Fallback for headings without section numbers
        const id = content.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        return `<h2 id="section-${id}">${content}</h2>`
      })
      // Add IDs to other headings (h1, h3, h4, h5, h6) with text-based IDs
      .replace(/<h([1346])>([^<]+)<\/h[1346]>/g, (match, level, content) => {
        const id = content.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        return `<h${level} id="section-${id}">${content}</h${level}>`
      })
      // Style code blocks
      .replace(/<pre><code>/g, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono"><code>')
      .replace(/<\/code><\/pre>/g, '</code></pre>')
      .replace(/<code>/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">')
      // Style tables
      .replace(/<table>/g, '<div class="overflow-x-auto"><table class="min-w-full border-collapse border border-border">')
      .replace(/<\/table>/g, '</table></div>')
      .replace(/<th>/g, '<th class="border border-border bg-muted p-3 text-left font-semibold">')
      .replace(/<td>/g, '<td class="border border-border p-3">')
      // Style blockquotes
      .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-primary pl-6 py-2 bg-primary/5 rounded-r-lg">')
      // Style lists
      .replace(/<ul>/g, '<ul class="list-disc list-inside space-y-2 ml-4">')
      .replace(/<ol>/g, '<ol class="list-decimal list-inside space-y-2 ml-4">')
      // Add spacing to paragraphs
      .replace(/<p>/g, '<p class="mb-4 leading-relaxed">')
      // Style links
      .replace(/<a href/g, '<a class="text-primary hover:text-primary/80 underline" href')

    return NextResponse.json({
      success: true,
      content: enhancedContent,
      title: extractTitle(markdown),
      wordCount: markdown.split(/\s+/).length
    })

  } catch (error) {
    console.error('Error processing textbook content:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to load chapter content',
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
      },
      { status: 500 }
    )
  }
}

function extractTitle(markdown: string): string {
  const titleMatch = markdown.match(/^#\s+(.+)$/m)
  return titleMatch ? titleMatch[1] : 'Untitled Chapter'
}