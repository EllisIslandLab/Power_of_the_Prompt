import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    
    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
    
    // Generate session ID for tracking
    const sessionId = uuidv4()
    
    // Perform quick analysis
    const results = await performQuickAnalysis(normalizedUrl)
    
    return NextResponse.json({
      sessionId,
      url: normalizedUrl,
      ...results
    })
  } catch (error) {
    console.error('Quick analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed. Please check the URL and try again.' },
      { status: 500 }
    )
  }
}

async function performQuickAnalysis(url: string) {
  try {
    // Fetch the webpage
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebLaunchAcademy-Analyzer/1.0)'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const html = await response.text()
    const headers = response.headers
    
    // Basic performance analysis
    const performanceScore = analyzePerformance(response, html)
    
    // SEO analysis
    const seoScore = analyzeSEO(html)
    
    // Security analysis
    const securityScore = analyzeSecurity(headers, url)
    
    // Mobile analysis
    const mobileScore = analyzeMobile(html)
    
    // Calculate overall score
    const overall = Math.round((performanceScore + seoScore + securityScore + mobileScore) / 4)
    
    return {
      overall,
      performance: performanceScore,
      seo: seoScore,
      security: securityScore,
      mobile: mobileScore,
      details: {
        performance: getPerformanceDetails(response, html),
        seo: getSEODetails(html),
        security: getSecurityDetails(headers, url),
        mobile: getMobileDetails(html)
      }
    }
  } catch (error) {
    console.error('Analysis error:', error)
    throw new Error('Failed to analyze website')
  }
}

function analyzePerformance(response: Response, html: string): number {
  let score = 100
  
  // Check response time (basic check)
  const contentLength = html.length
  if (contentLength > 500000) score -= 20 // Large HTML
  if (contentLength > 1000000) score -= 20 // Very large HTML
  
  // Check for common performance issues
  const imageCount = (html.match(/<img/gi) || []).length
  if (imageCount > 20) score -= 15
  
  // Check for inline styles/scripts
  if (html.includes('<style>')) score -= 5
  if (html.includes('<script>') && html.match(/<script>/gi)!.length > 10) score -= 10
  
  // Check for minification
  if (html.includes('  ') || html.includes('\n\n')) score -= 10
  
  return Math.max(0, score)
}

function analyzeSEO(html: string): number {
  let score = 100
  
  // Title tag
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  if (!titleMatch) {
    score -= 25
  } else {
    const title = titleMatch[1]
    if (title.length < 30 || title.length > 60) score -= 10
  }
  
  // Meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
  if (!metaDescMatch) {
    score -= 20
  } else {
    const desc = metaDescMatch[1]
    if (desc.length < 120 || desc.length > 160) score -= 10
  }
  
  // H1 tag
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i)
  if (!h1Match) score -= 15
  
  // Meta viewport
  if (!html.includes('name="viewport"')) score -= 10
  
  // Alt text for images
  const images = html.match(/<img[^>]*>/gi) || []
  const imagesWithoutAlt = images.filter(img => !img.includes('alt=')).length
  if (imagesWithoutAlt > 0) {
    score -= Math.min(20, imagesWithoutAlt * 2)
  }
  
  return Math.max(0, score)
}

function analyzeSecurity(headers: Headers, url: string): number {
  let score = 100
  
  // HTTPS check
  if (!url.startsWith('https://')) score -= 30
  
  // Security headers
  if (!headers.get('strict-transport-security')) score -= 15
  if (!headers.get('x-frame-options')) score -= 10
  if (!headers.get('x-content-type-options')) score -= 10
  if (!headers.get('x-xss-protection')) score -= 10
  if (!headers.get('content-security-policy')) score -= 15
  
  return Math.max(0, score)
}

function analyzeMobile(html: string): number {
  let score = 100
  
  // Viewport meta tag
  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*>/i)
  if (!viewportMatch) {
    score -= 30
  } else {
    const viewport = viewportMatch[0]
    if (!viewport.includes('width=device-width')) score -= 15
    if (!viewport.includes('initial-scale=1')) score -= 10
  }
  
  // Responsive design indicators
  if (!html.includes('media="') && !html.includes('@media')) score -= 20
  
  // Font size issues
  if (html.includes('font-size: 8px') || html.includes('font-size:8px')) score -= 15
  
  return Math.max(0, score)
}

function getPerformanceDetails(response: Response, html: string) {
  return {
    htmlSize: html.length,
    imageCount: (html.match(/<img/gi) || []).length,
    scriptCount: (html.match(/<script/gi) || []).length,
    styleCount: (html.match(/<link[^>]*stylesheet|<style/gi) || []).length
  }
}

function getSEODetails(html: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i)
  
  return {
    title: titleMatch ? titleMatch[1] : null,
    titleLength: titleMatch ? titleMatch[1].length : 0,
    metaDescription: metaDescMatch ? metaDescMatch[1] : null,
    metaDescLength: metaDescMatch ? metaDescMatch[1].length : 0,
    h1: h1Match ? h1Match[1] : null,
    hasViewport: html.includes('name="viewport"'),
    imageCount: (html.match(/<img/gi) || []).length,
    imagesWithoutAlt: (html.match(/<img[^>]*>/gi) || []).filter(img => !img.includes('alt=')).length
  }
}

function getSecurityDetails(headers: Headers, url: string) {
  return {
    isHTTPS: url.startsWith('https://'),
    hasHSTS: !!headers.get('strict-transport-security'),
    hasXFrameOptions: !!headers.get('x-frame-options'),
    hasXContentTypeOptions: !!headers.get('x-content-type-options'),
    hasXXSSProtection: !!headers.get('x-xss-protection'),
    hasCSP: !!headers.get('content-security-policy')
  }
}

function getMobileDetails(html: string) {
  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*>/i)
  
  return {
    hasViewport: !!viewportMatch,
    viewportContent: viewportMatch ? viewportMatch[0] : null,
    hasResponsiveCSS: html.includes('media="') || html.includes('@media'),
    hasDeviceWidth: viewportMatch ? viewportMatch[0].includes('width=device-width') : false
  }
}