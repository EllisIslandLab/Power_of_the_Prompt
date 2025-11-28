"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { BookOpen, Video, FileText, HelpCircle, Settings, Crown, Monitor } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const isInPortal = pathname?.startsWith('/portal')
  
  // Temporarily disable auth - use mock user for testing
  const user = null
  const isAdmin = false

  // Hide navigation completely in portal pages
  if (isInPortal) {
    return null
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-16">
          {/* Left: Logo and Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/favicon-logo.png"
              alt="Web Launch Academy Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <Link href={user && isInPortal ? "/portal" : "/"} className="text-2xl font-bold text-primary">
              {isInPortal ? "Web Launch Academy Portal" : "Web Launch Academy"}
            </Link>
          </div>

          {/* Center: Navigation Links - Absolutely centered */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center space-x-6">
            {user && isInPortal ? (
              // Student Portal Navigation
              <>
                <Link href="/portal/textbook" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <BookOpen className="h-4 w-4" />
                  Textbook
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
                <Link href="/#email-signup" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <span>⚡</span>
                  Free Demo
                </Link>
                <Link href="/#site-samples" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <span>🌐</span>
                  Site Samples
                </Link>
                <Link href="/#testimonials" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <span>💬</span>
                  Testimonials
                </Link>
              </>
            )}
          </div>

          {/* Right: Sign In Button */}
          <div className="ml-auto flex items-center space-x-4">
            {/* COMMENTED OUT - User auth disabled during transition */}
            {false ? (
              <></>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/signin">
                  <Button variant="outline">
                    Sign In
                  </Button>
                </Link>
                {/* Sign Up removed - now invite-only for committed students */}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}