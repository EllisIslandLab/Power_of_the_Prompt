'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoryNode } from '@/components/category-selector/CategoryNode';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
}

function GetStartedPhase2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Record<string, Subcategory[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [synonymSuggestion, setSynonymSuggestion] = useState<{ name: string; id: string } | null>(null);

  // Pre-fetch categories and ALL subcategories on page load
  useEffect(() => {
    async function loadCategoriesAndSubcategories() {
      try {
        // Load categories
        const categoriesResponse = await fetch('/api/categories/list');
        const categoriesData = await categoriesResponse.json();

        if (categoriesData.success) {
          setCategories(categoriesData.categories);

          // Pre-fetch subcategories for all categories
          const subcategoriesMap: Record<string, Subcategory[]> = {};

          await Promise.all(
            categoriesData.categories.map(async (category: Category) => {
              try {
                const subcatsResponse = await fetch(`/api/categories/subcategories?categoryId=${category.id}`);
                const subcatsData = await subcatsResponse.json();

                if (subcatsData.success) {
                  subcategoriesMap[category.id] = subcatsData.subcategories;
                }
              } catch (error) {
                console.error(`Error loading subcategories for ${category.id}:`, error);
                subcategoriesMap[category.id] = [];
              }
            })
          );

          setAllSubcategories(subcategoriesMap);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategoriesAndSubcategories();
  }, []);

  function handleCategoryClick(categoryId: string) {
    if (categoryId === 'custom') {
      setIsCustom(true);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setIsCustomSubcategory(false);
      setCustomSubcategory('');
    } else {
      // Toggle selection
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setIsCustomSubcategory(false);
        setCustomSubcategory('');
      } else {
        setIsCustom(false);
        setSelectedCategory(categoryId);
        setSelectedSubcategory(null);
        setIsCustomSubcategory(false);
        setCustomSubcategory('');
      }
    }
    setDuplicateWarning(null);
    setSynonymSuggestion(null);
  }

  // Get subcategories to display - all for hover and selected
  const getDisplaySubcategories = (categoryId: string) => {
    if (!categoryId || categoryId === 'custom') return [];
    return allSubcategories[categoryId] || [];
  };

  async function handleContinue() {
    // Get stored round1 data
    const storedData = localStorage.getItem('threeRoundForm');
    if (!storedData) {
      router.push('/get-started');
      return;
    }

    const formData = JSON.parse(storedData);

    // Check for duplicates if custom category or subcategory
    if (isCustom || isCustomSubcategory) {
      const checkResponse = await fetch('/api/categories/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryName: isCustom ? customCategory : undefined,
          subcategoryName: isCustomSubcategory ? customSubcategory : undefined,
          categoryId: selectedCategory
        })
      });

      const checkResult = await checkResponse.json();

      if (checkResult.isDuplicate) {
        setDuplicateWarning(`"${checkResult.duplicateName}" already exists`);
        return;
      }

      if (checkResult.synonym) {
        setSynonymSuggestion({
          name: checkResult.synonym.name,
          id: checkResult.synonym.id
        });
        return;
      }
    }

    // Update with category selection
    const updatedData = {
      ...formData,
      round2: {
        categoryId: isCustom ? 'custom' : selectedCategory,
        subcategoryId: isCustomSubcategory ? 'custom' : selectedSubcategory,
        customCategory: isCustom ? customCategory : undefined,
        customSubcategory: isCustomSubcategory ? customSubcategory : undefined
      }
    };

    localStorage.setItem('threeRoundForm', JSON.stringify(updatedData));

    // Continue to round 3
    const round3Path = searchParams.get('return') || '/get-started?round=3';
    router.push(round3Path);
  }

  const canContinue =
    isCustom
      ? customCategory.length >= 3 && (selectedSubcategory || (isCustomSubcategory && customSubcategory.length >= 3))
      : (selectedCategory && (selectedSubcategory || (isCustomSubcategory && customSubcategory.length >= 3)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl shadow-blue-500/50">
              <Sparkles className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
              Choose Your Website Type
            </h1>
            <p className="text-xl text-slate-300">
              Select a category and watch the possibilities unfold
            </p>
          </div>

          {/* Two-Column Layout: Categories (3 cols) + Subcategories Panel */}
          <div className="flex gap-8 mb-12">
            {/* Left Side: Category Grid (3 columns) */}
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <CategoryNode
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory === category.id}
                    isHovered={hoveredCategory === category.id}
                    onSelect={() => handleCategoryClick(category.id)}
                    onHover={() => !selectedCategory && setHoveredCategory(category.id)}
                    onLeave={() => setHoveredCategory(null)}
                    index={index}
                    isCustomNode={false}
                    hasActiveHover={false}
                  />
                ))}

                {/* Custom Category Node */}
                <CategoryNode
                  category={{
                    id: 'custom',
                    name: 'Custom',
                    slug: 'custom',
                    description: 'Create your own category',
                    icon: '✨'
                  }}
                  isSelected={isCustom}
                  isHovered={hoveredCategory === 'custom'}
                  onSelect={() => handleCategoryClick('custom')}
                  onHover={() => !selectedCategory && setHoveredCategory('custom')}
                  onLeave={() => setHoveredCategory(null)}
                  index={categories.length}
                  isCustomNode
                  hasActiveHover={false}
                />
              </div>
            </div>

            {/* Right Side: Subcategory Panel */}
            <div className="w-80 flex flex-col">
              {/* Header */}
              <div className="mb-4 h-16">
                <AnimatePresence mode="wait">
                  {hoveredCategory === 'custom' && (
                    <motion.div key="custom-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-200 to-orange-300 bg-clip-text text-transparent">
                        Create Custom
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Define your unique category</p>
                    </motion.div>
                  )}
                  {(hoveredCategory || selectedCategory) && (hoveredCategory !== 'custom' && selectedCategory !== 'custom') && (
                    <motion.div key="subcats-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-200 to-blue-300 bg-clip-text text-transparent">
                        {selectedCategory ? 'Select Specialty' : 'Specialties'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {selectedCategory ? `${allSubcategories[selectedCategory]?.length || 0} options` : 'Hover to explore'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Subcategories List */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {hoveredCategory === 'custom' && (
                    <motion.div key="custom-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <div className="p-4 rounded-lg bg-yellow-500/10 border-2 border-yellow-400/30">
                        <div className="text-sm font-semibold text-yellow-200">✨ Create New Category</div>
                        <div className="text-xs text-yellow-300/70 mt-1">Click to define your own</div>
                      </div>
                    </motion.div>
                  )}
                  {(hoveredCategory || selectedCategory) && (hoveredCategory !== 'custom' && selectedCategory !== 'custom') && (
                    <motion.div key="subcats-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-2">
                      {getDisplaySubcategories(selectedCategory || hoveredCategory || '').map((subcat) => (
                        <button
                          key={subcat.id}
                          onClick={() => {
                            if (selectedCategory) {
                              setSelectedSubcategory(subcat.id);
                              setIsCustomSubcategory(false);
                              setCustomSubcategory('');
                            }
                          }}
                          disabled={!selectedCategory}
                          className={`
                            w-full p-3 rounded-lg text-left transition-colors
                            ${selectedCategory
                              ? 'bg-purple-500/20 border-2 border-purple-400/50 hover:bg-purple-500/30 cursor-pointer'
                              : 'bg-slate-800/30 border border-slate-700/50 cursor-default'
                            }
                            ${selectedSubcategory === subcat.id ? 'ring-2 ring-purple-400 bg-purple-500/30' : ''}
                          `}
                        >
                          <div className="text-sm font-semibold text-slate-200">{subcat.name}</div>
                          <div className="text-xs text-slate-400 mt-1 line-clamp-2">{subcat.description}</div>
                        </button>
                      ))}

                      {/* Custom Subcategory Option */}
                      {selectedCategory && (
                        <button
                          onClick={() => {
                            setIsCustomSubcategory(!isCustomSubcategory);
                            setSelectedSubcategory(null);
                            if (isCustomSubcategory) {
                              setCustomSubcategory('');
                            }
                          }}
                          className={`
                            w-full p-3 rounded-lg text-left transition-colors
                            bg-orange-500/20 border-2 border-orange-400/30 hover:bg-orange-500/30 cursor-pointer
                            ${isCustomSubcategory ? 'ring-2 ring-orange-400 bg-orange-500/30' : ''}
                          `}
                        >
                          <div className="text-sm font-semibold text-orange-200">+ Create Custom Specialty</div>
                          <div className="text-xs text-orange-300/70 mt-1">Define your own specialty</div>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Custom Category Input */}
          {isCustom && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <Card className="p-8 bg-slate-900/80 backdrop-blur-xl border-blue-500/30 shadow-2xl shadow-blue-500/20">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Create Custom Category
                    </h3>
                    <p className="text-slate-400">
                      Tell us about your unique website type
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCustom(false);
                      setCustomCategory('');
                      setDuplicateWarning(null);
                      setSynonymSuggestion(null);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      What type of website do you need?
                    </label>
                    <Input
                      value={customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value);
                        setDuplicateWarning(null);
                        setSynonymSuggestion(null);
                      }}
                      placeholder="e.g., Real Estate Portal, Recipe Blog, Fitness App..."
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      autoFocus
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Minimum 3 characters
                    </p>
                  </div>

                  {/* Custom Subcategory for Custom Category */}
                  {isCustomSubcategory && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Create a Custom Specialty
                      </label>
                      <Input
                        value={customSubcategory}
                        onChange={(e) => {
                          setCustomSubcategory(e.target.value);
                          setDuplicateWarning(null);
                          setSynonymSuggestion(null);
                        }}
                        placeholder="e.g., High-end Luxury, Budget-friendly, Corporate..."
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Minimum 3 characters
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Custom Subcategory Input (for selected category) */}
          {selectedCategory && isCustomSubcategory && !isCustom && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <Card className="p-8 bg-slate-900/80 backdrop-blur-xl border-orange-500/30 shadow-2xl shadow-orange-500/20">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Create Custom Specialty
                    </h3>
                    <p className="text-slate-400">
                      Define a specialty within {categories.find(c => c.id === selectedCategory)?.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCustomSubcategory(false);
                      setCustomSubcategory('');
                      setDuplicateWarning(null);
                      setSynonymSuggestion(null);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      What specialty do you need?
                    </label>
                    <Input
                      value={customSubcategory}
                      onChange={(e) => {
                        setCustomSubcategory(e.target.value);
                        setDuplicateWarning(null);
                        setSynonymSuggestion(null);
                      }}
                      placeholder="e.g., Luxury, Budget-friendly, Corporate, Eco-friendly..."
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      autoFocus
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Minimum 3 characters
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Duplicate Warning */}
          {duplicateWarning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <Card className="p-6 bg-red-500/10 backdrop-blur-xl border-2 border-red-400/30">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-red-200 mb-2">
                      {duplicateWarning}
                    </h4>
                    <p className="text-sm text-red-100/70 mb-4">
                      This category or specialty already exists in our system. Please choose a different name or select from the existing options.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setDuplicateWarning(null);
                        if (isCustom) {
                          setCustomCategory('');
                        } else {
                          setCustomSubcategory('');
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      OK, I'll use a different name
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Synonym Suggestion */}
          {synonymSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <Card className="p-6 bg-blue-500/10 backdrop-blur-xl border-2 border-blue-400/30">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💡</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-blue-200 mb-2">
                      We have something similar!
                    </h4>
                    <p className="text-sm text-blue-100/70 mb-4">
                      We think "{synonymSuggestion.name}" is very similar to what you're looking for. We'll use this to provide the most relevant deep-dive questions for your business.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        onClick={() => {
                          // Use the synonym suggestion
                          setSynonymSuggestion(null);
                          setDuplicateWarning(null);

                          const storedData = localStorage.getItem('threeRoundForm');
                          if (storedData) {
                            const formData = JSON.parse(storedData);
                            const updatedData = {
                              ...formData,
                              round2: {
                                categoryId: isCustom ? 'custom' : selectedCategory,
                                subcategoryId: isCustomSubcategory ? 'custom' : selectedSubcategory,
                                customCategory: isCustom ? customCategory : undefined,
                                customSubcategory: isCustomSubcategory ? customSubcategory : undefined,
                                synonymUsed: synonymSuggestion.id
                              }
                            };
                            localStorage.setItem('threeRoundForm', JSON.stringify(updatedData));
                            const round3Path = searchParams.get('return') || '/get-started?round=3';
                            router.push(round3Path);
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Continue with "{synonymSuggestion.name}"
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSynonymSuggestion(null);
                          if (isCustom) {
                            setCustomCategory('');
                          } else {
                            setCustomSubcategory('');
                          }
                        }}
                        className="border-blue-400/50 text-blue-200 hover:bg-blue-500/20"
                      >
                        Use my name instead
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Selected confirmation */}
          {selectedCategory && selectedSubcategory && !isCustom && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-400/30 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Selected</p>
                    <h4 className="text-xl font-bold text-white">
                      {categories.find(c => c.id === selectedCategory)?.name} →{' '}
                      {allSubcategories[selectedCategory]?.find(s => s.id === selectedSubcategory)?.name}
                    </h4>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Continue Button */}
          {canContinue && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button
                size="lg"
                onClick={handleContinue}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg px-8 py-6 h-auto shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all"
              >
                Continue to Next Step
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GetStartedPhase2() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <GetStartedPhase2Content />
    </Suspense>
  );
}
