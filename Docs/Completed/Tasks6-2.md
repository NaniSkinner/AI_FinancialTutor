# SpendSense - Operator Dashboard Core UI Framework Tasks

**Shard**: 2 - Core UI Framework  
**Status**: ✅ COMPLETE  
**Start Date**: November 3, 2025  
**Completion Date**: November 4, 2025  
**Phase**: UI Foundation  
**Actual Size**: ~10% of total dashboard implementation  
**Dependencies**: Shard 1 (Foundation & Setup) - ✅ Complete

---

## ✅ COMPLETION SUMMARY

**All 12 Phases Complete!**

- ✅ Phase 1: Badge & Button Components
- ✅ Phase 2: Modal & Select Components
- ✅ Phase 3: Checkbox, Spinner, Toast Components
- ✅ Phase 4: EmptyState Component
- ✅ Phase 5: Main Dashboard Layout
- ✅ Phase 6: StatsOverview Component
- ✅ Phase 7: useOperatorStats Hook
- ✅ Phase 8: Design Tokens
- ✅ Phase 9-12: Component Organization & Testing

**Key Achievements:**

- ✅ 8 reusable Common components (Badge, Button, Modal, Select, Checkbox, Spinner, Toast, EmptyState)
- ✅ Main dashboard layout with header, grid system, and responsive design
- ✅ StatsOverview component with mock data integration
- ✅ Custom SWR hook for data fetching
- ✅ Design tokens for consistent styling
- ✅ All components fully typed with TypeScript
- ✅ 0 TypeScript errors
- ✅ 0 ESLint errors
- ✅ Production build successful
- ✅ All components use Radix UI primitives + Tailwind CSS

**Note for Future:** User requested dark/light theme toggle feature - to be implemented in later shard

---

## Project Overview

Building the reusable UI component library for the Operator Dashboard. These components follow shadcn/ui patterns and are built with Radix UI primitives + Tailwind CSS. They will be used throughout the dashboard for consistent design and behavior.

**Key Deliverables**:

- 8 common reusable components (Badge, Button, Modal, Select, Checkbox, Spinner, Toast, EmptyState)
- Main dashboard layout with header and grid system
- StatsOverview component for displaying operator metrics
- Custom SWR hook for data fetching
- Design tokens for consistent styling

**Success Criteria**: All components render without errors, fully typed with TypeScript, follow accessibility best practices

---

## Phase 1: Common Components - Badge & Button

### Task 1.1: Create Badge Component

- [ ] Create `/components/Common/Badge.tsx`
- [ ] Import React and cn utility
- [ ] Define `BadgeProps` interface
  - [ ] children: React.ReactNode
  - [ ] className?: string
  - [ ] variant?: 'default' | 'secondary' | 'destructive' | 'outline'
- [ ] Implement Badge component
  - [ ] Use span element
  - [ ] Apply base classes: inline-flex, items-center, px-2.5, py-0.5, rounded-full, text-xs, font-medium
  - [ ] Apply variant-specific classes:
    - [ ] default: bg-gray-100 text-gray-800
    - [ ] secondary: bg-gray-200 text-gray-900
    - [ ] destructive: bg-red-100 text-red-800
    - [ ] outline: border border-gray-300 bg-white text-gray-700
  - [ ] Merge with custom className using cn()
  - [ ] Render children
- [ ] Export Badge component

### Task 1.2: Create Button Component

- [ ] Create `/components/Common/Button.tsx`
- [ ] Import React and cn utility
- [ ] Define `ButtonProps` interface
  - [ ] Extend React.ButtonHTMLAttributes<HTMLButtonElement>
  - [ ] variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  - [ ] size?: 'default' | 'sm' | 'lg'
  - [ ] children: React.ReactNode
- [ ] Implement Button component
  - [ ] Use button element
  - [ ] Apply base classes: inline-flex, items-center, justify-center, rounded-lg, font-medium, transition-colors
  - [ ] Add focus styles: focus-visible:outline-none, focus-visible:ring-2, focus-visible:ring-offset-2
  - [ ] Add disabled styles: disabled:pointer-events-none, disabled:opacity-50
  - [ ] Apply variant-specific classes:
    - [ ] default: bg-indigo-600 text-white hover:bg-indigo-700
    - [ ] destructive: bg-red-600 text-white hover:bg-red-700
    - [ ] outline: border border-gray-300 bg-white hover:bg-gray-50
    - [ ] ghost: hover:bg-gray-100
  - [ ] Apply size-specific classes:
    - [ ] default: h-10 px-4 py-2
    - [ ] sm: h-8 px-3 text-sm
    - [ ] lg: h-12 px-6
  - [ ] Merge with custom className using cn()
  - [ ] Spread remaining props
  - [ ] Render children
- [ ] Export Button component

### Task 1.3: Test Badge and Button

- [ ] Create test page or component
- [ ] Test Badge variants:
  - [ ] Render default badge
  - [ ] Render secondary badge
  - [ ] Render destructive badge
  - [ ] Render outline badge
  - [ ] Test custom className override
- [ ] Test Button variants and sizes:
  - [ ] Render default button
  - [ ] Render destructive button
  - [ ] Render outline button
  - [ ] Render ghost button
  - [ ] Test small size
  - [ ] Test large size
  - [ ] Test disabled state
  - [ ] Test onClick handler

---

## Phase 2: Common Components - Modal & Select

### Task 2.1: Create Modal Component

