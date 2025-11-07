"""
SQLite to Firestore Migration Script

Migrates all data from SQLite database to Firebase Firestore.

Usage:
    python migrations/sqlite_to_firestore.py --source spendsense.db --env production
    
    Options:
        --source: Path to SQLite database file (default: spendsense.db)
        --env: Target environment (default: production)
        --dry-run: Preview changes without writing to Firestore
        --batch-size: Number of documents per batch (default: 500)
"""

import sqlite3
import sys
import os
import argparse
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from firebase_config import (
        get_firestore_client,
        set_document,
        test_connection
    )
    import firebase_admin
    from google.cloud import firestore
    FIREBASE_AVAILABLE = True
except ImportError as e:
    FIREBASE_AVAILABLE = False
    print(f"Error: Firebase not available: {e}")
    print("Install with: pip install firebase-admin")

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SQLiteToFirestoreMigration:
    """Handles migration from SQLite to Firestore"""
    
    def __init__(self, sqlite_path: str, dry_run: bool = False, batch_size: int = 500):
        self.sqlite_path = sqlite_path
        self.dry_run = dry_run
        self.batch_size = batch_size
        self.stats = {
            'users': 0,
            'recommendations': 0,
            'user_signals': 0,
            'persona_history': 0,
            'audit_logs': 0,
            'errors': 0
        }
        
        if not FIREBASE_AVAILABLE:
            raise RuntimeError("Firebase Admin SDK not available")
        
        # Test Firebase connection
        if not test_connection():
            raise RuntimeError("Failed to connect to Firebase")
        
        self.db = get_firestore_client()
        self.sqlite_conn = sqlite3.connect(sqlite_path)
        self.sqlite_conn.row_factory = sqlite3.Row  # Access columns by name
        
        logger.info(f"Initialized migration from {sqlite_path}")
        logger.info(f"Dry run: {dry_run}")
    
    def get_table_names(self) -> List[str]:
        """Get all table names from SQLite database"""
        cursor = self.sqlite_conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = [row[0] for row in cursor.fetchall()]
        logger.info(f"Found {len(tables)} tables: {', '.join(tables)}")
        return tables
    
    def convert_row_to_dict(self, row: sqlite3.Row) -> Dict[str, Any]:
        """Convert SQLite row to dictionary, handling types"""
        data = dict(row)
        
        # Convert datetime strings to Firestore timestamps
        for key, value in data.items():
            if value is None:
                continue
            
            # Handle datetime fields
            if isinstance(value, str) and self._is_datetime_field(key):
                try:
                    dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    data[key] = firestore.SERVER_TIMESTAMP if key.endswith('_at') else dt
                except (ValueError, AttributeError):
                    pass
            
            # Handle boolean fields (SQLite stores as 0/1)
            elif isinstance(value, int) and self._is_boolean_field(key):
                data[key] = bool(value)
        
        return data
    
    def _is_datetime_field(self, field_name: str) -> bool:
        """Check if field name indicates a datetime"""
        datetime_suffixes = ['_at', '_date', 'timestamp']
        return any(field_name.endswith(suffix) for suffix in datetime_suffixes)
    
    def _is_boolean_field(self, field_name: str) -> bool:
        """Check if field name indicates a boolean"""
        boolean_patterns = ['is_', 'has_', 'any_', 'completed', 'enabled']
        return any(pattern in field_name for pattern in boolean_patterns)
    
    def migrate_table(self, table_name: str, collection_name: Optional[str] = None):
        """
        Migrate a single table to Firestore collection
        
        Args:
            table_name: Name of SQLite table
            collection_name: Name of Firestore collection (defaults to table_name)
        """
        if collection_name is None:
            collection_name = table_name
        
        logger.info(f"Migrating {table_name} -> {collection_name}")
        
        # Get all rows from table
        cursor = self.sqlite_conn.cursor()
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        
        if not rows:
            logger.warning(f"No data found in {table_name}")
            return
        
        logger.info(f"Found {len(rows)} rows in {table_name}")
        
        # Determine ID field
        id_field = self._get_id_field(rows[0].keys())
        if not id_field:
            logger.error(f"Could not determine ID field for {table_name}")
            return
        
        # Batch write to Firestore
        batch = self.db.batch()
        batch_count = 0
        migrated = 0
        
        for row in rows:
            try:
                data = self.convert_row_to_dict(row)
                doc_id = str(data[id_field])
                
                if not self.dry_run:
                    doc_ref = self.db.collection(collection_name).document(doc_id)
                    batch.set(doc_ref, data)
                    batch_count += 1
                    
                    # Commit batch when it reaches batch_size
                    if batch_count >= self.batch_size:
                        batch.commit()
                        logger.info(f"Committed batch of {batch_count} documents")
                        batch = self.db.batch()
                        batch_count = 0
                
                migrated += 1
                
                if migrated % 100 == 0:
                    logger.info(f"Processed {migrated}/{len(rows)} rows")
                    
            except Exception as e:
                logger.error(f"Error migrating row {row[id_field]}: {e}")
                self.stats['errors'] += 1
        
        # Commit remaining documents
        if not self.dry_run and batch_count > 0:
            batch.commit()
            logger.info(f"Committed final batch of {batch_count} documents")
        
        self.stats[collection_name] = migrated
        logger.info(f"✓ Migrated {migrated} documents to {collection_name}")
    
    def _get_id_field(self, columns: List[str]) -> Optional[str]:
        """Determine which field is the ID field"""
        # Common ID field patterns
        id_patterns = ['id', '_id', 'user_id', 'recommendation_id', 'log_id']
        
        for pattern in id_patterns:
            if pattern in columns:
                return pattern
        
        # Fallback: use first column that ends with '_id' or 'id'
        for col in columns:
            if col.endswith('_id') or col.endswith('id'):
                return col
        
        return None
    
    def migrate_all(self):
        """Migrate all tables to Firestore"""
        logger.info("=" * 70)
        logger.info("Starting full migration")
        logger.info("=" * 70)
        
        # Table to collection mapping
        migrations = [
            ('users', 'users'),
            ('recommendations', 'recommendations'),
            ('user_signals', 'user_signals'),
            ('user_personas', 'persona_history'),
            ('operator_audit_log', 'audit_logs'),
        ]
        
        for table_name, collection_name in migrations:
            try:
                # Check if table exists
                cursor = self.sqlite_conn.cursor()
                cursor.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
                    (table_name,)
                )
                if cursor.fetchone():
                    self.migrate_table(table_name, collection_name)
                else:
                    logger.warning(f"Table {table_name} not found, skipping")
            except Exception as e:
                logger.error(f"Error migrating {table_name}: {e}")
                self.stats['errors'] += 1
        
        logger.info("=" * 70)
        logger.info("Migration Summary")
        logger.info("=" * 70)
        for collection, count in self.stats.items():
            if collection != 'errors':
                logger.info(f"  {collection}: {count} documents")
        logger.info(f"  Errors: {self.stats['errors']}")
        logger.info("=" * 70)
        
        if self.dry_run:
            logger.info("DRY RUN COMPLETE - No data was written to Firestore")
        else:
            logger.info("MIGRATION COMPLETE")
    
    def verify_migration(self):
        """Verify that data was migrated correctly"""
        logger.info("Verifying migration...")
        
        tables_to_verify = ['users', 'recommendations', 'user_signals']
        
        for table in tables_to_verify:
            # Count SQLite rows
            cursor = self.sqlite_conn.cursor()
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            sqlite_count = cursor.fetchone()[0]
            
            # Count Firestore documents
            if not self.dry_run:
                firestore_count = len(list(self.db.collection(table).stream()))
                
                if sqlite_count == firestore_count:
                    logger.info(f"✓ {table}: {sqlite_count} documents match")
                else:
                    logger.error(
                        f"✗ {table}: SQLite has {sqlite_count}, "
                        f"Firestore has {firestore_count}"
                    )
    
    def close(self):
        """Close database connections"""
        if self.sqlite_conn:
            self.sqlite_conn.close()


