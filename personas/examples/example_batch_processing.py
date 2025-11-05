"""
Example: Batch Persona Assignment

This example demonstrates how to assign personas to multiple users efficiently.

Requirements:
- Database with user_signals populated for multiple users
- Users exist in database
"""

import sqlite3
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from personas.assignment import PersonaAssigner


def main():
    """Assign personas to multiple users in batch"""
    
    # Connect to database
    db_path = '../../spendsense.db'
    conn = sqlite3.connect(db_path)
    
    try:
        # Initialize persona assigner
        assigner = PersonaAssigner(conn)
        
        # Get all users from database
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM users LIMIT 20")
        users = [row[0] for row in cursor.fetchall()]
        
        print(f"Batch Processing: Assigning personas to {len(users)} users")
        print("=" * 60)
        
        # Track results
        results = {
            'success': [],
            'failed': [],
            'persona_counts': {}
        }
        
        start_time = datetime.now()
        
        # Process each user
        for i, user_id in enumerate(users, 1):
            try:
                # Assign persona
                assignment = assigner.assign_personas(user_id, window_type='30d')
                
                # Skip if no signals
                if assignment.get('primary_persona') == 'none':
                    results['failed'].append({
                        'user_id': user_id,
                        'error': 'No signals available'
                    })
                    print(f"{i:2d}. {user_id}: ✗ No signals")
                    continue
                
                # Store assignment
                assignment_id = assigner.store_assignment(assignment)
                
                # Track success
                persona = assignment['primary_persona']
                strength = assignment['primary_match_strength']
                results['success'].append({
                    'user_id': user_id,
                    'persona': persona,
                    'strength': strength
                })
                
                # Count personas
                results['persona_counts'][persona] = results['persona_counts'].get(persona, 0) + 1
                
                print(f"{i:2d}. {user_id}: ✓ {persona} ({strength})")
                
            except Exception as e:
                results['failed'].append({
                    'user_id': user_id,
                    'error': str(e)
                })
                print(f"{i:2d}. {user_id}: ✗ Error - {e}")
        
        # Calculate processing time
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Display summary
        print("\n" + "=" * 60)
        print("BATCH PROCESSING SUMMARY")
        print("=" * 60)
        
        print(f"\nTotal Users Processed: {len(users)}")
        print(f"Successful: {len(results['success'])}")
        print(f"Failed: {len(results['failed'])}")
        print(f"Processing Time: {duration:.2f} seconds")
        print(f"Average Time per User: {(duration/len(users)):.3f} seconds")
        
        # Persona distribution
        print(f"\nPersona Distribution:")
        for persona, count in sorted(results['persona_counts'].items(), 
                                     key=lambda x: x[1], reverse=True):
            percentage = (count / len(results['success'])) * 100
            print(f"  {persona:20s}: {count:3d} ({percentage:5.1f}%)")
        
        # Failed users details
        if results['failed']:
            print(f"\nFailed Users:")
            for failure in results['failed']:
                print(f"  {failure['user_id']}: {failure['error']}")
        
    except Exception as e:
        print(f"✗ Batch processing error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        conn.close()


if __name__ == "__main__":
    main()