- [ ] Create `/components/Common/Modal.tsx`
- [ ] Import React, Radix Dialog, and cn utility
- [ ] Define `ModalProps` interface
  - [ ] isOpen: boolean
  - [ ] onClose: () => void
  - [ ] title: string
  - [ ] description?: string
  - [ ] children: React.ReactNode
  - [ ] className?: string
- [ ] Implement Modal component structure
  - [ ] Wrap in Dialog.Root with open and onOpenChange props
  - [ ] Create Dialog.Portal
  - [ ] Add Dialog.Overlay with backdrop styling
    - [ ] fixed inset-0 bg-black/50
    - [ ] Add fade-in/out animations
  - [ ] Add Dialog.Content with modal styling
    - [ ] fixed positioning (centered)
    - [ ] max-w-lg width
    - [ ] bg-white rounded-lg shadow-lg p-6
    - [ ] Add zoom and slide animations
    - [ ] Merge with custom className
  - [ ] Add Dialog.Title
    - [ ] text-lg font-semibold text-gray-900 mb-2
  - [ ] Add Dialog.Description (if provided)
    - [ ] text-sm text-gray-600 mb-4
  - [ ] Render children in content area
  - [ ] Add Dialog.Close button (X icon)
    - [ ] Position absolute right-4 top-4
    - [ ] Add hover and focus styles
    - [ ] Include SVG X icon
- [ ] Export Modal component

### Task 2.2: Create Select Component

- [ ] Create `/components/Common/Select.tsx`
- [ ] Import React, Radix Select, and cn utility
- [ ] Define `SelectProps` interface
  - [ ] value: string
  - [ ] onValueChange: (value: string) => void
  - [ ] options: Array<{ value: string; label: string }>
  - [ ] placeholder?: string
  - [ ] className?: string
- [ ] Implement Select component structure
  - [ ] Wrap in SelectPrimitive.Root
  - [ ] Create SelectPrimitive.Trigger
    - [ ] Apply trigger styling (flex, h-10, border, rounded-lg, px-3, py-2)
    - [ ] Add focus styles (ring-2, ring-indigo-500)
    - [ ] Add disabled styles
    - [ ] Include SelectPrimitive.Value with placeholder
    - [ ] Add SelectPrimitive.Icon (chevron down SVG)
  - [ ] Create SelectPrimitive.Portal
  - [ ] Add SelectPrimitive.Content
    - [ ] bg-white rounded-lg border shadow-lg
    - [ ] position="popper"
  - [ ] Add SelectPrimitive.Viewport
  - [ ] Map through options to create SelectPrimitive.Item for each
    - [ ] Add item styling (cursor-pointer, rounded-sm, py-2, px-8)
    - [ ] Add focus:bg-gray-100
    - [ ] Include SelectPrimitive.ItemText
    - [ ] Add SelectPrimitive.ItemIndicator (checkmark icon)
- [ ] Export Select component

### Task 2.3: Test Modal and Select

- [ ] Test Modal:
  - [ ] Create state for isOpen
  - [ ] Test opening modal
  - [ ] Test closing modal with X button
  - [ ] Test closing with overlay click
  - [ ] Test with description
  - [ ] Test without description
  - [ ] Verify animations work
- [ ] Test Select:
  - [ ] Create state for selected value
  - [ ] Render with multiple options
  - [ ] Test selecting different options
  - [ ] Verify dropdown opens
  - [ ] Verify selection updates state
  - [ ] Test keyboard navigation
  - [ ] Test placeholder display

---

## Phase 3: Common Components - Checkbox, Spinner, Toast

### Task 3.1: Create Checkbox Component

- [ ] Create `/components/Common/Checkbox.tsx`
- [ ] Import React, Radix Checkbox, and cn utility
- [ ] Define `CheckboxProps` interface
  - [ ] checked: boolean
  - [ ] onCheckedChange: (checked: boolean) => void
  - [ ] id?: string
  - [ ] label?: string
  - [ ] className?: string
- [ ] Implement Checkbox component structure
  - [ ] Wrap in div with flex items-center gap-2
  - [ ] Create CheckboxPrimitive.Root
    - [ ] Apply checkbox styling (h-4, w-4, rounded, border)
    - [ ] Add focus styles (ring-2, ring-indigo-500, ring-offset-2)
    - [ ] Add checked state styling (bg-indigo-600, border-indigo-600)
    - [ ] Add disabled styles
  - [ ] Add CheckboxPrimitive.Indicator
    - [ ] Include checkmark SVG (white color)
  - [ ] Add label element (if label provided)
    - [ ] htmlFor={id}
    - [ ] text-sm font-medium text-gray-700 cursor-pointer
- [ ] Export Checkbox component

### Task 3.2: Create Spinner Component

- [ ] Create `/components/Common/Spinner.tsx`
- [ ] Import React and cn utility
- [ ] Define `SpinnerProps` interface
  - [ ] size?: 'sm' | 'md' | 'lg'
  - [ ] className?: string
- [ ] Implement Spinner component
  - [ ] Use div element
  - [ ] Apply base classes: animate-spin, rounded-full
  - [ ] Add border styling: border-2 border-gray-300 border-t-indigo-600
  - [ ] Apply size-specific classes:
    - [ ] sm: h-4 w-4
    - [ ] md: h-8 w-8
    - [ ] lg: h-12 w-12
  - [ ] Add role="status" and aria-label="Loading"
  - [ ] Include sr-only span with "Loading..." text
- [ ] Export Spinner component

### Task 3.3: Create Toast Component

