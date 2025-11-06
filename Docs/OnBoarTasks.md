# SpendSense: User Onboarding Implementation Tasks

**Project:** SpendSense - User Onboarding Flow  
**Feature Reference:** User Onboarding Specification  
**Priority:** MEDIUM  
**Estimated Effort:** Week 3

---

## 📋 Phase 1: Project Setup & Structure

### 1.1 Directory Structure

- [ ] Create `/ui/operator-dashboard/app/onboarding/` directory
  - [ ] Create `page.tsx` for onboarding flow
  - [ ] Create `layout.tsx` (optional)
- [ ] Create `/ui/operator-dashboard/app/settings/` directory
  - [ ] Create `page.tsx` for settings management
- [ ] Create consent management utilities
  - [ ] Create `/lib/consents.ts` for consent functions
  - [ ] Create `/lib/onboarding.ts` for onboarding utilities
- [ ] Create shared types
  - [ ] Create `/types/onboarding.ts` for interfaces
  - [ ] Create `/types/consents.ts` for consent types

### 1.2 Type Definitions

- [ ] Define `UserConsents` interface
  - [ ] dataAnalysis: boolean
  - [ ] recommendations: boolean
  - [ ] partnerOffers: boolean
  - [ ] marketingEmails?: boolean (optional)
- [ ] Define `OnboardingStep` interface
  - [ ] title: string
  - [ ] description: string
  - [ ] content: ReactNode
- [ ] Define `OnboardingState` interface
  - [ ] currentStep: number
  - [ ] consents: UserConsents
  - [ ] completed: boolean
- [ ] Export all types

### 1.3 Dependencies Check

- [ ] Verify shadcn/ui components installed
  - [ ] Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
  - [ ] Button, Checkbox, Label
  - [ ] Alert, AlertDescription
  - [ ] Skeleton
- [ ] Verify lucide-react icons available
  - [ ] Info, Shield, ChevronLeft, ChevronRight
- [ ] Install toast notification library
  - [ ] `sonner` or `react-hot-toast`
- [ ] Verify routing library (Next.js useRouter)

---

## 📋 Phase 2: Onboarding Page Structure

### 2.1 Page Setup

- [ ] Create `/app/onboarding/page.tsx`
- [ ] Set up default export function
- [ ] Add proper imports

### 2.2 State Management

- [ ] Add `step` state (number, default 0)
- [ ] Add `consents` state (UserConsents object)
  - [ ] dataAnalysis: false
  - [ ] recommendations: false
  - [ ] partnerOffers: false
- [ ] Add loading states if needed
- [ ] Add error states if needed

### 2.3 Navigation Functions

- [ ] Implement `handleNext` function
  - [ ] Check if consents need to be saved (step 2)
  - [ ] Save consents if on consent step
  - [ ] Check if last step
  - [ ] Complete onboarding if last step
  - [ ] Navigate to dashboard on completion
  - [ ] Otherwise increment step
  - [ ] Add error handling
- [ ] Implement `handleBack` function
  - [ ] Decrement step
  - [ ] Prevent going below 0
- [ ] Implement `canProceed` validation
  - [ ] Check if required consents selected (step 2)
  - [ ] Return true for other steps

### 2.4 Page Layout

- [ ] Create full-screen container
  - [ ] min-h-screen
  - [ ] Gradient background (from-blue-50 to-purple-50)
  - [ ] Centered content
  - [ ] Padding
- [ ] Wrap content in Card
  - [ ] Max width (max-w-2xl)
  - [ ] Full width on mobile
- [ ] Test responsive design

---

## 📋 Phase 3: Onboarding Steps Content

### 3.1 Step 1: Welcome Screen

- [ ] Create step 1 object in steps array
- [ ] Add title: "Welcome to SpendSense! 👋"
- [ ] Add description: "Your personal financial education companion"
- [ ] Create content section
  - [ ] Center-aligned container
  - [ ] Large emoji/icon (📊, text-6xl)
  - [ ] Welcome message
    - [ ] Explain SpendSense purpose
    - [ ] "Helps you understand money habits"
    - [ ] "Learn financial concepts"
    - [ ] "Personalized educational content"
  - [ ] Add Alert component
    - [ ] Info icon
    - [ ] Important disclaimer
    - [ ] "Provides educational content, not financial advice"
    - [ ] "We help you learn, not tell you what to do"
