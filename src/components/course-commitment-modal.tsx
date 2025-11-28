"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Clock, DollarSign, X, Star } from "lucide-react"

interface CourseCommitmentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CourseCommitmentModal({ isOpen, onClose }: CourseCommitmentModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Ready to Start Your Website Journey?
              </h2>
              <p className="text-xl text-muted-foreground">
                Commitment before consultation gives you priority access and exclusive benefits
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Priority Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">Priority Student Benefits</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Priority course booking/seating</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Guaranteed next available cohort spot</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Early access to course materials</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Enhanced Technical Excellence Guarantee (see below)</span>
              </div>
            </div>
          </div>

          {/* Triple Guarantee */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                OUR TRIPLE GUARANTEE
              </h3>
              <p className="text-gray-700 font-medium">
                This isn't just a course—it's a comprehensive success partnership
              </p>
            </div>

            <div className="bg-white rounded-lg border border-amber-200 p-6 mb-6">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-gray-800">Fully-Functional Site</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    Within 2 weeks after completing the 8-week course program, you'll have a live, hosted website with contact forms, responsive design, and professional functionality.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-800">90+ Lighthouse Scores</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    Your website will achieve 90+ scores on Google Lighthouse for Performance, Accessibility, Best Practices, and SEO.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-800">1 Year Basic Support</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    One full year of basic support including SEO, Best Practices, Performance, and Accessibility testing and consultation via email.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  <h4 className="font-semibold text-gray-800">Money Back Guarantee</h4>
                </div>
                <p className="text-sm text-gray-700">
                  If we fail to deliver on all three guarantees above, you'll receive a <strong>full refund</strong> of your course fee. We're committed to your success.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
              <p className="text-sm text-gray-700">
                <Link href="/guarantee" className="text-primary hover:text-primary/80 underline font-semibold">
                  View complete guarantee details and terms →
                </Link>
              </p>
            </div>
          </div>

          {/* Course Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">8-Week Course Program</h3>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600">$1599</div>
              <p className="text-gray-600">Complete website + training + 1 year basic support</p>
            </div>
            
            <div className="space-y-3">
              <div className="text-center text-sm text-gray-600 mb-4">Graduate with:</div>
              <div className="grid md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-800 text-sm">Fully Functional Website</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-800 text-sm">Source Code Ownership</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-800 text-sm">Lifetime Access to Materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-800 text-sm">Lifetime Access to Community</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">✗</span>
                  <span className="text-gray-800 text-sm">No Additional Costs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">✗</span>
                  <span className="text-gray-800 text-sm">No Monthly Fees</span>
                </div>
              </div>
              <div className="text-center text-sm font-semibold text-blue-600 mt-4">Triple Guarantee Protection ✓✓✓</div>
              <div className="text-center text-xs text-gray-600">
                <Link href="/guarantee" className="text-primary hover:text-primary/80 underline">
                  View complete guarantee terms
                </Link>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/contact">
                Commit Now - Priority Access
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              asChild
            >
              <Link href="/consultation">
                Free Consultation First
              </Link>
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              *Priority benefits apply to committed students who enroll before consultation.
              <br />
              All students receive our Triple Guarantee protection.{' '}
              <Link href="/guarantee" className="text-primary hover:text-primary/80 underline">
                View details
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}