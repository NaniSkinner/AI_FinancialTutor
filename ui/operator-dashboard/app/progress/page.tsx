"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button, Card } from "@/components/Common";
import { ProgressTracker } from "@/components/Gamification/ProgressTracker";
import { SavingsChallenge } from "@/components/Gamification/SavingsChallenge";
import { AchievementCard } from "@/components/Gamification/AchievementCard";
import { getUserDashboard } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { trackProgressPageView } from "@/lib/analytics";
import type { DashboardResponse } from "@/lib/types";

export default function ProgressPage() {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getUserDashboard(userId);
        setDashboardData(data);
        // Track page view
        trackProgressPageView(userId);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-muted-foreground dark:text-gray-400">
            Loading your progress...
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground dark:text-gray-400 mb-4">
            Unable to load progress data
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const persona = dashboardData.persona.primary;
  const gamification = dashboardData.gamification;
  const recentAchievements = gamification?.achievements || [
    {
      id: "first_login",
      title: "Welcome Aboard",
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      icon: "trophy",
    },
    {
      id: "first_rec_complete",
      title: "First Article Complete",
      earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      icon: "book",
    },
    {
      id: "calculator_pro",
      title: "Calculator Pro",
      earnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      icon: "calculator",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-card border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Your Progress
            </h1>
            <p className="text-muted-foreground dark:text-gray-400">
              Track your learning journey and achievements
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <motion.div
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
          >
            <ProgressTracker
              userId={userId}
              persona={persona}
              signals={dashboardData.signals.signals}
              gamification={gamification}
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
          >
            <SavingsChallenge userId={userId} />
          </motion.div>
        </motion.div>

        {/* Recent Achievements Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Recent Achievements
          </h2>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.5,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {recentAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                variants={{
                  hidden: { scale: 0.8, opacity: 0 },
                  visible: { scale: 1, opacity: 1 },
                }}
              >
                <AchievementCard
                  icon={achievement.icon || "trophy"}
                  title={achievement.title}
                  earnedAt={new Date(achievement.earnedAt)}
                  locked={false}
                />
              </motion.div>
            ))}
            {/* Example locked achievement */}
            <motion.div
              variants={{
                hidden: { scale: 0.8, opacity: 0 },
                visible: { scale: 1, opacity: 1 },
              }}
            >
              <AchievementCard
                icon="🔒"
                title="30-Day Streak Master"
                earnedAt={new Date()}
                locked={true}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Optional: Future Sections */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
          <p className="text-blue-900 dark:text-blue-300 font-medium">
            Keep learning to unlock more achievements!
          </p>
          <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
            Complete recommendations and challenges to earn points and level up.
          </p>
        </div>
      </main>
    </div>
  );
}
