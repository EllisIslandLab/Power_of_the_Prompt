"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  FileText,
  Code,
  ExternalLink,
  Search,
  BookOpen,
  Video,
  Github,
  Globe,
  Database,
  Palette,
  Terminal,
  Zap,
  Shield,
  Smartphone,
  ArrowLeft
} from "lucide-react"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Resource {
  id: string
  title: string
  description: string
  category: string
  type: 'TOOL' | 'TEMPLATE' | 'GUIDE' | 'VIDEO' | 'EXTERNAL'
  url: string
  isExternal: boolean
  tags: string[]
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  featured: boolean
  techStack?: string[] // Tech stack this resource is relevant for
}

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [techStackPreferences, setTechStackPreferences] = useState<string[]>([])
  const [showOnlyRelevant, setShowOnlyRelevant] = useState(false)

  useEffect(() => {
    async function loadUserPreferences() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const response = await fetch('/api/user/profile')
          if (response.ok) {
            const data = await response.json()
            setTechStackPreferences(data.user.tech_stack_preferences || [])
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUserPreferences()
  }, [])

  const resources: Resource[] = [
    // Supabase Resources
    {
      id: 'supabase-docs',
      title: 'Supabase Documentation',
      description: 'Complete guide to Supabase - database, authentication, storage, and real-time features',
      category: 'DATABASE',
      type: 'EXTERNAL',
      url: 'https://supabase.com/docs',
      isExternal: true,
      tags: ['Supabase', 'Database', 'Backend', 'Official'],
      difficulty: 'BEGINNER',
      featured: true,
      techStack: ['supabase', 'postgres']
    },
    {
      id: 'supabase-auth',
      title: 'Supabase Authentication Guide',
      description: 'Learn how to implement secure authentication with Supabase Auth',
      category: 'DATABASE',
      type: 'GUIDE',
      url: 'https://supabase.com/docs/guides/auth',
      isExternal: true,
      tags: ['Supabase', 'Authentication', 'Security'],
      difficulty: 'INTERMEDIATE',
      featured: true,
      techStack: ['supabase']
    },
    {
      id: 'supabase-database',
      title: 'Supabase Database',
      description: 'PostgreSQL database management, schemas, and SQL queries',
      category: 'DATABASE',
      type: 'GUIDE',
      url: 'https://supabase.com/docs/guides/database',
      isExternal: true,
      tags: ['Supabase', 'PostgreSQL', 'SQL', 'Database'],
      difficulty: 'INTERMEDIATE',
      featured: false,
      techStack: ['supabase', 'postgres']
    },
    {
      id: 'supabase-storage',
      title: 'Supabase Storage',
      description: 'File storage and management with Supabase Storage',
      category: 'DATABASE',
      type: 'GUIDE',
      url: 'https://supabase.com/docs/guides/storage',
      isExternal: true,
      tags: ['Supabase', 'Storage', 'Files'],
      difficulty: 'BEGINNER',
      featured: false,
      techStack: ['supabase']
    },
    {
      id: 'supabase-realtime',
      title: 'Supabase Realtime',
      description: 'Build real-time features with Supabase Realtime subscriptions',
      category: 'DATABASE',
      type: 'GUIDE',
      url: 'https://supabase.com/docs/guides/realtime',
      isExternal: true,
      tags: ['Supabase', 'Realtime', 'WebSockets'],
      difficulty: 'ADVANCED',
      featured: false,
      techStack: ['supabase']
    },
    // Frontend Resources
    {
      id: 'nextjs-docs',
      title: 'Next.js Documentation',
      description: 'Official Next.js documentation - React framework for production',
      category: 'FRONTEND',
      type: 'EXTERNAL',
      url: 'https://nextjs.org/docs',
      isExternal: true,
      tags: ['Next.js', 'React', 'Documentation', 'Official'],
      difficulty: 'BEGINNER',
      featured: true,
      techStack: ['nextjs', 'react']
    },
    {
      id: 'react-docs',
      title: 'React Documentation',
      description: 'Official React documentation - learn the library that powers modern web apps',
      category: 'FRONTEND',
      type: 'EXTERNAL',
      url: 'https://react.dev',
      isExternal: true,
      tags: ['React', 'JavaScript', 'Documentation'],
      difficulty: 'BEGINNER',
      featured: false,
      techStack: ['react']
    },
    {
      id: 'tailwind-docs',
      title: 'Tailwind CSS Documentation',
      description: 'Utility-first CSS framework for rapid UI development',
      category: 'FRONTEND',
      type: 'EXTERNAL',
      url: 'https://tailwindcss.com/docs',
      isExternal: true,
      tags: ['Tailwind', 'CSS', 'Styling', 'Documentation'],
      difficulty: 'BEGINNER',
      featured: false,
      techStack: ['tailwind']
    },
    // Development Tools
    {
      id: 'typescript-docs',
      title: 'TypeScript Documentation',
      description: 'Official TypeScript handbook and language reference',
      category: 'TOOLS',
      type: 'EXTERNAL',
      url: 'https://www.typescriptlang.org/docs/',
      isExternal: true,
      tags: ['TypeScript', 'JavaScript', 'Types'],
      difficulty: 'INTERMEDIATE',
      featured: false,
      techStack: ['typescript']
    },
    {
      id: 'vercel-docs',
      title: 'Vercel Documentation',
      description: 'Deploy and host your Next.js applications with Vercel',
      category: 'TOOLS',
      type: 'EXTERNAL',
      url: 'https://vercel.com/docs',
      isExternal: true,
      tags: ['Vercel', 'Deployment', 'Hosting'],
      difficulty: 'BEGINNER',
      featured: false,
      techStack: ['vercel', 'nextjs']
    },
    {
      id: 'git-docs',
      title: 'Git Documentation',
      description: 'Version control with Git - essential for all developers',
      category: 'TOOLS',
      type: 'EXTERNAL',
      url: 'https://git-scm.com/doc',
      isExternal: true,
      tags: ['Git', 'Version Control', 'GitHub'],
      difficulty: 'BEGINNER',
      featured: false,
      techStack: ['git']
    }
  ]

  const categories = [
    { id: 'ALL', name: 'All Resources', icon: FileText },
    { id: 'DATABASE', name: 'Database & Backend', icon: Database },
    { id: 'FRONTEND', name: 'Frontend', icon: Code },
    { id: 'TOOLS', name: 'Development Tools', icon: Terminal }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === 'ALL' || resource.category === selectedCategory

    // Filter by tech stack preferences if enabled
    const matchesTechStack = !showOnlyRelevant ||
                            !resource.techStack ||
                            techStackPreferences.length === 0 ||
                            resource.techStack.some(tech => techStackPreferences.includes(tech))

    return matchesSearch && matchesCategory && matchesTechStack
  })

  const featuredResources = resources.filter(resource => resource.featured)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ADVANCED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'TEMPLATE':
        return <Code className="h-5 w-5 text-blue-500" />
      case 'GUIDE':
        return <BookOpen className="h-5 w-5 text-green-500" />
      case 'VIDEO':
        return <Video className="h-5 w-5 text-red-500" />
      case 'TOOL':
        return <Terminal className="h-5 w-5 text-purple-500" />
      case 'EXTERNAL':
        return <ExternalLink className="h-5 w-5 text-orange-500" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Development Resources</h1>
            </div>
            <Button variant="outline" asChild>
              <Link href="/portal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">
            Official documentation and guides for building your website with modern tools
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Icon className="h-4 w-4" />
                      {category.name}
                    </Button>
                  )
                })}
              </div>
            </div>

            {techStackPreferences.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                <input
                  type="checkbox"
                  id="show-relevant"
                  checked={showOnlyRelevant}
                  onChange={(e) => setShowOnlyRelevant(e.target.checked)}
                  className="h-4 w-4 cursor-pointer"
                />
                <label htmlFor="show-relevant" className="text-sm cursor-pointer flex-1">
                  Show only resources relevant to my tech stack ({techStackPreferences.join(', ')})
                </label>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/portal/settings">
                    Edit Preferences
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Featured Resources */}
        {selectedCategory === 'ALL' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Featured Resources</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {featuredResources.map((resource) => (
                <Card key={resource.id} className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getResourceIcon(resource.type)}
                        <div>
                          <h3 className="font-semibold text-lg">{resource.title}</h3>
                          <Badge className={getDifficultyColor(resource.difficulty)}>
                            {resource.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {resource.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button size="sm" asChild>
                        <a
                          href={resource.url}
                          target={resource.isExternal ? "_blank" : undefined}
                          rel={resource.isExternal ? "noopener noreferrer" : undefined}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Docs
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Resources */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {selectedCategory === 'ALL' ? 'All Resources' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          
          <div className="grid gap-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getResourceIcon(resource.type)}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{resource.title}</h3>
                          <Badge className={getDifficultyColor(resource.difficulty)}>
                            {resource.difficulty}
                          </Badge>
                          {resource.featured && (
                            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {resource.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={resource.url}
                        target={resource.isExternal ? "_blank" : undefined}
                        rel={resource.isExternal ? "noopener noreferrer" : undefined}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Docs
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredResources.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No resources found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or category filter.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Links */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Access Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" asChild className="h-16 flex-col">
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                  <Database className="h-6 w-6 mb-2" />
                  Supabase
                </a>
              </Button>

              <Button variant="outline" asChild className="h-16 flex-col">
                <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
                  <Smartphone className="h-6 w-6 mb-2" />
                  Next.js
                </a>
              </Button>

              <Button variant="outline" asChild className="h-16 flex-col">
                <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer">
                  <Palette className="h-6 w-6 mb-2" />
                  Tailwind CSS
                </a>
              </Button>

              <Button variant="outline" asChild className="h-16 flex-col">
                <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
                  <Globe className="h-6 w-6 mb-2" />
                  Vercel
                </a>
              </Button>

              <Button variant="outline" asChild className="h-16 flex-col">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-6 w-6 mb-2" />
                  GitHub
                </a>
              </Button>

              <Button variant="outline" asChild className="h-16 flex-col">
                <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                  <BookOpen className="h-6 w-6 mb-2" />
                  React
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}