- [ ] Create `/components/Common/Toast.tsx`
- [ ] Import React and cn utility
- [ ] Define `ToastProps` interface
  - [ ] type: 'success' | 'error' | 'warning' | 'info'
  - [ ] message: string
  - [ ] onClose: () => void
- [ ] Implement Toast component
  - [ ] Create icons object mapping type to icon character
    - [ ] success: '✓'
    - [ ] error: '✗'
    - [ ] warning: '⚠'
    - [ ] info: 'ℹ'
  - [ ] Create colors object mapping type to Tailwind classes
    - [ ] success: bg-green-50 border-green-200 text-green-800
    - [ ] error: bg-red-50 border-red-200 text-red-800
    - [ ] warning: bg-yellow-50 border-yellow-200 text-yellow-800
    - [ ] info: bg-blue-50 border-blue-200 text-blue-800
  - [ ] Render toast container
    - [ ] fixed bottom-4 right-4 z-50
    - [ ] flex items-center gap-3
    - [ ] px-4 py-3 rounded-lg border shadow-lg
    - [ ] Apply color based on type
  - [ ] Add icon span
  - [ ] Add message paragraph
  - [ ] Add close button with X icon
- [ ] Export Toast component

### Task 3.4: Test Checkbox, Spinner, Toast

- [ ] Test Checkbox:
  - [ ] Create state for checked
  - [ ] Test checking/unchecking
  - [ ] Test with label
  - [ ] Test without label
  - [ ] Verify keyboard interaction
- [ ] Test Spinner:
  - [ ] Render small spinner
  - [ ] Render medium spinner
  - [ ] Render large spinner
  - [ ] Verify animation works
- [ ] Test Toast:
  - [ ] Show success toast
  - [ ] Show error toast
  - [ ] Show warning toast
  - [ ] Show info toast
  - [ ] Test close button
  - [ ] Verify positioning

---

## Phase 4: Common Components - EmptyState

### Task 4.1: Create EmptyState Component

- [ ] Create `/components/Common/EmptyState.tsx`
- [ ] Import React
- [ ] Define `EmptyStateProps` interface
  - [ ] title: string
  - [ ] description?: string
  - [ ] icon?: React.ReactNode
  - [ ] action?: { label: string; onClick: () => void }
- [ ] Implement EmptyState component
  - [ ] Wrap in div with centering and styling
    - [ ] text-center py-12 bg-white rounded-lg border border-gray-200
  - [ ] Render icon if provided
    - [ ] mb-4 flex justify-center text-gray-400
  - [ ] Render title
    - [ ] h3: text-lg font-medium text-gray-900
  - [ ] Render description if provided
    - [ ] p: mt-1 text-sm text-gray-500
  - [ ] Render action button if provided
    - [ ] mt-4 inline-flex items-center px-4 py-2
    - [ ] border border-gray-300 rounded-lg
    - [ ] text-sm font-medium text-gray-700
    - [ ] bg-white hover:bg-gray-50
    - [ ] onClick handler
- [ ] Export EmptyState component

### Task 4.2: Test EmptyState

- [ ] Test with title only
- [ ] Test with title and description
- [ ] Test with icon
- [ ] Test with action button
- [ ] Test action button onClick
- [ ] Verify styling and layout

---

## Phase 5: Main Dashboard Layout

### Task 5.1: Create Main Dashboard Page Structure

- [ ] Open `/pages/index.tsx` (or create if not exists)
- [ ] Import necessary components
  - [ ] ReviewQueue (placeholder for now)
  - [ ] AlertPanel (placeholder for now)
  - [ ] StatsOverview
- [ ] Create OperatorDashboard component

### Task 5.2: Implement Header Section

- [ ] Create header element
  - [ ] bg-white border-b border-gray-200 sticky top-0 z-50
- [ ] Add max-width container
  - [ ] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- [ ] Create header flex container
  - [ ] flex justify-between items-center h-16
- [ ] Add left side: Logo/Title
  - [ ] h1: text-2xl font-bold text-gray-900
  - [ ] Text: "SpendSense Operator View"
- [ ] Add right side: Stats + User info
  - [ ] Quick stats display:
    - [ ] "Pending: " label
    - [ ] Count in text-orange-600 font-bold
  - [ ] Operator info:
    - [ ] Avatar circle (w-8 h-8 bg-indigo-600 rounded-full)
    - [ ] Initials in white text
    - [ ] Name: text-sm font-medium text-gray-700

### Task 5.3: Implement Alert Banner Section

- [ ] Add AlertPanel component below header
- [ ] Create placeholder AlertPanel component if needed
  - [ ] Returns null or simple div for now

### Task 5.4: Implement Main Content Section

- [ ] Create main element
  - [ ] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
- [ ] Add grid layout
  - [ ] grid grid-cols-12 gap-6
- [ ] Add left sidebar (stats)
  - [ ] col-span-3
  - [ ] Contains StatsOverview component
- [ ] Add main content area (review queue)
  - [ ] col-span-9
  - [ ] Contains ReviewQueue component (placeholder)

### Task 5.5: Export and Test Layout

- [ ] Export OperatorDashboard as default
- [ ] Run dev server and view page
- [ ] Verify header displays correctly
- [ ] Verify grid layout works
- [ ] Verify responsive design (check at different widths)
- [ ] Verify sticky header behavior

---

## Phase 6: StatsOverview Component

### Task 6.1: Create StatsOverview Component File

- [ ] Create `/components/StatsOverview.tsx`
- [ ] Import React
- [ ] Import useOperatorStats hook (will create next)
- [ ] Import Spinner component

