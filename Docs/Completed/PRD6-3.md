# SHARD 3: Review Queue System

**Project:** SpendSense Operator Dashboard  
**Purpose:** Main workflow for reviewing and acting on AI-generated recommendations  
**Phase:** Core Feature Implementation  
**Estimated Size:** ~25% of total implementation  
**Dependencies:** Shard 1 (Foundation), Shard 2 (UI Framework)

---

## Overview

The Review Queue is the primary interface where operators review pending AI-generated recommendations. This system includes filtering, bulk actions, individual recommendation review, and all operator actions (approve, reject, modify, flag).

---

## Review Queue Component

Create `/components/ReviewQueue/ReviewQueue.tsx`:

```tsx
import React, { useState } from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { RecommendationCard } from "./RecommendationCard";
import { FilterPanel } from "./FilterPanel";
import { BulkActions } from "./BulkActions";
import { EmptyState } from "@/components/Common/EmptyState";
import { Spinner } from "@/components/Common/Spinner";

export function ReviewQueue() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    persona: "all",
    priority: "all",
    status: "pending",
  });

  const {
    data: recommendations,
    isLoading,
    error,
    mutate,
  } = useRecommendations(filters);

  const handleSelectAll = () => {
    if (selectedIds.length === recommendations?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(recommendations?.map((r) => r.id) || []);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    try {
      await bulkApproveRecommendations({
        recommendation_ids: selectedIds,
        notes: "",
      });
      setSelectedIds([]);
      mutate(); // Refresh the list
    } catch (error) {
      console.error("Bulk approve failed:", error);
      // Show error toast
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Failed to load recommendations. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Review Queue</h2>

        <div className="text-sm text-gray-600">
          {recommendations?.length || 0} pending recommendation
          {recommendations?.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Filters */}
      <FilterPanel filters={filters} onFiltersChange={setFilters} />

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <BulkActions
          selectedCount={selectedIds.length}
          selectedIds={selectedIds}
          onClearSelection={() => setSelectedIds([])}
          onBulkApprove={handleBulkApprove}
        />
      )}

      {/* Select All Checkbox */}
      {recommendations && recommendations.length > 0 && (
        <div className="flex items-center gap-2 py-2 px-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="select-all"
            checked={selectedIds.length === recommendations.length}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="select-all"
            className="text-sm text-gray-700 cursor-pointer"
          >
            Select all ({recommendations.length})
          </label>
        </div>
      )}

      {/* Recommendation Cards */}
      <div className="space-y-4">
        {recommendations?.length === 0 ? (
          <EmptyState
            title="No pending recommendations"
            description="Great work! The queue is empty."
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            }
          />
        ) : (
          recommendations?.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              isSelected={selectedIds.includes(recommendation.id)}
              onToggleSelect={() => handleToggleSelect(recommendation.id)}
              onAction={mutate}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Recommendation Card Component

Create `/components/ReviewQueue/RecommendationCard.tsx`:

```tsx
import React, { useState } from "react";
import { Badge } from "@/components/Common/Badge";
import { Button } from "@/components/Common/Button";
import { DecisionTraces } from "@/components/DecisionTraces/DecisionTraces";
import {
  approveRecommendation,
  rejectRecommendation,
  modifyRecommendation,
  flagRecommendation,
} from "@/lib/api";
import {
  getPriorityColor,
  getPersonaColor,
  formatPersonaName,
} from "@/lib/utils";
import type { Recommendation } from "@/lib/types";

interface Props {
  recommendation: Recommendation;
  isSelected: boolean;
  onToggleSelect: () => void;
  onAction: () => void;
}

