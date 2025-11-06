# SHARD 4: User Explorer & Signals

**Project:** SpendSense Operator Dashboard  
**Purpose:** Deep-dive interface for exploring user behavioral signals and persona history  
**Phase:** Core Feature Implementation  
**Estimated Size:** ~15% of total implementation  
**Dependencies:** Shard 1 (Foundation), Shard 2 (UI Framework)

---

## Overview

The User Explorer allows operators to search for specific users and view their complete behavioral signal profile, including credit utilization, subscriptions, savings, and income patterns. This feature helps operators understand the context behind AI-generated recommendations.

---

## User Explorer Component

Create `/components/UserExplorer/UserExplorer.tsx`:

```tsx
import React, { useState } from "react";
import { UserSearch } from "./UserSearch";
import { SignalCard } from "./SignalCard";
import { PersonaTimeline } from "./PersonaTimeline";
import { useUserSignals } from "@/hooks/useUserSignals";
import { Spinner } from "@/components/Common/Spinner";
import { Badge } from "@/components/Common/Badge";
import { getPersonaColor, formatPersonaName } from "@/lib/utils";

export function UserExplorer() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: userData, isLoading, error } = useUserSignals(selectedUserId);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        User Signal Explorer
      </h2>

      {/* Search */}
      <UserSearch onUserSelect={setSelectedUserId} />

      {/* User Details */}
      {selectedUserId && (
        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <Spinner size="lg" />
              <p className="text-gray-500 mt-2">Loading user data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Failed to load user data. Please try again.
              </p>
            </div>
          ) : userData ? (
            <>
              {/* User Info Header */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {userData.user_id}
                  </h3>
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Primary Persona: </span>
                    <Badge
                      className={getPersonaColor(userData.persona_30d.primary)}
                    >
                      {formatPersonaName(userData.persona_30d.primary)}
                    </Badge>
                  </div>

                  {userData.persona_30d.secondary && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Secondary: </span>
                      <Badge
                        className={getPersonaColor(
                          userData.persona_30d.secondary
                        )}
                      >
                        {formatPersonaName(userData.persona_30d.secondary)}
                      </Badge>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Match Strength: </span>
                    <span className="font-semibold text-gray-900">
                      {(userData.persona_30d.match_strength * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Window: </span>
                    30 days
                  </div>
                </div>
              </div>

              {/* Signals Grid */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Behavioral Signals
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <SignalCard
                    title="Credit Utilization"
                    data={userData.signals.credit}
                    type="credit"
                  />
                  <SignalCard
                    title="Subscriptions"
                    data={userData.signals.subscriptions}
                    type="subscriptions"
                  />
                  <SignalCard
                    title="Savings"
                    data={userData.signals.savings}
                    type="savings"
                  />
                  <SignalCard
                    title="Income Stability"
                    data={userData.signals.income}
                    type="income"
                  />
                </div>
              </div>

              {/* Persona History Timeline */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Persona History (180 days)
                </h4>
                <PersonaTimeline userId={selectedUserId} />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">User not found</div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## User Search Component

Create `/components/UserExplorer/UserSearch.tsx`:

```tsx
import React, { useState } from "react";
import { Button } from "@/components/Common/Button";

interface Props {
  onUserSelect: (userId: string) => void;
}

export function UserSearch({ onUserSelect }: Props) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onUserSelect(searchInput.trim());
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Enter user ID..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}
```

---

## Signal Card Component

Create `/components/UserExplorer/SignalCard.tsx`:

```tsx
import React from "react";
import type {
  CreditSignals,
  SubscriptionSignals,
  SavingsSignals,
  IncomeSignals,
} from "@/lib/types";

interface Props {
  title: string;
  data: CreditSignals | SubscriptionSignals | SavingsSignals | IncomeSignals;
  type: "credit" | "subscriptions" | "savings" | "income";
}

