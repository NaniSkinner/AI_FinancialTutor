"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";
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

  const filteredRecs =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.priority === filter);

  const filters = [
    { value: "all" as const, label: "All" },
    { value: "high" as const, label: "High" },
    { value: "medium" as const, label: "Medium" },
    { value: "low" as const, label: "Low" },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Learning Recommendations
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {progress.completedCount}
              </span>{" "}
              of {progress.totalCount} completed
            </p>
            {progress.streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                <span>🔥</span>
                <span>{progress.streak} day streak!</span>
              </div>
            )}
          </div>
        </div>

        {/* Segmented Control Filter */}
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shadow-inner">
          {filters.map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                filter === filterOption.value
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecs.map((rec, idx) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <RecommendationCard
              recommendation={rec}
              userId={userId}
            />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center"
        >
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <TrendingUp className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-2">
            No {filter !== "all" ? `${filter} priority ` : ""}recommendations yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Check back later for personalized learning content.
          </p>
        </motion.div>
      )}
    </div>
  );
}
