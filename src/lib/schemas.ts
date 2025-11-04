import { z } from 'zod'

/**
 * Centralized Zod validation schemas for API routes
 *
 * Benefits:
 * - Type-safe validation at runtime
 * - Automatic error messages
 * - Reusable across routes
 * - Prevents injection attacks and malformed data
 */

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const signInSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  token: z.string().optional(), // For invite-based signups
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

export const generateInviteSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  role: z.enum(['student', 'admin']).default('student'),
})

// ============================================================================
// PAYMENT & CHECKOUT SCHEMAS
// ============================================================================

export const createPaymentIntentSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999, 'Amount cannot exceed $999,999'),
  courseType: z.string().min(1, 'Course type is required'),
  email: z.string().email('Invalid email address').toLowerCase(),
})

export const checkoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  successUrl: z.string().url('Invalid success URL').optional(),
  cancelUrl: z.string().url('Invalid cancel URL').optional(),
  customerEmail: z.string().email('Invalid email address').toLowerCase().optional(),
})

export const servicePaymentSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  email: z.string().email('Invalid email address').toLowerCase(),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters').optional(),
})

// ============================================================================
// EMAIL SCHEMAS
// ============================================================================

export const sendWelcomeEmailSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

export const sendConfirmationEmailSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  serviceName: z.string().min(1, 'Service name is required'),
  amount: z.number().positive('Amount must be positive'),
})

export const studentOnboardingEmailSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  tier: z.enum(['basic', 'premium', 'vip']),
})

// ============================================================================
// WAITLIST & LEAD SCHEMAS
// ============================================================================

export const waitlistSignupSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  source: z.string().optional(),
  referrer: z.string().optional(),
  wantsOwnership: z.boolean().optional().default(true),
})

export const storeLeadSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  source: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
})

// ============================================================================
// CONSULTATION & BOOKING SCHEMAS
// ============================================================================

export const consultationSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  message: z.string().max(1000, 'Message cannot exceed 1000 characters').optional(),
})

export const bookCalendarSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  date: z.string().datetime('Invalid date format'),
  serviceType: z.string().min(1, 'Service type is required'),
  notes: z.string().max(500).optional(),
})

// ============================================================================
// TESTIMONIAL SCHEMAS
// ============================================================================

export const submitTestimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase(),
  testimonial: z.string()
    .min(10, 'Testimonial must be at least 10 characters')
    .max(500, 'Testimonial cannot exceed 500 characters'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  serviceTaken: z.string().optional(),
})

// ============================================================================
// ANALYSIS SCHEMAS (for website analysis features)
// ============================================================================

export const quickAnalysisSchema = z.object({
  url: z.string().url('Invalid URL').refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL must start with http:// or https://'
  ),
  email: z.string().email('Invalid email address').toLowerCase().optional(),
})

export const deepAnalysisSchema = z.object({
  url: z.string().url('Invalid URL').refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL must start with http:// or https://'
  ),
  email: z.string().email('Invalid email address').toLowerCase(),
  analysisType: z.enum(['performance', 'seo', 'accessibility', 'full']).default('full'),
})

// ============================================================================
// ADMIN SCHEMAS
// ============================================================================

export const createAuthUserSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  role: z.enum(['student', 'admin']).default('student'),
})

export const sendCampaignSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  recipientEmails: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient is required'),
  subject: z.string().min(1, 'Subject is required').max(200),
  scheduledAt: z.string().datetime().optional(),
})

export const updateLeadSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().toLowerCase().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  notes: z.string().max(1000).optional(),
})

export const smsConsentSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  consent: z.boolean(),
})

// ============================================================================
// SERVICE SCHEMAS
// ============================================================================

export const serviceQuerySchema = z.object({
  type: z.enum(['course', 'build', 'audit', 'consultation']).optional(),
  active: z.enum(['true', 'false']).optional(),
  category: z.string().optional(),
})

export const checkServiceAvailabilitySchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  date: z.string().datetime('Invalid date format'),
})

// ============================================================================
// PORTFOLIO SCHEMAS
// ============================================================================

export const portfolioSubmissionSchema = z.object({
  projectName: z.string().min(2, 'Project name must be at least 2 characters').max(100),
  projectUrl: z.string().url('Invalid project URL'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  technologies: z.array(z.string()).optional(),
  studentEmail: z.string().email('Invalid email address').toLowerCase(),
})

// ============================================================================
// TYPE EXPORTS (for TypeScript inference)
// ============================================================================

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type SendWelcomeEmailInput = z.infer<typeof sendWelcomeEmailSchema>
export type WaitlistSignupInput = z.infer<typeof waitlistSignupSchema>
export type ConsultationInput = z.infer<typeof consultationSchema>
export type SubmitTestimonialInput = z.infer<typeof submitTestimonialSchema>
export type QuickAnalysisInput = z.infer<typeof quickAnalysisSchema>
export type SendCampaignInput = z.infer<typeof sendCampaignSchema>
export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>