export function SignalCard({ title, data, type }: Props) {
  const renderContent = () => {
    switch (type) {
      case "credit":
        const creditData = data as CreditSignals;
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Aggregate Utilization
              </span>
              <span
                className={`text-sm font-semibold ${
                  creditData.aggregate_utilization_pct >= 50
                    ? "text-red-600"
                    : creditData.aggregate_utilization_pct >= 30
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {creditData.aggregate_utilization_pct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Credit Used</span>
              <span className="text-sm font-semibold text-gray-900">
                ${creditData.total_credit_used.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Total Credit Available
              </span>
              <span className="text-sm font-semibold text-gray-900">
                ${creditData.total_credit_available.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Interest Charges</span>
              <span
                className={`text-sm font-semibold ${
                  creditData.any_interest_charges
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {creditData.any_interest_charges ? "Yes" : "None"}
              </span>
            </div>
          </div>
        );

      case "subscriptions":
        const subsData = data as SubscriptionSignals;
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Recurring Merchants</span>
              <span className="text-sm font-semibold text-gray-900">
                {subsData.recurring_merchant_count}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Spend</span>
              <span className="text-sm font-semibold text-gray-900">
                ${subsData.monthly_recurring_spend.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">% of Total Spend</span>
              <span className="text-sm font-semibold text-gray-900">
                {subsData.subscription_share_pct}%
              </span>
            </div>
            {subsData.merchants && subsData.merchants.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">
                  Top Subscriptions:
                </div>
                {subsData.merchants.slice(0, 3).map((m, i) => (
                  <div key={i} className="text-xs text-gray-600">
                    • {m.name}: ${m.amount.toFixed(2)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "savings":
        const savingsData = data as SavingsSignals;
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Balance</span>
              <span className="text-sm font-semibold text-gray-900">
                ${savingsData.total_savings_balance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Growth Rate</span>
              <span
                className={`text-sm font-semibold ${
                  savingsData.savings_growth_rate_pct > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {savingsData.savings_growth_rate_pct > 0 ? "+" : ""}
                {savingsData.savings_growth_rate_pct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Inflow</span>
              <span className="text-sm font-semibold text-gray-900">
                ${savingsData.net_savings_inflow.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Emergency Fund</span>
              <span
                className={`text-sm font-semibold ${
                  savingsData.emergency_fund_months >= 3
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {savingsData.emergency_fund_months.toFixed(1)} months
              </span>
            </div>
          </div>
        );

      case "income":
        const incomeData = data as IncomeSignals;
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Income Type</span>
              <span className="text-sm font-semibold text-gray-900 capitalize">
                {incomeData.income_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment Frequency</span>
              <span className="text-sm font-semibold text-gray-900 capitalize">
                {incomeData.payment_frequency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Median Pay Gap</span>
              <span className="text-sm font-semibold text-gray-900">
                {incomeData.median_pay_gap_days} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Income Variability</span>
              <span
                className={`text-sm font-semibold ${
                  incomeData.income_variability_pct > 20
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {incomeData.income_variability_pct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cash Flow Buffer</span>
              <span
                className={`text-sm font-semibold ${
                  incomeData.cash_flow_buffer_months < 1
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {incomeData.cash_flow_buffer_months.toFixed(1)} months
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
      {renderContent()}
    </div>
  );
}
```

---

## Persona Timeline Component

Create `/components/UserExplorer/PersonaTimeline.tsx`:

```tsx
import React from "react";
import { usePersonaHistory } from "@/hooks/usePersonaHistory";
import { Spinner } from "@/components/Common/Spinner";
import { Badge } from "@/components/Common/Badge";
import { getPersonaColor, formatPersonaName, formatDate } from "@/lib/utils";

interface Props {
  userId: string;
}

export function PersonaTimeline({ userId }: Props) {
  const { data: history, isLoading, error } = usePersonaHistory(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">Failed to load persona history</div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-gray-500">No persona history available</div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex-shrink-0 text-sm text-gray-600 w-24">
            {formatDate(entry.date)}
          </div>

          <div className="flex-1 flex items-center gap-2">
            <Badge className={getPersonaColor(entry.persona)}>
              {formatPersonaName(entry.persona)}
            </Badge>

            <span className="text-sm text-gray-600">
              ({(entry.match_strength * 100).toFixed(0)}% match)
            </span>
          </div>

          {index === 0 && (
            <div className="flex-shrink-0">
              <Badge className="bg-indigo-100 text-indigo-800">Current</Badge>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Custom Hooks

### useUserSignals Hook

Create `/hooks/useUserSignals.ts`:

```tsx
import useSWR from "swr";
import { fetchUserSignals } from "@/lib/api";
import type { UserSignals } from "@/lib/types";

export function useUserSignals(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<UserSignals>(
    userId ? `/api/operator/users/${userId}/signals` : null,
    () => (userId ? fetchUserSignals(userId) : null),
    {
      revalidateOnFocus: false, // Don't refetch on focus for user data
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
```

### usePersonaHistory Hook

Create `/hooks/usePersonaHistory.ts`:

```tsx
import useSWR from "swr";

interface PersonaHistoryEntry {
  date: string;
  persona: string;
  match_strength: number;
}

async function fetchPersonaHistory(
  userId: string
): Promise<PersonaHistoryEntry[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const response = await fetch(
    `${API_URL}/api/operator/users/${userId}/persona-history`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch persona history");
  }

  return response.json();
}

export function usePersonaHistory(userId: string) {
  const { data, error, isLoading, mutate } = useSWR<PersonaHistoryEntry[]>(
    userId ? `/api/operator/users/${userId}/persona-history` : null,
    () => (userId ? fetchPersonaHistory(userId) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
```

---

## API Endpoint Requirements

### GET /api/operator/users/{user_id}/signals

**Query Parameters:**

- `window_type` (optional): 30d | 60d | 90d | 180d (default: 30d)

**Response:**

```json
{
  "user_id": "user_456",
  "persona_30d": {
    "primary": "high_utilization",
    "secondary": "subscription_heavy",
    "match_strength": 0.85
  },
  "signals": {
    "credit": {
      "aggregate_utilization_pct": 68,
      "total_credit_used": 13600,
      "total_credit_available": 20000,
      "any_interest_charges": true
    },
    "subscriptions": {
      "recurring_merchant_count": 12,
      "monthly_recurring_spend": 247,
      "subscription_share_pct": 18,
      "merchants": [
        { "name": "Netflix", "amount": 15.99 },
        { "name": "Spotify", "amount": 9.99 },
        { "name": "Amazon Prime", "amount": 14.99 }
      ]
    },
    "savings": {
      "total_savings_balance": 2500,
      "savings_growth_rate_pct": 5,
      "net_savings_inflow": 125,
      "emergency_fund_months": 1.2
    },
    "income": {
      "income_type": "salaried",
      "payment_frequency": "biweekly",
      "median_pay_gap_days": 14,
      "income_variability_pct": 8,
      "cash_flow_buffer_months": 0.8
    }
  }
}
```

### GET /api/operator/users/{user_id}/persona-history

**Response:**

```json
[
  {
    "date": "2025-11-03",
    "persona": "high_utilization",
    "match_strength": 0.85
  },
  {
    "date": "2025-10-03",
    "persona": "high_utilization",
    "match_strength": 0.82
  },
  {
    "date": "2025-09-03",
    "persona": "variable_income_budgeter",
    "match_strength": 0.71
  }
]
```

---

## Additional Utility Functions

Add to `/lib/utils.ts`:

```tsx
// Format persona name for display
export function formatPersonaName(persona: string): string {
  return persona.replace(/_/g, " ").toUpperCase();
}

// Get signal health status
export function getSignalHealth(
  type: string,
  value: number
): "good" | "warning" | "critical" {
  switch (type) {
    case "credit_utilization":
      if (value < 30) return "good";
      if (value < 50) return "warning";
      return "critical";

    case "emergency_fund":
      if (value >= 3) return "good";
      if (value >= 1) return "warning";
      return "critical";

    case "income_variability":
      if (value < 20) return "good";
      if (value < 40) return "warning";
      return "critical";

    default:
      return "good";
  }
}
```

---

## Acceptance Criteria

**Must Have:**

- [ ] User search input functional
- [ ] Can fetch and display user signals
- [ ] All four signal cards render correctly
- [ ] Credit utilization shows with color coding
- [ ] Subscription merchants list displays
- [ ] Savings growth rate shows with indicator
- [ ] Income stability metrics visible
- [ ] Persona badge displays with correct color
- [ ] Persona history timeline shows past assignments
- [ ] Loading states for async data
- [ ] Error states for failed requests
- [ ] Clear button to reset search

**Should Have:**

- [ ] Match strength percentage displayed
- [ ] Secondary persona shown if exists
- [ ] Signal health indicators (good/warning/critical)
- [ ] Smooth transitions between searches
- [ ] Copy user ID button

---

## Testing Checklist

- [ ] User search submits on Enter key
- [ ] Valid user ID loads signal data
- [ ] Invalid user ID shows error message
- [ ] All signal cards populate with data
- [ ] Credit utilization color changes based on value
- [ ] Subscription merchants list renders
- [ ] Savings metrics display correctly
- [ ] Income type and frequency shown
- [ ] Persona timeline loads historical data
- [ ] Timeline shows current persona badge
- [ ] Loading spinner displays during fetch
- [ ] Error message shows on API failure
- [ ] Clear button resets the view

---

**Dependencies:** Shard 1, Shard 2  
**Blocks:** None (independent feature)  
**Estimated Time:** 4-6 hours
