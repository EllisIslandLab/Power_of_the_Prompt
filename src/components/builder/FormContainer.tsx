'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { SaveIndicator } from '@/components/shared/SaveIndicator'
import { Step1BasicInfo } from './steps/Step1-BasicInfo'
import { Step2CategorySelection } from './steps/Step2-CategorySelection'
import { Step3SectionBuilder } from './steps/Step3-SectionBuilder'
import { Step4Review } from './steps/Step4-Review'

interface FormContainerProps {
  sessionId: string
  builderType: 'free' | 'ai_premium'
}

export function FormContainer({ sessionId, builderType }: FormContainerProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const totalSteps = 4

  // Auto-save to localStorage
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem(`session-${sessionId}`, JSON.stringify({
        currentStep,
        formData,
        lastSaved: new Date()
      }))
    }, 500)

    return () => clearTimeout(saveTimer)
  }, [formData, currentStep, sessionId])

  // Auto-save to Supabase (debounced)
  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      setIsSaving(true)

      try {
        await fetch(`/api/sessions/${sessionId}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentStep,
            formData
          })
        })

        setLastSaved(new Date())
      } catch (error) {
        console.error('Error saving:', error)
      } finally {
        setIsSaving(false)
      }
    }, 2000)

    return () => clearTimeout(saveTimer)
  }, [formData, currentStep, sessionId])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`session-${sessionId}`)
    if (saved) {
      const { currentStep: savedStep, formData: savedData } = JSON.parse(saved)
      setCurrentStep(savedStep)
      setFormData(savedData)
    }
  }, [sessionId])

  function handleNext() {
    // Validate required fields
    if (currentStep === 1) {
      if (!formData.businessName || !formData.email) {
        alert('Please fill in Business Name and Email')
        return
      }
    } else if (currentStep === 2) {
      if (!formData.businessCategory) {
        alert('Please select a business category')
        return
      }
    } else if (currentStep === 3) {
      if (!formData.sections || formData.sections.length === 0) {
        alert('Please add at least one section')
        return
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final step - redirect to preview generation
      router.push(`/get-started/build/${sessionId}/preview`)
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  function updateFormData(stepData: any) {
    setFormData((prev: any) => ({ ...prev, ...stepData }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Build Your Website</h1>
            <SaveIndicator
              isSaving={isSaving}
              lastSaved={lastSaved}
            />
          </div>
          <ProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          {currentStep === 1 && (
            <Step1BasicInfo
              data={formData}
              onChange={updateFormData}
              builderType={builderType}
            />
          )}

          {currentStep === 2 && (
            <Step2CategorySelection
              data={formData}
              onChange={updateFormData}
            />
          )}

          {currentStep === 3 && (
            <Step3SectionBuilder
              data={formData}
              onChange={updateFormData}
              sessionId={sessionId}
              builderType={builderType}
            />
          )}

          {currentStep === 4 && (
            <Step4Review
              data={formData}
              onChange={updateFormData}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-border rounded-lg font-semibold text-foreground hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 shadow-md transition-colors"
          >
            {currentStep === totalSteps ? 'Generate Preview →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
