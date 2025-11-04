# SHARD 5: Decision Traces & Explainability

**Project:** SpendSense Operator Dashboard  
**Purpose:** Visualization of the complete AI decision-making pipeline  
**Phase:** Core Feature Implementation  
**Estimated Size:** ~15% of total implementation  
**Dependencies:** Shard 1 (Foundation), Shard 2 (UI Framework)

---

## Overview

Decision Traces provide complete transparency into how the AI system arrived at each recommendation. This feature shows the step-by-step pipeline from signal detection through guardrail checks, allowing operators to validate the AI's reasoning and debug issues.

---

## Decision Traces Component

Create `/components/DecisionTraces/DecisionTraces.tsx`:

```tsx
import React from "react";
import { useDecisionTrace } from "@/hooks/useDecisionTrace";
import { TraceStep } from "./TraceStep";
import { Spinner } from "@/components/Common/Spinner";

interface Props {
  recommendationId: string;
}

export function DecisionTraces({ recommendationId }: Props) {
  const { data: trace, isLoading, error } = useDecisionTrace(recommendationId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-sm text-gray-500">Loading trace...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">Failed to load decision trace</div>
    );
  }

  if (!trace) {
    return <div className="text-sm text-gray-500">No trace available</div>;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Decision Trace</h4>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Trace Steps */}
        <div className="space-y-6">
          <TraceStep
            title="Signals Detected"
            timestamp={trace.signals_detected_at}
            status="completed"
            data={{
              subscription_signals: trace.signals.subscriptions,
              credit_signals: trace.signals.credit,
              savings_signals: trace.signals.savings,
              income_signals: trace.signals.income,
            }}
          />

          <TraceStep
            title="Persona Assigned"
            timestamp={trace.persona_assigned_at}
            status="completed"
            data={{
              primary_persona: trace.persona_assignment.primary_persona,
              match_strength: trace.persona_assignment.primary_match_strength,
              criteria_met: trace.persona_assignment.criteria_met,
            }}
          />

          <TraceStep
            title="Content Matched"
            timestamp={trace.content_matched_at}
            status="completed"
            data={{
              matched_content: trace.content_matches,
              relevance_scores: trace.relevance_scores,
            }}
          />

          <TraceStep
            title="Rationale Generated"
            timestamp={trace.rationale_generated_at}
            status="completed"
            data={{
              rationale: trace.rationale,
              llm_model: trace.llm_model,
              temperature: trace.temperature,
              tokens_used: trace.tokens_used,
            }}
          />

          <TraceStep
            title="Guardrail Checks"
            timestamp={trace.guardrails_checked_at}
            status={trace.guardrails_passed ? "completed" : "warning"}
            data={{
              tone_check: trace.tone_check,
              advice_check: trace.advice_check,
              eligibility_check: trace.eligibility_check,
              all_passed: trace.guardrails_passed,
            }}
          />

          <TraceStep
            title="Recommendation Created"
            timestamp={trace.created_at}
            status="completed"
            data={{
              recommendation_id: trace.recommendation_id,
              priority: trace.priority,
              type: trace.type,
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## Trace Step Component

Create `/components/DecisionTraces/TraceStep.tsx`:

```tsx
import React, { useState } from "react";
import { formatDateTime } from "@/lib/utils";

interface Props {
  title: string;
  timestamp: string;
  status: "completed" | "warning" | "error";
  data: any;
}

