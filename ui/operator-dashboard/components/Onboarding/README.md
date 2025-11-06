# User Onboarding & Consent System

## Overview

The SpendSense onboarding and consent system provides a privacy-first user experience that:

- Welcomes new users with a guided tour
- Collects necessary consents for AI-powered features
- Allows users to manage privacy preferences
- Gates AI features behind consent requirements

## Components

### 1. OnboardingModal

**Location:** `components/Onboarding/OnboardingModal.tsx`

A 4-step modal that introduces new users to SpendSense:

1. **Welcome** - Introduction to SpendSense
2. **How It Works** - 3-step process explanation
3. **Privacy & Consent** - Required and optional consent checkboxes
4. **Completion** - Mock persona preview and success message

**Usage:**

```tsx
<OnboardingModal
  isOpen={showOnboarding}
  onClose={handleClose}
  onComplete={handleComplete}
/>
```

**Behavior:**

- Shows as modal overlay on first dashboard visit
- Can be dismissed (tracked with dismissal count)
- Won't show again after 3 dismissals
- Won't show within 7 days of last dismissal
- Saves consents on step 3
- Marks onboarding as complete on step 4

### 2. ConsentDialog

**Location:** `components/Consent/ConsentDialog.tsx`

Reusable dialog for requesting consent when accessing AI features.

**Usage:**

```tsx
<ConsentDialog
  isOpen={showDialog}
  onClose={handleClose}
  onGranted={handleGranted}
  requiredConsents={["dataAnalysis", "recommendations"]}
  featureName="AI Insights"
  featureDescription="Get personalized insights..."
/>
```

### 3. ConsentPrompt

**Location:** `components/Consent/ConsentPrompt.tsx`

Friendly card prompt shown before the consent dialog.

**Usage:**

```tsx
<ConsentPrompt
  featureName="AI Features"
  description="To use AI features, we need permission..."
  onEnable={() => setShowDialog(true)}
  icon={<Sparkles />}
/>
```

### 4. ConsentGuard

**Location:** `components/Consent/ConsentGuard.tsx`

Wrapper component that checks consent before rendering children.

**Usage:**

```tsx
<ConsentGuard
  requiredConsents={["dataAnalysis", "recommendations"]}
  featureName="AI Insights"
  featureDescription="Get personalized insights..."
  promptDescription="Unlock personalized AI insights..."
  icon={<Sparkles />}
>
  <YourAIFeature />
</ConsentGuard>
```

**Behavior:**

- Shows loading skeleton while checking consent
- Renders children if consent granted
- Shows ConsentPrompt if consent not granted
- Clicking "Enable" shows ConsentDialog
- After granting consent, children render automatically

## Hooks

### useOnboarding()

Manages onboarding state and flow control.

```tsx
const {
  isComplete, // boolean | null
  shouldShow, // boolean | null
  metadata, // OnboardingMetadata | null
  loading, // boolean
  complete, // () => Promise<boolean>
  dismiss, // () => Promise<boolean>
  refetch, // () => Promise<void>
} = useOnboarding();
```

### useConsents()

Manages user consent state and updates.

```tsx
const {
  consents, // UserConsents | null
  loading, // boolean
  hasRequired, // boolean
  hasConsent, // (type: ConsentType) => boolean
  updateConsents, // (consents: UserConsents) => Promise<boolean>
  toggleConsent, // (type: ConsentType) => Promise<boolean>
  refetch, // () => Promise<void>
} = useConsents();
```

## Consent Types

```typescript
interface UserConsents {
  dataAnalysis: boolean; // REQUIRED
  recommendations: boolean; // REQUIRED
  partnerOffers: boolean; // OPTIONAL
  marketingEmails?: boolean; // OPTIONAL
}
```

## Settings Page

**Location:** `app/settings/page.tsx`

Allows users to:

- View and modify consent preferences
- See privacy information
- Reset onboarding (for testing)
- Delete all data (danger zone)

**Navigation:** User menu → Settings or Privacy & Consent

## Storage

All data is stored in localStorage with mock data:

```typescript
// Consent data
localStorage.setItem('spendsense_consents_${userId}', JSON.stringify({
  consents: { ... },
  metadata: { updatedAt, userId, version }
}));

// Onboarding data
localStorage.setItem('spendsense_onboarding_${userId}', JSON.stringify({
  userId,
  completed: boolean,
  completedAt: string,
  dismissed: boolean,
  dismissedAt: string,
  dismissCount: number
}));
```

## Integration

### Dashboard Integration

The onboarding modal is integrated into `/app/dashboard/page.tsx`:

```tsx
const { shouldShow } = useOnboarding();

useEffect(() => {
  if (shouldShow && !loading) {
    setTimeout(() => setShowOnboarding(true), 500);
  }
}, [shouldShow, loading]);
```

### Feature Gating

AI features are wrapped with ConsentGuard:

```tsx
<ConsentGuard
  requiredConsents={["dataAnalysis", "recommendations"]}
  featureName="AI Insights"
  featureDescription="..."
  promptDescription="..."
>
  <HeroInsight />
</ConsentGuard>
```

Features gated:

- HeroInsight (AI insights)
- RecommendationsFeed (personalized recommendations)
- ChatWidget (AI chat assistant)

Not gated:

- FinancialSnapshot (basic data display)
- QuickTools (calculators)
- ProgressWidget (gamification)

## Accessibility

✅ All components include:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader support
- High contrast mode support
- Semantic HTML

## Responsive Design

✅ All components are fully responsive:

- Mobile (320px - 640px)
- Tablet (768px - 1024px)
- Desktop (1280px+)

## Testing Onboarding

To test the onboarding flow:

1. **Reset onboarding:**
   - Go to Settings
   - Click "Reset Onboarding Flow" in Development Tools
   - Or run in console: `localStorage.removeItem('spendsense_onboarding_user_demo_001')`

2. **Reset consents:**
   - Go to Settings
   - Click "Delete All My Data" in Danger Zone
   - Or run in console: `localStorage.removeItem('spendsense_consents_user_demo_001')`

3. **Reload the page** - Onboarding modal should appear

## Privacy Features

- ✅ Clear consent language (no legal jargon)
- ✅ Required vs optional consents clearly marked
- ✅ Privacy assurances (data never sold)
- ✅ Easy access to change settings
- ✅ Complete data deletion option
- ✅ Educational focus (not financial advice)

## Future Enhancements

- [ ] Backend API integration (currently localStorage only)
- [ ] Analytics tracking for onboarding completion rates
- [ ] A/B testing different onboarding flows
- [ ] Internationalization (i18n)
- [ ] Additional consent types (e.g., biometric data)
- [ ] Consent version tracking for legal compliance
- [ ] GDPR/CCPA compliance features
- [ ] Consent audit log
