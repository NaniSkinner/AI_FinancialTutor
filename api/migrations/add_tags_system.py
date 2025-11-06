"""
Database Migration: Add Tags System
=====================================

Creates the recommendation_tags table and indexes to support
the tagging system for categorizing recommendations.

Run: python3 api/migrations/add_tags_system.py
"""

import sqlite3
from datetime import datetime
import os

def migrate():
    # Get the correct database path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, "../../spendsense.db")
    db_path = os.path.normpath(db_path)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("\n" + "=" * 70)
    print("Database Migration: Add Tags System")
    print("=" * 70)
    print(f"Database: {db_path}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        # Check if table already exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='recommendation_tags'")
        if cursor.fetchone():
            print("📝 Table 'recommendation_tags' already exists. Skipping creation.")
        else:
            print("📝 Creating recommendation_tags table...")
            cursor.execute("""
                CREATE TABLE recommendation_tags (
                    tag_id TEXT PRIMARY KEY,
                    recommendation_id TEXT NOT NULL,
                    tag_name TEXT NOT NULL,
                    tagged_by TEXT NOT NULL,
                    tagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
                );
            """)
            print("   ✅ Table created successfully")

        # Create indexes if they don't exist
        print("\n📇 Creating indexes...")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tags_recommendation ON recommendation_tags(recommendation_id);")
        print("   ✅ idx_tags_recommendation")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tags_name ON recommendation_tags(tag_name);")
        print("   ✅ idx_tags_name")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tags_tagged_at ON recommendation_tags(tagged_at DESC);")
        print("   ✅ idx_tags_tagged_at")

        # Verify table structure
        print("\n🔍 Verifying table structure...")
        cursor.execute("PRAGMA table_info(recommendation_tags)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        expected_columns = ["tag_id", "recommendation_id", "tag_name", "tagged_by", "tagged_at"]

        if len(columns) == len(expected_columns) and all(col in column_names for col in expected_columns):
            print(f"   Expected columns: {len(expected_columns)}")
            print(f"   Actual columns: {len(columns)}")
            for col in columns:
                print(f"   - {col[1]}: {col[2]}")
            print("   ✅ Table structure verified")
        else:
            print("   ❌ Table structure mismatch!")
            print(f"      Expected: {expected_columns}")
            print(f"      Actual: {column_names}")
            raise Exception("Table structure verification failed.")

        # Verify indexes
        print("\n🔍 Verifying indexes...")
        cursor.execute("PRAGMA index_list(recommendation_tags)")
        indexes = cursor.fetchall()
        print(f"   Found {len(indexes)} indexes:")
        for idx in indexes:
            print(f"   - {idx[1]}")

        # Report current data count
        cursor.execute("SELECT COUNT(*) FROM recommendation_tags")
        current_tags_count = cursor.fetchone()[0]
        print(f"\n📊 Current tags count: {current_tags_count}")

        # Display predefined tags
        print("\n🏷️  Predefined Tag Categories:")
        predefined_tags = [
            "needs_review",
            "edge_case",
            "training_example",
            "policy_question",
            "tone_concern",
            "eligibility_question",
            "llm_error",
            "great_example",
        ]
        for tag in predefined_tags:
            print(f"   - {tag}")

        conn.commit()
        print("\n" + "=" * 70)
        print("✅ Migration completed successfully!")
        print("=" * 70)

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {e}")
        print("=" * 70)
        raise
    finally:
        conn.close()
        print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

if __name__ == "__main__":
    migrate()

