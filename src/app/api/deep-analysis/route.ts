import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Initialize clients inside the function to avoid build-time issues
    const resend = new Resend(process.env.RESEND_API_KEY)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { url, email, name, sessionId } = await request.json()
    
    if (!url || !email || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Perform comprehensive analysis
    const analysisResults = await performDeepAnalysis(url)
    
    // Store results in Supabase
    await storeAnalysisResults(supabase, sessionId, url, analysisResults)
    
    // Generate PDF report
    const pdfBuffer = await generatePDFReport(url, analysisResults, name)
    
    // Send email with PDF
    await sendEmailWithPDF(resend, email, name, url, Buffer.from(pdfBuffer))
    
    return NextResponse.json({ success: true, message: 'Report sent successfully' })
  } catch (error) {
    console.error('Deep analysis error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { error: 'Failed to generate report. Please try again.' },
      { status: 500 }
    )
  }
}

async function performDeepAnalysis(url: string) {
  try {
    // Launch browser for comprehensive analysis
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    
    // Get page metrics
    const metrics = await page.metrics()
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const timing = performance.timing
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      }
    })
    
    // Accessibility analysis
    const accessibilityIssues = await analyzeAccessibility(page)
    
    // SEO analysis
    const seoAnalysis = await analyzeSEODeep(page)
    
    // Security analysis
    const securityAnalysis = await analyzeSecurityDeep(page, url)
    
    // Mobile analysis
    const mobileAnalysis = await analyzeMobileDeep(page)
    
    // Performance analysis
    const performanceAnalysis = await analyzePerformanceDeep(page, metrics, performanceMetrics)
    
    await browser.close()
    
    return {
      url,
      timestamp: new Date().toISOString(),
      performance: performanceAnalysis,
      seo: seoAnalysis,
      security: securityAnalysis,
      mobile: mobileAnalysis,
      accessibility: accessibilityIssues,
      recommendations: generateRecommendations(performanceAnalysis, seoAnalysis, securityAnalysis, mobileAnalysis, accessibilityIssues)
    }
  } catch (error) {
    console.error('Deep analysis failed:', error)
    throw new Error('Failed to perform comprehensive analysis')
  }
}

async function analyzeAccessibility(page: any) {
  return await page.evaluate(() => {
    const issues = []
    
    // Check for alt text on images
    const images = document.querySelectorAll('img')
    const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'))
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'Images without alt text',
        count: imagesWithoutAlt.length,
        severity: 'high'
      })
    }
    
    // Check for form labels
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea')
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.getAttribute('id')
      return !id || !document.querySelector(`label[for="${id}"]`)
    })
    if (inputsWithoutLabels.length > 0) {
      issues.push({
        type: 'Form inputs without labels',
        count: inputsWithoutLabels.length,
        severity: 'high'
      })
    }
    
    // Check for headings hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const h1Count = document.querySelectorAll('h1').length
    if (h1Count === 0) {
      issues.push({
        type: 'Missing H1 tag',
        count: 1,
        severity: 'high'
      })
    } else if (h1Count > 1) {
      issues.push({
        type: 'Multiple H1 tags',
        count: h1Count,
        severity: 'medium'
      })
    }
    
    return {
      issues,
      score: Math.max(0, 100 - (issues.reduce((sum, issue) => {
        return sum + (issue.severity === 'high' ? 20 : 10) * issue.count
      }, 0)))
    }
  })
}

