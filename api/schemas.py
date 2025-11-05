"""
Pydantic schemas for request/response validation in Operator Dashboard API.

These schemas ensure type safety and automatic validation for all API endpoints.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ========================================================================
# ENUMS
# ========================================================================

class RecommendationType(str, Enum):
    """Types of content recommendations"""
    ARTICLE = "article"
    VIDEO = "video"
    TOOL = "tool"
    QUIZ = "quiz"
    CALCULATOR = "calculator"


class RecommendationStatus(str, Enum):
    """Status of a recommendation in the review pipeline"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FLAGGED = "flagged"
    QUEUED_FOR_DELIVERY = "queued_for_delivery"


class Priority(str, Enum):
    """Recommendation priority levels"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class OperatorAction(str, Enum):
    """Types of operator actions"""
    APPROVE = "approve"
    REJECT = "reject"
    MODIFY = "modify"
    FLAG = "flag"
    BULK_APPROVE = "bulk_approve"


# ========================================================================
# GUARDRAILS & CHECKS
# ========================================================================

class GuardrailChecks(BaseModel):
    """Results of guardrail safety checks"""
    tone_check: bool = Field(..., description="Passed tone/shaming check")
    advice_check: bool = Field(..., description="Passed advice/compliance check")
    eligibility_check: bool = Field(..., description="Passed eligibility check")


# ========================================================================
# RECOMMENDATION SCHEMAS
# ========================================================================

class RecommendationBase(BaseModel):
    """Base recommendation fields"""
    user_id: str
    persona_primary: str
    persona_secondary: Optional[str] = None
    type: str = "article"
    title: str
    rationale: str
    priority: str = "medium"
    content_url: Optional[str] = None
    read_time_minutes: Optional[int] = None


class Recommendation(BaseModel):
    """Complete recommendation with all fields"""
    id: str = Field(..., alias="recommendation_id")
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
    
    # Guardrails
    tone_check: bool = True
    advice_check: bool = True
    eligibility_check: bool = True
    guardrails_passed: bool = True
    
    # Operator actions
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    rejected_by: Optional[str] = None
    rejected_at: Optional[str] = None
    modified_by: Optional[str] = None
    modified_at: Optional[str] = None
    operator_notes: Optional[str] = None
    
    # Timestamps
    generated_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    class Config:
        populate_by_name = True
        from_attributes = True


class RecommendationWithGuardrails(BaseModel):
    """Recommendation formatted for frontend with nested guardrails"""
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


# ========================================================================
# REQUEST SCHEMAS
# ========================================================================

class ApproveRequest(BaseModel):
    """Request to approve a recommendation"""
    notes: str = Field(default="", description="Optional operator notes")


class RejectRequest(BaseModel):
    """Request to reject a recommendation"""
    reason: str = Field(..., min_length=10, description="Reason for rejection (min 10 chars)")


class ModifyRequest(BaseModel):
    """Request to modify a recommendation"""
    rationale: Optional[str] = Field(None, min_length=20, description="Modified rationale")
    priority: Optional[str] = Field(None, description="Modified priority (high/medium/low)")
    title: Optional[str] = Field(None, min_length=5, description="Modified title")
    
    @validator('priority')
    def validate_priority(cls, v):
        if v is not None and v not in ['high', 'medium', 'low']:
            raise ValueError('Priority must be high, medium, or low')
        return v


class FlagRequest(BaseModel):
    """Request to flag a recommendation for review"""
    reason: str = Field(..., min_length=10, description="Reason for flagging (min 10 chars)")


class BulkApproveRequest(BaseModel):
    """Request to approve multiple recommendations"""
    recommendation_ids: List[str] = Field(..., min_items=1, max_items=50)
    notes: str = Field(default="", description="Optional notes applied to all")


# ========================================================================
# RESPONSE SCHEMAS
# ========================================================================

class BulkApproveResponse(BaseModel):
    """Response from bulk approve operation"""
    total: int
    approved: int
    failed: int
    approved_ids: List[str]
    failed_items: List[Dict[str, str]]


class OperatorStats(BaseModel):
    """Operator dashboard statistics"""
    pending: int = Field(..., description="Number of pending recommendations")
    approved_today: int = Field(..., description="Approved today")
    rejected_today: int = Field(..., description="Rejected today")
    flagged: int = Field(..., description="Currently flagged items")
    avg_review_time_seconds: float = Field(..., description="Average review time")


class ActionResponse(BaseModel):
    """Generic response for operator actions"""
    status: str
    recommendation_id: str
    message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


# ========================================================================
# AUDIT LOG SCHEMAS
# ========================================================================

class AuditLogEntry(BaseModel):
    """Audit log entry"""
    audit_id: str
    operator_id: str
    action: str
    recommendation_id: str
    metadata: Optional[Dict[str, Any]] = None
    timestamp: str


# ========================================================================
# DECISION TRACE SCHEMAS
# ========================================================================

class DecisionTrace(BaseModel):
    """Complete decision trace for a recommendation"""
    trace_id: str
    recommendation_id: str
    
    # Timestamps
    signals_detected_at: str
    persona_assigned_at: str
    content_matched_at: str
    rationale_generated_at: str
    guardrails_checked_at: str
    
    # Data
    signals: Dict[str, Any]
    persona_assignment: Dict[str, Any]
    content_matches: List[Dict[str, Any]]
    relevance_scores: Dict[str, float]
    
    # LLM details
    llm_model: str
    temperature: float
    tokens_used: int
    
    created_at: str


# ========================================================================
# USER SIGNAL SCHEMAS
# ========================================================================

class UserSignals(BaseModel):
    """User behavioral signals"""
    signal_id: str
    user_id: str
    window_type: str
    signal_category: str
    signal_data: Dict[str, Any]
    detected_at: str


class PersonaHistoryEntry(BaseModel):
    """Persona history entry"""
    persona_id: str
    user_id: str
    window_type: str
    primary_persona: str
    secondary_personas: Optional[List[str]] = None
    criteria_met: Dict[str, bool]
    match_strength: float
    assigned_at: str


# ========================================================================
# FLAG SCHEMAS
# ========================================================================

class RecommendationFlag(BaseModel):
    """Recommendation flag details"""
    flag_id: str
    recommendation_id: str
    flagged_by: str
    flag_reason: str
    resolved: bool
    resolved_by: Optional[str] = None
    resolved_at: Optional[str] = None
    flagged_at: str


# ========================================================================
# FILTER/QUERY SCHEMAS
# ========================================================================

class RecommendationFilters(BaseModel):
    """Filters for recommendation queries"""
    status: str = "pending"
    persona: str = "all"
    priority: str = "all"
    limit: int = Field(default=100, le=500)
    offset: int = Field(default=0, ge=0)


class AuditLogFilters(BaseModel):
    """Filters for audit log queries"""
    operator_id: Optional[str] = None
    action: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    limit: int = Field(default=100, le=1000)


# ========================================================================
# PERSONA SCHEMAS
# ========================================================================

class PersonaAssignmentRequest(BaseModel):
    """Request to assign persona to a user"""
    window_type: str = Field(default="30d", description="Time window: '30d' or '180d'")
    
    @validator('window_type')
    def validate_window_type(cls, v):
        if v not in ['30d', '180d']:
            raise ValueError('window_type must be either "30d" or "180d"')
        return v


class PersonaAssignment(BaseModel):
    """Persona assignment result"""
    user_id: str
    primary_persona: str
    primary_match_strength: str
    secondary_personas: List[str] = []
    criteria_met: Dict[str, Any]
    all_matches: List[str]
    assigned_at: str
    window_type: Optional[str] = None


class PersonaTransitionRequest(BaseModel):
    """Request to detect persona transition"""
    window_type: str = Field(default="30d", description="Time window: '30d' or '180d'")
    
    @validator('window_type')
    def validate_window_type(cls, v):
        if v not in ['30d', '180d']:
            raise ValueError('window_type must be either "30d" or "180d"')
        return v


class PersonaTransition(BaseModel):
    """Persona transition details"""
    user_id: str
    transition_detected: bool
    from_persona: Optional[str] = None
    to_persona: Optional[str] = None
    transition_date: Optional[str] = None
    days_in_previous_persona: Optional[int] = None
    is_positive_transition: Optional[bool] = None
    celebration_message: Optional[str] = None
    milestone_achieved: Optional[str] = None
    achievement_title: Optional[str] = None


class TransitionHistoryResponse(BaseModel):
    """Response containing user's transition history"""
    user_id: str
    transitions: List[Dict[str, Any]]
    total_transitions: int