- [ ] Test content display
- [ ] Ensure proper spacing

### 3.2 Step 2: How It Works

- [ ] Create step 2 object in steps array
- [ ] Add title: "How It Works"
- [ ] Add description: "Understanding your financial patterns"
- [ ] Create content section with 3 steps
- [ ] Step 1: "We Analyze Your Data"
  - [ ] Numbered emoji (1️⃣)
  - [ ] Blue background circle
  - [ ] Title and description
  - [ ] "Look at transaction patterns, savings, spending"
- [ ] Step 2: "You Get Personalized Content"
  - [ ] Numbered emoji (2️⃣)
  - [ ] Purple background circle
  - [ ] Title and description
  - [ ] "Educational articles, calculators, learning materials"
- [ ] Step 3: "You Learn and Grow"
  - [ ] Numbered emoji (3️⃣)
  - [ ] Green background circle
  - [ ] Title and description
  - [ ] "Track progress, complete challenges, improve literacy"
- [ ] Style numbered circles consistently
  - [ ] w-12 h-12
  - [ ] rounded-full
  - [ ] flex items-center justify-center
  - [ ] Colored backgrounds
- [ ] Add proper spacing between steps
- [ ] Test layout and alignment

### 3.3 Step 3: Privacy & Consent

- [ ] Create step 3 object in steps array
- [ ] Add title: "Your Privacy Matters"
- [ ] Add description: "You're in control of your data"
- [ ] Create intro paragraph
  - [ ] Explain need for permissions
  - [ ] Mention can change in Settings
- [ ] Create consent cards section
- [ ] Consent 1: "Analyze My Financial Data" (REQUIRED)
  - [ ] Checkbox component
  - [ ] Bind to consents.dataAnalysis
  - [ ] onCheckedChange handler
  - [ ] Label: "Analyze My Financial Data"
  - [ ] Description text
    - [ ] "Detect spending patterns"
    - [ ] "Savings behaviors and trends"
    - [ ] "Provide personalized educational content"
  - [ ] Card styling (p-4, border)
- [ ] Consent 2: "Receive Educational Recommendations" (REQUIRED)
  - [ ] Checkbox component
  - [ ] Bind to consents.recommendations
  - [ ] onCheckedChange handler
  - [ ] Label text
  - [ ] Description text
    - [ ] "Personalized learning content"
    - [ ] "Articles, calculators, tips"
    - [ ] "Based on financial patterns"
  - [ ] Card styling
- [ ] Consent 3: "Show Partner Information" (OPTIONAL)
  - [ ] Checkbox component
  - [ ] Bind to consents.partnerOffers
  - [ ] onCheckedChange handler
  - [ ] Label text
  - [ ] Description text
    - [ ] "Educational information about products"
    - [ ] "Might be relevant to your situation"
    - [ ] "Not endorsements or recommendations"
  - [ ] Card styling
- [ ] Add privacy Alert at bottom
  - [ ] Shield icon
  - [ ] "Your data is never sold"
  - [ ] "You can revoke permissions anytime"
  - [ ] Small text (text-xs)
- [ ] Implement validation
  - [ ] Require dataAnalysis AND recommendations
  - [ ] Disable Next button if not checked
- [ ] Test checkbox interactions
- [ ] Test validation logic

### 3.4 Step 4: Completion Screen

- [ ] Create step 4 object in steps array
- [ ] Add title: "You're All Set! 🎉"
- [ ] Add description: "Let's explore your dashboard"
- [ ] Create content section
  - [ ] Center-aligned container
  - [ ] Large emoji (✨, text-6xl)
  - [ ] Congratulatory message
    - [ ] "We've analyzed your financial data"
    - [ ] "Found interesting patterns"
- [ ] Add persona preview card
  - [ ] Gradient background (from-blue-50 to-purple-50)
  - [ ] Border styling (border-2)
  - [ ] "Your Primary Focus" label
  - [ ] Persona name (e.g., "High Utilization")
  - [ ] Brief description
  - [ ] "Identified opportunities to improve credit health"
- [ ] Add ready message
  - [ ] "Dashboard is ready with personalized recommendations"
- [ ] Test display
- [ ] Ensure engaging and exciting feel

---

## 📋 Phase 4: Onboarding UI Components

### 4.1 Progress Indicator

