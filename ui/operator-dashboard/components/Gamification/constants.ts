// Constants and Milestone Definitions for Gamification System
// Persona-specific milestones and challenge definitions

import type { PersonaMilestones, Challenge } from "./types";

// ============================================================================
// PERSONA-SPECIFIC MILESTONES
// ============================================================================

export const PERSONA_MILESTONES: PersonaMilestones = {
  high_utilization: [
    {
      id: "util_below_80",
      title: "Utilization Below 80%",
      achieved: false,
      points: 10,
      description: "Reduce credit utilization to below 80%",
    },
    {
      id: "util_below_50",
      title: "Utilization Below 50%",
      achieved: false,
      points: 25,
      description: "Reduce credit utilization to below 50%",
    },
    {
      id: "util_below_30",
      title: "Utilization Below 30%",
      achieved: false,
      points: 50,
      description: "Reach the recommended utilization of below 30%",
    },
    {
      id: "no_interest",
      title: "Interest-Free Month",
      achieved: false,
      points: 100,
      description: "Complete a full month without paying interest charges",
    },
  ],
  student: [
    {
      id: "budget_created",
      title: "Created First Budget",
      achieved: false,
      points: 10,
      description: "Set up your first monthly budget",
    },
    {
      id: "tracked_30days",
      title: "30 Days of Tracking",
      achieved: false,
      points: 25,
      description: "Track your spending for 30 consecutive days",
    },
    {
      id: "saved_100",
      title: "Saved $100",
      achieved: false,
      points: 50,
      description: "Reach $100 in savings",
    },
    {
      id: "reduced_delivery",
      title: "Cut Delivery 25%",
      achieved: false,
      points: 75,
      description: "Reduce food delivery spending by 25%",
    },
  ],
  savings_builder: [
    {
      id: "1month_fund",
      title: "1 Month Emergency Fund",
      achieved: false,
      points: 25,
      description: "Save 1 month of expenses for emergencies",
    },
    {
      id: "3month_fund",
      title: "3 Month Emergency Fund",
      achieved: false,
      points: 50,
      description: "Build a 3-month emergency fund",
    },
    {
      id: "6month_fund",
      title: "6 Month Emergency Fund",
      achieved: false,
      points: 100,
      description: "Reach the recommended 6-month emergency fund",
    },
    {
      id: "automated_savings",
      title: "Automated Savings",
      achieved: false,
      points: 25,
      description: "Set up automatic savings transfers",
    },
  ],
  subscription_heavy: [
    {
      id: "audit_complete",
      title: "Completed Subscription Audit",
      achieved: false,
      points: 10,
      description: "Review all active subscriptions",
    },
    {
      id: "cancelled_1",
      title: "Cancelled 1 Subscription",
      achieved: false,
      points: 25,
      description: "Cancel at least one unused subscription",
    },
    {
      id: "saved_50",
      title: "Saved $50/month",
      achieved: false,
      points: 50,
      description: "Reduce subscription costs by $50 per month",
    },
    {
      id: "under_5",
      title: "Under 5 Subscriptions",
      achieved: false,
      points: 75,
      description: "Optimize to fewer than 5 active subscriptions",
    },
  ],
  variable_income_budgeter: [
    {
      id: "buffer_started",
      title: "Started Emergency Buffer",
      achieved: false,
      points: 10,
      description: "Begin building an income buffer",
    },
    {
      id: "1month_buffer",
      title: "1 Month Buffer Saved",
      achieved: false,
      points: 50,
      description: "Save 1 month of expenses as a buffer",
    },
    {
      id: "income_tracked",
      title: "Tracked Income 90 Days",
      achieved: false,
      points: 25,
      description: "Track variable income for 90 days",
    },
    {
      id: "budget_percent",
      title: "Set % Budget Rules",
      achieved: false,
      points: 15,
      description: "Create percentage-based budget rules",
    },
  ],
};

// ============================================================================
// SAVINGS CHALLENGES
// ============================================================================

export const SAVINGS_CHALLENGES: Challenge[] = [
  {
    id: "coffee_week",
    title: "7-Day Coffee Challenge",
    description: "Make coffee at home for 7 consecutive days",
    durationDays: 7,
    potentialSavings: 35,
    difficulty: "easy",
    category: "Food & Drink",
  },
  {
    id: "no_delivery",
    title: "No Delivery November",
    description: "Cook or prep all meals at home for 30 days",
    durationDays: 30,
    potentialSavings: 200,
    difficulty: "hard",
    category: "Food & Drink",
  },
  {
    id: "subscription_audit",
    title: "Subscription Audit",
    description: "Review and cancel at least one unused subscription",
    durationDays: 1,
    potentialSavings: 50,
    difficulty: "easy",
    category: "Subscriptions",
  },
  {
    id: "no_impulse",
    title: "30-Day No Impulse Buy",
    description: "Wait 24 hours before any non-essential purchase",
    durationDays: 30,
    potentialSavings: 150,
    difficulty: "medium",
    category: "Shopping",
  },
  {
    id: "pack_lunch",
    title: "2-Week Lunch Prep",
    description: "Bring packed lunch to work for 2 weeks",
    durationDays: 14,
    potentialSavings: 70,
    difficulty: "medium",
    category: "Food & Drink",
  },
];

// ============================================================================
// LEVEL THRESHOLDS
// ============================================================================

export const LEVEL_THRESHOLDS = [
  { level: 1, minXP: 0, maxXP: 100 },
  { level: 2, minXP: 100, maxXP: 250 },
  { level: 3, minXP: 250, maxXP: 500 },
  { level: 4, minXP: 500, maxXP: 1000 },
  { level: 5, minXP: 1000, maxXP: 2000 },
  { level: 6, minXP: 2000, maxXP: 3500 },
  { level: 7, minXP: 3500, maxXP: 5000 },
  { level: 8, minXP: 5000, maxXP: 7500 },
  { level: 9, minXP: 7500, maxXP: 10000 },
  { level: 10, minXP: 10000, maxXP: Infinity },
];

// ============================================================================
// POINT VALUES
// ============================================================================

export const POINT_VALUES = {
  COMPLETE_RECOMMENDATION: 10,
  USE_CALCULATOR: 5,
  READ_ARTICLE: 5,
  COMPLETE_CHALLENGE: 50,
  DAILY_STREAK: 10,
  ACHIEVE_MILESTONE: 0, // Points defined per milestone
};

// ============================================================================
// CELEBRATION DEFINITIONS
// ============================================================================

export const CELEBRATIONS = {
  high_utilization_to_savings_builder: {
    title: "Amazing Progress!",
    message: "You've improved your credit health and started building savings!",
    achievement: "Credit Champion",
    color: "from-green-400 to-blue-500",
  },
  student_to_savings_builder: {
    title: "Financial Graduation!",
    message: "You've mastered student budgeting and are building your future!",
    achievement: "Smart Scholar",
    color: "from-blue-400 to-purple-500",
  },
  variable_income_budgeter_to_savings_builder: {
    title: "Stability Achieved!",
    message: "Your income has stabilized and you're building savings!",
    achievement: "Stability Master",
    color: "from-purple-400 to-pink-500",
  },
  subscription_heavy_to_savings_builder: {
    title: "Subscriptions Optimized!",
    message: "You've streamlined your subscriptions and are saving more!",
    achievement: "Subscription Master",
    color: "from-orange-400 to-red-500",
  },
  default: {
    title: "Congratulations!",
    message: "You've made great progress on your financial journey!",
    achievement: "Progress Champion",
    color: "from-blue-400 to-green-500",
  },
};