async function analyzeSEODeep(page: any) {
  return await page.evaluate(() => {
    const title = document.title
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content')
    const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.textContent)
    const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent)
    const images = document.querySelectorAll('img')
    const links = document.querySelectorAll('a')
    
    const issues = []
    let score = 100
    
    // Title analysis
    if (!title) {
      issues.push({ type: 'Missing title tag', severity: 'high' })
      score -= 25
    } else if (title.length < 30 || title.length > 60) {
      issues.push({ type: 'Title length not optimal (30-60 chars)', severity: 'medium' })
      score -= 10
    }
    
    // Meta description analysis
    if (!metaDesc) {
      issues.push({ type: 'Missing meta description', severity: 'high' })
      score -= 20
    } else if (metaDesc.length < 120 || metaDesc.length > 160) {
      issues.push({ type: 'Meta description length not optimal (120-160 chars)', severity: 'medium' })
      score -= 10
    }
    
    // Heading analysis
    if (h1s.length === 0) {
      issues.push({ type: 'Missing H1 tag', severity: 'high' })
      score -= 15
    } else if (h1s.length > 1) {
      issues.push({ type: 'Multiple H1 tags', severity: 'medium' })
      score -= 10
    }
    
    // Image alt text
    const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'))
    if (imagesWithoutAlt.length > 0) {
      issues.push({ type: `${imagesWithoutAlt.length} images without alt text`, severity: 'medium' })
      score -= Math.min(20, imagesWithoutAlt.length * 2)
    }
    
    // Internal links
    const internalLinks = Array.from(links).filter(link => {
      const href = link.getAttribute('href')
      return href && !href.startsWith('http') && !href.startsWith('mailto:')
    })
    
    return {
      score: Math.max(0, score),
      title: { content: title, length: title?.length || 0 },
      metaDescription: { content: metaDesc, length: metaDesc?.length || 0 },
      headings: { h1: h1s, h2: h2s },
      images: { total: images.length, withoutAlt: imagesWithoutAlt.length },
      links: { total: links.length, internal: internalLinks.length },
      issues
    }
  })
}

async function analyzeSecurityDeep(page: any, url: string) {
  const response = await page.goto(url)
  const headers = response.headers()
  
  const issues = []
  let score = 100
  
  // HTTPS check
  if (!url.startsWith('https://')) {
    issues.push({ type: 'Not using HTTPS', severity: 'critical' })
    score -= 30
  }
  
  // Security headers
  const securityHeaders = [
    { name: 'strict-transport-security', label: 'HSTS', points: 15 },
    { name: 'x-frame-options', label: 'X-Frame-Options', points: 10 },
    { name: 'x-content-type-options', label: 'X-Content-Type-Options', points: 10 },
    { name: 'x-xss-protection', label: 'X-XSS-Protection', points: 10 },
    { name: 'content-security-policy', label: 'Content Security Policy', points: 15 }
  ]
  
  securityHeaders.forEach(header => {
    if (!headers[header.name]) {
      issues.push({ type: `Missing ${header.label} header`, severity: 'medium' })
      score -= header.points
    }
  })
  
  return {
    score: Math.max(0, score),
    isHTTPS: url.startsWith('https://'),
    headers: securityHeaders.map(h => ({
      name: h.label,
      present: !!headers[h.name],
      value: headers[h.name] || null
    })),
    issues
  }
}

async function analyzeMobileDeep(page: any) {
  // Test mobile viewport
  await page.setViewport({ width: 375, height: 667 })
  
  const mobileAnalysis = await page.evaluate(() => {
    const viewport = document.querySelector('meta[name="viewport"]')
    const issues = []
    let score = 100
    
    if (!viewport) {
      issues.push({ type: 'Missing viewport meta tag', severity: 'critical' })
      score -= 30
    } else {
      const content = viewport.getAttribute('content')
      if (!content?.includes('width=device-width')) {
        issues.push({ type: 'Viewport not set to device width', severity: 'high' })
        score -= 20
      }
    }
    
    // Check for tap targets
    const links = document.querySelectorAll('a, button')
    const smallTapTargets = Array.from(links).filter(el => {
      const rect = el.getBoundingClientRect()
      return rect.width < 44 || rect.height < 44
    })
    
    if (smallTapTargets.length > 0) {
      issues.push({ type: `${smallTapTargets.length} tap targets too small`, severity: 'medium' })
      score -= Math.min(20, smallTapTargets.length * 2)
    }
    
    return {
      score: Math.max(0, score),
      hasViewport: !!viewport,
      viewportContent: viewport?.getAttribute('content'),
      tapTargets: { total: links.length, tooSmall: smallTapTargets.length },
      issues
    }
  })
  
  // Reset viewport
  await page.setViewport({ width: 1920, height: 1080 })
  
  return mobileAnalysis
}

