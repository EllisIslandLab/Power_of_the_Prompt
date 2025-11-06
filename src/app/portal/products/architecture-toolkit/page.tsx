"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  Lock,
  Code,
  Zap,
  Clock,
  Download,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Product {
  id: string
  name: string
  description: string
  price: number
  stripe_lookup_key: string
}

interface ProductContent {
  id: string
  category: string
  name: string
  description: string
  claude_command: string
  video_url?: string
  file_urls?: string[]
  time_saved_min: number
  time_saved_max: number
  difficulty: string
  sort_order: number
}

export default function ArchitectureToolkitPage() {
  const [user, setUser] = useState<any>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [contents, setContents] = useState<ProductContent[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedContent, setExpandedContent] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Get user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        window.location.href = '/login'
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUser({ ...authUser, ...userData })

      // Get product
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('slug', 'architecture-toolkit')
        .single()

      setProduct(productData)

      // Check if user has purchased
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('product_id', productData.id)
        .eq('status', 'completed')
        .eq('access_granted', true)
        .maybeSingle()

      setHasPurchased(!!purchaseData)

      // If purchased, load contents
      if (purchaseData) {
        console.log('Looking for contents with product_id:', productData.id)

        const { data: contentsData, error: contentsError } = await supabase
          .from('product_contents')
          .select('*')
          .eq('product_id', productData.id)
          .order('category')
          .order('sort_order')

        console.log('Loaded contents:', contentsData?.length, 'resources')
        console.log('Contents by category:', contentsData?.reduce((acc: any, item: any) => {
          acc[item.category] = (acc[item.category] || 0) + 1
          return acc
        }, {}))

        // Also check what product_ids exist in the table
        const { data: allProductIds } = await supabase
          .from('product_contents')
          .select('product_id')

        const uniqueProductIds = [...new Set(allProductIds?.map((item: any) => item.product_id) || [])]
        console.log('All product_ids in product_contents table:', uniqueProductIds)

        if (contentsError) {
          console.error('Error loading contents:', contentsError)
        }

        setContents(contentsData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePurchase() {
    setPurchasing(true)
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: 'architecture-toolkit',
          stripeProductId: 'prod_TLpZ1AjXFUXzBT'
        })
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Failed to start checkout. Please try again.')
      setPurchasing(false)
    }
  }

  function toggleCategory(category: string) {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  function toggleContent(contentId: string) {
    const newExpanded = new Set(expandedContent)
    if (newExpanded.has(contentId)) {
      newExpanded.delete(contentId)
    } else {
      newExpanded.add(contentId)
    }
    setExpandedContent(newExpanded)
  }

  async function downloadFile(fileName: string) {
    try {
      const { data, error } = await supabase.storage
        .from('toolkit-files')
        .createSignedUrl(fileName, 3600) // 1 hour expiry

      if (error) {
        console.error('Error creating signed URL:', error)
        alert('Failed to download file. Please try again.')
        return
      }

      // Open download in new tab
      window.open(data.signedUrl, '_blank')
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file.')
    }
  }

  // Group contents by category
  const groupedContents = contents.reduce((acc, content) => {
    if (!acc[content.category]) {
      acc[content.category] = []
    }
    acc[content.category].push(content)
    return acc
  }, {} as Record<string, ProductContent[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
              <Button asChild variant="outline">
                <Link href="/portal/resources">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Resources
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/portal/resources">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resources
            </Link>
          </Button>
        </div>

        {!hasPurchased ? (
          // Sales Page
          <div className="space-y-6">
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="h-8 w-8 text-primary" />
                  <CardTitle className="text-3xl">{product.name}</CardTitle>
                </div>
                <p className="text-muted-foreground text-lg">
                  {product.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* What's Included */}
                <div className="bg-background rounded-lg p-6">
                  <h3 className="font-semibold text-xl mb-4">What's Included:</h3>
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">30+ Professional Templates</p>
                        <p className="text-sm text-muted-foreground">Battle-tested patterns used by senior developers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Claude CLI Commands</p>
                        <p className="text-sm text-muted-foreground">Copy-paste ready commands that work instantly</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Implementation Guides</p>
                        <p className="text-sm text-muted-foreground">Step-by-step instructions for each pattern</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Implementation Roadmap</p>
                        <p className="text-sm text-muted-foreground">Strategic guide to implementing patterns in your codebase</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Lifetime Access & Updates</p>
                        <p className="text-sm text-muted-foreground">New patterns added regularly at no extra cost</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Value Proposition */}
                <div className="bg-muted/50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Save 300+ Hours of Research</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Each template saves 6-20 hours of research, trial-and-error, and debugging.
                    Get the architectural knowledge that typically takes years to accumulate.
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">${product.price}</span>
                    <span className="text-muted-foreground line-through">$1,150</span>
                    <Badge variant="default" className="ml-2">Save 57%</Badge>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  size="lg"
                  className="w-full text-lg h-14"
                >
                  {purchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Unlock Toolkit - ${product.price}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure checkout powered by Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Purchased Content
          <div className="space-y-6">
            <Card className="border-green-500 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Check className="h-6 w-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-green-900">{product.name}</h2>
                </div>
                <p className="text-sm text-green-700">
                  You have full access to all {contents.length} resources
                </p>
              </CardContent>
            </Card>

            {/* Contents by Category */}
            <div className="space-y-4">
              {Object.entries(groupedContents).map(([category, categoryContents]) => (
                <Card key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Code className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-lg">{category}</h3>
                        <p className="text-sm text-muted-foreground">
                          {categoryContents.length} {categoryContents.length === 1 ? 'resource' : 'resources'}
                        </p>
                      </div>
                    </div>
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>

                  {expandedCategories.has(category) && (
                    <div className="border-t">
                      {categoryContents.map((content) => (
                        <div key={content.id} className="border-b last:border-b-0">
                          <button
                            onClick={() => toggleContent(content.id)}
                            className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{content.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Badge variant="outline" className="text-xs">
                                    {content.difficulty}
                                  </Badge>
                                  <span>•</span>
                                  <span>{content.time_saved_min}-{content.time_saved_max} hours saved</span>
                                </div>
                              </div>
                              {expandedContent.has(content.id) ? (
                                <ChevronDown className="h-5 w-5 ml-2" />
                              ) : (
                                <ChevronRight className="h-5 w-5 ml-2" />
                              )}
                            </div>
                          </button>

                          {expandedContent.has(content.id) && (
                            <div className="px-4 pb-4 space-y-4 bg-muted/30">
                              <Separator />

                              <div>
                                <h5 className="font-semibold mb-2 text-sm">What This Does:</h5>
                                <p className="text-sm text-muted-foreground">{content.description}</p>
                              </div>

                              {content.claude_command && (
                                <div>
                                  <h5 className="font-semibold mb-2 text-sm">Claude CLI Command:</h5>
                                  <pre className="bg-background p-3 rounded-md text-xs overflow-x-auto border">
                                    {content.claude_command}
                                  </pre>
                                </div>
                              )}

                              {content.file_urls && content.file_urls.length > 0 && (
                                <div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => downloadFile(content.file_urls[0])}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Guide
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
