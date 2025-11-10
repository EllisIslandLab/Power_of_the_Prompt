'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import PreviewModal from './PreviewModal'

// Zod schema for form validation
const serviceSchema = z.object({
  title: z.string().min(1, 'Service title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Service description is required').max(500, 'Description too long'),
})

const demoFormSchema = z.object({
  // Step 1: Business Information
  businessName: z.string().min(1, 'Business name is required').max(100, 'Business name too long'),
  tagline: z.string().max(200, 'Tagline too long').optional(),
  phone: z.string().regex(/^[\d\s\-\(\)]+$/, 'Invalid phone number').optional().or(z.literal('')),
  address: z.string().max(200, 'Address too long').optional(),
  city: z.string().max(100, 'City name too long').optional(),
  state: z.string().max(2, 'Use 2-letter state code').optional(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code').optional().or(z.literal('')),
  businessContactEmail: z.string().email('Invalid email').optional().or(z.literal('')),

  // Step 2: Services (1-5 services)
  services: z.array(serviceSchema).min(1, 'Add at least 1 service').max(5, 'Maximum 5 services allowed'),

  // Step 3: Colors
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),

  // Step 4: User Contact
  userEmail: z.string().email('Invalid email address'),
})

type DemoFormData = z.infer<typeof demoFormSchema>

interface DemoSiteGeneratorFormProps {
  template: any
}

const STORAGE_KEY = 'demo_generator_form_data'

