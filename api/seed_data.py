"""
Database Seeding Script - Generate mock data for testing Operator Dashboard.

This script:
1. Reads existing users from the database
2. Creates realistic recommendations for those users
3. Generates decision traces for recommendations
4. Creates some audit log entries
5. Flags some recommendations for review

Run with: python seed_data.py
"""

import sqlite3
from datetime import datetime, timedelta
import random
import json
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from database import get_db, init_database


# ========================================================================
# SEED DATA CONFIGURATION
# ========================================================================

# Content types and personas
CONTENT_TYPES = ['article', 'video', 'tool', 'quiz', 'calculator']
PERSONAS = [
    'high_utilization',
    'variable_income_budgeter',
    'student',
    'subscription_heavy',
    'savings_builder',
    'general'
]
PRIORITIES = ['high', 'medium', 'low']
STATUSES = ['pending', 'approved', 'rejected', 'flagged']

# Sample recommendation titles by persona
RECOMMENDATION_TITLES = {
    'high_utilization': [
        "Understanding Credit Card Utilization and Your Score",
        "Balance Transfer Cards: When to Consider Them",
        "5 Ways to Reduce Credit Card Debt Faster",
        "Creating a Debt Payoff Plan That Works",
        "How High Utilization Affects Your Credit Score"
    ],
    'variable_income_budgeter': [
        "Budgeting with Irregular Income: A Complete Guide",
        "Building an Emergency Fund for Freelancers",
        "Income Smoothing Techniques for Variable Earners",
        "Managing Cash Flow When Income Fluctuates",
        "Tax Planning for Self-Employed Individuals"
    ],
    'student': [
        "Student Budget Basics: Your First Financial Plan",
        "Maximizing Your Student Discounts and Benefits",
        "Part-Time Income: Managing Work and Study",
        "Understanding Student Loans and Repayment Options",
        "Building Credit as a College Student"
    ],
    'subscription_heavy': [
        "Subscription Audit Guide: What to Cancel",
        "Negotiating Lower Bills on Recurring Services",
        "Free Alternatives to Paid Subscriptions",
        "Setting a Monthly Subscription Budget",
        "Tracking and Managing Your Subscriptions"
    ],
    'savings_builder': [
        "High-Yield Savings Accounts: Where to Find the Best Rates",
        "Building Your Emergency Fund: 3-6 Month Strategy",
        "Automating Your Savings for Success",
        "Savings Goals: How to Set and Achieve Them",
        "Understanding Different Savings Account Types"
    ],
    'general': [
        "Financial Wellness: A Beginner's Guide",
        "Setting SMART Financial Goals",
        "Understanding Your Financial Statement",
        "Basic Personal Finance Principles",
        "Creating Your First Budget"
    ]
}

# Sample rationales
RATIONALE_TEMPLATES = {
    'high_utilization': "Based on your current credit utilization of {util}%, this resource can help you understand the impact on your credit score and strategies to reduce your balance. Many users with similar patterns have found this helpful.",
    'variable_income_budgeter': "With your variable income pattern (median pay gap of {gap} days), this guide provides strategies for managing cash flow and building financial stability during income fluctuations.",
    'student': "As a student managing finances, this resource is tailored to your unique situation, including tips on budgeting with limited income and building good financial habits early.",
    'subscription_heavy': "You have {count} recurring subscriptions totaling ${amount}/month. This guide will help you evaluate which subscriptions provide value and which you might consider canceling.",
    'savings_builder': "Your savings have grown by {rate}% recently. This resource can help you optimize your savings strategy and reach your financial goals faster.",
    'general': "This foundational resource covers essential personal finance concepts that can help you build a stronger financial future."
}


# ========================================================================
# HELPER FUNCTIONS
# ========================================================================

def generate_recommendation_id():
    """Generate unique recommendation ID"""
    timestamp = int(datetime.now().timestamp() * 1000)
    random_part = random.randint(1000, 9999)
    return f"rec_{timestamp}_{random_part}"


def generate_trace_id():
    """Generate unique trace ID"""
    timestamp = int(datetime.now().timestamp() * 1000)
    random_part = random.randint(1000, 9999)
    return f"trace_{timestamp}_{random_part}"