- [ ] Create progress dots above header
- [ ] Map through steps array
- [ ] For each step, create dot indicator
  - [ ] Current step: longer width (w-8), primary color
  - [ ] Past steps: small width (w-2), primary color
  - [ ] Future steps: small width (w-2), gray color
  - [ ] Height h-2
  - [ ] Rounded (rounded-full)
  - [ ] Transition animation (transition-all)
- [ ] Add step counter text
  - [ ] "Step X of Y" format
  - [ ] Small text size
  - [ ] Muted color
- [ ] Position with space-between
- [ ] Test progress updates

### 4.2 Card Header

- [ ] Add progress indicator to CardHeader
- [ ] Display current step title (CardTitle)
  - [ ] Large text (text-2xl)
  - [ ] Bold
- [ ] Display current step description (CardDescription)
  - [ ] Muted text
- [ ] Add proper spacing

### 4.3 Card Content

- [ ] Render current step content dynamically
  - [ ] Use steps[step].content
- [ ] Add padding (py-6)
- [ ] Ensure content scrollable if long
- [ ] Test with all step contents

### 4.4 Card Footer Navigation

- [ ] Create footer with two buttons
- [ ] "Back" button
  - [ ] variant="outline"
  - [ ] ChevronLeft icon
  - [ ] onClick calls handleBack
  - [ ] Disabled when step === 0
  - [ ] Icon + text layout
- [ ] "Next" / "Go to Dashboard" button
  - [ ] Primary variant
  - [ ] ChevronRight icon (if not last step)
  - [ ] onClick calls handleNext
  - [ ] Disabled if !canProceed
  - [ ] Dynamic text (last step shows different text)
  - [ ] Text + icon layout
- [ ] Use flex layout with space-between
- [ ] Test button states
- [ ] Test navigation flow

### 4.5 Background Styling

- [ ] Full viewport height (min-h-screen)
- [ ] Gradient background
  - [ ] from-blue-50 to-purple-50
  - [ ] or similar appealing gradient
- [ ] Center content (flex items-center justify-center)
- [ ] Add padding for mobile
- [ ] Test on different screen sizes

---

## 📋 Phase 5: Consent Management Functions

### 5.1 Consent Types File

- [ ] Create `/lib/consents.ts`
- [ ] Export `UserConsents` interface
- [ ] Add JSDoc comments

### 5.2 Save Consents Function

- [ ] Create `saveUserConsents` function
  - [ ] Accept userId: string
  - [ ] Accept consents: UserConsents
  - [ ] Return Promise<void>
- [ ] Implement mock version
  - [ ] Check NEXT_PUBLIC_USE_MOCK_DATA
  - [ ] Save to localStorage
  - [ ] Key format: `consents_${userId}`
  - [ ] JSON.stringify the consents
- [ ] Implement real version
  - [ ] POST to `/api/users/${userId}/consents`
  - [ ] Set Content-Type header
  - [ ] Send consents in body
  - [ ] Handle response
- [ ] Add error handling
  - [ ] Try-catch block
  - [ ] Log errors
  - [ ] Throw or return error
- [ ] Test with mock data
- [ ] Test with API (when available)

### 5.3 Get Consents Function

- [ ] Create `getUserConsents` function
  - [ ] Accept userId: string
  - [ ] Return Promise<UserConsents>
- [ ] Implement mock version
  - [ ] Check NEXT_PUBLIC_USE_MOCK_DATA
  - [ ] Get from localStorage
  - [ ] Parse JSON
  - [ ] Return default if not found
    - [ ] All consents false
- [ ] Implement real version
  - [ ] GET from `/api/users/${userId}/consents`
  - [ ] Parse response
  - [ ] Return consents
- [ ] Add error handling
- [ ] Test with mock data
- [ ] Test with API (when available)

### 5.4 Complete Onboarding Function

- [ ] Create `completeOnboarding` function
  - [ ] Accept userId: string
  - [ ] Return Promise<void>
- [ ] Implement mock version
  - [ ] Set localStorage flag
  - [ ] Key: `onboarding_completed_${userId}`
- [ ] Implement real version
  - [ ] POST to `/api/users/${userId}/complete-onboarding`
  - [ ] Update user record
- [ ] Add error handling
- [ ] Test function

### 5.5 Check Onboarding Status Function

- [ ] Create `isOnboardingComplete` function
  - [ ] Accept userId: string
  - [ ] Return Promise<boolean>
- [ ] Check completion status
- [ ] Use to determine if onboarding needed
- [ ] Test function

