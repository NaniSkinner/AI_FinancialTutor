# SHARD 7: Stats, Alerts & Polish

**Project:** SpendSense Operator Dashboard  
**Purpose:** Dashboard metrics, alert system, performance optimization, and final integration  
**Phase:** Final Integration & Polish  
**Estimated Size:** ~10% of total implementation + testing  
**Dependencies:** All previous shards (1-6)

---

## Overview

This final shard brings together all components with the alert system, performance optimizations, comprehensive testing, and production readiness. It also includes keyboard shortcuts, accessibility improvements, and monitoring.

---

## Alert System

### Alert Panel Component

Create `/components/AlertPanel/AlertPanel.tsx`:

```tsx
import React from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertItem } from "./AlertItem";

export function AlertPanel() {
  const { data: alerts, mutate } = useAlerts();

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
              <AlertItem key={alert.id} alert={alert} onDismiss={mutate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Alert Item Component

Create `/components/AlertPanel/AlertItem.tsx`:

```tsx
import React from "react";
import { Badge } from "@/components/Common/Badge";
import type { Alert } from "@/lib/types";

interface Props {
  alert: Alert;
  onDismiss?: () => void;
}

export function AlertItem({ alert, onDismiss }: Props) {
  const getSeverityColor = () => {
    switch (alert.severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityColor()}`}
    >
      <div className="flex items-center gap-3 flex-1">
        <Badge variant="outline" className="uppercase text-xs">
          {alert.type.replace(/_/g, " ")}
        </Badge>

        <span className="text-sm font-medium">{alert.message}</span>

        {alert.count && <span className="text-xs">({alert.count} items)</span>}
      </div>

      {alert.actionUrl && (
        <a
          href={alert.actionUrl}
          className="text-sm font-medium underline hover:no-underline ml-4"
        >
          View →
        </a>
      )}
    </div>
  );
}
```

### useAlerts Hook

Create `/hooks/useAlerts.ts`:

```typescript
import useSWR from "swr";
import { fetchAlerts } from "@/lib/api";
import type { Alert } from "@/lib/types";

export function useAlerts() {
  const { data, error, isLoading, mutate } = useSWR<Alert[]>(
    "/api/operator/alerts",
    fetchAlerts,
    {
      refreshInterval: 60000, // Refresh every minute
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

## Alert Generation Logic (Backend)

Add to `/api/alerts.py`:

```python
from fastapi import APIRouter, Depends
from typing import List
import sqlite3
from datetime import datetime, timedelta

from database import get_db

router = APIRouter()

@router.get("/alerts")
def get_alerts(db: sqlite3.Connection = Depends(get_db)):
    """Generate alerts based on current system state"""
    alerts = []
    cursor = db.cursor()

    # Alert: High rejection rate
    cursor.execute("""
        SELECT COUNT(*) FROM operator_audit_log
        WHERE action = 'reject'
          AND DATE(timestamp) = DATE('now')
    """)
    rejected_today = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM operator_audit_log
        WHERE action IN ('approve', 'reject')
          AND DATE(timestamp) = DATE('now')
    """)
    total_today = cursor.fetchone()[0]

    if total_today > 10 and (rejected_today / total_today) > 0.2:
        alerts.append({
            'id': 'alert_high_rejection',
            'type': 'high_rejection_rate',
            'severity': 'medium',
            'message': f'High rejection rate today: {rejected_today}/{total_today} ({int(rejected_today/total_today*100)}%)',
            'createdAt': datetime.now().isoformat()
        })

    # Alert: Long queue
    cursor.execute("SELECT COUNT(*) FROM recommendations WHERE status = 'pending'")
    pending_count = cursor.fetchone()[0]

    if pending_count > 50:
        alerts.append({
            'id': 'alert_long_queue',
            'type': 'long_queue',
            'severity': 'high',
            'message': f'Review queue is backing up: {pending_count} pending recommendations',
            'count': pending_count,
            'createdAt': datetime.now().isoformat()
        })

    # Alert: Guardrail failures
    cursor.execute("""
        SELECT COUNT(*) FROM recommendations
        WHERE guardrails_passed = 0
          AND DATE(created_at) = DATE('now')
    """)
    guardrail_failures = cursor.fetchone()[0]

    if guardrail_failures > 5:
        alerts.append({
            'id': 'alert_guardrail_failures',
            'type': 'guardrail_failures',
            'severity': 'high',
            'message': f'Multiple guardrail failures detected today: {guardrail_failures} recommendations failed checks',
            'count': guardrail_failures,
            'createdAt': datetime.now().isoformat()
        })

    # Alert: Flagged items
    cursor.execute("SELECT COUNT(*) FROM recommendation_flags WHERE resolved = 0")
    flagged_count = cursor.fetchone()[0]

    if flagged_count > 0:
        alerts.append({
            'id': 'alert_flagged_items',
            'type': 'flagged_item',
            'severity': 'medium',
            'message': f'{flagged_count} flagged items require senior review',
            'count': flagged_count,
            'actionUrl': '/flagged',
            'createdAt': datetime.now().isoformat()
        })

    return alerts
```

Add router to `main.py`:

```python
from alerts import router as alerts_router
app.include_router(alerts_router, prefix="/api/operator")
```

---

## Performance Optimizations

### Memoization for Expensive Computations

Update `/components/ReviewQueue/ReviewQueue.tsx`:

```tsx
import React, { useState, useMemo } from "react";

export function ReviewQueue() {
  // ... existing code ...

  // Memoize filtered recommendations
  const filteredRecommendations = useMemo(() => {
    if (!recommendations) return [];

    return recommendations.filter((rec) => {
      // Add any additional client-side filtering here
      return true;
    });
  }, [recommendations]);

  // ... rest of component ...
}
```

### Debounced Search

Create `/hooks/useDebounce.ts`:

```typescript
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

Usage in UserSearch:

```tsx
import { useDebounce } from "@/hooks/useDebounce";

export function UserSearch({ onUserSelect }: Props) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      // Trigger search
    }
  }, [debouncedSearch]);

  // ... rest of component
}
```

### Virtual Scrolling (Optional for large lists)

If the review queue grows very large, consider using `react-window`:

```bash
npm install react-window
```

```tsx
import { FixedSizeList } from "react-window";

// In ReviewQueue component
<FixedSizeList
  height={800}
  itemCount={recommendations.length}
  itemSize={200}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <RecommendationCard
        recommendation={recommendations[index]}
        // ... props
      />
    </div>
  )}
</FixedSizeList>;
```

---

## Keyboard Shortcuts Implementation

### Global Keyboard Handler

Create `/components/KeyboardShortcutsHandler.tsx`:

```tsx
import React, { useEffect } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface Props {
  onApprove?: () => void;
  onReject?: () => void;
  onFlag?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  enabled?: boolean;
}

export function KeyboardShortcutsHandler({
  onApprove,
  onReject,
  onFlag,
  onNext,
  onPrevious,
  enabled = true,
}: Props) {
  useKeyboardShortcuts({
    onApprove: enabled ? onApprove : undefined,
    onReject: enabled ? onReject : undefined,
    onFlag: enabled ? onFlag : undefined,
    onNext: enabled ? onNext : undefined,
    onPrevious: enabled ? onPrevious : undefined,
  });

  return null; // This is a behavioral component, renders nothing
}
```

### Keyboard Shortcuts Legend

Create `/components/KeyboardShortcutsLegend.tsx`:

```tsx
import React, { useState } from "react";
import { Modal } from "@/components/Common/Modal";
import { Button } from "@/components/Common/Button";

export function KeyboardShortcutsLegend() {
  const [showModal, setShowModal] = useState(false);

  const shortcuts = [
    { key: "a", description: "Approve selected recommendation" },
    { key: "r", description: "Reject selected recommendation" },
    { key: "f", description: "Flag selected recommendation" },
    { key: "m", description: "Modify selected recommendation" },
    { key: "↓", description: "Next recommendation" },
    { key: "↑", description: "Previous recommendation" },
    { key: "Space", description: "Toggle selection" },
    { key: "Cmd/Ctrl + A", description: "Select all" },
    { key: "Esc", description: "Clear selection" },
    { key: "?", description: "Show this help" },
  ];

  // Listen for '?' key to open legend
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.target.matches("input, textarea")) {
        setShowModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 bg-white shadow-lg"
      >
        ⌨️ Shortcuts
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Keyboard Shortcuts"
      >
        <div className="space-y-2">
          {shortcuts.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm text-gray-700">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
```

Add to main dashboard:

```tsx
// In pages/index.tsx
import { KeyboardShortcutsLegend } from "@/components/KeyboardShortcutsLegend";

export default function OperatorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... existing layout ... */}

      <KeyboardShortcutsLegend />
    </div>
  );
}
```

---

## Accessibility Improvements

### Focus Management

Add to `/lib/focus-management.ts`:

```typescript
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener("keydown", handleTabKey);
  return () => element.removeEventListener("keydown", handleTabKey);
}
```

### ARIA Labels

Ensure all interactive elements have proper ARIA labels:

```tsx
// Example in RecommendationCard
<button
  onClick={handleApprove}
  aria-label={`Approve recommendation ${recommendation.title}`}
  className="..."
>
  ✓ Approve
</button>
```

---

## Testing Suite

### Component Tests

Create `/tests/components/ReviewQueue.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReviewQueue } from "@/components/ReviewQueue/ReviewQueue";
import { SWRConfig } from "swr";

const mockRecommendations = [
  {
    id: "rec_1",
    user_id: "user_1",
    persona_primary: "high_utilization",
    type: "article",
    title: "Test Recommendation",
    rationale: "Test rationale",
    priority: "high",
    status: "pending",
    guardrails_passed: {
      tone_check: true,
      advice_check: true,
      eligibility_check: true,
    },
    generated_at: "2025-11-03T10:00:00Z",
  },
];

describe("ReviewQueue", () => {
  it("renders pending recommendations", async () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <ReviewQueue />
      </SWRConfig>
    );

    expect(await screen.findByText("Review Queue")).toBeInTheDocument();
  });

  it("allows selecting recommendations", async () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <ReviewQueue />
      </SWRConfig>
    );

    const checkbox = await screen.findByRole("checkbox");
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("shows bulk actions when items selected", async () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <ReviewQueue />
      </SWRConfig>
    );

    const checkbox = await screen.findByRole("checkbox");
    fireEvent.click(checkbox);

    expect(await screen.findByText(/Bulk Approve/i)).toBeInTheDocument();
  });
});
```

### API Tests

Create `/api/tests/test_operator_actions.py`:

```python
import pytest
from operator_actions import OperatorActions
from database import get_db_connection
import sqlite3

@pytest.fixture
def db():
    conn = sqlite3.connect(':memory:')
    conn.row_factory = sqlite3.Row
    # Initialize schema
    # ... create tables ...
    yield conn
    conn.close()

def test_approve_recommendation(db):
    actions = OperatorActions(db)

    # Insert test recommendation
    # ...

    result = actions.approve_recommendation('op_001', 'rec_test', 'Test notes')

    assert result['status'] == 'approved'
    assert result['approved_by'] == 'op_001'

def test_reject_recommendation(db):
    actions = OperatorActions(db)

    result = actions.reject_recommendation('op_001', 'rec_test', 'Test reason')

    assert result['status'] == 'rejected'
    assert result['reason'] == 'Test reason'

def test_bulk_approve(db):
    actions = OperatorActions(db)

    result = actions.bulk_approve('op_001', ['rec_1', 'rec_2', 'rec_3'])

    assert result['total'] == 3
    assert result['approved'] >= 0
```

---

## Monitoring & Logging

### Frontend Error Boundary

Create `/components/ErrorBoundary.tsx`:

```tsx
import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Send to error tracking service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg border border-red-200 max-w-md">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              The application encountered an unexpected error. Please refresh
              the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Wrap app in `_app.tsx`:

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
```

### Backend Logging

Add to `/api/main.py`:

```python
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'operator_dashboard_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response
```

---

## Production Checklist

### Environment Configuration

Create `/api/.env.production`:

```bash
DATABASE_URL=postgresql://user:pass@localhost/spendsense
API_PORT=8000
CORS_ORIGINS=https://operator.spendsense.com
LOG_LEVEL=INFO
```

### Docker Configuration (Optional)

Create `/Dockerfile`:

```dockerfile
FROM node:18-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM python:3.11-slim AS backend
WORKDIR /app
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY api/ .

EXPOSE 3000 8000

CMD ["sh", "-c", "python main.py & npm start"]
```

---

## Final Acceptance Criteria

**Must Have:**

- [ ] All components integrated and working
- [ ] Alert system functional
- [ ] Keyboard shortcuts working
- [ ] Performance optimized (load time <2s)
- [ ] Error boundaries catch errors
- [ ] All tests passing
- [ ] Backend logging configured
- [ ] CORS properly configured
- [ ] Database indexes created
- [ ] API documentation complete

**Should Have:**

- [ ] Accessibility audit passed
- [ ] Mobile responsive (even if not fully supported)
- [ ] Analytics tracking (optional)
- [ ] Rate limiting on API
- [ ] Caching strategy implemented

---

## Deployment Steps

1. **Frontend Build**

   ```bash
   npm run build
   npm run start
   ```

2. **Backend Deployment**

   ```bash
   cd api
   uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

3. **Database Migration**

   ```bash
   python -c "from database import init_database; init_database()"
   ```

4. **Health Check**
   - Visit http://localhost:8000/health
   - Check frontend loads at http://localhost:3000

---

## Post-Deployment Monitoring

- Monitor API response times
- Track error rates
- Monitor database performance
- Track operator usage metrics
- Review audit logs regularly

---

**Dependencies:** All previous shards (1-6)  
**Blocks:** None (final shard)  
**Estimated Time:** 4-6 hours
