# Decision Traces Component

Complete transparency layer into the AI decision-making pipeline for SpendSense recommendations.

## Overview

The Decision Traces feature visualizes the step-by-step process from signal detection through guardrail checks, allowing operators to validate the AI's reasoning, debug issues, and understand recommendation context.

---

## Components

### DecisionTraces (Main Component)

**Purpose:** Displays the complete decision pipeline for a recommendation.

**Props:**

```typescript
interface Props {
  recommendationId: string; // ID of recommendation to show trace for
}
```

**Usage:**

```tsx
import { DecisionTraces } from "@/components/DecisionTraces";

<DecisionTraces recommendationId="rec_001" />;
```

**States:**

- **Loading:** Shows spinner with "Loading trace..." message
- **Error:** Displays "Failed to load decision trace" in red
- **Empty:** Shows "No trace available" when no data
- **Success:** Renders all 6 pipeline steps with timeline

---

### TraceStep

**Purpose:** Individual step in the decision pipeline with expand/collapse functionality.

**Props:**

```typescript
interface Props {
  title: string; // Step name
  timestamp: string; // ISO timestamp
  status: "completed" | "warning" | "error"; // Step status
  data: any; // Step-specific data
}
```

**Features:**

- Status icons (✓ completed, ⚠️ warning, ✗ error)
- Color-coded backgrounds (green/yellow/red)
- Custom summary rendering per step type
- Expandable detailed view
- Accessibility support (ARIA labels, keyboard navigation)

---

### Enhancement Components

#### SignalStrengthIndicator

Visual progress bar for match strength or relevance scores.

```tsx
<SignalStrengthIndicator
  strength={0.85} // 0-1 range
  label="Match Strength"
/>
```

**Color Thresholds:**

- ≥ 70%: Green (strong match)
- ≥ 40%: Yellow (moderate match)
- < 40%: Red (weak match)

#### CriteriaMetList

Displays checkmarked list of criteria met.

```tsx
<CriteriaMetList
  criteria={["credit_utilization > 70%", "any_interest_charges = true"]}
/>
```

#### ContentMatchCard

Card display for matched content items.

```tsx
<ContentMatchCard
  match={{
    content_id: "article_cu101",
    title: "Understanding Credit Utilization",
    relevance_score: 0.94,
    match_reason: "high_credit_utilization",
  }}
/>
```

#### TraceTimeline

Optional timeline visualization showing processing duration.

```tsx
<TraceTimeline
  events={[
    { step: "Signals Detected", timestamp: "2025-11-04T09:29:45Z" },
    { step: "Persona Assigned", timestamp: "2025-11-04T09:29:48Z" },
    // ... more events
  ]}
/>
```

---

## Pipeline Steps

### 1. Signals Detected

**Shows:** All detected signal categories (credit, subscriptions, savings, income)

**Summary:** "X signal categories detected"

**Detailed View:** JSON of all signal data

### 2. Persona Assigned

**Shows:** Primary persona, match strength, criteria met

**Summary:** "persona_name (X% match)"

**Detailed View:**

- Persona name
- Match strength indicator (progress bar)
- Checkmarked criteria list

### 3. Content Matched

**Shows:** Matched content items with relevance scores

**Summary:** "X content items matched"

**Detailed View:**

- Content match cards (first 3)
- Relevance indicators
- "+X more items" if > 3 matches

### 4. Rationale Generated

**Shows:** LLM-generated rationale and metadata

**Summary:** "Generated using model_name (X tokens)"

**Detailed View:**

- Full rationale text
- Model name, temperature, token count

### 5. Guardrail Checks

**Shows:** Pass/fail status for each guardrail

**Summary:** "X/Y checks passed"

**Detailed View:**

- Checkmarks/X marks for each check
- tone_check, advice_check, eligibility_check

**Status:** Warning (⚠️) if any check fails

### 6. Recommendation Created

**Shows:** Final recommendation metadata

**Summary:** None (basic info)

**Detailed View:**

- Recommendation ID
- Priority level
- Content type

---

## API Integration

### Endpoint: GET /api/operator/recommendations/{id}/trace

**Response Type:** `DecisionTrace`

