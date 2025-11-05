"""
Persona API Router for SpendSense

Provides REST API endpoints for persona assignment, retrieval, and transition tracking.

Endpoints:
- POST   /api/personas/assign         - Assign persona to user
- GET    /api/personas/{user_id}      - Get user's current persona
- POST   /api/personas/detect-transition - Detect persona transitions
- GET    /api/personas/{user_id}/transitions - Get transition history
"""

from fastapi import APIRouter, HTTPException, Path, Query
from typing import Optional
import sys
import os
import logging
from datetime import datetime
import json

# Add parent directory to path to import personas module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import persona modules
try:
    from personas.assignment import PersonaAssigner
    from personas.transitions import PersonaTransitionTracker
    PERSONAS_AVAILABLE = True
except ImportError as e:
    PERSONAS_AVAILABLE = False
    print(f"Warning: Persona modules not available: {e}")

# Import API schemas and database
from schemas import (
    PersonaAssignmentRequest,
    PersonaAssignment,
    PersonaTransitionRequest,
    PersonaTransition,
    TransitionHistoryResponse
)
from database import get_db

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


# ========================================================================
# POST /api/personas/assign - Assign persona to user
# ========================================================================

@router.post("/personas/assign/{user_id}", response_model=PersonaAssignment, tags=["Personas"])
def assign_persona(
    user_id: str = Path(..., description="User ID to assign persona to"),
    request: PersonaAssignmentRequest = PersonaAssignmentRequest()
):
    """
    Assign persona to a user based on their behavioral signals.
    
    This endpoint:
    1. Loads user signals from the database
    2. Runs persona matching algorithm
    3. Stores the assignment in user_personas table
    4. Returns the persona assignment details
    
    Args:
        user_id: User ID to assign persona to
        request: Request with window_type ('30d' or '180d')
        
    Returns:
        PersonaAssignment: Persona assignment details including primary persona,
                          secondary personas, match strength, and criteria met
                          
    Raises:
        404: User not found or no signals available
        500: Internal server error during assignment
    """
    if not PERSONAS_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Persona system not available. Please ensure persona modules are installed."
        )
    
    logger.info(f"Assigning persona to user {user_id} with window_type={request.window_type}")
    
    try:
        with get_db() as conn:
            # Verify user exists
            cursor = conn.cursor()
            cursor.execute("SELECT user_id FROM users WHERE user_id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail=f"User {user_id} not found"
                )
            
            # Initialize persona assigner
            assigner = PersonaAssigner(conn)
            
            # Assign personas
            assignment = assigner.assign_personas(user_id, window_type=request.window_type)
            
            # Check if assignment failed (no signals)
            if assignment.get('primary_persona') == 'none':
                logger.warning(f"No signals available for user {user_id}")
                raise HTTPException(
                    status_code=404,
                    detail=f"No signals available for user {user_id}. Please ensure signals have been generated."
                )
            
            # Store assignment in database
            assignment_id = assigner.store_assignment(assignment)
            logger.info(f"Persona assigned successfully: {assignment_id}")
            
            # Add window_type to response
            assignment['window_type'] = request.window_type
            
            return PersonaAssignment(**assignment)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning persona to user {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal error assigning persona: {str(e)}"
        )


# ========================================================================
# GET /api/personas/{user_id} - Get user's current persona
# ========================================================================

@router.get("/personas/{user_id}", response_model=PersonaAssignment, tags=["Personas"])
def get_user_persona(
    user_id: str = Path(..., description="User ID to get persona for"),
    window_type: str = Query("30d", description="Time window: '30d' or '180d'")
):
    """
    Get user's current persona assignment.
    
    Retrieves the most recent persona assignment for the specified user
    and time window from the database.
    
    Args:
        user_id: User ID to get persona for
        window_type: Time window ('30d' or '180d')
        
    Returns:
        PersonaAssignment: Current persona assignment details
        
    Raises:
        400: Invalid window_type parameter
        404: User not found or no persona assigned
        500: Internal server error
    """
    # Validate window_type
    if window_type not in ['30d', '180d']:
        raise HTTPException(
            status_code=400,
            detail="window_type must be either '30d' or '180d'"
        )
    
    logger.info(f"Getting persona for user {user_id} with window_type={window_type}")
    
    try:
        with get_db() as conn:
            # Verify user exists
            cursor = conn.cursor()
            cursor.execute("SELECT user_id FROM users WHERE user_id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail=f"User {user_id} not found"
                )
            
            # Get most recent persona assignment
            cursor.execute("""
                SELECT 
                    user_id,
                    primary_persona,
                    primary_match_strength,
                    secondary_personas,
                    criteria_met,
                    all_matches,
                    assigned_at,
                    window_type
                FROM user_personas
                WHERE user_id = ? AND window_type = ?
                ORDER BY assigned_at DESC
                LIMIT 1
            """, (user_id, window_type))
            
            row = cursor.fetchone()
            
            if not row:
                raise HTTPException(
                    status_code=404,
                    detail=f"No persona assignment found for user {user_id} with window_type={window_type}"
                )
            
            # Parse JSON fields
            persona_data = {
                'user_id': row['user_id'],
                'primary_persona': row['primary_persona'],
                'primary_match_strength': row['primary_match_strength'],
                'secondary_personas': json.loads(row['secondary_personas']) if row['secondary_personas'] else [],
                'criteria_met': json.loads(row['criteria_met']) if row['criteria_met'] else {},
                'all_matches': json.loads(row['all_matches']) if row['all_matches'] else [],
                'assigned_at': row['assigned_at'],
                'window_type': row['window_type']
            }
            
            logger.info(f"Retrieved persona for user {user_id}: {persona_data['primary_persona']}")
            return PersonaAssignment(**persona_data)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting persona for user {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal error retrieving persona: {str(e)}"
        )


