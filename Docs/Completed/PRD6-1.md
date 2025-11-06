# SHARD 1: Foundation & Setup

**Project:** SpendSense Operator Dashboard  
**Purpose:** Project bootstrap, architecture decisions, tech stack setup  
**Phase:** Initial Setup  
**Estimated Size:** ~15% of total implementation

---

## Executive Summary

The Operator Dashboard is a web-based oversight interface that enables compliance operators to review, approve, modify, or reject AI-generated recommendations before they reach users. This human-in-the-loop system ensures quality control, catches edge cases, and maintains brand tone while providing full auditability through decision traces.

### Core Value Proposition

- **Quality Assurance**: Human review before user-facing recommendations
- **Explainability**: Full decision traces showing how recommendations were generated
- **Efficiency**: Bulk approval actions with smart filtering
- **Auditability**: Complete audit trail of all operator actions
- **Debugging**: Deep-dive into user signals and persona assignments

---

## Technology Stack

### Frontend

- **Framework**: React 18 + Next.js 14
- **State Management**: Zustand (matching Mockup Matcha Hub patterns)
- **UI Library**: Tailwind CSS + shadcn/ui
- **Data Fetching**: SWR or React Query
- **Charts**: Recharts
- **Date Handling**: date-fns
- **TypeScript**: Strict mode enabled

### Backend

- **API**: FastAPI or Flask (REST)
- **Database**: SQLite (dev), PostgreSQL (production)
- **Authentication**: JWT tokens (simple for prototype)

### Core Principles

1. **Transparency**: Show all context needed for informed decisions
2. **Efficiency**: Minimize clicks and cognitive load
3. **Safety**: Confirmations for destructive actions
4. **Auditability**: Log everything for compliance

---

## Project Structure

```
/ui/operator-dashboard
├── components/
│   ├── ReviewQueue/
│   │   ├── ReviewQueue.tsx
│   │   ├── RecommendationCard.tsx
│   │   ├── BulkActions.tsx
│   │   └── FilterPanel.tsx
│   ├── UserExplorer/
│   │   ├── UserExplorer.tsx
│   │   ├── UserSearch.tsx
│   │   ├── SignalCard.tsx
│   │   └── PersonaTimeline.tsx
│   ├── DecisionTraces/
│   │   ├── DecisionTraces.tsx
│   │   ├── TraceStep.tsx
│   │   └── TraceTimeline.tsx
│   ├── AlertPanel/
│   │   ├── AlertPanel.tsx
│   │   └── AlertItem.tsx
│   └── Common/
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── Modal.tsx
├── pages/
│   ├── index.tsx                 # Main dashboard
│   ├── user/[userId].tsx         # User detail view
│   └── audit-logs.tsx            # Audit log viewer
├── hooks/
│   ├── useRecommendations.ts
│   ├── useUserSignals.ts
│   └── useOperatorActions.ts
├── lib/
│   ├── api.ts                    # API client
│   └── types.ts                  # TypeScript types
└── styles/
    └── globals.css
```

---

## Implementation Guide

### Step 1: Project Setup

```bash
# Initialize Next.js project
npx create-next-app@latest operator-dashboard --typescript --tailwind --app

# Navigate to project
cd operator-dashboard

# Install core dependencies
npm install zustand swr recharts date-fns clsx tailwind-merge

# Install UI components (Radix UI primitives)
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-checkbox

# Install dev dependencies
npm install -D @types/node @types/react @types/react-dom
```

### Step 2: Environment Variables

Create `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Operator Configuration
NEXT_PUBLIC_OPERATOR_ID=op_001

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_BULK_APPROVE=true
NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES=false
```

### Step 3: TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Core Type Definitions

Create `/lib/types.ts`:

```tsx
// Core Types for Operator Dashboard

export interface Recommendation {
  id: string;
  user_id: string;
  persona_primary: string;
  type: string;
  title: string;
  rationale: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "approved" | "rejected" | "flagged";
  generated_at: string;
  approved_by?: string;
  approved_at?: string;
  operator_notes?: string;
  content_url?: string;
  read_time_minutes?: number;
  guardrails_passed: {
    tone_check: boolean;
    advice_check: boolean;
    eligibility_check: boolean;
  };
}

export interface UserSignals {
  user_id: string;
  persona_30d: {
    primary: string;
    secondary?: string;
    match_strength: number;
  };
  signals: {
    credit: CreditSignals;
    subscriptions: SubscriptionSignals;
    savings: SavingsSignals;
    income: IncomeSignals;
  };
}

export interface CreditSignals {
  aggregate_utilization_pct: number;
  total_credit_used: number;
  total_credit_available: number;
  any_interest_charges: boolean;
}

export interface SubscriptionSignals {
  recurring_merchant_count: number;
  monthly_recurring_spend: number;
  subscription_share_pct: number;
  merchants?: Array<{
    name: string;
    amount: number;
  }>;
}

export interface SavingsSignals {
  total_savings_balance: number;
  savings_growth_rate_pct: number;
  net_savings_inflow: number;
  emergency_fund_months: number;
}

export interface IncomeSignals {
  income_type: "salaried" | "variable" | "irregular";
  payment_frequency: "weekly" | "biweekly" | "monthly";
  median_pay_gap_days: number;
  income_variability_pct: number;
  cash_flow_buffer_months: number;
}

export interface DecisionTrace {
  recommendation_id: string;
  signals_detected_at: string;
  persona_assigned_at: string;
  content_matched_at: string;
  rationale_generated_at: string;
  guardrails_checked_at: string;
  created_at: string;
  signals: UserSignals["signals"];
  persona_assignment: {
    primary_persona: string;
    primary_match_strength: number;
    criteria_met: string[];
  };
  content_matches: any[];
  relevance_scores: any[];
  rationale: string;
  llm_model: string;
  temperature: number;
  tokens_used: number;
  tone_check: boolean;
  advice_check: boolean;
  eligibility_check: boolean;
  guardrails_passed: boolean;
  priority: string;
  type: string;
}

export interface OperatorStats {
  pending: number;
  approved_today: number;
  rejected_today: number;
  flagged: number;
  avg_review_time_seconds: number;
}

export interface Alert {
  id: string;
  type:
    | "high_rejection_rate"
    | "long_queue"
    | "guardrail_failures"
    | "llm_errors"
    | "flagged_item"
    | "unusual_pattern";
  severity: "low" | "medium" | "high";
  message: string;
  count?: number;
  actionUrl?: string;
  createdAt: string;
}

export interface OperatorAction {
  action: "approve" | "reject" | "modify" | "flag";
  recommendation_id: string;
  notes?: string;
  reason?: string;
  modifications?: Partial<Recommendation>;
}

export interface BulkApproveResult {
  total: number;
  approved: number;
  failed: number;
  approved_ids: string[];
  failed_items: Array<{
    recommendation_id: string;
    reason: string;
  }>;
}
```