---

## 📋 Phase 6: Settings Page

### 6.1 Page Setup

- [ ] Create `/app/settings/page.tsx`
- [ ] Set up default export function
- [ ] Add proper imports

### 6.2 State Management

- [ ] Get userId from auth/context
- [ ] Add `consents` state (UserConsents | null)
- [ ] Add `loading` state (boolean)
- [ ] Add `saving` state (boolean, optional)
- [ ] Use useEffect to fetch consents
  - [ ] Fetch on mount
  - [ ] Set loading to false after fetch
  - [ ] Handle errors

### 6.3 Page Header

- [ ] Add page title "Settings"
- [ ] Add subtitle/description
  - [ ] "Manage your privacy and preferences"
- [ ] Style with proper typography
- [ ] Add margin/padding

### 6.4 Privacy & Consent Card

- [ ] Create Card component
- [ ] Add CardHeader
  - [ ] CardTitle: "Privacy & Consent"
  - [ ] CardDescription: "Control how SpendSense uses your data"
- [ ] Add CardContent
- [ ] Create consent checkbox list
  - [ ] Same 3 consents as onboarding
  - [ ] Bind to consents state
  - [ ] onCheckedChange updates state
- [ ] Style each consent item
  - [ ] Border and padding
  - [ ] Checkbox + label + description layout
  - [ ] Similar to onboarding step 3
- [ ] Add privacy Alert
  - [ ] Shield icon
  - [ ] Reassurance message
- [ ] Add CardFooter
  - [ ] "Save Changes" button
  - [ ] onClick calls handleSave
  - [ ] Show loading state while saving

### 6.5 Save Handler

- [ ] Implement `handleSave` function
  - [ ] Check consents exist
  - [ ] Call saveUserConsents
  - [ ] Show success toast
  - [ ] Handle errors
  - [ ] Show error toast on failure
- [ ] Add loading state during save
- [ ] Test save functionality

### 6.6 Danger Zone Card

- [ ] Create separate Card below privacy card
- [ ] Add CardHeader
  - [ ] CardTitle: "Danger Zone" (red text)
- [ ] Add CardContent
  - [ ] "Delete All My Data" button
  - [ ] Destructive variant
  - [ ] Warning text below
    - [ ] "This action cannot be undone"
  - [ ] onClick shows confirmation dialog (optional)
- [ ] Style with red theme
- [ ] Add proper spacing

### 6.7 Loading State

- [ ] Show Skeleton while loading
  - [ ] Height h-96
  - [ ] Full width
- [ ] Or show loading spinner
- [ ] Test loading state

### 6.8 Page Styling

- [ ] Wrap in container with max-width (max-w-4xl)
- [ ] Add responsive padding
- [ ] Add margin between cards
- [ ] Test on various screen sizes
- [ ] Polish overall design

---

## 📋 Phase 7: API Integration

### 7.1 API Route Setup

- [ ] Create `/api/users/[userId]/consents/route.ts`
- [ ] Set up GET and POST handlers
- [ ] Add TypeScript types

### 7.2 Save Consents Endpoint

- [ ] Create POST handler
  - [ ] Parse request body
  - [ ] Validate userId
  - [ ] Validate consents object
  - [ ] Save to database
  - [ ] Return success response
- [ ] Add error handling
  - [ ] 400 for invalid data
  - [ ] 500 for server errors
- [ ] Add logging
- [ ] Test endpoint

### 7.3 Get Consents Endpoint

- [ ] Create GET handler
  - [ ] Parse userId from params
  - [ ] Fetch from database
  - [ ] Return consents
  - [ ] Return default if not found
- [ ] Add error handling
  - [ ] 404 if user not found
  - [ ] 500 for server errors
- [ ] Test endpoint

### 7.4 Complete Onboarding Endpoint

- [ ] Create `/api/users/[userId]/complete-onboarding/route.ts`
- [ ] Create POST handler
  - [ ] Validate userId
  - [ ] Update user record (onboarding_completed flag)
  - [ ] Return success response
- [ ] Add error handling
- [ ] Test endpoint

### 7.5 Database Schema

- [ ] Add consents fields to users table
  - [ ] data_analysis_consent: boolean
  - [ ] recommendations_consent: boolean
  - [ ] partner_offers_consent: boolean
  - [ ] marketing_emails_consent: boolean
  - [ ] consents_updated_at: timestamp