# ========================================================================
# POST /api/personas/detect-transition - Detect persona transition
# ========================================================================

@router.post("/personas/detect-transition/{user_id}", response_model=PersonaTransition, tags=["Personas"])
def detect_persona_transition(
    user_id: str = Path(..., description="User ID to detect transition for"),
    request: PersonaTransitionRequest = PersonaTransitionRequest()
):
    """
    Detect if user has transitioned between personas.
    
    Compares the user's current persona with their previous persona
    to detect transitions. If a positive transition is detected (e.g.,
    from 'high_utilization' to 'savings_builder'), a celebration message
    is generated.
    
    Args:
        user_id: User ID to detect transition for
        request: Request with window_type ('30d' or '180d')
        
    Returns:
        PersonaTransition: Transition details including celebration message if applicable
        
    Raises:
        404: User not found or insufficient persona history
        500: Internal server error
    """
    if not PERSONAS_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Persona system not available. Please ensure persona modules are installed."
        )
    
    logger.info(f"Detecting transition for user {user_id} with window_type={request.window_type}")
    
    try:
        with get_db() as conn:
            # Verify user exists
            cursor = conn.cursor()
            cursor.execute("SELECT user_id FROM users WHERE user_id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail=f"User {user_id} not found"
                )
            
            # Initialize transition tracker
            tracker = PersonaTransitionTracker(conn)
            
            # Detect transition
            transition = tracker.detect_transition(user_id, window_type=request.window_type)
            
            # Add user_id to response
            transition['user_id'] = user_id
            
            if transition.get('transition_detected'):
                logger.info(
                    f"Transition detected for user {user_id}: "
                    f"{transition['from_persona']} -> {transition['to_persona']}"
                )
            else:
                logger.info(f"No transition detected for user {user_id}")
            
            return PersonaTransition(**transition)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error detecting transition for user {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal error detecting transition: {str(e)}"
        )


# ========================================================================
# GET /api/personas/{user_id}/transitions - Get transition history
# ========================================================================

@router.get("/personas/{user_id}/transitions", response_model=TransitionHistoryResponse, tags=["Personas"])
def get_transition_history(
    user_id: str = Path(..., description="User ID to get transition history for"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of transitions to return")
):
    """
    Get user's persona transition history.
    
    Returns a list of all persona transitions for the user, ordered by
    most recent first. Includes transition details such as from/to personas,
    celebration messages, and milestones achieved.
    
    Args:
        user_id: User ID to get transition history for
        limit: Maximum number of transitions to return (1-100)
        
    Returns:
        TransitionHistoryResponse: List of transitions and total count
        
    Raises:
        404: User not found
        500: Internal server error
    """
    if not PERSONAS_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Persona system not available. Please ensure persona modules are installed."
        )
    
    logger.info(f"Getting transition history for user {user_id} (limit={limit})")
    
    try:
        with get_db() as conn:
            # Verify user exists
            cursor = conn.cursor()
            cursor.execute("SELECT user_id FROM users WHERE user_id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail=f"User {user_id} not found"
                )
            
            # Initialize transition tracker
            tracker = PersonaTransitionTracker(conn)
            
            # Get transition history
            transitions = tracker.get_transition_history(user_id, limit=limit)
            
            logger.info(f"Retrieved {len(transitions)} transitions for user {user_id}")
            
            return TransitionHistoryResponse(
                user_id=user_id,
                transitions=transitions,
                total_transitions=len(transitions)
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting transition history for user {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal error retrieving transition history: {str(e)}"
        )


# ========================================================================
# Health Check
# ========================================================================

@router.get("/personas/health", tags=["Health"])
def personas_health_check():
    """
    Health check for persona system.
    
    Verifies that:
    - Persona modules are available
    - Database connection works
    - Required tables exist
    
    Returns:
        dict: Health status
    """
    health_status = {
        "status": "healthy",
        "persona_modules_available": PERSONAS_AVAILABLE,
        "timestamp": datetime.now().isoformat()
    }
    
    # Check database connection
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check user_personas table exists
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='user_personas'
            """)
            user_personas_exists = cursor.fetchone() is not None
            
            # Check persona_transitions table exists
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='persona_transitions'
            """)
            transitions_exists = cursor.fetchone() is not None
            
            health_status["database_connected"] = True
            health_status["user_personas_table"] = user_personas_exists
            health_status["persona_transitions_table"] = transitions_exists
            
            if not user_personas_exists or not transitions_exists:
                health_status["status"] = "degraded"
                
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["database_connected"] = False
        health_status["error"] = str(e)
    
    # Set overall status
    if not PERSONAS_AVAILABLE or health_status["status"] == "unhealthy":
        raise HTTPException(
            status_code=503,
            detail=health_status
        )
    
    return health_status

