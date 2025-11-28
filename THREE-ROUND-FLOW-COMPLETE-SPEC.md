# ThreeRoundFlow Component - Complete Specification & Documentation

**Created:** 2025-11-28
**Status:** Ready for Implementation
**Urgency:** CRITICAL - Blocks user onboarding

---

## ⭐ Overview

The **ThreeRoundFlow** is the main entry point for the AI-first user onboarding. It's a React component that collects user data in 3 sequential rounds, validates it, saves to database, and triggers the verification flow.

**Location:** `src/components/questions/ThreeRoundFlow.tsx`
**Imported by:** `src/app/get-started/page.tsx`
**Current Status:** MISSING (needs to be created)

---

## 📋 What Each Round Collects

### Round 1: Business Foundation
**Purpose:** Get basic business information and visual preferences

**Fields to Collect:**
1. **Email** (required)
   - Type: text input
   - Validation: Must be valid email format (contains @ and .)
   - Purpose: User identification & verification
   - Storage: round1.email

2. **Business Name** (required)
   - Type: text input
   - Validation: 3-100 characters
   - Purpose: Website branding & AI context
   - Storage: round1.businessName

3. **Business Description** (optional)
   - Type: textarea
   - Validation: No strict validation
   - Purpose: AI generation context
   - Storage: round1.businessDescription
   - Placeholder: "What do you do? Who do you serve?"

4. **Target Audience** (optional)
   - Type: text input
   - Validation: No strict validation
   - Purpose: AI generation personalization
   - Storage: round1.targetAudience
   - Placeholder: "Who is your ideal customer?"

5. **Primary Color** (optional)
   - Type: color picker
   - Validation: Valid hex color
   - Purpose: Website theme
   - Storage: round1.primaryColor
   - Default: #0066cc (blue)

6. **Secondary Color** (optional)
   - Type: color picker
   - Validation: Valid hex color
   - Purpose: Website theme
   - Storage: round1.secondaryColor
   - Default: #f59e0b (amber)

**UI Layout:**
```
📝 ROUND 1/3: BUSINESS INFORMATION

Email: [________________]
Business Name: [________________]
Description: [________________________]
Target Audience: [________________]
Primary Color: [Color Picker]
Secondary Color: [Color Picker]

Progress: ████░░░ (1/3)
[Previous] [Next ▶]
```

---

### Round 2: Website Category
**Purpose:** Select what type of website the user is building

**Fields to Collect:**
1. **Category** (required)
   - Type: select dropdown or radio buttons
   - Options: Loaded from `website_categories` database table
   - Validation: Must exist in database
   - Purpose: AI generation template selection
   - Storage: round2.categoryId

2. **Subcategory** (conditional - required if category selected)
   - Type: select dropdown or radio buttons
   - Options: Loaded from `website_subcategories` WHERE category_id = selected category
   - Validation: Must exist in database
   - Purpose: Further AI generation refinement
   - Storage: round2.subcategoryId
   - Visible: Only after category selected

3. **Custom Category** (optional fallback)
   - Type: text input
   - Validation: 3-100 characters
   - Purpose: For categories not in database
   - Storage: round2.customCategory
   - Show: If user selects "Other" or has needs not covered

**Database Tables Used:**
- `website_categories` - List of website types
- `website_subcategories` - Specific website purposes

**Category Examples:**
- Display Website (photos, blogs, galleries)
- Input Website (forms, surveys, registrations)
- E-commerce Website (product sales)
- Social Networking Website (communities, profiles)
- Educational Website (courses, learning)
- Informational Website (news, articles)
- Utility Website (tools, calculators)
- Entertainment Website (videos, games, streaming)

**UI Layout:**
```
🎯 ROUND 2/3: WEBSITE CATEGORY

Select your website type:
○ Display Website
○ Input Website
○ E-commerce Website
○ Social Networking Website
○ Educational Website
○ Informational Website
○ Utility Website
○ Entertainment Website

[Show more options...]

For Display Website, what's your main focus?
○ Picture Gallery
○ Text Blog
○ Video Gallery
○ Audio Gallery
○ Art Portfolio
○ Photography Portfolio
○ Design Portfolio

Progress: ████████░ (2/3)
[◀ Previous] [Next ▶]
```

---

### Round 3: Content Source
**Purpose:** Decide where content comes from

**Fields to Collect:**
1. **Content Source** (required)
   - Type: radio buttons (3 options)
   - Options:
     - "AI will create placeholders" (default, recommended)
     - "I'll upload my own content" (for advanced users)
     - "Skip for now" (allows progression without content)
   - Validation: One must be selected
   - Purpose: Determine content strategy
   - Storage: round3.contentSource

2. **Files** (conditional - if "upload" selected)
   - Type: file upload
   - Accepted: .txt, .md, .pdf, .doc, .docx
   - Size limit: 10MB each, 50MB total
   - Purpose: User-provided content for AI to use
   - Storage: round3.files (array of file objects)
   - Optional: Can submit without files