export function RecommendationCard({
  recommendation,
  isSelected,
  onToggleSelect,
  onAction,
}: Props) {
  const [showTraces, setShowTraces] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [modifiedRationale, setModifiedRationale] = useState(
    recommendation.rationale
  );
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveRecommendation(recommendation.id, { notes: "" });
      onAction(); // Refresh the list
    } catch (error) {
      console.error("Failed to approve:", error);
      alert("Failed to approve recommendation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Reason for rejection (required):");
    if (!reason) return;

    setActionLoading(true);
    try {
      await rejectRecommendation(recommendation.id, { reason });
      onAction();
    } catch (error) {
      console.error("Failed to reject:", error);
      alert("Failed to reject recommendation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveModification = async () => {
    setActionLoading(true);
    try {
      await modifyRecommendation(recommendation.id, {
        rationale: modifiedRationale,
      });
      setIsModifying(false);
      onAction();
    } catch (error) {
      console.error("Failed to modify:", error);
      alert("Failed to save modifications");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async () => {
    const reason = prompt("Reason for flagging (required):");
    if (!reason) return;

    setActionLoading(true);
    try {
      await flagRecommendation(recommendation.id, { reason });
      onAction();
    } catch (error) {
      console.error("Failed to flag:", error);
      alert("Failed to flag recommendation");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 ${
        isSelected ? "border-indigo-500" : "border-gray-200"
      } overflow-hidden transition-colors`}
    >
      {/* Card Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              aria-label={`Select recommendation ${recommendation.id}`}
            />

            {/* Priority Badge */}
            <Badge className={getPriorityColor(recommendation.priority)}>
              {recommendation.priority.toUpperCase()}
            </Badge>

            {/* Persona Badge */}
            <Badge className={getPersonaColor(recommendation.persona_primary)}>
              {formatPersonaName(recommendation.persona_primary)}
            </Badge>

            {/* Content Type */}
            <Badge className="bg-blue-100 text-blue-800">
              {recommendation.type}
            </Badge>

            {/* Read Time */}
            {recommendation.read_time_minutes && (
              <span className="text-sm text-gray-500">
                ⏱ {recommendation.read_time_minutes} min
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              User: {recommendation.user_id}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTraces(!showTraces)}
            >
              {showTraces ? "Hide" : "Show"} Traces
            </Button>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900">
          {recommendation.title}
        </h3>

        {/* Content URL */}
        {recommendation.content_url && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Content: </span>
            <a
              href={recommendation.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              {recommendation.content_url}
            </a>
          </div>
        )}

        {/* Rationale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Rationale
            </label>
            {!isModifying && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModifying(true)}
              >
                Modify
              </Button>
            )}
          </div>

          {isModifying ? (
            <textarea
              value={modifiedRationale}
              onChange={(e) => setModifiedRationale(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
            />
          ) : (
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              {recommendation.rationale}
            </p>
          )}
        </div>

        {/* Guardrails Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Guardrail Checks
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {recommendation.guardrails_passed.tone_check ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-red-600">✗</span>
              )}
              <span className="text-sm text-gray-600">Tone Check</span>
            </div>

            <div className="flex items-center gap-2">
              {recommendation.guardrails_passed.advice_check ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-red-600">✗</span>
              )}
              <span className="text-sm text-gray-600">Advice Check</span>
            </div>

            <div className="flex items-center gap-2">
              {recommendation.guardrails_passed.eligibility_check ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-red-600">✗</span>
              )}
              <span className="text-sm text-gray-600">Eligibility</span>
            </div>
          </div>
        </div>

        {/* Decision Traces (Expandable) */}
        {showTraces && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <DecisionTraces recommendationId={recommendation.id} />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          {isModifying ? (
            <>
              <Button
                onClick={handleSaveModification}
                disabled={actionLoading}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Changes
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsModifying(false);
                  setModifiedRationale(recommendation.rationale);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                ✓ Approve
              </Button>
              <Button
                onClick={handleReject}
                disabled={actionLoading}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                ✗ Reject
              </Button>
              <Button
                variant="ghost"
                onClick={handleFlag}
                disabled={actionLoading}
              >
                🚩 Flag
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Filter Panel Component

Create `/components/ReviewQueue/FilterPanel.tsx`:

```tsx
import React from "react";

interface Filters {
  persona: string;
  priority: string;
  status: string;
}

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FilterPanel({ filters, onFiltersChange }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Persona Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Persona
          </label>
          <select
            value={filters.persona}
            onChange={(e) =>
              onFiltersChange({ ...filters, persona: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Personas</option>
            <option value="high_utilization">High Utilization</option>
            <option value="variable_income_budgeter">Variable Income</option>
            <option value="student">Student</option>
            <option value="subscription_heavy">Subscription-Heavy</option>
            <option value="savings_builder">Savings Builder</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) =>
              onFiltersChange({ ...filters, priority: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

---

## Bulk Actions Component

Create `/components/ReviewQueue/BulkActions.tsx`:

```tsx
import React, { useState } from "react";
import { Button } from "@/components/Common/Button";
import { Modal } from "@/components/Common/Modal";

interface Props {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onBulkApprove: () => Promise<void>;
}

export function BulkActions({
  selectedCount,
  selectedIds,
  onClearSelection,
  onBulkApprove,
}: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkApprove = async () => {
    setIsProcessing(true);
    try {
      await onBulkApprove();
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Bulk approve failed:", error);
      alert("Bulk approve failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-indigo-900">
              {selectedCount} recommendation{selectedCount !== 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowConfirmModal(true)}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Bulk Approve ({selectedCount})
            </Button>
            <Button variant="ghost" onClick={onClearSelection}>
              Clear Selection
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Bulk Approval"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to approve <strong>{selectedCount}</strong>{" "}
            recommendation{selectedCount !== 1 ? "s" : ""}?
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ This action will immediately send these recommendations to
              users. Please ensure you've reviewed all selected items.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowConfirmModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkApprove}
              disabled={isProcessing}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isProcessing
                ? "Processing..."
                : `Approve ${selectedCount} Item${
                    selectedCount !== 1 ? "s" : ""
                  }`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
```

---

## Custom Hook for Recommendations

Create `/hooks/useRecommendations.ts`:

```typescript
import useSWR from "swr";
import { fetchRecommendations } from "@/lib/api";
import type { Recommendation } from "@/lib/types";

interface Filters {
  status?: string;
  persona?: string;
  priority?: string;
}

export function useRecommendations(filters: Filters) {
  const { data, error, isLoading, mutate } = useSWR<Recommendation[]>(
    ["/api/operator/recommendations", filters],
    () => fetchRecommendations(filters),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
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

## Keyboard Shortcuts Hook

Create `/hooks/useKeyboardShortcuts.ts`:

```typescript
import { useEffect } from "react";

interface KeyboardShortcuts {
  onApprove?: () => void;
  onReject?: () => void;
  onFlag?: () => void;
  onModify?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onToggleSelection?: () => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const { key, metaKey, ctrlKey } = event;

      // Single key shortcuts
      switch (key.toLowerCase()) {
        case "a":
          if (!metaKey && !ctrlKey) {
            event.preventDefault();
            shortcuts.onApprove?.();
          }
          break;
        case "r":
          event.preventDefault();
          shortcuts.onReject?.();
          break;
        case "f":
          event.preventDefault();
          shortcuts.onFlag?.();
          break;
        case "m":
          event.preventDefault();
          shortcuts.onModify?.();
          break;
        case "arrowdown":
          event.preventDefault();
          shortcuts.onNext?.();
          break;
        case "arrowup":
          event.preventDefault();
          shortcuts.onPrevious?.();
          break;
        case " ":
          event.preventDefault();
          shortcuts.onToggleSelection?.();
          break;
        case "escape":
          event.preventDefault();
          shortcuts.onClearSelection?.();
          break;
      }

      // Cmd/Ctrl + A for select all
      if ((metaKey || ctrlKey) && key === "a") {
        event.preventDefault();
        shortcuts.onSelectAll?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts]);
}
```

---

## API Endpoint Requirements

### GET /api/operator/recommendations

**Query Parameters:**

- `status` (optional): pending | approved | rejected | flagged
- `persona` (optional): persona type or "all"
- `priority` (optional): high | medium | low | "all"

**Response:**

```json
[
  {
    "id": "rec_123",
    "user_id": "user_456",
    "persona_primary": "high_utilization",
    "type": "article",
    "title": "Understanding Credit Utilization",
    "rationale": "Based on your high credit utilization...",
    "priority": "high",
    "status": "pending",
    "generated_at": "2025-11-03T10:30:00Z",
    "content_url": "https://example.com/article",
    "read_time_minutes": 5,
    "guardrails_passed": {
      "tone_check": true,
      "advice_check": true,
      "eligibility_check": true
    }
  }
]
```

### POST /api/operator/recommendations/{id}/approve

**Request Body:**

```json
{
  "notes": "Looks good for this user's situation"
}
```

**Response:**

```json
{
  "status": "approved",
  "recommendation_id": "rec_123",
  "approved_by": "op_001",
  "approved_at": "2025-11-03T14:25:00Z"
}
```

### POST /api/operator/recommendations/{id}/reject

**Request Body:**

```json
{
  "reason": "Tone is too alarmist for this persona"
}
```

**Response:**

```json
{
  "status": "rejected",
  "recommendation_id": "rec_123",
  "rejected_by": "op_001",
  "reason": "Tone is too alarmist for this persona"
}
```

### PATCH /api/operator/recommendations/{id}

**Request Body:**

```json
{
  "rationale": "Modified rationale text...",
  "priority": "medium"
}
```

**Response:**

```json
{
  "status": "modified",
  "recommendation_id": "rec_123",
  "modifications": {
    "rationale": "Modified rationale text...",
    "priority": "medium"
  }
}
```

### POST /api/operator/recommendations/{id}/flag

**Request Body:**

```json
{
  "reason": "Needs senior review for compliance"
}
```

**Response:**

```json
{
  "status": "flagged",
  "recommendation_id": "rec_123",
  "flag_id": "flag_123_1730644800"
}
```

### POST /api/operator/recommendations/bulk-approve

**Request Body:**

```json
{
  "recommendation_ids": ["rec_123", "rec_124", "rec_125"],
  "notes": "Batch approved during review session"
}
```

**Response:**

```json
{
  "total": 3,
  "approved": 3,
  "failed": 0,
  "approved_ids": ["rec_123", "rec_124", "rec_125"],
  "failed_items": []
}
```

---

## Acceptance Criteria

**Must Have:**

- [ ] ReviewQueue component displays list of recommendations
- [ ] Filtering by persona, priority, and status works
- [ ] Individual recommendation cards show all required information
- [ ] Approve action marks recommendation as approved
- [ ] Reject action requires reason and marks as rejected
- [ ] Modify action allows editing rationale
- [ ] Flag action allows flagging for review
- [ ] Bulk selection works (select all, individual toggle)
- [ ] Bulk approve with confirmation modal
- [ ] Decision traces can be expanded/collapsed
- [ ] All actions trigger list refresh
- [ ] Loading states displayed during actions
- [ ] Error states handled gracefully

**Should Have:**

- [ ] Keyboard shortcuts functional
- [ ] Empty state when no recommendations
- [ ] Smooth animations/transitions
- [ ] Optimistic UI updates
- [ ] Toast notifications for success/error

---

## Testing Checklist

- [ ] Can fetch and display recommendations
- [ ] Filters update the displayed list
- [ ] Can approve individual recommendation
- [ ] Can reject with reason
- [ ] Can modify rationale and save
- [ ] Can flag recommendation
- [ ] Select all checkbox works
- [ ] Individual selection toggles work
- [ ] Bulk approve shows confirmation
- [ ] Bulk approve processes all selected items
- [ ] Clear selection works
- [ ] Decision traces toggle correctly
- [ ] All guardrail checks display properly
- [ ] Loading spinner shows during API calls
- [ ] Error messages display on failures

---

**Dependencies:** Shard 1, Shard 2  
**Blocks:** None (independent feature)  
**Estimated Time:** 6-8 hours
