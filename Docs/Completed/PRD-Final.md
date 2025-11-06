# Operator Dashboard - Final Features PRD

**Version:** 1.0  
**Date:** November 5, 2025  
**Feature Owner:** Bryce Harris  
**Project:** SpendSense - Explainable AI for Financial Education  
**Status:** Gap Analysis & Enhancement Plan  
**Dependencies:** PRD4.md (Operator Dashboard Core), Architecture.md

---

## Executive Summary

This PRD documents the remaining features needed to complete the Operator Dashboard as specified in PRD4.md. Based on a comprehensive gap analysis of the current implementation (~85% complete), this document provides detailed specifications for the missing 15% of features, testing requirements, and production-readiness enhancements.

### Current Implementation Status

✅ **Complete (85%)**

- Review Queue with approve/reject/modify/flag actions
- User Explorer with signal visualization
- Decision Traces with pipeline visibility
- Alert Panel system
- Bulk approval workflow
- Backend API endpoints (all routes implemented)
- Database schema (operator_audit_log, recommendation_flags)
- Keyboard shortcuts
- Mock data support for frontend development

❌ **Missing (15%)**

- Audit Logs Viewer UI
- CSV export functionality
- Undo action capability
- Real-time updates (WebSocket)
- Comprehensive testing suite
- Production authentication & RBAC
- Performance monitoring
- Analytics dashboard

---

## Table of Contents

