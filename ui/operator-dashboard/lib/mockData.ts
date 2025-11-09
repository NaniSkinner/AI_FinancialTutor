// Mock Data for Operator Dashboard
// Used for testing and development before backend API is ready

import type {
  Recommendation,
  UserSignals,
  DecisionTrace,
  OperatorStats,
  Alert,
} from "./types";

// ============================================================================
// MOCK RECOMMENDATIONS
// ============================================================================

export const mockRecommendations: Recommendation[] = [
  {
    id: "rec_001",
    user_id: "user_123",
    persona_primary: "high_utilization",
    type: "educational_content",
    title: "Understanding Credit Utilization: Keep Your Score Healthy",
    rationale:
      "Your credit utilization is currently at 78%, which is higher than the recommended 30%. This article explains how utilization affects your credit score and provides actionable steps to bring it down safely.",
    priority: "high",
    status: "pending",
    generated_at: "2025-11-04T09:30:00Z",
    content_url: "/articles/credit_utilization_101",
    read_time_minutes: 5,
    guardrails_passed: {
      tone_check: true,
      advice_check: true,
      eligibility_check: true,
    },
  },
  {
    id: "rec_002",
    user_id: "user_456",
    persona_primary: "subscription_heavy",
    type: "tool",
    title: "Subscription Audit Calculator",
    rationale:
      "You're spending $247/month on recurring subscriptions (22% of your income). This interactive tool helps you review and prioritize which subscriptions provide the most value.",
    priority: "medium",
    status: "pending",
    generated_at: "2025-11-04T08:15:00Z",
    content_url: "/tools/subscription-audit",
    read_time_minutes: 10,
    guardrails_passed: {
      tone_check: true,
      advice_check: true,
      eligibility_check: true,
    },
  },
  {
    id: "rec_003",
    user_id: "user_789",
    persona_primary: "savings_builder",
    type: "educational_content",
    title: "Emergency Fund Milestones: You're Halfway There!",
    rationale:
      "You've saved $3,200 toward your emergency fund goal. This article celebrates your progress and provides strategies to reach the recommended 6-month cushion.",
    priority: "low",
    status: "approved",
    generated_at: "2025-11-03T14:20:00Z",
    approved_by: "op_001",
    approved_at: "2025-11-03T15:45:00Z",
    operator_notes: "Great positive reinforcement content",
    content_url: "/articles/emergency_fund_milestones",
    read_time_minutes: 7,
    guardrails_passed: {
      tone_check: true,
      advice_check: true,
      eligibility_check: true,
    },
  },
  {
    id: "rec_004",
    user_id: "user_234",
    persona_primary: "variable_income_budgeter",
    type: "educational_content",
    title: "Cash Flow Smoothing for Freelancers",
    rationale:
      "With your irregular income pattern (pay gaps ranging 12-45 days), this guide shows how to create a buffer-based budget that adapts to variable cash flow.",
    priority: "high",
    status: "pending",
    generated_at: "2025-11-04T10:00:00Z",
    content_url: "/articles/variable_income_budgeting",
    read_time_minutes: 8,
    guardrails_passed: {
      tone_check: true,
      advice_check: true,
      eligibility_check: true,
    },
  },
  {
    id: "rec_005",
    user_id: "user_567",
    persona_primary: "student",
    type: "tool",
    title: "Student Budget Builder",
    rationale:
      "As a student with limited income, this interactive tool helps you balance essential expenses, savings goals, and occasional spending.",
    priority: "medium",
    status: "rejected",
    generated_at: "2025-11-02T11:30:00Z",
    approved_by: "op_001",
    approved_at: "2025-11-02T13:00:00Z",
    operator_notes: "Content too generic, needs more personalization",
    content_url: "/tools/student-budget",
    read_time_minutes: 12,
    guardrails_passed: {
      tone_check: true,
      advice_check: false,
      eligibility_check: true,
    },
  },
  {
    id: "rec_006",
    user_id: "user_890",
    persona_primary: "high_utilization",
    type: "partner_offer",
    title: "0% Balance Transfer Card - Pre-Qualified",
    rationale:
      "You're paying $87/month in interest charges. A balance transfer card with 0% APR for 18 months could save you approximately $1,500.",
    priority: "high",
    status: "flagged",
    generated_at: "2025-11-04T09:00:00Z",
    operator_notes: "Need to verify eligibility criteria before showing",
    content_url: "/offers/balance-transfer",
    read_time_minutes: 3,
    guardrails_passed: {
      tone_check: true,
      advice_check: true,
      eligibility_check: false,
    },
  },
  {
    id: "rec_007",
    user_id: "user_345",
    persona_primary: "savings_builder",
    type: "partner_offer",
    title: "High-Yield Savings Account: 5.25% APY",
    rationale:
      "Your $8,500 emergency fund is earning just 0.1% in your current account. Moving it to a HYSA could earn you an extra $435/year.",
    priority: "medium",
    status: "pending",
    generated_at: "2025-11-04T07:45:00Z",
    content_url: "/offers/hysa",
    read_time_minutes: 4,
    guardrails_passed: {
      tone_check: true,
      advice_check: true,
      eligibility_check: true,
    },
  },
];