def main():
    parser = argparse.ArgumentParser(
        description='Migrate SQLite database to Firebase Firestore'
    )
    parser.add_argument(
        '--source',
        type=str,
        default='spendsense.db',
        help='Path to SQLite database file'
    )
    parser.add_argument(
        '--env',
        type=str,
        default='production',
        choices=['development', 'staging', 'production'],
        help='Target environment'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview migration without writing to Firestore'
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=500,
        help='Number of documents per batch (max 500)'
    )
    parser.add_argument(
        '--verify',
        action='store_true',
        help='Verify migration after completion'
    )
    
    args = parser.parse_args()
    
    # Validate source file exists
    if not os.path.exists(args.source):
        logger.error(f"SQLite database not found: {args.source}")
        sys.exit(1)
    
    # Validate Firebase configuration
    if not FIREBASE_AVAILABLE:
        logger.error("Firebase Admin SDK not installed")
        logger.error("Install with: pip install firebase-admin")
        sys.exit(1)
    
    # Set environment
    os.environ['ENVIRONMENT'] = args.env
    logger.info(f"Target environment: {args.env}")
    
    try:
        # Run migration
        migration = SQLiteToFirestoreMigration(
            args.source,
            dry_run=args.dry_run,
            batch_size=min(args.batch_size, 500)
        )
        
        migration.migrate_all()
        
        if args.verify and not args.dry_run:
            migration.verify_migration()
        
        migration.close()
        
        logger.info("✓ Migration completed successfully")
        sys.exit(0)
        
    except Exception as e:
        logger.error(f"Migration failed: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()

