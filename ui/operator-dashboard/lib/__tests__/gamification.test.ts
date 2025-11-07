/**
 * Tests for Gamification Logic
 * Tests points, levels, streaks, milestones, and achievements
 */

import {
  updateStreak,
  getStreakBonus,
  awardPoints,
  calculateTotalPoints,
  calculateLevelInfo,
  checkLevelUp,
  updateMilestoneAchievements,
  calculateMilestonePoints,
  checkAchievements,
  type StreakData,
  type PointsTransaction,
} from "../gamification";

describe("Gamification Logic", () => {
  // ============================================================================
  // STREAK TESTS
  // ============================================================================

  describe("updateStreak", () => {
    it("should maintain streak for same day activity", () => {
      const streakData: StreakData = {
        streak: 5,
        lastActivityDate: new Date().toISOString(),
        longestStreak: 5,
      };

      const result = updateStreak(streakData, new Date());
      expect(result.streak).toBe(5);
    });

    it("should increment streak for next day activity", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const streakData: StreakData = {
        streak: 5,
        lastActivityDate: yesterday.toISOString(),
        longestStreak: 5,
      };

      const result = updateStreak(streakData);
      expect(result.streak).toBe(6);
      expect(result.longestStreak).toBe(6);
    });

    it("should reset streak if days were missed", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const streakData: StreakData = {
        streak: 10,
        lastActivityDate: threeDaysAgo.toISOString(),
        longestStreak: 10,
      };

      const result = updateStreak(streakData);
      expect(result.streak).toBe(1);
      expect(result.longestStreak).toBe(10); // Longest should be preserved
    });
  });

  describe("getStreakBonus", () => {
    it("should return 0 for streaks less than 3", () => {
      expect(getStreakBonus(1)).toBe(0);
      expect(getStreakBonus(2)).toBe(0);
    });

    it("should return correct bonus for streak milestones", () => {
      expect(getStreakBonus(3)).toBe(5);
      expect(getStreakBonus(7)).toBe(10);
      expect(getStreakBonus(14)).toBe(25);
      expect(getStreakBonus(30)).toBe(50);
    });
  });

  // ============================================================================
  // POINTS TESTS
  // ============================================================================

  describe("awardPoints", () => {
    it("should award correct points for recommendation completion", () => {
      const transaction = awardPoints("recommendation_complete");
      expect(transaction.points).toBe(10);
      expect(transaction.type).toBe("recommendation_complete");
      expect(transaction.description).toContain("recommendation");
    });

    it("should award custom points when provided", () => {
      const transaction = awardPoints("challenge_complete", 75);
      expect(transaction.points).toBe(75);
    });

    it("should include timestamp in transaction", () => {
      const transaction = awardPoints("calculator_use");
      expect(transaction.timestamp).toBeDefined();
      expect(new Date(transaction.timestamp).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });
  });

  describe("calculateTotalPoints", () => {
    it("should sum all points from transactions", () => {
      const transactions: PointsTransaction[] = [
        {
          type: "recommendation_complete",
          points: 10,
          timestamp: new Date().toISOString(),
          description: "Test",
        },
        {
          type: "calculator_use",
          points: 5,
          timestamp: new Date().toISOString(),
          description: "Test",
        },
        {
          type: "challenge_complete",
          points: 50,
          timestamp: new Date().toISOString(),
          description: "Test",
        },
      ];

      const total = calculateTotalPoints(transactions);
      expect(total).toBe(65);
    });

    it("should return 0 for empty transactions array", () => {
      expect(calculateTotalPoints([])).toBe(0);
    });
  });

  // ============================================================================
  // LEVEL TESTS
  // ============================================================================

  describe("calculateLevelInfo", () => {
    it("should calculate level 1 for low XP", () => {
      const info = calculateLevelInfo(50);
      expect(info.level).toBe(1);
      expect(info.currentXP).toBe(50);
      expect(info.xpForCurrentLevel).toBe(0);
      expect(info.xpForNextLevel).toBe(100);
    });

    it("should calculate level 2 correctly", () => {
      const info = calculateLevelInfo(150);
      expect(info.level).toBe(2);
      expect(info.xpForCurrentLevel).toBe(100);
      expect(info.xpForNextLevel).toBe(250);
      expect(info.progress).toBe(50); // 150 - 100
    });

    it("should calculate progress percentage correctly", () => {
      const info = calculateLevelInfo(150); // Level 2
      // Progress: 150 - 100 = 50
      // Max: 250 - 100 = 150
      // Percentage: (50 / 150) * 100 = 33.33...
      expect(info.progressPercentage).toBeCloseTo(33.33, 1);
    });
  });

  describe("checkLevelUp", () => {
    it("should detect level up", () => {
      expect(checkLevelUp(90, 110)).toBe(true); // L1 to L2
      expect(checkLevelUp(240, 260)).toBe(true); // L2 to L3
    });

    it("should return false for same level", () => {
      expect(checkLevelUp(50, 70)).toBe(false);
      expect(checkLevelUp(150, 200)).toBe(false);
    });
  });

  // ============================================================================
  // MILESTONE TESTS
  // ============================================================================

  describe("updateMilestoneAchievements", () => {
    it("should update high_utilization milestones based on credit signals", () => {
      const signals: any = {
        credit: {
          aggregate_utilization_pct: 45,
          any_interest_charges: false,
        },
        subscriptions: {},
        savings: {},
        income: {},
      };

      const milestones = updateMilestoneAchievements(
        "high_utilization",
        signals
      );

      // Should have 4 milestones
      expect(milestones).toHaveLength(4);

      // Check which are achieved
      expect(milestones[0].achieved).toBe(true); // Below 80%
      expect(milestones[1].achieved).toBe(true); // Below 50%
      expect(milestones[2].achieved).toBe(false); // Below 30% - not achieved
      expect(milestones[3].achieved).toBe(true); // No interest
    });

    it("should update savings_builder milestones based on savings signals", () => {
      const signals: any = {
        credit: {},
        subscriptions: {},
        savings: {
          emergency_fund_months: 4.5,
          savings_growth_rate_pct: 2.5,
        },
        income: {},
      };

      const milestones = updateMilestoneAchievements(
        "savings_builder",
        signals
      );

      expect(milestones).toHaveLength(4);
      expect(milestones[0].achieved).toBe(true); // 1 month
      expect(milestones[1].achieved).toBe(true); // 3 months
      expect(milestones[2].achieved).toBe(false); // 6 months - not achieved
      expect(milestones[3].achieved).toBe(true); // Automated savings
    });
  });

  describe("calculateMilestonePoints", () => {
    it("should sum points from achieved milestones only", () => {
      const milestones = [
        { id: "1", title: "M1", achieved: true, points: 10, description: "" },
        { id: "2", title: "M2", achieved: false, points: 25, description: "" },
        { id: "3", title: "M3", achieved: true, points: 50, description: "" },
      ];

      const points = calculateMilestonePoints(milestones);
      expect(points).toBe(60); // 10 + 50
    });
  });

  // ============================================================================
  // ACHIEVEMENT TESTS
  // ============================================================================

  describe("checkAchievements", () => {
    it("should unlock achievement when condition is met", () => {
      const currentAchievements: any[] = [];
      const data = {
        streak: 7,
        totalPoints: 100,
        level: 2,
        completedRecommendations: 5,
        completedChallenges: 0,
      };

      const updated = checkAchievements(currentAchievements, data);

      // Should unlock streak achievements
      const streakAchievements = updated.filter((a) =>
        a.title.includes("Streak")
      );
      expect(streakAchievements.length).toBeGreaterThan(0);
    });

    it("should not duplicate already earned achievements", () => {
      const currentAchievements: any[] = [
        {
          id: "first_login",
          title: "Welcome Aboard",
          icon: "🎉",
          points: 10,
          earnedAt: new Date().toISOString(),
        },
      ];
      const data = {
        streak: 1,
        totalPoints: 10,
        level: 1,
        completedRecommendations: 0,
        completedChallenges: 0,
      };

      const updated = checkAchievements(currentAchievements, data);

      // Should still have only one first_login achievement
      const firstLoginCount = updated.filter(
        (a) => a.id === "first_login"
      ).length;
      expect(firstLoginCount).toBe(1);
    });
  });
});
