"""
Migration: Add Undo Support Columns to Recommendations Table

This migration adds three columns to the recommendations table to enable
the undo action system:
- previous_status: Stores the status before the last action
- status_changed_at: Timestamp when status was last changed
- undo_window_expires_at: Timestamp when undo window expires (5 minutes after action)

Date: November 6, 2025
"""

import sqlite3
import sys
import os
from datetime import datetime

# Add parent directory to path to import database module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'spendsense.db')


def migrate():
    """Add undo support columns to recommendations table."""
    print(f"\n{'='*70}")
    print("Migration: Add Undo Support Columns")
    print(f"{'='*70}\n")
    print(f"Database: {DB_PATH}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Check current table structure
        print("Checking current table structure...")
        cursor.execute("PRAGMA table_info(recommendations)")
        columns = {col['name'] for col in cursor.fetchall()}
        print(f"Found {len(columns)} existing columns\n")
        
        # Track changes
        added_columns = []
        
        # Add previous_status column
        if "previous_status" not in columns:
            print("Adding column: previous_status (TEXT)")
            cursor.execute("ALTER TABLE recommendations ADD COLUMN previous_status TEXT")
            added_columns.append("previous_status")
        else:
            print("✓ Column already exists: previous_status")
        
        # Add status_changed_at column
        if "status_changed_at" not in columns:
            print("Adding column: status_changed_at (TIMESTAMP)")
            cursor.execute("ALTER TABLE recommendations ADD COLUMN status_changed_at TIMESTAMP")
            added_columns.append("status_changed_at")
        else:
            print("✓ Column already exists: status_changed_at")
        
        # Add undo_window_expires_at column
        if "undo_window_expires_at" not in columns:
            print("Adding column: undo_window_expires_at (TIMESTAMP)")
            cursor.execute("ALTER TABLE recommendations ADD COLUMN undo_window_expires_at TIMESTAMP")
            added_columns.append("undo_window_expires_at")
        else:
            print("✓ Column already exists: undo_window_expires_at")
        
        # Commit changes
        if added_columns:
            conn.commit()
            print(f"\n✅ Successfully added {len(added_columns)} column(s):")
            for col in added_columns:
                print(f"   - {col}")
        else:
            print("\n✅ All columns already exist - no changes needed")
        
        # Verify final structure
        print("\nVerifying table structure...")
        cursor.execute("PRAGMA table_info(recommendations)")
        final_columns = cursor.fetchall()
        
        undo_columns = [col for col in final_columns if col['name'] in 
                       ['previous_status', 'status_changed_at', 'undo_window_expires_at']]
        
        if len(undo_columns) == 3:
            print("✓ All undo support columns present")
            print("\nUndo support columns:")
            for col in undo_columns:
                print(f"   - {col['name']:30} {col['type']:15} (Null: {bool(col['notnull'] == 0)})")
        else:
            print(f"⚠️  Warning: Only {len(undo_columns)}/3 columns found")
            return False
        
        # Count recommendations
        cursor.execute("SELECT COUNT(*) as count FROM recommendations")
        count = cursor.fetchone()['count']
        print(f"\nTotal recommendations in database: {count}")
        
        conn.close()
        
        print(f"\n{'='*70}")
        print(f"Migration completed successfully at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*70}\n")
        
        return True
        
    except sqlite3.Error as e:
        print(f"\n❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False


def rollback():
    """
    Rollback migration by removing undo support columns.
    Note: SQLite doesn't support DROP COLUMN directly, so this is informational only.
    """
    print("\n⚠️  SQLite does not support DROP COLUMN")
    print("To rollback, you would need to:")
    print("1. Create a new table without these columns")
    print("2. Copy data to the new table")
    print("3. Drop old table and rename new table")
    print("\nHowever, these columns are harmless if unused.")


if __name__ == "__main__":
    # Check if database exists
    if not os.path.exists(DB_PATH):
        print(f"❌ Error: Database not found at {DB_PATH}")
        print("Please ensure spendsense.db exists in the project root.")
        sys.exit(1)
    
    # Run migration
    success = migrate()
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)

