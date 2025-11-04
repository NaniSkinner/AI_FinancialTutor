"""
Quick data viewer for SpendSense

Run this to see generated user data in a nice format.
Usage: python3 view_data.py
"""

import sys
sys.path.insert(0, '.')

from ingest.data_generator import SyntheticDataGenerator
import json
import pandas as pd


def view_users(num_users=20):
    """Generate and display user data."""
    
    print("\n" + "="*80)
    print(f"SPENDSENSE DATA VIEWER - Showing {num_users} Users")
    print("="*80 + "\n")
    
    # Generate users
    gen = SyntheticDataGenerator(num_users=num_users, seed=42)
    users_df = gen.generate_users()
    
    print("\n" + "="*80)
    print("USER DATA TABLE")
    print("="*80 + "\n")
    
    # Parse metadata for display
    display_data = []
    for _, user in users_df.iterrows():
        metadata = json.loads(user['metadata'])
        display_data.append({
            'ID': user['user_id'],
            'Name': user['name'][:20],  # Truncate long names
            'Age': metadata['age'],
            'Income': f"${metadata['income']:,}",
            'Region': metadata['region'],
            'Life Stage': metadata['life_stage']
        })
    
    display_df = pd.DataFrame(display_data)
    
    # Pretty print with pandas
    pd.set_option('display.max_rows', None)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', None)
    pd.set_option('display.max_colwidth', 30)
    
    print(display_df.to_string(index=False))
    
    print("\n" + "="*80)
    print("DETAILED VIEW - First 3 Users")
    print("="*80 + "\n")
    
    # Show first 3 users in detail
    for i in range(min(3, len(users_df))):
        user = users_df.iloc[i]
        metadata = json.loads(user['metadata'])
        
        print(f"{'─'*80}")
        print(f"USER {i+1}: {user['name']}")
        print(f"{'─'*80}")
        print(f"  User ID:       {user['user_id']}")
        print(f"  Email:         {user['email']}")
        print(f"  Age:           {metadata['age']} years ({metadata['age_bracket']})")
        print(f"  Income:        ${metadata['income']:,}/year ({metadata['income_bracket']})")
        print(f"  Region:        {metadata['region'].title()}")
        print(f"  Life Stage:    {metadata['life_stage'].replace('_', ' ').title()}")
        print(f"  Created:       {user['created_at'][:10]}")
        print()
    
    print("="*80)
    print(f"✅ Successfully generated and displayed {len(users_df)} users")
    print("="*80 + "\n")
    
    return users_df


if __name__ == "__main__":
    # Change num_users here to see more/less
    view_users(num_users=20)

