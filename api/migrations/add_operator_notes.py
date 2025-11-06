"""
Database Migration: Add Operator Notes Support
===============================================

Adds recommendation_notes table for persistent, editable operator notes.

Features:
- Multiple notes per recommendation
- Edit and delete capabilities
- Operator attribution
- Timestamp tracking (created/updated)

Run with: python api/migrations/add_operator_notes.py
"""

import sqlite3
from datetime import datetime
from pathlib import Path


def migrate():
    """
    Add operator notes table to database.
    
    Creates:
    - recommendation_notes table
    - Indexes for performance
    """
    # Get database path
    db_path = Path(__file__).parent.parent.parent / "spendsense.db"
    
    print(f"\n{'='*70}")
    print("Database Migration: Add Operator Notes Support")
    print(f"{'='*70}")
    print(f"Database: {db_path}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        # Check if table already exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='recommendation_notes'
        """)
        
        if cursor.fetchone():
            print("⚠️  Table 'recommendation_notes' already exists - skipping creation")
        else:
            print("📝 Creating recommendation_notes table...")
            
            # Create recommendation_notes table
            cursor.execute("""
                CREATE TABLE recommendation_notes (
                    note_id TEXT PRIMARY KEY,
                    recommendation_id TEXT NOT NULL,
                    operator_id TEXT NOT NULL,
                    note_text TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP,
                    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
                )
            """)
            print("   ✅ Table created successfully")
        
        # Create indexes
        print("\n📇 Creating indexes...")
        
        # Index for finding notes by recommendation
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_notes_recommendation 
            ON recommendation_notes(recommendation_id)
        """)
        print("   ✅ idx_notes_recommendation")
        
        # Index for sorting by creation date
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_notes_created_at 
            ON recommendation_notes(created_at DESC)
        """)
        print("   ✅ idx_notes_created_at")
        
        # Index for operator activity
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_notes_operator 
            ON recommendation_notes(operator_id)
        """)
        print("   ✅ idx_notes_operator")
        
        # Commit changes
        conn.commit()
        
        # Verify table structure
        print("\n🔍 Verifying table structure...")
        cursor.execute("PRAGMA table_info(recommendation_notes)")
        columns = cursor.fetchall()
        
        expected_columns = ['note_id', 'recommendation_id', 'operator_id', 
                          'note_text', 'created_at', 'updated_at']
        actual_columns = [col['name'] for col in columns]
        
        print(f"   Expected columns: {len(expected_columns)}")
        print(f"   Actual columns: {len(actual_columns)}")
        
        for col in columns:
            print(f"   - {col['name']}: {col['type']}")
        
        if set(expected_columns) == set(actual_columns):
            print("\n   ✅ Table structure verified")
        else:
            print("\n   ⚠️  Column mismatch detected")
            missing = set(expected_columns) - set(actual_columns)
            extra = set(actual_columns) - set(expected_columns)
            if missing:
                print(f"   Missing: {missing}")
            if extra:
                print(f"   Extra: {extra}")
        
        # Count existing notes
        cursor.execute("SELECT COUNT(*) as count FROM recommendation_notes")
        count = cursor.fetchone()['count']
        print(f"\n📊 Current notes count: {count}")
        
        print(f"\n{'='*70}")
        print("✅ Migration completed successfully!")
        print(f"{'='*70}")
        print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
    except Exception as e:
        print(f"\n❌ Error during migration: {str(e)}")
        conn.rollback()
        raise
    
    finally:
        conn.close()


def rollback():
    """
    Rollback migration (remove notes table).
    WARNING: This will delete all notes data!
    """
    db_path = Path(__file__).parent.parent.parent / "spendsense.db"
    
    print(f"\n{'='*70}")
    print("Database Rollback: Remove Operator Notes Support")
    print(f"{'='*70}")
    print(f"⚠️  WARNING: This will delete all notes data!")
    print()
    
    confirm = input("Type 'DELETE' to confirm rollback: ")
    if confirm != 'DELETE':
        print("❌ Rollback cancelled")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("\n🗑️  Dropping indexes...")
        cursor.execute("DROP INDEX IF EXISTS idx_notes_recommendation")
        cursor.execute("DROP INDEX IF EXISTS idx_notes_created_at")
        cursor.execute("DROP INDEX IF EXISTS idx_notes_operator")
        print("   ✅ Indexes dropped")
        
        print("\n🗑️  Dropping table...")
        cursor.execute("DROP TABLE IF EXISTS recommendation_notes")
        print("   ✅ Table dropped")
        
        conn.commit()
        
        print(f"\n{'='*70}")
        print("✅ Rollback completed successfully!")
        print(f"{'='*70}\n")
        
    except Exception as e:
        print(f"\n❌ Error during rollback: {str(e)}")
        conn.rollback()
        raise
    
    finally:
        conn.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'rollback':
        rollback()
    else:
        migrate()

