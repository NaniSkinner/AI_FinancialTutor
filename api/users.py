"""
Users Router - API endpoints for user context and history.

Endpoints:
- GET /users/{user_id}/signals - Get user behavioral signals
- GET /users/{user_id}/persona-history - Get persona assignment history
- GET /users/{user_id}/profile - Get user profile information
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
import sqlite3
import json

from database import get_db
from auth import verify_token
import schemas


# ========================================================================
# Router Setup
# ========================================================================

router = APIRouter()


# ========================================================================
# GET USER SIGNALS
# ========================================================================

@router.get("/users/{user_id}/signals")
def get_user_signals(
    user_id: str,
    window_type: str = Query("30d", description="Time window (7d/30d/90d/180d)"),
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get behavioral signals detected for a user.
    
    Signals include:
    - Subscription patterns (recurring merchants, monthly spend)
    - Savings behavior (net inflow, growth rate, emergency fund)
    - Credit utilization (card balances, utilization %, interest charges)
    - Income patterns (type, frequency, pay gaps, cash flow buffer)
    
    Path parameters:
    - user_id: User ID to query
    
    Query parameters:
    - window_type: Time window for signals (default: 30d)
      Options: 7d, 30d, 90d, 180d
    
    Returns:
        User signals data with all detected patterns
    """
    cursor = db.cursor()
    
    # Query user signals for the specified window
    cursor.execute("""
        SELECT *
        FROM user_signals
        WHERE user_id = ?
          AND window_type = ?
        ORDER BY detected_at DESC
        LIMIT 1
    """, (user_id, window_type))
    
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(
            status_code=404,
            detail=f"No signals found for user {user_id} with window {window_type}"
        )
    
    # Convert to dict and parse JSON
    signals = dict(row)
    
    try:
        # Parse signal_data JSON field
        signal_data = json.loads(signals.get('signal_data', '{}'))
        signals['signal_data'] = signal_data
    except json.JSONDecodeError:
        signals['signal_data'] = {}
    
    return {
        'signal_id': signals['signal_id'],
        'user_id': signals['user_id'],
        'window_type': signals['window_type'],
        'signal_category': signals['signal_category'],
        'signal_data': signals['signal_data'],
        'detected_at': signals['detected_at']
    }


# ========================================================================
# GET ALL USER SIGNALS (ALL CATEGORIES)
# ========================================================================

@router.get("/users/{user_id}/signals/all")
def get_all_user_signals(
    user_id: str,
    window_type: str = Query("30d", description="Time window (7d/30d/90d/180d)"),
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get all signal categories for a user in one call.
    
    Returns signals from all categories:
    - subscriptions
    - savings
    - credit
    - income
    
    Path parameters:
    - user_id: User ID to query
    
    Query parameters:
    - window_type: Time window for signals (default: 30d)
    
    Returns:
        Dict with all signal categories and their data
    """
    cursor = db.cursor()
    
    # Query all signals for user and window
    cursor.execute("""
        SELECT *
        FROM user_signals
        WHERE user_id = ?
          AND window_type = ?
        ORDER BY detected_at DESC
    """, (user_id, window_type))
    
    rows = cursor.fetchall()
    
    if not rows:
        raise HTTPException(
            status_code=404,
            detail=f"No signals found for user {user_id} with window {window_type}"
        )
    
    # Organize by category
    signals_by_category = {}
    
    for row in rows:
        signal = dict(row)
        category = signal['signal_category']
        
        try:
            signal_data = json.loads(signal.get('signal_data', '{}'))
        except json.JSONDecodeError:
            signal_data = {}
        
        signals_by_category[category] = {
            'signal_id': signal['signal_id'],
            'category': category,
            'data': signal_data,
            'detected_at': signal['detected_at']
        }
    
    return {
        'user_id': user_id,
        'window_type': window_type,
        'signals': signals_by_category
    }


# ========================================================================
# GET PERSONA HISTORY
# ========================================================================

@router.get("/users/{user_id}/persona-history")
def get_persona_history(
    user_id: str,
    limit: int = Query(10, le=50, description="Number of history entries to return"),
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get persona assignment history for a user.
    
    Shows how the user's financial persona has changed over time,
    useful for understanding behavior patterns and transitions.
    
    Path parameters:
    - user_id: User ID to query
    
    Query parameters:
    - limit: Number of entries to return (default: 10, max: 50)
    
    Returns:
        List of persona assignments ordered by date (newest first)
    """
    cursor = db.cursor()
    
    # Query persona history
    cursor.execute("""
        SELECT *
        FROM user_personas
        WHERE user_id = ?
        ORDER BY assigned_at DESC
        LIMIT ?
    """, (user_id, limit))
    
    rows = cursor.fetchall()
    
    if not rows:
        raise HTTPException(
            status_code=404,
            detail=f"No persona history found for user {user_id}"
        )
    
    # Format results
    history = []
    for row in rows:
        persona = dict(row)
        
        # Parse JSON fields
        try:
            secondary_personas = json.loads(persona.get('secondary_personas', '[]'))
            criteria_met = json.loads(persona.get('criteria_met', '{}'))
        except json.JSONDecodeError:
            secondary_personas = []
            criteria_met = {}
        
        history.append({
            'persona_id': persona['persona_id'],
            'user_id': persona['user_id'],
            'window_type': persona['window_type'],
            'primary_persona': persona['primary_persona'],
            'secondary_personas': secondary_personas,
            'criteria_met': criteria_met,
            'match_strength': persona.get('match_strength'),
            'assigned_at': persona['assigned_at']
        })
    
    return {
        'user_id': user_id,
        'count': len(history),
        'history': history
    }


# ========================================================================
# GET USER PROFILE
# ========================================================================

@router.get("/users/{user_id}/profile")
def get_user_profile(
    user_id: str,
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get basic user profile information.
    
    Includes:
    - User details (name, email)
    - Account summary
    - Current persona
    - Recent recommendation count
    
    Path parameters:
    - user_id: User ID to query
    
    Returns:
        User profile summary
    """
    cursor = db.cursor()
    
    # Get user info
    cursor.execute("""
        SELECT * FROM users
        WHERE user_id = ?
    """, (user_id,))
    
    user = cursor.fetchone()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"User {user_id} not found"
        )
    
    user_dict = dict(user)
    
    # Get account count
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM accounts
        WHERE user_id = ?
    """, (user_id,))
    account_count = cursor.fetchone()['count']
    
    # Get current persona
    cursor.execute("""
        SELECT primary_persona, assigned_at
        FROM user_personas
        WHERE user_id = ?
        ORDER BY assigned_at DESC
        LIMIT 1
    """, (user_id,))
    
    persona_row = cursor.fetchone()
    current_persona = dict(persona_row) if persona_row else None
    
    # Get recommendation count
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM recommendations
        WHERE user_id = ?
    """, (user_id,))
    recommendation_count = cursor.fetchone()['count']
    
    # Get pending recommendation count
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM recommendations
        WHERE user_id = ?
          AND status = 'pending'
    """, (user_id,))
    pending_count = cursor.fetchone()['count']
    
    return {
        'user_id': user_dict['user_id'],
        'name': user_dict.get('name'),
        'email': user_dict.get('email'),
        'created_at': user_dict.get('created_at'),
        'account_count': account_count,
        'current_persona': current_persona['primary_persona'] if current_persona else None,
        'persona_assigned_at': current_persona['assigned_at'] if current_persona else None,
        'total_recommendations': recommendation_count,
        'pending_recommendations': pending_count
    }