def generate_flag_id(rec_id):
    """Generate flag ID"""
    timestamp = int(datetime.now().timestamp())
    return f"flag_{rec_id}_{timestamp}"


def random_date_recent(days_ago=30):
    """Generate random recent date"""
    days = random.randint(0, days_ago)
    return (datetime.now() - timedelta(days=days)).isoformat()


def get_title_for_persona(persona):
    """Get random title for persona"""
    titles = RECOMMENDATION_TITLES.get(persona, RECOMMENDATION_TITLES['general'])
    return random.choice(titles)


def get_rationale_for_persona(persona):
    """Generate rationale for persona"""
    template = RATIONALE_TEMPLATES.get(persona, RATIONALE_TEMPLATES['general'])
    
    # Fill template with mock data
    if persona == 'high_utilization':
        util = random.randint(60, 95)
        return template.format(util=util)
    elif persona == 'variable_income_budgeter':
        gap = random.randint(14, 45)
        return template.format(gap=gap)
    elif persona == 'subscription_heavy':
        count = random.randint(5, 12)
        amount = count * random.randint(8, 25)
        return template.format(count=count, amount=amount)
    elif persona == 'savings_builder':
        rate = round(random.uniform(5, 25), 1)
        return template.format(rate=rate)
    else:
        return template


# ========================================================================
# SEED FUNCTIONS
# ========================================================================

