"""
Database Adapter for SpendSense Backend

Provides a unified interface for database operations that works with both:
- SQLite (for local development)
- Firebase Firestore (for production)

The adapter automatically detects which database to use based on environment variables.

Usage:
    from database_adapter import DatabaseAdapter
    
    db = DatabaseAdapter()
    recommendations = db.get_recommendations(status='pending')

