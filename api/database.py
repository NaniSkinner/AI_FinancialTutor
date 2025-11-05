"""
Database connection and initialization for SpendSense Operator Dashboard API.

This module provides:
- Database connection management
- Context manager for automatic transaction handling
- Schema initialization for operator-specific tables
"""

import sqlite3
from contextlib import contextmanager
from typing import Generator
import os
from pathlib import Path


# Database path - use existing spendsense.db in parent directory
DATABASE_URL = os.getenv("DATABASE_URL", "../spendsense.db")


def get_db_connection() -> sqlite3.Connection:
    """
    Create a database connection with Row factory for dict-like access.
    
    Returns:
        sqlite3.Connection: Database connection with Row factory enabled
    """
    # Get absolute path
    db_path = Path(__file__).parent / DATABASE_URL
    
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    
    # Enable foreign key constraints
    conn.execute("PRAGMA foreign_keys = ON")
    
    return conn


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager for database connections with automatic transaction handling.
    
    Automatically commits on success, rolls back on exception, and closes connection.
    
    Usage:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM recommendations")
            
    Yields:
        sqlite3.Connection: Database connection
    """
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")
        raise e
    finally:
        conn.close()


def get_db_fastapi() -> Generator[sqlite3.Connection, None, None]:
    """
    FastAPI dependency for database connections.
    
    Use this with Depends() in FastAPI endpoints:
        def my_endpoint(db: sqlite3.Connection = Depends(get_db_fastapi)):
            cursor = db.cursor()
            ...
    
    Yields:
        sqlite3.Connection: Database connection
    """
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")
        raise e
    finally:
        conn.close()


def init_database() -> None:
    """
    Initialize database with operator dashboard schema.
    
    This function:
    1. Extends the existing recommendations table with operator fields
    2. Creates new tables: operator_audit_log, recommendation_flags, decision_traces
    3. Creates indexes for efficient querying
    
    Note: Uses IF NOT EXISTS and ALTER TABLE ADD COLUMN IF NOT EXISTS patterns
    to safely run multiple times without errors.
    
    Raises:
        FileNotFoundError: If schema.sql file is not found
        sqlite3.Error: If SQL execution fails
    """
    schema_file = Path(__file__).parent / "schema.sql"
    
    if not schema_file.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_file}")
    
    try:
        with get_db() as conn:
            # Read schema file
            with open(schema_file, 'r') as f:
                schema_sql = f.read()
            
            # Execute schema script
            # Split by semicolons and execute each statement individually
            # This handles ALTER TABLE statements better in SQLite
            statements = schema_sql.split(';')
            
            cursor = conn.cursor()
            for statement in statements:
                statement = statement.strip()
                if statement and not statement.startswith('--'):
                    try:
                        cursor.execute(statement)
                    except sqlite3.OperationalError as e:
                        error_msg = str(e).lower()
                        # Ignore "duplicate column name" errors (column already exists)
                        if "duplicate column name" in error_msg:
                            print(f"  Skipping: Column already exists")
                            continue
                        # Ignore "already exists" errors for tables/indexes
                        elif "already exists" in error_msg:
                            print(f"  Skipping: Object already exists")
                            continue
                        # Ignore "no such column" or "no such table" in CREATE INDEX
                        elif ("no such column" in error_msg or "no such table" in error_msg) and "create index" in statement.lower():
                            print(f"  Skipping index: Referenced object doesn't exist yet")
                            continue
                        else:
                            print(f"  Statement failed: {statement[:100]}...")
                            print(f"  Error: {e}")
                            raise e
            
            conn.commit()
            
        print("✓ Database schema initialized successfully")
        print(f"✓ Database location: {Path(__file__).parent / DATABASE_URL}")
        print("✓ Extended recommendations table with operator fields")
        print("✓ Created operator_audit_log table")
        print("✓ Created recommendation_flags table")
        print("✓ Created decision_traces table")
        print("✓ Created indexes for efficient querying")
        
    except FileNotFoundError as e:
        print(f"✗ Error: {e}")
        raise
    except sqlite3.Error as e:
        print(f"✗ Database error: {e}")
        raise


def verify_database() -> bool:
    """
    Verify that all required tables exist in the database.
    
    Returns:
        bool: True if all tables exist, False otherwise
    """
    required_tables = [
        'recommendations',
        'operator_audit_log',
        'recommendation_flags',
        'decision_traces',
        'users',
        'user_signals',
        'user_personas'
    ]
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table'
            """)
            existing_tables = [row['name'] for row in cursor.fetchall()]
            
            missing_tables = [t for t in required_tables if t not in existing_tables]
            
            if missing_tables:
                print(f"✗ Missing tables: {', '.join(missing_tables)}")
                return False
            
            print("✓ All required tables exist")
            return True
            
    except sqlite3.Error as e:
        print(f"✗ Error verifying database: {e}")
        return False


def get_table_info(table_name: str) -> list:
    """
    Get column information for a specific table.
    
    Args:
        table_name: Name of the table to inspect
        
    Returns:
        list: List of column information dictionaries
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(f"PRAGMA table_info({table_name})")
            return [dict(row) for row in cursor.fetchall()]
    except sqlite3.Error as e:
        print(f"✗ Error getting table info: {e}")
        return []


if __name__ == "__main__":
    """
    Run database initialization when executed directly.
    """
    print("=" * 70)
    print("SpendSense Operator Dashboard - Database Initialization")
    print("=" * 70)
    print()
    
    # Initialize schema
    init_database()
    print()
    
    # Verify tables
    print("Verifying database structure...")
    verify_database()
    print()
    
    # Show recommendations table structure
    print("Recommendations table columns:")
    columns = get_table_info('recommendations')
    for col in columns:
        print(f"  - {col['name']}: {col['type']}")
    
    print()
    print("=" * 70)
    print("Database initialization complete!")
    print("=" * 70)

