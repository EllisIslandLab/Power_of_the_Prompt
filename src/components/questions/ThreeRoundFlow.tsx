'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Round1Data {
  email: string;
  businessName: string;
  businessDescription?: string;
  targetAudience?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface Round2Data {
  categoryId: string;
  subcategoryId: string;
  customCategory?: string;
}

interface Round3Data {
  contentSource: 'upload' | 'ai_placeholder' | 'skip';
  files?: File[];
  additionalNotes?: string;
}

interface CompleteFormData {
  round1: Round1Data;
  round2: Round2Data;
  round3: Round3Data;
}

interface ThreeRoundFlowProps {
  onComplete: (data: CompleteFormData) => Promise<void>;
  initialRound?: 1 | 2 | 3;
  onRoundChange?: (round: 1 | 2 | 3) => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
}

interface ValidationErrors {
  [key: string]: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ThreeRoundFlow({ onComplete, initialRound = 1, onRoundChange }: ThreeRoundFlowProps) {
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(initialRound);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Notify parent when round changes
  useEffect(() => {
    onRoundChange?.(currentRound);
  }, [currentRound, onRoundChange]);

  // Round 1 state
  const [round1, setRound1] = useState<Round1Data>({
    email: '',
    businessName: '',
    businessDescription: '',
    targetAudience: '',
    primaryColor: '#0066cc',
    secondaryColor: '#f59e0b',
  });

  // Round 2 state
  const [round2, setRound2] = useState<Round2Data>({
    categoryId: '',
    subcategoryId: '',
    customCategory: '',
  });

  // Round 3 state
  const [round3, setRound3] = useState<Round3Data>({
    contentSource: 'ai_placeholder',
    files: [],
    additionalNotes: '',
  });

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // ============================================
  // LIFECYCLE - Load from localStorage & fetch categories
  // ============================================

  useEffect(() => {
    // Restore from localStorage if exists
    const saved = localStorage.getItem('threeRoundForm');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.round1) setRound1(parsed.round1);
        if (parsed.round2) setRound2(parsed.round2);
        if (parsed.round3) setRound3(parsed.round3);
      } catch (e) {
        console.error('Error parsing saved form data:', e);
      }
    }

