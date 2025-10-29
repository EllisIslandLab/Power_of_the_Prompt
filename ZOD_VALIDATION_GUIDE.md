# Zod Validation Implementation Guide

## Overview

We've implemented comprehensive Zod validation across your API routes to improve security, type safety, and developer experience.

## What We Built

### 1. Central Schema Library (`src/lib/schemas.ts`)
- **40+ validation schemas** covering all major API routes
- Type-safe runtime validation with TypeScript inference
- Strong password requirements (8+ chars, uppercase, lowercase, number, special char)
- Email normalization (automatic lowercase conversion)
- Custom error messages for better UX

**Schema Categories:**
- Authentication (signin, signup, forgot password, reset password, invites)
- Payments (payment intents, checkout, service payments)
- Emails (welcome, confirmation, student onboarding)
- Waitlist & Leads (signup, lead storage)
- Consultations & Bookings
- Testimonials
- Website Analysis (quick & deep analysis)
- Admin Operations (user creation, campaigns, lead management)
- Services (queries, availability checks)
- Portfolio Submissions

### 2. Validation Helper Utilities (`src/lib/validation.ts`)
- `validateRequest()` - Validates request body against schema
- `validateQueryParams()` - Validates URL query parameters
- `validate()` - Synchronous validation for non-request data
- Automatic error formatting with user-friendly messages
- Type-safe results with discriminated unions

### 3. Updated Routes
✅ **Authentication Routes:**
- `/api/auth/signin` - Validates email and password
- `/api/auth/signup` - Validates full signup with password strength requirements

✅ **Payment Routes:**
- `/api/stripe/create-payment-intent` - Validates amount, courseType, email

✅ **Email Routes:**
- `/api/emails/welcome` - Validates email and fullName

✅ **Waitlist Routes:**
- `/api/waitlist/signup` - Validates email, name, source, referrer

## How to Use Zod Validation in Your Routes