---

## API Client Setup

Create `/lib/api.ts`:

```tsx
// API Client for Operator Dashboard

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Recommendations API
export async function fetchRecommendations(filters: {
  status?: string;
  persona?: string;
  priority?: string;
}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(
      ([_, v]) => v !== "all" && v !== undefined
    ) as [string, string][]
  );
  return apiRequest(`/api/operator/recommendations?${params}`);
}

export async function approveRecommendation(
  id: string,
  data: { notes: string }
) {
  return apiRequest(`/api/operator/recommendations/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function rejectRecommendation(
  id: string,
  data: { reason: string }
) {
  return apiRequest(`/api/operator/recommendations/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function modifyRecommendation(
  id: string,
  modifications: Partial<{ rationale: string; priority: string; title: string }>
) {
  return apiRequest(`/api/operator/recommendations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(modifications),
  });
}

export async function flagRecommendation(id: string, data: { reason: string }) {
  return apiRequest(`/api/operator/recommendations/${id}/flag`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function bulkApproveRecommendations(data: {
  recommendation_ids: string[];
  notes: string;
}) {
  return apiRequest(`/api/operator/recommendations/bulk-approve`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// User API
export async function fetchUserSignals(
  userId: string,
  windowType: string = "30d"
) {
  return apiRequest(
    `/api/operator/users/${userId}/signals?window_type=${windowType}`
  );
}

// Decision Traces API
export async function fetchDecisionTrace(recommendationId: string) {
  return apiRequest(`/api/operator/recommendations/${recommendationId}/trace`);
}

// Operator Stats API
export async function fetchOperatorStats(operatorId?: string) {
  const id = operatorId || process.env.NEXT_PUBLIC_OPERATOR_ID;
  return apiRequest(`/api/operator/stats?operator_id=${id}`);
}

// Alerts API
export async function fetchAlerts() {
  return apiRequest(`/api/operator/alerts`);
}

// Audit Logs API
export async function fetchAuditLogs(params: {
  operator_id?: string;
  start_date?: string;
  end_date?: string;
}) {
  const queryParams = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined) as [
      string,
      string
    ][]
  );
  return apiRequest(`/api/operator/audit-logs?${queryParams}`);
}
```

---

## Utility Functions

Create `/lib/utils.ts`:

```tsx
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

// Priority and persona color utilities
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getPersonaColor(persona: string): string {
  switch (persona) {
    case "high_utilization":
      return "bg-red-100 text-red-800";
    case "variable_income_budgeter":
      return "bg-orange-100 text-orange-800";
    case "student":
      return "bg-blue-100 text-blue-800";
    case "subscription_heavy":
      return "bg-purple-100 text-purple-800";
    case "savings_builder":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function formatPersonaName(persona: string): string {
  return persona.replace(/_/g, " ").toUpperCase();
}
```

---

## Tailwind Configuration

Update `tailwind.config.ts`:

```tsx
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Global Styles

Update `styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## Acceptance Criteria

**Must Have:**

- [ ] Project initialized with Next.js 14 + TypeScript
- [ ] All dependencies installed and configured
- [ ] TypeScript types defined for all core entities
- [ ] API client with all endpoint functions
- [ ] Environment variables configured
- [ ] Tailwind CSS setup with custom theme
- [ ] Utility functions for common operations
- [ ] Project structure matches specification

**Should Have:**

- [ ] ESLint and Prettier configured
- [ ] Git repository initialized with .gitignore
- [ ] README with setup instructions
- [ ] Component folder structure created

---

## Next Steps

After completing this shard:

1. **Proceed to Shard 2**: Core UI Framework (Common components)
2. **Verify API endpoints** are accessible (or mock them)
3. **Test API client** functions with sample data

---

## Testing Checklist

- [ ] `npm run dev` starts without errors
- [ ] TypeScript compilation succeeds
- [ ] API client functions are importable
- [ ] Environment variables are loaded correctly
- [ ] Tailwind classes apply correctly

---

**Dependencies:** None (foundation layer)  
**Blocks:** All other shards depend on this  
**Estimated Time:** 2-4 hours