// ============================================================================
// MOCK USER SIGNALS
// ============================================================================

export const mockUserSignals: Record<string, UserSignals> = {
  user_123: {
    user_id: "user_123",
    persona_30d: {
      primary: "high_utilization",
      secondary: "subscription_heavy",
      match_strength: 0.92,
    },
    signals: {
      credit: {
        aggregate_utilization_pct: 78,
        total_credit_used: 11700,
        total_credit_available: 15000,
        any_interest_charges: true,
      },
      subscriptions: {
        recurring_merchant_count: 8,
        monthly_recurring_spend: 247,
        subscription_share_pct: 18,
        merchants: [
          { name: "Netflix", amount: 15.99 },
          { name: "Spotify", amount: 10.99 },
          { name: "Amazon Prime", amount: 14.99 },
        ],
      },
      savings: {
        total_savings_balance: 850,
        savings_growth_rate_pct: -5.2,
        net_savings_inflow: -120,
        emergency_fund_months: 0.3,
      },
      income: {
        income_type: "salaried",
        payment_frequency: "biweekly",
        median_pay_gap_days: 14,
        income_variability_pct: 2.1,
        cash_flow_buffer_months: 0.5,
        monthly_income: 4200,
      },
    },
  },
  user_456: {
    user_id: "user_456",
    persona_30d: {
      primary: "subscription_heavy",
      match_strength: 0.87,
    },
    signals: {
      credit: {
        aggregate_utilization_pct: 35,
        total_credit_used: 3500,
        total_credit_available: 10000,
        any_interest_charges: false,
      },
      subscriptions: {
        recurring_merchant_count: 15,
        monthly_recurring_spend: 395,
        subscription_share_pct: 22,
        merchants: [
          { name: "Netflix", amount: 15.99 },
          { name: "Hulu", amount: 17.99 },
          { name: "Disney+", amount: 13.99 },
          { name: "Spotify", amount: 10.99 },
          { name: "Apple Music", amount: 10.99 },
          { name: "Amazon Prime", amount: 14.99 },
          { name: "YouTube Premium", amount: 11.99 },
          { name: "HBO Max", amount: 15.99 },
          { name: "Gym Membership", amount: 49.99 },
          { name: "Cloud Storage", amount: 9.99 },
          { name: "VPN Service", amount: 12.99 },
          { name: "News Subscription", amount: 8.99 },
          { name: "Meal Kit Service", amount: 89.99 },
          { name: "Software Suite", amount: 29.99 },
          { name: "Gaming Subscription", amount: 14.99 },
        ],
      },
      savings: {
        total_savings_balance: 5200,
        savings_growth_rate_pct: 8.3,
        net_savings_inflow: 250,
        emergency_fund_months: 2.1,
      },
      income: {
        income_type: "salaried",
        payment_frequency: "monthly",
        median_pay_gap_days: 30,
        income_variability_pct: 0.5,
        cash_flow_buffer_months: 1.8,
        monthly_income: 5500,
      },
    },
  },
  user_789: {
    user_id: "user_789",
    persona_30d: {
      primary: "savings_builder",
      match_strength: 0.94,
    },
    signals: {
      credit: {
        aggregate_utilization_pct: 12,
        total_credit_used: 1200,
        total_credit_available: 10000,
        any_interest_charges: false,
      },
      subscriptions: {
        recurring_merchant_count: 4,
        monthly_recurring_spend: 85,
        subscription_share_pct: 5,
        merchants: [
          { name: "Spotify", amount: 10.99 },
          { name: "Gym Membership", amount: 29.99 },
          { name: "Cloud Storage", amount: 9.99 },
          { name: "News Subscription", amount: 6.99 },
        ],
      },
      savings: {
        total_savings_balance: 8500,
        savings_growth_rate_pct: 15.7,
        net_savings_inflow: 650,
        emergency_fund_months: 4.2,
      },
      income: {
        income_type: "salaried",
        payment_frequency: "biweekly",
        median_pay_gap_days: 14,
        income_variability_pct: 1.2,
        cash_flow_buffer_months: 3.5,
        monthly_income: 6000,
      },
    },
  },
};

