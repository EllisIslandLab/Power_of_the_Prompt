"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import * as Accordion from "@radix-ui/react-accordion"
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Clock,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react"
import { textbookChapters, getChapterByPath, getNextChapter, getPreviousChapter } from "@/content/textbook"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)

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

  const handleSectionClick = useCallback((sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }

    // Close mobile sidebar after click
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [])

  useEffect(() => {
    if (currentChapter) {
      loadChapterContent()
    }
  }, [currentChapter, loadChapterContent])

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wlc-textbook-sidebar-collapsed')
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save sidebar collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('wlc-textbook-sidebar-collapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  // Auto-expand current chapter
  useEffect(() => {
    if (currentChapter && !sidebarCollapsed) {
      setExpandedChapter(currentChapter.id)
    }
  }, [currentChapter, sidebarCollapsed])

  // Simplified reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setReadingProgress(Math.min(progress, 100))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Active section tracking
  useEffect(() => {
    if (!currentChapter) return

    let ticking = false

    const handleScroll = () => {
      const sections = currentChapter.sections
      let active = null

      for (const section of sections) {
        const element = document.getElementById(`section-${section.id}`)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom >= 150) {
            active = section.id
            break
          }
        }
      }

      setActiveSection(active)
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', onScroll)
  }, [currentChapter])

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
    <div className="min-h-screen bg-background">
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
          className={cn(
            "fixed inset-y-0 left-0 z-30 bg-card border-r flex flex-col",
            "transform transition-all duration-300",
            sidebarCollapsed ? "w-20" : "w-80",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="p-6 border-b flex items-center justify-between">
            <Link
              href="/portal/textbook"
              className={cn(
                "flex items-center gap-2 text-lg font-semibold transition-all",
                sidebarCollapsed && "opacity-0 w-0 overflow-hidden"
              )}
            >
              <BookOpen className="h-5 w-5" />
              <span>Student Textbook</span>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <nav className="p-4">
              {sidebarCollapsed ? (
                // Collapsed view: Just chapter numbers with tooltips
                <div className="space-y-2">
                  {textbookChapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/portal/textbook${chapter.filePath}`}
                      className={cn(
                        "flex items-center justify-center w-full h-12 rounded-lg transition-colors",
                        currentChapter.id === chapter.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground"
                      )}
                      title={chapter.title}
                    >
                      <span className="text-sm font-bold">{chapter.id}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                // Expanded view: Accordion with sections
                <Accordion.Root
                  type="single"
                  collapsible
                  value={expandedChapter || undefined}
                  onValueChange={(value) => setExpandedChapter(value || null)}
                  className="space-y-1"
                >
                  {textbookChapters.map((chapter) => (
                    <Accordion.Item
                      key={chapter.id}
                      value={chapter.id}
                      className="border-none"
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm",
                          currentChapter.id === chapter.id && "bg-primary/10"
                        )}
                      >
                        <Link
                          href={`/portal/textbook${chapter.filePath}`}
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                            currentChapter.id === chapter.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                          title={chapter.title}
                        >
                          {chapter.id}
                        </Link>

                        <Accordion.Trigger
                          className={cn(
                            "group flex items-center justify-between gap-2 flex-1 text-left font-medium transition-colors",
                            "hover:text-primary",
                            currentChapter.id === chapter.id
                              ? "text-primary"
                              : "text-foreground"
                          )}
                        >
                          <span className="flex-1">{chapter.title}</span>
                          <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-150 group-data-[state=open]:rotate-90" />
                        </Accordion.Trigger>
                      </div>

                      <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <div className="ml-8 mt-1 space-y-1 pb-2">
                          {chapter.sections.map((section) => (
                            <button
                              key={section.id}
                              onClick={() => handleSectionClick(section.id)}
                              className={cn(
                                "block w-full text-left px-3 py-1 text-xs rounded transition-colors",
                                activeSection === section.id
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )}
                            >
                              {section.title}
                            </button>
                          ))}
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              )}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
          )}
        >
          {/* Header */}
          <header className="sticky top-1 z-20 backdrop-blur border-b p-4 lg:px-8 bg-background/95">
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
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 bg-card rounded-lg shadow-sm">
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
              <article className="prose prose-xl max-w-none prose-slate dark:prose-invert">
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