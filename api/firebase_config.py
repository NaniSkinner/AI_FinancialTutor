"""
Firebase Admin SDK Configuration for SpendSense Backend API

This module initializes Firebase Admin SDK and provides helper functions
for Firestore operations in the backend.

Usage:
    from firebase_config import get_firestore_client, get_collection
    
    db = get_firestore_client()
    recommendations = get_collection('recommendations')
"""

import os
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from google.cloud.firestore_v1 import Client
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    logging.warning("Firebase Admin SDK not installed. Install with: pip install firebase-admin")

logger = logging.getLogger(__name__)

# Global Firebase app instance
_firebase_app: Optional[firebase_admin.App] = None
_firestore_client: Optional[Client] = None


def initialize_firebase() -> Optional[firebase_admin.App]:
    """
    Initialize Firebase Admin SDK with service account credentials.
    
    Looks for credentials in the following order:
    1. FIREBASE_CREDENTIALS environment variable (JSON string)
    2. FIREBASE_CREDENTIALS_PATH environment variable (path to JSON file)
    3. Default credentials (for Cloud Run, App Engine, etc.)
    
    Returns:
        Firebase App instance or None if initialization fails
    """
    global _firebase_app
    
    if not FIREBASE_AVAILABLE:
        logger.error("Firebase Admin SDK not available")
        return None
    
    if _firebase_app is not None:
        return _firebase_app
    
    try:
        # Try to get credentials from environment
        credentials_json = os.getenv('FIREBASE_CREDENTIALS')
        credentials_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
        project_id = os.getenv('FIREBASE_PROJECT_ID')
        
        if credentials_json:
            # Load from JSON string
            logger.info("Loading Firebase credentials from FIREBASE_CREDENTIALS env var")
            cred_dict = json.loads(credentials_json)
            cred = credentials.Certificate(cred_dict)
        elif credentials_path and os.path.exists(credentials_path):
            # Load from file path
            logger.info(f"Loading Firebase credentials from {credentials_path}")
            cred = credentials.Certificate(credentials_path)
        else:
            # Try default credentials (works in GCP environments)
            logger.info("Using default Firebase credentials")
            cred = credentials.ApplicationDefault()
        
        # Initialize app with credentials
        _firebase_app = firebase_admin.initialize_app(cred, {
            'projectId': project_id
        } if project_id else {})
        
        logger.info(f"Firebase Admin SDK initialized successfully (Project: {project_id or 'default'})")
        return _firebase_app
        
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        return None


def get_firestore_client() -> Optional[Client]:
    """
    Get Firestore client instance.
    
    Returns:
        Firestore client or None if not available
    """
    global _firestore_client
    
    if _firestore_client is not None:
        return _firestore_client
    
    if not FIREBASE_AVAILABLE:
        return None
    
    # Initialize Firebase if needed
    if _firebase_app is None:
        initialize_firebase()
    
    if _firebase_app is None:
        return None
    
    try:
        _firestore_client = firestore.client()
        logger.info("Firestore client created successfully")
        return _firestore_client
    except Exception as e:
        logger.error(f"Failed to create Firestore client: {e}")
        return None


def get_collection(collection_name: str):
    """
    Get a Firestore collection reference.
    
    Args:
        collection_name: Name of the collection
        
    Returns:
        Collection reference or None
    """
    db = get_firestore_client()
    if db is None:
        return None
    return db.collection(collection_name)