    // Fetch categories
    fetchCategories();
  }, []);

  // Save to localStorage after each state change
  useEffect(() => {
    const formData = { round1, round2, round3 };
    localStorage.setItem('threeRoundForm', JSON.stringify(formData));
  }, [round1, round2, round3]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (round2.categoryId) {
      fetchSubcategories(round2.categoryId);
    }
  }, [round2.categoryId]);

  // ============================================
  // API CALLS
  // ============================================

  async function fetchCategories() {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/categories/list');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrors({ categories: 'Failed to load categories. Please refresh the page.' });
    } finally {
      setLoadingCategories(false);
    }
  }

  async function fetchSubcategories(categoryId: string) {
    try {
      setLoadingSubcategories(true);
      const response = await fetch(`/api/categories/subcategories?categoryId=${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      setSubcategories(data.subcategories || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setErrors({ subcategories: 'Failed to load subcategories. Please try again.' });
    } finally {
      setLoadingSubcategories(false);
    }
  }

  // ============================================
  // VALIDATION
  // ============================================

  function validateRound1(): boolean {
    const newErrors: ValidationErrors = {};

    // Email validation
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (!round1.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(round1.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Business name validation
    if (!round1.businessName) {
      newErrors.businessName = 'Business name is required';
    } else if (round1.businessName.length < 3 || round1.businessName.length > 100) {
      newErrors.businessName = 'Business name must be 3-100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateRound2(): boolean {
    const newErrors: ValidationErrors = {};

    if (!round2.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!round2.subcategoryId) {
      newErrors.subcategoryId = 'Please select a subcategory';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateRound3(): boolean {
    const newErrors: ValidationErrors = {};

    if (!round3.contentSource) {
      newErrors.contentSource = 'Please select a content source';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ============================================
  // NAVIGATION HANDLERS
  // ============================================

  function handleNext() {
    let isValid = false;

    if (currentRound === 1) {
      isValid = validateRound1();
      if (isValid) {
        setCurrentRound(2);
      }
    } else if (currentRound === 2) {
      isValid = validateRound2();
      if (isValid) setCurrentRound(3);
    }
  }

  function handlePrevious() {
    if (currentRound > 1) {
      setCurrentRound((prev) => (prev - 1) as 1 | 2);
      setErrors({});
    }
  }

  async function handleSubmit() {
    if (!validateRound3()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const completeData: CompleteFormData = {
        round1,
        round2,
        round3,
      };

      await onComplete(completeData);

      // Clear localStorage on successful submit
      localStorage.removeItem('threeRoundForm');
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ============================================
  // FILE UPLOAD HANDLER
  // ============================================

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newErrors: ValidationErrors = {};

    fileArray.forEach((file) => {
      // Check file size (max 10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        newErrors.files = `File "${file.name}" is too large (max 10MB)`;
        return;
      }

      // Check file type
      const allowedExtensions = ['.txt', '.md', '.pdf', '.doc', '.docx'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        newErrors.files = `File "${file.name}" has invalid type. Allowed: ${allowedExtensions.join(', ')}`;
        return;
      }

      validFiles.push(file);
    });

    // Check total size (max 50MB)
    const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 50 * 1024 * 1024) {
      newErrors.files = 'Total file size exceeds 50MB';
      setErrors(newErrors);
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setRound3({ ...round3, files: validFiles });
      setErrors({});
    }
  }

  // ============================================
  // RENDER HELPERS
  // ============================================

  function renderProgressBar() {
    const progress = (currentRound / 3) * 100;
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground dark:text-slate-100">
            Round {currentRound}/3
          </span>
          <span className="text-sm text-muted-foreground dark:text-slate-400">
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="w-full bg-muted dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-primary dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  // ============================================
  // ROUND 1 - BUSINESS FOUNDATION
  // ============================================

  function renderRound1() {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground dark:text-slate-100 mb-2">
            📝 Business Information
          </h2>
          <p className="text-muted-foreground dark:text-slate-400">
            Tell us about your business and visual preferences
          </p>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-foreground dark:text-slate-100">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={round1.email}
            onChange={(e) => setRound1({ ...round1, email: e.target.value })}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email}</p>
          )}
        </div>

        {/* Business Name */}
        <div>
          <Label htmlFor="businessName" className="text-foreground dark:text-slate-100">
            Business Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            type="text"
            placeholder="Acme Corporation"
            value={round1.businessName}
            onChange={(e) => setRound1({ ...round1, businessName: e.target.value })}
            className={errors.businessName ? 'border-destructive' : ''}
          />
          {errors.businessName && (
            <p className="text-sm text-destructive mt-1">{errors.businessName}</p>
          )}
        </div>

        {/* Business Description */}
        <div>
          <Label htmlFor="businessDescription" className="text-foreground dark:text-slate-100">
            Business Description (Optional)
          </Label>
          <Textarea
            id="businessDescription"
            placeholder="What do you do? Who do you serve?"
            value={round1.businessDescription}
            onChange={(e) => setRound1({ ...round1, businessDescription: e.target.value })}
            rows={3}
          />
        </div>

        {/* Target Audience */}
        <div>
          <Label htmlFor="targetAudience" className="text-foreground dark:text-slate-100">
            Target Audience (Optional)
          </Label>
          <Input
            id="targetAudience"
            type="text"
            placeholder="Who is your ideal customer?"
            value={round1.targetAudience}
            onChange={(e) => setRound1({ ...round1, targetAudience: e.target.value })}
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primaryColor" className="text-foreground dark:text-slate-100">
              Primary Color
            </Label>
            <div className="flex gap-2 items-center">
              <input
                id="primaryColor"
                type="color"
                value={round1.primaryColor}
                onChange={(e) => setRound1({ ...round1, primaryColor: e.target.value })}
                className="h-10 w-20 rounded border border-input cursor-pointer"
              />
              <Input
                type="text"
                value={round1.primaryColor}
                onChange={(e) => setRound1({ ...round1, primaryColor: e.target.value })}
                placeholder="#0066cc"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="secondaryColor" className="text-foreground dark:text-slate-100">
              Secondary Color
            </Label>
            <div className="flex gap-2 items-center">
              <input
                id="secondaryColor"
                type="color"
                value={round1.secondaryColor}
                onChange={(e) => setRound1({ ...round1, secondaryColor: e.target.value })}
                className="h-10 w-20 rounded border border-input cursor-pointer"
              />
              <Input
                type="text"
                value={round1.secondaryColor}
                onChange={(e) => setRound1({ ...round1, secondaryColor: e.target.value })}
                placeholder="#f59e0b"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ROUND 2 - WEBSITE CATEGORY
  // ============================================

  function renderRound2() {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground dark:text-slate-100 mb-2">
            🎯 Website Category
          </h2>
          <p className="text-muted-foreground dark:text-slate-400">
            What type of website are you building?
          </p>
        </div>

        {/* Category Selection */}
        <div>
          <Label className="text-foreground dark:text-slate-100">
            Select Your Website Type <span className="text-destructive">*</span>
          </Label>
          {loadingCategories ? (
            <div className="py-4 text-center text-muted-foreground">Loading categories...</div>
          ) : errors.categories ? (
            <div className="py-4 text-center text-destructive">{errors.categories}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setRound2({ ...round2, categoryId: category.id, subcategoryId: '' });
                    setErrors({});
                  }}
                  className={`p-4 text-left rounded-lg border-2 transition-all ${
                    round2.categoryId === category.id
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold text-foreground dark:text-slate-100">
                    {category.name}
                  </div>
                  {category.description && (
                    <div className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
                      {category.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          {errors.categoryId && (
            <p className="text-sm text-destructive mt-2">{errors.categoryId}</p>
          )}
        </div>

        {/* Subcategory Selection */}
        {round2.categoryId && (
          <div>
            <Label className="text-foreground dark:text-slate-100">
              Specific Focus <span className="text-destructive">*</span>
            </Label>
            {loadingSubcategories ? (
              <div className="py-4 text-center text-muted-foreground">Loading options...</div>
            ) : errors.subcategories ? (
              <div className="py-4 text-center text-destructive">{errors.subcategories}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {subcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => {
                      setRound2({ ...round2, subcategoryId: subcategory.id });
                      setErrors({});
                    }}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      round2.subcategoryId === subcategory.id
                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold text-foreground dark:text-slate-100">
                      {subcategory.name}
                    </div>
                    {subcategory.description && (
                      <div className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
                        {subcategory.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
            {errors.subcategoryId && (
              <p className="text-sm text-destructive mt-2">{errors.subcategoryId}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // ROUND 3 - CONTENT SOURCE
  // ============================================

  function renderRound3() {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground dark:text-slate-100 mb-2">
            📄 Content Source
          </h2>
          <p className="text-muted-foreground dark:text-slate-400">
            How would you like to provide content?
          </p>
        </div>

        {/* Content Source Selection */}
        <div className="space-y-3">
          {/* AI Placeholder */}
          <button
            onClick={() => setRound3({ ...round3, contentSource: 'ai_placeholder', files: [] })}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              round3.contentSource === 'ai_placeholder'
                ? 'border-primary bg-primary/10 dark:bg-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold text-foreground dark:text-slate-100">
              ✨ AI will create placeholders
            </div>
            <div className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
              Perfect for quick start - AI creates sample content. You can refine later.
            </div>
          </button>

          {/* Upload */}
          <button
            onClick={() => setRound3({ ...round3, contentSource: 'upload' })}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              round3.contentSource === 'upload'
                ? 'border-primary bg-primary/10 dark:bg-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold text-foreground dark:text-slate-100">
              📤 I'll upload my own content
            </div>
            <div className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
              Provide your own text, documents, or images
            </div>
          </button>

          {/* Skip */}
          <button
            onClick={() => setRound3({ ...round3, contentSource: 'skip', files: [] })}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              round3.contentSource === 'skip'
                ? 'border-primary bg-primary/10 dark:bg-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold text-foreground dark:text-slate-100">
              ⏭️ Skip for now
            </div>
            <div className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
              Start with AI placeholders, add content later
            </div>
          </button>
        </div>

        {/* File Upload (conditional) */}
        {round3.contentSource === 'upload' && (
          <div>
            <Label htmlFor="fileUpload" className="text-foreground dark:text-slate-100">
              Upload Files
            </Label>
            <input
              id="fileUpload"
              type="file"
              multiple
              accept=".txt,.md,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                cursor-pointer mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Accepted: .txt, .md, .pdf, .doc, .docx • Max 10MB per file, 50MB total
            </p>
            {round3.files && round3.files.length > 0 && (
              <div className="mt-2 space-y-1">
                {round3.files.map((file, idx) => (
                  <div key={idx} className="text-sm text-foreground dark:text-slate-100">
                    ✓ {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                ))}
              </div>
            )}
            {errors.files && (
              <p className="text-sm text-destructive mt-2">{errors.files}</p>
            )}
          </div>
        )}

        {/* Additional Notes */}
        <div>
          <Label htmlFor="additionalNotes" className="text-foreground dark:text-slate-100">
            Additional Notes (Optional)
          </Label>
          <Textarea
            id="additionalNotes"
            placeholder="Any special instructions for your website?"
            value={round3.additionalNotes}
            onChange={(e) => setRound3({ ...round3, additionalNotes: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-8">
        {renderProgressBar()}

        {/* Round Content */}
        {currentRound === 1 && renderRound1()}
        {currentRound === 2 && renderRound2()}
        {currentRound === 3 && renderRound3()}

        {/* Error Messages */}
        {errors.submit && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{errors.submit}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          {currentRound > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          ) : (
            <div />
          )}

          {currentRound < 3 ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
              {!isSubmitting && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
