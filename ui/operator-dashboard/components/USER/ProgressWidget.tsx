"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Flame, TrendingUp, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/Common";
import { trackProgressWidgetClick } from "@/lib/analytics";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { GamificationData } from "@/lib/types";

interface ProgressWidgetProps {
  gamification?: GamificationData;
}

export function ProgressWidget({ gamification }: ProgressWidgetProps) {
  const router = useRouter();
  const { userId } = useCurrentUser();

  if (!gamification) {
    return null;
  }

  const { streak, level, totalPoints, levelProgress, levelMax } = gamification;
  const progressPercentage = (levelProgress / levelMax) * 100;

  const handleClick = () => {
    trackProgressWidgetClick(userId);
    router.push("/progress");
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-900 dark:text-gray-100">
              Your Progress
            </span>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Circular Progress Indicators */}
        <div className="grid grid-cols-2 gap-6">
          {/* Streak */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="relative text-center"
          >
            {/* Circular Progress Background */}
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradientStreak)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${(streak / 30) * 251.2} 251.2`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient
                    id="gradientStreak"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="rgb(251, 146, 60)" />
                    <stop offset="100%" stopColor="rgb(239, 68, 68)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flame className="h-6 w-6 text-orange-500" />
                </motion.div>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {streak}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Day Streak
            </p>
          </motion.div>

          {/* Level */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.03 }}
            className="relative text-center"
          >
            {/* Circular Progress Background */}
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradientLevel)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${progressPercentage * 2.512} 251.2`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient
                    id="gradientLevel"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="rgb(99, 102, 241)" />
                    <stop offset="100%" stopColor="rgb(59, 130, 246)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <TrendingUp className="h-6 w-6 text-indigo-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {level}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Level
            </p>
          </motion.div>
        </div>

        {/* Points Badge with Gradient */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Points
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 animate-pulse" />
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
              {totalPoints}
            </span>
          </div>
        </div>

        {/* Gradient Level Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
            <span className="font-medium">Level {level} Progress</span>
            <span className="font-semibold">
              {levelMax - levelProgress} XP left
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 dark:from-indigo-400 dark:via-blue-400 dark:to-indigo-500 shadow-lg relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Call to Action */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
          Click to see milestones and challenges →
        </p>
      </CardContent>
    </Card>
  );
}
