"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/USER/DashboardHeader";
import { HeroInsight } from "@/components/USER/HeroInsight";
import { FinancialSnapshot } from "@/components/USER/FinancialSnapshot";
import { RecommendationsFeed } from "@/components/USER/RecommendationsFeed";
import { ChatWidget } from "@/components/ChatWidget";
import { getUserDashboard } from "@/lib/api";
import type { DashboardResponse } from "@/lib/types";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // In production, get user ID from auth context
        const userId = "user_demo_001";
        const data = await getUserDashboard(userId);
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Unable to load dashboard
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        userName={dashboardData.user.name}
        avatarUrl={dashboardData.user.avatarUrl}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Hero Insight */}
          <HeroInsight
            persona={dashboardData.persona}
            signals={dashboardData.signals}
          />

          {/* Financial Snapshot */}
          <FinancialSnapshot signals={dashboardData.signals} />

          {/* Recommendations Feed */}
          <RecommendationsFeed
            userId={dashboardData.user.id}
            recommendations={dashboardData.recommendations}
            progress={dashboardData.progress}
          />
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget
        userId={dashboardData.user.id}
        persona={dashboardData.persona.primary}
      />
    </div>
  );
}
