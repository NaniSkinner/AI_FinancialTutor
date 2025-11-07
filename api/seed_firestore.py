"""
Firestore Seed Data Script

Generates synthetic data directly in Firestore for production testing.

Usage:
    python seed_firestore.py --users 50 --env production
    
    Options:
        --users: Number of users to generate (default: 50)
        --env: Target environment (default: production)
        --clear: Clear existing data before seeding
"""

import sys
import os
import argparse
import logging
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from firebase_config import get_firestore_client, set_document, test_connection
    import firebase_admin
    from google.cloud import firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    print("Error: Firebase not available. Install with: pip install firebase-admin")

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class FirestoreSeeder:
    """Generates and seeds synthetic data in Firestore"""
    
    def __init__(self, num_users: int = 50, clear_existing: bool = False):
        self.num_users = num_users
        self.clear_existing = clear_existing
        
        if not FIREBASE_AVAILABLE:
            raise RuntimeError("Firebase Admin SDK not available")
        
        if not test_connection():
            raise RuntimeError("Failed to connect to Firebase")
        
        self.db = get_firestore_client()
        logger.info(f"Initialized seeder for {num_users} users")
    
    def clear_collection(self, collection_name: str):
        """Delete all documents in a collection"""
        logger.info(f"Clearing collection: {collection_name}")
        
        docs = self.db.collection(collection_name).stream()
        deleted = 0
        
        for doc in docs:
            doc.reference.delete()
            deleted += 1
            if deleted % 100 == 0:
                logger.info(f"Deleted {deleted} documents from {collection_name}")
        
        logger.info(f"✓ Cleared {deleted} documents from {collection_name}")
    
    def generate_user(self, user_id: str) -> Dict[str, Any]:
        """Generate a synthetic user"""
        return {
            'user_id': user_id,
            'email': f"user{user_id.split('_')[1]}@example.com",
            'created_at': firestore.SERVER_TIMESTAMP,
            'consent_preferences': {
                'dataAnalysis': True,
                'recommendations': True,
                'partnerOffers': random.choice([True, False]),
                'marketingEmails': random.choice([True, False]),
            },
            'onboarding_completed': True,
        }
    
    def generate_user_signals(self, user_id: str) -> Dict[str, Any]:
        """Generate synthetic user signals"""
        utilization = random.randint(15, 85)
        
        return {
            'user_id': user_id,
            'window_type': '30d',
            'calculated_at': firestore.SERVER_TIMESTAMP,
            'signals': {
                'subscriptions': {
                    'recurring_merchant_count': random.randint(2, 8),
                    'monthly_recurring_spend': round(random.uniform(50, 300), 2),
                    'subscription_share_pct': round(random.uniform(5, 15), 1),
                },
                'credit': {
                    'total_credit_available': random.randint(3000, 15000),
                    'total_credit_used': random.randint(1000, 8000),
                    'aggregate_utilization_pct': utilization,
                    'any_card_high_util': utilization > 70,
                    'any_interest_charges': random.choice([True, False]),
                },
                'savings': {
                    'total_savings_balance': random.randint(1000, 15000),
                    'net_savings_inflow': round(random.uniform(-200, 500), 2),
                    'savings_growth_rate_pct': round(random.uniform(-5, 10), 1),
                    'emergency_fund_months': round(random.uniform(0.5, 6), 1),
                },
                'income': {
                    'income_type': random.choice(['steady', 'variable', 'irregular']),
                    'monthly_income': random.randint(2500, 8000),
                    'payment_frequency': random.choice(['biweekly', 'monthly', 'weekly']),
                    'cash_flow_buffer_months': round(random.uniform(0.3, 3), 1),
                }
            }
        }
    
    def generate_recommendation(self, rec_id: str, user_id: str) -> Dict[str, Any]:
        """Generate a synthetic recommendation"""
        personas = ['budget_conscious', 'goal_oriented', 'debt_focused', 'passive_saver', 'variable_income']
        priorities = ['high', 'medium', 'low']
        statuses = ['pending', 'approved', 'rejected', 'flagged']
        
        status = random.choices(statuses, weights=[40, 50, 5, 5])[0]
        
        created_at = datetime.now() - timedelta(days=random.randint(0, 30))
        
        rec = {
            'recommendation_id': rec_id,
            'user_id': user_id,
            'status': status,
            'persona_primary': random.choice(personas),
            'persona_secondary': random.sample(personas, k=random.randint(0, 2)),
            'priority': random.choice(priorities),
            'title': f"Recommendation for {user_id}",
            'rationale': "Generated synthetic recommendation for testing",
            'content_id': f"content_{random.randint(1, 25)}",
            'created_at': created_at,
            'generated_at': created_at,
        }
        
        # Add approval fields if approved
        if status == 'approved':
            rec['approved_by'] = f"op_{random.randint(1, 5):03d}"
            rec['approved_at'] = created_at + timedelta(hours=random.randint(1, 48))
            rec['operator_notes'] = "Approved during testing"
        
        return rec
    
    def seed_users(self):
        """Seed users collection"""
        logger.info(f"Seeding {self.num_users} users...")
        
        batch = self.db.batch()
        
        for i in range(1, self.num_users + 1):
            user_id = f"user_{i:03d}"
            user_data = self.generate_user(user_id)
            
            doc_ref = self.db.collection('users').document(user_id)
            batch.set(doc_ref, user_data)
            
            if i % 100 == 0:
                batch.commit()
                logger.info(f"Committed batch: {i} users")
                batch = self.db.batch()
        
        batch.commit()
        logger.info(f"✓ Seeded {self.num_users} users")
    
    def seed_user_signals(self):
        """Seed user signals collection"""
        logger.info(f"Seeding user signals for {self.num_users} users...")
        
        batch = self.db.batch()
        
        for i in range(1, self.num_users + 1):
            user_id = f"user_{i:03d}"
            signals_data = self.generate_user_signals(user_id)
            
            doc_ref = self.db.collection('user_signals').document(user_id)
            batch.set(doc_ref, signals_data)
            
            if i % 100 == 0:
                batch.commit()
                logger.info(f"Committed batch: {i} signal sets")
                batch = self.db.batch()
        
        batch.commit()
        logger.info(f"✓ Seeded {self.num_users} user signals")
    
    def seed_recommendations(self, recs_per_user: int = 3):
        """Seed recommendations collection"""
        total_recs = self.num_users * recs_per_user
        logger.info(f"Seeding {total_recs} recommendations...")
        
        batch = self.db.batch()
        rec_count = 0
        
        for i in range(1, self.num_users + 1):
            user_id = f"user_{i:03d}"
            
            for j in range(1, recs_per_user + 1):
                rec_id = f"rec_{i:03d}_{j:02d}"
                rec_data = self.generate_recommendation(rec_id, user_id)
                
                doc_ref = self.db.collection('recommendations').document(rec_id)
                batch.set(doc_ref, rec_data)
                
                rec_count += 1
                
                if rec_count % 100 == 0:
                    batch.commit()
                    logger.info(f"Committed batch: {rec_count} recommendations")
                    batch = self.db.batch()
        
        batch.commit()
        logger.info(f"✓ Seeded {total_recs} recommendations")
    
    def seed_all(self):
        """Seed all collections"""
        logger.info("=" * 70)
        logger.info("Starting Firestore seeding")
        logger.info("=" * 70)
        
        if self.clear_existing:
            logger.warning("Clearing existing data...")
            self.clear_collection('users')
            self.clear_collection('user_signals')
            self.clear_collection('recommendations')
        
        self.seed_users()
        self.seed_user_signals()
        self.seed_recommendations()
        
        logger.info("=" * 70)
        logger.info("✓ Seeding complete")
        logger.info("=" * 70)


