'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { FolderOpen, Plus, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
}

interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
}

interface StepCategoryProps {
  data: any
  onChange: (data: any) => void
}

export function StepCategory({ data, onChange }: StepCategoryProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(data.categoryId || null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(data.subcategoryId || null)
  const [showCustomInput, setShowCustomInput] = useState(!!data.customCategory)
  const [customCategory, setCustomCategory] = useState(data.customCategory || '')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Fetch subcategories when category changes
  useEffect(() => {
    async function fetchSubcategories() {
      if (!selectedCategory) {
        setSubcategories([])
        return
      }

      try {
        const response = await fetch(`/api/categories/${selectedCategory}/subcategories`)
        if (response.ok) {
          const data = await response.json()
          setSubcategories(data.subcategories || [])
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error)
      }
    }

    fetchSubcategories()
  }, [selectedCategory])

  function handleCategorySelect(categoryId: string) {
    setSelectedCategory(categoryId)
    setSelectedSubcategory(null)
    setShowCustomInput(false)
    setCustomCategory('')
    onChange({
      categoryId,
      subcategoryId: null,
      customCategory: null
    })
  }

  function handleSubcategorySelect(subcategoryId: string) {
    setSelectedSubcategory(subcategoryId)
    onChange({
      categoryId: selectedCategory,
      subcategoryId,
      customCategory: null
    })
  }

  function handleCustomCategory() {
    setShowCustomInput(true)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    onChange({
      categoryId: null,
      subcategoryId: null,
      customCategory: ''
    })
  }

  function handleCustomCategoryChange(value: string) {
    setCustomCategory(value)
    onChange({
      categoryId: null,
      subcategoryId: null,
      customCategory: value
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          What type of website do you need?
        </h2>
        <p className="text-muted-foreground">
          Select a category to get tailored components and design
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
              selectedCategory === category.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="text-2xl mb-2 block">{category.icon}</span>
            <span className="font-medium text-sm text-foreground block">
              {category.name.replace(' Website', '')}
            </span>
          </button>
        ))}

        {/* Create New Option */}
        <button
          onClick={handleCustomCategory}
          className={`p-4 rounded-xl border-2 border-dashed text-left transition-all hover:shadow-md ${
            showCustomInput
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-accent/50'
          }`}
        >
          <Plus className="h-6 w-6 mb-2 text-accent" />
          <span className="font-medium text-sm text-foreground block">
            Create New
          </span>
        </button>
      </div>

      {/* Custom Category Input */}
      {showCustomInput && (
        <div className="bg-accent/10 p-4 rounded-xl border border-accent/30">
          <label className="block text-sm font-medium text-foreground mb-2">
            Describe your website type
          </label>
          <Input
            type="text"
            placeholder="e.g., Pet grooming service, Local bakery, Freelance writer..."
            value={customCategory}
            onChange={(e) => handleCustomCategoryChange(e.target.value)}
            className="bg-card"
          />
          <p className="mt-2 text-xs text-accent">
            AI will analyze this to suggest the best components
          </p>
        </div>
      )}

      {/* Subcategory Selection */}
      {selectedCategory && subcategories.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            Choose a specific type
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubcategorySelect(sub.id)}
                className={`p-3 rounded-lg border text-left text-sm transition-all ${
                  selectedSubcategory === sub.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 text-muted-foreground'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {(selectedSubcategory || customCategory) && (
        <div className="bg-green-600/10 p-4 rounded-xl border border-green-600/30">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <FolderOpen className="h-5 w-5" />
            <span className="font-medium">
              {customCategory ? (
                <>Custom: {customCategory}</>
              ) : (
                <>
                  {categories.find(c => c.id === selectedCategory)?.name} →{' '}
                  {subcategories.find(s => s.id === selectedSubcategory)?.name}
                </>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
