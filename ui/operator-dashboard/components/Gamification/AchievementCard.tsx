"use client";

import { Card } from "@/components/Common";
import { Lock } from "lucide-react";
import { formatRelativeDate } from "./utils";
import type { AchievementCardProps } from "./types";

export function AchievementCard({
  icon,
  title,
  earnedAt,
  locked = false,
}: AchievementCardProps) {
  return (
    <Card
      className={`p-4 text-center transition-all ${
        locked ? "bg-gray-50 opacity-60 grayscale" : "bg-white hover:shadow-md"
      }`}
    >
      <div className="relative">
        {/* Icon/Emoji */}
        <div className="text-4xl mb-2">
          {locked ? <Lock className="h-10 w-10 mx-auto text-gray-400" /> : icon}
        </div>

        {/* Title */}
        <p
          className={`font-semibold text-sm ${locked ? "text-gray-500" : "text-gray-900"}`}
        >
          {title}
        </p>

        {/* Earned Date */}
        {!locked && (
          <p className="text-xs text-muted-foreground mt-1">
            Earned {formatRelativeDate(earnedAt)}
          </p>
        )}

        {/* Locked State */}
        {locked && (
          <p className="text-xs text-muted-foreground mt-1">Not yet unlocked</p>
        )}
      </div>
    </Card>
  );
}