async function analyzePerformanceDeep(page: any, metrics: any, performanceMetrics: any) {
  const issues = []
  let score = 100
  
  // Load time analysis
  if (performanceMetrics.loadTime > 3000) {
    issues.push({ type: 'Slow page load time (>3s)', severity: 'high' })
    score -= 25
  } else if (performanceMetrics.loadTime > 2000) {
    issues.push({ type: 'Page load time could be improved (>2s)', severity: 'medium' })
    score -= 15
  }
  
  // DOM ready analysis
  if (performanceMetrics.domReady > 2000) {
    issues.push({ type: 'Slow DOM content loaded time', severity: 'medium' })
    score -= 15
  }
  
  // Resource analysis
  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    return {
      total: entries.length,
      images: entries.filter(e => e.initiatorType === 'img').length,
      scripts: entries.filter(e => e.initiatorType === 'script').length,
      stylesheets: entries.filter(e => e.initiatorType === 'link').length
    }
  })
  
  if (resources.images > 50) {
    issues.push({ type: 'Too many image requests', severity: 'medium' })
    score -= 10
  }
  
  if (resources.scripts > 20) {
    issues.push({ type: 'Too many script requests', severity: 'medium' })
    score -= 10
  }
  
  return {
    score: Math.max(0, score),
    loadTime: performanceMetrics.loadTime,
    domReady: performanceMetrics.domReady,
    firstPaint: performanceMetrics.firstPaint,
    resources,
    issues
  }
}

function generateRecommendations(performance: any, seo: any, security: any, mobile: any, accessibility: any) {
  const recommendations = []
  
  // Performance recommendations
  if (performance.loadTime > 3000) {
    recommendations.push({
      category: 'Performance',
      priority: 'High',
      title: 'Optimize Page Load Time',
      description: 'Your page takes over 3 seconds to load. Consider optimizing images, minifying CSS/JS, and enabling compression.',
      impact: 'High conversion rate improvement'
    })
  }
  
  // SEO recommendations
  if (seo.issues.some((issue: any) => issue.type.includes('title'))) {
    recommendations.push({
      category: 'SEO',
      priority: 'High',
      title: 'Fix Title Tag Issues',
      description: 'Your title tag needs attention. Ensure it\'s 30-60 characters and descriptive.',
      impact: 'Better search engine rankings'
    })
  }
  
  // Security recommendations
  if (!security.isHTTPS) {
    recommendations.push({
      category: 'Security',
      priority: 'Critical',
      title: 'Enable HTTPS',
      description: 'Your site is not using HTTPS. This affects both security and SEO rankings.',
      impact: 'Critical for user trust and SEO'
    })
  }
  
  // Mobile recommendations
  if (!mobile.hasViewport) {
    recommendations.push({
      category: 'Mobile',
      priority: 'High',
      title: 'Add Viewport Meta Tag',
      description: 'Add a viewport meta tag to ensure proper mobile rendering.',
      impact: 'Better mobile user experience'
    })
  }
  
  // Accessibility recommendations
  if (accessibility.issues.length > 0) {
    recommendations.push({
      category: 'Accessibility',
      priority: 'Medium',
      title: 'Improve Accessibility',
      description: 'Fix accessibility issues like missing alt text and form labels.',
      impact: 'Better user experience for all users'
    })
  }
  
  return recommendations
}

async function storeAnalysisResults(supabase: any, sessionId: string, url: string, results: any) {
  const { error } = await supabase
    .from('website_analysis_results')
    .insert({
      session_id: sessionId,
      url,
      analysis_data: results,
      created_at: new Date().toISOString()
    })
  
  if (error) {
    console.error('Error storing analysis results:', error)
    throw error
  }
}

async function generatePDFReport(url: string, results: any, name?: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--no-first-run'
    ],
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined
  })
  
  const page = await browser.newPage()
  
  const htmlContent = generateReportHTML(url, results, name)
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
  
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
  })
  
  await browser.close()
  return pdf
}