// ============================================================================
// MOCK DECISION TRACES
// ============================================================================

export const mockDecisionTraces: Record<string, DecisionTrace> = {
  rec_001: {
    recommendation_id: "rec_001",
    signals_detected_at: "2025-11-04T09:29:45Z",
    persona_assigned_at: "2025-11-04T09:29:48Z",
    content_matched_at: "2025-11-04T09:29:52Z",
    rationale_generated_at: "2025-11-04T09:29:58Z",
    guardrails_checked_at: "2025-11-04T09:30:00Z",
    created_at: "2025-11-04T09:30:00Z",
    signals: mockUserSignals.user_123.signals,
    persona_assignment: {
      primary_persona: "high_utilization",
      primary_match_strength: 0.92,
      criteria_met: [
        "aggregate_utilization > 70%",
        "any_interest_charges = true",
        "emergency_fund < 1 month",
      ],
    },
    content_matches: [
      {
        content_id: "article_cu101",
        title: "Understanding Credit Utilization",
        relevance_score: 0.94,
        match_reason: "high_credit_utilization",
      },
      {
        content_id: "tool_debt_payoff",
        title: "Debt Payoff Calculator",
        relevance_score: 0.88,
        match_reason: "debt_management",
      },
      {
        content_id: "article_interest_charges",
        title: "How to Stop Paying Credit Card Interest",
        relevance_score: 0.82,
        match_reason: "interest_reduction",
      },
    ],
    relevance_scores: [0.94, 0.88],
    rationale:
      "Your credit utilization is currently at 78%, which is higher than the recommended 30%. This article explains how utilization affects your credit score and provides actionable steps to bring it down safely.",
    llm_model: "gpt-4",
    temperature: 0.7,
    tokens_used: 142,
    tone_check: true,
    advice_check: true,
    eligibility_check: true,
    guardrails_passed: true,
    priority: "high",
    type: "educational_content",
  },
  rec_002: {
    recommendation_id: "rec_002",
    signals_detected_at: "2025-11-04T08:14:30Z",
    persona_assigned_at: "2025-11-04T08:14:33Z",
    content_matched_at: "2025-11-04T08:14:38Z",
    rationale_generated_at: "2025-11-04T08:14:45Z",
    guardrails_checked_at: "2025-11-04T08:14:47Z",
    created_at: "2025-11-04T08:15:00Z",
    signals: mockUserSignals.user_456.signals,
    persona_assignment: {
      primary_persona: "subscription_heavy",
      primary_match_strength: 0.87,
      criteria_met: [
        "recurring_merchant_count > 10",
        "subscription_share_pct > 20%",
        "monthly_recurring_spend > $200",
      ],
    },
    content_matches: [
      {
        content_id: "tool_subscription_audit",
        title: "Subscription Audit Calculator",
        relevance_score: 0.91,
        match_reason: "subscription_management",
      },
      {
        content_id: "article_subscription_fatigue",
        title: "The Hidden Cost of Subscription Creep",
        relevance_score: 0.85,
        match_reason: "subscription_awareness",
      },
    ],
    relevance_scores: [0.91, 0.85],
    rationale:
      "You're spending $247/month on recurring subscriptions (22% of your income). This interactive tool helps you review and prioritize which subscriptions provide the most value.",
    llm_model: "gpt-4",
    temperature: 0.7,
    tokens_used: 168,
    tone_check: true,
    advice_check: true,
    eligibility_check: true,
    guardrails_passed: true,
    priority: "medium",
    type: "tool",
  },
  rec_003: {
    recommendation_id: "rec_003",
    signals_detected_at: "2025-11-03T14:19:15Z",
    persona_assigned_at: "2025-11-03T14:19:18Z",
    content_matched_at: "2025-11-03T14:19:24Z",
    rationale_generated_at: "2025-11-03T14:19:32Z",
    guardrails_checked_at: "2025-11-03T14:19:35Z",
    created_at: "2025-11-03T14:20:00Z",
    signals: mockUserSignals.user_789.signals,
    persona_assignment: {
      primary_persona: "savings_builder",
      primary_match_strength: 0.94,
      criteria_met: [
        "savings_growth_rate > 10%",
        "emergency_fund > 3 months",
        "net_savings_inflow > $500",
      ],
    },
    content_matches: [
      {
        content_id: "article_emergency_fund",
        title: "Emergency Fund Milestones: You're Halfway There!",
        relevance_score: 0.96,
        match_reason: "savings_progress",
      },
      {
        content_id: "tool_savings_goal",
        title: "Savings Goal Calculator",
        relevance_score: 0.89,
        match_reason: "goal_planning",
      },
    ],
    relevance_scores: [0.96, 0.89],
    rationale:
      "You've saved $3,200 toward your emergency fund goal. This article celebrates your progress and provides strategies to reach the recommended 6-month cushion.",
    llm_model: "gpt-4",
    temperature: 0.7,
    tokens_used: 152,
    tone_check: true,
    advice_check: true,
    eligibility_check: true,
    guardrails_passed: true,
    priority: "low",
    type: "educational_content",
  },
  rec_006: {
    recommendation_id: "rec_006",
    signals_detected_at: "2025-11-04T08:59:30Z",
    persona_assigned_at: "2025-11-04T08:59:33Z",
    content_matched_at: "2025-11-04T08:59:38Z",
    rationale_generated_at: "2025-11-04T08:59:45Z",
    guardrails_checked_at: "2025-11-04T08:59:50Z",
    created_at: "2025-11-04T09:00:00Z",
    signals: mockUserSignals.user_123.signals,
    persona_assignment: {
      primary_persona: "high_utilization",
      primary_match_strength: 0.92,
      criteria_met: [
        "aggregate_utilization > 70%",
        "any_interest_charges = true",
        "has_sufficient_credit_history",
      ],
    },
    content_matches: [
      {
        content_id: "offer_balance_transfer",
        title: "0% Balance Transfer Card - Pre-Qualified",
        relevance_score: 0.88,
        match_reason: "balance_transfer_eligible",
      },
    ],
    relevance_scores: [0.88],
    rationale:
      "You're paying $87/month in interest charges. A balance transfer card with 0% APR for 18 months could save you approximately $1,500.",
    llm_model: "gpt-4",
    temperature: 0.7,
    tokens_used: 195,
    tone_check: true,
    advice_check: true,
    eligibility_check: false,
    guardrails_passed: false,
    priority: "high",
    type: "partner_offer",
  },
};

