#!/usr/bin/env python3
"""
Command-line interface for generating synthetic financial data.

Usage:
    python generate_data.py
    python generate_data.py --num-users 50 --seed 123
    python generate_data.py --output-dir custom_data/
"""

import argparse
import sys
from ingest.data_generator import SyntheticDataGenerator
from ingest.config import NUM_USERS_DEFAULT, SEED_DEFAULT, CSV_OUTPUT_DIR


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Generate synthetic financial data for SpendSense',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate default 100 users
  python generate_data.py
  
  # Generate 50 users with custom seed
  python generate_data.py --num-users 50 --seed 123
  
  # Save to custom directory
  python generate_data.py --output-dir my_data/
  
  # Quick test with 10 users
  python generate_data.py --num-users 10
        """
    )
    
    parser.add_argument(
        '--num-users',
        type=int,
        default=NUM_USERS_DEFAULT,
        help=f'Number of users to generate (default: {NUM_USERS_DEFAULT})'
    )
    
    parser.add_argument(
        '--seed',
        type=int,
        default=SEED_DEFAULT,
        help=f'Random seed for reproducibility (default: {SEED_DEFAULT})'
    )
    
    parser.add_argument(
        '--output-dir',
        type=str,
        default=CSV_OUTPUT_DIR,
        help=f'Output directory for CSV files (default: {CSV_OUTPUT_DIR})'
    )
    
    parser.add_argument(
        '--quiet',
        action='store_true',
        help='Suppress progress messages'
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if args.num_users < 1:
        print("Error: --num-users must be at least 1")
        sys.exit(1)
    
    if args.num_users > 1000:
        print("Warning: Generating more than 1000 users may take a while...")
    
    # Initialize generator
    try:
        generator = SyntheticDataGenerator(
            num_users=args.num_users,
            seed=args.seed
        )
        
        # Generate all data
        metadata = generator.generate_all(output_dir=args.output_dir)
        
        if not args.quiet:
            print("\n✅ SUCCESS: Data generation completed!")
            print(f"\nYou can now:")
            print(f"  1. Load data into database: python -c 'from ingest.loader import DataLoader; loader = DataLoader(); loader.load_all(\"{args.output_dir}\")'")
            print(f"  2. View the data: python view_data.py")
            print(f"  3. Inspect CSV files in: {args.output_dir}")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ ERROR: Data generation failed!")
        print(f"Error: {str(e)}")
        
        if not args.quiet:
            import traceback
            print("\nFull traceback:")
            traceback.print_exc()
        
        return 1


if __name__ == '__main__':
    sys.exit(main())

