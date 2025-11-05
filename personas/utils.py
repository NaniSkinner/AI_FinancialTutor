"""
Utility functions for the Persona System.

Helper functions used across persona assignment and transition tracking.
"""

from typing import Dict, Any, Optional
from datetime import datetime
import json


def parse_signal_json(signal_json: Optional[str]) -> Dict[str, Any]:
    """
    Parse JSON signal data safely.
    
    Args:
        signal_json: JSON string containing signal data
        
    Returns:
        Dict containing parsed signal data, or empty dict if invalid
    """
    if not signal_json:
        return {}
    
    try:
        return json.loads(signal_json)
    except (json.JSONDecodeError, TypeError):
        return {}


def safe_get(data: Dict[str, Any], key: str, default: Any = None) -> Any:
    """
    Safely get a value from a dictionary with a default.
    
    Args:
        data: Dictionary to get value from
        key: Key to look up
        default: Default value if key not found
        
    Returns:
        Value from dict or default
    """
    return data.get(key, default)


def format_iso_timestamp(dt: Optional[datetime] = None) -> str:
    """
    Format a datetime as ISO 8601 timestamp.
    
    Args:
        dt: Datetime to format (defaults to now)
        
    Returns:
        ISO 8601 formatted timestamp string
    """
    if dt is None:
        dt = datetime.now()
    return dt.isoformat()


def parse_iso_timestamp(timestamp_str: str) -> datetime:
    """
    Parse an ISO 8601 timestamp string.
    
    Args:
        timestamp_str: ISO 8601 formatted timestamp
        
    Returns:
        Parsed datetime object
    """
    # Handle 'Z' timezone indicator
    if timestamp_str.endswith('Z'):
        timestamp_str = timestamp_str[:-1] + '+00:00'
    
    return datetime.fromisoformat(timestamp_str)


def generate_id(prefix: str) -> str:
    """
    Generate a unique ID with a prefix.
    
    Args:
        prefix: Prefix for the ID (e.g., 'persona_', 'transition_')
        
    Returns:
        Unique ID string
    """
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S%f')
    return f"{prefix}{timestamp}"

