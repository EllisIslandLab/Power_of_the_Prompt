"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  Menu, 
  X, 
  Clock,
  Eye,
  EyeOff
} from "lucide-react"
import { textbookChapters, getChapterByPath, getNextChapter, getPreviousChapter } from "@/content/textbook"
import { useParams } from "next/navigation"

// This would normally come from a markdown parser like remark/rehype
async function getMarkdownContent(filePath: string): Promise<string> {
  try {
    const response = await fetch(`/api/textbook/content?path=${encodeURIComponent(filePath)}`)
    if (!response.ok) throw new Error('Failed to fetch content')
    const data = await response.json()
    return data.content
  } catch (error) {
    console.error('Error fetching markdown content:', error)
    return '# Content Not Available\n\nSorry, this content is currently unavailable. Please try again later or contact support.'
  }
}

export default function TextbookChapterPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
  const chapterPath = `/${slug}`
  
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [estimatedReadTime, setEstimatedReadTime] = useState(0)
  const [darkMode, setDarkMode] = useState(false)
  const [hoveredChapter, setHoveredChapter] = useState<string | null>(null)
  const [sidebarOffset, setSidebarOffset] = useState(0)

  const currentChapter = getChapterByPath(chapterPath)
  const nextChapter = currentChapter ? getNextChapter(currentChapter.id) : undefined
  const prevChapter = currentChapter ? getPreviousChapter(currentChapter.id) : undefined

  const loadChapterContent = useCallback(async () => {
    if (!currentChapter) return
    
    setLoading(true)
    try {
      // In a real implementation, you'd fetch the markdown file and parse it
      // For now, we'll simulate loading the content
      const mockContent = await getMarkdownContent(currentChapter.filePath)
      setContent(mockContent)
      
      // Estimate reading time (average 200 words per minute)
      const wordCount = mockContent.split(/\s+/).length
      setEstimatedReadTime(Math.ceil(wordCount / 200))
    } catch (error) {
      console.error('Error loading chapter:', error)
      setContent('# Error Loading Content\n\nUnable to load this chapter. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }, [currentChapter])

  useEffect(() => {
    if (currentChapter) {
      loadChapterContent()
    }
  }, [currentChapter, loadChapterContent])


  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const viewportHeight = window.innerHeight
      
      // Calculate reading progress for progress bar
      const progress = scrollTop / docHeight
      setReadingProgress(Math.min(progress * 100, 100))
      
      // Calculate scroll progress (0 to 1)
      const scrollProgress = scrollTop / docHeight
      
      // Define sidebar dimensions
      const sidebarHeight = viewportHeight * 1.6 // Sidebar is 60% taller than viewport
      const maxMovement = sidebarHeight - viewportHeight // How much the sidebar can move
      
      // Calculate offset: start at 0 (normal position), move up as we scroll down
      // This will push the top navigation out of view and bring bottom navigation into view
      // Multiply by 2.0 to make it move faster than the scroll
      const offset = -scrollProgress * maxMovement * 2.0
      
      setSidebarOffset(offset)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!currentChapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Chapter Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The requested chapter could not be found.
            </p>
            <Button asChild>
              <Link href="/portal/textbook">
                Back to Textbook
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div 
          className="h-1 bg-primary transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Sidebar Toggle for Mobile */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-40 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`
            fixed inset-y-0 left-0 z-30 w-80 bg-card border-r 
            transform transition-transform duration-300 flex flex-col
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{
            top: `${sidebarOffset}px`,
            height: '160vh', // Taller than viewport to hold all content
            transition: 'top 0.1s ease-out'
          }}
        >
          <div className="p-6 border-b">
            <Link href="/portal/textbook" className="flex items-center gap-2 text-lg font-semibold">
              <BookOpen className="h-5 w-5" />
              Student Textbook
            </Link>
          </div>
          
          <nav className="p-4 flex-1 overflow-hidden">
            <div className="space-y-2">
              {textbookChapters.map((chapter) => (
                <div 
                  key={chapter.id}
                  onMouseEnter={() => setHoveredChapter(chapter.id)}
                  onMouseLeave={() => setHoveredChapter(null)}
                >
                  <Link
                    href={`/portal/textbook${chapter.filePath}`}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                      ${currentChapter.id === chapter.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${currentChapter.id === chapter.id 
                        ? 'bg-primary-foreground text-primary' 
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {chapter.id}
                    </div>
                    <span className="flex-1">{chapter.title}</span>
                  </Link>
                  
                  <div 
                    className="ml-9 mt-2 space-y-1 overflow-hidden transition-all duration-500 ease-in-out"
                    style={{
                      maxHeight: (currentChapter.id === chapter.id || hoveredChapter === chapter.id) ? '500px' : '0px',
                      opacity: (currentChapter.id === chapter.id || hoveredChapter === chapter.id) ? 1 : 0,
                      paddingTop: (currentChapter.id === chapter.id || hoveredChapter === chapter.id) ? '8px' : '0px',
                      marginTop: (currentChapter.id === chapter.id || hoveredChapter === chapter.id) ? '8px' : '0px'
                    }}
                  >
                    {chapter.sections.map((section, index) => (
                      <a
                        key={section.id}
                        href={`#section-${section.id}`}
                        className="block px-3 py-1 text-xs text-muted-foreground hover:text-foreground rounded transition-all"
                        style={{
                          transitionDelay: (currentChapter.id === chapter.id || hoveredChapter === chapter.id) ? `${index * 100}ms` : '0ms',
                          transitionDuration: '300ms',
                          transform: (currentChapter.id === chapter.id || hoveredChapter === chapter.id) ? 'translateY(0)' : 'translateY(-10px)',
                          opacity: (currentChapter.id === chapter.id || hoveredChapter === chapter.id) ? 1 : 0
                        }}
                      >
                        {section.title}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Header */}
          <header className="sticky top-1 z-20 bg-background/95 backdrop-blur border-b p-4 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href="/portal" className="hover:text-foreground">Portal</Link>
                  <span>/</span>
                  <Link href="/portal/textbook" className="hover:text-foreground">Textbook</Link>
                  <span>/</span>
                  <span className="text-foreground">Chapter {currentChapter.id}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{estimatedReadTime} min read</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
            {/* Chapter Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">Chapter {currentChapter.id}</Badge>
                <Badge variant="outline">{currentChapter.sections.length} sections</Badge>
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                {currentChapter.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{estimatedReadTime} minute read</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{currentChapter.sections.length} sections</span>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                  </div>
                ))}
              </div>
            )}

            {/* Markdown Content */}
            {!loading && (
              <article className="prose prose-lg max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: content }}
                  className="markdown-content"
                />
              </article>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t">
              <div>
                {prevChapter && (
                  <Button variant="outline" asChild>
                    <Link href={`/portal/textbook${prevChapter.filePath}`}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous: {prevChapter.title}
                    </Link>
                  </Button>
                )}
              </div>
              
              <Button asChild>
                <Link href="/portal/textbook">
                  All Chapters
                </Link>
              </Button>
              
              <div>
                {nextChapter && (
                  <Button asChild>
                    <Link href={`/portal/textbook${nextChapter.filePath}`}>
                      Next: {nextChapter.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}