// Analytics & Event Tracking for Gamification
// Tracks user engagement with gamification features

export interface GamificationEvent {
  eventType:
    | "progress_page_view"
    | "milestone_achieved"
    | "challenge_started"
    | "challenge_completed"
    | "challenge_cancelled"
    | "level_up"
    | "streak_milestone"
    | "achievement_unlocked"
    | "points_earned"
    | "progress_widget_click";
  userId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Track a gamification event
 */
export function trackGamificationEvent(
  eventType: GamificationEvent["eventType"],
  userId: string,
  metadata?: Record<string, any>
): void {
  const event: GamificationEvent = {
    eventType,
    userId,
    timestamp: new Date().toISOString(),
    metadata,
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("📊 Gamification Event:", event);
  }

  // In production, this would send to analytics service (e.g., Google Analytics, Mixpanel)
  // Example: sendToAnalytics(event);

  // Store in localStorage for demo purposes
  try {
    const existingEvents = localStorage.getItem("gamification_events");
    const events = existingEvents ? JSON.parse(existingEvents) : [];
    events.push(event);

    // Keep only last 100 events to avoid storage issues
    if (events.length > 100) {
      events.shift();
    }

    localStorage.setItem("gamification_events", JSON.stringify(events));
  } catch (error) {
    console.error("Failed to store analytics event:", error);
  }
}

// ============================================================================
// SPECIFIC EVENT TRACKERS
// ============================================================================

export function trackProgressPageView(userId: string): void {
  trackGamificationEvent("progress_page_view", userId, {
    page: "/progress",
  });
}

export function trackMilestoneAchieved(
  userId: string,
  milestoneId: string,
  milestoneTitle: string,
  points: number,
  persona: string
): void {
  trackGamificationEvent("milestone_achieved", userId, {
    milestoneId,
    milestoneTitle,
    points,
    persona,
  });
}

export function trackChallengeStarted(
  userId: string,
  challengeId: string,
  challengeTitle: string,
  difficulty: string
): void {
  trackGamificationEvent("challenge_started", userId, {
    challengeId,
    challengeTitle,
    difficulty,
  });
}

export function trackChallengeCompleted(
  userId: string,
  challengeId: string,
  challengeTitle: string,
  durationDays: number,
  potentialSavings: number
): void {
  trackGamificationEvent("challenge_completed", userId, {
    challengeId,
    challengeTitle,
    durationDays,
    potentialSavings,
  });
}

export function trackChallengeCancelled(
  userId: string,
  challengeId: string,
  daysCancelled: number
): void {
  trackGamificationEvent("challenge_cancelled", userId, {
    challengeId,
    daysCancelled,
  });
}

export function trackLevelUp(
  userId: string,
  newLevel: number,
  totalPoints: number
): void {
  trackGamificationEvent("level_up", userId, {
    newLevel,
    totalPoints,
  });
}

export function trackStreakMilestone(
  userId: string,
  streakLength: number,
  milestoneType: string
): void {
  trackGamificationEvent("streak_milestone", userId, {
    streakLength,
    milestoneType,
  });
}

export function trackAchievementUnlocked(
  userId: string,
  achievementId: string,
  achievementTitle: string,
  points: number
): void {
  trackGamificationEvent("achievement_unlocked", userId, {
    achievementId,
    achievementTitle,
    points,
  });
}

export function trackPointsEarned(
  userId: string,
  points: number,
  source: string,
  description: string
): void {
  trackGamificationEvent("points_earned", userId, {
    points,
    source,
    description,
  });
}

export function trackProgressWidgetClick(userId: string): void {
  trackGamificationEvent("progress_widget_click", userId, {
    source: "dashboard",
  });
}

// ============================================================================
// ANALYTICS RETRIEVAL
// ============================================================================

/**
 * Get all stored gamification events
 */
export function getGamificationEvents(): GamificationEvent[] {
  try {
    const stored = localStorage.getItem("gamification_events");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to retrieve analytics events:", error);
    return [];
  }
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary(userId?: string): {
  totalEvents: number;
  eventsByType: Record<string, number>;
  recentEvents: GamificationEvent[];
} {
  const events = getGamificationEvents();
  const filteredEvents = userId
    ? events.filter((e) => e.userId === userId)
    : events;

  const eventsByType: Record<string, number> = {};
  filteredEvents.forEach((event) => {
    eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
  });

  const recentEvents = filteredEvents.slice(-10).reverse();

  return {
    totalEvents: filteredEvents.length,
    eventsByType,
    recentEvents,
  };
}

/**
 * Clear all analytics data
 */
export function clearAnalyticsData(): void {
  try {
    localStorage.removeItem("gamification_events");
  } catch (error) {
    console.error("Failed to clear analytics data:", error);
  }
}

// ============================================================================
// ENGAGEMENT METRICS
// ============================================================================

export interface EngagementMetrics {
  userId: string;
  timeSpentOnProgress: number; // in seconds
  challengesStarted: number;
  challengesCompleted: number;
  challengeCompletionRate: number;
  averageStreakLength: number;
  milestonesAchieved: number;
  achievementsUnlocked: number;
  levelUps: number;
  totalPointsEarned: number;
}

/**
 * Calculate engagement metrics for a user
 */
export function calculateEngagementMetrics(userId: string): EngagementMetrics {
  const events = getGamificationEvents().filter((e) => e.userId === userId);

  const challengesStarted = events.filter(
    (e) => e.eventType === "challenge_started"
  ).length;
  const challengesCompleted = events.filter(
    (e) => e.eventType === "challenge_completed"
  ).length;
  const challengeCompletionRate =
    challengesStarted > 0 ? (challengesCompleted / challengesStarted) * 100 : 0;

  const milestonesAchieved = events.filter(
    (e) => e.eventType === "milestone_achieved"
  ).length;
  const achievementsUnlocked = events.filter(
    (e) => e.eventType === "achievement_unlocked"
  ).length;
  const levelUps = events.filter((e) => e.eventType === "level_up").length;

  const pointsEvents = events.filter((e) => e.eventType === "points_earned");
  const totalPointsEarned = pointsEvents.reduce(
    (sum, e) => sum + (e.metadata?.points || 0),
    0
  );

  const streakEvents = events.filter((e) => e.eventType === "streak_milestone");
  const averageStreakLength =
    streakEvents.length > 0
      ? streakEvents.reduce(
          (sum, e) => sum + (e.metadata?.streakLength || 0),
          0
        ) / streakEvents.length
      : 0;

  return {
    userId,
    timeSpentOnProgress: 0, // Would need session tracking
    challengesStarted,
    challengesCompleted,
    challengeCompletionRate,
    averageStreakLength,
    milestonesAchieved,
    achievementsUnlocked,
    levelUps,
    totalPointsEarned,
  };
}