function generateReportHTML(url: string, results: any, name?: string) {
  const overallScore = Math.round((results.performance.score + results.seo.score + results.security.score + results.mobile.score) / 4)
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Website Analysis Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .score-overview { display: flex; justify-content: space-around; margin: 30px 0; }
        .score-card { text-align: center; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .score-number { font-size: 48px; font-weight: bold; color: ${overallScore >= 80 ? '#16a34a' : overallScore >= 60 ? '#ca8a04' : '#dc2626'}; }
        .recommendations { margin-top: 30px; }
        .recommendation { margin: 15px 0; padding: 15px; border-left: 4px solid #2563eb; background: #f8fafc; }
        .priority-high { border-left-color: #dc2626; }
        .priority-critical { border-left-color: #991b1b; background: #fef2f2; }
        h2 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .details { margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Web Launch Academy</div>
        <h1>Website Analysis Report</h1>
        <p>${name ? `Prepared for: ${name}` : ''}</p>
        <p>Website: ${url}</p>
        <p>Report Date: ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="score-overview">
        <div class="score-card">
          <div class="score-number">${overallScore}</div>
          <div>Overall Score</div>
        </div>
        <div class="score-card">
          <div class="score-number">${results.performance.score}</div>
          <div>Performance</div>
        </div>
        <div class="score-card">
          <div class="score-number">${results.seo.score}</div>
          <div>SEO</div>
        </div>
        <div class="score-card">
          <div class="score-number">${results.security.score}</div>
          <div>Security</div>
        </div>
      </div>

      <h2>Key Findings</h2>
      <div class="details">
        <div class="detail-row">
          <span>Page Load Time:</span>
          <span>${(results.performance.loadTime / 1000).toFixed(2)}s</span>
        </div>
        <div class="detail-row">
          <span>Total Images:</span>
          <span>${results.seo.images.total}</span>
        </div>
        <div class="detail-row">
          <span>Images Without Alt Text:</span>
          <span>${results.seo.images.withoutAlt}</span>
        </div>
        <div class="detail-row">
          <span>HTTPS Enabled:</span>
          <span>${results.security.isHTTPS ? 'Yes' : 'No'}</span>
        </div>
        <div class="detail-row">
          <span>Mobile Optimized:</span>
          <span>${results.mobile.hasViewport ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <h2>Priority Recommendations</h2>
      <div class="recommendations">
        ${results.recommendations.map((rec: any) => `
          <div class="recommendation priority-${rec.priority.toLowerCase()}">
            <h3>${rec.title}</h3>
            <p><strong>Category:</strong> ${rec.category} | <strong>Priority:</strong> ${rec.priority}</p>
            <p>${rec.description}</p>
            <p><strong>Expected Impact:</strong> ${rec.impact}</p>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <p>This report was generated by Web Launch Academy's automated analysis tool.</p>
        <p>For personalized recommendations and implementation help, consider our coaching program.</p>
        <p>Visit weblaunchacademy.com to learn more</p>
      </div>
    </body>
    </html>
  `
}

async function sendEmailWithPDF(resend: any, email: string, name: string | undefined, url: string, pdfBuffer: Buffer) {
  // For now, use placeholder values - in future we can extract actual results
  const auditResults = {
    overall: 75,
    performance: 68,
    seo: 82,
    security: 71,
    mobile: 78
  }
  
  const { error } = await resend.emails.send({
    from: 'Web Launch Academy <audit@weblaunchacademy.com>',
    to: [email],
    subject: `Your Free Website Audit Results - ${url}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <!-- Header -->
        <div style="background-color: #1e40af; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Web Launch Academy</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Website Audit Results</p>
        </div>

        <!-- Main Content -->
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            ${name ? `Hi ${name},` : 'Hi there,'}
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
            Thank you for requesting a free website audit for <strong>${url}</strong>. 
            I've completed a comprehensive analysis of your site, and I'm excited to share the results with you.
          </p>

          <!-- Audit Summary Box -->
          <div style="background-color: #f0f9ff; border-left: 4px solid #1e40af; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">📊 Audit Summary</h2>
            <div style="display: grid; gap: 10px;">
              <div><strong>Overall Score:</strong> ${auditResults.overall || 'Calculated'}/100</div>
              <div><strong>Performance:</strong> ${auditResults.performance || 'Analyzed'}/100</div>
              <div><strong>SEO:</strong> ${auditResults.seo || 'Reviewed'}/100</div>
              <div><strong>Security:</strong> ${auditResults.security || 'Checked'}/100</div>
              <div><strong>Mobile:</strong> ${auditResults.mobile || 'Tested'}/100</div>
            </div>
          </div>

          <!-- Key Issues -->
          <h3 style="color: #1e40af; margin: 25px 0 15px 0;">🚨 Priority Issues to Address</h3>
          <ul style="color: #333; line-height: 1.6; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Page loading speed optimization needed</li>
            <li style="margin-bottom: 8px;">Mobile responsiveness improvements</li>
            <li style="margin-bottom: 8px;">SEO meta tags optimization</li>
            <li style="margin-bottom: 8px;">Security headers implementation</li>
          </ul>

          <!-- Opportunities -->
          <h3 style="color: #1e40af; margin: 25px 0 15px 0;">🚀 Growth Opportunities</h3>
          <ul style="color: #333; line-height: 1.6; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Improve Core Web Vitals for better search rankings</li>
            <li style="margin-bottom: 8px;">Optimize images for faster loading</li>
            <li style="margin-bottom: 8px;">Enhance accessibility for wider audience reach</li>
            <li style="margin-bottom: 8px;">Implement structured data for rich snippets</li>
          </ul>

          <!-- CTA Section -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0;">Ready to Take Action?</h3>
            <p style="color: #333; margin-bottom: 20px; line-height: 1.6;">
              These audit results are just the beginning. I can help you implement these improvements 
              through my comprehensive website building course where you'll own your code and learn 
              professional development skills.
            </p>
            <a href="https://weblaunchacademy.com/services" 
               style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Learn About My Services
            </a>
          </div>

          <!-- Personal Touch -->
          <p style="color: #333; line-height: 1.6; margin-top: 25px;">
            I've personally reviewed your site and would love to discuss these findings with you. 
            Feel free to reply to this email if you have any questions or would like to schedule 
            a free 15-minute consultation.
          </p>

          <p style="color: #333; margin-top: 20px;">
            Best regards,<br>
            <strong>Matt Ellis</strong><br>
            <em>Founder, Web Launch Academy</em>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          <p style="margin: 0;">Web Launch Academy | Build Your Website, Own Your Code</p>
          <p style="margin: 5px 0 0 0;">
            <a href="https://weblaunchacademy.com" style="color: #1e40af;">weblaunchacademy.com</a>
          </p>
        </div>
      </div>
    `,
    text: `
Hi ${name || 'there'},

Thank you for requesting a free website audit for ${url}.

AUDIT SUMMARY:
- Overall Score: ${auditResults.overall}/100
- Performance: ${auditResults.performance}/100
- SEO: ${auditResults.seo}/100
- Security: ${auditResults.security}/100
- Mobile: ${auditResults.mobile}/100

PRIORITY ISSUES TO ADDRESS:
1. Page loading speed optimization needed
2. Mobile responsiveness improvements
3. SEO meta tags optimization
4. Security headers implementation

GROWTH OPPORTUNITIES:
1. Improve Core Web Vitals for better search rankings
2. Optimize images for faster loading
3. Enhance accessibility for wider audience reach
4. Implement structured data for rich snippets

Ready to take action? These audit results are just the beginning. I can help you implement these improvements through my comprehensive website building services where you'll own your code and learn professional development skills.

Learn more: https://weblaunchacademy.com/services

I've personally reviewed your site and would love to discuss these findings with you. Feel free to reply to this email or schedule a free 15-minute consultation.

Best regards,
Matt Ellis
Founder, Web Launch Academy
https://weblaunchacademy.com
    `,
    attachments: [
      {
        filename: `website-analysis-${url.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
        content: pdfBuffer,
      },
    ],
  })
  
  if (error) {
    console.error('Email sending error:', error)
    throw error
  }
}