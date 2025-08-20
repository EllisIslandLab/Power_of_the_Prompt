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

          {/* Technical Excellence Guarantee */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                TECHNICAL EXCELLENCE GUARANTEE
              </h3>
              <p className="text-gray-700 font-medium">
                This isn't just a course—it's a comprehensive success partnership
              </p>
            </div>
            
            <div className="bg-white rounded-lg border border-amber-200 p-6 mb-6">
              <p className="text-gray-800 font-medium mb-4">
                If independent audits* reveal persistent issues that fail to meet our standards for more than three consecutive monthly audits within the 12 months of free auditing provided after your site is built, we will buy your site back for what you paid.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Performance Standards:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Load times under 3 seconds
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      SEO scores A- or better
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Zero security vulnerabilities
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Usability scores A- or better
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Our Response Process:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      <span>First audit failure: Free optimization session to address issues</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-orange-100 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <span>Second consecutive failure: Detailed remediation plan with step-by-step fixes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                      <span>Third consecutive failure: Buyback guarantee activates - we purchase your site for full course price</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h4 className="font-semibold text-gray-800 mb-3">Audit Details:</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>• Monthly audits using PageSpeed Insights, SEMrush, and industry-standard security scanners</p>
                <p>• Excludes issues caused by third-party integrations or hosting changes</p>
                <p>• 12 months of monitoring included with your course</p>
                <p className="font-medium text-blue-800">*12 months of free monthly audits = $3,600+ value included!</p>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">4-Week Intensive Program</h3>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600">$1599</div>
              <p className="text-gray-600">Complete website + training + 12 months audits</p>
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
              <div className="text-center text-sm font-semibold text-blue-600 mt-4">Technical Excellence Guaranteed ✓✓✓</div>
              <div className="text-center text-xs text-gray-600">(Enhanced guarantee terms above)</div>
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
              *Enhanced guarantees apply only to committed students who enroll before consultation. 
              <br />
              Standard guarantee terms available for all other students.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}