### Task 6.2: Implement StatsOverview Component Logic

- [ ] Define StatsOverview component
- [ ] Call useOperatorStats hook
  - [ ] Destructure: data, isLoading, error
- [ ] Handle loading state
  - [ ] If isLoading, return centered Spinner
- [ ] Handle error state
  - [ ] If error, return error message in text-sm text-red-600
- [ ] Handle success state with data

### Task 6.3: Implement Stats Display Cards

- [ ] Wrap in div with space-y-4
- [ ] Add heading: "Overview" (h2, text-lg font-semibold)
- [ ] Create Pending Review card
  - [ ] bg-white rounded-lg border border-gray-200 p-4
  - [ ] Label: "Pending Review" (text-sm text-gray-600)
  - [ ] Value: stats?.pending (text-3xl font-bold text-orange-600 mt-1)
- [ ] Create Approved Today card
  - [ ] Label: "Approved Today"
  - [ ] Value: stats?.approved_today (text-green-600)
- [ ] Create Rejected Today card
  - [ ] Label: "Rejected Today"
  - [ ] Value: stats?.rejected_today (text-red-600)
- [ ] Create Flagged Items card
  - [ ] Label: "Flagged Items"
  - [ ] Value: stats?.flagged (text-yellow-600)
- [ ] Create Average Review Time card
  - [ ] Label: "Avg Review Time"
  - [ ] Value: stats?.avg_review_time_seconds with "s" suffix (text-2xl text-gray-900)

### Task 6.4: Export and Test StatsOverview

- [ ] Export StatsOverview component
- [ ] Test with mock data
- [ ] Verify all cards display
- [ ] Verify loading state shows spinner
- [ ] Verify error state shows message
- [ ] Check responsiveness

---

## Phase 7: Custom Hooks - useOperatorStats

### Task 7.1: Create useOperatorStats Hook File

- [ ] Create `/hooks/useOperatorStats.ts`
- [ ] Import useSWR from 'swr'
- [ ] Import fetchOperatorStats from '@/lib/api'
- [ ] Import OperatorStats type from '@/lib/types'

### Task 7.2: Implement useOperatorStats Hook

- [ ] Define useOperatorStats function
- [ ] Call useSWR with type parameter <OperatorStats>
  - [ ] Key: '/api/operator/stats'
  - [ ] Fetcher: fetchOperatorStats
  - [ ] Options object:
    - [ ] refreshInterval: 30000 (30 seconds)
    - [ ] revalidateOnFocus: true
- [ ] Destructure: data, error, isLoading, mutate
- [ ] Return object with all values
  - [ ] data
  - [ ] error
  - [ ] isLoading
  - [ ] mutate

### Task 7.3: Export and Test Hook

- [ ] Export useOperatorStats function
- [ ] Test in StatsOverview component
- [ ] Verify data fetching works (or returns mock/error)
- [ ] Test refresh interval behavior
- [ ] Test revalidation on focus

---

## Phase 8: Design Tokens

### Task 8.1: Create Design Tokens File

- [ ] Create `/lib/design-tokens.ts`
- [ ] Add file header comment

### Task 8.2: Define Color Palette

- [ ] Create `colors` export object
- [ ] Define `priority` colors:
  - [ ] high: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
  - [ ] medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' }
  - [ ] low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
- [ ] Define `persona` colors:
  - [ ] high_utilization: { bg: 'bg-red-100', text: 'text-red-800' }
  - [ ] variable_income_budgeter: { bg: 'bg-orange-100', text: 'text-orange-800' }
  - [ ] student: { bg: 'bg-blue-100', text: 'text-blue-800' }
  - [ ] subscription_heavy: { bg: 'bg-purple-100', text: 'text-purple-800' }
  - [ ] savings_builder: { bg: 'bg-green-100', text: 'text-green-800' }
- [ ] Define `status` colors:
  - [ ] pending: { bg: 'bg-orange-100', text: 'text-orange-800' }
  - [ ] approved: { bg: 'bg-green-100', text: 'text-green-800' }
  - [ ] rejected: { bg: 'bg-red-100', text: 'text-red-800' }
  - [ ] flagged: { bg: 'bg-yellow-100', text: 'text-yellow-800' }

### Task 8.3: Define Spacing Scale

- [ ] Create `spacing` export object
- [ ] Define values:
  - [ ] xs: '0.25rem' (4px)
  - [ ] sm: '0.5rem' (8px)
  - [ ] md: '1rem' (16px)
  - [ ] lg: '1.5rem' (24px)
  - [ ] xl: '2rem' (32px)
  - [ ] 2xl: '3rem' (48px)

### Task 8.4: Define Border Radius Scale

- [ ] Create `borderRadius` export object
- [ ] Define values:
  - [ ] sm: '0.25rem' (4px)
  - [ ] md: '0.5rem' (8px)
  - [ ] lg: '0.75rem' (12px)
  - [ ] full: '9999px'

### Task 8.5: Define Font Size Scale

- [ ] Create `fontSize` export object
- [ ] Define values:
  - [ ] xs: '0.75rem' (12px)
  - [ ] sm: '0.875rem' (14px)
  - [ ] base: '1rem' (16px)
  - [ ] lg: '1.125rem' (18px)
  - [ ] xl: '1.25rem' (20px)
  - [ ] 2xl: '1.5rem' (24px)
  - [ ] 3xl: '1.875rem' (30px)

### Task 8.6: Export and Test Design Tokens

- [ ] Verify all exports
- [ ] Test importing in components
- [ ] Consider using design tokens in existing components

