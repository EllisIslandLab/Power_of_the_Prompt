"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Clock, Award } from "lucide-react"

export function BuildWithYou() {
  const features = [
    {
      week: "Week 1",
      title: "Foundation & Setup",
      tasks: [
        "Modern development environment setup",
        "React fundamentals and component architecture",
        "Your first interactive components",
        "Project structure and best practices"
      ]
    },
    {
      week: "Week 2", 
      title: "Design & Styling",
      tasks: [
        "Professional design systems with Tailwind CSS",
        "Responsive layouts that work on all devices",
        "Component styling and theme management",
        "Building your site's visual identity"
      ]
    },
    {
      week: "Week 3",
      title: "Functionality & Data",
      tasks: [
        "Forms, user interactions, and state management",
        "API integration and data handling",
        "Database setup and content management",
        "Dynamic content and user features"
      ]
    },
    {
      week: "Week 4",
      title: "Launch & Optimization",
      tasks: [
        "Performance optimization and SEO",
        "Professional deployment and hosting",
        "Domain setup and SSL certificates",
        "Maintenance and future growth planning"
      ]
    }
  ]

  return (
    <section id="build-with-you" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Learn to Build Professional Websites in <span className="text-primary">4 Weeks</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Learn by doing. In just 4 weeks, you'll build a professional website using modern web technologies, with our expert guidance every step of the way.
          </p>
          
        </div>
        
        {/* Student Testimonials */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Success Stories from Our Students
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">SM</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Sarah Martinez</div>
                  <div className="text-sm text-muted-foreground">Marketing Consultant</div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                "I went from knowing nothing about web development to launching my own consulting website. The step-by-step approach made everything clear, and now I save $200/month on my old WordPress fees."
              </p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
            </div>
            
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">DJ</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">David Johnson</div>
                  <div className="text-sm text-muted-foreground">Restaurant Owner</div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                "Our new website loads instantly and looks incredible on phones. Orders increased 40% in the first month. Best investment I've made for my business - and I own it completely!"
              </p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
            </div>
            
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">LR</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Lisa Roberts</div>
                  <div className="text-sm text-muted-foreground">Freelance Designer</div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                "The technology we learned is exactly what big companies use. I can now offer modern web development to my clients and charge premium rates. This course paid for itself in one project."
              </p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    {feature.week}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <ul className="space-y-2">
                      {feature.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-green-500 text-sm mt-1">✓</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {index < features.length - 1 && (
                  <div className="absolute left-8 top-16 w-px h-8 bg-border"></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="lg:sticky lg:top-8">
            <div className="bg-background rounded-2xl border border-border p-8 shadow-sm">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  4-Week Intensive Program
                </h3>
                <div className="text-4xl font-bold text-primary mb-2">$497</div>
                <p className="text-muted-foreground">Complete website + training</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">1-on-1 Expert Coaching</span>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Your Own Professional Website</span>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Complete Source Code</span>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Lifetime Access to Materials</span>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">No Monthly Fees Ever</span>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Triple Guarantee Protection</span>
                  <span className="text-green-500">✓</span>
                </div>
              </div>
              
              <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/contact">Start Learning</Link>
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                Limited spots available each month
              </p>
            </div>
          </div>
        </div>
        
        
        {/* Detailed Curriculum Expansion */}
        <div className="mt-16 bg-background border border-border rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            What You'll Learn Each Week
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <h4 className="font-semibold text-foreground">Foundation Week</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• VS Code setup & extensions</li>
                <li>• Git version control basics</li>
                <li>• React component fundamentals</li>
                <li>• JSX syntax and props</li>
                <li>• Your first interactive button</li>
                <li>• Project file structure</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <h4 className="font-semibold text-foreground">Design Week</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Tailwind CSS mastery</li>
                <li>• Responsive design patterns</li>
                <li>• Color schemes & typography</li>
                <li>• Component libraries</li>
                <li>• Mobile-first approach</li>
                <li>• Dark/light mode toggle</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <h4 className="font-semibold text-foreground">Functionality Week</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Contact forms & validation</li>
                <li>• State management with hooks</li>
                <li>• API calls & data fetching</li>
                <li>• Database integration</li>
                <li>• User authentication</li>
                <li>• Dynamic content loading</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <h4 className="font-semibold text-foreground">Launch Week</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Performance optimization</li>
                <li>• SEO setup & meta tags</li>
                <li>• Vercel deployment</li>
                <li>• Custom domain setup</li>
                <li>• SSL certificate config</li>
                <li>• Analytics integration</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              Plus: Lifetime access to our private Discord community and monthly Q&A sessions
            </p>
            <Button 
              size="lg" 
              onClick={() => document.getElementById('build-4-you')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
            >
              Prefer We Build It For You?
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}