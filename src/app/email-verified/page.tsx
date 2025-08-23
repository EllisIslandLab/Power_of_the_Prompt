'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EmailVerifiedPage() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-md w-full space-y-8">
        <div className="space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-accent/20">
            <svg className="h-8 w-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground">
            Email Verified!
          </h1>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your email has been successfully verified. You can now sign in to your Web Launch Academy account.
            </p>
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-md">
              <p className="text-sm text-accent-foreground">
                <strong>Welcome!</strong> Your student account is now active and ready to use.
              </p>
            </div>
          </div>
          
          <Button asChild className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
            <Link href="/signin">
              Sign In to Your Account
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}