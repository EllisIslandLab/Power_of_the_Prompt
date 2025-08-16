"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, AlertCircle, CheckCircle, Clock, TrendingDown, TrendingUp } from "lucide-react"

export function TestAudit() {
  const [currentStep, setCurrentStep] = useState(0)
  const [sampleUrl, setSampleUrl] = useState("")
  const [showSampleReport, setShowSampleReport] = useState(false)
  
  const assessmentSteps = [
    {
      title: "Enter Your Website URL",
      description: "We'll analyze your current website",
      icon: "🌐"
    },
    {
      title: "Performance Analysis",
      description: "Testing speed, Core Web Vitals, and optimization",
      icon: "⚡"
    },
    {
      title: "SEO & Security Scan",
      description: "Checking search visibility and security issues",
      icon: "🔍"
    },
    {
      title: "Report Generation",
      description: "Creating your personalized improvement plan",
      icon: "📊"
    }
  ]
  
  const sampleResults = {
    overall: 73,
    performance: 68,
    seo: 82,
    security: 71,
    ux: 75,
    issues: [
      { type: "critical", count: 3, label: "Critical Issues" },
      { type: "warning", count: 8, label: "Warnings" },
      { type: "info", count: 12, label: "Suggestions" }
    ],
    improvements: [
      { area: "Image Optimization", impact: "High", effort: "Low" },
      { area: "Minify CSS/JS", impact: "Medium", effort: "Low" },
      { area: "Enable Caching", impact: "High", effort: "Medium" },
      { area: "Mobile Optimization", impact: "High", effort: "High" }
    ]
  }
  
  const auditPoints = [
    {
      category: "Performance",
      items: [
        "Page load speed analysis",
        "Core Web Vitals assessment", 
        "Mobile responsiveness test",
        "Image optimization review"
      ]
    },
    {
      category: "SEO",
      items: [
        "Search engine visibility check",
        "Meta tags and structured data",
        "Content optimization analysis",
        "Technical SEO audit"
      ]
    },
    {
      category: "Security",
      items: [
        "SSL certificate verification",
        "Security headers analysis",
        "Vulnerability scan",
        "Best practices compliance"
      ]
    },
    {
      category: "User Experience",
      items: [
        "Navigation and usability test",
        "Form functionality check",
        "Cross-browser compatibility",
        "Accessibility compliance"
      ]
    }
  ]

  return (
    <section id="test-audit" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Free Professional Website <span className="text-primary">Analysis</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Get a comprehensive analysis of your current website's performance, SEO, security, and user experience. 
            See exactly where you're losing customers and how to fix it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => setShowSampleReport(!showSampleReport)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              View Sample Report
            </Button>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/audit">Get My Free Audit</Link>
            </Button>
          </div>
        </div>
        
        {/* Interactive Assessment Tool Preview */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            How Our Assessment Works
          </h3>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {assessmentSteps.map((step, index) => (
                <div key={index} className={`text-center p-4 rounded-xl border transition-all ${
                  index <= currentStep ? 'bg-primary/10 border-primary/20' : 'bg-muted/50 border-border'
                }`}>
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                <input
                  type="url"
                  placeholder="Enter your website URL (e.g., yoursite.com)"
                  value={sampleUrl}
                  onChange={(e) => setSampleUrl(e.target.value)}
                  className="flex-1 max-w-md px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button 
                  onClick={() => {
                    if (currentStep < assessmentSteps.length - 1) {
                      setCurrentStep(currentStep + 1)
                      setTimeout(() => {
                        if (currentStep < assessmentSteps.length - 2) {
                          setCurrentStep(currentStep + 2)
                        }
                      }, 1500)
                    }
                  }}
                  disabled={!sampleUrl}
                >
                  Start Analysis
                </Button>
              </div>
              
              {currentStep > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span className="text-foreground">Analyzing {assessmentSteps[Math.min(currentStep, assessmentSteps.length - 1)].title.toLowerCase()}...</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-1000" 
                      style={{width: `${((currentStep + 1) / assessmentSteps.length) * 100}%`}}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sample Audit Report */}
        {showSampleReport && (
          <div className="mb-16 bg-background border border-border rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">Sample Audit Report</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSampleReport(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-orange-500 mb-2">{sampleResults.overall}</div>
                  <div className="text-lg font-semibold text-foreground">Overall Score</div>
                  <div className="text-sm text-muted-foreground">Needs Improvement</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-500">{sampleResults.performance}</div>
                    <div className="text-sm text-foreground">Performance</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">{sampleResults.seo}</div>
                    <div className="text-sm text-foreground">SEO</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-500">{sampleResults.security}</div>
                    <div className="text-sm text-foreground">Security</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-500">{sampleResults.ux}</div>
                    <div className="text-sm text-foreground">User Experience</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-4">Issues Found</h4>
                  <div className="space-y-3">
                    {sampleResults.issues.map((issue, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {issue.type === 'critical' ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : issue.type === 'warning' ? (
                            <Clock className="h-4 w-4 text-orange-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="text-foreground">{issue.label}</span>
                        </div>
                        <span className="font-semibold">{issue.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-4">Priority Improvements</h4>
                  <div className="space-y-3">
                    {sampleResults.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-foreground">{improvement.area}</span>
                        <div className="flex items-center gap-2">
                          {improvement.impact === 'High' ? (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-orange-500" />
                          )}
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {improvement.effort} effort
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/audit">Get Your Real Report</Link>
              </Button>
            </div>
          </div>
        )}
        
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              {auditPoints.map((audit, index) => (
                <div key={index} className="bg-background border border-border rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {audit.category}
                  </h3>
                  <ul className="space-y-2">
                    {audit.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-muted-foreground text-sm">
                        <span className="text-green-500 text-xs mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:sticky lg:top-8">
            <div className="bg-background border border-border rounded-2xl p-6 text-center">
              <div className="mb-6">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Comprehensive Website Audit
                </h3>
                <div className="text-3xl font-bold text-primary mb-2">FREE</div>
                <p className="text-muted-foreground text-sm">
                  Usually $197 - Limited time offer
                </p>
              </div>
              
              <div className="space-y-3 mb-6 text-left">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground">Performance Score</span>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground">SEO Analysis</span>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground">Security Scan</span>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground">Mobile Test</span>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground">Improvement Plan</span>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground">Video Walkthrough</span>
                  <span className="text-green-500">✓</span>
                </div>
              </div>
              
              <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mb-3">
                <Link href="/audit">Get Free Audit</Link>
              </Button>
              
              <p className="text-xs text-muted-foreground">
                No obligation • Results in 24-48 hours
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-background border border-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              See Exactly Where You're Losing Customers
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive audit reveals exactly where your website is failing and provides a clear roadmap to fix it and increase conversions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center mb-8">
            <div className="space-y-3">
              <div className="text-3xl">📊</div>
              <h4 className="font-semibold text-foreground">Performance Metrics</h4>
              <p className="text-sm text-muted-foreground">
                Detailed speed scores, Core Web Vitals, and optimization opportunities that directly impact conversions
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-3xl">🎯</div>
              <h4 className="font-semibold text-foreground">Actionable Insights</h4>
              <p className="text-sm text-muted-foreground">
                Specific recommendations prioritized by business impact and ease of implementation
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-3xl">📈</div>
              <h4 className="font-semibold text-foreground">Growth Opportunities</h4>
              <p className="text-sm text-muted-foreground">
                Identify ways to improve conversions, reduce bounce rate, and increase search rankings
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-green-50 border border-border rounded-xl p-6">
            <div className="text-center">
              <h4 className="font-semibold text-foreground mb-4">
                Common Issues We Find (and Fix)
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <span>✗</span>
                    <span>Slow loading speeds (3+ seconds)</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <span>✗</span>
                    <span>Poor mobile experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <span>✗</span>
                    <span>Missing SEO optimization</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <span>✗</span>
                    <span>Security vulnerabilities</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span>Lightning fast performance (&lt;1s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span>Perfect mobile optimization</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span>Search engine optimized</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span>Enterprise-grade security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}