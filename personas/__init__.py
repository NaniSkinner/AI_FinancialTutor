"""
SpendSense Persona System

This module implements behavioral persona classification for financial education.
Users are assigned to one of 5 personas based on quantitative signal criteria:

- High Utilization: Credit health issues
- Variable Income Budgeter: Income stability challenges
- Student: Life stage specific needs
- Subscription-Heavy: Spending optimization opportunities
- Savings Builder: Positive financial behaviors

The system tracks persona transitions over time and celebrates financial progress.
"""

from .definitions import (
    PERSONA_PRIORITY,
    PERSONA_NAMES,
    PERSONA_DESCRIPTIONS,
    PERSONA_FOCUS_AREAS,
)
from .assignment import PersonaAssigner
from .transitions import PersonaTransitionTracker

__version__ = "1.0.0"
__all__ = [
    "PersonaAssigner",
    "PersonaTransitionTracker",
    "PERSONA_PRIORITY",
    "PERSONA_NAMES",
    "PERSONA_DESCRIPTIONS",
    "PERSONA_FOCUS_AREAS",
]

