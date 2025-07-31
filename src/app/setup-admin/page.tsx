"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, AlertTriangle, CheckCircle } from "lucide-react"

export default function SetupAdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // Check if admin setup is disabled in production
  const isSetupDisabled = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DISABLE_ADMIN_SETUP === 'true'

  if (isSetupDisabled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Admin Setup Disabled</h2>
            <p className="text-muted-foreground">
              Admin account creation has been disabled for security. Please sign in with your existing admin account.
            </p>
            <Button asChild className="mt-4">
              <a href="/auth/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>  
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setEmail("")
        setPassword("")
        setName("")
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to create admin account. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
            <CardDescription>
              Create the first admin account for your WebLaunchCoach site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                <strong>Security Notice:</strong> This page should only be used during initial setup. 
                After creating your admin account, consider removing this page or adding additional security.
              </AlertDescription>
            </Alert>

            {result && (
              <Alert className={`mb-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? 'text-green-700' : 'text-red-700'}>
                  {result.message}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Admin Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="admin@yourdomain.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Strong password (12+ characters)"
                  minLength={12}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use a strong password with at least 12 characters
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Creating Admin Account..." : "Create Admin Account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                After setup, you can sign in at{" "}
                <span className="font-mono bg-muted px-2 py-1 rounded">/auth/signin</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}