3. **Additional Notes** (optional)
   - Type: textarea
   - Validation: No strict validation
   - Purpose: Special instructions for AI generation
   - Storage: round3.additionalNotes
   - Placeholder: "Any special instructions for your website?"

**UI Layout:**
```
📄 ROUND 3/3: CONTENT SOURCE

How would you like to provide content?

○ AI will create placeholders
  Perfect for quick start - AI creates sample content
  You can refine later

● I'll upload my own content
  [Drag files or click to browse]
  Accepted: .txt, .md, .pdf, .doc, .docx
  Max 50MB total

○ Skip for now
  Start with AI placeholders, add content later

Additional Notes:
[________________________]

Progress: ████████████ (3/3)
[◀ Previous] [Submit ▶]
```

---

## 🔄 Component Structure & Behavior

### State Management
```typescript
interface ThreeRoundFlowProps {
  onComplete: (data: CompleteFormData) => Promise<void>
}

interface CompleteFormData {
  round1: Round1Data
  round2: Round2Data
  round3: Round3Data
}

interface Round1Data {
  email: string
  businessName: string
  businessDescription?: string
  targetAudience?: string
  primaryColor?: string
  secondaryColor?: string
}

interface Round2Data {
  categoryId: string
  subcategoryId: string
  customCategory?: string
}

interface Round3Data {
  contentSource: 'upload' | 'ai_placeholder' | 'skip'
  files?: File[]
  additionalNotes?: string
}
```

### Navigation Flow
```
Round 1
  ↓ [Next] button validates Round 1
Round 2
  ↓ [Next] button validates Round 2
Round 3
  ↓ [Submit] button validates Round 3
  ↓ Calls onComplete(data)
Submitted!
```

### Key Features

1. **Progressive Disclosure**
   - Only show relevant fields
   - Subcategories appear after category selected
   - File upload only shows if "upload" selected

2. **Form Validation**
   - Validate before allowing next round
   - Show clear error messages
   - Disable next button until valid

3. **localStorage Draft Saving**
   - After each round completes, save to localStorage
   - Key: `threeRoundForm`
   - On component mount, restore if exists
   - Allow user to resume if they close tab

4. **Loading States**
   - Show spinner during onComplete submission
   - Disable buttons while submitting
   - Show error message if submission fails

5. **Accessibility**
   - ARIA labels on all inputs
   - Keyboard navigation (Tab through fields)
   - Error messages announced to screen readers
   - Color picker accessible via hex input fallback

---

## 📡 API Integration

### When Component Mounts
1. Fetch `website_categories` list
2. Display in Round 2 selector
3. Show loading state if fetching

### When Category Selected (Round 2)
1. Fetch `website_subcategories` for that category
2. Update dropdown options
3. Pre-select first if only one option

### When Form Submitted (onComplete)
```typescript
// onComplete handler (from parent) does:
POST /api/save-rounds
  ← Input: { round1, round2, round3 }
  ← Output: { projectId, needsVerification }
  ← Redirect: /get-started/verify/[projectId]
```

---

## 🎨 UI/UX Specifications

### Layout
- **Max width:** 800px (centered)
- **Padding:** 32px (desktop), 16px (mobile)
- **Background:** Light bg with card container
- **Dark mode:** Full support with dark:* tailwind classes

### Progress Indicator
- Show "Round 1/3", "Round 2/3", "Round 3/3"
- Visual progress bar (████░░░)
- Percentage (33%, 66%, 100%)

### Buttons
- **[Previous]** - Appears on Round 2+, goes back one step
- **[Next]** - Appears on Round 1-2, advances one step
- **[Submit]** - Appears on Round 3, calls onComplete
- **[Cancel]** - Optional, returns to homepage

### Form Inputs
- Use Shadcn UI components (Input, Textarea, Select, Checkbox)
- Clear labels above each field
- Placeholder text showing example
- Error messages in red below field
- Focus state with blue outline

### Mobile Responsive
- Single column layout
- Full width inputs
- Larger touch targets (48px minimum)
- Stacked buttons

---

## ✅ Validation Rules

### Round 1
- **Email:** Must match `/^[^@]+@[^@]+\.[^@]+$/`
- **Business Name:** Length 3-100, no special characters
- **Business Description:** Optional, max 500 chars
- **Target Audience:** Optional, max 200 chars
- **Colors:** Valid hex format (6 digits) or color name

### Round 2
- **Category:** Required, must exist in DB
- **Subcategory:** Required if category selected
- **Custom Category:** Optional, 3-100 chars if provided

### Round 3
- **Content Source:** Required, one of 3 options
- **Files:** Optional, max 10MB each, 50MB total
- **Additional Notes:** Optional, max 500 chars

### Error Messages
```
"Invalid email address" - Email validation fails
"Business name must be 3-100 characters" - Name validation fails
"Please select a category" - Category required but missing
"Please select a subcategory" - Subcategory required but missing
"File too large (max 10MB)" - File size exceeds limit
```

---

## 🔌 Props & Handlers

### Props
```typescript
interface ThreeRoundFlowProps {
  // Called when all 3 rounds are submitted
  // Should POST to /api/save-rounds
  onComplete: (data: {
    round1: Round1Data,
    round2: Round2Data,
    round3: Round3Data
  }) => Promise<void>
}
```

