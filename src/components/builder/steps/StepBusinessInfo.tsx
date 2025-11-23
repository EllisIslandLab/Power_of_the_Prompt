'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Building2, MessageSquare, Target, Palette, LayoutGrid } from 'lucide-react'

interface StepBusinessInfoProps {
  data: any
  onChange: (data: any) => void
}

const COLOR_PALETTES = [
  { id: 'professional', name: 'Professional', colors: ['#1e3a8a', '#3b82f6', '#f8fafc'], description: 'Blue & White' },
  { id: 'modern', name: 'Modern', colors: ['#18181b', '#6366f1', '#f4f4f5'], description: 'Dark & Purple' },
  { id: 'warm', name: 'Warm', colors: ['#7c2d12', '#f97316', '#fffbeb'], description: 'Orange & Cream' },
  { id: 'nature', name: 'Nature', colors: ['#14532d', '#22c55e', '#f0fdf4'], description: 'Green & White' },
  { id: 'elegant', name: 'Elegant', colors: ['#1c1917', '#a8a29e', '#fafaf9'], description: 'Stone & Black' },
  { id: 'vibrant', name: 'Vibrant', colors: ['#be185d', '#f472b6', '#fdf2f8'], description: 'Pink & Rose' },
]

const SECTION_COUNTS = [
  { value: 3, label: '3 Sections', description: 'Simple & focused' },
  { value: 5, label: '5 Sections', description: 'Balanced (recommended)' },
  { value: 7, label: '7 Sections', description: 'Comprehensive' },
]

const TARGET_AUDIENCES = [
  'Small business owners',
  'Enterprise clients',
  'Consumers (B2C)',
  'Other professionals',
  'Students/Learners',
  'Creative professionals',
]

export function StepBusinessInfo({ data, onChange }: StepBusinessInfoProps) {
  function updateField(field: string, value: any) {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Tell us about your business
        </h2>
        <p className="text-muted-foreground">
          This information goes directly into your website
        </p>
      </div>

      {/* Business Name */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Building2 className="h-4 w-4" />
          Business Name <span className="text-destructive">*</span>
        </label>
        <Input
          type="text"
          placeholder="Your Business Name"
          value={data.businessName || ''}
          onChange={(e) => updateField('businessName', e.target.value)}
          className="text-lg"
        />
      </div>

      {/* Tagline */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="h-4 w-4" />
          Tagline
        </label>
        <Input
          type="text"
          placeholder="A short phrase that captures what you do"
          value={data.tagline || ''}
          onChange={(e) => updateField('tagline', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Example: "Helping families build wealth, one budget at a time"
        </p>
      </div>

      {/* Primary Service */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Target className="h-4 w-4" />
          Primary Service or Product
        </label>
        <Textarea
          placeholder="What's the main thing you offer? Be specific."
          value={data.primaryService || ''}
          onChange={(e) => updateField('primaryService', e.target.value)}
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          Example: "12-week coaching program for debt elimination"
        </p>
      </div>

      {/* Target Audience */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Target className="h-4 w-4" />
          Target Audience
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {TARGET_AUDIENCES.map((audience) => (
            <button
              key={audience}
              onClick={() => updateField('targetAudience', audience)}
              className={`p-3 rounded-lg border text-sm text-left transition-all ${
                data.targetAudience === audience
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 text-muted-foreground'
              }`}
            >
              {audience}
            </button>
          ))}
        </div>
      </div>

      {/* Number of Sections */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <LayoutGrid className="h-4 w-4" />
          Number of Sections
        </label>
        <div className="grid grid-cols-3 gap-3">
          {SECTION_COUNTS.map((option) => (
            <button
              key={option.value}
              onClick={() => updateField('numSections', option.value)}
              className={`p-4 rounded-lg border text-center transition-all ${
                (data.numSections || 5) === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="font-bold text-lg text-foreground block">
                {option.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Palette className="h-4 w-4" />
          Color Palette
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COLOR_PALETTES.map((palette) => (
            <button
              key={palette.id}
              onClick={() => updateField('colorPalette', palette.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                (data.colorPalette || 'professional') === palette.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex gap-1 mb-2">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="font-medium text-sm text-foreground block">
                {palette.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {palette.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Optional: Additional Info */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Anything else? <span className="text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          placeholder="Any specific features, style preferences, or inspiration?"
          value={data.additionalInfo || ''}
          onChange={(e) => updateField('additionalInfo', e.target.value)}
          rows={3}
        />
        <p className="text-xs text-accent">
          AI will use this to better customize your preview
        </p>
      </div>
    </div>
  )
}
