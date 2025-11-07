// Gamification Service
// Handles all gamification logic: points, levels, streaks, milestones, challenges

import {
  PERSONA_MILESTONES,
  POINT_VALUES,
  LEVEL_THRESHOLDS,
} from "@/components/Gamification/constants";
import type { GamificationData, UserSignals } from "./types";
import type { Milestone } from "@/components/Gamification/types";

// ============================================================================
// STREAK MANAGEMENT
// ============================================================================

export interface StreakData {
  streak: number;
  lastActivityDate: string;
  longestStreak: number;
}

/**
 * Update streak based on daily activity
 */
export function updateStreak(
  currentStreakData: StreakData,
  activityDate: Date = new Date()
): StreakData {
  const now = new Date(activityDate);
  const lastActivity = new Date(currentStreakData.lastActivityDate);

  // Reset time to start of day for comparison
  now.setHours(0, 0, 0, 0);
  lastActivity.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  let newStreak = currentStreakData.streak;

  if (daysDiff === 0) {
    // Same day, keep current streak
    newStreak = currentStreakData.streak;
  } else if (daysDiff === 1) {
    // Next day, increment streak
    newStreak = currentStreakData.streak + 1;
  } else {
    // Missed days, reset streak to 1
    newStreak = 1;
  }

  return {
    streak: newStreak,
    lastActivityDate: activityDate.toISOString(),
    longestStreak: Math.max(newStreak, currentStreakData.longestStreak),
  };
}

/**
 * Award points for maintaining streak
 */
export function getStreakBonus(streak: number): number {
  if (streak >= 30) return 50; // 30-day streak
  if (streak >= 14) return 25; // 14-day streak
  if (streak >= 7) return 10; // 7-day streak
  if (streak >= 3) return 5; // 3-day streak
  return 0;
}

// ============================================================================
// POINT SYSTEM
// ============================================================================

export interface PointsTransaction {
  type:
    | "recommendation_complete"
    | "calculator_use"
    | "article_read"
    | "challenge_complete"
    | "streak_bonus"
    | "milestone";
  points: number;
  timestamp: string;
  description: string;
}

/**
 * Award points for an action
 */
export function awardPoints(
  type: PointsTransaction["type"],
  customPoints?: number
): PointsTransaction {
  let points = 0;
  let description = "";

  switch (type) {
    case "recommendation_complete":
      points = POINT_VALUES.COMPLETE_RECOMMENDATION;
      description = "Completed a recommendation";
      break;
    case "calculator_use":
      points = POINT_VALUES.USE_CALCULATOR;
      description = "Used a financial calculator";
      break;
    case "article_read":
      points = POINT_VALUES.READ_ARTICLE;
      description = "Read an educational article";
      break;
    case "challenge_complete":
      points = customPoints || POINT_VALUES.COMPLETE_CHALLENGE;
      description = "Completed a savings challenge";
      break;
    case "streak_bonus":
      points = customPoints || POINT_VALUES.DAILY_STREAK;
      description = "Daily streak bonus";
      break;
    case "milestone":
      points = customPoints || 0;
      description = "Achieved a milestone";
      break;
  }

  return {
    type,
    points,
    timestamp: new Date().toISOString(),
    description,
  };
}

/**
 * Calculate total points from transactions
 */
export function calculateTotalPoints(
  transactions: PointsTransaction[]
): number {
  return transactions.reduce((sum, t) => sum + t.points, 0);
}

// ============================================================================
// LEVEL SYSTEM
// ============================================================================

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progress: number;
  progressPercentage: number;
}

/**
 * Calculate user level and progress from total XP
 */
export function calculateLevelInfo(totalXP: number): LevelInfo {
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 100;

  // Find current level
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXP >= threshold.minXP && totalXP < threshold.maxXP) {
      level = threshold.level;
      xpForCurrentLevel = threshold.minXP;
      xpForNextLevel = threshold.maxXP;
      break;
    }
  }

  const progress = totalXP - xpForCurrentLevel;
  const progressMax = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (progress / progressMax) * 100;

  return {
    level,
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    progress,
    progressPercentage,
  };
}

/**
 * Check if user leveled up
 */
export function checkLevelUp(previousXP: number, newXP: number): boolean {
  const prevLevel = calculateLevelInfo(previousXP).level;
  const newLevel = calculateLevelInfo(newXP).level;
  return newLevel > prevLevel;
}

// ============================================================================
// MILESTONE ACHIEVEMENT LOGIC
// ============================================================================

/**
 * Check and update milestone achievements based on user signals
 */
export function updateMilestoneAchievements(
  persona: string,
  signals: UserSignals["signals"]
): Milestone[] {
  const milestones = [
    ...(PERSONA_MILESTONES[persona] || PERSONA_MILESTONES.savings_builder),
  ];

  // High Utilization Milestones
  if (persona === "high_utilization") {
    const utilization = signals.credit.aggregate_utilization_pct;
    milestones[0].achieved = utilization < 80; // Below 80%
    milestones[1].achieved = utilization < 50; // Below 50%
    milestones[2].achieved = utilization < 30; // Below 30%
    milestones[3].achieved = !signals.credit.any_interest_charges; // No interest
  }

  // Student Milestones
  if (persona === "student") {
    // These would typically check against user activity data
    // For now, we'll use savings as a proxy
    milestones[0].achieved = signals.savings.total_savings_balance > 0; // Budget created
    milestones[2].achieved = signals.savings.total_savings_balance >= 100; // Saved $100
    // milestones[1] and [3] would need activity tracking
  }

  // Savings Builder Milestones
  if (persona === "savings_builder") {
    const emergencyMonths = signals.savings.emergency_fund_months;
    milestones[0].achieved = emergencyMonths >= 1; // 1 month
    milestones[1].achieved = emergencyMonths >= 3; // 3 months
    milestones[2].achieved = emergencyMonths >= 6; // 6 months
    milestones[3].achieved = signals.savings.savings_growth_rate_pct > 0; // Automated savings (proxy)
  }

  // Subscription Heavy Milestones
  if (persona === "subscription_heavy") {
    const subCount = signals.subscriptions.recurring_merchant_count;
    milestones[1].achieved = subCount < 10; // Cancelled 1 (proxy)
    milestones[3].achieved = subCount <= 5; // Under 5 subscriptions
    // milestones[0] and [2] would need activity tracking
  }

  // Variable Income Budgeter Milestones
  if (persona === "variable_income_budgeter") {
    const buffer = signals.income.cash_flow_buffer_months;
    milestones[0].achieved = buffer > 0; // Buffer started
    milestones[1].achieved = buffer >= 1; // 1 month buffer
    // milestones[2] and [3] would need activity tracking
  }

  return milestones;
}