- [ ] Add onboarding_completed field
  - [ ] onboarding_completed: boolean
  - [ ] onboarding_completed_at: timestamp
- [ ] Run migration
- [ ] Test database operations

---

## 📋 Phase 8: Onboarding Flow Logic

### 8.1 Initial Persona Detection

- [ ] Fetch user signals during onboarding
- [ ] Run persona assignment
- [ ] Display detected persona in step 4
- [ ] Handle case when persona not detected
  - [ ] Show generic message
  - [ ] Assign default persona

### 8.2 Dashboard Redirect

- [ ] Complete onboarding on final step
- [ ] Save consents
- [ ] Mark onboarding as complete
- [ ] Redirect to dashboard
  - [ ] Use router.push('/dashboard')
- [ ] Show welcome message on dashboard (optional)

### 8.3 Onboarding Guard

- [ ] Create onboarding check middleware/hook
- [ ] Check if user completed onboarding
- [ ] Redirect to onboarding if not complete
- [ ] Allow access to dashboard if complete
- [ ] Add to dashboard layout/page

### 8.4 Skip Onboarding (Optional)

- [ ] Add "Skip for now" option
- [ ] Mark as partially complete
- [ ] Allow access to dashboard
- [ ] Show reminder to complete later

---

## 📋 Phase 9: UI/UX Enhancements

### 9.1 Visual Polish

- [ ] Refine gradient backgrounds
- [ ] Polish card styling
  - [ ] Shadows
  - [ ] Borders
  - [ ] Rounded corners
- [ ] Ensure consistent spacing
- [ ] Refine typography
  - [ ] Font sizes
  - [ ] Font weights
  - [ ] Line heights
- [ ] Add brand colors

### 9.2 Animations

- [ ] Add entrance animations
  - [ ] Fade in on step change
  - [ ] Slide transition
- [ ] Add progress dot animations
  - [ ] Smooth transitions
- [ ] Add button hover effects
- [ ] Add checkbox animations
- [ ] Keep animations subtle and professional

### 9.3 Responsive Design

- [ ] Test on mobile (320px-640px)
  - [ ] Adjust card width
  - [ ] Stack content vertically
  - [ ] Reduce font sizes
  - [ ] Adjust spacing
- [ ] Test on tablet (768px-1024px)
- [ ] Test on desktop (1280px+)
- [ ] Ensure buttons accessible on mobile
- [ ] Test consent cards on small screens

### 9.4 Loading States

- [ ] Add skeleton loaders
- [ ] Add loading spinners
- [ ] Show loading during consent save
- [ ] Show loading during persona detection
- [ ] Handle slow operations gracefully

### 9.5 Error States

- [ ] Handle failed consent save
  - [ ] Show error message
  - [ ] Allow retry
- [ ] Handle failed persona detection
  - [ ] Show generic message
  - [ ] Still allow completion
- [ ] Handle network errors
- [ ] Provide clear error messages

### 9.6 Accessibility

- [ ] Add proper ARIA labels
  - [ ] Checkboxes
  - [ ] Buttons
  - [ ] Progress indicator
- [ ] Ensure keyboard navigation works
  - [ ] Tab through all elements
  - [ ] Space to check checkboxes
  - [ ] Enter to proceed
- [ ] Add focus indicators
- [ ] Test with screen reader
- [ ] Ensure color contrast meets WCAG
- [ ] Add descriptive alt text

### 9.7 Success Feedback

- [ ] Show success message on completion
- [ ] Use toast notifications
- [ ] Provide clear next steps
- [ ] Make transition to dashboard smooth

---

## 📋 Phase 10: Testing

### 10.1 Component Testing

- [ ] Test onboarding page renders
- [ ] Test step navigation
  - [ ] Next button works
  - [ ] Back button works
  - [ ] Progress indicator updates
- [ ] Test consent management
  - [ ] Checkboxes work
  - [ ] State updates correctly
  - [ ] Validation works
- [ ] Test completion flow
  - [ ] Consents saved
  - [ ] Onboarding marked complete
  - [ ] Redirect to dashboard

### 10.2 Settings Page Testing

- [ ] Test settings page renders
- [ ] Test consent loading
- [ ] Test consent changes
  - [ ] Checkboxes update state
- [ ] Test save functionality
  - [ ] Consents saved
  - [ ] Success message shown
- [ ] Test error handling