// ============================================================================
// MOCK OPERATOR STATS
// ============================================================================

export const mockOperatorStats: OperatorStats = {
  pending: 47,
  approved_today: 23,
  rejected_today: 4,
  flagged: 3,
  avg_review_time_seconds: 45,
};

// ============================================================================
// MOCK ALERTS
// ============================================================================

export const mockAlerts: Alert[] = [
  {
    id: "alert_001",
    type: "long_queue",
    severity: "medium",
    message: "Review queue above threshold: 47 pending items",
    count: 47,
    actionUrl: "/?status=pending",
    createdAt: "2025-11-04T10:00:00Z",
  },
  {
    id: "alert_002",
    type: "flagged_item",
    severity: "high",
    message: "3 items flagged for review",
    count: 3,
    actionUrl: "/?status=flagged",
    createdAt: "2025-11-04T09:45:00Z",
  },
  {
    id: "alert_003",
    type: "guardrail_failures",
    severity: "low",
    message: "2 guardrail failures in last hour",
    count: 2,
    createdAt: "2025-11-04T09:30:00Z",
  },
];

// ============================================================================
// MOCK PERSONA HISTORY
// ============================================================================

export interface PersonaHistoryEntry {
  date: string;
  persona: string;
  match_strength: number;
}

export const mockPersonaHistory: Record<string, PersonaHistoryEntry[]> = {
  user_123: [
    {
      date: "2025-11-04",
      persona: "high_utilization",
      match_strength: 0.92,
    },
    {
      date: "2025-10-04",
      persona: "high_utilization",
      match_strength: 0.89,
    },
    {
      date: "2025-09-04",
      persona: "high_utilization",
      match_strength: 0.85,
    },
    {
      date: "2025-08-04",
      persona: "subscription_heavy",
      match_strength: 0.78,
    },
    {
      date: "2025-07-04",
      persona: "subscription_heavy",
      match_strength: 0.81,
    },
  ],
  user_456: [
    {
      date: "2025-11-04",
      persona: "subscription_heavy",
      match_strength: 0.87,
    },
    {
      date: "2025-10-04",
      persona: "subscription_heavy",
      match_strength: 0.84,
    },
    {
      date: "2025-09-04",
      persona: "subscription_heavy",
      match_strength: 0.82,
    },
    {
      date: "2025-08-04",
      persona: "savings_builder",
      match_strength: 0.73,
    },
  ],
  user_789: [
    {
      date: "2025-11-04",
      persona: "savings_builder",
      match_strength: 0.94,
    },
    {
      date: "2025-10-04",
      persona: "savings_builder",
      match_strength: 0.91,
    },
    {
      date: "2025-09-04",
      persona: "savings_builder",
      match_strength: 0.88,
    },
    {
      date: "2025-08-04",
      persona: "student",
      match_strength: 0.76,
    },
    {
      date: "2025-07-04",
      persona: "student",
      match_strength: 0.79,
    },
    {
      date: "2025-06-04",
      persona: "student",
      match_strength: 0.82,
    },
  ],
};

