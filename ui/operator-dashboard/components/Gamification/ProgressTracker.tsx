"use client";

import { useEffect, useState } from "react";
import { Flame, CheckCircle2, Circle, TrendingUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Progress,
  Skeleton,
} from "@/components/Common";
import { PERSONA_MILESTONES } from "./constants";
import {
  getPersonaMilestones,
  calculateMilestonePoints,
  calculateMilestoneProgress,
} from "./utils";
import { updateMilestoneAchievements } from "@/lib/gamification";
import type { ProgressTrackerProps } from "./types";
import type { GamificationData, UserSignals } from "@/lib/types";

export function ProgressTracker({
  userId,
  persona,
  signals,
}: ProgressTrackerProps) {
  const [progress, setProgress] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user progress data
    const fetchProgress = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const data = await fetchUserProgress(userId);

        // Mock data for now - will be replaced with real API
        await new Promise((resolve) => setTimeout(resolve, 500));

        // This will come from the API in Phase 6
        setProgress(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load progress"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default values if no progress data
  const streak = progress?.streak || 0;
  const level = progress?.level || 1;
  const levelProgress = progress?.levelProgress || 0;
  const levelMax = progress?.levelMax || 100;
  const totalPoints = progress?.totalPoints || 0;

  // Get persona-specific milestones and update based on signals if available
  let milestones = getPersonaMilestones(persona);

  // Update milestone achievements based on user signals if provided
  if (signals) {
    milestones = updateMilestoneAchievements(persona, signals);
  }

  const { achieved: achievedCount, total: totalMilestones } =
    calculateMilestoneProgress(milestones);
  const milestonePoints = calculateMilestonePoints(milestones);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Progress</span>
          <Badge variant="secondary" className="text-base px-3 py-1">
            {totalPoints} points
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Streak Counter */}
        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
          <div className="text-6xl font-bold mb-2 text-orange-600">
            {streak}
          </div>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" />
            day streak
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Keep learning to maintain your streak!
          </p>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-base">Milestones</h4>
            <span className="text-sm text-muted-foreground">
              {achievedCount} of {totalMilestones}
            </span>
          </div>

          {milestones.length > 0 ? (
            <div className="space-y-2">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    milestone.achieved
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 ${
                      milestone.achieved ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {milestone.achieved ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        milestone.achieved ? "" : "text-muted-foreground"
                      }`}
                    >
                      {milestone.title}
                    </p>
                    {milestone.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={milestone.achieved ? "default" : "outline"}
                    className="flex-shrink-0"
                  >
                    {milestone.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No milestones available for this persona yet.</p>
            </div>
          )}
        </div>

        {/* Level Progress */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Level {level}</span>
            </div>
            <span className="text-muted-foreground">
              {levelProgress}/{levelMax} XP
            </span>
          </div>
          <Progress value={(levelProgress / levelMax) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {levelMax - levelProgress} XP to Level {level + 1}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
