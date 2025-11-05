"""
Example: Basic Persona Assignment

This example demonstrates how to assign a persona to a single user.

Requirements:
- Database with user_signals populated
- User exists in database
"""

import sqlite3
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from personas.assignment import PersonaAssigner


def main():
    """Assign persona to a single user"""
    
    # Connect to database
    db_path = '../../spendsense.db'
    conn = sqlite3.connect(db_path)
    
    try:
        # Initialize persona assigner
        assigner = PersonaAssigner(conn)
        
        # User ID to assign
        user_id = 'user_001'
        
        print(f"Assigning persona to {user_id}...")
        print("-" * 50)
        
        # Assign persona (30-day window)
        assignment = assigner.assign_personas(user_id, window_type='30d')
        
        # Display results
        print(f"\n✓ Persona Assignment Complete")
        print(f"\nUser ID: {assignment['user_id']}")
        print(f"Primary Persona: {assignment['primary_persona']}")
        print(f"Match Strength: {assignment['primary_match_strength']}")
        
        if assignment['secondary_personas']:
            print(f"Secondary Personas: {', '.join(assignment['secondary_personas'])}")
        
        print(f"\nCriteria Met:")
        for criterion, value in assignment['criteria_met'].items():
            print(f"  - {criterion}: {value}")
        
        print(f"\nAll Matching Personas: {', '.join(assignment['all_matches'])}")
        print(f"Assigned At: {assignment['assigned_at']}")
        
        # Store assignment in database
        print(f"\nStoring assignment...")
        assignment_id = assigner.store_assignment(assignment)
        print(f"✓ Stored with ID: {assignment_id}")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        conn.close()


if __name__ == "__main__":
    main()

