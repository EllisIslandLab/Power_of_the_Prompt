"use client"

import { useState, FormEvent, ChangeEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface RevisionStartFormProps {
  userEmail: string
  userName: string
  onSuccess?: () => void
}

const CHANGE_TYPES = [
  { id: 'text', label: 'Text or content updates (wording, phrasing, grammar corrections)' },
  { id: 'images', label: 'Image additions, replacements, or updates' },
  { id: 'styling', label: 'Color, font, or styling adjustments' },
  { id: 'layout', label: 'Layout refinements or spacing adjustments' },
  { id: 'positioning', label: 'Visibility or positioning changes to existing elements' }
]

const MAX_CHARS = 2000

export default function RevisionStartForm({ userEmail, userName, onSuccess }: RevisionStartFormProps) {
  const [clientName, setClientName] = useState(userName || '')
  const [selectedChanges, setSelectedChanges] = useState<string[]>([])
  const [detailedInstructions, setDetailedInstructions] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const charCount = detailedInstructions.length

  const handleCheckboxChange = (changeId: string, checked: boolean) => {
    if (checked) {
      setSelectedChanges([...selectedChanges, changeId])
    } else {
      setSelectedChanges(selectedChanges.filter(id => id !== changeId))
    }
  }

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_CHARS) {
      setDetailedInstructions(value)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedChanges.length === 0) {
      setError('Please select at least one type of change.')
      return
    }

    if (!detailedInstructions.trim()) {
      setError('Please provide detailed instructions.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/portal/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formType: 'revision-start',
          clientName,
          clientEmail: userEmail,
          selectedItems: selectedChanges,
          detailedInstructions
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form')
      }

      setSuccess(true)
      setClientName(userName || '')
      setSelectedChanges([])
      setDetailedInstructions('')

      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setClientName(userName || '')
    setSelectedChanges([])
    setDetailedInstructions('')
    setError('')
    setSuccess(false)
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your revision request has been submitted successfully. These services are usually completed within 5 business days.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Client Name */}
      <div className="space-y-2">
        <Label htmlFor="clientName">
          Client Name <span className="text-red-600">*</span>
        </Label>
        <Input
          id="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
          placeholder="Enter your name"
        />
      </div>

      {/* Change Types */}
      <div className="space-y-3">
        <Label>
          Select the types of changes you'd like in this round <span className="text-red-600">*</span>
        </Label>
        <div className="space-y-3">
          {CHANGE_TYPES.map((change) => (
            <div key={change.id} className="flex items-start space-x-3">
              <Checkbox
                id={change.id}
                checked={selectedChanges.includes(change.id)}
                onCheckedChange={(checked) => handleCheckboxChange(change.id, checked as boolean)}
              />
              <label
                htmlFor={change.id}
                className="text-sm leading-relaxed cursor-pointer select-none"
              >
                {change.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Instructions */}
      <div className="space-y-2">
        <Label htmlFor="detailedInstructions">
          Detailed Instructions <span className="text-red-600">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Provide specific details about what you'd like modified and where on your website. Be as detailed as possible—this will be used to implement your changes.
        </p>
        <Textarea
          id="detailedInstructions"
          value={detailedInstructions}
          onChange={handleTextareaChange}
          required
          placeholder="Example: On the homepage, change the hero section heading from 'Welcome' to 'Welcome to [Your Business Name]'. Also update the button color from blue to navy on all pages."
          className="min-h-[150px] resize-y"
          maxLength={MAX_CHARS}
        />
        <p className="text-xs text-muted-foreground text-right">
          <span className={charCount > MAX_CHARS - 100 ? 'text-orange-600 font-medium' : ''}>
            {charCount}
          </span>
          /{MAX_CHARS} characters
        </p>
      </div>

      {/* Important Notice */}
      <Alert className="bg-orange-50 border-orange-300">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-sm text-orange-900">
          <strong className="block mb-1 text-orange-900">Important Note</strong>
          <span className="text-orange-800"><strong>Major features</strong> such as new contact forms, database integrations, API connections, new functionality, custom animations, or conditional logic are <strong>not included</strong> in this revision package and will be billed separately at <strong>$250 per feature</strong> per Section 4.10 of your contract.</span>
        </AlertDescription>
      </Alert>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Revision Request'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isSubmitting}
          className="flex-1"
        >
          Clear Form
        </Button>
      </div>
    </form>
  )
}