def seed_recommendations(conn, user_ids, num_recommendations=30):
    """
    Create mock recommendations for existing users.
    
    Args:
        conn: Database connection
        user_ids: List of user IDs to create recommendations for
        num_recommendations: Number of recommendations to create
    
    Returns:
        List of created recommendation IDs
    """
    cursor = conn.cursor()
    recommendation_ids = []
    
    print(f"Creating {num_recommendations} mock recommendations...")
    
    for i in range(num_recommendations):
        rec_id = generate_recommendation_id()
        user_id = random.choice(user_ids)
        persona = random.choice(PERSONAS)
        content_type = random.choice(CONTENT_TYPES)
        priority = random.choice(PRIORITIES)
        
        # Weight status toward pending (operator dashboard needs pending items)
        status_weights = [0.5, 0.2, 0.15, 0.15]  # pending, approved, rejected, flagged
        status = random.choices(STATUSES, weights=status_weights)[0]
        
        title = get_title_for_persona(persona)
        rationale = get_rationale_for_persona(persona)
        
        # Guardrails (mostly pass)
        tone_check = random.random() > 0.1
        advice_check = random.random() > 0.05
        eligibility_check = random.random() > 0.05
        guardrails_passed = tone_check and advice_check and eligibility_check
        
        # Timestamps
        generated_at = random_date_recent(30)
        created_at = generated_at
        
        # Operator fields (if processed)
        approved_by = None
        approved_at = None
        rejected_by = None
        rejected_at = None
        operator_notes = None
        
        if status == 'approved':
            approved_by = f"op_{random.randint(1, 5):03d}"
            approved_at = random_date_recent(20)
            operator_notes = random.choice(["LGTM", "Approved", "Good recommendation", ""])
        elif status == 'rejected':
            rejected_by = f"op_{random.randint(1, 5):03d}"
            rejected_at = random_date_recent(20)
            operator_notes = random.choice([
                "Rationale not specific enough",
                "Content not appropriate for persona",
                "Duplicate recommendation",
                "User already received similar content"
            ])
        
        # Read time (if article/video)
        read_time_minutes = None
        if content_type in ['article', 'video']:
            read_time_minutes = random.randint(3, 15)
        
        # Content URL (mock)
        content_url = f"https://content.spendsense.com/{content_type}/{rec_id}"
        
        # Insert recommendation
        cursor.execute("""
            INSERT INTO recommendations (
                recommendation_id, user_id, persona_primary, type, title, rationale,
                priority, status, content_url, read_time_minutes,
                tone_check, advice_check, eligibility_check, guardrails_passed,
                approved_by, approved_at, rejected_by, rejected_at, operator_notes,
                generated_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            rec_id, user_id, persona, content_type, title, rationale,
            priority, status, content_url, read_time_minutes,
            tone_check, advice_check, eligibility_check, guardrails_passed,
            approved_by, approved_at, rejected_by, rejected_at, operator_notes,
            generated_at, created_at, generated_at
        ))
        
        recommendation_ids.append(rec_id)
        
        if (i + 1) % 10 == 0:
            print(f"  Created {i + 1}/{num_recommendations} recommendations...")
    
    conn.commit()
    print(f"✓ Created {num_recommendations} recommendations")
    return recommendation_ids


def seed_decision_traces(conn, recommendation_ids):
    """
    Create mock decision traces for recommendations.
    
    Args:
        conn: Database connection
        recommendation_ids: List of recommendation IDs to create traces for
    """
    cursor = conn.cursor()
    
    print(f"Creating decision traces for {len(recommendation_ids)} recommendations...")
    
    for i, rec_id in enumerate(recommendation_ids):
        trace_id = generate_trace_id()
        
        # Generate mock pipeline timestamps
        base_time = datetime.now() - timedelta(days=random.randint(1, 30))
        signals_at = base_time.isoformat()
        persona_at = (base_time + timedelta(seconds=1)).isoformat()
        content_at = (base_time + timedelta(seconds=2)).isoformat()
        rationale_at = (base_time + timedelta(seconds=5)).isoformat()
        guardrails_at = (base_time + timedelta(seconds=6)).isoformat()
        
        # Mock signals data
        signals = {
            'credit_utilization': random.randint(30, 95),
            'monthly_income': random.randint(2000, 8000),
            'savings_rate': round(random.uniform(5, 25), 2),
            'subscription_count': random.randint(3, 15)
        }
        
        # Mock persona assignment
        persona_assignment = {
            'primary': random.choice(PERSONAS),
            'secondary': random.sample(PERSONAS, k=random.randint(0, 2)),
            'confidence': round(random.uniform(0.7, 0.99), 2)
        }
        
        # Mock content matches
        content_matches = [
            {
                'content_id': f"content_{i}",
                'title': get_title_for_persona(persona_assignment['primary']),
                'type': random.choice(CONTENT_TYPES),
                'score': round(random.uniform(0.7, 0.95), 3)
            }
            for i in range(3)
        ]
        
        # Mock relevance scores
        relevance_scores = {
            f"match_{i}": round(random.uniform(0.6, 0.95), 3)
            for i in range(5)
        }
        
        # LLM details
        llm_model = "gpt-4"
        temperature = 0.7
        tokens_used = random.randint(150, 500)
        
        # Insert trace
        cursor.execute("""
            INSERT INTO decision_traces (
                trace_id, recommendation_id,
                signals_detected_at, persona_assigned_at, content_matched_at,
                rationale_generated_at, guardrails_checked_at,
                signals_json, persona_assignment_json, content_matches_json,
                relevance_scores_json, llm_model, temperature, tokens_used,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            trace_id, rec_id,
            signals_at, persona_at, content_at, rationale_at, guardrails_at,
            json.dumps(signals), json.dumps(persona_assignment),
            json.dumps(content_matches), json.dumps(relevance_scores),
            llm_model, temperature, tokens_used,
            datetime.now().isoformat()
        ))
        
        if (i + 1) % 10 == 0:
            print(f"  Created {i + 1}/{len(recommendation_ids)} traces...")
    
    conn.commit()
    print(f"✓ Created {len(recommendation_ids)} decision traces")


