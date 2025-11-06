// Custom hook for managing gamification state and logic
// Provides easy access to points, levels, streaks, achievements, and challenges

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Common/Toast";
import {
  updateStreak,
  awardPoints,
  calculateLevelInfo,
  checkLevelUp,
  buildGamificationData,
  checkAchievements,
  type StreakData,
  type PointsTransaction,
} from "@/lib/gamification";
import {
  trackPointsEarned,
  trackLevelUp,
  trackAchievementUnlocked,
  trackChallengeStarted,
  trackChallengeCompleted,
  trackStreakMilestone,
} from "@/lib/analytics";
import type { GamificationData, UserSignals } from "@/lib/types";

interface UseGamificationProps {
  userId: string;
  persona: string;
  signals: UserSignals["signals"];
  initialData?: GamificationData;
}

interface UseGamificationReturn {
  gamificationData: GamificationData;
  loading: boolean;
  // Actions
  recordActivity: (
    type: PointsTransaction["type"],
    customPoints?: number
  ) => void;
  startChallenge: (challengeId: string) => void;
  completeChallenge: (challengeId: string) => void;
  updateDailyStreak: () => void;
  // Helper values
  pointsToNextLevel: number;
  levelInfo: ReturnType<typeof calculateLevelInfo>;
}

/**
 * Hook to manage gamification state and logic
 */
