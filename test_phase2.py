"""
Test script for Phase 2: User Generation

This script tests the user generation functionality to verify:
- Correct user count
- Valid user_id format
- Email uniqueness
- Age and income distributions
"""

import sys
sys.path.insert(0, '.')

from ingest.data_generator import SyntheticDataGenerator
import json


def test_user_generation():
    """Test user generation with 10 test users."""
    
    print("="*60)
    print("PHASE 2 TEST: User Generation")
    print("="*60 + "\n")
    
    # Generate 10 test users
    generator = SyntheticDataGenerator(num_users=10, seed=42)
    users_df = generator.generate_users()
    
    print("\n" + "="*60)
    print("VALIDATION CHECKS")
    print("="*60 + "\n")
    
    # Check 1: Correct count
    print(f"✓ Check 1: User count = {len(users_df)} (expected 10)")
    assert len(users_df) == 10, "User count mismatch!"
    
    # Check 2: User ID format
    print(f"✓ Check 2: User IDs follow 'user_XXX' format")
    for user_id in users_df['user_id']:
        assert user_id.startswith('user_'), f"Invalid user_id format: {user_id}"
    
    # Check 3: Email uniqueness
    print(f"✓ Check 3: All emails are unique")
    assert users_df['email'].is_unique, "Duplicate emails found!"
    
    # Check 4: Metadata structure
    print(f"✓ Check 4: Metadata contains required fields")
    first_user_metadata = json.loads(users_df.iloc[0]['metadata'])
    required_fields = ['age', 'age_bracket', 'income', 'income_bracket', 'region', 'life_stage']
    for field in required_fields:
        assert field in first_user_metadata, f"Missing field: {field}"
    
    # Check 5: Age ranges
    print(f"✓ Check 5: Ages within valid range (18-65)")
    metadata_list = users_df['metadata'].apply(json.loads).tolist()
    ages = [m['age'] for m in metadata_list]
    assert all(18 <= age <= 65 for age in ages), "Age out of range!"
    
    # Check 6: Income ranges
    print(f"✓ Check 6: Incomes within valid range ($20K-$250K)")
    incomes = [m['income'] for m in metadata_list]
    assert all(20000 <= income <= 250000 for income in incomes), "Income out of range!"
    
    print("\n" + "="*60)
    print("SAMPLE USER RECORDS")
    print("="*60 + "\n")
    
    # Display first 3 users
    for i in range(min(3, len(users_df))):
        user = users_df.iloc[i]
        metadata = json.loads(user['metadata'])
        print(f"User #{i+1}:")
        print(f"  ID: {user['user_id']}")
        print(f"  Name: {user['name']}")
        print(f"  Email: {user['email']}")
        print(f"  Age: {metadata['age']} ({metadata['age_bracket']})")
        print(f"  Income: ${metadata['income']:,} ({metadata['income_bracket']})")
        print(f"  Region: {metadata['region']}")
        print(f"  Life Stage: {metadata['life_stage']}")
        print()
    
    print("="*60)
    print("✅ ALL TESTS PASSED!")
    print("="*60 + "\n")
    
    return users_df


if __name__ == "__main__":
    users_df = test_user_generation()
    
    print("\n🎉 Phase 2 user generation is working correctly!\n")