1. [Feature Priorities](#1-feature-priorities)
2. [Audit Logs Viewer](#2-audit-logs-viewer)
3. [Export Capabilities](#3-export-capabilities)
4. [Undo Action System](#4-undo-action-system)
5. [Real-time Updates](#5-real-time-updates)
6. [Operator Notes & Tags](#6-operator-notes--tags)
7. [Analytics Dashboard](#7-analytics-dashboard)
8. [Testing Requirements](#8-testing-requirements)
9. [Authentication & Security](#9-authentication--security)
10. [Performance Monitoring](#10-performance-monitoring)
11. [Implementation Roadmap](#11-implementation-roadmap)

---

## 1. Feature Priorities

### Phase 1: Essential Production Features (P0)

**Timeline:** 2 weeks  
**Goal:** Make dashboard production-ready

1. **Audit Logs Viewer** - Compliance requirement
2. **JWT Authentication** - Replace placeholder auth
3. **Component Testing** - Quality assurance
4. **CSV Export** - Reporting requirement

### Phase 2: Usability Enhancements (P1)

**Timeline:** 1 week  
**Goal:** Improve operator efficiency

5. **Undo Action** - Error recovery
6. **Performance Monitoring** - System health
7. **Enhanced Operator Notes** - Better documentation

### Phase 3: Advanced Features (P2)

**Timeline:** 2 weeks  
**Goal:** Advanced capabilities

8. **Real-time Updates (WebSocket)** - Live data
9. **Tag System** - Issue categorization
10. **Analytics Dashboard** - Insights & metrics

---

## 2. Audit Logs Viewer

### 2.1 Problem Statement

Operators need visibility into all actions taken on recommendations for:

- Compliance auditing
- Quality assurance reviews
- Training new operators
- Debugging issues
- Performance tracking

**Current State:**

- ✅ Backend API endpoint exists (`/api/operator/audit-logs`)
- ✅ Database table `operator_audit_log` populated
- ❌ No UI to view or filter logs

### 2.2 Requirements

**Must Have:**

- [ ] Paginated table view of all operator actions
- [ ] Filter by: operator, action type, date range, recommendation ID
- [ ] Sort by: timestamp, action type, operator
- [ ] Search by recommendation ID or user ID
- [ ] Action details modal
- [ ] Export filtered results to CSV

**Should Have:**

- [ ] Action type breakdown chart
- [ ] Operator activity timeline
- [ ] Quick filters (today, this week, this month)
- [ ] Highlight unusual patterns (bulk actions, rapid rejections)

### 2.3 UI Design

**Route:** `/audit-logs`

```tsx
// /ui/operator-dashboard/app/audit-logs/page.tsx

export default function AuditLogsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader title="Audit Logs" />

      {/* Filters */}
      <AuditLogFilters onFilterChange={setFilters} operators={operatorList} />

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Actions" value={stats.total} />
        <StatCard label="Today" value={stats.today} />
        <StatCard label="Approvals" value={stats.approvals} />
        <StatCard label="Rejections" value={stats.rejections} />
      </div>

      {/* Audit Table */}
      <AuditLogTable
        logs={logs}
        onRowClick={showDetails}
        pagination={pagination}
      />
    </div>
  );
}
```

### 2.4 Component Specifications

#### AuditLogFilters Component

```tsx
interface AuditLogFilters {
  operator_id?: string;
  action?: "approve" | "reject" | "modify" | "flag" | "bulk_approve" | "all";
  start_date?: string;
  end_date?: string;
  recommendation_id?: string;
}

export function AuditLogFilters({ onFilterChange }: Props) {
  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="grid grid-cols-5 gap-4">
        {/* Operator Select */}
        <Select label="Operator" options={operators} />

        {/* Action Type */}
        <Select label="Action Type" options={actionTypes} />

        {/* Date Range */}
        <DateRangePicker label="Date Range" />

        {/* Search */}
        <Input label="Recommendation ID" placeholder="rec_..." />

        {/* Quick Filters */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setToday()}>
            Today
          </Button>
          <Button variant="outline" onClick={() => setThisWeek()}>
            This Week
          </Button>
        </div>
      </div>
    </div>
  );
}
```

#### AuditLogTable Component

```tsx
interface AuditLogEntry {
  audit_id: string;
  operator_id: string;
  action: string;
  recommendation_id: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export function AuditLogTable({ logs, onRowClick }: Props) {
  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Operator</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Recommendation ID</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.audit_id} onClick={() => onRowClick(log)}>
              <TableCell>{formatDateTime(log.timestamp)}</TableCell>
              <TableCell>
                <Badge>{log.operator_id}</Badge>
              </TableCell>
              <TableCell>
                <ActionBadge action={log.action} />
              </TableCell>
              <TableCell>
                <Link href={`/recommendations/${log.recommendation_id}`}>
                  {log.recommendation_id}
                </Link>
              </TableCell>
              <TableCell>{getActionSummary(log.metadata)}</TableCell>
              <TableCell>
                <Button size="sm" variant="ghost">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination currentPage={1} totalPages={10} />
    </div>
  );
}
```

### 2.5 API Integration

Uses existing endpoint:

```tsx
// /ui/operator-dashboard/lib/api.ts

export async function fetchAuditLogs(params: {
  operator_id?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}): Promise<AuditLogResponse> {
  const queryParams = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [
      string,
      string
    ][]
  );
  return apiRequest(`/api/operator/audit-logs?${queryParams}`);
}
```

### 2.6 Database Schema (Already Exists)

```sql
-- Existing table from schema.sql
CREATE TABLE operator_audit_log (
    audit_id TEXT PRIMARY KEY,
    operator_id TEXT NOT NULL,
    action TEXT NOT NULL,
    recommendation_id TEXT NOT NULL,
    metadata JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.7 Success Criteria

- [ ] Audit logs page loads in <2 seconds
- [ ] Filters update table in <500ms
- [ ] Can view 10,000+ audit entries without performance issues
- [ ] Export to CSV works for any filtered view
- [ ] Operators can find specific action within 30 seconds

---

## 3. Export Capabilities

### 3.1 Requirements

Export audit logs and recommendation data for:

- Compliance reporting
- Performance analysis
- External auditing
- Data sharing with stakeholders

### 3.2 Export Formats

**CSV Export:**

- Audit logs (filtered view)
- Recommendations (by status, date range)
- Operator statistics
- Decision traces (summary)

### 3.3 Implementation

```tsx
// /ui/operator-dashboard/lib/export.ts

export async function exportAuditLogsToCsv(filters: AuditLogFilters) {
  // Fetch all matching records (no pagination limit)
  const logs = await fetchAuditLogs({ ...filters, limit: 10000 });

  // Convert to CSV
  const csv = convertToCSV(logs, [
    "timestamp",
    "operator_id",
    "action",
    "recommendation_id",
    "notes",
  ]);

  // Trigger download
  downloadFile(csv, `audit-logs-${Date.now()}.csv`, "text/csv");
}

function convertToCSV(data: any[], columns: string[]): string {
  const header = columns.join(",");
  const rows = data.map((row) =>
    columns.map((col) => `"${row[col] || ""}"`).join(",")
  );
  return [header, ...rows].join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

### 3.4 UI Integration

```tsx
// Add to AuditLogFilters component
<Button
  onClick={() => exportAuditLogsToCsv(currentFilters)}
  leftIcon={<DownloadIcon />}
>
  Export to CSV
</Button>
```

---

## 4. Undo Action System

### 4.1 Problem Statement

Operators need ability to undo accidental actions within a time window to prevent:

- Mistaken approvals
- Incorrect rejections
- Unintended bulk operations

### 4.2 Requirements

**Must Have:**

- [ ] Undo approve action (within 5 minutes)
- [ ] Undo reject action (within 5 minutes)
- [ ] Undo flag action (within 5 minutes)
- [ ] Visual confirmation of undo success
- [ ] Audit log entry for undo action

**Limitations:**

- ❌ Cannot undo if recommendation already delivered to user
- ❌ Cannot undo modifications (must manually revert)
- ❌ Cannot undo bulk operations as a batch (must undo individually)

### 4.3 Database Schema Addition

```sql
-- Add to schema.sql
ALTER TABLE recommendations ADD COLUMN previous_status TEXT;
ALTER TABLE recommendations ADD COLUMN status_changed_at TIMESTAMP;
ALTER TABLE recommendations ADD COLUMN undo_window_expires_at TIMESTAMP;
```

### 4.4 Backend Implementation

```python
# /api/operator_actions.py

class OperatorActions:
    def undo_action(self, operator_id: str, recommendation_id: str) -> Dict[str, Any]:
        """
        Undo the last action on a recommendation within 5-minute window.

        Requirements:
        - Must be within 5 minutes of action
        - Recommendation must not be delivered
        - Only reverses status change, not modifications

        Returns:
            Dict with undo status and previous state
        """
        cursor = self.db.cursor()

        # Get current state and check undo eligibility
        cursor.execute("""
            SELECT status, previous_status, undo_window_expires_at
            FROM recommendations
            WHERE recommendation_id = ?
        """, (recommendation_id,))

        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Recommendation {recommendation_id} not found")

        current_status, previous_status, expires_at = row

        # Check if undo window expired
        if expires_at and datetime.fromisoformat(expires_at) < datetime.now():
            raise ValueError("Undo window expired (5 minutes)")

        # Check if already delivered
        if current_status == 'delivered':
            raise ValueError("Cannot undo - recommendation already delivered")

        # Restore previous status
        now = datetime.now().isoformat()
        cursor.execute("""
            UPDATE recommendations
            SET status = ?,
                previous_status = NULL,
                undo_window_expires_at = NULL,
                updated_at = ?
            WHERE recommendation_id = ?
        """, (previous_status, now, recommendation_id))

        # Log undo action
        self._log_operator_action(
            operator_id=operator_id,
            action='undo',
            recommendation_id=recommendation_id,
            metadata={
                'reverted_from': current_status,
                'restored_to': previous_status
            }
        )

        self.db.commit()

        return {
            'status': 'undone',
            'recommendation_id': recommendation_id,
            'restored_status': previous_status,
            'undone_by': operator_id,
            'undone_at': now
        }
```

### 4.5 Frontend Implementation

```tsx
// Add to RecommendationCard component
const [showUndoButton, setShowUndoButton] = useState(false);
const [undoCountdown, setUndoCountdown] = useState<number | null>(null);

useEffect(() => {
  if (recommendation.status_changed_at) {
    const changedAt = new Date(recommendation.status_changed_at);
    const expiresAt = new Date(changedAt.getTime() + 5 * 60 * 1000);
    const now = new Date();

    if (now < expiresAt) {
      setShowUndoButton(true);
      setUndoCountdown(
        Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
      );
    }
  }
}, [recommendation]);

const handleUndo = async () => {
  if (!confirm("Undo this action?")) return;

  try {
    await undoAction(recommendation.id);
    toast.success("Action undone successfully");
    onAction(); // Refresh
  } catch (error) {
    toast.error(error.message);
  }
};

// UI
{
  showUndoButton && (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-yellow-900">
            Action can be undone
          </div>
          <div className="text-xs text-yellow-700">
            Time remaining: {undoCountdown}s
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleUndo}>
          ⟲ Undo
        </Button>
      </div>
    </div>
  );
}
```

---

## 5. Real-time Updates

### 5.1 Problem Statement

Multiple operators need to see live updates when:

- New recommendations arrive
- Other operators take actions
- Alerts are triggered
- Statistics change

**Current State:** Manual refresh only

### 5.2 Implementation Options

#### Option A: Server-Sent Events (SSE) - Recommended

**Pros:**

- Simple to implement
- Built-in browser support
- Automatic reconnection
- One-way communication (sufficient for our needs)

**Cons:**

- One-way only (client can't push to server easily)

#### Option B: WebSocket

**Pros:**

- Two-way communication
- Lower latency
- Industry standard

**Cons:**

- More complex setup
- Requires WebSocket server
- Connection management overhead

**Recommendation:** Start with SSE, upgrade to WebSocket if needed.

### 5.3 Backend Implementation (SSE)

```python
# /api/realtime.py

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json

router = APIRouter()

# Store active connections
active_connections: set = set()

@router.get("/realtime/updates")
async def realtime_updates():
    """
    Server-Sent Events endpoint for real-time dashboard updates.

    Sends updates when:
    - New recommendations created
    - Recommendations approved/rejected
    - Stats change
    - Alerts triggered
    """
    async def event_generator():
        queue = asyncio.Queue()
        active_connections.add(queue)

        try:
            while True:
                # Wait for next event
                event_data = await queue.get()

                # Format as SSE
                yield f"data: {json.dumps(event_data)}\n\n"

        except asyncio.CancelledError:
            active_connections.remove(queue)
            raise

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )

async def broadcast_update(event_type: str, data: dict):
    """
    Broadcast an update to all connected clients.
    """
    event = {
        "type": event_type,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }

    for queue in active_connections:
        await queue.put(event)

# Example usage in operator_actions.py
async def approve_recommendation(...):
    # ... existing logic ...

    # Broadcast update
    await broadcast_update("recommendation_approved", {
        "recommendation_id": recommendation_id,
        "operator_id": operator_id
    })
```

### 5.4 Frontend Implementation

```tsx
// /ui/operator-dashboard/hooks/useRealtimeUpdates.ts

export function useRealtimeUpdates() {
  const { mutate: mutateRecommendations } = useRecommendations();
  const { mutate: mutateStats } = useOperatorStats();
  const { mutate: mutateAlerts } = useAlerts();

  useEffect(() => {
    if (USE_MOCK_DATA) return; // Skip in mock mode

    // Connect to SSE endpoint
    const eventSource = new EventSource(`${API_URL}/realtime/updates`);

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);

      switch (update.type) {
        case "recommendation_approved":
        case "recommendation_rejected":
        case "recommendation_created":
          // Refresh recommendations
          mutateRecommendations();
          mutateStats();
          break;

        case "alert_triggered":
          mutateAlerts();
          break;

        case "stats_updated":
          mutateStats();
          break;
      }

      // Show toast notification
      toast.info(`${update.type}: ${update.data.recommendation_id}`);
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
      // Automatic reconnection handled by browser
    };

    return () => {
      eventSource.close();
    };
  }, []);
}
```

### 5.5 Usage

```tsx
// /ui/operator-dashboard/app/page.tsx

export default function OperatorDashboard() {
  // Enable real-time updates
  useRealtimeUpdates();

  return <div>{/* Dashboard content */}</div>;
}
```

---

## 6. Operator Notes & Tags

### 6.1 Enhanced Operator Notes

**Current State:** Basic notes field on approve/reject only

**Enhancement:**

- Persistent notes that don't require action
- Edit notes after submission
- Notes visible to all operators
- Notes history/changelog

### 6.2 Database Schema

```sql
-- Add to schema.sql
CREATE TABLE recommendation_notes (
    note_id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL,
    operator_id TEXT NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

CREATE INDEX idx_notes_recommendation ON recommendation_notes(recommendation_id);
CREATE INDEX idx_notes_created_at ON recommendation_notes(created_at DESC);
```

### 6.3 Tag System

```sql
-- Add to schema.sql
CREATE TABLE recommendation_tags (
    tag_id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL,
    tag_name TEXT NOT NULL,
    tagged_by TEXT NOT NULL,
    tagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

-- Predefined tags
-- 'needs_review', 'edge_case', 'training_example', 'policy_question',
-- 'tone_concern', 'eligibility_question', 'llm_error', 'great_example'

CREATE INDEX idx_tags_recommendation ON recommendation_tags(recommendation_id);
CREATE INDEX idx_tags_name ON recommendation_tags(tag_name);
```

### 6.4 UI Component

```tsx
// /ui/operator-dashboard/components/ReviewQueue/NotesAndTags.tsx

export function NotesAndTags({ recommendationId }: Props) {
  const { data: notes } = useNotes(recommendationId);
  const { data: tags } = useTags(recommendationId);

  return (
    <div className="space-y-4">
      {/* Tags */}
      <div>
        <label className="text-sm font-medium">Tags</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags?.map((tag) => (
            <Badge key={tag.tag_id} variant="secondary">
              {tag.tag_name}
              <button onClick={() => removeTag(tag.tag_id)}>×</button>
            </Badge>
          ))}
          <AddTagButton recommendationId={recommendationId} />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium">Operator Notes</label>
        <div className="mt-2 space-y-2">
          {notes?.map((note) => (
            <div key={note.note_id} className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-gray-500">
                    {note.operator_id} • {formatDateTime(note.created_at)}
                  </div>
                  <div className="text-sm mt-1">{note.note_text}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editNote(note)}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
          <AddNoteButton recommendationId={recommendationId} />
        </div>
      </div>
    </div>
  );
}
```

---

## 7. Analytics Dashboard

### 7.1 Overview

Dedicated analytics page showing:

- Operator performance metrics
- Recommendation trends
- Quality metrics
- System health

**Route:** `/analytics`

### 7.2 Metrics to Display

**Operator Performance:**

- Actions per day/week/month
- Average review time
- Approval vs rejection rate
- Most active operators

**Recommendation Quality:**

- Approval rate by persona
- Rejection reasons breakdown
- Flag rate by recommendation type
- Content performance (which articles get approved most)

**System Health:**

- Pending queue size over time
- Processing latency
- Guardrail pass/fail rates
- LLM API response times

### 7.3 Implementation

```tsx
// /ui/operator-dashboard/app/analytics/page.tsx

export default function AnalyticsPage() {
  const { data: analytics } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600">Operator performance and system metrics</p>
      </div>

      {/* Date Range Selector */}
      <DateRangePicker onChange={setDateRange} />

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Total Actions"
          value={analytics.total_actions}
          trend="+12%"
        />
        <MetricCard
          label="Approval Rate"
          value={`${analytics.approval_rate}%`}
          trend="-2%"
        />
        <MetricCard
          label="Avg Review Time"
          value={`${analytics.avg_review_time}s`}
          trend="-5%"
        />
        <MetricCard
          label="Queue Size"
          value={analytics.queue_size}
          trend="+8%"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Actions Over Time">
          <LineChart data={analytics.actions_timeline} />
        </ChartCard>

        <ChartCard title="Actions by Type">
          <PieChart data={analytics.actions_by_type} />
        </ChartCard>

        <ChartCard title="Approval Rate by Persona">
          <BarChart data={analytics.approval_by_persona} />
        </ChartCard>

        <ChartCard title="Operator Activity">
          <BarChart data={analytics.operator_activity} />
        </ChartCard>
      </div>

      {/* Tables */}
      <div className="space-y-6">
        <TableCard title="Top Rejection Reasons">
          <RejectionReasonsTable data={analytics.rejection_reasons} />
        </TableCard>

        <TableCard title="Content Performance">
          <ContentPerformanceTable data={analytics.content_stats} />
        </TableCard>
      </div>
    </div>
  );
}
```

### 7.4 Backend Analytics Endpoint

```python
# /api/analytics.py

from fastapi import APIRouter, Depends
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/analytics")
def get_analytics(
    start_date: str = None,
    end_date: str = None,
    db = Depends(get_db)
):
    """
    Get analytics data for the dashboard.
    """
    # Default to last 30 days
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).isoformat()
    if not end_date:
        end_date = datetime.now().isoformat()

    cursor = db.cursor()

    # Total actions
    cursor.execute("""
        SELECT COUNT(*) as total
        FROM operator_audit_log
        WHERE timestamp BETWEEN ? AND ?
    """, (start_date, end_date))
    total_actions = cursor.fetchone()['total']

    # Actions by type
    cursor.execute("""
        SELECT action, COUNT(*) as count
        FROM operator_audit_log
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY action
    """, (start_date, end_date))
    actions_by_type = cursor.fetchall()

    # Approval rate
    cursor.execute("""
        SELECT
            SUM(CASE WHEN action = 'approve' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as approval_rate
        FROM operator_audit_log
        WHERE action IN ('approve', 'reject')
          AND timestamp BETWEEN ? AND ?
    """, (start_date, end_date))
    approval_rate = cursor.fetchone()['approval_rate']

    # Actions timeline (daily)
    cursor.execute("""
        SELECT
            DATE(timestamp) as date,
            action,
            COUNT(*) as count
        FROM operator_audit_log
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY DATE(timestamp), action
        ORDER BY date
    """, (start_date, end_date))
    actions_timeline = cursor.fetchall()

    # Operator activity
    cursor.execute("""
        SELECT
            operator_id,
            COUNT(*) as actions
        FROM operator_audit_log
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY operator_id
        ORDER BY actions DESC
    """, (start_date, end_date))
    operator_activity = cursor.fetchall()

    return {
        "total_actions": total_actions,
        "approval_rate": round(approval_rate, 2),
        "actions_by_type": actions_by_type,
        "actions_timeline": actions_timeline,
        "operator_activity": operator_activity
    }
```

---

## 8. Testing Requirements

### 8.1 Current Test Coverage Gap

**Existing Tests:**

- `__tests__/components/AlertPanel.test.tsx`
- `__tests__/hooks/useDebounce.test.ts`
- Backend: `test_operator_actions.py`, `test_personas.py`, `test_alerts.py`

**Missing Tests:** ~20+ component test files

### 8.2 Required Frontend Tests

```bash
__tests__/
├── components/
│   ├── AlertPanel.test.tsx ✅
│   ├── ReviewQueue.test.tsx ❌
│   ├── RecommendationCard.test.tsx ❌
│   ├── FilterPanel.test.tsx ❌
│   ├── BulkActions.test.tsx ❌
│   ├── UserExplorer.test.tsx ❌
│   ├── SignalCard.test.tsx ❌
│   ├── DecisionTraces.test.tsx ❌
│   ├── TraceStep.test.tsx ❌
│   └── StatsOverview.test.tsx ❌
├── hooks/
│   ├── useDebounce.test.ts ✅
│   ├── useRecommendations.test.ts ❌
│   ├── useOperatorStats.test.ts ❌
│   └── useKeyboardShortcuts.test.ts ❌
└── pages/
    ├── index.test.tsx ❌
    └── audit-logs.test.tsx ❌
```

### 8.3 Test Templates

#### Component Test Template

```tsx
// __tests__/components/ReviewQueue.test.tsx

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReviewQueue } from "@/components/ReviewQueue/ReviewQueue";
import { SWRConfig } from "swr";

// Mock SWR data fetching
const mockRecommendations = [
  {
    id: "rec_001",
    title: "Test Recommendation",
    status: "pending",
    priority: "high",
    persona_primary: "high_utilization",
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

describe("ReviewQueue", () => {
  it("renders pending recommendations", async () => {
    render(<ReviewQueue />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Review Queue")).toBeInTheDocument();
    });
  });

  it("allows selecting recommendations", async () => {
    render(<ReviewQueue />, { wrapper });

    const checkbox = await screen.findByRole("checkbox");
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("shows bulk actions when items selected", async () => {
    render(<ReviewQueue />, { wrapper });

    const checkbox = await screen.findByRole("checkbox");
    fireEvent.click(checkbox);

    expect(await screen.findByText(/Bulk Approve/i)).toBeInTheDocument();
  });

  it("filters by persona", async () => {
    render(<ReviewQueue />, { wrapper });

    const personaFilter = screen.getByLabelText("Persona");
    fireEvent.change(personaFilter, { target: { value: "high_utilization" } });

    await waitFor(() => {
      expect(screen.getByText("Test Recommendation")).toBeInTheDocument();
    });
  });
});
```

#### Hook Test Template

```tsx
// __tests__/hooks/useRecommendations.test.ts

import { renderHook, waitFor } from "@testing-library/react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { SWRConfig } from "swr";

describe("useRecommendations", () => {
  it("fetches recommendations successfully", async () => {
    const { result } = renderHook(() => useRecommendations(), {
      wrapper: ({ children }) => (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      ),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("handles errors gracefully", async () => {
    // Mock error response
    global.fetch = jest.fn(() => Promise.reject(new Error("API Error")));

    const { result } = renderHook(() => useRecommendations());

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

### 8.4 Test Coverage Goals

| Category   | Target Coverage | Current | Gap |
| ---------- | --------------- | ------- | --- |
| Components | 80%             | ~10%    | 70% |
| Hooks      | 80%             | ~20%    | 60% |
| Utils      | 90%             | 0%      | 90% |
| API Client | 70%             | 0%      | 70% |
| Overall    | 75%             | ~15%    | 60% |

### 8.5 Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test ReviewQueue.test.tsx

# CI mode (no watch)
npm run test:ci
```

---

## 9. Authentication & Security

### 9.1 Current State

**Problems:**

- Hardcoded operator ID (`op_001`)
- No JWT authentication
- No role-based access control
- No session management

### 9.2 JWT Authentication Implementation

#### Backend: Token Generation

```python
# /api/auth.py

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import jwt
from typing import Optional

router = APIRouter()
security = HTTPBearer()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

# Operator database (in production, use real database)
OPERATORS = {
    "jane.doe@peak6.com": {
        "operator_id": "op_001",
        "name": "Jane Doe",
        "role": "senior",
        "password_hash": "hashed_password"  # Use bcrypt in production
    }
}

ROLES = {
    'junior': ['view', 'approve', 'reject'],
    'senior': ['view', 'approve', 'reject', 'modify', 'bulk_approve', 'flag'],
    'admin': ['*']  # All permissions
}

@router.post("/login")
def login(email: str, password: str):
    """
    Authenticate operator and return JWT token.
    """
    operator = OPERATORS.get(email)
    if not operator or not verify_password(password, operator["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create token
    token_data = {
        "operator_id": operator["operator_id"],
        "email": email,
        "role": operator["role"],
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }

    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "operator": {
            "operator_id": operator["operator_id"],
            "name": operator["name"],
            "role": operator["role"]
        }
    }

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify JWT token and extract operator info.
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_permission(permission: str):
    """
    Decorator to require specific permission.
    """
    def decorator(func):
        def wrapper(*args, operator = Depends(verify_token), **kwargs):
            role = operator["role"]

            if role == "admin":
                return func(*args, **kwargs)

            if permission not in ROLES.get(role, []):
                raise HTTPException(status_code=403, detail="Insufficient permissions")

            return func(*args, **kwargs)
        return wrapper
    return decorator
```

#### Update Existing Endpoints

```python
# /api/recommendations.py

from auth import verify_token, require_permission

@router.post("/recommendations/{id}/approve")
@require_permission("approve")
def approve_recommendation(
    id: str,
    data: schemas.ApproveRequest,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    operator_id = operator["operator_id"]
    # ... rest of logic
```

#### Frontend: Token Management

```tsx
// /ui/operator-dashboard/lib/auth.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  operator: {
    operator_id: string;
    name: string;
    role: string;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      operator: null,

      login: async (email: string, password: string) => {
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error("Invalid credentials");
        }

        const data = await response.json();
        set({
          token: data.access_token,
          operator: data.operator,
        });
      },

      logout: () => {
        set({ token: null, operator: null });
      },

      isAuthenticated: () => {
        return !!get().token;
      },
    }),
    {
      name: "operator-auth",
    }
  )
);
```

#### Login Page

```tsx
// /ui/operator-dashboard/app/login/page.tsx

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">
            SpendSense Operator Login
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
```

#### Protected Routes

```tsx
// /ui/operator-dashboard/components/AuthGuard.tsx

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated()) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

// Wrap app
// /ui/operator-dashboard/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
```

---

## 10. Performance Monitoring

### 10.1 Metrics to Track

**Frontend Metrics:**

- Page load time
- Component render time
- API response time
- Bundle size

**Backend Metrics:**

- Endpoint latency
- Database query time
- LLM API latency
- Concurrent users

### 10.2 Implementation

#### Frontend Performance Hook

```tsx
// /ui/operator-dashboard/hooks/usePerformanceMonitoring.ts

export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      // Log to analytics
      logPerformance({
        component: componentName,
        duration,
        timestamp: new Date().toISOString(),
      });
    };
  }, [componentName]);
}

// Usage
export function ReviewQueue() {
  usePerformanceMonitoring("ReviewQueue");
  // ... component logic
}
```

#### Backend Performance Middleware

```python
# /api/middleware.py

import time
from fastapi import Request

@app.middleware("http")
async def performance_middleware(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    duration = time.time() - start_time

    # Add header
    response.headers["X-Process-Time"] = str(duration)

    # Log slow requests
    if duration > 1.0:  # > 1 second
        logger.warning(f"Slow request: {request.url.path} took {duration:.2f}s")

    return response
```

#### Performance Dashboard

```tsx
// Add to Analytics page
<ChartCard title="API Response Times">
  <LineChart
    data={performanceMetrics.api_latency}
    yLabel="Response Time (ms)"
  />
</ChartCard>

<ChartCard title="Page Load Times">
  <BarChart
    data={performanceMetrics.page_loads}
    yLabel="Load Time (s)"
  />
</ChartCard>
```

---

## 11. Implementation Roadmap

### Phase 1: Production Readiness (2 weeks)

**Week 1: Core Functionality**

- [ ] Day 1-2: Audit Logs Viewer UI
  - Create `/audit-logs` page
  - Implement AuditLogTable component
  - Add filters and search
- [ ] Day 3-4: JWT Authentication
  - Backend auth endpoints
  - Frontend login page
  - Protected routes
- [ ] Day 5: CSV Export
  - Implement export functions
  - Add export buttons to UI

**Week 2: Testing & Quality**

- [ ] Day 1-3: Component Tests
  - Write tests for ReviewQueue
  - Write tests for UserExplorer
  - Write tests for DecisionTraces
- [ ] Day 4-5: Integration Testing
  - End-to-end test scenarios
  - Performance testing
  - Bug fixes

### Phase 2: Enhancements (1 week)

**Days 1-3: Usability**

- [ ] Undo action system
- [ ] Enhanced operator notes
- [ ] Performance monitoring

**Days 4-5: Polish**

- [ ] Update README.md
- [ ] Documentation
- [ ] Code cleanup

### Phase 3: Advanced Features (2 weeks)

**Week 1: Real-time & Tags**

- [ ] Day 1-3: Real-time updates (SSE)
- [ ] Day 4-5: Tag system

**Week 2: Analytics**

- [ ] Day 1-3: Analytics dashboard
- [ ] Day 4-5: Performance metrics display

---

## 12. Success Criteria

### Phase 1 Complete When:

- [ ] Audit logs viewable with <2s load time
- [ ] JWT authentication working
- [ ] CSV export functional
- [ ] 80% component test coverage
- [ ] All critical bugs fixed

### Phase 2 Complete When:

- [ ] Undo action working with 5-min window
- [ ] Performance monitoring in place
- [ ] Documentation updated
- [ ] README reflects actual dashboard

### Phase 3 Complete When:

- [ ] Real-time updates working
- [ ] Tag system operational
- [ ] Analytics dashboard deployed
- [ ] Performance metrics tracked

---

## Appendix A: File Structure Changes

```
/ui/operator-dashboard/
├── app/
│   ├── audit-logs/
│   │   └── page.tsx ⭐ NEW
│   ├── analytics/
│   │   └── page.tsx ⭐ NEW
│   ├── login/
│   │   └── page.tsx ⭐ NEW
│   └── ...
├── components/
│   ├── AuditLogs/ ⭐ NEW
│   │   ├── AuditLogTable.tsx
│   │   ├── AuditLogFilters.tsx
│   │   └── AuditLogDetails.tsx
│   ├── Analytics/ ⭐ NEW
│   │   ├── MetricCard.tsx
│   │   ├── ChartCard.tsx
│   │   └── PerformanceChart.tsx
│   ├── Auth/ ⭐ NEW
│   │   ├── LoginForm.tsx
│   │   └── AuthGuard.tsx
│   └── ...
├── hooks/
│   ├── useAuth.ts ⭐ NEW
│   ├── useRealtimeUpdates.ts ⭐ NEW
│   ├── useAnalytics.ts ⭐ NEW
│   └── usePerformanceMonitoring.ts ⭐ NEW
├── lib/
│   ├── auth.ts ⭐ NEW
│   ├── export.ts ⭐ NEW
│   └── ...
└── __tests__/ ⭐ EXPAND
    ├── components/
    │   ├── ReviewQueue.test.tsx ⭐ NEW
    │   ├── UserExplorer.test.tsx ⭐ NEW
    │   └── ... (10+ more)
    └── ...
```

```
/api/
├── auth.py ⭐ NEW
├── analytics.py ⭐ NEW
├── realtime.py ⭐ NEW
├── tests/
│   ├── test_auth.py ⭐ NEW
│   ├── test_analytics.py ⭐ NEW
│   └── test_realtime.py ⭐ NEW
└── ...
```

---

## Appendix B: Database Schema Additions

```sql
-- Add to /api/schema.sql

-- Undo support
ALTER TABLE recommendations ADD COLUMN previous_status TEXT;
ALTER TABLE recommendations ADD COLUMN status_changed_at TIMESTAMP;
ALTER TABLE recommendations ADD COLUMN undo_window_expires_at TIMESTAMP;

-- Operator notes
CREATE TABLE IF NOT EXISTS recommendation_notes (
    note_id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL,
    operator_id TEXT NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

-- Tags
CREATE TABLE IF NOT EXISTS recommendation_tags (
    tag_id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL,
    tag_name TEXT NOT NULL,
    tagged_by TEXT NOT NULL,
    tagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notes_recommendation ON recommendation_notes(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_tags_recommendation ON recommendation_tags(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON recommendation_tags(tag_name);
```

---

## Appendix C: Environment Variables

```bash
# Add to .env

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480

# Real-time Updates
ENABLE_REALTIME_UPDATES=true

# Performance Monitoring
ENABLE_PERFORMANCE_LOGGING=true
SLOW_REQUEST_THRESHOLD=1.0

# Analytics
ANALYTICS_RETENTION_DAYS=90
```

---

## Summary

This PRD covers all missing features from the original PRD4.md, with detailed specifications for:

1. ✅ **Audit Logs Viewer** - Complete UI and filtering
2. ✅ **CSV Export** - Full implementation
3. ✅ **Undo Action** - 5-minute window system
4. ✅ **Real-time Updates** - SSE-based implementation
5. ✅ **Enhanced Notes & Tags** - Persistent operator collaboration
6. ✅ **Analytics Dashboard** - Comprehensive metrics
7. ✅ **Testing Suite** - 80%+ coverage plan
8. ✅ **JWT Authentication** - Production-ready auth
9. ✅ **RBAC** - Role-based permissions
10. ✅ **Performance Monitoring** - System health tracking

All features align with the SpendSense architecture (Architecture.md) and integrate seamlessly with existing operator dashboard implementation.

**Estimated Total Implementation Time:** 5 weeks (3 phases)

**Next Steps:**

1. Review and approve this PRD
2. Create detailed task tickets for Phase 1
3. Begin implementation with Audit Logs Viewer
4. Iterate through phases sequentially

---

**Questions or clarifications?** Contact Bryce Harris - bharris@peak6.com
