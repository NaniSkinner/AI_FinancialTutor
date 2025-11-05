"""
Unit tests for Persona API endpoints

Tests all persona-related API endpoints:
- POST /api/personas/assign/{user_id}
- GET /api/personas/{user_id}
- POST /api/personas/detect-transition/{user_id}
- GET /api/personas/{user_id}/transitions
"""

import pytest
import sys
import os
from datetime import datetime
import json

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app

# Create test client
client = TestClient(app)


# ========================================================================
# FIXTURES
# ========================================================================

@pytest.fixture
def sample_user_id():
    """Sample user ID for testing"""
    return "user_001"


@pytest.fixture
def mock_persona_assignment():
    """Sample persona assignment data"""
    return {
        "user_id": "user_001",
        "primary_persona": "high_utilization",
        "primary_match_strength": "strong",
        "secondary_personas": ["subscription_heavy"],
        "criteria_met": {
            "any_card_utilization_gte_50": True,
            "aggregate_utilization_pct": 68.0,
            "any_interest_charges": True,
            "any_overdue": True
        },
        "all_matches": ["high_utilization", "subscription_heavy"],
        "assigned_at": datetime.now().isoformat()
    }


# ========================================================================
# TEST POST /api/personas/assign/{user_id}
# ========================================================================

def test_assign_persona_success(sample_user_id, mock_persona_assignment, mocker):
    """Test successful persona assignment"""
    # Mock PersonaAssigner.assign_personas
    mocker.patch(
        'personas.PersonaAssigner.assign_personas',
        return_value=mock_persona_assignment
    )
    
    # Mock store_assignment
    mocker.patch(
        'personas.PersonaAssigner.store_assignment',
        return_value='assignment_12345'
    )
    
    # Make request
    response = client.post(
        f"/api/personas/assign/{sample_user_id}",
        json={"window_type": "30d"}
    )
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == sample_user_id
    assert data["primary_persona"] == "high_utilization"
    assert data["primary_match_strength"] == "strong"
    assert "secondary_personas" in data
    assert "criteria_met" in data


def test_assign_persona_invalid_window_type(sample_user_id):
    """Test persona assignment with invalid window_type"""
    response = client.post(
        f"/api/personas/assign/{sample_user_id}",
        json={"window_type": "90d"}  # Invalid
    )
    
    assert response.status_code == 422  # Validation error


def test_assign_persona_user_not_found(mocker):
    """Test persona assignment for non-existent user"""
    # Mock database to return no user
    mocker.patch(
        'database.get_db',
        side_effect=Exception("User not found")
    )
    
    response = client.post(
        "/api/personas/assign/nonexistent_user",
        json={"window_type": "30d"}
    )
    
    assert response.status_code in [404, 500]


def test_assign_persona_no_signals(sample_user_id, mocker):
    """Test persona assignment when no signals available"""
    # Mock assignment to return 'none' persona
    mocker.patch(
        'personas.PersonaAssigner.assign_personas',
        return_value={
            "user_id": sample_user_id,
            "primary_persona": "none",
            "primary_match_strength": "none",
            "secondary_personas": [],
            "criteria_met": {},
            "all_matches": [],
            "assigned_at": datetime.now().isoformat()
        }
    )
    
    response = client.post(
        f"/api/personas/assign/{sample_user_id}",
        json={"window_type": "30d"}
    )
    
    assert response.status_code == 404
    assert "No signals available" in response.json()["detail"]


# ========================================================================
# TEST GET /api/personas/{user_id}
# ========================================================================

def test_get_persona_success(sample_user_id, mock_persona_assignment, mocker):
    """Test successful persona retrieval"""
    # Mock database query
    mock_row = {
        'user_id': sample_user_id,
        'primary_persona': 'high_utilization',
        'primary_match_strength': 'strong',
        'secondary_personas': json.dumps(['subscription_heavy']),
        'criteria_met': json.dumps({
            'any_card_utilization_gte_50': True,
            'aggregate_utilization_pct': 68.0
        }),
        'all_matches': json.dumps(['high_utilization', 'subscription_heavy']),
        'assigned_at': datetime.now().isoformat(),
        'window_type': '30d'
    }
    
    # Mock cursor.fetchone
    mocker.patch(
        'sqlite3.Cursor.fetchone',
        return_value=mock_row
    )
    
    response = client.get(f"/api/personas/{sample_user_id}?window_type=30d")
    
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == sample_user_id
    assert data["primary_persona"] == "high_utilization"


def test_get_persona_invalid_window_type(sample_user_id):
    """Test get persona with invalid window_type"""
    response = client.get(f"/api/personas/{sample_user_id}?window_type=invalid")
    
    assert response.status_code == 400
    assert "window_type must be" in response.json()["detail"]


def test_get_persona_user_not_found():
    """Test get persona for non-existent user"""
    response = client.get("/api/personas/nonexistent_user?window_type=30d")
    
    assert response.status_code == 404


