// Utility Functions for Gamification System
// Helper functions for calculations and transformations

import { LEVEL_THRESHOLDS, PERSONA_MILESTONES } from "./constants";
import type { Milestone, ProgressData } from "./types";

// ============================================================================
// LEVEL CALCULATIONS
// ============================================================================

/**
 * Calculate user level from total XP
 */
export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i].minXP) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

/**
 * Calculate progress within current level
 */
export function calculateLevelProgress(totalXP: number): {
  level: number;
  progress: number;
  max: number;
  remaining: number;
} {
  const level = calculateLevel(totalXP);
  const threshold = LEVEL_THRESHOLDS.find((t) => t.level === level);

  if (!threshold) {
    return { level: 1, progress: 0, max: 100, remaining: 100 };
  }

  const progress = totalXP - threshold.minXP;
  const max = threshold.maxXP - threshold.minXP;
  const remaining = max - progress;

  return { level, progress, max, remaining };
}

/**
 * Calculate XP needed for next level
 */
export function calculateXPToNextLevel(totalXP: number): number {
  const { remaining } = calculateLevelProgress(totalXP);
  return remaining;
}

// ============================================================================
// MILESTONE HELPERS
// ============================================================================

/**
 * Get milestones for a specific persona
 */
export function getPersonaMilestones(persona: string): Milestone[] {
  return (
    PERSONA_MILESTONES[persona] || PERSONA_MILESTONES.savings_builder || []
  );
}

/**
 * Calculate total points from achieved milestones
 */
export function calculateMilestonePoints(milestones: Milestone[]): number {
  return milestones
    .filter((m) => m.achieved)
    .reduce((sum, m) => sum + m.points, 0);
}

/**
 * Calculate milestone completion percentage
 */
export function calculateMilestoneProgress(milestones: Milestone[]): {
  achieved: number;
  total: number;
  percentage: number;
} {
  const achieved = milestones.filter((m) => m.achieved).length;
  const total = milestones.length;
  const percentage = total > 0 ? (achieved / total) * 100 : 0;

  return { achieved, total, percentage };
}

/**
 * Update milestone achieved status based on user signals
 * This is a placeholder - implement actual logic based on signals
 */
export function updateMilestoneAchievements(
  milestones: Milestone[],
  _userSignals: any
): Milestone[] {
  // TODO: Implement actual milestone checking logic
  // For now, return milestones as-is
  return milestones;
}

// ============================================================================
// STREAK CALCULATIONS
// ============================================================================

/**
 * Calculate if streak should continue based on last activity
 */
export function shouldMaintainStreak(lastActivityDate: Date): boolean {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastActivity = new Date(lastActivityDate);

  // Reset to start of day for comparison
  now.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  lastActivity.setHours(0, 0, 0, 0);

  return (
    lastActivity.getTime() === now.getTime() ||
    lastActivity.getTime() === yesterday.getTime()
  );
}

/**
 * Increment streak or reset based on activity
 */
export function updateStreak(
  currentStreak: number,
  lastActivityDate: Date
): number {
  if (shouldMaintainStreak(lastActivityDate)) {
    return currentStreak + 1;
  }
  return 1; // Reset to 1 (today)
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format persona name for display
 */
export function formatPersonaName(persona: string): string {
  return persona
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format date relative to now (e.g., "3 days ago")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

/**
 * Get difficulty badge color
 */
export function getDifficultyColor(
  difficulty: "easy" | "medium" | "hard"
): string {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-800 border-green-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "hard":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

/**
 * Get badge variant for difficulty
 */
export function getDifficultyVariant(
  difficulty: "easy" | "medium" | "hard"
): "secondary" | "default" | "destructive" {
  switch (difficulty) {
    case "easy":
      return "secondary";
    case "medium":
      return "default";
    case "hard":
      return "destructive";
    default:
      return "default";
  }
}

// ============================================================================
// CHALLENGE PROGRESS
// ============================================================================

/**
 * Calculate challenge progress percentage
 */
export function calculateChallengeProgress(
  progressDays: number,
  totalDays: number
): number {
  return Math.min(100, (progressDays / totalDays) * 100);
}

/**
 * Calculate days remaining in challenge
 */
export function calculateDaysRemaining(
  progressDays: number,
  totalDays: number
): number {
  return Math.max(0, totalDays - progressDays);
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate progress data structure
 */
export function validateProgressData(data: any): data is ProgressData {
  return (
    data &&
    typeof data.streak === "number" &&
    typeof data.level === "number" &&
    typeof data.levelProgress === "number" &&
    typeof data.levelMax === "number" &&
    typeof data.totalPoints === "number"
  );
}
