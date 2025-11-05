#!/usr/bin/env python3
"""
End-to-End Test of Persona Assignment

Tests the complete persona assignment pipeline with real data.
"""

import sqlite3
import json
from personas.assignment import PersonaAssigner


def test_persona_assignment():
    """Test persona assignment for all users."""
    print("=" * 70)
    print("PERSONA ASSIGNMENT END-TO-END TEST")
    print("=" * 70)
    print()
    
    # Connect to database
    conn = sqlite3.connect('spendsense.db')
    conn.row_factory = sqlite3.Row
    
    # Initialize assigner
    assigner = PersonaAssigner(conn)
    
    # Get all users
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM users LIMIT 10")  # Test with first 10
    users = [row['user_id'] for row in cursor.fetchall()]
    
    print(f"Testing persona assignment for {len(users)} users...\n")
    
    # Assign personas
    results = {
        'high_utilization': 0,
        'variable_income_budgeter': 0,
        'student': 0,
        'subscription_heavy': 0,
        'savings_builder': 0,
        'general': 0,
        'none': 0
    }
    
    match_strengths = {
        'strong': 0,
        'moderate': 0,
        'weak': 0,
        'default': 0,
        'none': 0
    }
    
    assignments = []
    
    for i, user_id in enumerate(users, 1):
        # Assign persona
        assignment = assigner.assign_personas(user_id, '30d')
        
        # Store assignment
        assignment_id = assigner.store_assignment(assignment)
        
        # Track statistics
        results[assignment['primary_persona']] += 1
        match_strengths[assignment['primary_match_strength']] += 1
        
        assignments.append(assignment)
        
        # Print details
        print(f"{i}. User: {user_id}")
        print(f"   Primary: {assignment['primary_persona']} ({assignment['primary_match_strength']})")
        if assignment['secondary_personas']:
            print(f"   Secondary: {', '.join(assignment['secondary_personas'])}")
        if assignment['all_matches']:
            print(f"   All matches: {', '.join(assignment['all_matches'])}")
        print()
    
    # Print summary
    print("=" * 70)
    print("ASSIGNMENT SUMMARY")
    print("=" * 70)
    print()
    
    print("Persona distribution:")
    for persona, count in results.items():
        if count > 0:
            pct = (count / len(users)) * 100
            print(f"  {persona:30} {count:3} ({pct:5.1f}%)")
    print()
    
    print("Match strength distribution:")
    for strength, count in match_strengths.items():
        if count > 0:
            pct = (count / len(users)) * 100
            print(f"  {strength:15} {count:3} ({pct:5.1f}%)")
    print()
    
    # Test criteria extraction
    print("Sample criteria details (first user):")
    first = assignments[0]
    print(f"  Persona: {first['primary_persona']}")
    print(f"  Criteria met:")
    for key, value in first['criteria_met'].items():
        print(f"    {key}: {value}")
    print()
    
    # Verify stored assignments
    cursor.execute("SELECT COUNT(*) as count FROM user_personas")
    stored_count = cursor.fetchone()['count']
    print(f"Assignments stored in database: {stored_count}")
    print()
    
    conn.close()
    
    print("=" * 70)
    print("✓ END-TO-END TEST COMPLETE")
    print("=" * 70)


def test_full_batch():
    """Test persona assignment for all 100 users."""
    print("\n" + "=" * 70)
    print("FULL BATCH ASSIGNMENT TEST")
    print("=" * 70)
    print()
    
    conn = sqlite3.connect('spendsense.db')
    conn.row_factory = sqlite3.Row
    assigner = PersonaAssigner(conn)
    
    # Get all users
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM users")
    users = [row['user_id'] for row in cursor.fetchall()]
    
    print(f"Assigning personas for all {len(users)} users...\n")
    
    results = {
        'high_utilization': 0,
        'variable_income_budgeter': 0,
        'student': 0,
        'subscription_heavy': 0,
        'savings_builder': 0,
        'general': 0,
        'none': 0
    }
    
    match_strengths = {'strong': 0, 'moderate': 0, 'weak': 0, 'default': 0, 'none': 0}
    secondary_count = 0
    
    for i, user_id in enumerate(users, 1):
        assignment = assigner.assign_personas(user_id, '30d')
        assignment_id = assigner.store_assignment(assignment)
        
        results[assignment['primary_persona']] += 1
        match_strengths[assignment['primary_match_strength']] += 1
        
        if assignment['secondary_personas']:
            secondary_count += len(assignment['secondary_personas'])
        
        if i % 20 == 0:
            print(f"  Processed {i}/{len(users)} users...")
    
    print(f"\n✓ Completed {len(users)} assignments\n")
    
    # Full summary
    print("=" * 70)
    print("FULL BATCH RESULTS")
    print("=" * 70)
    print()
    
    print("Persona distribution:")
    for persona, count in sorted(results.items(), key=lambda x: -x[1]):
        if count > 0:
            pct = (count / len(users)) * 100
            bar = '█' * int(pct / 2)
            print(f"  {persona:30} {count:3} ({pct:5.1f}%) {bar}")
    print()
    
    print("Match strength distribution:")
    for strength, count in sorted(match_strengths.items(), key=lambda x: -x[1]):
        if count > 0:
            pct = (count / len(users)) * 100
            bar = '█' * int(pct / 2)
            print(f"  {strength:15} {count:3} ({pct:5.1f}%) {bar}")
    print()
    
    avg_secondary = secondary_count / len(users)
    print(f"Average secondary personas per user: {avg_secondary:.2f}")
    print()
    
    # Query some interesting stats
    cursor.execute("""
        SELECT primary_persona, COUNT(*) as count, 
               AVG(CASE WHEN primary_match_strength = 'strong' THEN 1 ELSE 0 END) as strong_pct
        FROM user_personas
        WHERE window_type = '30d'
        GROUP BY primary_persona
        ORDER BY count DESC
    """)
    
    print("Persona quality (strong match rate):")
    for row in cursor.fetchall():
        strong_rate = row['strong_pct'] * 100
        print(f"  {row['primary_persona']:30} {strong_rate:5.1f}% strong matches")
    print()
    
    conn.close()
    
    print("=" * 70)
    print("✓ FULL BATCH TEST COMPLETE")
    print("=" * 70)


if __name__ == '__main__':
    # Run sample test
    test_persona_assignment()
    
    # Run full batch
    test_full_batch()