def test_get_persona_no_assignment(sample_user_id, mocker):
    """Test get persona when no assignment exists"""
    # Mock database to return no assignment
    mocker.patch(
        'sqlite3.Cursor.fetchone',
        return_value=None
    )
    
    response = client.get(f"/api/personas/{sample_user_id}?window_type=30d")
    
    assert response.status_code == 404
    assert "No persona assignment found" in response.json()["detail"]


# ========================================================================
# TEST POST /api/personas/detect-transition/{user_id}
# ========================================================================

def test_detect_transition_positive(sample_user_id, mocker):
    """Test detection of positive persona transition"""
    mock_transition = {
        "transition_detected": True,
        "from_persona": "high_utilization",
        "to_persona": "savings_builder",
        "transition_date": datetime.now().isoformat(),
        "days_in_previous_persona": 45,
        "is_positive_transition": True,
        "celebration_message": "🎉 Congratulations! You've improved your credit health and started building savings!",
        "milestone_achieved": "credit_to_savings",
        "achievement_title": "Financial Health Turnaround"
    }
    
    # Mock PersonaTransitionTracker.detect_transition
    mocker.patch(
        'personas.PersonaTransitionTracker.detect_transition',
        return_value=mock_transition
    )
    
    response = client.post(
        f"/api/personas/detect-transition/{sample_user_id}",
        json={"window_type": "30d"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["transition_detected"] is True
    assert data["from_persona"] == "high_utilization"
    assert data["to_persona"] == "savings_builder"
    assert data["celebration_message"] is not None
    assert "Congratulations" in data["celebration_message"]


def test_detect_transition_no_transition(sample_user_id, mocker):
    """Test detection when no transition occurred"""
    mock_transition = {
        "transition_detected": False
    }
    
    mocker.patch(
        'personas.PersonaTransitionTracker.detect_transition',
        return_value=mock_transition
    )
    
    response = client.post(
        f"/api/personas/detect-transition/{sample_user_id}",
        json={"window_type": "30d"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["transition_detected"] is False


def test_detect_transition_negative(sample_user_id, mocker):
    """Test detection of negative persona transition (no celebration)"""
    mock_transition = {
        "transition_detected": True,
        "from_persona": "savings_builder",
        "to_persona": "high_utilization",
        "transition_date": datetime.now().isoformat(),
        "days_in_previous_persona": 30,
        "is_positive_transition": False
    }
    
    mocker.patch(
        'personas.PersonaTransitionTracker.detect_transition',
        return_value=mock_transition
    )
    
    response = client.post(
        f"/api/personas/detect-transition/{sample_user_id}",
        json={"window_type": "30d"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["transition_detected"] is True
    assert data["is_positive_transition"] is False
    assert data["celebration_message"] is None


def test_detect_transition_user_not_found():
    """Test transition detection for non-existent user"""
    response = client.post(
        "/api/personas/detect-transition/nonexistent_user",
        json={"window_type": "30d"}
    )
    
    assert response.status_code == 404


# ========================================================================
# TEST GET /api/personas/{user_id}/transitions
# ========================================================================

def test_get_transition_history_success(sample_user_id, mocker):
    """Test successful transition history retrieval"""
    mock_transitions = [
        {
            "transition_id": "trans_001",
            "user_id": sample_user_id,
            "from_persona": "high_utilization",
            "to_persona": "savings_builder",
            "transition_date": "2025-11-01T10:00:00Z",
            "days_in_previous_persona": 45,
            "celebration_shown": True,
            "milestone_achieved": "credit_to_savings"
        },
        {
            "transition_id": "trans_002",
            "user_id": sample_user_id,
            "from_persona": "student",
            "to_persona": "high_utilization",
            "transition_date": "2025-10-15T10:00:00Z",
            "days_in_previous_persona": 90,
            "celebration_shown": False,
            "milestone_achieved": None
        }
    ]
    
    # Mock PersonaTransitionTracker.get_transition_history
    mocker.patch(
        'personas.PersonaTransitionTracker.get_transition_history',
        return_value=mock_transitions
    )
    
    response = client.get(f"/api/personas/{sample_user_id}/transitions?limit=10")
    
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == sample_user_id
    assert len(data["transitions"]) == 2
    assert data["total_transitions"] == 2


def test_get_transition_history_empty(sample_user_id, mocker):
    """Test transition history when no transitions exist"""
    mocker.patch(
        'personas.PersonaTransitionTracker.get_transition_history',
        return_value=[]
    )
    
    response = client.get(f"/api/personas/{sample_user_id}/transitions")
    
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == sample_user_id
    assert len(data["transitions"]) == 0
    assert data["total_transitions"] == 0


def test_get_transition_history_with_limit(sample_user_id, mocker):
    """Test transition history with custom limit"""
    mock_transitions = [
        {"transition_id": f"trans_{i}", "user_id": sample_user_id}
        for i in range(5)
    ]
    
    mocker.patch(
        'personas.PersonaTransitionTracker.get_transition_history',
        return_value=mock_transitions
    )
    
    response = client.get(f"/api/personas/{sample_user_id}/transitions?limit=5")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["transitions"]) == 5


def test_get_transition_history_invalid_limit(sample_user_id):
    """Test transition history with invalid limit"""
    response = client.get(f"/api/personas/{sample_user_id}/transitions?limit=200")
    
    assert response.status_code == 422  # Validation error


def test_get_transition_history_user_not_found():
    """Test transition history for non-existent user"""
    response = client.get("/api/personas/nonexistent_user/transitions")
    
    assert response.status_code == 404


# ========================================================================
# TEST HEALTH CHECK
# ========================================================================

def test_personas_health_check_healthy(mocker):
    """Test personas health check when system is healthy"""
    response = client.get("/api/personas/health")
    
    # Depending on whether persona modules are actually available
    assert response.status_code in [200, 503]


def test_personas_health_check_database_issue(mocker):
    """Test personas health check when database has issues"""
    # Mock database connection to fail
    mocker.patch(
        'database.get_db',
        side_effect=Exception("Database connection failed")
    )
    
    response = client.get("/api/personas/health")
    
    assert response.status_code == 503


# ========================================================================
# INTEGRATION TESTS
# ========================================================================

def test_full_persona_flow(sample_user_id, mocker):
    """Test full persona assignment → get → transition flow"""
    # 1. Assign persona
    mock_assignment = {
        "user_id": sample_user_id,
        "primary_persona": "student",
        "primary_match_strength": "moderate",
        "secondary_personas": [],
        "criteria_met": {"has_student_loan": True},
        "all_matches": ["student"],
        "assigned_at": datetime.now().isoformat()
    }
    
    mocker.patch(
        'personas.PersonaAssigner.assign_personas',
        return_value=mock_assignment
    )
    mocker.patch('personas.PersonaAssigner.store_assignment', return_value='assign_001')
    
    assign_response = client.post(
        f"/api/personas/assign/{sample_user_id}",
        json={"window_type": "30d"}
    )
    assert assign_response.status_code == 200
    
    # 2. Get persona
    mocker.patch(
        'sqlite3.Cursor.fetchone',
        return_value={
            'user_id': sample_user_id,
            'primary_persona': 'student',
            'primary_match_strength': 'moderate',
            'secondary_personas': '[]',
            'criteria_met': '{"has_student_loan": true}',
            'all_matches': '["student"]',
            'assigned_at': datetime.now().isoformat(),
            'window_type': '30d'
        }
    )
    
    get_response = client.get(f"/api/personas/{sample_user_id}?window_type=30d")
    assert get_response.status_code == 200
    
    # 3. Detect transition
    mocker.patch(
        'personas.PersonaTransitionTracker.detect_transition',
        return_value={"transition_detected": False}
    )
    
    transition_response = client.post(
        f"/api/personas/detect-transition/{sample_user_id}",
        json={"window_type": "30d"}
    )
    assert transition_response.status_code == 200


# ========================================================================
# ERROR HANDLING TESTS
# ========================================================================

def test_assign_persona_internal_error(sample_user_id, mocker):
    """Test error handling during persona assignment"""
    mocker.patch(
        'personas.PersonaAssigner.assign_personas',
        side_effect=Exception("Internal error")
    )
    
    response = client.post(
        f"/api/personas/assign/{sample_user_id}",
        json={"window_type": "30d"}
    )
    
    assert response.status_code == 500


def test_get_persona_database_error(sample_user_id, mocker):
    """Test error handling during persona retrieval"""
    mocker.patch(
        'database.get_db',
        side_effect=Exception("Database error")
    )
    
    response = client.get(f"/api/personas/{sample_user_id}?window_type=30d")
    
    assert response.status_code == 500


# ========================================================================
# VALIDATION TESTS
# ========================================================================

def test_assign_persona_missing_body(sample_user_id):
    """Test persona assignment with missing request body"""
    # Should use default window_type
    response = client.post(f"/api/personas/assign/{sample_user_id}")
    
    # May fail due to other reasons, but shouldn't be a validation error
    assert response.status_code in [200, 404, 500, 503]


def test_multiple_window_types(sample_user_id, mock_persona_assignment, mocker):
    """Test that 30d and 180d window types work independently"""
    mocker.patch(
        'personas.PersonaAssigner.assign_personas',
        return_value=mock_persona_assignment
    )
    mocker.patch('personas.PersonaAssigner.store_assignment', return_value='assign_001')
    
    # Test 30d
    response_30d = client.post(
        f"/api/personas/assign/{sample_user_id}",
        json={"window_type": "30d"}
    )
    assert response_30d.status_code == 200
    
    # Test 180d
    response_180d = client.post(
        f"/api/personas/assign/{sample_user_id}",
        json={"window_type": "180d"}
    )
    assert response_180d.status_code == 200

