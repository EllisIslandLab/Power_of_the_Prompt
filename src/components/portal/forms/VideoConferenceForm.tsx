"use client"

import { useState, FormEvent, ChangeEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, DollarSign } from "lucide-react"

interface VideoConferenceFormProps {
  userEmail: string
  userName: string
  onSuccess?: () => void
}

interface Topic {
  id: string
  title: string
  description: string
}

const TOPICS: Topic[] = [
  {
    id: '1',
    title: 'Account Access and Setup',
    description: '"I have my website built, but how do I gain access to all my accounts (email, Github, Vercel or other host, database like Airtable or Supabase)?"'
  },
  {
    id: '2',
    title: 'API Keys, Tokens, and Environment Variables',
    description: '"OK, I have access to all my accounts, but I\'m having trouble with the tokens, keys, etc. How do I get those right, and what happens if they expire?"'
  },
  {
    id: '3',
    title: 'GitHub and Version Control',
    description: '"I understand my accounts and tokens, but I\'m confused about Git/GitHub. How do I manage my code repository and collaborate?"'
  },
  {
    id: '4',
    title: 'Airtable Integration and Form Setup',
    description: '"I have my site looking great, but how do I allow visitors to interact? How do I set up forms and connect them to Airtable?"'
  },
  {
    id: '5',
    title: 'Vercel Deployment and Hosting',
    description: '"My site works locally, but I need to get it live. How do I deploy to Vercel and manage production environment variables?"'
  },
  {
    id: '6',
    title: 'Next.js Fundamentals and Frontend Development',
    description: '"I want to customize my site\'s look and feel. How do I modify components, styling, and layouts in Next.js?"'
  },
  {
    id: '7',
    title: 'Other Discussion Needs',
    description: 'Have a topic not covered above? Tell me what else you\'d like to discuss.'
  }
]

const MAX_TOPICS = 2
const MAX_CHARS_PER_TOPIC = 500
const MAX_ADDITIONAL_CHARS = 1000

