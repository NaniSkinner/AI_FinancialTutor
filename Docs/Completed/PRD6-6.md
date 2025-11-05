# SHARD 6: Backend & Operator Actions

**Project:** SpendSense Operator Dashboard  
**Purpose:** Backend API implementation for all operator actions and data management  
**Phase:** Backend Implementation  
**Estimated Size:** ~20% of total implementation  
**Dependencies:** Shard 1 (Foundation)

---

## Overview

This shard implements the Python backend API that powers the Operator Dashboard. It includes all operator actions (approve, reject, modify, flag), data schemas, audit logging, and API endpoints.

---

## Technology Stack

- **API Framework**: FastAPI (recommended) or Flask
- **Database**: SQLite (dev), PostgreSQL (production)
- **ORM**: SQLAlchemy (optional, or raw SQL)
- **Authentication**: JWT tokens (simple for prototype)

---

## Project Structure

```
/api
├── main.py                      # FastAPI app entry point
├── models.py                    # Database models
├── schemas.py                   # Pydantic schemas
├── database.py                  # Database connection
├── operator_actions.py          # Core operator logic
├── recommendations.py           # Recommendation endpoints
├── users.py                     # User signal endpoints
├── audit.py                     # Audit logging
└── requirements.txt             # Python dependencies
```

---

## Database Schema

### Recommendations Table

```sql
CREATE TABLE recommendations (
    recommendation_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    persona_primary TEXT NOT NULL,
    persona_secondary TEXT,
    type TEXT NOT NULL,                    -- 'article', 'video', 'tool', 'quiz'
    title TEXT NOT NULL,
    rationale TEXT NOT NULL,
    priority TEXT NOT NULL,                -- 'high', 'medium', 'low'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'flagged'
    content_url TEXT,
    read_time_minutes INTEGER,

    -- Guardrails
    tone_check BOOLEAN NOT NULL,
    advice_check BOOLEAN NOT NULL,
    eligibility_check BOOLEAN NOT NULL,
    guardrails_passed BOOLEAN NOT NULL,

    -- Operator actions
    approved_by TEXT,
    approved_at TIMESTAMP,
    rejected_by TEXT,
    rejected_at TIMESTAMP,
    modified_by TEXT,
    modified_at TIMESTAMP,
    operator_notes TEXT,

    -- Timestamps
    generated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexes
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);
CREATE INDEX idx_recommendations_persona ON recommendations(persona_primary);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at DESC);
```

