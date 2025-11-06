# Shard 0: Project Foundation & Setup

**SpendSense Operator Dashboard**

## Project Overview

**Product:** Operator Dashboard for SpendSense - Explainable AI for Financial Education  
**Purpose:** Web-based oversight interface enabling compliance operators to review, approve, modify, or reject AI-generated recommendations before they reach users  
**Type:** Internal tool / Human-in-the-loop system

### Core Value Proposition

- **Quality Assurance**: Human review before user-facing recommendations
- **Explainability**: Full decision traces showing how recommendations were generated
- **Efficiency**: Bulk approval actions with smart filtering
- **Auditability**: Complete audit trail of all operator actions
- **Debugging**: Deep-dive into user signals and persona assignments

---

## Technology Stack

### Frontend

- **Framework**: React 18 + Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand (matching Mockup Matcha Hub pattern)
- **UI Library**: Tailwind CSS + shadcn/ui
- **Data Fetching**: SWR (stale-while-revalidate)
- **Charts**: Recharts
- **Date Handling**: date-fns

### Backend

- **API**: FastAPI or Flask (REST)
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT tokens (simple for prototype)

---

## Project Structure

```
/ui/operator-dashboard/
├── app/
│   ├── page.tsx                      # Main dashboard
│   ├── user/
│   │   └── [userId]/
│   │       └── page.tsx              # User detail view
│   ├── audit-logs/
│   │   └── page.tsx                  # Audit log viewer
│   └── layout.tsx                    # Root layout
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
│   ├── AuditLog/
│   │   └── AuditLogTable.tsx
│   └── Common/
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useRecommendations.ts
│   ├── useUserSignals.ts
│   ├── useOperatorActions.ts
│   ├── useDecisionTrace.ts
│   ├── useOperatorStats.ts
│   └── useAlerts.ts
├── lib/
│   ├── api.ts                        # API client
│   ├── types.ts                      # TypeScript types
│   ├── utils.ts                      # Utilities
│   ├── mock-data.ts                  # Mock data for dev
│   └── error-handler.ts              # Error handling
└── styles/
    └── globals.css
```

---

## Installation & Setup

### 1. Create Next.js Project

```bash
npx create-next-app@latest operator-dashboard --typescript --tailwind --app
cd operator-dashboard
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install zustand swr date-fns clsx tailwind-merge

# UI components (Radix UI for shadcn/ui)
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-checkbox

# Charts
npm install recharts

# Dev dependencies
npm install -D @types/node @types/react @types/react-dom
```

### 3. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPERATOR_ID=op_001
```

---

## Core TypeScript Types

### lib/types.ts

```tsx
// Recommendation Status
export type RecommendationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "flagged"
  | "queued_for_delivery";

// Priority Levels
export type Priority = "high" | "medium" | "low";

// Persona Types
export type PersonaType =
  | "high_utilization"
  | "variable_income_budgeter"
  | "student"
  | "subscription_heavy"
  | "savings_builder";

// Content Types
export type ContentType = "article" | "video" | "tool" | "tip";

// Operator Actions
export type OperatorAction =
  | "approve"
  | "reject"
  | "modify"
  | "flag"
  | "bulk_approve";

// Alert Types
export type AlertType =
  | "high_rejection_rate"
  | "long_queue"
  | "guardrail_failures"
  | "llm_errors"
  | "flagged_item"
  | "unusual_pattern";

export type AlertSeverity = "low" | "medium" | "high";

// Main Entities

export interface Recommendation {
  id: string;
  user_id: string;
  persona_primary: PersonaType;
  type: ContentType;
  title: string;
  rationale: string;
  priority: Priority;
  status: RecommendationStatus;
  generated_at: string;
  content_url?: string;
  read_time_minutes?: number;
  guardrails_passed: GuardrailChecks;
  approved_by?: string;
  approved_at?: string;
  modified_by?: string;
  modified_at?: string;
  operator_notes?: string;
}

export interface GuardrailChecks {
  tone_check: boolean;
  advice_check: boolean;
  eligibility_check: boolean;
}

export interface UserSignals {
  user_id: string;
  persona_30d: {
    primary: PersonaType;
    match_strength: number;
  };
  signals: {
    credit: CreditSignal;
    subscriptions: SubscriptionSignal;
    savings: SavingsSignal;
    income: IncomeSignal;
  };
}

export interface CreditSignal {
  aggregate_utilization_pct: number;
  total_credit_used: number;
  total_credit_available: number;
  any_interest_charges: boolean;
}

export interface SubscriptionSignal {
  recurring_merchant_count: number;
  monthly_recurring_spend: number;
  subscription_share_pct: number;
  merchants?: Array<{
    name: string;
    amount: number;
  }>;
}

export interface SavingsSignal {
  total_savings_balance: number;
  savings_growth_rate_pct: number;
  net_savings_inflow: number;
  emergency_fund_months: number;
}

export interface IncomeSignal {
  income_type: "salary" | "hourly" | "variable" | "mixed";
  payment_frequency: "weekly" | "biweekly" | "monthly" | "irregular";
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
    primary_persona: PersonaType;
    primary_match_strength: number;
    criteria_met: string[];
  };
  content_matches: Array<{
    content_id: string;
    title: string;
    relevance_score: number;
  }>;
  relevance_scores: Record<string, number>;
  rationale: string;
  llm_model: string;
  temperature: number;
  tokens_used: number;
  tone_check: {
    passed: boolean;
    issues?: string[];
  };
  advice_check: {
    passed: boolean;
    issues?: string[];
  };
  eligibility_check: {
    passed: boolean;
    issues?: string[];
  };
  guardrails_passed: boolean;
  priority: Priority;
  type: ContentType;
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
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  count?: number;
  actionUrl?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  audit_id: string;
  operator_id: string;
  action: OperatorAction;
  recommendation_id: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface RecommendationFlag {
  flag_id: string;
  recommendation_id: string;
  flagged_by: string;
  flag_reason: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  flagged_at: string;
}