export default function VideoConferenceForm({ userEmail, userName, onSuccess }: VideoConferenceFormProps) {
  const [clientName, setClientName] = useState(userName || '')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [topicDetails, setTopicDetails] = useState<Record<string, string>>({})
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleTopicToggle = (topicId: string, checked: boolean) => {
    if (checked) {
      if (selectedTopics.length >= MAX_TOPICS) {
        setError(`Please select no more than ${MAX_TOPICS} topics.`)
        return
      }
      setSelectedTopics([...selectedTopics, topicId])
      setError('')
    } else {
      setSelectedTopics(selectedTopics.filter(id => id !== topicId))
      // Clear the details for this topic
      const newDetails = { ...topicDetails }
      delete newDetails[topicId]
      setTopicDetails(newDetails)
    }
  }

  const handleTopicDetailChange = (topicId: string, value: string) => {
    if (value.length <= MAX_CHARS_PER_TOPIC) {
      setTopicDetails({
        ...topicDetails,
        [topicId]: value
      })
    }
  }

  const handleAdditionalDetailsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_ADDITIONAL_CHARS) {
      setAdditionalDetails(value)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (selectedTopics.length === 0) {
      setError('Please select at least one topic.')
      return
    }

    if (selectedTopics.length > MAX_TOPICS) {
      setError(`Please select no more than ${MAX_TOPICS} topics.`)
      return
    }

    // Validate each selected topic has details
    for (const topicId of selectedTopics) {
      if (!topicDetails[topicId]?.trim()) {
        const topic = TOPICS.find(t => t.id === topicId)
        setError(`Please provide details for: ${topic?.title}`)
        return
      }
    }

    if (!additionalDetails.trim()) {
      setError('Please provide additional details or questions.')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare topic data
      const topicsData = selectedTopics.map(topicId => {
        const topic = TOPICS.find(t => t.id === topicId)
        return {
          name: topic?.title || '',
          details: topicDetails[topicId] || ''
        }
      })

      const response = await fetch('/api/portal/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formType: 'video-conference',
          clientName,
          clientEmail: userEmail,
          selectedTopics: topicsData,
          additionalDetails
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form')
      }

      setSuccess(true)
      setClientName(userName || '')
      setSelectedTopics([])
      setTopicDetails({})
      setAdditionalDetails('')

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
    setSelectedTopics([])
    setTopicDetails({})
    setAdditionalDetails('')
    setError('')
    setSuccess(false)
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your video conference request has been submitted successfully. I'll review your request and reach out within 1-2 business days to schedule your 40-minute session.
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

      {/* Pricing Info */}
      <Alert className="bg-blue-50 border-blue-300">
        <DollarSign className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900">
          <strong className="block mb-1 text-blue-900">Investment</strong>
          <span className="text-blue-800"><strong>$200</strong> per 40-minute video conference. This covers personalized guidance, code walkthrough, and direct answers to your questions.</span>
        </AlertDescription>
      </Alert>

      {/* Client Name */}
      <div className="space-y-2">
        <Label htmlFor="clientName">
          Your Name <span className="text-red-600">*</span>
        </Label>
        <Input
          id="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
          placeholder="Enter your name"
        />
      </div>

      {/* Topics Selection */}
      <div className="space-y-3">
        <Label>
          Select 1-2 Topics You'd Like to Discuss <span className="text-red-600">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Choose up to 2 topics and provide details for each (500 character limit per topic). I'll cover them thoroughly during your 40-minute session.
        </p>

        <div className="space-y-3 mt-4">
          {TOPICS.map((topic) => (
            <div key={topic.id} className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`topic-${topic.id}`}
                  checked={selectedTopics.includes(topic.id)}
                  onCheckedChange={(checked) => handleTopicToggle(topic.id, checked as boolean)}
                  disabled={!selectedTopics.includes(topic.id) && selectedTopics.length >= MAX_TOPICS}
                />
                <div className="flex-1">
                  <label
                    htmlFor={`topic-${topic.id}`}
                    className="text-sm font-semibold cursor-pointer select-none block mb-1"
                  >
                    {topic.id}. {topic.title}
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    {topic.description}
                  </p>

                  {/* Show textarea when topic is selected */}
                  {selectedTopics.includes(topic.id) && (
                    <div className="space-y-1 mt-3 pt-3 border-t">
                      <Textarea
                        value={topicDetails[topic.id] || ''}
                        onChange={(e) => handleTopicDetailChange(topic.id, e.target.value)}
                        placeholder={`Tell me specifically what you need help with regarding ${topic.title.toLowerCase()}.`}
                        className="min-h-[80px] resize-y text-sm"
                        maxLength={MAX_CHARS_PER_TOPIC}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        <span className={(topicDetails[topic.id]?.length || 0) > MAX_CHARS_PER_TOPIC - 50 ? 'text-orange-600 font-medium' : ''}>
                          {topicDetails[topic.id]?.length || 0}
                        </span>
                        /{MAX_CHARS_PER_TOPIC} characters
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Selected: {selectedTopics.length} of {MAX_TOPICS} topics
        </p>
      </div>

      {/* Additional Details */}
      <div className="space-y-2">
        <Label htmlFor="additionalDetails">
          Additional Details or Other Questions <span className="text-red-600">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Use this space to share any additional questions or details not covered by your selected topics above. (Maximum 1000 characters)
        </p>
        <Textarea
          id="additionalDetails"
          value={additionalDetails}
          onChange={handleAdditionalDetailsChange}
          required
          placeholder="Share any additional questions, context, or information that will help me prepare for your session."
          className="min-h-[120px] resize-y"
          maxLength={MAX_ADDITIONAL_CHARS}
        />
        <p className="text-xs text-muted-foreground text-right">
          <span className={additionalDetails.length > MAX_ADDITIONAL_CHARS - 100 ? 'text-orange-600 font-medium' : ''}>
            {additionalDetails.length}
          </span>
          /{MAX_ADDITIONAL_CHARS} characters
        </p>
      </div>

      {/* Confirmation Notice */}
      <Alert className="bg-orange-50 border-orange-300">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-sm text-orange-900">
          <strong className="block mb-1 text-orange-900">Before You Submit</strong>
          <span className="text-orange-800">Please make sure you've selected up to 2 topics and provided specific details for each. Include any additional questions in the "Additional Details" section above. This helps me prepare thoroughly for your 40-minute session. After submission, I'll reach out within 1-2 business days to confirm your preferred meeting time.</span>
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
            'Submit Conference Request'
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
