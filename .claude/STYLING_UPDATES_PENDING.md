# Styling Updates - Pending Implementation

**Status**: Ready for Implementation
**Priority**: High
**Related**: Phase 1 styling refactor (get-started flow)

## Overview
Replace green accent colors with yellow, enforce strict blue/white/yellow color scheme, and update button hover effects to use yellow borders instead of background fills.

---

## Tasks

### 1. Color Scheme Enforcement
**Description**: Restrict all accent colors to blue (#primary), white, and yellow (#accent)
**Scope**: All recently refactored Phase 1 files
**Files to Check**:
- `/src/app/get-started/page.tsx`
- `/src/components/builder/FormContainer.tsx`
- `/src/components/builder/steps/StepCategory.tsx`
- `/src/components/builder/steps/StepBusinessInfo.tsx`
- `/src/components/builder/steps/StepPreview.tsx`

**Action Items**:
- [ ] Find all `text-green-600 dark:text-green-400` and replace with yellow (`text-accent` or `text-yellow`)
- [ ] Find all `bg-green-50/20` background colors and replace appropriately
- [ ] Verify only blue, white, and yellow are used for UI elements

---

### 2. Replace Green Checkmarks with Yellow Lightning Bolts
**Description**: Update icon styling to use lightning bolts instead of checkmarks, styled in yellow
**Files to Update**:
- `/src/components/builder/steps/StepCategory.tsx` - Selection summary icon (line 221)
- `/src/components/builder/steps/StepPreview.tsx` - Feature lists (lines 128, 209, 212, 216)

**Changes**:
- [ ] Replace `<Check>` icon import with lightning icon (e.g., `Zap` from lucide-react)
- [ ] Change color from `text-green-500` to `text-accent` (yellow)
- [ ] Update styling for emphasis/highlight purposes

---

### 3. Button Hover Effects - Yellow Border Pattern
**Description**: Change all button hover effects from background color fill to thin yellow border
**Pattern to Implement**:
```
Default: bg-primary text-primary-foreground
Hover: bg-primary text-primary-foreground border-2 border-accent
```

**Files to Update**:
- [ ] `/src/app/get-started/page.tsx` - "Generate My Preview" button (line 126)
- [ ] `/src/components/builder/FormContainer.tsx` - "Next" button (line 188)
- [ ] `/src/components/builder/steps/StepPreview.tsx` - "Get Complete Package" button (line 137)
- [ ] `/src/components/builder/steps/StepPreview.tsx` - "Get Guidebook" buttons (lines 233, 269)
- [ ] `/src/components/builder/steps/StepPreview.tsx` - "Save My Progress" button (line 269)
- [ ] All secondary/outline buttons should also get yellow border on hover

**Current Hover Style to Replace**:
- `hover:from-blue-700 hover:to-purple-700`
- `hover:bg-primary/90`

**New Hover Style**:
- `hover:border-2 hover:border-accent`

---

### 4. Recommended Feature Highlighting
**Description**: Use yellow styling for "Popular" or "Recommended" badges and borders
**Files to Check**:
- `/src/components/builder/steps/StepPreview.tsx` (lines 51, 306, 328)

**Current Pattern**:
```
bg-blue-100 text-blue-700
```

**New Pattern**:
```
bg-accent/20 text-accent  (or use border: border-2 border-accent)
```

---

## Color Reference
From `/src/app/globals.css`:

**Light Mode** (:root):
- `--primary: #0a1840` (Dark Blue)
- `--accent: #ffdb57` (Yellow/Mustard)
- `--foreground: #11296b` (Blue text)
- `--background: #ededed` (Light gray)

**Dark Mode** (.dark):
- `--primary: #3b82f6` (Bright Blue)
- `--accent: #fbbf24` (Yellow)
- `--foreground: #f1f5f9` (Light text)
- `--background: #0f172a` (Dark blue-black)

---

## Testing Checklist
After implementing these changes:
- [ ] Verify yellow borders appear on all button hovers
- [ ] Confirm green checkmarks are replaced with yellow lightning bolts
- [ ] Test in both light and dark modes
- [ ] Check mobile responsiveness
- [ ] Ensure contrast ratios are accessible

---

## Related Issues
- Follows Phase 1 styling refactor completion
- Supports unified design system using CSS variables
- Aligns with "Build Once, Own Forever" brand colors
