// Gamification Components
export { ProgressTracker } from "./ProgressTracker";
export { SavingsChallenge } from "./SavingsChallenge";
export { TransitionCelebration } from "./TransitionCelebration";
export { AchievementCard } from "./AchievementCard";

// Types
export type {
  ProgressData,
  Milestone,
  Challenge,
  ActiveChallenge,
  CompletedChallenge,
  PersonaTransition,
  Achievement,
  ProgressTrackerProps,
  SavingsChallengeProps,
  TransitionCelebrationProps,
  AchievementCardProps,
} from "./types";

// Constants
export {
  PERSONA_MILESTONES,
  SAVINGS_CHALLENGES,
  CELEBRATIONS,
} from "./constants";

// Utilities
export * from "./utils";
