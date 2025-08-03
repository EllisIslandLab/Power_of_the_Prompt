"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession, signIn, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { MessageCircle, BookOpen, Video, FileText, HelpCircle, Settings, Crown } from "lucide-react"

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
              {isInPortal ? "WebLaunchCoach Portal" : "Power of the Prompt"}
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
                <Link href="/#top" className="text-foreground hover:text-primary transition-colors">
                  Why Choose Us
                </Link>
                <Link href="/#portfolio" className="text-foreground hover:text-primary transition-colors">
                  Portfolio
                </Link>
                <Link href="/#consultation" className="text-foreground hover:text-primary transition-colors">
                  Free Consultation
                </Link>
                <Link href="/#courses" className="text-foreground hover:text-primary transition-colors">
                  Courses
                </Link>
                <Link href="/#built-for-you" className="text-foreground hover:text-primary transition-colors">
                  Built for You
                </Link>
                <Link href="/#general-services" className="text-foreground hover:text-primary transition-colors">
                  General Services
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
              <>
                <Button variant="outline" onClick={() => signIn()}>
                  Sign In
                </Button>
                <Button asChild>
                  <Link href="/#consultation">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}