---

## Phase 9: Component Index Files

### Task 9.1: Create Component Index Files

- [ ] Create `/components/Common/index.ts`
  - [ ] Export all common components
  - [ ] Export { Badge } from './Badge'
  - [ ] Export { Button } from './Button'
  - [ ] Export { Modal } from './Modal'
  - [ ] Export { Select } from './Select'
  - [ ] Export { Checkbox } from './Checkbox'
  - [ ] Export { Spinner } from './Spinner'
  - [ ] Export { Toast } from './Toast'
  - [ ] Export { EmptyState } from './EmptyState'

### Task 9.2: Update Imports Throughout Project

- [ ] Update any component imports to use barrel exports
- [ ] Example: `import { Button, Badge } from '@/components/Common'`
- [ ] Verify all imports still work

---

## Phase 10: Accessibility & Polish

### Task 10.1: Add ARIA Labels and Roles

- [ ] Review Button component
  - [ ] Ensure button role (native button element)
  - [ ] Add aria-label if needed for icon-only buttons
- [ ] Review Modal component
  - [ ] Verify aria-labelledby on Dialog.Content
  - [ ] Verify aria-describedby if description present
  - [ ] Ensure focus trap works
  - [ ] Test Escape key closes modal
- [ ] Review Select component
  - [ ] Verify aria-label on trigger
  - [ ] Test keyboard navigation (arrow keys, Enter, Escape)
- [ ] Review Checkbox component
  - [ ] Ensure proper label association
  - [ ] Test keyboard interaction (Space to toggle)

### Task 10.2: Test Keyboard Navigation

- [ ] Test Tab order through all interactive elements
- [ ] Test focus indicators are visible
- [ ] Test Enter key activates buttons
- [ ] Test Space key toggles checkboxes
- [ ] Test arrow keys navigate select options
- [ ] Test Escape key closes modal and select

### Task 10.3: Add Loading States

- [ ] Ensure StatsOverview shows spinner while loading
- [ ] Add loading prop to Button component (optional)
  - [ ] Show spinner inside button when loading
  - [ ] Disable button when loading
- [ ] Test loading states work correctly

### Task 10.4: Add Error Boundaries (Optional)

- [ ] Create ErrorBoundary component (if not exists)
- [ ] Wrap key areas in ErrorBoundary
- [ ] Test error handling

---

## Phase 11: Responsive Design

### Task 11.1: Test Dashboard Layout Responsiveness

- [ ] Test at mobile width (320px-640px)
  - [ ] Verify header doesn't break
  - [ ] Check if grid should stack vertically
  - [ ] Consider collapsing sidebar
- [ ] Test at tablet width (640px-1024px)
  - [ ] Verify layout adjusts appropriately
- [ ] Test at desktop width (1024px+)
  - [ ] Verify 12-column grid works
  - [ ] Check max-width container

### Task 11.2: Add Responsive Utilities

- [ ] Consider adding mobile menu for stats
- [ ] Consider adjusting grid on smaller screens:
  - [ ] col-span-12 on mobile (stack)
  - [ ] col-span-4 / col-span-8 on tablet
  - [ ] col-span-3 / col-span-9 on desktop
- [ ] Test header responsiveness
  - [ ] Consider hiding/showing elements on mobile

### Task 11.3: Update Components for Mobile

- [ ] Test Modal on mobile
  - [ ] Adjust max-width or make full-width on small screens
- [ ] Test Select dropdown on mobile
  - [ ] Verify dropdown doesn't overflow screen
- [ ] Test all components on mobile devices

---

## Phase 12: Documentation & Examples

### Task 12.1: Document Component Usage

- [ ] Create `/components/Common/README.md`
- [ ] Document each component:
  - [ ] Badge: props, variants, usage examples
  - [ ] Button: props, variants, sizes, usage examples
  - [ ] Modal: props, usage example with state
  - [ ] Select: props, usage example
  - [ ] Checkbox: props, usage example
  - [ ] Spinner: props, sizes, usage example
  - [ ] Toast: props, types, usage example
  - [ ] EmptyState: props, usage example

### Task 12.2: Create Component Examples

- [ ] Create `/pages/components-demo.tsx` (optional dev page)
- [ ] Show all Badge variants
- [ ] Show all Button variants and sizes
- [ ] Show Modal with open/close
- [ ] Show Select with options
- [ ] Show Checkbox examples
- [ ] Show Spinner sizes
- [ ] Show Toast types
- [ ] Show EmptyState variations

### Task 12.3: Add Code Examples to README

- [ ] For each component, add code snippet
- [ ] Show import statement
- [ ] Show basic usage
- [ ] Show advanced usage (custom styling, etc.)

---

## Phase 13: Testing & Verification

### Task 13.1: Visual Testing Checklist

- [ ] **Badge Component**:
  - [ ] All variants render correctly
  - [ ] Custom className works
  - [ ] Text truncation works for long content
- [ ] **Button Component**:
  - [ ] All variants render with correct colors
  - [ ] All sizes render correctly
  - [ ] Hover states work
  - [ ] Focus ring appears on keyboard focus
  - [ ] Disabled state works
  - [ ] onClick fires correctly
- [ ] **Modal Component**:
  - [ ] Opens with smooth animation
  - [ ] Closes on X button click
  - [ ] Closes on overlay click
  - [ ] Closes on Escape key
  - [ ] Focus returns to trigger after close
  - [ ] Content scrolls if too tall