### Event Handlers (Internal)
```typescript
handleNextRound() // Validate current round, advance
handlePreviousRound() // Go back one step
handleSubmit() // Validate Round 3, call onComplete
handleFileUpload() // Handle file selection
handleColorChange() // Handle color picker change
```

---

## 📊 Data Flow

```
User fills Round 1
  ↓ clicks [Next]
  ↓ validate email, name
  ↓ save to localStorage
  ↓ advance to Round 2

User selects Category
  ↓ fetch subcategories
  ↓ show dropdown

User selects Subcategory
  ↓ clicks [Next]
  ↓ validate selections
  ↓ save to localStorage
  ↓ advance to Round 3

User selects Content Source
  ↓ if "upload" selected:
    ↓ show file upload
  ↓ clicks [Submit]
  ↓ validate Round 3
  ↓ save to localStorage
  ↓ POST to /api/save-rounds
  ↓ receive projectId
  ↓ parent redirects to verify page
```

---

## 🧪 Testing Checklist

### Component Rendering
- [ ] Component renders without errors
- [ ] All 3 rounds display correctly
- [ ] Progress indicator shows correct step
- [ ] Color picker works
- [ ] Category dropdown loads from DB

### Form Validation
- [ ] Invalid email blocked from next
- [ ] Short business name blocked
- [ ] Missing category blocked
- [ ] Error messages display clearly
- [ ] Required fields marked with *

### Navigation
- [ ] Next button advances round
- [ ] Previous button goes back
- [ ] Submit button on Round 3 only
- [ ] Can't skip required fields

### localStorage
- [ ] Data saves after each round
- [ ] Data restores on page refresh
- [ ] Can resume incomplete form
- [ ] Data cleared after successful submit

### API Integration
- [ ] Calls onComplete on submit
- [ ] Passes correct data structure
- [ ] Handles API errors gracefully
- [ ] Shows loading state during submit

### Mobile
- [ ] Responsive layout
- [ ] Touch-friendly buttons
- [ ] Color picker works on mobile
- [ ] File upload works on mobile

---

## 🚀 Implementation Checklist

### File Creation
- [ ] Create `src/components/questions/ThreeRoundFlow.tsx`

### Component Setup
- [ ] Import necessary dependencies
- [ ] Define TypeScript interfaces
- [ ] Set up state management

### Round 1
- [ ] Email input with validation
- [ ] Business name input with validation
- [ ] Description textarea (optional)
- [ ] Target audience input (optional)
- [ ] Primary color picker
- [ ] Secondary color picker
- [ ] localStorage save

### Round 2
- [ ] Fetch categories from DB
- [ ] Category selector dropdown/radio
- [ ] Subcategory conditional display
- [ ] Fetch subcategories when category selected
- [ ] Custom category fallback
- [ ] localStorage save

### Round 3
- [ ] Content source radio buttons
- [ ] Conditional file upload
- [ ] File validation & upload
- [ ] Additional notes textarea
- [ ] localStorage save

### Navigation
- [ ] Previous button (Round 2+)
- [ ] Next button (Round 1-2)
- [ ] Submit button (Round 3)
- [ ] Form validation on advance
- [ ] Progress indicator

### Error Handling
- [ ] Validate inputs before next
- [ ] Display error messages
- [ ] Handle API errors
- [ ] Show loading states
- [ ] Handle network failures

### Styling
- [ ] Responsive layout
- [ ] Dark mode support
- [ ] Accessibility (ARIA)
- [ ] Focus states
- [ ] Mobile optimized

---

## 📝 Notes

### Design Principles
1. **Progressive:** Guide user step-by-step
2. **Minimal:** Only ask what's necessary
3. **Intuitive:** Clear labels and examples
4. **Forgiving:** Allow undo (Previous button)
5. **Smart:** Pre-select/suggest when possible

### AI-First Philosophy
- Data collected is used ONLY for AI context
- User controls how much detail to provide
- Optional fields allow quick completion
- Ability to add more detail later (deep-dive)

### Future Enhancements
- [ ] Smart category suggestions (AI-powered)
- [ ] Dynamic question generation
- [ ] File upload preview
- [ ] Auto-save as you type
- [ ] Multi-step file processing

---

## 📚 Related Documentation

See these files for more context:
- **IMPLEMENTATION-ROADMAP.md** - Step-by-step implementation guide
- **GET-STARTED-AI-FIRST-ANALYSIS.md** - Complete technical analysis
- **QUICKSTART.md** - Quick reference guide
- **FLOW-DIAGRAMS.txt** - Visual API sequences

---

## ✨ Success Criteria

After implementation:
- ✅ Component renders without errors
- ✅ All 3 rounds work independently
- ✅ Form validation prevents bad data
- ✅ Data saves to database via API
- ✅ localStorage allows resume
- ✅ Responsive on mobile
- ✅ No console errors
- ✅ Ready for testing with real users

---

**Status:** Complete specification ready for development
**Next Step:** Create the component following this spec

