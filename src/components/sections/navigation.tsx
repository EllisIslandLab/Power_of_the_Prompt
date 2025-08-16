"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession, signIn, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { MessageCircle, BookOpen, Video, FileText, HelpCircle, Settings, Crown, Monitor } from "lucide-react"

export function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isInPortal = pathname?.startsWith('/portal')
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={session && isInPortal ? "/portal" : "/"} className="text-2xl font-bold text-primary">
              {isInPortal ? "Web Launch Academy Portal" : "Web Launch Academy"}
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {session && isInPortal ? (
              // Student Portal Navigation
              <>
                <Link href="/portal/textbook" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <BookOpen className="h-4 w-4" />
                  Textbook
                </Link>
                <Link href="/portal/chat" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Link>
                <Link href="/portal/collaboration" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <Video className="h-4 w-4" />
                  Meet
                </Link>
                <Link href="/portal/resources" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <FileText className="h-4 w-4" />
                  Resources
                </Link>
                <Link href="/portal/support" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <HelpCircle className="h-4 w-4" />
                  Support
                </Link>
                {isAdmin && (
                  <Link href="/admin/services" className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-medium">
                    <Settings className="h-4 w-4" />
                    Admin
                  </Link>
                )}
              </>
            ) : (
              // Public Marketing Navigation
              <>
                <Link href="/#unique-approach" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <span>🥇</span>
                  Unique Approach
                </Link>
                <Link href="/#site-samples" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <span>🌐</span>
                  Site Samples
                </Link>
                <Link href="/#build-with-you" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <span>🎓</span>
                  Build With You
                </Link>
                <Link href="/#build-4-you" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Monitor className="h-4 w-4" />
                  Build 4 You
                </Link>
                <Link href="/#site-tlc" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <span>⚒️</span>
                  Site TLC
                </Link>
                <Link href="/#test-audit" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <span>📃</span>
                  Test & Audit
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                {!isInPortal && (
                  <Link href="/portal" className="text-foreground hover:text-primary transition-colors">
                    Portal
                  </Link>
                )}
                {isAdmin && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 border border-orange-200 rounded-full">
                    <Crown className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Admin</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {session.user?.name || session.user?.email}
                  </span>
                  <Button variant="outline" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={() => signIn()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Login/Sign Up
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}