```typescript
interface DecisionTrace {
  recommendation_id: string;
  signals_detected_at: string;
  persona_assigned_at: string;
  content_matched_at: string;
  rationale_generated_at: string;
  guardrails_checked_at: string;
  created_at: string;

  signals: {
    credit: CreditSignals;
    subscriptions: SubscriptionSignals;
    savings: SavingsSignals;
    income: IncomeSignals;
  };

  persona_assignment: {
    primary_persona: string;
    primary_match_strength: number;
    criteria_met: string[];
  };

  content_matches: ContentMatch[];
  relevance_scores: number[];

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
```

---

## Custom Hook: useDecisionTrace

```typescript
import { useDecisionTrace } from "@/hooks/useDecisionTrace";

const { data, error, isLoading, mutate } = useDecisionTrace(recommendationId);
```

**Features:**

- SWR caching (traces don't change after creation)
- Automatic error handling
- No revalidation on focus
- Manual refresh via mutate()

---

## Integration with Review Queue

Decision Traces are automatically integrated into `RecommendationCard`:

```tsx
// Already integrated - no additional work needed
<Button onClick={() => setShowTraces(!showTraces)}>
  {showTraces ? "Hide" : "Show"} Traces
</Button>;

{
  showTraces && <DecisionTraces recommendationId={recommendation.id} />;
}
```

---

## Performance Optimizations

1. **React.memo:** TraceStep component memoized to prevent unnecessary re-renders
2. **Lazy Details:** Detailed views only render when expanded
3. **SWR Caching:** Traces cached and not refetched
4. **Limited Display:** Content matches limited to first 3 by default

---

## Accessibility Features

- **ARIA Labels:** All interactive elements labeled
- **ARIA Expanded:** Collapse state announced
- **ARIA Live Regions:** Loading/error states announced to screen readers
- **Keyboard Navigation:** Full keyboard support for expand/collapse
- **Focus Indicators:** Visible focus rings on buttons
- **Role Attributes:** Proper semantic roles (region, status, alert)

---

## Edge Cases Handled

- Missing timestamps: Graceful fallback
- Missing signal data: Shows "0 signal categories"
- No persona assigned: Shows "No persona assigned"
- No content matches: Shows "No content matches found"
- Missing rationale: Shows "No rationale provided"
- Missing LLM metadata: Shows "N/A"
- Null/undefined data: Shows "No data available"

---

## Testing

### Manual Testing Checklist

- [ ] Trace loads successfully
- [ ] All 6 steps display in order
- [ ] Timestamps formatted correctly
- [ ] Status icons match step status
- [ ] Expand/collapse works on all steps
- [ ] Detailed views render correctly
- [ ] Signal strength indicators show
- [ ] Content match cards display
- [ ] Guardrail checks show pass/fail
- [ ] Loading spinner shows
- [ ] Error message displays on failure
- [ ] Timeline line connects steps

### Test with Different Recommendations

- `rec_001`: High utilization (all guardrails pass)
- `rec_002`: Subscription heavy (all guardrails pass)
- `rec_003`: Savings builder (all guardrails pass)
- `rec_006`: Partner offer (eligibility fails - warning status)

---

## Troubleshooting

### Trace Not Loading

**Check:**

- Is `USE_MOCK_DATA=true` in environment?
- Does recommendation ID exist in mockData?
- Check browser console for errors
- Verify API endpoint format

### Steps Not Rendering

**Check:**

- Verify trace data structure matches DecisionTrace type
- Check for missing timestamps
- Inspect data object in console

### Expand/Collapse Not Working

**Check:**

- useState hook initialized
- Button onClick handler present
- Check browser console for errors

---

## Future Enhancements

- [ ] Trace comparison (side-by-side)
- [ ] Trace search functionality
- [ ] Performance metrics per step
- [ ] Copy/export trace data
- [ ] Trace annotations (operator notes)
- [ ] A/B testing visualization
- [ ] Alternative personas explored
- [ ] Content ranking details
- [ ] Prompt engineering insights
- [ ] Cost tracking (LLM tokens)

---

## Related Components

- **RecommendationCard:** Hosts the Show/Hide Traces button
- **ReviewQueue:** Contains multiple recommendation cards
- **Spinner:** Used in loading state
- **Badge:** Used in various UI elements

---

## Resources

- [SWR Documentation](https://swr.vercel.app/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [ARIA Best Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Tailwind CSS Utilities](https://tailwindcss.com/docs/)

---

**Last Updated:** November 4, 2025  
**Version:** 1.0  
**Maintainer:** SpendSense Team