def get_document(collection_name: str, document_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a single document from Firestore.
    
    Args:
        collection_name: Name of the collection
        document_id: ID of the document
        
    Returns:
        Document data as dictionary or None if not found
    """
    try:
        col = get_collection(collection_name)
        if col is None:
            return None
        
        doc = col.document(document_id).get()
        if doc.exists:
            return doc.to_dict()
        return None
    except Exception as e:
        logger.error(f"Error getting document {document_id} from {collection_name}: {e}")
        return None


def set_document(collection_name: str, document_id: str, data: Dict[str, Any]) -> bool:
    """
    Create or update a document in Firestore.
    
    Args:
        collection_name: Name of the collection
        document_id: ID of the document
        data: Document data
        
    Returns:
        True if successful, False otherwise
    """
    try:
        col = get_collection(collection_name)
        if col is None:
            return False
        
        # Add updated_at timestamp
        data['updated_at'] = firestore.SERVER_TIMESTAMP
        
        col.document(document_id).set(data)
        return True
    except Exception as e:
        logger.error(f"Error setting document {document_id} in {collection_name}: {e}")
        return False


def update_document(collection_name: str, document_id: str, updates: Dict[str, Any]) -> bool:
    """
    Update specific fields of a document in Firestore.
    
    Args:
        collection_name: Name of the collection
        document_id: ID of the document
        updates: Fields to update
        
    Returns:
        True if successful, False otherwise
    """
    try:
        col = get_collection(collection_name)
        if col is None:
            return False
        
        # Add updated_at timestamp
        updates['updated_at'] = firestore.SERVER_TIMESTAMP
        
        col.document(document_id).update(updates)
        return True
    except Exception as e:
        logger.error(f"Error updating document {document_id} in {collection_name}: {e}")
        return False


def delete_document(collection_name: str, document_id: str) -> bool:
    """
    Delete a document from Firestore.
    
    Args:
        collection_name: Name of the collection
        document_id: ID of the document
        
    Returns:
        True if successful, False otherwise
    """
    try:
        col = get_collection(collection_name)
        if col is None:
            return False
        
        col.document(document_id).delete()
        return True
    except Exception as e:
        logger.error(f"Error deleting document {document_id} from {collection_name}: {e}")
        return False


def query_documents(
    collection_name: str,
    filters: Optional[List[tuple]] = None,
    order_by: Optional[str] = None,
    limit: Optional[int] = None,
    descending: bool = False
) -> List[Dict[str, Any]]:
    """
    Query documents from Firestore with filters.
    
    Args:
        collection_name: Name of the collection
        filters: List of tuples (field, operator, value)
        order_by: Field to order by
        limit: Maximum number of documents to return
        descending: Order descending if True
        
    Returns:
        List of documents
    """
    try:
        col = get_collection(collection_name)
        if col is None:
            return []
        
        query = col
        
        # Apply filters
        if filters:
            for field, operator, value in filters:
                query = query.where(field, operator, value)
        
        # Apply ordering
        if order_by:
            from google.cloud.firestore_v1 import Query
            direction = Query.DESCENDING if descending else Query.ASCENDING
            query = query.order_by(order_by, direction=direction)
        
        # Apply limit
        if limit:
            query = query.limit(limit)
        
        # Execute query
        docs = query.stream()
        return [doc.to_dict() for doc in docs]
        
    except Exception as e:
        logger.error(f"Error querying {collection_name}: {e}")
        return []


def batch_update(updates: List[Dict[str, Any]]) -> bool:
    """
    Perform batch update of multiple documents.
    
    Args:
        updates: List of dicts with keys: collection, document_id, data
        
    Returns:
        True if successful, False otherwise
    """
    try:
        db = get_firestore_client()
        if db is None:
            return False
        
        batch = db.batch()
        
        for update in updates:
            col_name = update['collection']
            doc_id = update['document_id']
            data = update['data']
            
            doc_ref = db.collection(col_name).document(doc_id)
            data['updated_at'] = firestore.SERVER_TIMESTAMP
            batch.update(doc_ref, data)
        
        batch.commit()
        return True
        
    except Exception as e:
        logger.error(f"Error in batch update: {e}")
        return False


def test_connection() -> bool:
    """
    Test Firebase/Firestore connection.
    
    Returns:
        True if connection successful, False otherwise
    """
    try:
        db = get_firestore_client()
        if db is None:
            logger.error("Failed to get Firestore client")
            return False
        
        # Try to read from a test collection
        test_ref = db.collection('_health_check').document('test')
        test_ref.set({'timestamp': firestore.SERVER_TIMESTAMP, 'status': 'ok'})
        doc = test_ref.get()
        
        if doc.exists:
            logger.info("✓ Firebase connection test successful")
            # Clean up test document
            test_ref.delete()
            return True
        else:
            logger.error("Firebase connection test failed")
            return False
            
    except Exception as e:
        logger.error(f"Firebase connection test failed: {e}")
        return False


# Export convenience aliases
get_db = get_firestore_client

