"""
Example: Persona Transition Detection

This example demonstrates how to detect and celebrate persona transitions.

Requirements:
- Database with user_personas populated
- User has at least 2 persona assignments
"""

import sqlite3
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from personas.transitions import PersonaTransitionTracker


def main():
    """Detect persona transitions for a user"""
    
    # Connect to database
    db_path = '../../spendsense.db'
    conn = sqlite3.connect(db_path)
    
    try:
        # Initialize transition tracker
        tracker = PersonaTransitionTracker(conn)
        
        # User ID to check
        user_id = 'user_001'
        
        print(f"Detecting transitions for {user_id}...")
        print("-" * 50)
        
        # Detect transition (30-day window)
        transition = tracker.detect_transition(user_id, window_type='30d')
        
        # Display results
        if transition['transition_detected']:
            print(f"\n✓ Transition Detected!")
            print(f"\nFrom: {transition['from_persona']}")
            print(f"To: {transition['to_persona']}")
            print(f"Date: {transition['transition_date']}")
            print(f"Days in Previous Persona: {transition['days_in_previous_persona']}")
            
            # Check if it's a positive transition
            if transition.get('is_positive_transition'):
                print(f"\n{'='*50}")
                print(f"🎉 POSITIVE TRANSITION DETECTED!")
                print(f"{'='*50}")
                print(f"\n{transition['celebration_message']}")
                print(f"\nMilestone: {transition['milestone_achieved']}")
                print(f"Achievement: {transition['achievement_title']}")
                print(f"\n{'='*50}")
            else:
                print(f"\nTransition Type: Neutral/Negative (no celebration)")
        
        else:
            print(f"\n✓ No transition detected")
            print(f"User remains in their current persona")
        
        # Get transition history
        print(f"\n\nTransition History:")
        print("-" * 50)
        
        history = tracker.get_transition_history(user_id, limit=5)
        
        if history:
            for i, trans in enumerate(history, 1):
                print(f"\n{i}. {trans['transition_date'][:10]}")
                print(f"   {trans['from_persona']} → {trans['to_persona']}")
                if trans.get('milestone_achieved'):
                    print(f"   Milestone: {trans['milestone_achieved']}")
        else:
            print("No transition history found")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        conn.close()


if __name__ == "__main__":
    main()

