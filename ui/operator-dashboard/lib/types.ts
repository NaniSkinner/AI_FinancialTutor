// Core Type Definitions for Operator Dashboard
// This file contains all TypeScript interfaces for the SpendSense Operator Dashboard

// ============================================================================
// RECOMMENDATION TYPES
// ============================================================================

export interface Recommendation {
  id: string;
  user_id: string;
  persona_primary: string;
  type: string;
  title: string;
  rationale: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "approved" | "rejected" | "flagged";
  generated_at: string;
  approved_by?: string;
  approved_at?: string;
  operator_notes?: string;
  content_url?: string;
  read_time_minutes?: number;
  guardrails_passed: {
    tone_check: boolean;
    advice_check: boolean;
    eligibility_check: boolean;
  };
  // Undo support fields
  previous_status?: string;
  status_changed_at?: string;
  undo_window_expires_at?: string;
}

// ============================================================================
// USER SIGNALS TYPES
// ============================================================================

export interface CreditSignals {
  aggregate_utilization_pct: number;
  total_credit_used: number;
  total_credit_available: number;
  any_interest_charges: boolean;
}

export interface SubscriptionSignals {
  recurring_merchant_count: number;
  monthly_recurring_spend: number;
  subscription_share_pct: number;
  merchants?: Array<{
    name: string;
    amount: number;
  }>;
}

export interface SavingsSignals {
  total_savings_balance: number;
  savings_growth_rate_pct: number;
  net_savings_inflow: number;
  emergency_fund_months: number;
}

export interface IncomeSignals {
  income_type: "salaried" | "variable" | "irregular";
  payment_frequency: "weekly" | "biweekly" | "monthly";
  median_pay_gap_days: number;
  income_variability_pct: number;
  cash_flow_buffer_months: number;
  monthly_income: number;
}

export interface UserSignals {
  user_id: string;
  persona_30d: {
    primary: string;
    secondary?: string;
    match_strength: number;
  };
  signals: {
    credit: CreditSignals;
    subscriptions: SubscriptionSignals;
    savings: SavingsSignals;
    income: IncomeSignals;
  };
}

// ============================================================================
// DECISION TRACE TYPES
// ============================================================================

export interface DecisionTrace {
  recommendation_id: string;
  signals_detected_at: string;
  persona_assigned_at: string;
  content_matched_at: string;
  rationale_generated_at: string;
  guardrails_checked_at: string;
  created_at: string;
  signals: UserSignals["signals"];
  persona_assignment: {
    primary_persona: string;
    primary_match_strength: number;
    criteria_met: string[];
  };
  content_matches: unknown[];
  relevance_scores: unknown[];
  rationale: string;
  llm_model: string;
  temperature: number;
  tokens_used: number;
  tone_check: boolean;
  advice_check: boolean;
  eligibility_check: boolean;
  guardrails_passed: boolean;
  priority: string;
  type: string;
}

// ============================================================================
// OPERATOR ACTION TYPES
// ============================================================================

export interface OperatorStats {
  pending: number;
  approved_today: number;
  rejected_today: number;
  flagged: number;
  avg_review_time_seconds: number;
}

export interface Alert {
  id: string;
  type:
    | "high_rejection_rate"
    | "long_queue"
    | "guardrail_failures"
    | "llm_errors"
    | "flagged_item"
    | "unusual_pattern";
  severity: "low" | "medium" | "high";
  message: string;
  count?: number;
  actionUrl?: string;
  createdAt: string;
}

export interface OperatorAction {
  action: "approve" | "reject" | "modify" | "flag";
  recommendation_id: string;
  notes?: string;
  reason?: string;
  modifications?: Partial<Recommendation>;
}

export interface BulkApproveResult {
  total: number;
  approved: number;
  failed: number;
  approved_ids: string[];
  failed_items: Array<{
    recommendation_id: string;
    reason: string;
  }>;
}

// ============================================================================
// USER DASHBOARD TYPES
// ============================================================================

export interface DashboardResponse {
  user: UserProfile;
  persona: PersonaInfo;
  signals: UserSignals;
  recommendations: Recommendation[];
  progress: ProgressStats;
  gamification?: GamificationData;
  recentTransition?: PersonaTransitionData;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface PersonaInfo {
  primary: string;
  match_strength: string;
  secondary?: string[];
}

export interface ProgressStats {
  completedCount: number;
  totalCount: number;
  streak: number;
}

export interface SnapshotMetric {
  label: string;
  value: string;
  icon: any;
  status: "good" | "warning" | "danger" | "neutral";
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
}

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export interface GamificationData {
  streak: number;
  level: number;
  levelProgress: number;
  levelMax: number;
  totalPoints: number;
  achievements: AchievementData[];
  activeChallenge?: ActiveChallengeData;
  completedChallenges: CompletedChallengeData[];
}

export interface AchievementData {
  id: string;
  title: string;
  earnedAt: string;
  icon?: string;
  points?: number;
}

export interface ActiveChallengeData {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  progressDays: number;
  potentialSavings: number;
  startedAt: string;
}

export interface CompletedChallengeData {
  id: string;
  title: string;
  completedAt: string;
  savings: number;
}

export interface PersonaTransitionData {
  fromPersona: string;
  toPersona: string;
  transitionDate: string;
  achievement?: string;
}
