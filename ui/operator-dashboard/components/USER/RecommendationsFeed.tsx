"use client";

import { useState } from "react";
import { Filter, TrendingUp } from "lucide-react";
import { RecommendationCard } from "./RecommendationCard";
import type { Recommendation, ProgressStats } from "@/lib/types";

interface RecommendationsFeedProps {
  userId: string;
  recommendations: Recommendation[];
  progress: ProgressStats;
}

export function RecommendationsFeed({
  userId,
  recommendations,
  progress,
}: RecommendationsFeedProps) {
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">(
    "all"
  );
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredRecs =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.priority === filter);

  return (
    <div className="space-y-4">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Learning Recommendations
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {progress.completedCount} of {progress.totalCount} completed
            {progress.streak > 0 && ` • ${progress.streak} day streak! 🔥`}
          </p>
        </div>

        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">
              {filter === "all"
                ? "All"
                : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Priority`}
            </span>
          </button>

          {showFilterMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilterMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    setFilter("all");
                    setShowFilterMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  All Recommendations
                </button>
                <button
                  onClick={() => {
                    setFilter("high");
                    setShowFilterMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  High Priority
                </button>
                <button
                  onClick={() => {
                    setFilter("medium");
                    setShowFilterMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Medium Priority
                </button>
                <button
                  onClick={() => {
                    setFilter("low");
                    setShowFilterMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Low Priority
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {filteredRecs.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            userId={userId}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredRecs.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-2">
            <TrendingUp className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">
            No recommendations available yet
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Check back later for personalized learning content.
          </p>
        </div>
      )}
    </div>
  );
}
