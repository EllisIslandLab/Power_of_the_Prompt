"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, ArrowRight, FileText, Users } from "lucide-react"
import { textbookChapters } from "@/content/textbook/index"

export default function TextbookPortalPage() {
  // Add safety check for textbookChapters
  if (!textbookChapters || !Array.isArray(textbookChapters) || textbookChapters.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Textbook Content Loading...</h1>
          <p className="text-muted-foreground">Please check back in a moment.</p>
        </div>
      </div>
    )
  }

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
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
&quot;Build Once, Own Forever&quot; - Complete Guide to Professional Web Development
          </p>
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
          {textbookChapters.map((chapter) => (
              <Card
                key={chapter.id}
                className="relative transition-all duration-200 hover:shadow-lg cursor-pointer border-primary/20"
              >
                {/* Chapter Number Badge */}
                <div className="absolute -top-3 -left-3 z-10">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground">
                    {chapter.id}
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
                  <Button asChild className="w-full" size="sm">
                    <Link href={`/portal/textbook/${chapter.filePath}`}>
                      Start Reading
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
          ))}
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
              <Link href="/portal/schedule">
                Schedule Session
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