export function useGamification({
  userId,
  persona,
  signals,
  initialData,
}: UseGamificationProps): UseGamificationReturn {
  const { showToast } = useToast();

  // State
  const [streakData, setStreakData] = useState<StreakData>({
    streak: initialData?.streak || 0,
    lastActivityDate: new Date().toISOString(),
    longestStreak: initialData?.streak || 0,
  });

  const [pointsTransactions, setPointsTransactions] = useState<
    PointsTransaction[]
  >([]);
  const [gamificationData, setGamificationData] = useState<GamificationData>(
    initialData || {
      streak: 0,
      level: 1,
      levelProgress: 0,
      levelMax: 100,
      totalPoints: 0,
      achievements: [],
      completedChallenges: [],
    }
  );
  const [loading, setLoading] = useState(false);

  // Calculate level info
  const levelInfo = calculateLevelInfo(gamificationData.totalPoints);
  const pointsToNextLevel = levelInfo.xpForNextLevel - levelInfo.currentXP;

  /**
   * Load gamification data from storage or API
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Try to load from localStorage
        const stored = localStorage.getItem(`gamification_${userId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setStreakData(parsed.streakData);
          setPointsTransactions(parsed.pointsTransactions);
          setGamificationData(parsed.gamificationData);
        } else if (initialData) {
          setGamificationData(initialData);
        }
      } catch (error) {
        console.error("Failed to load gamification data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, initialData]);

  /**
   * Save gamification data to storage
   */
  const saveData = useCallback(
    (data: {
      streakData: StreakData;
      pointsTransactions: PointsTransaction[];
      gamificationData: GamificationData;
    }) => {
      try {
        localStorage.setItem(`gamification_${userId}`, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save gamification data:", error);
      }
    },
    [userId]
  );

  /**
   * Rebuild gamification data from current state
   */
  const rebuildGamificationData = useCallback(() => {
    const newData = buildGamificationData(
      streakData,
      pointsTransactions,
      persona,
      signals,
      gamificationData.achievements,
      gamificationData.activeChallenge,
      gamificationData.completedChallenges
    );

    // Check for new achievements
    const updatedAchievements = checkAchievements(newData.achievements, {
      streak: newData.streak,
      totalPoints: newData.totalPoints,
      level: newData.level,
      completedRecommendations: 0, // Would come from user data
      completedChallenges: newData.completedChallenges.length,
    });

    newData.achievements = updatedAchievements;

    setGamificationData(newData);
    saveData({ streakData, pointsTransactions, gamificationData: newData });

    return newData;
  }, [
    streakData,
    pointsTransactions,
    persona,
    signals,
    gamificationData,
    saveData,
  ]);

  /**
   * Record user activity and award points
   */
  const recordActivity = useCallback(
    (type: PointsTransaction["type"], customPoints?: number) => {
      const previousPoints = gamificationData.totalPoints;

      // Award points
      const transaction = awardPoints(type, customPoints);
      const newTransactions = [...pointsTransactions, transaction];
      setPointsTransactions(newTransactions);

      // Update streak
      const newStreakData = updateStreak(streakData);
      setStreakData(newStreakData);

      // Rebuild data
      setTimeout(() => {
        const newData = rebuildGamificationData();

        // Check for level up
        if (checkLevelUp(previousPoints, newData.totalPoints)) {
          trackLevelUp(userId, newData.level, newData.totalPoints);
          showToast(
            `🎉 Level Up! You've reached Level ${newData.level}!`,
            "success"
          );
        }

        // Check for new achievements
        const newAchievements = newData.achievements.filter(
          (a) => !gamificationData.achievements.find((old) => old.id === a.id)
        );

        if (newAchievements.length > 0) {
          newAchievements.forEach((achievement) => {
            trackAchievementUnlocked(
              userId,
              achievement.id,
              achievement.title,
              achievement.points || 0
            );
            showToast(
              `✨ Achievement Unlocked: ${achievement.title}`,
              "success"
            );
          });
        }

        // Track points earned
        trackPointsEarned(
          userId,
          transaction.points,
          transaction.type,
          transaction.description
        );

        showToast(
          `+${transaction.points} points! ${transaction.description}`,
          "success"
        );
      }, 100);
    },
    [
      gamificationData,
      pointsTransactions,
      streakData,
      rebuildGamificationData,
      showToast,
    ]
  );

  /**
   * Update daily streak
   */
  const updateDailyStreak = useCallback(() => {
    const newStreakData = updateStreak(streakData);
    setStreakData(newStreakData);

    // Award streak bonus if applicable
    if (newStreakData.streak > streakData.streak) {
      // Track streak milestones
      if ([3, 7, 14, 30, 100].includes(newStreakData.streak)) {
        trackStreakMilestone(
          userId,
          newStreakData.streak,
          `${newStreakData.streak}-day-streak`
        );
      }

      const bonusPoints = newStreakData.streak >= 7 ? 10 : 5;
      recordActivity("streak_bonus", bonusPoints);
    }

    rebuildGamificationData();
  }, [userId, streakData, rebuildGamificationData, recordActivity]);

  /**
   * Start a challenge
   */
  const startChallenge = useCallback(
    (challengeId: string, challengeTitle?: string, difficulty?: string) => {
      // This would typically make an API call
      // For now, update local state
      const updatedData = {
        ...gamificationData,
        activeChallenge: {
          id: challengeId,
          title: challengeTitle || "Challenge",
          description: "",
          durationDays: 7,
          progressDays: 0,
          potentialSavings: 0,
          startedAt: new Date().toISOString(),
        },
      };

      // Track challenge start
      trackChallengeStarted(
        userId,
        challengeId,
        challengeTitle || "Challenge",
        difficulty || "medium"
      );

      setGamificationData(updatedData);
      saveData({
        streakData,
        pointsTransactions,
        gamificationData: updatedData,
      });
    },
    [userId, gamificationData, streakData, pointsTransactions, saveData]
  );

  /**
   * Complete a challenge
   */
  const completeChallenge = useCallback(
    (challengeId: string) => {
      if (!gamificationData.activeChallenge) return;

      // Track challenge completion
      trackChallengeCompleted(
        userId,
        challengeId,
        gamificationData.activeChallenge.title,
        gamificationData.activeChallenge.durationDays,
        gamificationData.activeChallenge.potentialSavings
      );

      // Award challenge points
      recordActivity("challenge_complete", 50);

      // Move to completed challenges
      const completedChallenge = {
        id: challengeId,
        title: gamificationData.activeChallenge.title,
        completedAt: new Date().toISOString(),
        savings: gamificationData.activeChallenge.potentialSavings,
      };

      const updatedData = {
        ...gamificationData,
        activeChallenge: undefined,
        completedChallenges: [
          ...gamificationData.completedChallenges,
          completedChallenge,
        ],
      };

      setGamificationData(updatedData);
      saveData({
        streakData,
        pointsTransactions,
        gamificationData: updatedData,
      });
    },
    [
      userId,
      gamificationData,
      streakData,
      pointsTransactions,
      recordActivity,
      saveData,
    ]
  );

  return {
    gamificationData,
    loading,
    recordActivity,
    startChallenge,
    completeChallenge,
    updateDailyStreak,
    pointsToNextLevel,
    levelInfo,
  };
}
