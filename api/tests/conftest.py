"""
Pytest configuration and fixtures for API tests.

This module provides:
- Test database fixtures
- Test client fixtures
- Sample data fixtures
"""

import pytest
import sqlite3
import tempfile
import os
from pathlib import Path
from contextlib import contextmanager
from typing import Generator

# Import the FastAPI app
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app
from fastapi.testclient import TestClient


@pytest.fixture(scope="function")
def test_db() -> Generator[sqlite3.Connection, None, None]:
    """
    Create a temporary test database for each test.
    
    Yields:
        sqlite3.Connection: Database connection with test data
    """
    # Create temporary database file
    db_fd, db_path = tempfile.mkstemp()
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    
    # Create schema
    cursor = conn.cursor()
    
    # Create recommendations table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendations (
            recommendation_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            persona_primary TEXT,
            type TEXT,
            title TEXT,
            rationale TEXT,
            priority TEXT,
            status TEXT DEFAULT 'pending',
            guardrails_passed BOOLEAN DEFAULT TRUE,
            tone_check BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_by TEXT,
            approved_at TIMESTAMP,
            rejected_by TEXT,
            rejected_at TIMESTAMP,
            rejection_reason TEXT,
            modified_by TEXT,
            modified_at TIMESTAMP
        )
    """)
    
    # Create operator_audit_log table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS operator_audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            operator_id TEXT NOT NULL,
            recommendation_id TEXT NOT NULL,
            action TEXT NOT NULL,
            notes TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create recommendation_flags table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendation_flags (
            flag_id INTEGER PRIMARY KEY AUTOINCREMENT,
            recommendation_id TEXT NOT NULL,
            flagged_by TEXT NOT NULL,
            reason TEXT,
            resolved BOOLEAN DEFAULT 0,
            resolved_by TEXT,
            resolved_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create decision_traces table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS decision_traces (
            trace_id TEXT PRIMARY KEY,
            recommendation_id TEXT NOT NULL,
            signals_detected_at TIMESTAMP NOT NULL,
            persona_assigned_at TIMESTAMP NOT NULL,
            content_matched_at TIMESTAMP NOT NULL,
            rationale_generated_at TIMESTAMP NOT NULL,
            guardrails_checked_at TIMESTAMP NOT NULL,
            signals_json TEXT NOT NULL,
            persona_assignment_json TEXT NOT NULL,
            content_matches_json TEXT NOT NULL,
            relevance_scores_json TEXT NOT NULL,
            llm_model TEXT NOT NULL,
            temperature REAL NOT NULL,
            tokens_used INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create users table (for user signals tests)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create user_signals table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_signals (
            user_id TEXT NOT NULL,
            signal_type TEXT NOT NULL,
            signal_value REAL,
            signal_json TEXT,
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            window_type TEXT DEFAULT '30d'
        )
    """)
    
    # Create user_personas table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_personas (
            user_id TEXT NOT NULL,
            persona_primary TEXT NOT NULL,
            persona_secondary TEXT,
            criteria_met TEXT,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            window_type TEXT DEFAULT '30d'
        )
    """)
    
    conn.commit()
    
    yield conn
    
    # Cleanup
    conn.close()
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client():
    """
    Create a test client for the FastAPI app.
    
    Returns:
        TestClient: FastAPI test client
    """
    return TestClient(app)


@pytest.fixture
def sample_recommendation(test_db: sqlite3.Connection) -> dict:
    """
    Insert a sample recommendation into the test database.
    
    Args:
        test_db: Test database connection
        
    Returns:
        dict: Sample recommendation data
    """
    rec_data = {
        'recommendation_id': 'test_rec_001',
        'user_id': 'user_123',
        'persona_primary': 'high_utilization',
        'type': 'article',
        'title': 'Test Recommendation',
        'rationale': 'Test rationale for recommendation',
        'priority': 'high',
        'status': 'pending',
        'guardrails_passed': 1,
        'tone_check': 1
    }
    
    cursor = test_db.cursor()
    cursor.execute("""
        INSERT INTO recommendations (
            recommendation_id, user_id, persona_primary, type, title,
            rationale, priority, status, guardrails_passed, tone_check
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        rec_data['recommendation_id'],
        rec_data['user_id'],
        rec_data['persona_primary'],
        rec_data['type'],
        rec_data['title'],
        rec_data['rationale'],
        rec_data['priority'],
        rec_data['status'],
        rec_data['guardrails_passed'],
        rec_data['tone_check']
    ))
    test_db.commit()
    
    return rec_data


@pytest.fixture
def sample_user(test_db: sqlite3.Connection) -> dict:
    """
    Insert a sample user with signals into the test database.
    
    Args:
        test_db: Test database connection
        
    Returns:
        dict: Sample user data
    """
    user_data = {
        'user_id': 'test_user_001'
    }
    
    cursor = test_db.cursor()
    
    # Insert user
    cursor.execute("""
        INSERT INTO users (user_id) VALUES (?)
    """, (user_data['user_id'],))
    
    # Insert signals
    cursor.execute("""
        INSERT INTO user_signals (user_id, signal_type, signal_value, window_type)
        VALUES (?, ?, ?, ?)
    """, (user_data['user_id'], 'credit_utilization', 0.85, '30d'))
    
    # Insert persona
    cursor.execute("""
        INSERT INTO user_personas (user_id, persona_primary, window_type)
        VALUES (?, ?, ?)
    """, (user_data['user_id'], 'high_utilization', '30d'))
    
    test_db.commit()
    
    return user_data

