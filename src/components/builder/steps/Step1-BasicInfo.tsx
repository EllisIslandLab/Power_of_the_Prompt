'use client'

import { useState, useEffect } from 'react'

interface Step1Props {
  data: any
  onChange: (data: any) => void
  builderType: 'free' | 'ai_premium'
}

export function Step1BasicInfo({ data, onChange, builderType }: Step1Props) {
  const [formData, setFormData] = useState({
    businessName: data.businessName || '',
    email: data.email || '',
    tagline: data.tagline || '',
    phone: data.phone || '',
    location: data.location || ''
  })

  useEffect(() => {
    onChange(formData)
  }, [formData])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Let&#39;s Start With the Basics</h2>
        <p className="text-gray-600">
          Tell us about your business so we can create your perfect website
        </p>
        {builderType === 'ai_premium' && (
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-sm text-blue-700">
            <span>⚡</span>
            <span>AI Premium Mode Active - 30 enhancements available</span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="businessName" className="block text-sm font-medium mb-2">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="businessName"
          value={formData.businessName}
          onChange={(e) => handleChange('businessName', e.target.value)}
          placeholder="e.g., Smith Financial Coaching"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          We&#39;ll email you a link to access and download your site
        </p>
      </div>

      <div>
        <label htmlFor="tagline" className="block text-sm font-medium mb-2">
          Tagline or Headline
        </label>
        <input
          type="text"
          id="tagline"
          value={formData.tagline}
          onChange={(e) => handleChange('tagline', e.target.value)}
          placeholder="e.g., Taking Control of Your Financial Future"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="City, State"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
