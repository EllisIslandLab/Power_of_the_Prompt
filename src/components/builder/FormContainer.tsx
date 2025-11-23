'use client'

import { useState, useEffect } from 'react'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { SaveIndicator } from '@/components/shared/SaveIndicator'
import { StepCategory } from './steps/StepCategory'
import { StepBusinessInfo } from './steps/StepBusinessInfo'
import { StepPreview } from './steps/StepPreview'

interface FormContainerProps {
  sessionId: string
  initialData?: any
}

export function FormContainer({ sessionId, initialData }: FormContainerProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<any>(initialData || {})
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const totalSteps = 3

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

  async function handleNext() {
    // Validate required fields
    if (currentStep === 1) {
      if (!formData.categoryId && !formData.customCategory) {
        alert('Please select a category or enter a custom one')
        return
      }
    } else if (currentStep === 2) {
      if (!formData.businessName) {
        alert('Please enter your business name')
        return
      }
    }

    if (currentStep < totalSteps) {
      // If moving to preview step, generate the preview
      if (currentStep === 2) {
        setIsGenerating(true)
        try {
          const response = await fetch(`/api/sessions/${sessionId}/generate-preview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          })

          if (!response.ok) {
            throw new Error('Failed to generate preview')
          }

          const { previewHtml } = await response.json()
          setFormData((prev: any) => ({ ...prev, previewHtml }))
        } catch (error) {
          console.error('Error generating preview:', error)
          alert('Failed to generate preview. Please try again.')
          setIsGenerating(false)
          return
        }
        setIsGenerating(false)
      }

      setCurrentStep(currentStep + 1)
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
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">
              {currentStep === 3 ? 'Your Preview is Ready!' : 'Build Your Website'}
            </h1>
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
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          {currentStep === 1 && (
            <StepCategory
              data={formData}
              onChange={updateFormData}
            />
          )}

          {currentStep === 2 && (
            <StepBusinessInfo
              data={formData}
              onChange={updateFormData}
            />
          )}

          {currentStep === 3 && (
            <StepPreview
              sessionId={sessionId}
              data={formData}
              onChange={updateFormData}
            />
          )}
        </div>

        {/* Navigation - Hide on preview step (it has its own CTAs) */}
        {currentStep < 3 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-border rounded-lg font-semibold text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={isGenerating}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow-md transition-all disabled:opacity-50 hover:border-2 hover:border-accent"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Generating Preview...
                </span>
              ) : currentStep === 2 ? (
                'Generate My Preview'
              ) : (
                'Next'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