- [ ] **Select Component**:
  - [ ] Dropdown opens on click
  - [ ] Options display correctly
  - [ ] Selection updates value
  - [ ] Checkmark shows on selected item
  - [ ] Closes after selection
  - [ ] Keyboard navigation works
- [ ] **Checkbox Component**:
  - [ ] Toggles on click
  - [ ] Toggles on Space key
  - [ ] Label click toggles checkbox
  - [ ] Checkmark appears when checked
  - [ ] Works without label
- [ ] **Spinner Component**:
  - [ ] Animates smoothly
  - [ ] All sizes display correctly
  - [ ] Custom className works
- [ ] **Toast Component**:
  - [ ] All types show correct colors and icons
  - [ ] Closes on X button click
  - [ ] Positioned correctly (bottom-right)
  - [ ] Multiple toasts stack correctly (if tested)
- [ ] **EmptyState Component**:
  - [ ] Displays with title
  - [ ] Shows description when provided
  - [ ] Shows icon when provided
  - [ ] Action button works when provided

### Task 13.2: Integration Testing

- [ ] **StatsOverview Component**:
  - [ ] Renders with mock data
  - [ ] Shows loading spinner
  - [ ] Shows error message on error
  - [ ] All stat cards display correctly
  - [ ] Numbers format correctly
- [ ] **Main Dashboard Layout**:
  - [ ] Header renders correctly
  - [ ] Grid layout displays properly
  - [ ] StatsOverview appears in left column
  - [ ] All components render without errors

### Task 13.3: TypeScript Validation

- [ ] Run `npx tsc --noEmit`
- [ ] Verify no type errors in any components
- [ ] Check all props are correctly typed
- [ ] Verify all imports resolve

### Task 13.4: Linting and Formatting

- [ ] Run `npm run lint`
- [ ] Fix any linting errors
- [ ] Format code with Prettier (if configured)
- [ ] Ensure consistent code style

---

## Acceptance Criteria Checklist

### Must Have

- [ ] **All common components implemented**
  - [ ] Badge (4 variants)
  - [ ] Button (4 variants, 3 sizes)
  - [ ] Modal (with Radix Dialog)
  - [ ] Select (with Radix Select)
  - [ ] Checkbox (with Radix Checkbox)
  - [ ] Spinner (3 sizes)
  - [ ] Toast (4 types)
  - [ ] EmptyState
- [ ] **Components are fully typed with TypeScript**
  - [ ] All props have interfaces
  - [ ] No `any` types used
  - [ ] Proper React types for children, events, etc.
- [ ] **Components use Tailwind CSS for styling**
  - [ ] No inline styles or CSS files for components
  - [ ] Consistent use of Tailwind classes
  - [ ] Custom classes merged with cn() utility
- [ ] **Main dashboard layout created**
  - [ ] Header with title and operator info
  - [ ] Grid layout (3/9 split)
  - [ ] Sticky header
  - [ ] Responsive container
- [ ] **StatsOverview component functional**
  - [ ] Fetches data with SWR hook
  - [ ] Displays all 5 stat cards
  - [ ] Shows loading state
  - [ ] Shows error state
- [ ] **All components render without errors**
  - [ ] No console errors
  - [ ] No runtime errors
  - [ ] Dev server runs smoothly
- [ ] **Components are reusable and composable**
  - [ ] Can be imported and used in any component
  - [ ] Accept className for custom styling
  - [ ] Work with different prop combinations

### Should Have

- [ ] **Components follow accessibility best practices**
  - [ ] Proper ARIA labels where needed
  - [ ] Keyboard navigation works
  - [ ] Focus indicators visible
  - [ ] Screen reader friendly
- [ ] **Loading and error states handled**
  - [ ] StatsOverview shows spinner
  - [ ] Error messages displayed
  - [ ] Graceful degradation
- [ ] **Responsive design considerations**
  - [ ] Works on mobile, tablet, desktop
  - [ ] Grid adjusts on smaller screens
  - [ ] No horizontal overflow
- [ ] **Consistent spacing and typography**
  - [ ] Uses design tokens
  - [ ] Consistent padding/margin
  - [ ] Proper text sizes and weights

---

## Component Usage Examples

### Button Examples

```tsx
// Default button
<Button onClick={handleClick}>Save Changes</Button>

// Destructive button
<Button variant="destructive" onClick={handleDelete}>
  Delete Item
</Button>

// Outline button
<Button variant="outline" onClick={handleCancel}>
  Cancel
</Button>

// Small ghost button
<Button variant="ghost" size="sm" onClick={handleEdit}>
  Edit
</Button>

// Large primary button
<Button size="lg" onClick={handleSubmit}>
  Submit Form
</Button>

// Disabled button
<Button disabled>Processing...</Button>
```

### Badge Examples

```tsx
// Default badge
<Badge>Default</Badge>

// Destructive badge
<Badge variant="destructive">Error</Badge>

// Custom styled badge
<Badge className="bg-blue-100 text-blue-800">Custom Blue</Badge>

// Badge in card
<div className="flex items-center gap-2">
  <span>Priority:</span>
  <Badge variant="destructive">High</Badge>
</div>
```

### Modal Example

```tsx
const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

  <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="Confirm Action"
    description="This action cannot be undone. Are you sure?"
  >
    <div className="flex gap-2 justify-end">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleConfirm}>
        Confirm
      </Button>
    </div>
  </Modal>
</>;
```

### Select Example

```tsx
const [value, setValue] = useState("");

<Select
  value={value}
  onValueChange={setValue}
  options={[
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ]}
  placeholder="Select status..."
/>;
```

