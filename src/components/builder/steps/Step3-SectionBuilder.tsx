'use client'

import { useState, useEffect } from 'react'

interface Step3Props {
  data: any
  onChange: (data: any) => void
  sessionId: string
  builderType: 'free' | 'ai_premium'
}

export function Step3SectionBuilder({ data, onChange, sessionId, builderType }: Step3Props) {
  const [sections, setSections] = useState(data.sections || [])

  useEffect(() => {
    onChange({ sections })
  }, [sections])

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      purpose: 'content',
      componentType: '',
      content: ''
    }
    setSections([...sections, newSection])
  }

  const removeSection = (id: string) => {
    setSections(sections.filter((s: any) => s.id !== id))
  }

  const updateSection = (id: string, updates: any) => {
    setSections(sections.map((s: any) =>
      s.id === id ? { ...s, ...updates } : s
    ))
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Build Your Page Sections</h2>
        <p className="text-gray-600">
          Add sections to create your website. Each section serves a specific purpose.
        </p>
        {builderType === 'ai_premium' && (
          <div className="mt-4 text-sm text-blue-600">
            💡 Describe what you want in natural language - AI will create it for you!
          </div>
        )}
      </div>

      {sections.map((section: any, index: number) => (
        <div
          key={section.id}
          className="border-2 border-gray-200 rounded-lg p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Section {index + 1}
              {index === 0 && <span className="text-red-500 ml-2">*Required</span>}
            </h3>
            {index > 0 && (
              <button
                onClick={() => removeSection(section.id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                What is this section for?
              </label>
              <select
                value={section.purpose}
                onChange={(e) => updateSection(section.id, { purpose: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="content">Content (text, images, info)</option>
                <option value="tools">Tools (calculator, form, booking)</option>
                <option value="collection">Collection (testimonials, gallery)</option>
                <option value="visual">Visual (hero, banner, divider)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Describe what you want {builderType === 'ai_premium' && '(AI will generate it)'}
              </label>
              <textarea
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                placeholder={
                  builderType === 'ai_premium'
                    ? 'E.g., "A hero section with my business name, tagline, and a call-to-action button"'
                    : 'E.g., "Hero section with headline and CTA button"'
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addSection}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600 font-semibold"
      >
        + Add Another Section
      </button>

      {sections.length > 5 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          ⚠️ Pages with more than 5 sections may feel overwhelming to visitors. Consider keeping it focused!
        </div>
      )}
    </div>
  )
}
