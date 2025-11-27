# Dark Mode Pattern Guide

**CRITICAL:** All new components MUST include dark mode classes using the `dark:` prefix.

## Quick Rules

1. **Always use theme variables, NOT hardcoded colors:**
   - ✅ `bg-primary` / `bg-card` / `bg-muted`
   - ❌ `bg-blue-600` / `bg-white` / `bg-gray-50`

2. **Always add `dark:` variants for readability:**
   - ✅ `text-foreground dark:text-slate-100`
   - ❌ `text-gray-900`

3. **Use these dark mode mappings:**
   ```
   Background: bg-background → dark:bg-slate-950
   Card: bg-card → dark:bg-slate-900
   Muted: bg-muted → dark:bg-slate-800
   Borders: border-border → dark:border-slate-700
   Text: text-foreground → dark:text-slate-100
   Muted Text: text-muted-foreground → dark:text-slate-400
   ```

## Component Template

```tsx
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MyComponent() {
  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <Card className="p-6 dark:bg-slate-900 dark:border-slate-700">
        {/* Content */}
        <h1 className="text-foreground dark:text-slate-100">Title</h1>
        <p className="text-muted-foreground dark:text-slate-400">Description</p>

        {/* Interactive elements */}
        <Button className="bg-primary hover:bg-primary-hover">Action</Button>

        {/* Highlight boxes */}
        <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30">
          Important content
        </div>

        {/* Accent elements */}
        <div className="bg-accent/10 dark:bg-accent/20 border border-accent text-accent-foreground dark:text-accent">
          Featured content
        </div>
      </Card>
    </div>
  );
}
```

## Color Palette Reference

From `/src/app/globals.css`:

```
Light Mode (Default):
--primary: #0a1840 (dark blue)
--secondary: #00509d (bright blue)
--accent: #ffdb57 (yellow)
--foreground: #11296b (navy text)
--background: #ededed (light gray)
--card: #ffffff (white)
--muted: #f4f4f4 (off-white)
--border: #bccbf5 (light blue)

Dark Mode (Tailwind):
bg-slate-950 (near black - darkest)
bg-slate-900 (very dark gray)
bg-slate-800 (dark gray)
text-slate-100 (very light text)
text-slate-400 (medium gray text)
border-slate-700 (dark borders)
```

## Common Patterns

### Status Colors (with dark mode)
```tsx
<div className="text-green-600 dark:text-green-400">Success</div>
<div className="text-red-600 dark:text-red-400">Error</div>
<div className="text-blue-600 dark:text-blue-400">Info</div>
```

### Input Fields
```tsx
<input
  className="border border-border dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100
             focus:ring-2 focus:ring-primary rounded-lg px-3 py-2"
/>
```

### Hover States
```tsx
className="hover:bg-muted dark:hover:bg-slate-700 transition-colors"
```

### Dividers
```tsx
className="border-t border-border dark:border-slate-700"
```

## Checklist for New Pages

- [ ] Root div has `bg-background dark:bg-slate-950`
- [ ] All text uses `dark:text-slate-100` or `dark:text-slate-400`
- [ ] All cards use `dark:bg-slate-900 dark:border-slate-700`
- [ ] All borders use `dark:border-slate-700`
- [ ] Input fields have `dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600`
- [ ] No hardcoded colors like `blue-600`, `gray-50`, etc.
- [ ] All interactive elements show hover state in dark mode
- [ ] Tested both light and dark modes

## Testing Dark Mode

1. Click the dark mode toggle (bottom right)
2. Verify all text is readable
3. Verify all borders are visible
4. Verify all backgrounds contrast properly
