"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Clock, Award } from "lucide-react"
import { CourseCommitmentModal } from "@/components/course-commitment-modal"

export function BuildWithYou() {
  const [showCommitmentModal, setShowCommitmentModal] = useState(false)
  
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
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Learn by doing. In just 8 weeks, you'll build a professional website using modern web technologies, with our expert guidance every step of the way.
          </p>
          <p className="text-lg font-semibold text-primary max-w-2xl mx-auto mb-8">
            This isn't just a course—it's a comprehensive success partnership
          </p>
          
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
                  8-Week Intensive Program
                </h3>
                <div className="text-4xl font-bold text-primary mb-2">$1599</div>
                <p className="text-muted-foreground">Complete website + training</p>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="text-center text-sm text-muted-foreground mb-4">Graduate with:</div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">✓ Fully Functional Website</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">✓ Source Code Ownership</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">✓ Lifetime Access to Materials</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">✓ Lifetime Access to Community</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">✗ No Additional Costs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">✗ No Monthly Fees</span>
                </div>
                <div className="text-center text-sm font-semibold text-primary mt-4">All 100% Guaranteed ✓✓✓</div>
                <div className="text-center text-xs text-muted-foreground">(See inside for our 3X-Guarantee & other details)</div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => setShowCommitmentModal(true)}
              >
                Start Learning
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                Limited spots available each month
              </p>
            </div>
          </div>
        </div>
        
        
      </div>
      
      <CourseCommitmentModal 
        isOpen={showCommitmentModal}
        onClose={() => setShowCommitmentModal(false)}
      />
    </section>
  )
}