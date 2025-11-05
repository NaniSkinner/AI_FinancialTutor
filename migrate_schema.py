#!/usr/bin/env python3
"""
Database Schema Migration Script

This script fixes the schema mismatch between the PersonaAssigner code
and the actual database schema.

Changes:
1. user_signals: Rename columns to match code expectations
2. user_personas: Rename columns and add missing fields

IMPORTANT: This will back up data and recreate tables with correct schema.
"""

import sqlite3
import sys
from pathlib import Path
from datetime import datetime


def backup_database(db_path: str) -> str:
    """Create a backup of the database before migration."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = f"{db_path}.backup_{timestamp}"
    
    print(f"Creating backup: {backup_path}")
    
    import shutil
    shutil.copy2(db_path, backup_path)
    
    print(f"✓ Backup created successfully")
    return backup_path


def migrate_user_signals_table(conn: sqlite3.Connection) -> None:
    """
    Migrate user_signals table to match code expectations.
    
    Changes:
    - signal_category → signal_type
    - signal_data → signal_json
    """
    print("\n" + "=" * 70)
    print("MIGRATING: user_signals")
    print("=" * 70)
    
    cursor = conn.cursor()
    
    # Check if table has data
    cursor.execute("SELECT COUNT(*) FROM user_signals")
    count = cursor.fetchone()[0]
    print(f"Current rows in user_signals: {count}")
    
    # Create new table with correct schema
    print("Creating user_signals_new with correct schema...")
    cursor.execute("""
        CREATE TABLE user_signals_new (
            signal_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            window_type TEXT NOT NULL,
            signal_type TEXT NOT NULL,
            signal_json TEXT NOT NULL,
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    # Copy data with column name mapping
    print("Copying data with column name mapping...")
    cursor.execute("""
        INSERT INTO user_signals_new (
            signal_id, user_id, window_type, signal_type, signal_json, detected_at
        )
        SELECT 
            signal_id, user_id, window_type, signal_category, signal_data, detected_at
        FROM user_signals
    """)
    
    rows_copied = cursor.rowcount
    print(f"✓ Copied {rows_copied} rows")
    
    # Drop old table
    print("Dropping old user_signals table...")
    cursor.execute("DROP TABLE user_signals")
    
    # Rename new table
    print("Renaming user_signals_new → user_signals...")
    cursor.execute("ALTER TABLE user_signals_new RENAME TO user_signals")
    
    # Create indexes
    print("Creating indexes...")
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_signals_user_window 
        ON user_signals(user_id, window_type)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_signals_type 
        ON user_signals(signal_type)
    """)
    
    print("✓ user_signals migration complete")


def migrate_user_personas_table(conn: sqlite3.Connection) -> None:
    """
    Migrate user_personas table to match code expectations.
    
    Changes:
    - persona_id → assignment_id
    - match_strength → primary_match_strength (change type to TEXT)
    - Add all_matches column
    """
    print("\n" + "=" * 70)
    print("MIGRATING: user_personas")
    print("=" * 70)
    
    cursor = conn.cursor()
    
    # Check if table has data
    cursor.execute("SELECT COUNT(*) FROM user_personas")
    count = cursor.fetchone()[0]
    print(f"Current rows in user_personas: {count}")
    
    # Create new table with correct schema
    print("Creating user_personas_new with correct schema...")
    cursor.execute("""
        CREATE TABLE user_personas_new (
            assignment_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            window_type TEXT NOT NULL,
            primary_persona TEXT NOT NULL,
            primary_match_strength TEXT NOT NULL,
            secondary_personas TEXT,
            criteria_met TEXT,
            all_matches TEXT,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    # Copy data with column name mapping
    print("Copying data with column name mapping...")
    cursor.execute("""
        INSERT INTO user_personas_new (
            assignment_id, user_id, window_type, primary_persona, 
            primary_match_strength, secondary_personas, criteria_met, 
            all_matches, assigned_at
        )
        SELECT 
            persona_id,
            user_id,
            window_type,
            primary_persona,
            CAST(match_strength AS TEXT),
            secondary_personas,
            criteria_met,
            '[]',  -- Initialize empty all_matches array
            assigned_at
        FROM user_personas
    """)
    
    rows_copied = cursor.rowcount
    print(f"✓ Copied {rows_copied} rows")
    
    # Drop old table
    print("Dropping old user_personas table...")
    cursor.execute("DROP TABLE user_personas")
    
    # Rename new table
    print("Renaming user_personas_new → user_personas...")
    cursor.execute("ALTER TABLE user_personas_new RENAME TO user_personas")
    
    # Create indexes
    print("Creating indexes...")
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_personas_user 
        ON user_personas(user_id)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_personas_window 
        ON user_personas(window_type)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_personas_primary 
        ON user_personas(primary_persona)
    """)
    
    print("✓ user_personas migration complete")


def verify_migration(conn: sqlite3.Connection) -> bool:
    """Verify that migration was successful."""
    print("\n" + "=" * 70)
    print("VERIFYING MIGRATION")
    print("=" * 70)
    
    cursor = conn.cursor()
    all_good = True
    
    # Verify user_signals columns
    print("\nChecking user_signals columns...")
    cursor.execute("PRAGMA table_info(user_signals)")
    columns = {row[1] for row in cursor.fetchall()}
    
    required = {'signal_id', 'user_id', 'window_type', 'signal_type', 'signal_json', 'detected_at'}
    missing = required - columns
    extra = columns - required
    
    if missing:
        print(f"  ✗ Missing columns: {missing}")
        all_good = False
    else:
        print(f"  ✓ All required columns present")
    
    if 'signal_category' in columns or 'signal_data' in columns:
        print(f"  ✗ Old columns still present: {extra & {'signal_category', 'signal_data'}}")
        all_good = False
    else:
        print(f"  ✓ Old columns removed")
    
    # Verify user_personas columns
    print("\nChecking user_personas columns...")
    cursor.execute("PRAGMA table_info(user_personas)")
    columns = {row[1] for row in cursor.fetchall()}
    
    required = {'assignment_id', 'user_id', 'window_type', 'primary_persona', 
                'primary_match_strength', 'secondary_personas', 'criteria_met', 
                'all_matches', 'assigned_at'}
    missing = required - columns
    
    if missing:
        print(f"  ✗ Missing columns: {missing}")
        all_good = False
    else:
        print(f"  ✓ All required columns present")
    
    if 'persona_id' in columns or 'match_strength' in columns:
        print(f"  ✗ Old columns still present")
        all_good = False
    else:
        print(f"  ✓ Old columns removed")
    
    # Check primary_match_strength type
    cursor.execute("PRAGMA table_info(user_personas)")
    for row in cursor.fetchall():
        if row[1] == 'primary_match_strength':
            if row[2] == 'TEXT':
                print(f"  ✓ primary_match_strength is TEXT type")
            else:
                print(f"  ✗ primary_match_strength has wrong type: {row[2]}")
                all_good = False
    
    return all_good


def main():
    """Run the migration."""
    db_path = 'spendsense.db'
    
    print("=" * 70)
    print("SPENDSENSE DATABASE SCHEMA MIGRATION")
    print("=" * 70)
    print()
    print("This script will fix the schema mismatch between PersonaAssigner")
    print("code and the database schema.")
    print()
    
    # Check if database exists
    if not Path(db_path).exists():
        print(f"✗ Error: Database not found at {db_path}")
        sys.exit(1)
    
    # Create backup
    try:
        backup_path = backup_database(db_path)
    except Exception as e:
        print(f"✗ Error creating backup: {e}")
        sys.exit(1)
    
    # Run migration
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        
        # Enable foreign keys
        conn.execute("PRAGMA foreign_keys = OFF")  # Disable during migration
        
        # Migrate tables
        migrate_user_signals_table(conn)
        migrate_user_personas_table(conn)
        
        # Commit changes
        conn.commit()
        
        # Re-enable foreign keys
        conn.execute("PRAGMA foreign_keys = ON")
        
        # Verify migration
        success = verify_migration(conn)
        
        conn.close()
        
        if success:
            print("\n" + "=" * 70)
            print("✓ MIGRATION COMPLETED SUCCESSFULLY")
            print("=" * 70)
            print()
            print(f"Backup saved at: {backup_path}")
            print(f"Database updated at: {db_path}")
            print()
            print("You can now run the PersonaAssigner with the corrected schema.")
            print()
        else:
            print("\n" + "=" * 70)
            print("✗ MIGRATION COMPLETED WITH WARNINGS")
            print("=" * 70)
            print()
            print("Please review the warnings above.")
            print(f"Backup available at: {backup_path}")
            print()
            
    except Exception as e:
        print(f"\n✗ ERROR DURING MIGRATION: {e}")
        print(f"\nRestoring from backup: {backup_path}")
        import shutil
        shutil.copy2(backup_path, db_path)
        print("✓ Database restored from backup")
        sys.exit(1)


if __name__ == '__main__':
    main()

