'use client'

import { useState, useEffect } from 'react'

interface Step2Props {
  data: any
  onChange: (data: any) => void
}

export function Step2CategorySelection({ data, onChange }: Step2Props) {
  const [selectedCategory, setSelectedCategory] = useState(data.businessCategory || '')

  // Hardcoded categories for now - in Phase 2 this will come from Supabase
  const categories = [
    {
      id: 'personal-finance',
      name: 'Personal Finance',
      icon: '💰',
      description: 'For financial coaches, advisors, and Ramsey Preferred Coaches'
    },
    {
      id: 'health-wellness',
      name: 'Health & Wellness',
      icon: '🏃',
      description: 'Fitness trainers, yoga instructors, nutritionists'
    },
    {
      id: 'professional-services',
      name: 'Professional Services',
      icon: '💼',
      description: 'Consultants, lawyers, accountants, real estate agents'
    },
    {
      id: 'creative',
      name: 'Creative Services',
      icon: '🎨',
      description: 'Designers, photographers, writers, artists'
    },
    {
      id: 'local-business',
      name: 'Local Business',
      icon: '🏪',
      description: 'Restaurants, retail stores, service providers'
    },
    {
      id: 'other',
      name: 'Other',
      icon: '✨',
      description: 'Something unique? We can build it!'
    }
  ]

  useEffect(() => {
    onChange({ businessCategory: selectedCategory })
  }, [selectedCategory])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">What Type of Business Are You?</h2>
        <p className="text-gray-600">
          This helps us suggest the right components for your website
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`
              p-6 rounded-lg border-2 text-left transition-all
              ${selectedCategory === category.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{category.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
              {selectedCategory === category.id && (
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