### Checkbox Example

```tsx
const [checked, setChecked] = useState(false);

<Checkbox
  id="terms"
  checked={checked}
  onCheckedChange={setChecked}
  label="I agree to the terms and conditions"
/>;
```

---

## Testing Checklist

- [ ] **All components import and render correctly**
  - [ ] No import errors
  - [ ] Components render without crashing
- [ ] **Button variants display with correct colors**
  - [ ] Default: indigo background
  - [ ] Destructive: red background
  - [ ] Outline: white with border
  - [ ] Ghost: transparent, hover gray
- [ ] **Modal opens and closes properly**
  - [ ] Opens with animation
  - [ ] Closes on X, overlay, Escape
  - [ ] Blocks background interaction
- [ ] **Select dropdown shows options**
  - [ ] Opens on click
  - [ ] Shows all options
  - [ ] Updates value on selection
  - [ ] Checkmark on selected item
- [ ] **Checkbox toggles state**
  - [ ] Clicks toggle
  - [ ] Space key toggles
  - [ ] Visual feedback on checked
- [ ] **Loading spinner animates**
  - [ ] Smooth rotation
  - [ ] Visible on all backgrounds
- [ ] **Toast notifications appear and dismiss**
  - [ ] All types show correct styling
  - [ ] Close button works
  - [ ] Positioned correctly
- [ ] **Empty state displays correctly**
  - [ ] Title shows
  - [ ] Icon renders if provided
  - [ ] Action button works

---

## Troubleshooting Guide

### Issue: Radix UI components not styling correctly

**Diagnosis:**

- Check if Radix packages installed
- Verify import paths
- Check Tailwind classes applying

**Solution:**

- Reinstall Radix packages: `npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-checkbox`
- Verify imports use correct package names
- Check browser DevTools for applied classes
- Ensure Tailwind content paths include component files

### Issue: Modal doesn't close on overlay click

**Diagnosis:**

- Check Dialog.Root onOpenChange prop
- Verify isOpen state updates
- Check for event bubbling issues

**Solution:**

- Ensure onClose function updates state
- Test state management in parent component
- Check console for errors

### Issue: Select dropdown not positioning correctly

**Diagnosis:**

- Check position="popper" prop
- Verify Portal is rendering
- Check z-index conflicts

**Solution:**

- Add position="popper" to SelectPrimitive.Content
- Ensure Portal is used
- Adjust z-index if needed
- Test in different contexts

### Issue: Checkbox not visually updating

**Diagnosis:**

- Check if checked prop updates
- Verify data-state attribute
- Check Tailwind classes for checked state

**Solution:**

- Ensure parent component updates checked state
- Verify data-[state=checked] classes present
- Check if onCheckedChange fires
- Console.log state changes for debugging

### Issue: StatsOverview not loading data

**Diagnosis:**

- Check if API endpoint exists
- Verify API client function
- Check SWR hook configuration
- Look for CORS errors

**Solution:**

- Mock data for testing if API not ready
- Verify fetchOperatorStats function works
- Check browser Network tab for requests
- Add error handling to hook

### Issue: ERR_CONNECTION_REFUSED errors (Mock data not working)

**Diagnosis:**

- Console shows: `GET http://localhost:8000/api/operator/stats net::ERR_CONNECTION_REFUSED`
- Multiple retry attempts visible
- No "Mock Data" badge in header
- Stats showing 0 or "Failed to load stats"

**Solution:**

```bash
# 1. Check if NEXT_PUBLIC_USE_MOCK_DATA is set
cat .env.local | grep USE_MOCK_DATA

# 2. If missing, add it:
echo "" >> .env.local
echo "# IMPORTANT: Use mock data (no backend required)" >> .env.local
echo "NEXT_PUBLIC_USE_MOCK_DATA=true" >> .env.local

# 3. Stop dev server and clear cache
pkill -f "next dev" || true
rm -rf .next

# 4. Restart dev server
bun run dev
```

**Verification:**

- ✅ Should see "Mock Data" badge in header
- ✅ No connection errors in console
- ✅ Stats show: 47 pending, 23 approved, 4 rejected, 3 flagged, 45s avg time

### Issue: Turbopack Runtime Error (Cannot find module)

**Diagnosis:**

- Error: `Cannot find module '../chunks/ssr/[turbopack]_runtime.js'`
- Dev server crashes on start
- Build cache corruption

**Solution:**

```bash
# Stop all dev servers
pkill -f "next dev" || true

# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# Force reinstall dependencies
bun install --force

# Restart
bun run dev
```

---

## Next Steps After Completion

### Immediate Next Actions

1. **Proceed to Shard 3**: Review Queue Implementation
   - Use Button, Badge, Modal components
   - Build RecommendationCard component
   - Implement filtering and bulk actions
2. **Create placeholder components** for:
   - ReviewQueue (empty for now)
   - AlertPanel (empty for now)
3. **Set up mock data** if API not ready
   - Mock recommendations
   - Mock operator stats
   - Mock alerts

### Integration Points

- [ ] Review Queue will use: Button, Badge, Checkbox, Modal
- [ ] User Explorer will use: Badge, Spinner, EmptyState
- [ ] Decision Traces will use: Badge, EmptyState
- [ ] Alert Panel will use: Badge, Button

### Future Enhancements

- [ ] Add Tooltip component (Radix Tooltip)
- [ ] Add Dropdown Menu component (Radix DropdownMenu)
- [ ] Add Tabs component (Radix Tabs)
- [ ] Add Switch component (Radix Switch)
- [ ] Add Progress component
- [ ] Add Skeleton loader component
- [ ] Add Card component wrapper