### Basic Usage Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/validation'
import { yourSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    // 1. Validate the request
    const validation = await validateRequest(request, yourSchema)

    // 2. Return early if validation fails
    if (!validation.success) {
      return validation.error // Automatically formatted 400 response
    }

    // 3. Use the validated, type-safe data
    const { email, password } = validation.data // TypeScript knows these types!

    // ... your business logic here

  } catch (error) {
    console.error('Route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Validating Query Parameters

```typescript
import { validateQueryParams } from '@/lib/validation'
import { serviceQuerySchema } from '@/lib/schemas'

export async function GET(request: NextRequest) {
  // Validate query params like ?type=course&active=true
  const validation = validateQueryParams(request, serviceQuerySchema)

  if (!validation.success) {
    return validation.error
  }

  const { type, active, category } = validation.data // Type-safe!
  // ... use the validated params
}
```

## Routes That Still Need Validation

Apply the same pattern to these routes:

### High Priority (Security-Critical)
- [ ] `/api/auth/forgot-password` → Use `forgotPasswordSchema`
- [ ] `/api/auth/reset-password` → Use `resetPasswordSchema`
- [ ] `/api/auth/verify-email` → Use `verifyEmailSchema`
- [ ] `/api/auth/generate-invite` → Use `generateInviteSchema`
- [ ] `/api/checkout` → Use `checkoutSchema`
- [ ] `/api/services/payment` → Use `servicePaymentSchema`

### Medium Priority (User-Facing)
- [ ] `/api/emails/confirmation` → Use `sendConfirmationEmailSchema`
- [ ] `/api/emails/student-onboarding` → Use `studentOnboardingEmailSchema`
- [ ] `/api/consultation` → Use `consultationSchema`
- [ ] `/api/calendar/book` → Use `bookCalendarSchema`
- [ ] `/api/testimonials/submit` → Use `submitTestimonialSchema`
- [ ] `/api/quick-analysis` → Use `quickAnalysisSchema`
- [ ] `/api/deep-analysis` → Use `deepAnalysisSchema`

### Lower Priority (Admin/Internal)
- [ ] `/api/admin/create-auth-user` → Use `createAuthUserSchema`
- [ ] `/api/admin/send-campaign` → Use `sendCampaignSchema`
- [ ] `/api/admin/leads` (update) → Use `updateLeadSchema`
- [ ] `/api/onboarding/sms-consent` → Use `smsConsentSchema`

### GET Routes (Query Params)
- [ ] `/api/services` → Use `serviceQuerySchema` with `validateQueryParams`
- [ ] `/api/services/check-availability` → Use `checkServiceAvailabilitySchema`

## Example: Complete Route Conversion

### BEFORE (Manual Validation ❌)
```typescript
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Manual validation - error prone!
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password too short' }, { status: 400 })
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: 'Need uppercase' }, { status: 400 })
    }

    // ... business logic
  } catch (error) {
    // ...
  }
}
```

### AFTER (Zod Validation ✅)
```typescript
import { validateRequest } from '@/lib/validation'
import { signInSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    // One line validates everything!
    const validation = await validateRequest(request, signInSchema)
    if (!validation.success) {
      return validation.error
    }

    const { email, password } = validation.data // Type-safe, validated, normalized

    // ... business logic
  } catch (error) {
    // ...
  }
}
```

## Benefits You're Getting

### 🔒 Security
- SQL injection prevention (validated inputs)
- XSS attack prevention (sanitized strings)
- Strong password enforcement
- Email format validation

### 🎯 Type Safety
- TypeScript knows your data types
- Autocomplete in your IDE
- Compile-time error checking
- Prevents runtime type errors

### 🚀 Developer Experience
- Write once, use everywhere
- Consistent error messages
- Less boilerplate code
- Easier testing

### 🐛 Better Debugging
- Clear validation errors
- Field-specific error messages
- Automatic error formatting
- User-friendly responses

## Error Response Format

When validation fails, users get helpful error messages:

```json
{
  "error": "Validation failed",
  "details": {
    "email": ["Invalid email address"],
    "password": [
      "Password must be at least 8 characters",
      "Password must contain at least one uppercase letter"
    ]
  }
}
```

## Creating New Schemas

If you need to validate a new API route:

```typescript
// Add to src/lib/schemas.ts
export const myNewSchema = z.object({
  field1: z.string().min(1, 'Field 1 is required'),
  field2: z.number().positive('Must be positive'),
  field3: z.string().email('Invalid email').toLowerCase(),
  field4: z.enum(['option1', 'option2']).optional(),
})

// Export the inferred type
export type MyNewInput = z.infer<typeof myNewSchema>
```

Then use it in your route:
```typescript
import { myNewSchema } from '@/lib/schemas'
const validation = await validateRequest(request, myNewSchema)
```

## Testing Validation

Test your routes with invalid data:

```bash
# Test missing fields
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{}'

# Test invalid email
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail","password":"Test1234!"}'

# Test weak password
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"weak","fullName":"Test User"}'
```

## Common Patterns

### Optional Fields
```typescript
optionalField: z.string().optional()
```

### Default Values
```typescript
role: z.enum(['student', 'admin']).default('student')
```

### Conditional Validation
```typescript
website: z.string().url('Invalid URL').optional().or(z.literal(''))
```

### Custom Refinements
```typescript
url: z.string().url().refine(
  (url) => url.startsWith('https://'),
  'URL must use HTTPS'
)
```

### Array Validation
```typescript
tags: z.array(z.string()).min(1, 'At least one tag required')
```

## Next Steps

1. **Apply to remaining routes** - Use the patterns above to add validation to all API routes
2. **Test thoroughly** - Send invalid data to ensure errors are caught
3. **Update frontend** - Parse error.details to show field-specific errors
4. **Monitor production** - Watch for validation errors in logs

## Support

If you need help adding validation to a specific route:
1. Find the schema in `src/lib/schemas.ts`
2. Import it and use `validateRequest()`
3. Remove manual validation code
4. Test with invalid inputs

The validation is already set up - you just need to apply the pattern! 🎉