// ============================================================================
// MOCK USER DASHBOARD DATA
// ============================================================================

import type { DashboardResponse } from "./types";

export function getMockDashboardData(userId: string): DashboardResponse {
  return {
    user: {
      id: userId,
      name: "Demo User",
      email: "demo@spendsense.com",
      avatarUrl: undefined,
    },
    persona: {
      primary: "high_utilization",
      match_strength: "strong",
      secondary: ["subscription_heavy"],
    },
    signals: {
      user_id: userId,
      persona_30d: {
        primary: "high_utilization",
        secondary: "subscription_heavy",
        match_strength: 0.92,
      },
      signals: {
        credit: {
          aggregate_utilization_pct: 68,
          total_credit_used: 5500,
          total_credit_available: 8000,
          any_interest_charges: true,
        },
        subscriptions: {
          recurring_merchant_count: 5,
          monthly_recurring_spend: 127.5,
          subscription_share_pct: 11.8,
          merchants: [
            { name: "Netflix", amount: 15.99 },
            { name: "Spotify", amount: 10.99 },
            { name: "Adobe Creative", amount: 52.99 },
            { name: "Planet Fitness", amount: 24.99 },
            { name: "DoorDash", amount: 22.54 },
          ],
        },
        savings: {
          total_savings_balance: 5250,
          savings_growth_rate_pct: 3.2,
          net_savings_inflow: 350,
          emergency_fund_months: 2.1,
        },
        income: {
          income_type: "salaried",
          payment_frequency: "biweekly",
          median_pay_gap_days: 14,
          income_variability_pct: 5.2,
          cash_flow_buffer_months: 0.8,
          monthly_income: 3800,
        },
      },
    },
    recommendations: getMockUserRecommendations(userId),
    progress: {
      completedCount: 2,
      totalCount: 5,
      streak: 7,
    },
    gamification: {
      streak: 7,
      level: 2,
      levelProgress: 150,
      levelMax: 250,
      totalPoints: 85,
      achievements: [
        {
          id: "first_login",
          title: "Welcome Aboard",
          earnedAt: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          icon: "🎉",
          points: 10,
        },
        {
          id: "first_rec_complete",
          title: "First Article Complete",
          earnedAt: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          icon: "📚",
          points: 10,
        },
        {
          id: "7_day_streak",
          title: "7-Day Streak",
          earnedAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          icon: "🔥",
          points: 25,
        },
      ],
      activeChallenge: undefined,
      completedChallenges: [
        {
          id: "subscription_audit",
          title: "Subscription Audit",
          completedAt: new Date(
            Date.now() - 15 * 24 * 60 * 60 * 1000
          ).toISOString(),
          savings: 50,
        },
      ],
    },
    recentTransition: undefined, // No recent transition for demo user
  };
}