---

## Resources

- [Radix UI Documentation](https://www.radix-ui.com/)
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog)
- [Radix UI Select](https://www.radix-ui.com/docs/primitives/components/select)
- [Radix UI Checkbox](https://www.radix-ui.com/docs/primitives/components/checkbox)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [SWR Documentation](https://swr.vercel.app/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## Notes & Decisions

### Decision Log

- **Date**: November 4, 2025 - **Decision**: Use "use client" directive for hook and StatsOverview - **Rationale**: SWR requires client-side rendering; Next.js 16 with Turbopack enforces clear boundaries between server and client components
- **Date**: November 4, 2025 - **Decision**: Use named exports for all components - **Rationale**: Consistency across codebase, better tree-shaking, clearer imports
- **Date**: November 4, 2025 - **Decision**: Dark/light theme toggle deferred to future shard - **Rationale**: User requested, but not blocking for current functionality

### Component Design Rationale

- **Radix UI**: Provides accessible primitives, unstyled for full control
- **Tailwind CSS**: Utility-first approach for rapid styling, matches team patterns
- **No CSS modules**: Keep all styling in Tailwind classes for consistency
- **cn() utility**: Merge custom classes with base classes safely
- **TypeScript strict**: Ensure type safety for all component props

### Known Limitations

- Toast component is basic (no auto-dismiss, no queue management)
- No animation library (using Tailwind and Radix animations only)
- Modal doesn't support nested modals
- Select doesn't support search/filter (could add later)

### Future Improvements

- ⏳ Add Storybook for component documentation
- ⏳ Add proper toast management system (queue, auto-dismiss)
- ⏳ Add more animation variants
- ⏳ **Add theme provider for dark/light mode toggle** (User requested)
- ⏳ Add more keyboard shortcuts
- ⏳ Improve mobile experience with bottom sheets

---

## 🎉 FINAL STATUS: COMPLETE

**Date Completed**: November 4, 2025  
**Development Server**: ✅ Running on http://localhost:3000  
**Build Status**: ✅ Production build successful  
**Type Safety**: ✅ 0 TypeScript errors  
**Code Quality**: ✅ 0 ESLint errors  
**Runtime Status**: ✅ 0 console errors (Mock data working)  
**Accessibility**: ✅ ARIA labels, keyboard navigation, focus management

### What's Ready:

1. ✅ **All 8 Common Components** - Badge, Button, Modal, Select, Checkbox, Spinner, Toast, EmptyState
2. ✅ **Main Dashboard Layout** - Professional header, sticky nav, responsive grid (3/9 split)
3. ✅ **StatsOverview Component** - 5 stat cards with loading/error states
4. ✅ **Custom Hooks** - useOperatorStats with SWR integration
5. ✅ **Design Tokens** - Complete color palette, spacing, typography scales
6. ✅ **Mock Data Integration** - All components ready for testing
7. ✅ **Component Organization** - Index files, named exports, consistent patterns
8. ✅ **Full TypeScript Support** - Strict mode, all interfaces defined

### Component Details:

**Badge Component** (`/components/Common/Badge.tsx`)

- ✅ 4 variants (default, secondary, destructive, outline)
- ✅ Custom className support
- ✅ TypeScript typed

**Button Component** (`/components/Common/Button.tsx`)

- ✅ 4 variants (default, destructive, outline, ghost)
- ✅ 3 sizes (sm, default, lg)
- ✅ Full keyboard navigation
- ✅ Extends native button props

**Modal Component** (`/components/Common/Modal.tsx`)

- ✅ Radix UI Dialog primitive
- ✅ Smooth animations (fade & zoom)
- ✅ Keyboard support (ESC to close)
- ✅ Optional description
- ✅ Focus management

**Select Component** (`/components/Common/Select.tsx`)

- ✅ Radix UI Select primitive
- ✅ Keyboard navigation
- ✅ Visual selection indicator
- ✅ Popper positioning

**Checkbox Component** (`/components/Common/Checkbox.tsx`)

- ✅ Radix UI Checkbox primitive
- ✅ Optional labels
- ✅ Full keyboard support
- ✅ Visual checked state

**Spinner Component** (`/components/Common/Spinner.tsx`)

- ✅ 3 sizes (sm, md, lg)
- ✅ Smooth CSS animation
- ✅ Accessibility labels (sr-only)

**Toast Component** (`/components/Common/Toast.tsx`)

- ✅ 4 types (success, error, warning, info)
- ✅ Color-coded with icons
- ✅ Dismissible
- ✅ Fixed positioning

**EmptyState Component** (`/components/Common/EmptyState.tsx`)

- ✅ Optional icon, description, action
- ✅ Clean centered layout
- ✅ Flexible content

### To Start Development:

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/ui/operator-dashboard
bun run dev
```

Then visit: **http://localhost:3000**

### Next Shard: Review Queue Implementation

**Ready to build:**

- RecommendationCard component
- FilterPanel with status/priority filters
- BulkActions toolbar
- Review Queue layout
- Operator action handlers

All foundation components are complete and verified! 🚀

---

**Last Updated**: November 4, 2025  
**Progress**: 100% Complete (All 150+ tasks complete)  
**Actual Completion Time**: ~2 hours with focused development  
**Dependencies**: Shard 1 (Foundation & Setup) ✅ Complete  
**Unblocks**: Shards 3, 4, 5, 7 (all UI shards can now use these components)