def main():
    parser = argparse.ArgumentParser(
        description='Seed Firestore with synthetic data'
    )
    parser.add_argument(
        '--users',
        type=int,
        default=50,
        help='Number of users to generate'
    )
    parser.add_argument(
        '--env',
        type=str,
        default='production',
        choices=['development', 'staging', 'production'],
        help='Target environment'
    )
    parser.add_argument(
        '--clear',
        action='store_true',
        help='Clear existing data before seeding'
    )
    
    args = parser.parse_args()
    
    if not FIREBASE_AVAILABLE:
        logger.error("Firebase Admin SDK not installed")
        logger.error("Install with: pip install firebase-admin")
        sys.exit(1)
    
    # Set environment
    os.environ['ENVIRONMENT'] = args.env
    logger.info(f"Target environment: {args.env}")
    
    if args.clear:
        confirm = input("⚠️  This will DELETE all existing data. Type 'yes' to confirm: ")
        if confirm.lower() != 'yes':
            logger.info("Aborted")
            sys.exit(0)
    
    try:
        seeder = FirestoreSeeder(
            num_users=args.users,
            clear_existing=args.clear
        )
        seeder.seed_all()
        
        logger.info("✓ Seeding completed successfully")
        sys.exit(0)
        
    except Exception as e:
        logger.error(f"Seeding failed: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()

