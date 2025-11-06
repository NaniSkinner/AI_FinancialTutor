# Technical Integration Specification

**Section:** Technical Architecture & API  
**Priority:** CRITICAL  
**Dependencies:** All user-facing features

---

## Route Structure

```
/                          → User Dashboard (main)
/onboarding                → Onboarding flow
/calculators               → Interactive calculators
/learn/[slug]              → Educational content pages
/progress                  → Progress & gamification page
/settings                  → Settings (consent, preferences)
/emails/preview            → Email template preview
/operator                  → Operator Dashboard (existing)
/operator/review           → Review Queue (existing)
/operator/traces           → Decision Traces (existing)
```

---

## API Endpoints Summary

### User Dashboard
- `GET /api/users/:userId/dashboard` - Complete dashboard data
- `POST /api/recommendations/:id/view` - Record view
- `POST /api/recommendations/:id/complete` - Mark complete

### Chat
- `POST /api/chat` - Send message, get response

### Progress & Gamification
- `GET /api/users/:userId/progress` - Progress data
- `POST /api/challenges/:id/start` - Start challenge
- `POST /api/challenges/:id/complete` - Complete challenge
- `GET /api/users/:userId/milestones` - Milestone data

### Onboarding & Consent
- `POST /api/users/:userId/complete-onboarding` - Mark onboarding complete
- `POST /api/users/:userId/consents` - Save consents
- `GET /api/users/:userId/consents` - Get consents

### Email
- `POST /api/emails/weekly-digest` - Generate email
- `POST /api/emails/send` - Send email

---

## TypeScript Interfaces

**Path:** `ui/operator-dashboard/types/user.ts`

```typescript
export interface UserSignals {
  credit?: CreditSignals;
  savings?: SavingsSignals;
  subscriptions?: SubscriptionSignals;
  income?: IncomeSignals;
  monthlyExpenses: number;
}

export interface Recommendation {
  id: string;
  type: 'article' | 'calculator' | 'video';
  title: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
  readTimeMinutes: number;
  content?: string;
  calculatorType?: string;
  status: 'approved' | 'pending' | 'completed';
  learnMoreUrl: string;
  disclaimer: string;
  userData?: Record<string, any>;
}

export interface ProgressData {
  streak: number;
  level: number;
  levelProgress: number;
  levelMax: number;
  totalPoints: number;
  completedRecommendations: number;
  totalRecommendations: number;
  achievements: Achievement[];
  activeChallenges: Challenge[];
  completedChallenges: CompletedChallenge[];
}

export interface UserConsents {
  dataAnalysis: boolean;
  recommendations: boolean;
  partnerOffers: boolean;
  marketingEmails?: boolean;
}
```

---

## Mock Data Structure

**Path:** `ui/operator-dashboard/lib/mockData.ts`

Complete mock data for:
- User profile
- Persona assignments
- Financial signals
- Recommendations
- Progress tracking
- Achievements
- Challenges

All features work with `NEXT_PUBLIC_USE_MOCK_DATA=true`

---

## Component Dependencies

### shadcn/ui Components Required

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add skeleton
```

### Icons from lucide-react

Bell, Settings, Shield, Trophy, Flame, Calendar, DollarSign, Tag, MessageCircle, Send, Check, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ExternalLink, Info, CheckCircle2, AlertCircle, Clock, CreditCard, PiggyBank, RefreshCw, TrendingUp, ArrowUp, ArrowDown, Minus, Loader2, X, Plus, Trash2, Circle

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_API_URL=http://localhost:3000/api
APP_URL=http://localhost:3000
```

---

## Middleware for Route Protection

**Path:** `ui/operator-dashboard/middleware.ts`

Protects routes:
- Requires authentication for all user-facing pages
- Redirects to /onboarding if not completed
- Allows public access to /login

---

## New Dependencies

```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "mustache": "^4.2.0",
    "date-fns": "^2.30.0"
  }
}
```