function getMockUserRecommendations(userId: string): Recommendation[] {
  return [
    {
      id: "rec_user_001",
      user_id: userId,
      persona_primary: "high_utilization",
      type: "article",
      title: "Understanding Credit Utilization and Your Credit Score",
      rationale:
        "We noticed your Visa ending in 4523 is at 68% utilization with a $3,400 balance. This article explains how utilization affects credit scores and strategies to bring it below 30%, which many people find helpful for improving their credit health.",
      priority: "high",
      status: "pending",
      generated_at: new Date().toISOString(),
      content_url: "/learn/credit-utilization",
      read_time_minutes: 3,
      guardrails_passed: {
        tone_check: true,
        advice_check: true,
        eligibility_check: true,
      },
    },
    {
      id: "rec_user_002",
      user_id: userId,
      persona_primary: "subscription_heavy",
      type: "article",
      title: "The True Cost of Subscriptions",
      rationale:
        "Your 5 subscriptions total $127.50 monthly, representing 11.8% of your spending. This article walks through a subscription audit process that helps many people identify services they're no longer using.",
      priority: "medium",
      status: "pending",
      generated_at: new Date().toISOString(),
      content_url: "/learn/subscription-audit",
      read_time_minutes: 4,
      guardrails_passed: {
        tone_check: true,
        advice_check: true,
        eligibility_check: true,
      },
    },
    {
      id: "rec_user_003",
      user_id: userId,
      persona_primary: "high_utilization",
      type: "calculator",
      title: "Credit Utilization Calculator",
      rationale:
        "Based on your $5,500 in credit card balances across $8,000 in available credit, this calculator helps you see how paying down balances affects your utilization ratio.",
      priority: "high",
      status: "approved",
      generated_at: new Date().toISOString(),
      content_url: "/calculators?type=credit-utilization",
      read_time_minutes: 5,
      guardrails_passed: {
        tone_check: true,
        advice_check: true,
        eligibility_check: true,
      },
    },
    {
      id: "rec_user_004",
      user_id: userId,
      persona_primary: "high_utilization",
      type: "article",
      title: "How Interest Compounds on Credit Cards",
      rationale:
        "With $86.51 in monthly interest charges across your cards, understanding how interest works can help you prioritize payoff strategies.",
      priority: "medium",
      status: "pending",
      generated_at: new Date().toISOString(),
      content_url: "/learn/credit-interest",
      read_time_minutes: 3,
      guardrails_passed: {
        tone_check: true,
        advice_check: true,
        eligibility_check: true,
      },
    },
    {
      id: "rec_user_005",
      user_id: userId,
      persona_primary: "savings_builder",
      type: "article",
      title: "Emergency Fund Basics",
      rationale:
        "Your savings of $5,250 covers 2.1 months of expenses. This article explains strategies to reach the 3-6 month recommendation.",
      priority: "low",
      status: "approved",
      generated_at: new Date().toISOString(),
      content_url: "/learn/emergency-fund",
      read_time_minutes: 4,
      guardrails_passed: {
        tone_check: true,
        advice_check: true,
        eligibility_check: true,
      },
    },
  ];
}