export function TraceStep({ title, timestamp, status, data }: Props) {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <span className="text-green-600 text-lg">✓</span>;
      case "warning":
        return <span className="text-yellow-600 text-lg">⚠</span>;
      case "error":
        return <span className="text-red-600 text-lg">✗</span>;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
    }
  };

  const renderDataSummary = () => {
    // Custom rendering based on step type
    if (title === "Signals Detected") {
      return (
        <div className="text-sm text-gray-700">
          {Object.keys(data).length} signal categories detected
        </div>
      );
    }

    if (title === "Persona Assigned") {
      return (
        <div className="text-sm text-gray-700">
          <strong>{data.primary_persona}</strong> (
          {(data.match_strength * 100).toFixed(0)}% match)
        </div>
      );
    }

    if (title === "Content Matched") {
      return (
        <div className="text-sm text-gray-700">
          {data.matched_content?.length || 0} content items matched
        </div>
      );
    }

    if (title === "Rationale Generated") {
      return (
        <div className="text-sm text-gray-700">
          Generated using {data.llm_model} ({data.tokens_used} tokens)
        </div>
      );
    }

    if (title === "Guardrail Checks") {
      const passed = Object.values(data).filter((v) => v === true).length - 1; // -1 for all_passed
      const total = Object.keys(data).length - 1;
      return (
        <div className="text-sm text-gray-700">
          {passed}/{total} checks passed
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative pl-12">
      {/* Status Icon */}
      <div className="absolute left-0 top-0 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center z-10">
        {getStatusIcon()}
      </div>

      {/* Content */}
      <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h5 className="font-medium text-gray-900">{title}</h5>
            {renderDataSummary()}
          </div>
          <span className="text-xs text-gray-600">
            {formatDateTime(timestamp)}
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {expanded ? "Hide" : "Show"} Details
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-3 rounded overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Trace Timeline Visualization (Optional Enhancement)

Create `/components/DecisionTraces/TraceTimeline.tsx`:

```tsx
import React from "react";
import { formatRelativeTime } from "@/lib/utils";

interface TraceEvent {
  step: string;
  timestamp: string;
  duration_ms?: number;
}

interface Props {
  events: TraceEvent[];
}

export function TraceTimeline({ events }: Props) {
  if (!events || events.length === 0) {
    return null;
  }

  // Calculate total duration
  const firstEvent = new Date(events[0].timestamp).getTime();
  const lastEvent = new Date(events[events.length - 1].timestamp).getTime();
  const totalDuration = lastEvent - firstEvent;

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-medium text-gray-900">Processing Timeline</h5>

      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        {events.map((event, index) => {
          if (index === 0) return null; // Skip first event as it's the start

          const eventTime = new Date(event.timestamp).getTime();
          const position = ((eventTime - firstEvent) / totalDuration) * 100;

          return (
            <div
              key={index}
              className="absolute h-full w-1 bg-indigo-600"
              style={{ left: `${position}%` }}
              title={`${event.step}: ${formatRelativeTime(event.timestamp)}`}
            />
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-gray-600">
        <span>Start</span>
        <span>{totalDuration}ms total</span>
      </div>
    </div>
  );
}
```

---

## Custom Hook for Decision Trace

Create `/hooks/useDecisionTrace.ts`:

```typescript
import useSWR from "swr";
import { fetchDecisionTrace } from "@/lib/api";
import type { DecisionTrace } from "@/lib/types";

export function useDecisionTrace(recommendationId: string) {
  const { data, error, isLoading, mutate } = useSWR<DecisionTrace>(
    recommendationId
      ? `/api/operator/recommendations/${recommendationId}/trace`
      : null,
    () => (recommendationId ? fetchDecisionTrace(recommendationId) : null),
    {
      revalidateOnFocus: false, // Traces don't change, no need to refetch
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

### GET /api/operator/recommendations/{id}/trace

**Response:**

```json
{
  "recommendation_id": "rec_123",
  "signals_detected_at": "2025-11-03T10:30:00.123Z",
  "persona_assigned_at": "2025-11-03T10:30:00.456Z",
  "content_matched_at": "2025-11-03T10:30:01.234Z",
  "rationale_generated_at": "2025-11-03T10:30:03.567Z",
  "guardrails_checked_at": "2025-11-03T10:30:04.123Z",
  "created_at": "2025-11-03T10:30:04.234Z",

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
      "subscription_share_pct": 18
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
  },

  "persona_assignment": {
    "primary_persona": "high_utilization",
    "primary_match_strength": 0.85,
    "criteria_met": [
      "credit_utilization > 50%",
      "interest_charges_present",
      "emergency_fund < 3 months"
    ]
  },

  "content_matches": [
    {
      "content_id": "article_credit_101",
      "title": "Understanding Credit Utilization",
      "relevance_score": 0.92,
      "match_reason": "high_credit_utilization"
    },
    {
      "content_id": "video_debt_reduction",
      "title": "5 Steps to Reduce Credit Card Debt",
      "relevance_score": 0.88,
      "match_reason": "debt_management"
    }
  ],

  "relevance_scores": {
    "persona_match": 0.85,
    "signal_strength": 0.78,
    "content_relevance": 0.92
  },

  "rationale": "Based on your high credit utilization of 68%, we recommend learning about credit management strategies...",
  "llm_model": "gpt-4",
  "temperature": 0.7,
  "tokens_used": 245,

  "tone_check": true,
  "advice_check": true,
  "eligibility_check": true,
  "guardrails_passed": true,

  "priority": "high",
  "type": "article"
}
```

---

## Enhanced Data Visualization Components

### Signal Strength Indicator

Create `/components/DecisionTraces/SignalStrengthIndicator.tsx`:

```tsx
import React from "react";

interface Props {
  strength: number; // 0-1
  label: string;
}

export function SignalStrengthIndicator({ strength, label }: Props) {
  const percentage = Math.round(strength * 100);

  const getColor = () => {
    if (strength >= 0.7) return "bg-green-500";
    if (strength >= 0.4) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

### Criteria Met List

Create `/components/DecisionTraces/CriteriaMetList.tsx`:

```tsx
import React from "react";

interface Props {
  criteria: string[];
}

export function CriteriaMetList({ criteria }: Props) {
  if (!criteria || criteria.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-700">Criteria Met:</div>
      <ul className="space-y-1">
        {criteria.map((criterion, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-gray-600"
          >
            <span className="text-green-600 mt-0.5">✓</span>
            <span>{criterion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Content Match Card

Create `/components/DecisionTraces/ContentMatchCard.tsx`:

```tsx
import React from "react";
import { SignalStrengthIndicator } from "./SignalStrengthIndicator";

interface ContentMatch {
  content_id: string;
  title: string;
  relevance_score: number;
  match_reason: string;
}

interface Props {
  match: ContentMatch;
}

export function ContentMatchCard({ match }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <h6 className="text-sm font-medium text-gray-900">{match.title}</h6>
          <p className="text-xs text-gray-600 mt-1">ID: {match.content_id}</p>
        </div>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
          {match.match_reason.replace(/_/g, " ")}
        </span>
      </div>

      <SignalStrengthIndicator
        strength={match.relevance_score}
        label="Relevance"
      />
    </div>
  );
}
```

---

## Enhanced TraceStep with Custom Rendering

Update `/components/DecisionTraces/TraceStep.tsx` to include the new components:

```tsx
import React, { useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { SignalStrengthIndicator } from "./SignalStrengthIndicator";
import { CriteriaMetList } from "./CriteriaMetList";
import { ContentMatchCard } from "./ContentMatchCard";

// ... previous Props and getStatusIcon/getStatusColor functions ...

const renderDetailedView = (title: string, data: any) => {
  switch (title) {
    case "Persona Assigned":
      return (
        <div className="space-y-3">
          <div className="text-sm">
            <strong>Primary Persona:</strong> {data.primary_persona}
          </div>
          <SignalStrengthIndicator
            strength={data.match_strength}
            label="Match Strength"
          />
          <CriteriaMetList criteria={data.criteria_met} />
        </div>
      );

    case "Content Matched":
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">
            Matched Content ({data.matched_content?.length || 0} items)
          </div>
          {data.matched_content?.slice(0, 3).map((match: any, i: number) => (
            <ContentMatchCard key={i} match={match} />
          ))}
          {(data.matched_content?.length || 0) > 3 && (
            <div className="text-xs text-gray-500 text-center">
              +{data.matched_content.length - 3} more items
            </div>
          )}
        </div>
      );

    case "Rationale Generated":
      return (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-sm text-gray-700">{data.rationale}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Model:</span> {data.llm_model}
            </div>
            <div>
              <span className="font-medium">Temperature:</span>{" "}
              {data.temperature}
            </div>
            <div>
              <span className="font-medium">Tokens:</span> {data.tokens_used}
            </div>
          </div>
        </div>
      );

    case "Guardrail Checks":
      return (
        <div className="space-y-2">
          {Object.entries(data)
            .filter(([key]) => key !== "all_passed")
            .map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={value ? "text-green-600" : "text-red-600"}>
                  {value ? "✓" : "✗"}
                </span>
                <span className="text-sm text-gray-700">
                  {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
            ))}
        </div>
      );

    default:
      return (
        <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-3 rounded overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
  }
};

// Use renderDetailedView instead of JSON.stringify in the expanded section
```

---

## Acceptance Criteria

**Must Have:**

- [ ] Decision trace loads for each recommendation
- [ ] All pipeline steps displayed in order
- [ ] Each step shows timestamp
- [ ] Status indicators (completed/warning/error) work
- [ ] Expand/collapse functionality for details
- [ ] Signals detected step shows all signals
- [ ] Persona assignment shows match strength
- [ ] Content matches displayed
- [ ] Rationale and LLM details shown
- [ ] Guardrail checks with pass/fail indicators
- [ ] Loading state while fetching trace
- [ ] Error state for failed requests

**Should Have:**

- [ ] Visual timeline of processing steps
- [ ] Signal strength indicators
- [ ] Criteria met list formatted
- [ ] Content match cards with relevance scores
- [ ] LLM token usage displayed
- [ ] Total processing time shown

---

## Testing Checklist

- [ ] Trace loads when recommendation selected
- [ ] All 6 pipeline steps render
- [ ] Timestamps display correctly
- [ ] Status icons match step status
- [ ] Expand button toggles detail view
- [ ] Collapsed view shows summary
- [ ] Expanded view shows full data
- [ ] Signals display all categories
- [ ] Persona match strength shows percentage
- [ ] Content matches show relevance scores
- [ ] Rationale text displays correctly
- [ ] Guardrail checks show pass/fail
- [ ] Loading spinner during fetch
- [ ] Error message on failure
- [ ] Timeline visualization works (if implemented)

---

## Performance Considerations

- Decision traces can be data-heavy; consider lazy loading
- Cache traces in SWR to avoid repeated fetches
- Collapse details by default to improve render performance
- Use virtualization if displaying many traces at once

---

**Dependencies:** Shard 1, Shard 2  
**Blocks:** None (independent feature, but enhances Review Queue)  
**Estimated Time:** 4-5 hours