### 10.3 Integration Testing

- [ ] Test complete onboarding flow
  - [ ] Start to finish
  - [ ] All steps navigate correctly
  - [ ] Consents persist
  - [ ] Redirect works
- [ ] Test settings changes persist
  - [ ] Change and save
  - [ ] Reload page
  - [ ] Changes still there
- [ ] Test onboarding guard
  - [ ] New user redirected to onboarding
  - [ ] Completed user accesses dashboard

### 10.4 User Flow Testing

- [ ] New user first visit
- [ ] Complete onboarding
- [ ] Access dashboard
- [ ] Change settings
- [ ] Verify changes applied

### 10.5 Edge Case Testing

- [ ] Test with network errors
- [ ] Test with missing user data
- [ ] Test with all consents declined (should not proceed)
- [ ] Test with only required consents
- [ ] Test back button from each step
- [ ] Test page refresh during onboarding

### 10.6 Cross-Browser Testing

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on mobile browsers

### 10.7 Accessibility Testing

- [ ] Run axe DevTools audit
- [ ] Test keyboard-only navigation
- [ ] Test with screen reader
- [ ] Verify ARIA labels
- [ ] Check color contrast

---

## 📋 Phase 11: Analytics & Tracking

### 11.1 Event Tracking

- [ ] Track onboarding started
- [ ] Track each step viewed
- [ ] Track step completions
- [ ] Track step drop-offs
- [ ] Track consent selections
- [ ] Track onboarding completed
- [ ] Track onboarding skipped (if option exists)

### 11.2 Analytics Implementation

- [ ] Set up event tracking functions
- [ ] Add tracking to each step
  - [ ] Step view events
  - [ ] Step completion events
- [ ] Track consent changes
  - [ ] Which consents granted
  - [ ] Which declined
- [ ] Track completion time
  - [ ] Time to complete onboarding
- [ ] Test analytics firing

### 11.3 Conversion Metrics

- [ ] Track completion rate
  - [ ] Started vs completed
- [ ] Track drop-off points
  - [ ] Which steps lose users
- [ ] Track consent opt-in rates
  - [ ] Per consent type
- [ ] Track settings changes frequency

---

## 📋 Phase 12: Documentation

### 12.1 Code Documentation

- [ ] Add JSDoc comments to all functions
- [ ] Document component props
- [ ] Document API endpoints
- [ ] Add inline comments for complex logic

### 12.2 User Documentation

- [ ] Create onboarding guide
- [ ] Create privacy policy (reference)
- [ ] Create consent explanations
- [ ] Add help links in onboarding

### 12.3 Developer Documentation

- [ ] Document onboarding flow
- [ ] Document consent system
- [ ] Document API integration
- [ ] Create setup instructions
- [ ] Document environment variables

---

## 📋 Phase 13: Deployment Preparation

### 13.1 Environment Configuration

- [ ] Set up environment variables
  - [ ] NEXT_PUBLIC_USE_MOCK_DATA
  - [ ] API endpoints
- [ ] Configure database
- [ ] Test in staging environment

### 13.2 Performance Optimization

- [ ] Optimize component re-renders
- [ ] Optimize images/assets
- [ ] Minimize bundle size
- [ ] Test load times

### 13.3 Security Checks

- [ ] Validate all user inputs
- [ ] Secure API endpoints
- [ ] Implement rate limiting
- [ ] Review consent storage
- [ ] Ensure GDPR compliance
- [ ] Add CSRF protection

### 13.4 Pre-Deployment Testing

- [ ] Run full test suite
- [ ] Test in staging
- [ ] User acceptance testing
- [ ] Security audit
- [ ] Accessibility audit
- [ ] Fix critical issues

### 13.5 Legal Compliance

- [ ] Review privacy policy
- [ ] Review terms of service
- [ ] Ensure consent language compliant
  - [ ] GDPR (EU)
  - [ ] CCPA (California)
  - [ ] Other regulations
- [ ] Add legal links
- [ ] Get legal approval

---

## 🎯 Quick Reference

**Start Here (Critical Path):**

1. ✅ Phase 1 - Project Setup
2. ✅ Phase 2 - Onboarding Page Structure
3. ✅ Phase 3 - Onboarding Steps Content
4. ✅ Phase 4 - UI Components
5. ✅ Phase 5 - Consent Management
6. ✅ Phase 10.1-10.3 - Core Testing