# ========================================================================
# GET USER RECOMMENDATIONS
# ========================================================================

@router.get("/users/{user_id}/recommendations")
def get_user_recommendations(
    user_id: str,
    status: Optional[str] = Query("all", description="Filter by status"),
    limit: int = Query(20, le=100, description="Number of recommendations to return"),
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get all recommendations for a specific user.
    
    Useful for operators to see complete recommendation history
    when reviewing a user's context.
    
    Path parameters:
    - user_id: User ID to query
    
    Query parameters:
    - status: Filter by status (default: all)
    - limit: Number of results (default: 20, max: 100)
    
    Returns:
        List of recommendations for the user
    """
    cursor = db.cursor()
    
    # Build query
    query = "SELECT * FROM recommendations WHERE user_id = ?"
    params = [user_id]
    
    if status and status != "all":
        query += " AND status = ?"
        params.append(status)
    
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    if not rows:
        return {
            'user_id': user_id,
            'count': 0,
            'recommendations': []
        }
    
    # Format recommendations
    recommendations = []
    for row in rows:
        rec = dict(row)
        rec['id'] = rec.pop('recommendation_id', rec.get('id'))
        recommendations.append(rec)
    
    return {
        'user_id': user_id,
        'count': len(recommendations),
        'recommendations': recommendations
    }


# ========================================================================
# GET USER ACCOUNTS
# ========================================================================

@router.get("/users/{user_id}/accounts")
def get_user_accounts(
    user_id: str,
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get account information for a user.
    
    Useful context when reviewing recommendations to understand
    the user's financial situation.
    
    Path parameters:
    - user_id: User ID to query
    
    Returns:
        List of user accounts with balances
    """
    cursor = db.cursor()
    
    # Get accounts
    cursor.execute("""
        SELECT 
            account_id,
            type,
            subtype,
            name,
            available_balance,
            current_balance,
            credit_limit
        FROM accounts
        WHERE user_id = ?
        ORDER BY type, name
    """, (user_id,))
    
    rows = cursor.fetchall()
    
    if not rows:
        raise HTTPException(
            status_code=404,
            detail=f"No accounts found for user {user_id}"
        )
    
    accounts = [dict(row) for row in rows]
    
    # Calculate summary
    total_balance = sum(
        float(acc.get('current_balance', 0) or 0) 
        for acc in accounts
    )
    
    return {
        'user_id': user_id,
        'account_count': len(accounts),
        'total_balance': total_balance,
        'accounts': accounts
    }

