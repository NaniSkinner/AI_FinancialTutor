"""
Example: Full Integration Pipeline

This example demonstrates the complete persona workflow:
1. Load user signals
2. Assign persona
3. Store assignment
4. Detect transitions
5. Generate recommendations (placeholder)

Requirements:
- Database with user_signals populated
- Users exist in database
"""

import sqlite3
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from personas.assignment import PersonaAssigner
from personas.transitions import PersonaTransitionTracker


def get_user_signals_summary(conn, user_id):
    """Get a summary of user's signals"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT signal_category, signal_data
        FROM user_signals
        WHERE user_id = ? AND window_type = '30d'
    """, (user_id,))
    
    signals = {}
    for row in cursor.fetchall():
        import json
        category = row[0]
        data = json.loads(row[1])
        signals[category] = data
    
    return signals


def generate_recommendations(persona, signals):
    """Generate educational recommendations based on persona (placeholder)"""
    recommendations = {
        'high_utilization': [
            "Understanding Credit Utilization and Credit Scores",
            "Payment Strategies: More Than the Minimum",
            "Debt Paydown: Avalanche vs. Snowball Method"
        ],
        'variable_income_budgeter': [
            "Budgeting with Irregular Income",
            "Building an Emergency Fund on Variable Income",
            "Cash Flow Forecasting for Gig Workers"
        ],
        'student': [
            "Student Budgeting 101: Making Your Money Last",
            "Understanding Your Student Loans",
            "The $5 Coffee Habit: A Real Cost Analysis"
        ],
        'subscription_heavy': [
            "The True Cost of Subscriptions",
            "How to Audit Your Recurring Expenses",
            "Subscription Management Tools and Strategies"
        ],
        'savings_builder': [
            "Setting SMART Financial Goals",
            "Automate Your Savings: Set It and Forget It",
            "When Are You Ready to Start Investing?"
        ]
    }
    
    return recommendations.get(persona, ["General Financial Wellness"])


def main():
    """Run complete integration pipeline"""
    
    # Connect to database
    db_path = '../../spendsense.db'
    conn = sqlite3.connect(db_path)
    
    try:
        user_id = 'user_001'
        
        print("=" * 70)
        print("SPENDSENSE PERSONA INTEGRATION PIPELINE")
        print("=" * 70)
        print(f"\nUser ID: {user_id}")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Step 1: Check for existing signals
        print("\n" + "-" * 70)
        print("STEP 1: Load User Signals")
        print("-" * 70)
        
        signals = get_user_signals_summary(conn, user_id)
        
        if signals:
            print(f"✓ Found {len(signals)} signal categories:")
            for category in signals.keys():
                print(f"  - {category}")
        else:
            print("⚠ No signals found for user")
            return
        
        # Step 2: Assign Persona
        print("\n" + "-" * 70)
        print("STEP 2: Assign Persona")
        print("-" * 70)
        
        assigner = PersonaAssigner(conn)
        assignment = assigner.assign_personas(user_id, window_type='30d')
        
        if assignment['primary_persona'] == 'none':
            print("✗ Could not assign persona (no signals)")
            return
        
        print(f"✓ Assigned Persona: {assignment['primary_persona']}")
        print(f"  Match Strength: {assignment['primary_match_strength']}")
        if assignment['secondary_personas']:
            print(f"  Secondary: {', '.join(assignment['secondary_personas'])}")
        
        # Step 3: Store Assignment
        print("\n" + "-" * 70)
        print("STEP 3: Store Assignment")
        print("-" * 70)
        
        assignment_id = assigner.store_assignment(assignment)
        print(f"✓ Stored with ID: {assignment_id}")
        
        # Step 4: Detect Transitions
        print("\n" + "-" * 70)
        print("STEP 4: Detect Transitions")
        print("-" * 70)
        
        tracker = PersonaTransitionTracker(conn)
        transition = tracker.detect_transition(user_id, window_type='30d')
        
        if transition['transition_detected']:
            print(f"✓ Transition Detected:")
            print(f"  From: {transition['from_persona']}")
            print(f"  To: {transition['to_persona']}")
            print(f"  Days in Previous: {transition['days_in_previous_persona']}")
            
            if transition.get('is_positive_transition'):
                print(f"\n  🎉 {transition['celebration_message']}")
                print(f"  Milestone: {transition['milestone_achieved']}")
        else:
            print("✓ No transition detected (user remains in current persona)")
        
        # Step 5: Generate Recommendations
        print("\n" + "-" * 70)
        print("STEP 5: Generate Recommendations")
        print("-" * 70)
        
        recommendations = generate_recommendations(
            assignment['primary_persona'],
            signals
        )
        
        print(f"✓ Generated {len(recommendations)} recommendations:")
        for i, rec in enumerate(recommendations, 1):
            print(f"  {i}. {rec}")
        
        # Summary
        print("\n" + "=" * 70)
        print("PIPELINE COMPLETE")
        print("=" * 70)
        print(f"\n✓ User successfully processed through persona pipeline")
        print(f"✓ Primary Persona: {assignment['primary_persona']}")
        print(f"✓ Recommendations: {len(recommendations)} generated")
        
        if transition['transition_detected']:
            print(f"✓ Transition: {transition['from_persona']} → {transition['to_persona']}")
        
        print(f"\nNext Steps:")
        print(f"  - Display recommendations in user dashboard")
        print(f"  - Track user engagement with content")
        print(f"  - Monitor persona changes over time")
        
    except Exception as e:
        print(f"\n✗ Pipeline error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        conn.close()


if __name__ == "__main__":
    main()

