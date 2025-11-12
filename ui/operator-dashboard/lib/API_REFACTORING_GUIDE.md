# API Client Refactoring Guide

## Current State

The `api.ts` file is **1387 lines** and contains all API client logic in a single file. While functional, it should be split into modular files for better maintainability.

## Recommended Structure

```
lib/api/
├── client.ts              # Core API client & request handler
├── recommendations.ts     # Recommendation operations
├── users.ts               # User & persona operations
├── operator.ts            # Operator stats & actions
├── notes.ts               # Notes CRUD operations
├── tags.ts                # Tags operations
├── alerts.ts              # Alerts operations
├── audit.ts               # Audit logs
├── analytics.ts           # Analytics operations
├── dashboard.ts           # Dashboard data
├── chat.ts                # Chat operations
├── mock/                  # Mock data implementations
│   ├── index.ts          # Mock data re-exports
│   ├── recommendations.ts
│   ├── users.ts
│   └── ...
├── types.ts               # API types (or use ../types.ts)
└── index.ts               # Barrel export
```

## Current Function Groupings

### Core Infrastructure (Lines 1-135)
- `isProductionEnvironment()` - Environment detection
- `shouldUseMockData()` - Mock mode detection
- `apiRequest<T>()` - Generic fetch wrapper with auth

### Recommendations API (Lines 136-390)
- `fetchRecommendations()` - Get recommendations with filters
- `approveRecommendation()` - Approve action
- `rejectRecommendation()` - Reject action
- `modifyRecommendation()` - Modify action
- `flagRecommendation()` - Flag for review
- `undoAction()` - Undo last action
- `bulkApproveRecommendations()` - Bulk approval

### User & Persona API (Lines 391-430)
- `fetchUserSignals()` - Get user signals
- `fetchPersonaHistory()` - Get persona transitions

### Decision Traces (Lines 431-449)
- `fetchDecisionTrace()` - Get AI decision trace

### Operator Stats (Lines 450-468)
- `fetchOperatorStats()` - Get operator statistics

### Alerts (Lines 469-485)
- `fetchAlerts()` - Get alerts

### Audit Logs (Lines 486-515)
- `fetchAuditLogs()` - Get audit trail

### Notes API (Lines 516-632)
- `fetchNotes()` - Get notes
- `createNote()` - Create note
- `updateNote()` - Update note
- `deleteNote()` - Delete note

### Tags API (Lines 633-782)
- `fetchAvailableTags()` - Get tag taxonomy
- `fetchTags()` - Get recommendation tags
- `addTag()` - Add tag
- `deleteTag()` - Delete tag

### Analytics API (Lines 783-903)
- `fetchAnalytics()` - Get analytics data

### Dashboard API (Lines 904-931)
- `getUserDashboard()` - Get user dashboard

### Recommendation Interactions (Lines 932-994)
- `recordRecommendationView()` - Track views
- `markRecommendationComplete()` - Mark complete

### Chat API (Lines 995-1073)
- `sendChatMessage()` - Send chat message

### Consent API (Lines 1074-1161)
- `getUserConsents()` - Get consents
- `grantConsent()` - Grant consent
- `revokeConsent()` - Revoke consent

### Onboarding API (Lines 1162-1250)
- `getOnboardingProgress()` - Get progress
- `recordOnboardingStep()` - Record step
- `completeOnboarding()` - Mark complete
- `dismissOnboarding()` - Dismiss flow

### Gamification API (Lines 1251-end)
- `getGamificationData()` - Get achievements
- `claimReward()` - Claim reward
- `getDailyStreak()` - Get streak
- `recordActivity()` - Track activity

## Migration Strategy

### Phase 1: Create Core Client (Non-Breaking)
1. Create `lib/api/client.ts` with:
   - Configuration constants (API_URL, USE_MOCK_DATA)
   - Helper functions (isProductionEnvironment, shouldUseMockData)
   - Generic apiRequest function
2. Export from `lib/api/index.ts`
3. Update `lib/api.ts` to import from `lib/api/client.ts`
4. **No other changes yet** - ensure builds succeed

### Phase 2: Extract One Module (Test Pattern)
1. Create `lib/api/recommendations.ts`
2. Move recommendation functions
3. Update imports in consuming components
4. Run tests to verify no breakage
5. If successful, proceed to Phase 3

### Phase 3: Extract Remaining Modules
Repeat for each functional group:
- users.ts
- notes.ts
- tags.ts
- alerts.ts
- audit.ts
- analytics.ts
- dashboard.ts
- chat.ts
- consent.ts
- onboarding.ts
- gamification.ts

### Phase 4: Extract Mock Data
1. Create `lib/api/mock/` directory
2. Move mock implementations from `lib/mockData.ts`
3. Organize by domain (recommendations, users, etc.)
4. Update mock mode detection to use modular mocks

### Phase 5: Deprecate Old File
1. Create `lib/api.ts` as barrel export:
   ```typescript
   // Deprecated: Import from @/lib/api/[module] instead
   export * from './api/index';
   ```
2. Add deprecation warnings
3. Update all components to use new imports
4. Eventually remove `lib/api.ts`

## Import Update Example

### Before
```typescript
import { fetchRecommendations, approveRecommendation } from '@/lib/api';
```

### After
```typescript
import { fetchRecommendations, approveRecommendation } from '@/lib/api/recommendations';
// Or use barrel export:
import { fetchRecommendations, approveRecommendation } from '@/lib/api';
```

## Testing Checklist

After each phase:
- [ ] TypeScript compilation succeeds
- [ ] All tests pass
- [ ] No runtime errors in dev mode
- [ ] Mock mode still works
- [ ] Production builds successfully
- [ ] No circular dependencies

## Benefits of Refactoring

1. **Maintainability**: Easier to find and update specific API functions
2. **Code Review**: Smaller, focused PRs for changes
3. **Testing**: Can test modules in isolation
4. **Performance**: Tree-shaking works better with modular exports
5. **Collaboration**: Reduced merge conflicts
6. **Documentation**: Each module can have focused documentation

## Risks

1. **Breaking Changes**: Must update all imports across codebase
2. **Mock Data**: Mock mode must work correctly in new structure
3. **Circular Dependencies**: Be careful with cross-module imports
4. **Build Time**: Temporarily slower during transition

## Estimated Effort

- Phase 1 (Core Client): 2 hours
- Phase 2 (First Module): 3 hours
- Phase 3 (Remaining Modules): 8 hours
- Phase 4 (Mock Data): 4 hours
- Phase 5 (Cleanup): 2 hours
- **Total: ~20 hours**

## Decision

**Recommendation**: Defer this refactoring until:
1. There's dedicated time for thorough testing
2. No active feature development on API client
3. Clear ownership of the refactoring task

The current structure is functional. While not ideal, it works correctly and the priority should be on features rather than refactoring unless it becomes a blocking issue.

---

**Note**: This guide should be revisited when api.ts exceeds 2000 lines or when team size grows beyond 3 developers.