export default function DemoSiteGeneratorForm({ template }: DemoSiteGeneratorFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)

  const totalSteps = 4

  // Get default colors from template config
  const defaultColors = template.html_generator_config?.defaultColors || {
    primary: '#003f72',
    secondary: '#ffd700',
    accent: '#e85d04',
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      businessName: '',
      tagline: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      businessContactEmail: '',
      services: [{ title: '', description: '' }],
      primaryColor: defaultColors.primary,
      secondaryColor: defaultColors.secondary,
      accentColor: defaultColors.accent,
      userEmail: '',
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  })

  // Watch form data for auto-save
  const watchedData = watch()

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        Object.keys(data).forEach((key) => {
          setValue(key as any, data[key])
        })
        toast.success('Restored your previous progress')
      } catch (error) {
        console.error('Failed to load saved data:', error)
      }
    }
  }, [setValue])

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedData))
    }, 1000)

    return () => clearTimeout(timer)
  }, [watchedData])

  const handleNext = async () => {
    let fieldsToValidate: (keyof DemoFormData)[] = []

    if (currentStep === 1) {
      fieldsToValidate = ['businessName', 'tagline', 'phone', 'address', 'city', 'state', 'zip', 'businessContactEmail']
    } else if (currentStep === 2) {
      fieldsToValidate = ['services']
    } else if (currentStep === 3) {
      fieldsToValidate = ['primaryColor', 'secondaryColor', 'accentColor']
    } else if (currentStep === 4) {
      fieldsToValidate = ['userEmail']
    }

    const isValid = await trigger(fieldsToValidate)

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const onSubmit = async (data: DemoFormData) => {
    setIsSubmitting(true)

    try {
      // Call API to generate demo preview
      const response = await fetch('/api/demo-generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          ...data,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate preview')
      }

      const result = await response.json()
      setPreviewData(result)
      setShowPreview(true)

      // Clear saved form data
      localStorage.removeItem(STORAGE_KEY)

      toast.success('Your website preview is ready!')
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error(error.message || 'Failed to generate preview. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / totalSteps) * 100

  return (
    <>
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && 'Business Information'}
                {currentStep === 2 && 'Your Services'}
                {currentStep === 3 && 'Customize Colors'}
                {currentStep === 4 && 'Your Contact Information'}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Tell us about your business'}
                {currentStep === 2 && 'Add 1-5 services you offer'}
                {currentStep === 3 && 'Choose your brand colors'}
                {currentStep === 4 && 'Where should we send your preview?'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Business Information */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      {...register('businessName')}
                      placeholder="Your Business Name"
                    />
                    {errors.businessName && (
                      <p className="text-sm text-destructive">{errors.businessName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline (Optional)</Label>
                    <Input
                      id="tagline"
                      {...register('tagline')}
                      placeholder="Your business tagline"
                    />
                    {errors.tagline && (
                      <p className="text-sm text-destructive">{errors.tagline.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessContactEmail">Business Contact Email (Optional)</Label>
                    <Input
                      id="businessContactEmail"
                      type="email"
                      {...register('businessContactEmail')}
                      placeholder="contact@yourbusiness.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      This email will be displayed on your website for clients to contact you
                    </p>
                    {errors.businessContactEmail && (
                      <p className="text-sm text-destructive">{errors.businessContactEmail.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address (Optional)</Label>
                    <Input
                      id="address"
                      {...register('address')}
                      placeholder="123 Main St"
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-3 sm:col-span-1 space-y-2">
                      <Label htmlFor="city">City (Optional)</Label>
                      <Input
                        id="city"
                        {...register('city')}
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="col-span-1 space-y-2">
                      <Label htmlFor="state">State (Optional)</Label>
                      <Input
                        id="state"
                        {...register('state')}
                        placeholder="CA"
                        maxLength={2}
                      />
                      {errors.state && (
                        <p className="text-sm text-destructive">{errors.state.message}</p>
                      )}
                    </div>

                    <div className="col-span-2 sm:col-span-1 space-y-2">
                      <Label htmlFor="zip">ZIP Code (Optional)</Label>
                      <Input
                        id="zip"
                        {...register('zip')}
                        placeholder="12345"
                      />
                      {errors.zip && (
                        <p className="text-sm text-destructive">{errors.zip.message}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Services */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="border-muted">
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Service {index + 1}</h4>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`services.${index}.title`}>Service Title *</Label>
                            <Input
                              {...register(`services.${index}.title` as const)}
                              placeholder="e.g., Financial Planning"
                            />
                            {errors.services?.[index]?.title && (
                              <p className="text-sm text-destructive">
                                {errors.services[index]?.title?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`services.${index}.description`}>Service Description *</Label>
                            <Textarea
                              {...register(`services.${index}.description` as const)}
                              placeholder="Describe this service..."
                              rows={3}
                            />
                            {errors.services?.[index]?.description && (
                              <p className="text-sm text-destructive">
                                {errors.services[index]?.description?.message}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {fields.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ title: '', description: '' })}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service ({fields.length}/5)
                      </Button>
                    )}

                    {errors.services && typeof errors.services.message === 'string' && (
                      <p className="text-sm text-destructive">{errors.services.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* Step 3: Colors */}
              {currentStep === 3 && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color *</Label>
                      <div className="flex gap-4 items-center">
                        <Input
                          id="primaryColor"
                          type="color"
                          {...register('primaryColor')}
                          className="w-20 h-12 cursor-pointer"
                        />
                        <Input
                          {...register('primaryColor')}
                          placeholder="#003f72"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Main brand color used for headers and primary buttons
                      </p>
                      {errors.primaryColor && (
                        <p className="text-sm text-destructive">{errors.primaryColor.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color *</Label>
                      <div className="flex gap-4 items-center">
                        <Input
                          id="secondaryColor"
                          type="color"
                          {...register('secondaryColor')}
                          className="w-20 h-12 cursor-pointer"
                        />
                        <Input
                          {...register('secondaryColor')}
                          placeholder="#ffd700"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Secondary color for accents and highlights
                      </p>
                      {errors.secondaryColor && (
                        <p className="text-sm text-destructive">{errors.secondaryColor.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accentColor">Accent Color *</Label>
                      <div className="flex gap-4 items-center">
                        <Input
                          id="accentColor"
                          type="color"
                          {...register('accentColor')}
                          className="w-20 h-12 cursor-pointer"
                        />
                        <Input
                          {...register('accentColor')}
                          placeholder="#e85d04"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Accent color for call-to-action elements
                      </p>
                      {errors.accentColor && (
                        <p className="text-sm text-destructive">{errors.accentColor.message}</p>
                      )}
                    </div>

                    {/* Color Preview */}
                    <Card className="border-muted">
                      <CardHeader>
                        <CardTitle className="text-base">Color Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div
                              className="w-full h-20 rounded-md mb-2"
                              style={{ backgroundColor: watchedData.primaryColor }}
                            />
                            <p className="text-xs text-muted-foreground">Primary</p>
                          </div>
                          <div className="text-center">
                            <div
                              className="w-full h-20 rounded-md mb-2"
                              style={{ backgroundColor: watchedData.secondaryColor }}
                            />
                            <p className="text-xs text-muted-foreground">Secondary</p>
                          </div>
                          <div className="text-center">
                            <div
                              className="w-full h-20 rounded-md mb-2"
                              style={{ backgroundColor: watchedData.accentColor }}
                            />
                            <p className="text-xs text-muted-foreground">Accent</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {/* Step 4: User Contact */}
              {currentStep === 4 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Your Email Address *</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      {...register('userEmail')}
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      We&apos;ll send your website preview to this email. This is your personal email for our communication.
                    </p>
                    {errors.userEmail && (
                      <p className="text-sm text-destructive">{errors.userEmail.message}</p>
                    )}
                  </div>

                  {/* Summary Preview */}
                  <Card className="border-muted bg-muted/20">
                    <CardHeader>
                      <CardTitle className="text-base">Preview Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Business:</span> {watchedData.businessName || 'Not set'}
                      </div>
                      <div>
                        <span className="font-medium">Services:</span> {watchedData.services.length} service{watchedData.services.length !== 1 ? 's' : ''}
                      </div>
                      <div>
                        <span className="font-medium">Colors:</span>
                        <div className="flex gap-2 mt-1">
                          {[watchedData.primaryColor, watchedData.secondaryColor, watchedData.accentColor].map((color, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Generate Preview
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          previewData={previewData}
        />
      )}
    </>
  )
}
