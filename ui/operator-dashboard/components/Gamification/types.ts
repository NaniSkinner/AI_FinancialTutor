// Type Definitions for Gamification System
// All interfaces for progress tracking, challenges, and achievements

import type { UserSignals } from "@/lib/types";

// ============================================================================
// PROGRESS TRACKING TYPES
// ============================================================================

export interface ProgressData {
  streak: number;
  level: number;
  levelProgress: number;
  levelMax: number;
  totalPoints: number;
  completedRecommendations: number;
  totalRecommendations: number;
  achievements?: Achievement[];
  activeChallenges?: ActiveChallenge[];
  completedChallenges?: CompletedChallenge[];
}

export interface Achievement {
  id: string;
  title: string;
  earnedAt: Date;
  icon?: string;
  points?: number;
}

// ============================================================================
// MILESTONE TYPES
// ============================================================================

export interface Milestone {
  id: string;
  title: string;
  achieved: boolean;
  points: number;
  description?: string;
}

export type PersonaMilestones = {
  [key: string]: Milestone[];
};

// ============================================================================
// CHALLENGE TYPES
// ============================================================================

export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  potentialSavings: number;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

export interface ActiveChallenge extends Challenge {
  startedAt: Date;
  progressDays: number;
}

export interface CompletedChallenge {
  id: string;
  completedAt: Date;
  savings: number;
  title?: string;
}

// ============================================================================
// PERSONA TRANSITION TYPES
// ============================================================================

export interface PersonaTransition {
  fromPersona: string;
  toPersona: string;
  transitionDate: Date;
  achievement?: string;
}

export interface Celebration {
  title: string;
  message: string;
  achievement: string;
  color: string;
}

// ============================================================================
// PROPS INTERFACES
// ============================================================================

export interface ProgressTrackerProps {
  userId: string;
  persona: string;
  signals?: UserSignals["signals"];
}

export interface SavingsChallengeProps {
  userId: string;
}

export interface TransitionCelebrationProps {
  transition: PersonaTransition;
  onClose?: () => void;
}

export interface AchievementCardProps {
  icon: string;
  title: string;
  earnedAt: Date;
  locked?: boolean;
}
