"use client"

import { useState, FormEvent, ChangeEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface RevisionModifierFormProps {
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

const REVISION_STATUSES = [
  { id: 'modifying', label: 'Modifying existing requests (removing or changing what was requested)' },
  { id: 'adding', label: 'Adding new minor changes (within the 5-change limit)' },
  { id: 'both', label: 'Both modifying and adding' }
]

const MAX_CHARS = 2000

export default function RevisionModifierForm({ userEmail, userName, onSuccess }: RevisionModifierFormProps) {
  const [clientName, setClientName] = useState(userName || '')
  const [revisionStatus, setRevisionStatus] = useState('')
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

    if (!revisionStatus) {
      setError('Please select a revision status.')
      return
    }

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
          formType: 'revision-modifier',
          clientName,
          clientEmail: userEmail,
          revisionStatus,
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
      setRevisionStatus('')
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
    setRevisionStatus('')
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
          Your revision modification request has been submitted successfully. These services are usually completed within 5 business days.
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

      {/* Revision Status */}
      <div className="space-y-3">
        <Label>
          Are you modifying your Revision Start requests, adding new requests, or both? <span className="text-red-600">*</span>
        </Label>
        <RadioGroup value={revisionStatus} onValueChange={setRevisionStatus}>
          <div className="space-y-3">
            {REVISION_STATUSES.map((status) => (
              <div key={status.id} className="flex items-start space-x-3">
                <RadioGroupItem value={status.id} id={`status-${status.id}`} />
                <label
                  htmlFor={`status-${status.id}`}
                  className="text-sm leading-relaxed cursor-pointer select-none"
                >
                  {status.label}
                </label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Change Types */}
      <div className="space-y-3">
        <Label>
          Select the types of changes for this modifier round <span className="text-red-600">*</span>
        </Label>
        <div className="space-y-3">
          {CHANGE_TYPES.map((change) => (
            <div key={change.id} className="flex items-start space-x-3">
              <Checkbox
                id={`modifier-${change.id}`}
                checked={selectedChanges.includes(change.id)}
                onCheckedChange={(checked) => handleCheckboxChange(change.id, checked as boolean)}
              />
              <label
                htmlFor={`modifier-${change.id}`}
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
          If modifying previous requests, clearly indicate what should change from your Revision Start submission. Be specific about what you'd like modified and where on your website. This section will be used to implement your changes.
        </p>
        <Textarea
          id="detailedInstructions"
          value={detailedInstructions}
          onChange={handleTextareaChange}
          required
          placeholder="Example: I'd like to revert the hero heading back to just 'Welcome' (removing the business name addition from the Revision Start round). Also, please add a new section on the homepage with recent testimonials."
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
            'Submit Modifier Request'
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