def seed_audit_logs(conn, recommendation_ids):
    """
    Create mock audit log entries.
    
    Args:
        conn: Database connection
        recommendation_ids: List of recommendation IDs
    """
    cursor = conn.cursor()
    
    # Create some audit entries for processed recommendations
    num_audits = min(len(recommendation_ids) // 2, 20)
    
    print(f"Creating {num_audits} audit log entries...")
    
    actions = ['approve', 'reject', 'modify', 'flag']
    operators = [f"op_{i:03d}" for i in range(1, 6)]
    
    for i in range(num_audits):
        audit_id = f"audit_{int(datetime.now().timestamp())}_{i}"
        operator_id = random.choice(operators)
        action = random.choice(actions)
        rec_id = random.choice(recommendation_ids)
        
        metadata = {
            'notes': random.choice(['Quick review', 'Detailed check', 'Routine approval', '']),
            'duration_seconds': random.randint(30, 300)
        }
        
        timestamp = random_date_recent(25)
        
        cursor.execute("""
            INSERT INTO operator_audit_log (
                audit_id, operator_id, action, recommendation_id, metadata, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (audit_id, operator_id, action, rec_id, json.dumps(metadata), timestamp))
    
    conn.commit()
    print(f"✓ Created {num_audits} audit log entries")


def seed_flags(conn, recommendation_ids):
    """
    Create some flagged recommendations.
    
    Args:
        conn: Database connection
        recommendation_ids: List of recommendation IDs
    """
    cursor = conn.cursor()
    
    # Flag about 10% of recommendations
    num_flags = max(len(recommendation_ids) // 10, 2)
    
    print(f"Creating {num_flags} flags...")
    
    flag_reasons = [
        "Content appropriateness unclear",
        "Persona assignment needs review",
        "Rationale seems generic",
        "Similar recommendation recently sent",
        "User feedback indicates poor match",
        "Requires senior operator review"
    ]
    
    operators = [f"op_{i:03d}" for i in range(1, 6)]
    
    for i in range(num_flags):
        rec_id = random.choice(recommendation_ids)
        flag_id = generate_flag_id(rec_id)
        
        # 30% chance flag is resolved
        resolved = random.random() < 0.3
        resolved_by = random.choice(operators) if resolved else None
        resolved_at = random_date_recent(15) if resolved else None
        
        flagged_by = random.choice(operators)
        flagged_at = random_date_recent(20)
        reason = random.choice(flag_reasons)
        
        cursor.execute("""
            INSERT INTO recommendation_flags (
                flag_id, recommendation_id, flagged_by, flag_reason,
                resolved, resolved_by, resolved_at, flagged_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (flag_id, rec_id, flagged_by, reason, resolved, resolved_by, resolved_at, flagged_at))
    
    conn.commit()
    print(f"✓ Created {num_flags} flags")


# ========================================================================
# MAIN SEEDING FUNCTION
# ========================================================================

def seed_all():
    """
    Main seeding function - seeds all mock data.
    """
    print("=" * 70)
    print("SpendSense Operator Dashboard - Database Seeding")
    print("=" * 70)
    print()
    
    # Initialize database if needed
    print("Initializing database schema...")
    try:
        init_database()
    except Exception as e:
        print(f"Note: {e}")
        print("Continuing with existing schema...")
    
    print()
    
    # Get existing users
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM users LIMIT 20")
        users = cursor.fetchall()
        user_ids = [user['user_id'] for user in users]
    
    if not user_ids:
        print("✗ No users found in database!")
        print("  Please run the data generator first to create users.")
        return
    
    print(f"Found {len(user_ids)} existing users")
    print()
    
    # Seed data
    with get_db() as conn:
        # Create recommendations
        recommendation_ids = seed_recommendations(conn, user_ids, num_recommendations=30)
        print()
        
        # Create decision traces
        seed_decision_traces(conn, recommendation_ids)
        print()
        
        # Create audit logs
        seed_audit_logs(conn, recommendation_ids)
        print()
        
        # Create flags
        seed_flags(conn, recommendation_ids)
        print()
    
    print("=" * 70)
    print("Database seeding complete!")
    print("=" * 70)
    print()
    print("Summary:")
    print(f"  • {len(recommendation_ids)} recommendations created")
    print(f"  • {len(recommendation_ids)} decision traces created")
    print(f"  • {len(recommendation_ids) // 2} audit log entries created")
    print(f"  • {max(len(recommendation_ids) // 10, 2)} flags created")
    print()
    print("You can now:")
    print("  1. Start the API server: python main.py")
    print("  2. View recommendations at: http://localhost:8000/api/operator/recommendations")
    print("  3. Check API docs at: http://localhost:8000/docs")
    print()


# ========================================================================
# ENTRY POINT
# ========================================================================

if __name__ == "__main__":
    seed_all()

