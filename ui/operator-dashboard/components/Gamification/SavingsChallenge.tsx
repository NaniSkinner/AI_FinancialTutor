"use client";

import { useState } from "react";
import { Trophy, Calendar, DollarSign, Tag } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Progress,
  Alert,
  AlertDescription,
} from "@/components/Common";
import { useToast } from "@/components/Common/Toast";
import { SAVINGS_CHALLENGES } from "./constants";
import {
  getDifficultyVariant,
  calculateChallengeProgress,
  calculateDaysRemaining,
} from "./utils";
import type {
  SavingsChallengeProps,
  Challenge,
  ActiveChallenge,
} from "./types";

export function SavingsChallenge({ userId }: SavingsChallengeProps) {
  const [activeChallenge, setActiveChallenge] =
    useState<ActiveChallenge | null>(null);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const { showToast } = useToast();

  const challenges: Challenge[] = SAVINGS_CHALLENGES;

  const startChallenge = async (challenge: Challenge) => {
    try {
      // TODO: Replace with actual API call in Phase 6
      // await saveChallengeStart(userId, challenge.id);

      const newActiveChallenge: ActiveChallenge = {
        ...challenge,
        startedAt: new Date(),
        progressDays: 0,
      };

      setActiveChallenge(newActiveChallenge);
      setChallengeProgress(0);

      showToast(
        `Challenge Started! You've started the ${challenge.title}. Good luck!`,
        "success"
      );
    } catch (error) {
      showToast("Failed to start challenge. Please try again.", "error");
    }
  };

  const completeChallenge = async () => {
    if (!activeChallenge) return;

    try {
      // TODO: Replace with actual API call in Phase 6
      // await saveChallengeCompletion(userId, activeChallenge.id);

      showToast(
        `🎉 Challenge Complete! You saved ~$${activeChallenge.potentialSavings}!`,
        "success"
      );

      setActiveChallenge(null);
      setChallengeProgress(0);
    } catch (error) {
      showToast("Failed to complete challenge. Please try again.", "error");
    }
  };

  const cancelChallenge = () => {
    setActiveChallenge(null);
    setChallengeProgress(0);

    showToast(
      "Challenge Cancelled. You can start a new challenge anytime.",
      "info"
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Challenges</CardTitle>
        <CardDescription>
          Try these challenges to build better money habits
        </CardDescription>
      </CardHeader>

      <CardContent>
        {activeChallenge ? (
          /* Active Challenge View */
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Trophy className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <div className="font-semibold text-blue-900">
                  Active Challenge
                </div>
                <AlertDescription className="text-blue-800">
                  {activeChallenge.title} - Day {challengeProgress} of{" "}
                  {activeChallenge.durationDays}
                </AlertDescription>
              </div>
            </Alert>

            <div className="space-y-2">
              <Progress
                value={calculateChallengeProgress(
                  challengeProgress,
                  activeChallenge.durationDays
                )}
                className="h-3"
              />
              <p className="text-sm text-muted-foreground text-center">
                {calculateDaysRemaining(
                  challengeProgress,
                  activeChallenge.durationDays
                )}{" "}
                days remaining
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                {activeChallenge.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Save ~${activeChallenge.potentialSavings}
                </span>
                <Badge
                  variant={getDifficultyVariant(activeChallenge.difficulty)}
                >
                  {activeChallenge.difficulty}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={completeChallenge}
                className="flex-1"
                variant="default"
              >
                Complete Challenge
              </Button>
              <Button variant="outline" onClick={cancelChallenge}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* Challenge List View */
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer border"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-semibold text-sm">
                        {challenge.title}
                      </h4>
                      <Badge
                        variant={getDifficultyVariant(challenge.difficulty)}
                      >
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {challenge.durationDays}{" "}
                        {challenge.durationDays === 1 ? "day" : "days"}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Save ~${challenge.potentialSavings}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {challenge.category}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => startChallenge(challenge)}
                    size="sm"
                    className="shrink-0"
                  >
                    Start
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