**Priority Order:**

1. **HIGH**: Onboarding flow with all 4 steps
2. **HIGH**: Consent management (save/load)
3. **MEDIUM**: Settings page for consent changes
4. **MEDIUM**: Onboarding guard/redirect
5. **LOW**: Advanced analytics and tracking

**File Structure:**

```
ui/operator-dashboard/
├── app/
│   ├── onboarding/
│   │   └── page.tsx              # Main onboarding flow
│   └── settings/
│       └── page.tsx              # Settings page
├── lib/
│   ├── consents.ts              # Consent functions
│   └── onboarding.ts            # Onboarding utilities
├── types/
│   ├── onboarding.ts            # Onboarding types
│   └── consents.ts              # Consent types
└── pages/api/
    └── users/
        └── [userId]/
            ├── consents/
            │   └── route.ts      # Consent endpoints
            └── complete-onboarding/
                └── route.ts      # Completion endpoint
```

**Key Components Needed:**

- Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Button, Checkbox, Label
- Alert, AlertDescription
- Skeleton
- Icons: Info, Shield, ChevronLeft, ChevronRight

**Onboarding Steps:**

1. **Welcome** - Introduction to SpendSense
2. **How It Works** - 3-step process explanation
3. **Privacy & Consent** - 3 consent checkboxes
4. **Completion** - Persona preview and dashboard access

**Required Consents:**

- ✅ Data Analysis (required)
- ✅ Educational Recommendations (required)
- ⬜ Partner Information (optional)

**API Endpoints:**

```
POST /api/users/:userId/consents
GET  /api/users/:userId/consents
POST /api/users/:userId/complete-onboarding
```

---

## 📊 Progress Tracking

**Phase 1: Project Setup & Structure** - [✅] Complete  
**Phase 2: Onboarding Page Structure** - [✅] Complete  
**Phase 3: Onboarding Steps Content** - [✅] Complete  
**Phase 4: Onboarding UI Components** - [✅] Complete  
**Phase 5: Consent Management Functions** - [✅] Complete  
**Phase 6: Settings Page** - [✅] Complete  
**Phase 7: API Integration** - [✅] Complete (Mock Data Only)  
**Phase 8: Onboarding Flow Logic** - [✅] Complete  
**Phase 9: UI/UX Enhancements** - [✅] Complete  
**Phase 10: Testing** - [✅] Complete  
**Phase 11: Analytics & Tracking** - [⏭️] Skipped (Future Enhancement)  
**Phase 12: Documentation** - [✅] Complete  
**Phase 13: Deployment Preparation** - [⏭️] Not Required (Mock Data)

---

## 🚀 Week 3 Implementation Strategy

**Days 1-2: Core Onboarding Flow**

- Set up project structure
- Build onboarding page with all 4 steps
- Implement step navigation
- Add progress indicator
- Test step flow

**Days 3-4: Consent System**

- Implement consent management functions
- Add consent checkboxes and validation
- Test save/load functionality
- Add mock data support

**Days 5: Settings Page**

- Build settings page
- Add consent management UI
- Test settings changes
- Add danger zone (optional)

**Day 6: Integration & Polish**

- Connect to API endpoints
- Add onboarding guard
- Polish UI/UX
- Add animations
- Responsive design

**Day 7: Testing & Deploy**

- Comprehensive testing
- Fix bugs
- Analytics implementation
- Final polish
- Deploy

**Success Criteria:**

- [x] New users see onboarding flow
- [x] All 4 steps functional and navigable
- [x] Consents saved correctly
- [x] Settings page allows consent changes
- [x] Onboarding as dismissible modal (respects user choice)
- [x] Responsive on all devices
- [x] Accessible (WCAG AA - ARIA labels, keyboard nav, semantic HTML)
- [x] Privacy-focused language throughout
- [x] Smooth user experience with animations

---

**Implementation Tips for Cursor:**

- Start with the onboarding page structure and navigation
- Build all 4 step contents before wiring up logic
- Use mock data for consent storage during development
- Make the progress indicator prominent and clear
- Keep consent language simple and non-technical
- Make required vs optional consents very clear
- Test step navigation thoroughly (forward and back)
- The completion screen should feel celebratory
- Settings page should mirror onboarding consent UI
- Privacy and trust are paramount - be transparent
- Make it feel welcoming, not intimidating
- First impressions matter - polish the UX!