/**
 * Calculate points earned from milestones
 */
export function calculateMilestonePoints(milestones: Milestone[]): number {
  return milestones
    .filter((m) => m.achieved)
    .reduce((sum, m) => sum + m.points, 0);
}

/**
 * Get newly achieved milestones since last check
 */
export function getNewlyAchievedMilestones(
  previousMilestones: Milestone[],
  currentMilestones: Milestone[]
): Milestone[] {
  return currentMilestones.filter((current, index) => {
    const previous = previousMilestones[index];
    return current.achieved && (!previous || !previous.achieved);
  });
}

// ============================================================================
// GAMIFICATION DATA BUILDER
// ============================================================================

/**
 * Build complete gamification data for a user
 */
export function buildGamificationData(
  streakData: StreakData,
  pointsTransactions: PointsTransaction[],
  persona: string,
  signals: UserSignals["signals"],
  achievements: GamificationData["achievements"] = [],
  activeChallenge?: GamificationData["activeChallenge"],
  completedChallenges: GamificationData["completedChallenges"] = []
): GamificationData {
  // Calculate total points
  const totalPoints = calculateTotalPoints(pointsTransactions);

  // Calculate level info
  const levelInfo = calculateLevelInfo(totalPoints);

  // Update milestones based on signals
  const milestones = updateMilestoneAchievements(persona, signals);
  const milestonePoints = calculateMilestonePoints(milestones);

  // Add milestone points to total
  const totalPointsWithMilestones = totalPoints + milestonePoints;

  // Recalculate level with milestone points
  const finalLevelInfo = calculateLevelInfo(totalPointsWithMilestones);

  return {
    streak: streakData.streak,
    level: finalLevelInfo.level,
    levelProgress: finalLevelInfo.progress,
    levelMax: finalLevelInfo.xpForNextLevel - finalLevelInfo.xpForCurrentLevel,
    totalPoints: totalPointsWithMilestones,
    achievements,
    activeChallenge,
    completedChallenges,
  };
}

// ============================================================================
// ACHIEVEMENT CHECKING
// ============================================================================

export interface AchievementDefinition {
  id: string;
  title: string;
  icon: string;
  points: number;
  checkCondition: (data: {
    streak: number;
    totalPoints: number;
    level: number;
    completedRecommendations: number;
    completedChallenges: number;
  }) => boolean;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "first_login",
    title: "Welcome Aboard",
    icon: "🎉",
    points: 10,
    checkCondition: () => true, // Always awarded on first login
  },
  {
    id: "3_day_streak",
    title: "3-Day Streak",
    icon: "🔥",
    points: 10,
    checkCondition: (data) => data.streak >= 3,
  },
  {
    id: "7_day_streak",
    title: "7-Day Streak",
    icon: "🔥",
    points: 25,
    checkCondition: (data) => data.streak >= 7,
  },
  {
    id: "14_day_streak",
    title: "14-Day Streak",
    icon: "🔥",
    points: 50,
    checkCondition: (data) => data.streak >= 14,
  },
  {
    id: "30_day_streak",
    title: "30-Day Streak Master",
    icon: "🔥",
    points: 100,
    checkCondition: (data) => data.streak >= 30,
  },
  {
    id: "first_rec_complete",
    title: "First Article Complete",
    icon: "📚",
    points: 10,
    checkCondition: (data) => data.completedRecommendations >= 1,
  },
  {
    id: "calculator_pro",
    title: "Calculator Pro",
    icon: "💰",
    points: 15,
    checkCondition: (data) => data.totalPoints >= 50, // Proxy for calculator use
  },
  {
    id: "level_3",
    title: "Level 3 Achieved",
    icon: "⭐",
    points: 25,
    checkCondition: (data) => data.level >= 3,
  },
  {
    id: "level_5",
    title: "Level 5 Master",
    icon: "⭐⭐",
    points: 50,
    checkCondition: (data) => data.level >= 5,
  },
  {
    id: "challenge_master",
    title: "Challenge Master",
    icon: "🏆",
    points: 75,
    checkCondition: (data) => data.completedChallenges >= 3,
  },
];

/**
 * Check which achievements should be unlocked
 */
export function checkAchievements(
  currentAchievements: GamificationData["achievements"],
  data: {
    streak: number;
    totalPoints: number;
    level: number;
    completedRecommendations: number;
    completedChallenges: number;
  }
): GamificationData["achievements"] {
  const earnedIds = new Set(currentAchievements.map((a) => a.id));
  const newAchievements = [...currentAchievements];

  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    if (!earnedIds.has(definition.id) && definition.checkCondition(data)) {
      newAchievements.push({
        id: definition.id,
        title: definition.title,
        icon: definition.icon,
        points: definition.points,
        earnedAt: new Date().toISOString(),
      });
    }
  }

  return newAchievements;
}
