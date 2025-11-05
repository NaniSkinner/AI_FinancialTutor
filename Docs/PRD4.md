# Operator Dashboard - Feature PRD

**Version:** 1.0  
**Date:** November 3, 2025  
**Feature Owner:** Bryce Harris  
**Project:** SpendSense - Explainable AI for Financial Education  
**Dependencies:** Behavioral Signals (PRD #2), Persona System (PRD #3), Recommendation Engine (PRD #4), Guardrails & Compliance (PRD #5)

---

## Executive Summary

The Operator Dashboard is a web-based oversight interface that enables compliance operators to review, approve, modify, or reject AI-generated recommendations before they reach users. This human-in-the-loop system ensures quality control, catches edge cases, and maintains brand tone while providing full auditability through decision traces.

### Core Value Proposition

Provide comprehensive oversight that:

- **Quality Assurance**: Human review before user-facing recommendations
- **Explainability**: Full decision traces showing how recommendations were generated
- **Efficiency**: Bulk approval actions with smart filtering
- **Auditability**: Complete audit trail of all operator actions
- **Debugging**: Deep-dive into user signals and persona assignments

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Success Criteria](#2-success-criteria)
3. [Technical Requirements](#3-technical-requirements)
4. [Dashboard Components](#4-dashboard-components)
5. [Review Queue](#5-review-queue)
6. [User Explorer](#6-user-explorer)
7. [Decision Traces](#7-decision-traces)
8. [Operator Actions](#8-operator-actions)
9. [Alert System](#9-alert-system)
10. [Data Schema](#10-data-schema)
11. [API Specification](#11-api-specification)
12. [Implementation Guide](#12-implementation-guide)
13. [Testing Requirements](#13-testing-requirements)
14. [Performance Requirements](#14-performance-requirements)
15. [Security & Access Control](#15-security--access-control)

---

## 1. Feature Overview

### 1.1 Problem Statement

AI-generated recommendations need human oversight to:

- Catch errors or inappropriate content before reaching users
- Ensure compliance with tone guidelines and legal disclaimers
- Handle edge cases that automation misses
- Maintain audit trails for regulatory compliance
- Debug issues in the recommendation pipeline

### 1.2 User Stories

**As a compliance operator**, I want to review pending recommendations so that I can ensure quality before they reach users.

**As a compliance operator**, I want to see why a recommendation was generated so that I can validate the AI's reasoning.

**As a compliance operator**, I want to approve multiple recommendations at once so that I can process the queue efficiently.

**As a senior operator**, I want to see flagged items requiring additional review so that I can handle escalations.

**As a product manager**, I want to see operator activity metrics so that I can optimize the review process.

### 1.3 Scope

**In Scope:**

- ✅ Review queue with pending recommendations
- ✅ User signal explorer (drill-down view)
- ✅ Decision trace viewer (full pipeline visibility)
- ✅ Approve/reject/modify actions
- ✅ Bulk approval with safety checks
- ✅ Alert panel for flagged items
- ✅ Operator audit logging
- ✅ Search and filter capabilities
- ✅ Responsive web interface (desktop-first)

**Out of Scope:**

- ❌ Mobile operator app (web only)
- ❌ Real-time collaboration (multiple operators)
- ❌ AI-assisted review suggestions
- ❌ Operator performance scoring
- ❌ Custom dashboard layouts (fixed layout)

---

## 2. Success Criteria

| Metric                    | Target                                           | Measurement               |
| ------------------------- | ------------------------------------------------ | ------------------------- |
| **Review Speed**          | Operator can review 50 recommendations/hour      | Time tracking             |
| **Accuracy**              | <1% of approved recommendations require revision | Post-approval review rate |
| **System Uptime**         | 99% availability during business hours           | Monitoring                |
| **Load Time**             | Dashboard loads in <2 seconds                    | 95th percentile           |
| **Operator Satisfaction** | ≥4.0/5.0 usability rating                        | Survey                    |

### 2.1 Acceptance Criteria

**Must Have:**

- [ ] Review queue shows all pending recommendations
- [ ] Each recommendation displays full context (signals, persona, rationale)
- [ ] Decision traces show complete pipeline steps
- [ ] Approve/reject/modify actions work correctly
- [ ] Bulk approval with confirmation dialog
- [ ] User search and filter working
- [ ] All actions logged to audit table
- [ ] Alert panel shows flagged items

**Should Have:**

- [ ] Dashboard loads in <2 seconds
- [ ] Keyboard shortcuts for common actions
- [ ] Filter by persona, priority, date range
- [ ] Export audit logs to CSV
- [ ] Undo action capability (within 5 minutes)

**Nice to Have:**

- [ ] Real-time updates (WebSocket)
- [ ] Operator notes on recommendations
- [ ] Tag system for categorizing issues
- [ ] Dashboard analytics/metrics view

---

## 3. Technical Requirements

### 3.1 Technology Stack

**Frontend:**

- **Framework**: React 18 + Next.js 14
- **State Management**: Zustand (matching Mockup Matcha Hub)
- **UI Library**: Tailwind CSS + shadcn/ui
- **Data Fetching**: SWR or React Query
- **Charts**: Recharts
- **Date Handling**: date-fns

**Backend:**

- **API**: FastAPI or Flask (REST)
- **Database**: SQLite (dev), PostgreSQL (production)
- **Authentication**: JWT tokens (simple for prototype)

### 3.2 Component Structure

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

### 3.3 Core Principles

1. **Transparency**: Show all context needed for informed decisions
2. **Efficiency**: Minimize clicks and cognitive load
3. **Safety**: Confirmations for destructive actions
4. **Auditability**: Log everything for compliance

---

## 4. Dashboard Components

### 4.1 Main Dashboard Layout

```tsx
// /ui/operator-dashboard/pages/index.tsx

import React from "react";
import { ReviewQueue } from "@/components/ReviewQueue/ReviewQueue";
import { AlertPanel } from "@/components/AlertPanel/AlertPanel";
import { StatsOverview } from "@/components/StatsOverview";

export default function OperatorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                SpendSense Operator View
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">Pending: </span>
                <span className="text-orange-600 font-bold">23</span>
              </div>

              {/* Operator Info */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  JD
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Jane Doe
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      <AlertPanel />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Stats */}
          <div className="col-span-3">
            <StatsOverview />
          </div>

          {/* Main Content - Review Queue */}
          <div className="col-span-9">
            <ReviewQueue />
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 4.2 Stats Overview Component

```tsx
// /ui/operator-dashboard/components/StatsOverview.tsx

import React from "react";
import { useOperatorStats } from "@/hooks/useOperatorStats";

export function StatsOverview() {
  const { data: stats, isLoading } = useOperatorStats();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Overview</h2>

      {/* Pending Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Pending Review</div>
        <div className="text-3xl font-bold text-orange-600 mt-1">
          {stats?.pending || 0}
        </div>
      </div>

      {/* Approved Today */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Approved Today</div>
        <div className="text-3xl font-bold text-green-600 mt-1">
          {stats?.approved_today || 0}
        </div>
      </div>

      {/* Rejected Today */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Rejected Today</div>
        <div className="text-3xl font-bold text-red-600 mt-1">
          {stats?.rejected_today || 0}
        </div>
      </div>

      {/* Flagged Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Flagged Items</div>
        <div className="text-3xl font-bold text-yellow-600 mt-1">
          {stats?.flagged || 0}
        </div>
      </div>

      {/* Average Review Time */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Avg Review Time</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">
          {stats?.avg_review_time_seconds || 0}s
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Review Queue

### 5.1 Review Queue Component

```tsx
// /ui/operator-dashboard/components/ReviewQueue/ReviewQueue.tsx

import React, { useState } from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { RecommendationCard } from "./RecommendationCard";
import { FilterPanel } from "./FilterPanel";
import { BulkActions } from "./BulkActions";

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Review Queue</h2>

        <div className="text-sm text-gray-600">
          {recommendations?.length || 0} pending recommendations
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
          onBulkApprove={async () => {
            // Handle bulk approve
            await handleBulkApprove(selectedIds);
            setSelectedIds([]);
            mutate();
          }}
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
          <label htmlFor="select-all" className="text-sm text-gray-700">
            Select all ({recommendations.length})
          </label>
        </div>
      )}

      {/* Recommendation Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading recommendations...
          </div>
        ) : recommendations?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-500">No pending recommendations</div>
            <div className="text-sm text-gray-400 mt-1">
              Great work! The queue is empty.
            </div>
          </div>
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

async function handleBulkApprove(ids: string[]) {
  // Implementation in API section
}
```

### 5.2 Recommendation Card Component

```tsx
// /ui/operator-dashboard/components/ReviewQueue/RecommendationCard.tsx

import React, { useState } from "react";
import { Badge } from "@/components/Common/Badge";
import { Button } from "@/components/Common/Button";
import { DecisionTraces } from "@/components/DecisionTraces/DecisionTraces";
import {
  approveRecommendation,
  rejectRecommendation,
  modifyRecommendation,
} from "@/lib/api";

interface Recommendation {
  id: string;
  user_id: string;
  persona_primary: string;
  type: string;
  title: string;
  rationale: string;
  priority: string;
  generated_at: string;
  content_url?: string;
  read_time_minutes?: number;
  guardrails_passed: {
    tone_check: boolean;
    advice_check: boolean;
    eligibility_check: boolean;
  };
}

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

  const getPriorityColor = (priority: string) => {
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
  };

  const getPersonaColor = (persona: string) => {
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
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveRecommendation(recommendation.id, { notes: "" });
      onAction();
    } catch (error) {
      console.error("Failed to approve:", error);
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
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 ${
        isSelected ? "border-indigo-500" : "border-gray-200"
      } overflow-hidden`}
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
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />

            {/* Priority Badge */}
            <Badge className={getPriorityColor(recommendation.priority)}>
              {recommendation.priority.toUpperCase()}
            </Badge>

            {/* Persona Badge */}
            <Badge className={getPersonaColor(recommendation.persona_primary)}>
              {recommendation.persona_primary.replace(/_/g, " ").toUpperCase()}
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
                onClick={() => {
                  /* Flag for senior review */
                }}
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

### 5.3 Filter Panel Component

```tsx
// /ui/operator-dashboard/components/ReviewQueue/FilterPanel.tsx

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

### 5.4 Bulk Actions Component

```tsx
// /ui/operator-dashboard/components/ReviewQueue/BulkActions.tsx

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
            recommendations?
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
                : `Approve ${selectedCount} Items`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
```

---

## 6. User Explorer

### 6.1 User Explorer Component

```tsx
// /ui/operator-dashboard/components/UserExplorer/UserExplorer.tsx

import React, { useState } from "react";
import { UserSearch } from "./UserSearch";
import { SignalCard } from "./SignalCard";
import { PersonaTimeline } from "./PersonaTimeline";
import { useUserSignals } from "@/hooks/useUserSignals";

export function UserExplorer() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: userData, isLoading } = useUserSignals(selectedUserId);

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
            <div className="text-center py-8 text-gray-500">
              Loading user data...
            </div>
          ) : userData ? (
            <>
              {/* User Info Header */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {userData.user_id}
                </h3>
                <div className="mt-2 flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Primary Persona: </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {userData.persona_30d.primary}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Window: </span>
                    30 days
                  </div>
                </div>
              </div>

              {/* Signals Grid */}
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

### 6.2 Signal Card Component

```tsx
// /ui/operator-dashboard/components/UserExplorer/SignalCard.tsx

import React from "react";

interface Props {
  title: string;
  data: any;
  type: "credit" | "subscriptions" | "savings" | "income";
}

export function SignalCard({ title, data, type }: Props) {
  const renderContent = () => {
    switch (type) {
      case "credit":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Aggregate Utilization
              </span>
              <span
                className={`text-sm font-semibold ${
                  data.aggregate_utilization_pct >= 50
                    ? "text-red-600"
                    : data.aggregate_utilization_pct >= 30
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {data.aggregate_utilization_pct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Credit Used</span>
              <span className="text-sm font-semibold text-gray-900">
                ${data.total_credit_used.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Total Credit Available
              </span>
              <span className="text-sm font-semibold text-gray-900">
                ${data.total_credit_available.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Interest Charges</span>
              <span
                className={`text-sm font-semibold ${
                  data.any_interest_charges ? "text-red-600" : "text-green-600"
                }`}
              >
                {data.any_interest_charges ? "Yes" : "None"}
              </span>
            </div>
          </div>
        );

      case "subscriptions":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Recurring Merchants</span>
              <span className="text-sm font-semibold text-gray-900">
                {data.recurring_merchant_count}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Spend</span>
              <span className="text-sm font-semibold text-gray-900">
                ${data.monthly_recurring_spend}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">% of Total Spend</span>
              <span className="text-sm font-semibold text-gray-900">
                {data.subscription_share_pct}%
              </span>
            </div>
            {data.merchants?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">
                  Top Subscriptions:
                </div>
                {data.merchants.slice(0, 3).map((m: any, i: number) => (
                  <div key={i} className="text-xs text-gray-600">
                    • {m.name}: ${m.amount}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "savings":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Balance</span>
              <span className="text-sm font-semibold text-gray-900">
                ${data.total_savings_balance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Growth Rate</span>
              <span
                className={`text-sm font-semibold ${
                  data.savings_growth_rate_pct > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {data.savings_growth_rate_pct > 0 ? "+" : ""}
                {data.savings_growth_rate_pct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Inflow</span>
              <span className="text-sm font-semibold text-gray-900">
                ${data.net_savings_inflow}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Emergency Fund</span>
              <span className="text-sm font-semibold text-gray-900">
                {data.emergency_fund_months.toFixed(1)} months
              </span>
            </div>
          </div>
        );

      case "income":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Income Type</span>
              <span className="text-sm font-semibold text-gray-900 capitalize">
                {data.income_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment Frequency</span>
              <span className="text-sm font-semibold text-gray-900 capitalize">
                {data.payment_frequency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Median Pay Gap</span>
              <span className="text-sm font-semibold text-gray-900">
                {data.median_pay_gap_days} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Income Variability</span>
              <span
                className={`text-sm font-semibold ${
                  data.income_variability_pct > 20
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {data.income_variability_pct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cash Flow Buffer</span>
              <span
                className={`text-sm font-semibold ${
                  data.cash_flow_buffer_months < 1
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {data.cash_flow_buffer_months.toFixed(1)} months
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

## 7. Decision Traces

### 7.1 Decision Traces Component

```tsx
// /ui/operator-dashboard/components/DecisionTraces/DecisionTraces.tsx

import React from "react";
import { useDecisionTrace } from "@/hooks/useDecisionTrace";
import { TraceStep } from "./TraceStep";

interface Props {
  recommendationId: string;
}

export function DecisionTraces({ recommendationId }: Props) {
  const { data: trace, isLoading } = useDecisionTrace(recommendationId);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading trace...</div>;
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

### 7.2 Trace Step Component

```tsx
// /ui/operator-dashboard/components/DecisionTraces/TraceStep.tsx

import React, { useState } from "react";

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
        return <span className="text-green-600">✓</span>;
      case "warning":
        return <span className="text-yellow-600">⚠</span>;
      case "error":
        return <span className="text-red-600">✗</span>;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-100 border-green-300";
      case "warning":
        return "bg-yellow-100 border-yellow-300";
      case "error":
        return "bg-red-100 border-red-300";
    }
  };

  return (
    <div className="relative pl-12">
      {/* Status Icon */}
      <div className="absolute left-0 top-0 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
        {getStatusIcon()}
      </div>

      {/* Content */}
      <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-2">
          <h5 className="font-medium text-gray-900">{title}</h5>
          <span className="text-xs text-gray-600">
            {new Date(timestamp).toLocaleString()}
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          {expanded ? "Hide" : "Show"} Details
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-2 rounded">
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

## 8. Operator Actions

### 8.1 Backend API for Operator Actions

```python
# /api/operator_actions.py

from datetime import datetime
from typing import Dict, List, Optional
import json

class OperatorActions:
    def __init__(self, db_connection):
        self.db = db_connection

    def approve_recommendation(self, operator_id: str, recommendation_id: str,
                              notes: str = "") -> Dict:
        """
        Approve recommendation for sending to user

        Steps:
        1. Verify operator has permission
        2. Mark recommendation as approved
        3. Log operator action
        4. Queue for user delivery
        """
        # Update recommendation status
        query = """
            UPDATE recommendations
            SET status = 'approved',
                approved_by = ?,
                approved_at = ?,
                operator_notes = ?
            WHERE recommendation_id = ?
        """

        self.db.execute(query, (
            operator_id,
            datetime.now(),
            notes,
            recommendation_id
        ))

        # Log action
        self._log_operator_action(
            operator_id,
            'approve',
            recommendation_id,
            {'notes': notes}
        )

        # Queue for delivery (would integrate with email/notification system)
        self._queue_for_delivery(recommendation_id)

        self.db.commit()

        return {
            'status': 'approved',
            'recommendation_id': recommendation_id,
            'approved_by': operator_id,
            'approved_at': datetime.now().isoformat()
        }

    def reject_recommendation(self, operator_id: str, recommendation_id: str,
                             reason: str) -> Dict:
        """
        Reject recommendation (will not be sent to user)
        """
        query = """
            UPDATE recommendations
            SET status = 'rejected',
                approved_by = ?,
                approved_at = ?,
                operator_notes = ?
            WHERE recommendation_id = ?
        """

        self.db.execute(query, (
            operator_id,
            datetime.now(),
            reason,
            recommendation_id
        ))

        self._log_operator_action(
            operator_id,
            'reject',
            recommendation_id,
            {'reason': reason}
        )

        self.db.commit()

        return {
            'status': 'rejected',
            'recommendation_id': recommendation_id,
            'rejected_by': operator_id,
            'reason': reason
        }

    def modify_recommendation(self, operator_id: str, recommendation_id: str,
                             modifications: Dict) -> Dict:
        """
        Modify rationale, priority, or other fields before approval
        """
        allowed_fields = ['rationale', 'priority', 'title']

        for field, new_value in modifications.items():
            if field not in allowed_fields:
                continue

            query = f"""
                UPDATE recommendations
                SET {field} = ?,
                    modified_by = ?,
                    modified_at = ?
                WHERE recommendation_id = ?
            """

            self.db.execute(query, (
                new_value,
                operator_id,
                datetime.now(),
                recommendation_id
            ))

        self._log_operator_action(
            operator_id,
            'modify',
            recommendation_id,
            {'modifications': modifications}
        )

        self.db.commit()

        return {
            'status': 'modified',
            'recommendation_id': recommendation_id,
            'modifications': modifications
        }

    def flag_for_review(self, operator_id: str, recommendation_id: str,
                       flag_reason: str) -> Dict:
        """
        Flag recommendation for senior operator or additional review
        """
        query = """
            INSERT INTO recommendation_flags
            (flag_id, recommendation_id, flagged_by, flag_reason, flagged_at)
            VALUES (?, ?, ?, ?, ?)
        """

        flag_id = f"flag_{recommendation_id}_{int(datetime.now().timestamp())}"

        self.db.execute(query, (
            flag_id,
            recommendation_id,
            operator_id,
            flag_reason,
            datetime.now()
        ))

        self._log_operator_action(
            operator_id,
            'flag',
            recommendation_id,
            {'flag_reason': flag_reason}
        )

        self.db.commit()

        return {
            'status': 'flagged',
            'recommendation_id': recommendation_id,
            'flag_id': flag_id
        }

    def bulk_approve(self, operator_id: str, recommendation_ids: List[str],
                    notes: str = "") -> Dict:
        """
        Approve multiple recommendations at once

        Safety checks:
        - Verify all recommendations are in 'pending' status
        - Verify all passed guardrail checks
        - Log each approval individually
        """
        approved = []
        failed = []

        for rec_id in recommendation_ids:
            try:
                # Verify recommendation is approvable
                if not self._can_approve(rec_id):
                    failed.append({
                        'recommendation_id': rec_id,
                        'reason': 'Not in approvable state'
                    })
                    continue

                # Approve
                self.approve_recommendation(operator_id, rec_id, notes)
                approved.append(rec_id)

            except Exception as e:
                failed.append({
                    'recommendation_id': rec_id,
                    'reason': str(e)
                })

        return {
            'total': len(recommendation_ids),
            'approved': len(approved),
            'failed': len(failed),
            'approved_ids': approved,
            'failed_items': failed
        }

    def _can_approve(self, recommendation_id: str) -> bool:
        """Check if recommendation can be approved"""
        query = """
            SELECT status, guardrails_passed
            FROM recommendations
            WHERE recommendation_id = ?
        """

        cursor = self.db.execute(query, (recommendation_id,))
        row = cursor.fetchone()

        if not row:
            return False

        status, guardrails = row

        # Must be pending and pass all guardrails
        return status == 'pending' and guardrails

    def _log_operator_action(self, operator_id: str, action: str,
                            recommendation_id: str, metadata: Dict):
        """Log operator action to audit table"""
        audit_id = f"audit_{operator_id}_{int(datetime.now().timestamp())}"

        query = """
            INSERT INTO operator_audit_log
            (audit_id, operator_id, action, recommendation_id, metadata, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """

        self.db.execute(query, (
            audit_id,
            operator_id,
            action,
            recommendation_id,
            json.dumps(metadata),
            datetime.now()
        ))

    def _queue_for_delivery(self, recommendation_id: str):
        """Queue recommendation for delivery to user"""
        # This would integrate with email/notification system
        # For now, just update status
        query = """
            UPDATE recommendations
            SET status = 'queued_for_delivery'
            WHERE recommendation_id = ?
        """

        self.db.execute(query, (recommendation_id,))

    def get_operator_stats(self, operator_id: str) -> Dict:
        """Get operator activity statistics"""
        # Pending count
        pending_query = """
            SELECT COUNT(*) FROM recommendations
            WHERE status = 'pending'
        """

        # Approved today
        approved_today_query = """
            SELECT COUNT(*) FROM operator_audit_log
            WHERE operator_id = ?
              AND action = 'approve'
              AND DATE(timestamp) = DATE('now')
        """

        # Rejected today
        rejected_today_query = """
            SELECT COUNT(*) FROM operator_audit_log
            WHERE operator_id = ?
              AND action = 'reject'
              AND DATE(timestamp) = DATE('now')
        """

        # Flagged items
        flagged_query = """
            SELECT COUNT(*) FROM recommendation_flags
            WHERE flagged_by = ?
              AND resolved = 0
        """

        pending = self.db.execute(pending_query).fetchone()[0]
        approved_today = self.db.execute(approved_today_query, (operator_id,)).fetchone()[0]
        rejected_today = self.db.execute(rejected_today_query, (operator_id,)).fetchone()[0]
        flagged = self.db.execute(flagged_query, (operator_id,)).fetchone()[0]

        return {
            'pending': pending,
            'approved_today': approved_today,
            'rejected_today': rejected_today,
            'flagged': flagged,
            'avg_review_time_seconds': 0  # Would calculate from timing data
        }
```

---

## 9. Alert System

### 9.1 Alert Panel Component

```tsx
// /ui/operator-dashboard/components/AlertPanel/AlertPanel.tsx

import React from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertItem } from "./AlertItem";

export function AlertPanel() {
  const { data: alerts } = useAlerts();

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <span className="text-yellow-600 text-xl">⚠️</span>
          </div>

          <div className="flex-1 space-y-2">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 9.2 Alert Types

```typescript
// Alert categories
type AlertType =
  | "high_rejection_rate" // >20% rejection rate today
  | "long_queue" // >50 pending recommendations
  | "guardrail_failures" // Multiple guardrail failures detected
  | "llm_errors" // LLM API errors
  | "flagged_item" // Item flagged by another operator
  | "unusual_pattern"; // Unusual user behavior detected

interface Alert {
  id: string;
  type: AlertType;
  severity: "low" | "medium" | "high";
  message: string;
  count?: number;
  actionUrl?: string;
  createdAt: string;
}
```

---

## 10. Data Schema

### 10.1 Operator Audit Log Table

```sql
CREATE TABLE operator_audit_log (
    audit_id TEXT PRIMARY KEY,
    operator_id TEXT NOT NULL,
    action TEXT NOT NULL,              -- 'approve', 'reject', 'modify', 'flag'
    recommendation_id TEXT NOT NULL,
    metadata JSON,                     -- Additional context
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

-- Indexes
CREATE INDEX idx_audit_operator ON operator_audit_log(operator_id);
CREATE INDEX idx_audit_action ON operator_audit_log(action);
CREATE INDEX idx_audit_timestamp ON operator_audit_log(timestamp);
CREATE INDEX idx_audit_recommendation ON operator_audit_log(recommendation_id);
```

### 10.2 Recommendation Flags Table

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
```

---

## 11. API Specification

### 11.1 REST API Endpoints

```yaml
# Get pending recommendations
GET /api/operator/recommendations?status=pending&persona=all&priority=all

# Get operator stats
GET /api/operator/stats

# Approve recommendation
POST /api/operator/recommendations/{id}/approve
Body: { "notes": "Looks good" }

# Reject recommendation
POST /api/operator/recommendations/{id}/reject
Body: { "reason": "Tone issues" }

# Modify recommendation
PATCH /api/operator/recommendations/{id}
Body: { "rationale": "Modified text..." }

# Flag recommendation
POST /api/operator/recommendations/{id}/flag
Body: { "reason": "Need senior review" }

# Bulk approve
POST /api/operator/recommendations/bulk-approve
Body: { "recommendation_ids": ["rec_1", "rec_2"], "notes": "" }

# Get user signals
GET /api/operator/users/{user_id}/signals?window_type=30d

# Get decision trace
GET /api/operator/recommendations/{id}/trace

# Get audit logs
GET /api/operator/audit-logs?operator_id=op_123&start_date=2025-11-01

# Get alerts
GET /api/operator/alerts
```

---

## 12. Implementation Guide

### 12.1 Project Setup

```bash
# Initialize Next.js project
npx create-next-app@latest operator-dashboard --typescript --tailwind --app

# Install dependencies
cd operator-dashboard
npm install zustand swr recharts date-fns clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-select

# Install dev dependencies
npm install -D @types/node @types/react
```

### 12.2 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPERATOR_ID=op_001
```

### 12.3 API Client Setup

```typescript
// /lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchRecommendations(filters: any) {
  const params = new URLSearchParams(filters);
  const response = await fetch(
    `${API_URL}/api/operator/recommendations?${params}`
  );
  return response.json();
}

export async function approveRecommendation(
  id: string,
  data: { notes: string }
) {
  const response = await fetch(
    `${API_URL}/api/operator/recommendations/${id}/approve`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  return response.json();
}

// ... other API functions
```

---

## 13. Testing Requirements

### 13.1 Component Tests

```typescript
// /tests/ReviewQueue.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import { ReviewQueue } from "@/components/ReviewQueue/ReviewQueue";

describe("ReviewQueue", () => {
  it("renders pending recommendations", async () => {
    render(<ReviewQueue />);

    expect(await screen.findByText("Review Queue")).toBeInTheDocument();
    expect(
      await screen.findByText("23 pending recommendations")
    ).toBeInTheDocument();
  });

  it("allows selecting recommendations", async () => {
    render(<ReviewQueue />);

    const checkbox = await screen.findByRole("checkbox", { name: /select/i });
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("shows bulk actions when items selected", async () => {
    render(<ReviewQueue />);

    const checkbox = await screen.findByRole("checkbox");
    fireEvent.click(checkbox);

    expect(await screen.findByText(/Bulk Approve/i)).toBeInTheDocument();
  });
});
```

---

## 14. Performance Requirements

| Metric                         | Target                       |
| ------------------------------ | ---------------------------- |
| **Dashboard Load Time**        | <2 seconds (95th percentile) |
| **Recommendation Card Render** | <100ms per card              |
| **Bulk Approve (50 items)**    | <5 seconds                   |
| **Decision Trace Load**        | <1 second                    |

---

## 15. Security & Access Control

### 15.1 Authentication

```typescript
// Simple JWT-based auth for prototype
// In production, use proper OAuth/SSO

export function requireAuth(handler: any) {
  return async (req: any, res: any) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify token
    const operator = verifyToken(token);

    if (!operator) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.operator = operator;
    return handler(req, res);
  };
}
```

### 15.2 Role-Based Access

```python
# Operator roles
ROLES = {
    'junior': ['view', 'approve', 'reject'],
    'senior': ['view', 'approve', 'reject', 'modify', 'bulk_approve'],
    'admin': ['*']  # All permissions
}
```

---

## Appendix A: Keyboard Shortcuts

| Shortcut       | Action                          |
| -------------- | ------------------------------- |
| `a`            | Approve selected recommendation |
| `r`            | Reject selected recommendation  |
| `f`            | Flag selected recommendation    |
| `m`            | Modify selected recommendation  |
| `↓`            | Next recommendation             |
| `↑`            | Previous recommendation         |
| `Space`        | Toggle selection                |
| `Ctrl/Cmd + A` | Select all                      |
| `Esc`          | Clear selection                 |

---

## Appendix B: Validation Checklist

### Pre-Deployment

- [ ] All components render without errors
- [ ] API endpoints tested and documented
- [ ] Bulk approve safety checks working
- [ ] Decision traces show complete pipeline
- [ ] Audit logging captures all actions
- [ ] Filter and search working correctly
- [ ] Alert system functional
- [ ] Performance targets met

### Post-Deployment

- [ ] Operator training completed
- [ ] Dashboard accessible to all operators
- [ ] Audit logs reviewed for accuracy
- [ ] User feedback collected
- [ ] No critical bugs in first week

---

**End of Operator Dashboard PRD**

**Next Steps:**

1. Set up Next.js project structure
2. Build review queue component
3. Implement user explorer
4. Add decision trace viewer
5. Connect to backend API
6. Test with sample data
7. Deploy for operator testing

**Questions?** Contact Bryce Harris - bharris@peak6.com
