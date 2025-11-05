# SpendSense Operator Dashboard - Final Implementation Tasks

**Version:** 1.0  
**Date:** November 5, 2025  
**Based On:** PRD-Final.md  
**Project:** SpendSense - Operator Dashboard Completion  
**Status:** Ready for Implementation

---

## Overview

This document contains all remaining tasks to complete the Operator Dashboard to 100% of PRD4.md specifications. Current completion: **85%**. These tasks will bring the project to **100%** production-ready status.

### Task Organization

Tasks are organized into 3 phases:

- **Phase 1:** Essential Production Features (P0) - 2 weeks
- **Phase 2:** Usability Enhancements (P1) - 1 week
- **Phase 3:** Advanced Features (P2) - 2 weeks

**Total Estimated Time:** 5 weeks

---

## Table of Contents

1. [Phase 1: Production Readiness](#phase-1-production-readiness)
   - [Task 1.1: Audit Logs Viewer](#task-11-audit-logs-viewer)
   - [Task 1.2: JWT Authentication & RBAC](#task-12-jwt-authentication--rbac)
   - [Task 1.3: CSV Export](#task-13-csv-export)
   - [Task 1.4: Component Testing](#task-14-component-testing)
2. [Phase 2: Usability Enhancements](#phase-2-usability-enhancements)
   - [Task 2.1: Undo Action System](#task-21-undo-action-system)
   - [Task 2.2: Performance Monitoring](#task-22-performance-monitoring)
   - [Task 2.3: Enhanced Operator Notes](#task-23-enhanced-operator-notes)
3. [Phase 3: Advanced Features](#phase-3-advanced-features)
   - [Task 3.1: Real-time Updates (SSE)](#task-31-real-time-updates-sse)
   - [Task 3.2: Tag System](#task-32-tag-system)
   - [Task 3.3: Analytics Dashboard](#task-33-analytics-dashboard)
4. [Documentation Updates](#documentation-updates)
5. [Testing & Validation](#testing--validation)

---

## Phase 1: Production Readiness

**Timeline:** 2 weeks  
**Priority:** P0 (Critical)  
**Goal:** Make dashboard production-ready

---

## Task 1.1: Audit Logs Viewer

**Estimated Time:** 2 days  
**Priority:** P0  
**Dependencies:** None (backend API already exists)

### Context

Backend endpoint `/api/operator/audit-logs` exists and database table `operator_audit_log` is populated. Need to create UI for viewing, filtering, and exporting audit logs.

### Subtasks

#### 1.1.1: Create Audit Logs Page Route

**File:** `/ui/operator-dashboard/app/audit-logs/page.tsx`

```bash
# Create directory
mkdir -p ui/operator-dashboard/app/audit-logs
```

**Implementation:**

- [ ] Create main page component
- [ ] Add page to navigation menu in main layout
- [ ] Set up page metadata (title, description)
- [ ] Import required components

**Acceptance Criteria:**

- Page accessible at `/audit-logs`
- Page appears in main navigation
- Page title shows "Audit Logs"

---

#### 1.1.2: Create AuditLogFilters Component

**File:** `/ui/operator-dashboard/components/AuditLogs/AuditLogFilters.tsx`

```bash
# Create directory
mkdir -p ui/operator-dashboard/components/AuditLogs
```

**Implementation:**

- [ ] Create filter interface matching API params
- [ ] Add operator dropdown (fetch from API)
- [ ] Add action type dropdown (approve, reject, modify, flag, bulk_approve)
- [ ] Add date range picker
- [ ] Add recommendation ID search input
- [ ] Add quick filter buttons (Today, This Week, This Month)
- [ ] Implement filter state management
- [ ] Call `onFilterChange` prop when filters update

**Fields:**

```typescript
interface AuditLogFilters {
  operator_id?: string;
  action?: "approve" | "reject" | "modify" | "flag" | "bulk_approve" | "all";
  start_date?: string;
  end_date?: string;
  recommendation_id?: string;
}
```

**Acceptance Criteria:**

- All filters functional
- Quick filter buttons work (Today, This Week, This Month)
- Filters reset properly
- Filter state persists during page session

---

#### 1.1.3: Create AuditLogTable Component

**File:** `/ui/operator-dashboard/components/AuditLogs/AuditLogTable.tsx`

**Implementation:**

- [ ] Create table with columns: Timestamp, Operator, Action, Recommendation ID, Details, Actions
- [ ] Implement row click to show details modal
- [ ] Add pagination controls (10, 25, 50, 100 per page)
- [ ] Add loading state
- [ ] Add empty state
- [ ] Format timestamps using `date-fns`
- [ ] Add action badges with color coding
- [ ] Add sorting by timestamp

**Acceptance Criteria:**

- Table displays all audit log fields
- Pagination works correctly
- Rows clickable to show details
- Loading and empty states display properly
- Timestamps formatted correctly (e.g., "Nov 5, 2025, 3:45 PM")

---

#### 1.1.4: Create AuditLogDetails Modal

**File:** `/ui/operator-dashboard/components/AuditLogs/AuditLogDetails.tsx`

**Implementation:**

- [ ] Create modal component using Radix UI Dialog
- [ ] Display full audit log entry
- [ ] Parse and display metadata JSON
- [ ] Add link to view recommendation
- [ ] Add close button

**Acceptance Criteria:**

- Modal opens when row clicked
- All fields displayed clearly
- Metadata JSON formatted nicely
- Links work to recommendation details

---

#### 1.1.5: Create Stats Cards

**File:** `/ui/operator-dashboard/components/AuditLogs/AuditLogStats.tsx`

**Implementation:**

- [ ] Create 4 stat cards: Total Actions, Today, Approvals, Rejections
- [ ] Fetch stats from filtered data
- [ ] Update stats when filters change
- [ ] Add trend indicators (optional)

**Acceptance Criteria:**

- Stats display correctly
- Stats update when filters applied
- Cards have proper styling

---

#### 1.1.6: Integrate with API

**File:** `/ui/operator-dashboard/lib/api.ts`

**Implementation:**

- [ ] Verify `fetchAuditLogs()` function exists
- [ ] Add TypeScript types for audit log response
- [ ] Create custom hook `useAuditLogs(filters)`
- [ ] Handle loading and error states
- [ ] Implement pagination in API call

**Hook File:** `/ui/operator-dashboard/hooks/useAuditLogs.ts`

```typescript
import useSWR from "swr";
import { fetchAuditLogs } from "@/lib/api";

export function useAuditLogs(filters: AuditLogFilters) {
  return useSWR(
    ["/api/operator/audit-logs", filters],
    () => fetchAuditLogs(filters),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );
}
```

**Acceptance Criteria:**

- API calls work with all filter combinations
- Loading states handled
- Error states handled
- Pagination works

---

#### 1.1.7: Add Navigation Link

**File:** `/ui/operator-dashboard/app/page.tsx` or main layout

**Implementation:**

- [ ] Add "Audit Logs" link to header navigation
- [ ] Add icon (e.g., 📋 or document icon)
- [ ] Highlight active state when on audit logs page

**Acceptance Criteria:**

- Link visible in navigation
- Link routes to `/audit-logs`
- Active state works

---

#### 1.1.8: Create Index Export

**File:** `/ui/operator-dashboard/components/AuditLogs/index.ts`

```typescript
export { AuditLogFilters } from "./AuditLogFilters";
export { AuditLogTable } from "./AuditLogTable";
export { AuditLogDetails } from "./AuditLogDetails";
export { AuditLogStats } from "./AuditLogStats";
```

---

### Task 1.1 Acceptance Criteria

- [x] Audit logs page accessible at `/audit-logs`
- [x] All filters working (operator, action, date range, search)
- [x] Table displays paginated results
- [x] Details modal shows on row click
- [x] Page loads in <2 seconds with 1000+ logs
- [x] No console errors
- [x] Responsive design works on desktop
- [x] Stats cards display correct counts

**STATUS: ✅ COMPLETED (November 5, 2025)**

**Implementation Notes:**

- Created complete Audit Logs UI with all components
- Fixed backend database dependency injection (created `get_db_fastapi()`)
- Fixed React duplicate key error for null audit_ids
- Added "success" and "warning" variants to Badge component
- Fixed infinite loop in filter component with useCallback
- Backend endpoint working at `/api/operator/audit-logs`
- 30 audit log entries successfully displaying

---

## Task 1.2: JWT Authentication & RBAC

**Estimated Time:** 3 days  
**Priority:** P0  
**Dependencies:** None

### Context

Replace placeholder authentication (`op_001`) with proper JWT-based authentication and role-based access control (RBAC).

### Subtasks

#### 1.2.1: Create Backend Auth Module

**File:** `/api/auth.py`

**Implementation:**

- [ ] Install PyJWT: `pip install pyjwt`
- [ ] Create `auth.py` module
- [ ] Define `SECRET_KEY` from environment variable
- [ ] Create operator database (dict or table)
- [ ] Implement password hashing with bcrypt
- [ ] Create `login()` endpoint
- [ ] Create `verify_token()` dependency
- [ ] Create `require_permission()` decorator
- [ ] Define ROLES dict (junior, senior, admin)

**Operator Database Structure:**

```python
OPERATORS = {
    "jane.doe@spendsense.com": {
        "operator_id": "op_001",
        "name": "Jane Doe",
        "role": "senior",
        "password_hash": "$2b$12$..."  # bcrypt hash
    },
    "john.smith@spendsense.com": {
        "operator_id": "op_002",
        "name": "John Smith",
        "role": "junior",
        "password_hash": "$2b$12$..."
    }
}

ROLES = {
    'junior': ['view', 'approve', 'reject'],
    'senior': ['view', 'approve', 'reject', 'modify', 'bulk_approve', 'flag'],
    'admin': ['*']
}
```

**Endpoints:**

- [ ] `POST /api/auth/login` - Returns JWT token
- [ ] `GET /api/auth/me` - Returns current operator info

**Acceptance Criteria:**

- Login endpoint returns valid JWT token
- Token contains operator_id, role, expiration
- Token verification works
- Invalid credentials return 401
- Expired tokens return 401

---

#### 1.2.2: Update Existing API Endpoints

**Files:**

- `/api/recommendations.py`
- `/api/audit.py`
- `/api/users.py`
- `/api/alerts.py`

**Implementation:**

- [ ] Import `verify_token` and `require_permission` from auth.py
- [ ] Add `operator = Depends(verify_token)` to all endpoints
- [ ] Replace hardcoded `get_current_operator_id()` with `operator["operator_id"]`
- [ ] Add permission decorators where appropriate
- [ ] Approve/Reject: require "approve" or "reject" permission
- [ ] Modify: require "modify" permission
- [ ] Bulk approve: require "bulk_approve" permission

**Example:**

```python
@router.post("/recommendations/{id}/approve")
def approve_recommendation(
    id: str,
    data: schemas.ApproveRequest,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    # Check permission
    if operator["role"] not in ["senior", "admin"]:
        raise HTTPException(403, "Insufficient permissions")

    operator_id = operator["operator_id"]
    # ... rest of logic
```

**Acceptance Criteria:**

- All endpoints require authentication
- Endpoints check role permissions
- Unauthorized requests return 401
- Forbidden requests return 403

---

#### 1.2.3: Register Auth Router

**File:** `/api/main.py`

**Implementation:**

- [ ] Import auth router
- [ ] Register with `/api/auth` prefix
- [ ] Add to router list

```python
from auth import router as auth_router

app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"]
)
```

---

#### 1.2.4: Create Frontend Auth Store

**File:** `/ui/operator-dashboard/lib/auth.ts`

**Implementation:**

- [ ] Create Zustand store with persist middleware
- [ ] Add state: `token`, `operator` (id, name, role)
- [ ] Add actions: `login()`, `logout()`, `isAuthenticated()`
- [ ] Store token in localStorage
- [ ] Implement `login()` to call `/api/auth/login`
- [ ] Parse and store JWT payload

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Operator {
  operator_id: string;
  name: string;
  role: "junior" | "senior" | "admin";
}

interface AuthState {
  token: string | null;
  operator: Operator | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      operator: null,

      login: async (email: string, password: string) => {
        const response = await fetch(`${API_URL}/api/auth/login`, {
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

      hasPermission: (permission: string) => {
        const operator = get().operator;
        if (!operator) return false;
        if (operator.role === "admin") return true;

        const permissions = {
          junior: ["view", "approve", "reject"],
          senior: [
            "view",
            "approve",
            "reject",
            "modify",
            "bulk_approve",
            "flag",
          ],
        };

        return permissions[operator.role]?.includes(permission) || false;
      },
    }),
    {
      name: "operator-auth",
    }
  )
);
```

---

#### 1.2.5: Update API Client with Auth Headers

**File:** `/ui/operator-dashboard/lib/api.ts`

**Implementation:**

- [ ] Import `useAuth` store
- [ ] Add Authorization header to all API requests
- [ ] Handle 401 responses (redirect to login)
- [ ] Handle 403 responses (show permission error)

```typescript
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = useAuth.getState().token;

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    // Token expired or invalid - logout
    useAuth.getState().logout();
    window.location.href = "/login";
    throw new Error("Authentication required");
  }

  if (response.status === 403) {
    throw new Error("Insufficient permissions");
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
```

---

#### 1.2.6: Create Login Page

**File:** `/ui/operator-dashboard/app/login/page.tsx`

**Implementation:**

- [ ] Create login form with email and password fields
- [ ] Add form validation
- [ ] Call `useAuth().login()` on submit
- [ ] Handle errors (show error message)
- [ ] Redirect to dashboard on success
- [ ] Add SpendSense branding/logo

**Acceptance Criteria:**

- Form validates email format
- Form requires password
- Error messages display clearly
- Successful login redirects to `/`
- Failed login shows error message
- Form is accessible (keyboard navigation, labels)

---

#### 1.2.7: Create AuthGuard Component

**File:** `/ui/operator-dashboard/components/Auth/AuthGuard.tsx`

**Implementation:**

- [ ] Check if user is authenticated
- [ ] Redirect to `/login` if not authenticated
- [ ] Show loading state while checking
- [ ] Allow children to render if authenticated

```typescript
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth guard for login page
    if (pathname === "/login") return;

    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [isAuthenticated, router, pathname]);

  // Don't show protected content on login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

#### 1.2.8: Wrap App with AuthGuard

**File:** `/ui/operator-dashboard/app/layout.tsx`

**Implementation:**

- [ ] Import AuthGuard
- [ ] Wrap children with AuthGuard
- [ ] Exclude login page from auth requirement

---

#### 1.2.9: Add Logout Functionality

**File:** `/ui/operator-dashboard/app/page.tsx` (header)

**Implementation:**

- [ ] Add logout button to header
- [ ] Call `useAuth().logout()` on click
- [ ] Redirect to `/login` after logout
- [ ] Show confirmation dialog

---

#### 1.2.10: Update Environment Variables

**File:** `/api/.env`

```bash
# Add JWT configuration
JWT_SECRET_KEY=your-secret-key-change-in-production-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480
```

**File:** `/ui/operator-dashboard/.env.local`

```bash
# No changes needed - API URL already configured
```

---

#### 1.2.11: Create Seed Script for Test Operators

**File:** `/api/seed_operators.py`

**Implementation:**

- [ ] Create script to generate test operator accounts
- [ ] Hash passwords with bcrypt
- [ ] Print credentials for testing

```python
import bcrypt

operators = [
    {"email": "jane.doe@spendsense.com", "name": "Jane Doe", "role": "senior", "password": "password123"},
    {"email": "john.smith@spendsense.com", "name": "John Smith", "role": "junior", "password": "password123"},
    {"email": "admin@spendsense.com", "name": "Admin User", "role": "admin", "password": "admin123"},
]

print("\n=== Test Operator Accounts ===\n")
for op in operators:
    hashed = bcrypt.hashpw(op["password"].encode(), bcrypt.gensalt())
    print(f"Email: {op['email']}")
    print(f"Password: {op['password']}")
    print(f"Role: {op['role']}")
    print(f"Hash: {hashed.decode()}")
    print()
```

---

### Task 1.2 Acceptance Criteria

- [x] Login page functional at `/login`
- [x] Valid credentials return JWT token
- [x] Invalid credentials show error
- [x] All protected routes require authentication
- [x] Unauthenticated users redirected to login
- [x] Token includes operator role
- [x] RBAC enforced (junior can't bulk approve)
- [x] Logout clears token and redirects
- [x] Token persists across page refreshes
- [x] Expired tokens handled gracefully

**STATUS: ✅ COMPLETED (November 5, 2025)**

**Implementation Notes:**

- Created complete JWT authentication system with bcrypt password hashing
- Implemented three roles: junior, senior, admin with proper RBAC
- Updated all API endpoints (recommendations, audit, users, alerts) to require authentication
- Created beautiful login page with SpendSense branding
- Implemented AuthGuard component for route protection
- Added logout functionality with dropdown menu in header
- JWT tokens stored in localStorage with automatic expiration handling
- Permission-based UI rendering (hide features user can't access)
- 401/403 error handling with automatic logout/redirect
- Test accounts: jane.doe@spendsense.com (senior), john.smith@spendsense.com (junior), admin@spendsense.com (admin)
- All passwords: password123 (admin: admin123)
- Created comprehensive documentation in `/Docs/JWT_AUTHENTICATION_IMPLEMENTATION.md`
- Created environment variables documentation in `/api/ENV_VARIABLES.md`
- Created seed script in `/api/seed_operators.py` for generating test operators

**Files Created:**

- Backend: `/api/auth.py`, `/api/seed_operators.py`, `/api/ENV_VARIABLES.md`
- Frontend: `/lib/auth.ts`, `/app/login/page.tsx`, `/components/Auth/AuthGuard.tsx`

**Files Modified:**

- Backend: `/api/main.py`, `/api/recommendations.py`, `/api/audit.py`, `/api/users.py`, `/api/alerts.py`
- Frontend: `/lib/api.ts`, `/app/layout.tsx`, `/app/page.tsx`

---

## Task 1.3: CSV Export

**Estimated Time:** 1 day  
**Priority:** P0  
**Dependencies:** Task 1.1 (Audit Logs Viewer)

### Context

Add CSV export functionality for audit logs, recommendations, and operator statistics for compliance reporting.

### Subtasks

#### 1.3.1: Create Export Utility Module

**File:** `/ui/operator-dashboard/lib/export.ts`

**Implementation:**

- [ ] Create `convertToCSV()` function
- [ ] Create `downloadFile()` function
- [ ] Create `exportAuditLogsToCsv()` function
- [ ] Create `exportRecommendationsToCsv()` function
- [ ] Create `exportStatsToCsv()` function
- [ ] Add timestamp to filename
- [ ] Handle large datasets (streaming if needed)

```typescript
export async function exportAuditLogsToCsv(filters: AuditLogFilters) {
  // Fetch all matching records (no pagination)
  const logs = await fetchAuditLogs({ ...filters, limit: 10000 });

  // Define columns
  const columns = [
    { key: "timestamp", label: "Timestamp" },
    { key: "operator_id", label: "Operator" },
    { key: "action", label: "Action" },
    { key: "recommendation_id", label: "Recommendation ID" },
    { key: "notes", label: "Notes" },
  ];

  const csv = convertToCSV(logs, columns);
  downloadFile(csv, `audit-logs-${Date.now()}.csv`, "text/csv");
}

function convertToCSV(
  data: any[],
  columns: { key: string; label: string }[]
): string {
  // Header row
  const header = columns.map((col) => col.label).join(",");

  // Data rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key] || "";
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(",")
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

---

#### 1.3.2: Add Export Button to Audit Logs Page

**File:** `/ui/operator-dashboard/components/AuditLogs/AuditLogFilters.tsx`

**Implementation:**

- [ ] Import export function
- [ ] Add "Export to CSV" button
- [ ] Add loading state during export
- [ ] Show success toast after export
- [ ] Add download icon

```tsx
import { exportAuditLogsToCsv } from "@/lib/export";
import { Download } from "lucide-react"; // or your icon library

<Button
  variant="outline"
  onClick={async () => {
    setExporting(true);
    try {
      await exportAuditLogsToCsv(currentFilters);
      toast.success("Audit logs exported successfully");
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  }}
  disabled={exporting}
>
  <Download className="mr-2 h-4 w-4" />
  {exporting ? "Exporting..." : "Export to CSV"}
</Button>;
```

---

#### 1.3.3: Add Export to Recommendations Page

**File:** `/ui/operator-dashboard/components/ReviewQueue/ReviewQueue.tsx`

**Implementation:**

- [ ] Add export button to review queue header
- [ ] Export current filtered recommendations
- [ ] Include all relevant fields
- [ ] Format dates properly in CSV

**Columns to Export:**

- Recommendation ID
- User ID
- Persona Primary
- Title
- Priority
- Status
- Generated At
- Approved/Rejected At
- Approved/Rejected By

---

#### 1.3.4: Add Export to Stats Overview (Optional)

**File:** `/ui/operator-dashboard/components/StatsOverview.tsx`

**Implementation:**

- [ ] Add small export button
- [ ] Export current stats as CSV
- [ ] Include timestamp

---

### Task 1.3 Acceptance Criteria

- [ ] Export button visible in Audit Logs page
- [ ] Clicking export downloads CSV file
- [ ] CSV file has correct headers
- [ ] CSV data matches filtered view
- [ ] Filename includes timestamp
- [ ] Special characters (commas, quotes) escaped properly
- [ ] Export handles 1000+ rows without freezing UI
- [ ] Success/error messages display
- [ ] Export works in Chrome, Firefox, Safari

---

## Task 1.4: Component Testing

**Estimated Time:** 3 days  
**Priority:** P0  
**Dependencies:** None

### Context

Current test coverage is ~15%. Need to increase to 80% for production readiness. Focus on critical components: ReviewQueue, UserExplorer, DecisionTraces.

### Subtasks

#### 1.4.1: Set Up Testing Infrastructure

**Files:** Already configured, verify setup

**Implementation:**

- [ ] Verify `jest.config.js` is correct
- [ ] Verify `jest.setup.js` includes testing-library setup
- [ ] Add test utilities file
- [ ] Create mock data helpers
- [ ] Set up SWR test wrapper

**File:** `/ui/operator-dashboard/__tests__/utils/test-utils.tsx`

```typescript
import React from "react";
import { render } from "@testing-library/react";
import { SWRConfig } from "swr";

// Custom render that includes providers
export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>{ui}</SWRConfig>
  );
}

// Re-export everything
export * from "@testing-library/react";
```

---

#### 1.4.2: Write ReviewQueue Component Tests

**File:** `/ui/operator-dashboard/__tests__/components/ReviewQueue.test.tsx`

**Implementation:**

- [ ] Test: Renders pending recommendations
- [ ] Test: Allows selecting recommendations
- [ ] Test: Shows bulk actions when items selected
- [ ] Test: Filters by persona
- [ ] Test: Filters by priority
- [ ] Test: Filters by status
- [ ] Test: Select all checkbox works
- [ ] Test: Empty state displays when no recommendations
- [ ] Test: Loading state displays while fetching
- [ ] Test: Error state displays on API failure

**Target Coverage:** 80%+

---

#### 1.4.3: Write RecommendationCard Component Tests

**File:** `/ui/operator-dashboard/__tests__/components/RecommendationCard.test.tsx`

**Implementation:**

- [ ] Test: Renders recommendation data correctly
- [ ] Test: Approve button calls API
- [ ] Test: Reject button prompts for reason
- [ ] Test: Reject with reason calls API
- [ ] Test: Flag button works
- [ ] Test: Modify mode toggles
- [ ] Test: Save modification calls API
- [ ] Test: Decision traces toggle works
- [ ] Test: Checkbox selection works
- [ ] Test: Guardrail status displays correctly

**Target Coverage:** 80%+

---

#### 1.4.4: Write BulkActions Component Tests

**File:** `/ui/operator-dashboard/__tests__/components/BulkActions.test.tsx`

**Implementation:**

- [ ] Test: Shows count of selected items
- [ ] Test: Bulk approve button shows confirmation modal
- [ ] Test: Confirming bulk approve calls API
- [ ] Test: Canceling bulk approve closes modal
- [ ] Test: Clear selection button works
- [ ] Test: Displays warning message in modal

---

#### 1.4.5: Write UserExplorer Component Tests

**File:** `/ui/operator-dashboard/__tests__/components/UserExplorer.test.tsx`

**Implementation:**

- [ ] Test: User search works
- [ ] Test: Displays user signals after search
- [ ] Test: Signal cards render correctly
- [ ] Test: Persona timeline displays
- [ ] Test: Empty state when no user selected
- [ ] Test: Error state on API failure

---

#### 1.4.6: Write SignalCard Component Tests

**File:** `/ui/operator-dashboard/__tests__/components/SignalCard.test.tsx`

**Implementation:**

- [ ] Test: Credit signals display correctly
- [ ] Test: Subscription signals display correctly
- [ ] Test: Savings signals display correctly
- [ ] Test: Income signals display correctly
- [ ] Test: Color coding works (red for high utilization, etc.)

---

#### 1.4.7: Write DecisionTraces Component Tests

**File:** `/ui/operator-dashboard/__tests__/components/DecisionTraces.test.tsx`

**Implementation:**

- [ ] Test: Renders trace timeline
- [ ] Test: All trace steps display
- [ ] Test: Step expansion works
- [ ] Test: Shows step details when expanded
- [ ] Test: Loading state displays
- [ ] Test: Error state displays

---

#### 1.4.8: Write AlertPanel Component Tests

**File:** `/ui/operator-dashboard/__tests__/components/AlertPanel.test.tsx`

**Status:** Already exists, verify and enhance

**Implementation:**

- [ ] Verify existing tests pass
- [ ] Add test: Multiple alerts display
- [ ] Add test: Alert dismiss works (if applicable)
- [ ] Add test: No alerts = no panel

---

#### 1.4.9: Write Hook Tests

**Files:**

- `/ui/operator-dashboard/__tests__/hooks/useRecommendations.test.ts`
- `/ui/operator-dashboard/__tests__/hooks/useUserSignals.test.ts`
- `/ui/operator-dashboard/__tests__/hooks/useOperatorStats.test.ts`
- `/ui/operator-dashboard/__tests__/hooks/useDecisionTrace.test.ts`

**Implementation:**

- [ ] Test: Data fetching success
- [ ] Test: Error handling
- [ ] Test: Loading states
- [ ] Test: Refetch/mutate works
- [ ] Test: SWR caching works

---

#### 1.4.10: Write API Client Tests

**File:** `/ui/operator-dashboard/__tests__/lib/api.test.ts`

**Implementation:**

- [ ] Test: fetchRecommendations with filters
- [ ] Test: approveRecommendation
- [ ] Test: rejectRecommendation
- [ ] Test: modifyRecommendation
- [ ] Test: flagRecommendation
- [ ] Test: bulkApproveRecommendations
- [ ] Test: Error handling (401, 403, 500)
- [ ] Test: Authorization header included

---

#### 1.4.11: Run Coverage Report

**Command:**

```bash
cd ui/operator-dashboard
npm run test:coverage
```

**Implementation:**

- [ ] Run coverage report
- [ ] Verify overall coverage >75%
- [ ] Verify component coverage >80%
- [ ] Identify gaps and write additional tests if needed

---

### Task 1.4 Acceptance Criteria

- [ ] Overall test coverage >75%
- [ ] Component test coverage >80%
- [ ] All critical user flows tested
- [ ] All tests pass in CI
- [ ] No flaky tests
- [ ] Test execution time <30 seconds
- [ ] Coverage report generated successfully

---

## Phase 2: Usability Enhancements

**Timeline:** 1 week  
**Priority:** P1  
**Goal:** Improve operator efficiency and error recovery

---

## Task 2.1: Undo Action System

**Estimated Time:** 2 days  
**Priority:** P1  
**Dependencies:** None

### Context

Allow operators to undo approve/reject/flag actions within 5 minutes to prevent mistakes.

### Subtasks

#### 2.1.1: Update Database Schema

**File:** `/api/schema.sql`

**Implementation:**

- [ ] Add `previous_status` column to recommendations table
- [ ] Add `status_changed_at` column to recommendations table
- [ ] Add `undo_window_expires_at` column to recommendations table
- [ ] Create migration script

```sql
-- Add undo support columns
ALTER TABLE recommendations ADD COLUMN previous_status TEXT;
ALTER TABLE recommendations ADD COLUMN status_changed_at TIMESTAMP;
ALTER TABLE recommendations ADD COLUMN undo_window_expires_at TIMESTAMP;
```

**Migration Script:** `/api/migrations/add_undo_support.py`

```python
import sqlite3
from datetime import datetime

def migrate():
    conn = sqlite3.connect("../spendsense.db")
    cursor = conn.cursor()

    # Add columns if they don't exist
    cursor.execute("PRAGMA table_info(recommendations)")
    columns = [col[1] for col in cursor.fetchall()]

    if "previous_status" not in columns:
        cursor.execute("ALTER TABLE recommendations ADD COLUMN previous_status TEXT")

    if "status_changed_at" not in columns:
        cursor.execute("ALTER TABLE recommendations ADD COLUMN status_changed_at TIMESTAMP")

    if "undo_window_expires_at" not in columns:
        cursor.execute("ALTER TABLE recommendations ADD COLUMN undo_window_expires_at TIMESTAMP")

    conn.commit()
    conn.close()
    print("Migration completed successfully")

if __name__ == "__main__":
    migrate()
```

---

#### 2.1.2: Update Backend Operator Actions

**File:** `/api/operator_actions.py`

**Implementation:**

- [ ] Modify `approve_recommendation()` to set previous_status and expiry
- [ ] Modify `reject_recommendation()` to set previous_status and expiry
- [ ] Modify `flag_for_review()` to set previous_status and expiry
- [ ] Create `undo_action()` method
- [ ] Add validation: can't undo if expired
- [ ] Add validation: can't undo if already delivered

```python
def approve_recommendation(self, operator_id: str, recommendation_id: str, notes: str = "") -> Dict[str, Any]:
    # ... existing validation ...

    now = datetime.now().isoformat()
    undo_expires = (datetime.now() + timedelta(minutes=5)).isoformat()

    cursor.execute("""
        UPDATE recommendations
        SET status = 'approved',
            previous_status = status,  -- Store current status
            approved_by = ?,
            approved_at = ?,
            operator_notes = ?,
            status_changed_at = ?,
            undo_window_expires_at = ?,
            updated_at = ?
        WHERE recommendation_id = ?
    """, (operator_id, now, notes, now, undo_expires, now, recommendation_id))

    # ... rest of logic
```

**Add undo_action method:**

```python
def undo_action(self, operator_id: str, recommendation_id: str) -> Dict[str, Any]:
    """
    Undo the last action on a recommendation within 5-minute window.
    """
    cursor = self.db.cursor()

    # Get current state
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
        'restored_status': previous_status
    }
```

---

#### 2.1.3: Create API Endpoint for Undo

**File:** `/api/recommendations.py`

**Implementation:**

- [ ] Add POST endpoint `/recommendations/{id}/undo`
- [ ] Call `operator_actions.undo_action()`
- [ ] Return updated recommendation

```python
@router.post("/recommendations/{id}/undo")
def undo_recommendation(
    id: str,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    """
    Undo the last action on a recommendation.

    Requirements:
    - Must be within 5 minutes of action
    - Recommendation must not be delivered
    """
    operator_id = operator["operator_id"]

    with db:
        actions = OperatorActions(db)
        result = actions.undo_action(operator_id, id)

    return result
```

---

#### 2.1.4: Add Frontend Undo Function

**File:** `/ui/operator-dashboard/lib/api.ts`

**Implementation:**

- [ ] Create `undoAction(id: string)` function
- [ ] Call POST `/api/operator/recommendations/{id}/undo`

```typescript
export async function undoAction(id: string): Promise<Recommendation> {
  return apiRequest(`/api/operator/recommendations/${id}/undo`, {
    method: "POST",
  });
}
```

---

#### 2.1.5: Add Undo UI to RecommendationCard

**File:** `/ui/operator-dashboard/components/ReviewQueue/RecommendationCard.tsx`

**Implementation:**

- [ ] Check if undo window is active
- [ ] Display countdown timer
- [ ] Show undo button
- [ ] Handle undo click
- [ ] Refresh card after undo

```typescript
const [showUndoButton, setShowUndoButton] = useState(false);
const [undoCountdown, setUndoCountdown] = useState<number | null>(null);

useEffect(() => {
  if (
    recommendation.status_changed_at &&
    recommendation.undo_window_expires_at
  ) {
    const expiresAt = new Date(recommendation.undo_window_expires_at);
    const now = new Date();

    if (now < expiresAt) {
      setShowUndoButton(true);

      // Update countdown every second
      const interval = setInterval(() => {
        const remaining = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
        if (remaining <= 0) {
          setShowUndoButton(false);
          clearInterval(interval);
        } else {
          setUndoCountdown(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }
}, [recommendation]);

const handleUndo = async () => {
  if (!confirm("Undo this action? This will restore the previous status."))
    return;

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

### Task 2.1 Acceptance Criteria

- [ ] Database columns added successfully
- [ ] Backend undo method works
- [ ] Undo endpoint returns correct data
- [ ] Frontend displays undo button for 5 minutes
- [ ] Countdown timer updates every second
- [ ] Undo button disappears after 5 minutes
- [ ] Clicking undo restores previous status
- [ ] Cannot undo after delivery
- [ ] Cannot undo after 5 minutes
- [ ] Undo action logged in audit log
- [ ] Toast notifications display

---

## Task 2.2: Performance Monitoring

**Estimated Time:** 2 days  
**Priority:** P1  
**Dependencies:** None

### Context

Add performance monitoring to track page load times, API response times, and component render times for optimization.

### Subtasks

#### 2.2.1: Create Performance Monitoring Hook

**File:** `/ui/operator-dashboard/hooks/usePerformanceMonitoring.ts`

**Implementation:**

- [ ] Track component mount/unmount time
- [ ] Log performance to console (dev) or analytics (prod)
- [ ] Measure time in milliseconds

```typescript
import { useEffect, useRef } from "react";

export function usePerformanceMonitoring(componentName: string) {
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      const duration = performance.now() - startTimeRef.current;

      // Log performance
      logPerformance({
        component: componentName,
        duration,
        timestamp: new Date().toISOString(),
      });

      // Warn if slow (>1000ms)
      if (duration > 1000) {
        console.warn(
          `[Performance] ${componentName} took ${duration.toFixed(
            2
          )}ms to render`
        );
      }
    };
  }, [componentName]);
}

function logPerformance(data: {
  component: string;
  duration: number;
  timestamp: string;
}) {
  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Performance] ${data.component}: ${data.duration.toFixed(2)}ms`
    );
  }

  // In production, send to analytics service
  // TODO: Integrate with analytics service (e.g., Google Analytics, Mixpanel)
}
```

---

#### 2.2.2: Add Performance Monitoring to Key Components

**Files:**

- `/ui/operator-dashboard/components/ReviewQueue/ReviewQueue.tsx`
- `/ui/operator-dashboard/components/UserExplorer/UserExplorer.tsx`
- `/ui/operator-dashboard/components/DecisionTraces/DecisionTraces.tsx`
- `/ui/operator-dashboard/app/page.tsx`

**Implementation:**

- [ ] Import usePerformanceMonitoring
- [ ] Call hook with component name
- [ ] Verify performance logs in console

```typescript
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";

export function ReviewQueue() {
  usePerformanceMonitoring("ReviewQueue");

  // ... rest of component
}
```

---

#### 2.2.3: Add Backend Performance Middleware

**File:** `/api/main.py`

**Implementation:**

- [ ] Enhance existing request logging middleware
- [ ] Track request duration
- [ ] Log slow requests (>1 second)
- [ ] Add X-Process-Time header to response

```python
@app.middleware("http")
async def performance_middleware(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    duration = time.time() - start_time

    # Add header
    response.headers["X-Process-Time"] = f"{duration:.3f}"

    # Log slow requests
    if duration > 1.0:
        logger.warning(
            f"Slow request: {request.method} {request.url.path} took {duration:.2f}s"
        )

    return response
```

---

#### 2.2.4: Create Performance Metrics Table (Optional)

**File:** `/api/schema.sql`

**Implementation:**

- [ ] Create performance_metrics table
- [ ] Store API endpoint performance data
- [ ] Create indexes for querying

```sql
CREATE TABLE IF NOT EXISTS performance_metrics (
    metric_id TEXT PRIMARY KEY,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    duration_seconds REAL NOT NULL,
    status_code INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_performance_endpoint ON performance_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance_metrics(timestamp DESC);
```

---

#### 2.2.5: Create Performance Dashboard Section (Optional)

**File:** `/ui/operator-dashboard/app/analytics/page.tsx` (if created in Phase 3)

**Implementation:**

- [ ] Add performance charts section
- [ ] Chart: API response times over time
- [ ] Chart: Slowest endpoints
- [ ] Chart: Page load times
- [ ] Display current averages

---

### Task 2.2 Acceptance Criteria

- [ ] Performance monitoring hook created
- [ ] Key components monitored
- [ ] Performance logs visible in console
- [ ] Slow components identified (>1s)
- [ ] Backend logs slow requests
- [ ] X-Process-Time header present in responses
- [ ] No performance overhead from monitoring itself

---

## Task 2.3: Enhanced Operator Notes

**Estimated Time:** 1 day  
**Priority:** P1  
**Dependencies:** None

### Context

Make operator notes persistent and editable so operators can collaborate and document decisions.

### Subtasks

#### 2.3.1: Create Database Table

**File:** `/api/schema.sql`

**Implementation:**

- [ ] Create recommendation_notes table
- [ ] Add foreign key to recommendations
- [ ] Create indexes

```sql
CREATE TABLE IF NOT EXISTS recommendation_notes (
    note_id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL,
    operator_id TEXT NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

CREATE INDEX IF NOT EXISTS idx_notes_recommendation ON recommendation_notes(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON recommendation_notes(created_at DESC);
```

---

#### 2.3.2: Create Backend API Endpoints

**File:** `/api/notes.py` (new router)

**Implementation:**

- [ ] GET `/recommendations/{id}/notes` - List notes
- [ ] POST `/recommendations/{id}/notes` - Add note
- [ ] PATCH `/notes/{note_id}` - Update note
- [ ] DELETE `/notes/{note_id}` - Delete note

```python
from fastapi import APIRouter, Depends, HTTPException
import sqlite3
from datetime import datetime

router = APIRouter()

@router.get("/recommendations/{id}/notes")
def get_notes(
    id: str,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("""
        SELECT * FROM recommendation_notes
        WHERE recommendation_id = ?
        ORDER BY created_at DESC
    """, (id,))

    notes = cursor.fetchall()
    return [dict(note) for note in notes]

@router.post("/recommendations/{id}/notes")
def add_note(
    id: str,
    note_text: str,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    note_id = f"note_{id}_{int(datetime.now().timestamp())}"
    now = datetime.now().isoformat()
    operator_id = operator["operator_id"]

    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO recommendation_notes
        (note_id, recommendation_id, operator_id, note_text, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (note_id, id, operator_id, note_text, now))

    db.commit()

    return {"note_id": note_id, "created_at": now}

@router.patch("/notes/{note_id}")
def update_note(
    note_id: str,
    note_text: str,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    now = datetime.now().isoformat()

    cursor = db.cursor()
    cursor.execute("""
        UPDATE recommendation_notes
        SET note_text = ?, updated_at = ?
        WHERE note_id = ?
    """, (note_text, now, note_id))

    db.commit()
    return {"updated_at": now}

@router.delete("/notes/{note_id}")
def delete_note(
    note_id: str,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("DELETE FROM recommendation_notes WHERE note_id = ?", (note_id,))
    db.commit()
    return {"deleted": True}
```

---

#### 2.3.3: Register Notes Router

**File:** `/api/main.py`

**Implementation:**

- [ ] Import notes router
- [ ] Register with app

```python
from notes import router as notes_router

app.include_router(
    notes_router,
    prefix="/api/operator",
    tags=["Notes"]
)
```

---

#### 2.3.4: Create Frontend Notes Component

**File:** `/ui/operator-dashboard/components/ReviewQueue/NotesPanel.tsx`

**Implementation:**

- [ ] List existing notes
- [ ] Add new note form
- [ ] Edit note inline
- [ ] Delete note with confirmation
- [ ] Show operator name and timestamp

```typescript
export function NotesPanel({ recommendationId }: { recommendationId: string }) {
  const { data: notes, mutate } = useNotes(recommendationId);
  const [newNoteText, setNewNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;

    await addNote(recommendationId, newNoteText);
    setNewNoteText("");
    mutate();
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Operator Notes</h4>

      {/* Existing Notes */}
      <div className="space-y-2">
        {notes?.map((note) => (
          <div key={note.note_id} className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-500">
                  {note.operator_id} • {formatDateTime(note.created_at)}
                  {note.updated_at && " (edited)"}
                </div>
                <div className="text-sm mt-1">{note.note_text}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingNoteId(note.note_id)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(note.note_id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Note Form */}
      <div>
        <textarea
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Add a note..."
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
        />
        <Button onClick={handleAddNote} className="mt-2">
          Add Note
        </Button>
      </div>
    </div>
  );
}
```

---

#### 2.3.5: Add Notes Panel to RecommendationCard

**File:** `/ui/operator-dashboard/components/ReviewQueue/RecommendationCard.tsx`

**Implementation:**

- [ ] Import NotesPanel
- [ ] Add collapsible section for notes
- [ ] Display note count badge

---

### Task 2.3 Acceptance Criteria

- [ ] Database table created
- [ ] API endpoints work
- [ ] Notes display in UI
- [ ] Can add new notes
- [ ] Can edit notes
- [ ] Can delete notes (with confirmation)
- [ ] Notes persist across page refreshes
- [ ] Operator name shown on each note
- [ ] Timestamps formatted correctly

---

## Phase 3: Advanced Features

**Timeline:** 2 weeks  
**Priority:** P2  
**Goal:** Advanced capabilities for power users

---

## Task 3.1: Real-time Updates (SSE)

**Estimated Time:** 3 days  
**Priority:** P2  
**Dependencies:** None

### Context

Implement Server-Sent Events (SSE) for real-time dashboard updates when recommendations or actions change.

### Subtasks

#### 3.1.1: Create Backend SSE Module

**File:** `/api/realtime.py`

**Implementation:**

- [ ] Create SSE endpoint
- [ ] Manage active connections
- [ ] Broadcast updates to all clients
- [ ] Handle client disconnections

```python
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json
from datetime import datetime

router = APIRouter()

# Store active connections
active_connections: set = set()

@router.get("/realtime/updates")
async def realtime_updates():
    """
    Server-Sent Events endpoint for real-time dashboard updates.
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
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
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
        try:
            await queue.put(event)
        except:
            # Queue closed, will be cleaned up
            pass
```

---

#### 3.1.2: Integrate Broadcasts into Operator Actions

**File:** `/api/operator_actions.py`

**Implementation:**

- [ ] Import broadcast_update
- [ ] Call broadcast after approve
- [ ] Call broadcast after reject
- [ ] Call broadcast after modify
- [ ] Call broadcast after flag

```python
from realtime import broadcast_update
import asyncio

def approve_recommendation(self, operator_id: str, recommendation_id: str, notes: str = "") -> Dict[str, Any]:
    # ... existing logic ...

    # Broadcast update
    asyncio.create_task(broadcast_update("recommendation_approved", {
        "recommendation_id": recommendation_id,
        "operator_id": operator_id,
        "timestamp": datetime.now().isoformat()
    }))

    return result
```

---

#### 3.1.3: Register Realtime Router

**File:** `/api/main.py`

**Implementation:**

- [ ] Import realtime router
- [ ] Register with app

```python
from realtime import router as realtime_router

app.include_router(
    realtime_router,
    prefix="/api",
    tags=["Realtime"]
)
```

---

#### 3.1.4: Create Frontend Real-time Hook

**File:** `/ui/operator-dashboard/hooks/useRealtimeUpdates.ts`

**Implementation:**

- [ ] Connect to SSE endpoint
- [ ] Parse incoming events
- [ ] Trigger SWR mutations to refresh data
- [ ] Handle reconnection
- [ ] Skip in mock data mode

```typescript
import { useEffect } from "react";
import { useRecommendations } from "./useRecommendations";
import { useOperatorStats } from "./useOperatorStats";
import { useAlerts } from "./useAlerts";
import { toast } from "react-hot-toast";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useRealtimeUpdates() {
  const { mutate: mutateRecommendations } = useRecommendations();
  const { mutate: mutateStats } = useOperatorStats();
  const { mutate: mutateAlerts } = useAlerts();

  useEffect(() => {
    if (USE_MOCK_DATA) return; // Skip in mock mode

    // Connect to SSE endpoint
    const eventSource = new EventSource(`${API_URL}/api/realtime/updates`);

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);

      switch (update.type) {
        case "recommendation_approved":
        case "recommendation_rejected":
        case "recommendation_modified":
        case "recommendation_flagged":
          // Refresh recommendations and stats
          mutateRecommendations();
          mutateStats();
          toast.info(
            `Recommendation ${update.type.replace("recommendation_", "")} by ${
              update.data.operator_id
            }`
          );
          break;

        case "alert_triggered":
          mutateAlerts();
          toast.warning("New alert triggered");
          break;

        case "stats_updated":
          mutateStats();
          break;
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      // EventSource will automatically reconnect
    };

    return () => {
      eventSource.close();
    };
  }, []);
}
```

---

#### 3.1.5: Enable Real-time Updates in Dashboard

**File:** `/ui/operator-dashboard/app/page.tsx`

**Implementation:**

- [ ] Import useRealtimeUpdates
- [ ] Call hook in main dashboard component
- [ ] Add indicator showing "Live" status

```typescript
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

export default function OperatorDashboard() {
  useRealtimeUpdates();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header>
        {/* ... existing header ... */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
            Live
          </span>
        </div>
      </header>

      {/* ... rest of dashboard ... */}
    </div>
  );
}
```

---

### Task 3.1 Acceptance Criteria

- [ ] SSE endpoint functional
- [ ] Multiple clients can connect
- [ ] Events broadcast to all connected clients
- [ ] Dashboard refreshes when updates received
- [ ] Toast notifications show for actions
- [ ] Automatic reconnection works
- [ ] No performance issues with 10+ concurrent connections
- [ ] "Live" indicator shows connection status

---

## Task 3.2: Tag System

**Estimated Time:** 2 days  
**Priority:** P2  
**Dependencies:** None

### Context

Add tagging system to categorize recommendations (e.g., "needs_review", "edge_case", "training_example").

### Subtasks

#### 3.2.1: Create Database Table

**File:** `/api/schema.sql`

**Implementation:**

- [ ] Create recommendation_tags table
- [ ] Add foreign key to recommendations
- [ ] Create indexes

```sql
CREATE TABLE IF NOT EXISTS recommendation_tags (
    tag_id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL,
    tag_name TEXT NOT NULL,
    tagged_by TEXT NOT NULL,
    tagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

CREATE INDEX IF NOT EXISTS idx_tags_recommendation ON recommendation_tags(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON recommendation_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_tags_tagged_at ON recommendation_tags(tagged_at DESC);
```

**Predefined Tags:**

- `needs_review`
- `edge_case`
- `training_example`
- `policy_question`
- `tone_concern`
- `eligibility_question`
- `llm_error`
- `great_example`

---

#### 3.2.2: Create Backend API Endpoints

**File:** `/api/tags.py` (new router)

**Implementation:**

- [ ] GET `/recommendations/{id}/tags` - List tags
- [ ] POST `/recommendations/{id}/tags` - Add tag
- [ ] DELETE `/tags/{tag_id}` - Remove tag
- [ ] GET `/tags/available` - List predefined tags

```python
from fastapi import APIRouter, Depends
import sqlite3
from datetime import datetime

router = APIRouter()

PREDEFINED_TAGS = [
    "needs_review",
    "edge_case",
    "training_example",
    "policy_question",
    "tone_concern",
    "eligibility_question",
    "llm_error",
    "great_example",
]

@router.get("/tags/available")
def get_available_tags():
    return {"tags": PREDEFINED_TAGS}

@router.get("/recommendations/{id}/tags")
def get_tags(
    id: str,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("""
        SELECT * FROM recommendation_tags
        WHERE recommendation_id = ?
        ORDER BY tagged_at DESC
    """, (id,))

    tags = cursor.fetchall()
    return [dict(tag) for tag in tags]

@router.post("/recommendations/{id}/tags")
def add_tag(
    id: str,
    tag_name: str,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    # Validate tag name
    if tag_name not in PREDEFINED_TAGS:
        raise HTTPException(400, f"Invalid tag. Must be one of: {', '.join(PREDEFINED_TAGS)}")

    tag_id = f"tag_{id}_{tag_name}_{int(datetime.now().timestamp())}"
    now = datetime.now().isoformat()
    operator_id = operator["operator_id"]

    cursor = db.cursor()

    # Check if tag already exists
    cursor.execute("""
        SELECT tag_id FROM recommendation_tags
        WHERE recommendation_id = ? AND tag_name = ?
    """, (id, tag_name))

    if cursor.fetchone():
        raise HTTPException(400, "Tag already exists")

    # Add tag
    cursor.execute("""
        INSERT INTO recommendation_tags
        (tag_id, recommendation_id, tag_name, tagged_by, tagged_at)
        VALUES (?, ?, ?, ?, ?)
    """, (tag_id, id, tag_name, operator_id, now))

    db.commit()

    return {"tag_id": tag_id, "tagged_at": now}

@router.delete("/tags/{tag_id}")
def delete_tag(
    tag_id: str,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("DELETE FROM recommendation_tags WHERE tag_id = ?", (tag_id,))
    db.commit()
    return {"deleted": True}
```

---

#### 3.2.3: Register Tags Router

**File:** `/api/main.py`

**Implementation:**

- [ ] Import tags router
- [ ] Register with app

---

#### 3.2.4: Create Frontend Tags Component

**File:** `/ui/operator-dashboard/components/ReviewQueue/TagsPanel.tsx`

**Implementation:**

- [ ] Display existing tags as badges
- [ ] Add tag dropdown/button
- [ ] Remove tag with confirmation
- [ ] Fetch available tags from API

```typescript
export function TagsPanel({ recommendationId }: { recommendationId: string }) {
  const { data: tags, mutate } = useTags(recommendationId);
  const { data: availableTags } = useAvailableTags();
  const [showAddTag, setShowAddTag] = useState(false);

  const handleAddTag = async (tagName: string) => {
    await addTag(recommendationId, tagName);
    setShowAddTag(false);
    mutate();
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!confirm("Remove this tag?")) return;
    await deleteTag(tagId);
    mutate();
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tags</label>

      <div className="flex flex-wrap gap-2">
        {tags?.map((tag) => (
          <Badge key={tag.tag_id} variant="secondary" className="gap-1">
            {tag.tag_name.replace(/_/g, " ")}
            <button
              onClick={() => handleRemoveTag(tag.tag_id)}
              className="ml-1 hover:text-red-600"
            >
              ×
            </button>
          </Badge>
        ))}

        {showAddTag ? (
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddTag(e.target.value);
              }
            }}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="">Select tag...</option>
            {availableTags?.tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setShowAddTag(true)}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            + Add tag
          </button>
        )}
      </div>
    </div>
  );
}
```

---

#### 3.2.5: Add Tags to RecommendationCard

**File:** `/ui/operator-dashboard/components/ReviewQueue/RecommendationCard.tsx`

**Implementation:**

- [ ] Import TagsPanel
- [ ] Display in card
- [ ] Show tag count in header

---

#### 3.2.6: Add Tag Filter to Review Queue

**File:** `/ui/operator-dashboard/components/ReviewQueue/FilterPanel.tsx`

**Implementation:**

- [ ] Add tag filter dropdown
- [ ] Update API call to filter by tag
- [ ] Update backend to support tag filtering

---

### Task 3.2 Acceptance Criteria

- [ ] Database table created
- [ ] API endpoints work
- [ ] Tags display as badges
- [ ] Can add tags from predefined list
- [ ] Can remove tags
- [ ] Cannot add duplicate tags
- [ ] Tag filter works in review queue
- [ ] Tags persist across refreshes

---

## Task 3.3: Analytics Dashboard

**Estimated Time:** 3 days  
**Priority:** P2  
**Dependencies:** None

### Context

Create dedicated analytics page showing operator performance, recommendation trends, and system health.

### Subtasks

#### 3.3.1: Create Analytics Page Route

**File:** `/ui/operator-dashboard/app/analytics/page.tsx`

**Implementation:**

- [ ] Create page component
- [ ] Add date range selector
- [ ] Add key metric cards
- [ ] Add charts section
- [ ] Add tables section

---

#### 3.3.2: Create Backend Analytics Endpoint

**File:** `/api/analytics.py`

**Implementation:**

- [ ] Create analytics router
- [ ] GET `/analytics` endpoint
- [ ] Calculate metrics from audit logs and recommendations
- [ ] Support date range filtering

```python
from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta
import sqlite3

router = APIRouter()

@router.get("/analytics")
def get_analytics(
    start_date: str = None,
    end_date: str = None,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
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
    total_actions = cursor.fetchone()["total"]

    # Actions by type
    cursor.execute("""
        SELECT action, COUNT(*) as count
        FROM operator_audit_log
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY action
    """, (start_date, end_date))
    actions_by_type = [dict(row) for row in cursor.fetchall()]

    # Approval rate
    cursor.execute("""
        SELECT
            SUM(CASE WHEN action = 'approve' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as approval_rate
        FROM operator_audit_log
        WHERE action IN ('approve', 'reject')
          AND timestamp BETWEEN ? AND ?
    """, (start_date, end_date))
    approval_rate = cursor.fetchone()["approval_rate"] or 0

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
    actions_timeline = [dict(row) for row in cursor.fetchall()]

    # Operator activity
    cursor.execute("""
        SELECT
            operator_id,
            COUNT(*) as actions,
            SUM(CASE WHEN action = 'approve' THEN 1 ELSE 0 END) as approvals,
            SUM(CASE WHEN action = 'reject' THEN 1 ELSE 0 END) as rejections
        FROM operator_audit_log
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY operator_id
        ORDER BY actions DESC
    """, (start_date, end_date))
    operator_activity = [dict(row) for row in cursor.fetchall()]

    # Approval rate by persona
    cursor.execute("""
        SELECT
            r.persona_primary,
            COUNT(*) as total,
            SUM(CASE WHEN r.status = 'approved' THEN 1 ELSE 0 END) as approved
        FROM recommendations r
        WHERE r.generated_at BETWEEN ? AND ?
          AND r.status IN ('approved', 'rejected')
        GROUP BY r.persona_primary
    """, (start_date, end_date))
    approval_by_persona = [dict(row) for row in cursor.fetchall()]

    # Current queue size
    cursor.execute("SELECT COUNT(*) as count FROM recommendations WHERE status = 'pending'")
    queue_size = cursor.fetchone()["count"]

    return {
        "total_actions": total_actions,
        "approval_rate": round(approval_rate, 2),
        "actions_by_type": actions_by_type,
        "actions_timeline": actions_timeline,
        "operator_activity": operator_activity,
        "approval_by_persona": approval_by_persona,
        "queue_size": queue_size,
    }
```

---

#### 3.3.3: Register Analytics Router

**File:** `/api/main.py`

**Implementation:**

- [ ] Import analytics router
- [ ] Register with app

---

#### 3.3.4: Create Analytics Hook

**File:** `/ui/operator-dashboard/hooks/useAnalytics.ts`

**Implementation:**

- [ ] Create SWR hook
- [ ] Accept date range parameters
- [ ] Fetch from `/api/operator/analytics`

---

#### 3.3.5: Create Metric Card Component

**File:** `/ui/operator-dashboard/components/Analytics/MetricCard.tsx`

**Implementation:**

- [ ] Display metric label and value
- [ ] Show trend indicator (optional)
- [ ] Add icon (optional)

---

#### 3.3.6: Create Chart Components

**Files:**

- `/ui/operator-dashboard/components/Analytics/ActionsOverTimeChart.tsx`
- `/ui/operator-dashboard/components/Analytics/ActionsByTypeChart.tsx`
- `/ui/operator-dashboard/components/Analytics/ApprovalByPersonaChart.tsx`
- `/ui/operator-dashboard/components/Analytics/OperatorActivityChart.tsx`

**Implementation:**

- [ ] Use Recharts library
- [ ] Create line chart for actions over time
- [ ] Create pie chart for actions by type
- [ ] Create bar chart for approval by persona
- [ ] Create bar chart for operator activity

---

#### 3.3.7: Add Navigation Link

**File:** `/ui/operator-dashboard/app/page.tsx` or main layout

**Implementation:**

- [ ] Add "Analytics" link to navigation
- [ ] Add icon

---

### Task 3.3 Acceptance Criteria

- [ ] Analytics page accessible at `/analytics`
- [ ] Date range selector works
- [ ] Metric cards display correct values
- [ ] All charts render without errors
- [ ] Charts update when date range changes
- [ ] Page loads in <3 seconds
- [ ] Charts are responsive
- [ ] No console errors

---

## Documentation Updates

**Priority:** P1  
**Timeline:** Ongoing throughout implementation

### Task: Update README.md

**File:** `/ui/operator-dashboard/README.md`

**Implementation:**

- [ ] Replace default Next.js content
- [ ] Add project overview
- [ ] Document features
- [ ] Add setup instructions
- [ ] Document environment variables
- [ ] Add usage examples
- [ ] Document keyboard shortcuts
- [ ] Add troubleshooting section
- [ ] Add screenshots (optional)

**Structure:**

```markdown
# SpendSense Operator Dashboard

## Overview

[Description of the dashboard]

## Features

- Review Queue
- User Explorer
- Decision Traces
- Audit Logs
- Analytics
- Real-time Updates

## Getting Started

[Setup instructions]

## Environment Variables

[List all variables]

## Usage

[How to use key features]

## Keyboard Shortcuts

[List shortcuts]

## Testing

[How to run tests]

## Deployment

[Production deployment steps]

## Troubleshooting

[Common issues and solutions]
```

---

## Testing & Validation

**Priority:** P0  
**Timeline:** End of each phase

### Final Validation Checklist

#### Phase 1 Validation

- [ ] All audit logs features working
- [ ] JWT authentication functional
- [ ] CSV export working
- [ ] Test coverage >75%
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance acceptable (<2s page loads)

#### Phase 2 Validation

- [ ] Undo action working correctly
- [ ] Performance monitoring in place
- [ ] Enhanced notes working
- [ ] All Phase 1 features still working
- [ ] No regressions

#### Phase 3 Validation

- [ ] Real-time updates working
- [ ] Tag system functional
- [ ] Analytics dashboard complete
- [ ] All previous features working
- [ ] No performance degradation

#### Final Production Readiness

- [ ] All acceptance criteria met
- [ ] Documentation complete
- [ ] README updated
- [ ] All environment variables documented
- [ ] Backend tests passing
- [ ] Frontend tests passing
- [ ] No console errors
- [ ] No linter errors
- [ ] Performance targets met
- [ ] Security review passed (JWT, RBAC)
- [ ] Ready for deployment

---

## Summary

This task list covers **all remaining work** to complete the Operator Dashboard to 100% of PRD specifications.

**Total Tasks:** 33 major tasks with 100+ subtasks  
**Total Time:** 5 weeks (25 business days)  
**Current Completion:** 85%  
**Target Completion:** 100%

**Phases:**

1. **Phase 1 (P0):** Production Readiness - 2 weeks
2. **Phase 2 (P1):** Usability Enhancements - 1 week
3. **Phase 3 (P2):** Advanced Features - 2 weeks

**Next Steps:**

1. Review and approve this task list
2. Create GitHub issues/tickets for each task
3. Begin Phase 1 implementation
4. Track progress using checklist items
5. Run validation at end of each phase
6. Deploy to production after Phase 1 complete
7. Continue with Phases 2 and 3

---

**Questions or need clarification?** Contact Bryce Harris - bharris@peak6.com
