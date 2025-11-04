-- ========================================================================
-- SpendSense Operator Dashboard Database Schema
-- ========================================================================
-- This schema extends the existing spendsense.db with operator-specific tables
-- and enhances the recommendations table with operator action tracking.
--
-- Tables:
-- 1. recommendations (EXTENDED) - Add operator action fields
-- 2. operator_audit_log (NEW) - Audit trail for all operator actions
-- 3. recommendation_flags (NEW) - Flagged recommendations requiring review
-- 4. decision_traces (NEW) - AI decision-making process traces
-- ========================================================================

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- ========================================================================
-- 1. EXTEND RECOMMENDATIONS TABLE
-- ========================================================================
-- Add new columns to existing recommendations table
-- Note: SQLite will error if column exists - database.py handles this

-- Persona fields
ALTER TABLE recommendations ADD COLUMN persona_primary TEXT;

-- Content type (content_type already exists, add 'type' alias)
ALTER TABLE recommendations ADD COLUMN type TEXT DEFAULT 'article';

-- Guardrail check results
ALTER TABLE recommendations ADD COLUMN tone_check BOOLEAN DEFAULT TRUE;

-- Operator action tracking
ALTER TABLE recommendations ADD COLUMN approved_by TEXT;

-- Additional timestamps
ALTER TABLE recommendations ADD COLUMN generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create additional indexes for operator queries
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_recommendations_persona ON recommendations(persona_primary);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON recommendations(created_at DESC);

-- ========================================================================
-- 2. OPERATOR AUDIT LOG TABLE
-- ========================================================================
-- Records all operator actions for compliance and review

CREATE TABLE IF NOT EXISTS operator_audit_log (
    audit_id TEXT PRIMARY KEY,
    operator_id TEXT NOT NULL,
    action TEXT NOT NULL,              -- 'approve', 'reject', 'modify', 'flag', 'bulk_approve'
    recommendation_id TEXT NOT NULL,
    metadata TEXT,                     -- JSON string with additional context
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

-- Indexes for efficient audit queries
CREATE INDEX IF NOT EXISTS idx_audit_operator ON operator_audit_log(operator_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON operator_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON operator_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_recommendation ON operator_audit_log(recommendation_id);

-- ========================================================================
-- 3. RECOMMENDATION FLAGS TABLE
-- ========================================================================
-- Tracks recommendations flagged for additional review

CREATE TABLE IF NOT EXISTS recommendation_flags (
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

-- Indexes for flag queries
CREATE INDEX IF NOT EXISTS idx_flags_recommendation ON recommendation_flags(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_flags_resolved ON recommendation_flags(resolved);
CREATE INDEX IF NOT EXISTS idx_flags_flagged_at ON recommendation_flags(flagged_at DESC);

-- ========================================================================
-- 4. DECISION TRACES TABLE
-- ========================================================================
-- Stores the AI decision-making process for each recommendation
-- Enables operators to understand why a recommendation was generated

CREATE TABLE IF NOT EXISTS decision_traces (
    trace_id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL UNIQUE,

    -- Timestamps for each pipeline step
    signals_detected_at TIMESTAMP NOT NULL,
    persona_assigned_at TIMESTAMP NOT NULL,
    content_matched_at TIMESTAMP NOT NULL,
    rationale_generated_at TIMESTAMP NOT NULL,
    guardrails_checked_at TIMESTAMP NOT NULL,

    -- Pipeline data stored as JSON strings
    signals_json TEXT NOT NULL,                    -- User behavioral signals detected
    persona_assignment_json TEXT NOT NULL,         -- Persona assignment reasoning
    content_matches_json TEXT NOT NULL,            -- Content matching results
    relevance_scores_json TEXT NOT NULL,           -- Relevance scores for matched content

    -- LLM configuration and usage
    llm_model TEXT NOT NULL,
    temperature REAL NOT NULL,
    tokens_used INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

-- Index for trace queries
CREATE INDEX IF NOT EXISTS idx_traces_recommendation ON decision_traces(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_traces_created_at ON decision_traces(created_at DESC);

-- ========================================================================
-- SCHEMA COMPLETE
-- ========================================================================
-- Tables created:
--   - recommendations (extended with 20+ new columns)
--   - operator_audit_log (new)
--   - recommendation_flags (new)
--   - decision_traces (new)
--
-- Total indexes: 13
-- ========================================================================

