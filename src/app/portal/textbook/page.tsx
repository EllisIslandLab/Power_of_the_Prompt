"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, CheckCircle, ArrowRight, FileText, Users } from "lucide-react"
import { textbookChapters } from "@/content/textbook"

export default function TextbookPortalPage() {
  const [completedChapters, setCompletedChapters] = useState<string[]>([])
  
  const toggleChapterComplete = (chapterId: string) => {
    setCompletedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    )
  }

  const progressPercentage = Math.round((completedChapters.length / textbookChapters.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-3 rounded-full border border-primary/20 mb-6">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-primary">Student Textbook</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            WebLaunchCoach Student Textbook
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
&quot;Build Once, Own Forever&quot; - Complete Guide to Professional Web Development
          </p>
          
          {/* Progress Indicator */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-sm font-medium text-primary">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {completedChapters.length} of {textbookChapters.length} chapters completed
            </p>
          </div>
        </div>

        {/* Introduction Card */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Comprehensive Guide</h3>
                <p className="text-sm text-muted-foreground">
                  Complete step-by-step instructions for building professional websites
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Student Exclusive</h3>
                <p className="text-sm text-muted-foreground">
                  Access restricted to enrolled students only
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Always Updated</h3>
                <p className="text-sm text-muted-foreground">
                  Latest best practices and techniques
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapter Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {textbookChapters.map((chapter, index) => {
            const isCompleted = completedChapters.includes(chapter.id)
            const isAccessible = index === 0 || completedChapters.includes(textbookChapters[index - 1].id)
            
            return (
              <Card 
                key={chapter.id} 
                className={`relative transition-all duration-200 ${
                  isCompleted 
                    ? 'border-green-200 bg-green-50/50' 
                    : isAccessible 
                      ? 'hover:shadow-lg cursor-pointer border-primary/20' 
                      : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Chapter Number Badge */}
                <div className="absolute -top-3 -left-3 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isAccessible 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : chapter.id}
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-2">
                        Chapter {chapter.id}: {chapter.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {chapter.sections.length} sections
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          ~30 min read
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Sections Preview */}
                  <div className="space-y-2 mb-4">
                    {chapter.sections.slice(0, 3).map((section) => (
                      <div key={section.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary/40" />
                        <span>{section.title}</span>
                      </div>
                    ))}
                    {chapter.sections.length > 3 && (
                      <div className="text-xs text-muted-foreground ml-4">
                        +{chapter.sections.length - 3} more sections
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isAccessible ? (
                      <>
                        <Button asChild className="flex-1" size="sm">
                          <Link href={`/portal/textbook/${chapter.filePath}`}>
                            {isCompleted ? 'Review' : 'Start Reading'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleChapterComplete(chapter.id)}
                          className={isCompleted ? 'border-green-200 text-green-700' : ''}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-current rounded-full" />
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button disabled className="flex-1" size="sm">
                        Complete Previous Chapter
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Access Links */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Button variant="outline" asChild>
              <Link href="/portal">
                ← Back to Portal
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/portal/textbook/01-accounts-and-installations">
                Start Chapter 1
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/consultation">
                Get Help
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/portal/resources">
                Resources
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}