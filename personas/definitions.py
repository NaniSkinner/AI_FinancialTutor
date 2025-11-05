"""
Persona Definitions Module

This module defines the 5 behavioral personas with their criteria,
priority ordering, and educational focus areas.

Personas are assigned in priority order:
1. High Utilization (financial risk)
2. Variable Income Budgeter (stability risk)
3. Student (life stage specific)
4. Subscription-Heavy (behavioral optimization)
5. Savings Builder (positive reinforcement)
"""

from typing import Dict, List

# ============================================================================
# Persona Priority Order
# ============================================================================

PERSONA_PRIORITY: List[str] = [
    "high_utilization",
    "variable_income_budgeter",
    "student",
    "subscription_heavy",
    "savings_builder",
]

# ============================================================================
# Persona Names (Display)
# ============================================================================

PERSONA_NAMES: Dict[str, str] = {
    "high_utilization": "High Utilization",
    "variable_income_budgeter": "Variable Income Budgeter",
    "student": "Student",
    "subscription_heavy": "Subscription-Heavy",
    "savings_builder": "Savings Builder",
    "general": "General",
    "none": "None",
}

# ============================================================================
# Persona Descriptions
# ============================================================================

PERSONA_DESCRIPTIONS: Dict[str, str] = {
    "high_utilization": "Users with high credit card utilization, interest charges, or overdue accounts who need credit health education.",
    "variable_income_budgeter": "Users with irregular income patterns and low cash flow buffers who need income-smoothing strategies.",
    "student": "Students or recent graduates with limited income, student loans, and high lifestyle spending who need foundational financial education.",
    "subscription_heavy": "Users with multiple recurring subscriptions consuming significant portions of their budget who need spending optimization.",
    "savings_builder": "Users actively building savings with healthy credit who need goal-setting and optimization strategies.",
    "general": "Users who don't match specific persona criteria but can benefit from general financial education.",
    "none": "No persona could be assigned due to insufficient data.",
}

# ============================================================================
# Persona Focus Areas
# ============================================================================

PERSONA_FOCUS_AREAS: Dict[str, List[str]] = {
    "high_utilization": [
        "Reduce credit utilization below 30%",
        "Understand credit score impact",
        "Payment planning strategies",
        "Autopay setup",
        "Debt paydown methods (avalanche vs. snowball)",
    ],
    "variable_income_budgeter": [
        "Percent-based budgeting (not fixed dollars)",
        "Emergency fund building",
        "Income smoothing strategies",
        "Multiple income stream management",
        "Cash flow forecasting",
    ],
    "student": [
        "Student budget basics",
        "Student loan literacy (interest, repayment options)",
        "Building credit as a student",
        "Avoiding common student money mistakes",
        "Coffee/food delivery optimization",
    ],
    "subscription_heavy": [
        "Subscription audit strategies",
        "Cancellation/negotiation tips",
        "Bill tracking and alerts",
        "Value assessment of recurring services",
        "Subscription management tools",
    ],
    "savings_builder": [
        "SMART financial goal setting",
        "Savings automation strategies",
        "APY optimization (HYSA, CDs)",
        "Investment readiness education",
        "Advanced saving techniques",
    ],
    "general": [
        "Basic budgeting principles",
        "Financial literacy fundamentals",
        "Saving and spending balance",
        "Credit basics",
        "Financial goal setting",
    ],
}

# ============================================================================
# Educational Topics by Persona
# ============================================================================

EDUCATIONAL_TOPICS: Dict[str, List[str]] = {
    "high_utilization": [
        "Understanding Credit Utilization and Credit Scores",
        "How Interest Compounds on Credit Cards",
        "Payment Strategies: More Than the Minimum",
        "Setting Up Autopay to Avoid Late Fees",
        "Debt Paydown: Avalanche vs. Snowball Method",
    ],
    "variable_income_budgeter": [
        "Budgeting with Irregular Income",
        "Building an Emergency Fund on Variable Income",
        "The 50/30/20 Rule Adapted for Freelancers",
        "Cash Flow Forecasting for Gig Workers",
        "Multiple Income Streams: Pros and Cons",
    ],
    "student": [
        "Student Budgeting 101: Making Your Money Last",
        "Understanding Your Student Loans",
        "Building Credit in College",
        "The $5 Coffee Habit: A Real Cost Analysis",
        "Part-Time Income Management for Students",
    ],
    "subscription_heavy": [
        "The True Cost of Subscriptions",
        "How to Audit Your Recurring Expenses",
        "Negotiating Lower Rates on Services",
        "Subscription Management Tools and Strategies",
        "Is It Worth It? Evaluating Subscription Value",
    ],
    "savings_builder": [
        "Setting SMART Financial Goals",
        "Automate Your Savings: Set It and Forget It",
        "High-Yield Savings Accounts Explained",
        "When Are You Ready to Start Investing?",
        "Compound Interest: The Eighth Wonder",
    ],
    "general": [
        "Financial Basics: Income, Expenses, and Savings",
        "Creating Your First Budget",
        "Understanding Credit and Debt",
        "Emergency Fund Essentials",
        "Setting Financial Goals",
    ],
}

