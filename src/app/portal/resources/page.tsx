"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  FileText,
  Code,
  ExternalLink,
  Download,
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
}

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const resources: Resource[] = [
    {
      id: 'architecture-mastery-toolkit',
      title: 'Architecture Mastery Toolkit',
      description: 'Professional implementation patterns and architectural knowledge that typically takes years to accumulate. Get the exact solutions used by senior developers, pre-configured for your stack with ready-to-use commands.',
      category: 'PREMIUM',
      type: 'TEMPLATE',
      url: '/portal/products/architecture-mastery-toolkit',
      isExternal: false,
      tags: ['Architecture', 'Patterns', 'Professional'],
      difficulty: 'INTERMEDIATE',
      featured: true
    },
    {
      id: '9',
      title: 'Next.js Documentation',
      description: 'Official Next.js documentation - your go-to resource for framework details',
      category: 'EXTERNAL',
      type: 'EXTERNAL',
      url: 'https://nextjs.org/docs',
      isExternal: true,
      tags: ['Next.js', 'Documentation', 'Official'],
      difficulty: 'BEGINNER',
      featured: false
    },
    {
      id: '10',
      title: 'Tailwind CSS Documentation',
      description: 'Complete Tailwind CSS documentation with examples and customization guides',
      category: 'EXTERNAL',
      type: 'EXTERNAL',
      url: 'https://tailwindcss.com/docs',
      isExternal: true,
      tags: ['Tailwind', 'CSS', 'Documentation'],
      difficulty: 'BEGINNER',
      featured: false
    }
  ]

  const categories = [
    { id: 'ALL', name: 'All Resources', icon: FileText },
    { id: 'PREMIUM', name: 'Premium Bundle', icon: Code },
    { id: 'EXTERNAL', name: 'External Links', icon: ExternalLink }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'ALL' || resource.category === selectedCategory
    
    return matchesSearch && matchesCategory
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Student Resources</h1>
            </div>
            <Button variant="outline" asChild>
              <Link href="/portal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">
            Templates, guides, tools, and external resources to accelerate your web development journey
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
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
                          {resource.isExternal ? (
                            <>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open
                            </>
                          ) : resource.category === 'PREMIUM' ? (
                            <>
                              View Details - $190
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </>
                          )}
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
                        {resource.isExternal ? (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open
                          </>
                        ) : resource.category === 'PREMIUM' ? (
                          <>
                            View Details - $190
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </>
                        )}
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
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-6 w-6 mb-2" />
                  GitHub
                </a>
              </Button>
              
              <Button variant="outline" asChild className="h-16 flex-col">
                <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
                  <Globe className="h-6 w-6 mb-2" />
                  Vercel
                </a>
              </Button>
              
              <Button variant="outline" asChild className="h-16 flex-col">
                <a href="https://airtable.com" target="_blank" rel="noopener noreferrer">
                  <Database className="h-6 w-6 mb-2" />
                  Airtable
                </a>
              </Button>
              
              <Button variant="outline" asChild className="h-16 flex-col">
                <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer">
                  <Palette className="h-6 w-6 mb-2" />
                  Tailwind CSS
                </a>
              </Button>
              
              <Button variant="outline" asChild className="h-16 flex-col">
                <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
                  <Smartphone className="h-6 w-6 mb-2" />
                  Next.js
                </a>
              </Button>
              
              <Button variant="outline" asChild className="h-16 flex-col">
                <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">
                  <Shield className="h-6 w-6 mb-2" />
                  Claude AI
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}