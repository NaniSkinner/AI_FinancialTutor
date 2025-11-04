"""
Database schema initialization for SpendSense.

This module creates all required tables for financial data and gamification features.
"""

import sqlite3
from typing import Optional


def create_database_schema(db_path: str = 'spendsense.db') -> None:
    """
    Create all database tables with proper schema, indexes, and constraints.
    
    Args:
        db_path: Path to SQLite database file
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Enable foreign key constraints
    cursor.execute("PRAGMA foreign_keys = ON")
    
    # ========================================================================
    # FINANCIAL DATA TABLES (From PRD1)
    # ========================================================================
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metadata JSON
        )
    """)
    
    # Accounts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            account_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            subtype TEXT,
            name TEXT,
            official_name TEXT,
            mask TEXT,
            available_balance DECIMAL(12,2),
            current_balance DECIMAL(12,2),
            credit_limit DECIMAL(12,2),
            iso_currency_code TEXT DEFAULT 'USD',
            holder_category TEXT DEFAULT 'personal',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_accounts_user 
        ON accounts(user_id)
    """)
    
    # Transactions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            date DATE NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            merchant_name TEXT,
            merchant_entity_id TEXT,
            payment_channel TEXT,
            category_primary TEXT,
            category_detailed TEXT,
            pending BOOLEAN DEFAULT FALSE,
            location_city TEXT,
            location_region TEXT,
            location_postal_code TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (account_id) REFERENCES accounts(account_id)
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
        ON transactions(user_id, date)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_transactions_account 
        ON transactions(account_id)
    """)
    
    # Liabilities table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS liabilities (
            liability_id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            apr_percentage DECIMAL(5,2),
            apr_type TEXT,
            minimum_payment_amount DECIMAL(10,2),
            last_payment_amount DECIMAL(10,2),
            last_payment_date DATE,
            next_payment_due_date DATE,
            last_statement_balance DECIMAL(10,2),
            is_overdue BOOLEAN DEFAULT FALSE,
            interest_rate DECIMAL(5,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (account_id) REFERENCES accounts(account_id)
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_liabilities_user 
        ON liabilities(user_id)
    """)
    
    # ========================================================================
    # BEHAVIORAL SIGNALS TABLES (From PRD2)
    # ========================================================================
    
    # User signals table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_signals (
            signal_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            window_type TEXT NOT NULL,
            signal_category TEXT NOT NULL,
            signal_data JSON NOT NULL,
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_signals_user_id 
        ON user_signals(user_id)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_signals_category 
        ON user_signals(signal_category)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_signals_window 
        ON user_signals(window_type)
    """)
    
    # Signal metadata table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS signal_metadata (
            metadata_id TEXT PRIMARY KEY,
            signal_id TEXT NOT NULL,
            calculation_time_ms INTEGER,
            data_quality_score REAL,
            missing_fields JSON,
            error_messages JSON,
            FOREIGN KEY (signal_id) REFERENCES user_signals(signal_id)
        )
    """)
    
    # ========================================================================
    # GAMIFICATION TABLES (New - for streak/ring system)
    # ========================================================================
    
    # User streaks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_streaks (
            user_id TEXT PRIMARY KEY,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            last_active_date DATE,
            streak_freezes_available INTEGER DEFAULT 0,
            total_days_active INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    # Daily rings table (Apple Watch style - 3 rings per day)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS daily_rings (
            ring_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            date DATE NOT NULL,
            learning_ring_pct DECIMAL(5,2) DEFAULT 0,
            action_ring_pct DECIMAL(5,2) DEFAULT 0,
            progress_ring_pct DECIMAL(5,2) DEFAULT 0,
            all_closed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            UNIQUE(user_id, date)
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_daily_rings_user_date 
        ON daily_rings(user_id, date)
    """)
    
    # User levels table (progression system)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_levels (
            user_id TEXT PRIMARY KEY,
            level INTEGER DEFAULT 1,
            xp_points INTEGER DEFAULT 0,
            level_name TEXT DEFAULT 'Financial Novice',
            unlocked_features JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    # Completed actions table (tracks what users have done)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS completed_actions (
            action_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            action_type TEXT NOT NULL,
            action_description TEXT,
            ring_type TEXT,
            xp_earned INTEGER DEFAULT 0,
            completed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metadata JSON,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_completed_actions_user 
        ON completed_actions(user_id)
    """)
    
    # Daily recaps table (AI-generated daily summaries)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS daily_recaps (
            recap_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            recap_date DATE NOT NULL,
            summary_text TEXT,
            educational_tip TEXT,
            ring_status JSON,
            transactions_summary JSON,
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            UNIQUE(user_id, recap_date)
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_daily_recaps_user_date 
        ON daily_recaps(user_id, recap_date)
    """)
    
    # ========================================================================
    # PERSONA & RECOMMENDATION TABLES (For future phases)
    # ========================================================================
    
    # User personas table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_personas (
            persona_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            window_type TEXT NOT NULL,
            primary_persona TEXT NOT NULL,
            secondary_personas JSON,
            criteria_met JSON,
            match_strength DECIMAL(3,2),
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_personas_user 
        ON user_personas(user_id)
    """)
    
    # Recommendations table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendations (
            recommendation_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            content_id TEXT,
            content_type TEXT,
            title TEXT,
            rationale TEXT,
            priority INTEGER,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_recommendations_user 
        ON recommendations(user_id)
    """)
    
    # User consent table (GDPR compliance)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_consent (
            consent_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            consent_type TEXT NOT NULL,
            granted BOOLEAN NOT NULL,
            granted_at TIMESTAMP,
            revoked_at TIMESTAMP,
            metadata JSON,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_consent_user 
        ON user_consent(user_id)
    """)
    
    conn.commit()
    conn.close()
    
    print(f"✓ Database schema created successfully at: {db_path}")
    print(f"✓ Created 17 tables with indexes and foreign key constraints")


def reset_database(db_path: str = 'spendsense.db') -> None:
    """
    Drop all tables and recreate schema (USE WITH CAUTION).
    
    Args:
        db_path: Path to SQLite database file
    """
    import os
    
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"✓ Removed existing database: {db_path}")
    
    create_database_schema(db_path)


if __name__ == "__main__":
    # Create database when run directly
    create_database_schema()