### Operator Audit Log Table

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
CREATE INDEX idx_audit_timestamp ON operator_audit_log(timestamp DESC);
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
```

### Decision Traces Table

```sql
CREATE TABLE decision_traces (
    trace_id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL UNIQUE,

    -- Timestamps for each step
    signals_detected_at TIMESTAMP NOT NULL,
    persona_assigned_at TIMESTAMP NOT NULL,
    content_matched_at TIMESTAMP NOT NULL,
    rationale_generated_at TIMESTAMP NOT NULL,
    guardrails_checked_at TIMESTAMP NOT NULL,

    -- Signal data
    signals_json JSON NOT NULL,

    -- Persona assignment
    persona_assignment_json JSON NOT NULL,

    -- Content matching
    content_matches_json JSON NOT NULL,
    relevance_scores_json JSON NOT NULL,

    -- LLM details
    llm_model TEXT NOT NULL,
    temperature REAL NOT NULL,
    tokens_used INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

CREATE INDEX idx_traces_recommendation ON decision_traces(recommendation_id);
```

---

## FastAPI Implementation

### Main Application

Create `/api/main.py`:

```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import uvicorn

from database import get_db
from operator_actions import OperatorActions
import schemas

app = FastAPI(title="SpendSense Operator Dashboard API")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "SpendSense Operator Dashboard API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Import routers
from recommendations import router as recommendations_router
from users import router as users_router
from audit import router as audit_router

app.include_router(recommendations_router, prefix="/api/operator")
app.include_router(users_router, prefix="/api/operator")
app.include_router(audit_router, prefix="/api/operator")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

---

### Database Connection

Create `/api/database.py`:

```python
import sqlite3
from contextlib import contextmanager
import os

DATABASE_URL = os.getenv("DATABASE_URL", "spendsense_operator.db")

def get_db_connection():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

@contextmanager
def get_db():
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_database():
    """Initialize database with schema"""
    with get_db() as conn:
        # Read and execute schema.sql
        with open("schema.sql", "r") as f:
            conn.executescript(f.read())
```

---

### Pydantic Schemas

Create `/api/schemas.py`:

```python
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class GuardrailChecks(BaseModel):
    tone_check: bool
    advice_check: bool
    eligibility_check: bool

class Recommendation(BaseModel):
    id: str
    user_id: str
    persona_primary: str
    persona_secondary: Optional[str] = None
    type: str
    title: str
    rationale: str
    priority: str
    status: str
    content_url: Optional[str] = None
    read_time_minutes: Optional[int] = None
    guardrails_passed: GuardrailChecks
    generated_at: str
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    operator_notes: Optional[str] = None

class ApproveRequest(BaseModel):
    notes: str = ""

class RejectRequest(BaseModel):
    reason: str

class ModifyRequest(BaseModel):
    rationale: Optional[str] = None
    priority: Optional[str] = None
    title: Optional[str] = None

class FlagRequest(BaseModel):
    reason: str

class BulkApproveRequest(BaseModel):
    recommendation_ids: List[str]
    notes: str = ""

class BulkApproveResponse(BaseModel):
    total: int
    approved: int
    failed: int
    approved_ids: List[str]
    failed_items: List[Dict[str, str]]

class OperatorStats(BaseModel):
    pending: int
    approved_today: int
    rejected_today: int
    flagged: int
    avg_review_time_seconds: float
```

---

### Operator Actions Logic

Create `/api/operator_actions.py`:

```python
from datetime import datetime
from typing import Dict, List, Optional
import json
import sqlite3

class OperatorActions:
    def __init__(self, db_connection: sqlite3.Connection):
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
        cursor = self.db.cursor()

        # Update recommendation status
        cursor.execute("""
            UPDATE recommendations
            SET status = 'approved',
                approved_by = ?,
                approved_at = ?,
                operator_notes = ?,
                updated_at = ?
            WHERE recommendation_id = ?
        """, (
            operator_id,
            datetime.now().isoformat(),
            notes,
            datetime.now().isoformat(),
            recommendation_id
        ))

        # Log action
        self._log_operator_action(
            operator_id,
            'approve',
            recommendation_id,
            {'notes': notes}
        )

        # Queue for delivery (placeholder)
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
        cursor = self.db.cursor()

        cursor.execute("""
            UPDATE recommendations
            SET status = 'rejected',
                rejected_by = ?,
                rejected_at = ?,
                operator_notes = ?,
                updated_at = ?
            WHERE recommendation_id = ?
        """, (
            operator_id,
            datetime.now().isoformat(),
            reason,
            datetime.now().isoformat(),
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
        cursor = self.db.cursor()
        allowed_fields = ['rationale', 'priority', 'title']

        for field, new_value in modifications.items():
            if field not in allowed_fields:
                continue

            cursor.execute(f"""
                UPDATE recommendations
                SET {field} = ?,
                    modified_by = ?,
                    modified_at = ?,
                    updated_at = ?
                WHERE recommendation_id = ?
            """, (
                new_value,
                operator_id,
                datetime.now().isoformat(),
                datetime.now().isoformat(),
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
        cursor = self.db.cursor()
        flag_id = f"flag_{recommendation_id}_{int(datetime.now().timestamp())}"

        cursor.execute("""
            INSERT INTO recommendation_flags
            (flag_id, recommendation_id, flagged_by, flag_reason, flagged_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            flag_id,
            recommendation_id,
            operator_id,
            flag_reason,
            datetime.now().isoformat()
        ))

        # Also update recommendation status
        cursor.execute("""
            UPDATE recommendations
            SET status = 'flagged',
                updated_at = ?
            WHERE recommendation_id = ?
        """, (datetime.now().isoformat(), recommendation_id))

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
        cursor = self.db.cursor()

        cursor.execute("""
            SELECT status, guardrails_passed
            FROM recommendations
            WHERE recommendation_id = ?
        """, (recommendation_id,))

        row = cursor.fetchone()

        if not row:
            return False

        status, guardrails = row['status'], row['guardrails_passed']

        # Must be pending and pass all guardrails
        return status == 'pending' and guardrails

    def _log_operator_action(self, operator_id: str, action: str,
                            recommendation_id: str, metadata: Dict):
        """Log operator action to audit table"""
        audit_id = f"audit_{operator_id}_{int(datetime.now().timestamp())}"

        cursor = self.db.cursor()
        cursor.execute("""
            INSERT INTO operator_audit_log
            (audit_id, operator_id, action, recommendation_id, metadata, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            audit_id,
            operator_id,
            action,
            recommendation_id,
            json.dumps(metadata),
            datetime.now().isoformat()
        ))

    def _queue_for_delivery(self, recommendation_id: str):
        """Queue recommendation for delivery to user"""
        # This would integrate with email/notification system
        # For now, just update status
        cursor = self.db.cursor()
        cursor.execute("""
            UPDATE recommendations
            SET status = 'queued_for_delivery',
                updated_at = ?
            WHERE recommendation_id = ?
        """, (datetime.now().isoformat(), recommendation_id))

    def get_operator_stats(self, operator_id: str = None) -> Dict:
        """Get operator activity statistics"""
        cursor = self.db.cursor()

        # Pending count
        cursor.execute("SELECT COUNT(*) FROM recommendations WHERE status = 'pending'")
        pending = cursor.fetchone()[0]

        # Approved today
        cursor.execute("""
            SELECT COUNT(*) FROM operator_audit_log
            WHERE action = 'approve'
              AND DATE(timestamp) = DATE('now')
        """)
        approved_today = cursor.fetchone()[0]

        # Rejected today
        cursor.execute("""
            SELECT COUNT(*) FROM operator_audit_log
            WHERE action = 'reject'
              AND DATE(timestamp) = DATE('now')
        """)
        rejected_today = cursor.fetchone()[0]

        # Flagged items
        cursor.execute("""
            SELECT COUNT(*) FROM recommendation_flags
            WHERE resolved = 0
        """)
        flagged = cursor.fetchone()[0]

        return {
            'pending': pending,
            'approved_today': approved_today,
            'rejected_today': rejected_today,
            'flagged': flagged,
            'avg_review_time_seconds': 0  # Would calculate from timing data
        }
```

---

### Recommendations Endpoints

Create `/api/recommendations.py`:

```python
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
import sqlite3

from database import get_db
from operator_actions import OperatorActions
import schemas

router = APIRouter()

@router.get("/recommendations", response_model=List[schemas.Recommendation])
def get_recommendations(
    status: Optional[str] = "pending",
    persona: Optional[str] = "all",
    priority: Optional[str] = "all",
    db: sqlite3.Connection = Depends(get_db)
):
    """Get filtered list of recommendations"""
    cursor = db.cursor()

    query = "SELECT * FROM recommendations WHERE 1=1"
    params = []

    if status != "all":
        query += " AND status = ?"
        params.append(status)

    if persona != "all":
        query += " AND persona_primary = ?"
        params.append(persona)

    if priority != "all":
        query += " AND priority = ?"
        params.append(priority)

    query += " ORDER BY created_at DESC LIMIT 100"

    cursor.execute(query, params)
    rows = cursor.fetchall()

    recommendations = []
    for row in rows:
        rec = dict(row)
        rec['id'] = rec.pop('recommendation_id')
        rec['guardrails_passed'] = {
            'tone_check': bool(rec.pop('tone_check')),
            'advice_check': bool(rec.pop('advice_check')),
            'eligibility_check': bool(rec.pop('eligibility_check'))
        }
        recommendations.append(schemas.Recommendation(**rec))

    return recommendations

@router.post("/recommendations/{recommendation_id}/approve")
def approve_recommendation(
    recommendation_id: str,
    request: schemas.ApproveRequest,
    operator_id: str = "op_001",  # TODO: Get from auth
    db: sqlite3.Connection = Depends(get_db)
):
    """Approve a recommendation"""
    actions = OperatorActions(db)
    return actions.approve_recommendation(operator_id, recommendation_id, request.notes)

@router.post("/recommendations/{recommendation_id}/reject")
def reject_recommendation(
    recommendation_id: str,
    request: schemas.RejectRequest,
    operator_id: str = "op_001",
    db: sqlite3.Connection = Depends(get_db)
):
    """Reject a recommendation"""
    actions = OperatorActions(db)
    return actions.reject_recommendation(operator_id, recommendation_id, request.reason)

@router.patch("/recommendations/{recommendation_id}")
def modify_recommendation(
    recommendation_id: str,
    request: schemas.ModifyRequest,
    operator_id: str = "op_001",
    db: sqlite3.Connection = Depends(get_db)
):
    """Modify a recommendation"""
    actions = OperatorActions(db)
    modifications = request.dict(exclude_unset=True)
    return actions.modify_recommendation(operator_id, recommendation_id, modifications)

@router.post("/recommendations/{recommendation_id}/flag")
def flag_recommendation(
    recommendation_id: str,
    request: schemas.FlagRequest,
    operator_id: str = "op_001",
    db: sqlite3.Connection = Depends(get_db)
):
    """Flag a recommendation for review"""
    actions = OperatorActions(db)
    return actions.flag_for_review(operator_id, recommendation_id, request.reason)

@router.post("/recommendations/bulk-approve", response_model=schemas.BulkApproveResponse)
def bulk_approve_recommendations(
    request: schemas.BulkApproveRequest,
    operator_id: str = "op_001",
    db: sqlite3.Connection = Depends(get_db)
):
    """Bulk approve multiple recommendations"""
    actions = OperatorActions(db)
    return actions.bulk_approve(operator_id, request.recommendation_ids, request.notes)

@router.get("/stats", response_model=schemas.OperatorStats)
def get_operator_stats(
    operator_id: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    """Get operator statistics"""
    actions = OperatorActions(db)
    return actions.get_operator_stats(operator_id)

@router.get("/recommendations/{recommendation_id}/trace")
def get_decision_trace(
    recommendation_id: str,
    db: sqlite3.Connection = Depends(get_db)
):
    """Get decision trace for a recommendation"""
    cursor = db.cursor()

    cursor.execute("""
        SELECT * FROM decision_traces
        WHERE recommendation_id = ?
    """, (recommendation_id,))

    row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Trace not found")

    trace = dict(row)

    # Parse JSON fields
    trace['signals'] = json.loads(trace.pop('signals_json'))
    trace['persona_assignment'] = json.loads(trace.pop('persona_assignment_json'))
    trace['content_matches'] = json.loads(trace.pop('content_matches_json'))
    trace['relevance_scores'] = json.loads(trace.pop('relevance_scores_json'))

    return trace
```

---

### Requirements File

Create `/api/requirements.txt`:

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
```

---

## Running the Backend

```bash
# Navigate to API directory
cd api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python -c "from database import init_database; init_database()"

# Run server
python main.py

# Server will be running on http://localhost:8000
```

---

## Acceptance Criteria

**Must Have:**

- [ ] FastAPI application runs without errors
- [ ] Database schema created successfully
- [ ] All recommendation endpoints functional
- [ ] Approve action updates database
- [ ] Reject action updates database
- [ ] Modify action updates database
- [ ] Flag action creates flag record
- [ ] Bulk approve processes multiple recommendations
- [ ] Operator stats endpoint returns correct counts
- [ ] Decision trace endpoint returns trace data
- [ ] Audit log records all actions
- [ ] CORS configured for frontend

**Should Have:**

- [ ] Input validation on all endpoints
- [ ] Error handling for database errors
- [ ] Transaction rollback on failures
- [ ] API documentation (FastAPI auto-docs)
- [ ] Logging for debugging

---

## Testing Checklist

- [ ] Server starts successfully
- [ ] GET /recommendations returns data
- [ ] POST /approve updates status
- [ ] POST /reject with reason works
- [ ] PATCH /modify updates fields
- [ ] POST /flag creates flag
- [ ] POST /bulk-approve processes multiple
- [ ] GET /stats returns correct counts
- [ ] GET /trace returns trace data
- [ ] Audit log entries created
- [ ] Database transactions commit properly
- [ ] Errors return appropriate status codes

---

**Dependencies:** Shard 1  
**Blocks:** All frontend shards need this backend  
**Estimated Time:** 6-8 hours
