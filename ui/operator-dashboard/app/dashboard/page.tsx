"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/USER/DashboardHeader";
import { HeroInsight } from "@/components/USER/HeroInsight";
import { FinancialSnapshot } from "@/components/USER/FinancialSnapshot";
import { RecommendationsFeed } from "@/components/USER/RecommendationsFeed";
import { QuickTools } from "@/components/USER/QuickTools";
import { ProgressWidget } from "@/components/USER/ProgressWidget";
import { ChatWidget } from "@/components/ChatWidget";
import { TransitionCelebration } from "@/components/Gamification/TransitionCelebration";
import { OnboardingModal } from "@/components/Onboarding";
import { ConsentGuard } from "@/components/Consent";
import { getUserDashboard } from "@/lib/api";
import { useOnboarding } from "@/hooks/useOnboarding";
import type { DashboardResponse } from "@/lib/types";
import { Sparkles, TrendingUp, MessageCircle } from "lucide-react";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { shouldShow, dismiss, loading: onboardingLoading } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  // Show onboarding modal if needed
  useEffect(() => {
    if (!onboardingLoading && shouldShow && !loading) {
      // Small delay to ensure dashboard is loaded first
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [onboardingLoading, shouldShow, loading]);

  const handleOnboardingClose = async () => {
    await dismiss();
    setShowOnboarding(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors">
      {/* Skip to Content Link for Accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <DashboardHeader
        userName={dashboardData.user.name}
        avatarUrl={dashboardData.user.avatarUrl}
      />

      <main
        id="main-content"
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10"
        role="main"
        aria-label="Dashboard"
      >
        <div className="space-y-10">
          {/* Hero Insight - Requires AI consent */}
          <ConsentGuard
            requiredConsents={["dataAnalysis", "recommendations"]}
            featureName="AI Insights"
            featureDescription="Get personalized insights about your financial patterns and receive educational recommendations."
            promptDescription="Unlock personalized AI insights that help you understand your spending patterns and financial opportunities."
            icon={<Sparkles className="h-8 w-8 text-primary" />}
          >
            <HeroInsight
              persona={dashboardData.persona}
              signals={dashboardData.signals}
            />
          </ConsentGuard>

          {/* Financial Snapshot - No consent needed (basic data display) */}
          <FinancialSnapshot signals={dashboardData.signals} />

          {/* Progress Widget and Quick Tools Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressWidget gamification={dashboardData.gamification} />
            <QuickTools />
          </div>

          {/* Recommendations Feed - Requires AI consent */}
          <ConsentGuard
            requiredConsents={["dataAnalysis", "recommendations"]}
            featureName="Personalized Recommendations"
            featureDescription="Receive AI-powered educational content tailored to your financial situation."
            promptDescription="Get personalized learning content, articles, and calculators based on your unique financial patterns."
            icon={<TrendingUp className="h-8 w-8 text-primary" />}
          >
            <RecommendationsFeed
              userId={dashboardData.user.id}
              recommendations={dashboardData.recommendations}
              progress={dashboardData.progress}
            />
          </ConsentGuard>
        </div>
      </main>

      {/* Transition Celebration - Show if recent transition exists */}
      {dashboardData.recentTransition && (
        <TransitionCelebration
          transition={{
            fromPersona: dashboardData.recentTransition.fromPersona,
            toPersona: dashboardData.recentTransition.toPersona,
            transitionDate: new Date(
              dashboardData.recentTransition.transitionDate
            ),
            achievement: dashboardData.recentTransition.achievement,
          }}
        />
      )}

      {/* Chat Widget - Requires AI consent */}
      <ConsentGuard
        requiredConsents={["dataAnalysis", "recommendations"]}
        featureName="AI Chat Assistant"
        featureDescription="Ask questions and get personalized educational guidance about your finances."
        promptDescription="Chat with our AI assistant to get answers about financial concepts and personalized guidance."
        icon={<MessageCircle className="h-8 w-8 text-primary" />}
      >
        <ChatWidget
          userId={dashboardData.user.id}
          persona={dashboardData.persona.primary}
        />
      </ConsentGuard>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