// API Response Types

export interface BulkApproveResponse {
  total: number;
  approved: number;
  failed: number;
  approved_ids: string[];
  failed_items: Array<{
    recommendation_id: string;
    reason: string;
  }>;
}

export interface ApproveResponse {
  status: "approved";
  recommendation_id: string;
  approved_by: string;
  approved_at: string;
}

export interface RejectResponse {
  status: "rejected";
  recommendation_id: string;
  rejected_by: string;
  reason: string;
}

export interface ModifyResponse {
  status: "modified";
  recommendation_id: string;
  modifications: Record<string, any>;
}

export interface FlagResponse {
  status: "flagged";
  recommendation_id: string;
  flag_id: string;
}

// Filter Types

export interface RecommendationFilters {
  persona: PersonaType | "all";
  priority: Priority | "all";
  status: RecommendationStatus;
}

export interface AuditLogFilters {
  operator_id: string | "all";
  action: OperatorAction | "all";
  start_date: string;
  end_date: string;
}
```

---

## Database Schema

### Operator Audit Log Table

```sql
CREATE TABLE operator_audit_log (
    audit_id TEXT PRIMARY KEY,
    operator_id TEXT NOT NULL,
    action TEXT NOT NULL,              -- 'approve', 'reject', 'modify', 'flag', 'bulk_approve'
    recommendation_id TEXT NOT NULL,
    metadata JSON,                     -- Additional context (notes, reason, modifications)
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

-- Indexes for performance
CREATE INDEX idx_audit_operator ON operator_audit_log(operator_id);
CREATE INDEX idx_audit_action ON operator_audit_log(action);
CREATE INDEX idx_audit_timestamp ON operator_audit_log(timestamp);
CREATE INDEX idx_audit_recommendation ON operator_audit_log(recommendation_id);
```

### Recommendation Flags Table

```sql
CREATE TABLE recommendation_flags (
    flag_id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL,
    flagged_by TEXT NOT NULL,          -- operator_id
    flag_reason TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by TEXT,
    resolved_at TIMESTAMP,
    flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

-- Indexes
CREATE INDEX idx_flags_recommendation ON recommendation_flags(recommendation_id);
CREATE INDEX idx_flags_resolved ON recommendation_flags(resolved);
CREATE INDEX idx_flags_operator ON recommendation_flags(flagged_by);
```

### Recommendations Table (Extended)

```sql
-- Extend existing recommendations table with operator review fields
ALTER TABLE recommendations ADD COLUMN approved_by TEXT;
ALTER TABLE recommendations ADD COLUMN approved_at TIMESTAMP;
ALTER TABLE recommendations ADD COLUMN modified_by TEXT;
ALTER TABLE recommendations ADD COLUMN modified_at TIMESTAMP;
ALTER TABLE recommendations ADD COLUMN operator_notes TEXT;
```

---

## Utility Functions

### lib/utils.ts

```tsx
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return formatDate(date);
}

/**
 * Get priority color classes
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

/**
 * Get persona color classes
 */
export function getPersonaColor(persona: string): string {
  switch (persona) {
    case "high_utilization":
      return "bg-red-100 text-red-800 border-red-200";
    case "variable_income_budgeter":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "student":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "subscription_heavy":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "savings_builder":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

/**
 * Format persona name for display
 */
export function formatPersonaName(persona: string): string {
  return persona
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "flagged":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
```

---

## Tailwind Configuration

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SpendSense brand colors
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        // Persona colors
        persona: {
          "high-utilization": "#fee2e2",
          "variable-income": "#fed7aa",
          student: "#dbeafe",
          subscription: "#e9d5ff",
          savings: "#d1fae5",
        },
      },
    },
  },
  plugins: [],
};
```

---

## Next Steps

After setting up the foundation with this shard:

1. **Verify Installation**: Run `npm install` and ensure all dependencies are installed
2. **Start Dev Server**: Run `npm run dev` to start the development server
3. **Create Base API Client**: Implement `lib/api.ts` (see Shard 5)
4. **Add Mock Data**: Create `lib/mock-data.ts` for development (see Shard 5)
5. **Proceed to Shard 1**: Build the main dashboard layout and common components

---

## Design Principles

1. **Transparency**: Show all context needed for informed decisions
2. **Efficiency**: Minimize clicks and cognitive load
3. **Safety**: Confirmations for destructive actions (bulk approve, reject)
4. **Auditability**: Log everything for compliance
5. **Accessibility**: Keyboard navigation, clear focus states, ARIA labels
6. **Performance**: Optimize for <2s dashboard load time

---

## Success Criteria

| Metric                | Target                                           |
| --------------------- | ------------------------------------------------ |
| Dashboard Load Time   | <2 seconds (95th percentile)                     |
| Review Speed          | 50 recommendations/hour per operator             |
| Accuracy              | <1% of approved recommendations require revision |
| System Uptime         | 99% during business hours                        |
| Operator Satisfaction | ≥4.0/5.0 usability rating                        |

---

**End of Shard 0**
