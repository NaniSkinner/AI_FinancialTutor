"""
Seed Operators Script

Generate test operator accounts with bcrypt password hashes.
This script is for development/testing purposes only.

Usage:
    python seed_operators.py

Output:
    Displays test operator credentials and password hashes
"""

import bcrypt

# Test operators to create
OPERATORS = [
    {
        "email": "jane.doe@spendsense.com",
        "name": "Jane Doe",
        "role": "senior",
        "password": "password123"
    },
    {
        "email": "john.smith@spendsense.com",
        "name": "John Smith",
        "role": "junior",
        "password": "password123"
    },
    {
        "email": "admin@spendsense.com",
        "name": "Admin User",
        "role": "admin",
        "password": "admin123"
    },
]


def generate_password_hash(password: str) -> str:
    """Generate bcrypt hash for a password"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def main():
    print("\n" + "=" * 70)
    print("SpendSense Operator Dashboard - Test Operator Accounts")
    print("=" * 70)
    print("\nGenerated Password Hashes for auth.py OPERATORS dict:\n")
    
    for op in OPERATORS:
        # Generate hash
        password_hash = generate_password_hash(op["password"])
        
        print(f"Email:    {op['email']}")
        print(f"Name:     {op['name']}")
        print(f"Role:     {op['role']}")
        print(f"Password: {op['password']}")
        print(f"Hash:     {password_hash}")
        print()
    
    print("=" * 70)
    print("\nPython dict format for auth.py:")
    print("=" * 70)
    print()
    print("OPERATORS = {")
    
    for i, op in enumerate(OPERATORS):
        password_hash = generate_password_hash(op["password"])
        comma = "," if i < len(OPERATORS) - 1 else ""
        
        print(f'    "{op["email"]}": {{')
        print(f'        "operator_id": "op_{i+1:03d}",')
        print(f'        "name": "{op["name"]}",')
        print(f'        "email": "{op["email"]}",')
        print(f'        "role": "{op["role"]}",')
        print(f'        "password_hash": "{password_hash}"')
        print(f'    }}{comma}')
    
    print("}")
    print()
    print("=" * 70)
    print("\nNOTE: These are test accounts for development only!")
    print("In production, use proper user management with strong passwords.")
    print("=" * 70)
    print()


if __name__ == "__main__":
    main()

