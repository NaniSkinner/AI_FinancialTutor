"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
  ExternalLink,
  Info,
  BookOpen,
} from "lucide-react";
import {
  markRecommendationComplete,
  recordRecommendationView,
} from "@/lib/api";
import type { Recommendation } from "@/lib/types";
import {
  EmergencyFundCalculator,
  CreditUtilizationCalculator,
  SubscriptionSavingsCalculator,
} from "@/components/Calculators";

interface RecommendationCardProps {
  recommendation: Recommendation;
  userId: string;
}

export function RecommendationCard({
  recommendation,
  userId,
}: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const priorityAccentColors = {
    high: "border-l-red-500 dark:border-l-red-400",
    medium: "border-l-yellow-500 dark:border-l-yellow-400",
    low: "border-l-blue-500 dark:border-l-blue-400",
  };

  const priorityDotColors = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
  };

  // Mock content for articles
  const articleContent = {
    rec_user_001: `Credit utilization is the percentage of your available credit that you're currently using. It's one of the most important factors in your credit score, accounting for about 30% of your score.

Your Current Situation:
• Your credit cards are at 68% utilization
• Total used: $5,500 out of $8,000 available

Why It Matters:
Credit experts recommend keeping your utilization below 30%. Here's why:
• Below 10%: Excellent - optimal for your credit score
• 10-30%: Good - minimal impact on score
• 30-50%: Fair - begins to lower your score
• Above 50%: Poor - significant negative impact

How to Improve:
1. Pay down balances - Focus on high-utilization cards first
2. Request credit limit increases
3. Make multiple payments per month
4. Spread balances across cards (but keep overall low)

Small changes can make a big difference in your credit score!`,
    rec_user_002: `Subscription services can add up quickly. Your current subscriptions:

• Netflix: $15.99/month
• Spotify: $10.99/month
• Adobe Creative: $52.99/month
• Planet Fitness: $24.99/month
• DoorDash Pass: $22.54/month

Total: $127.50/month = $1,530/year

Audit Questions:
1. When did I last use this service?
2. Can I downgrade to a cheaper plan?
3. Are there free alternatives?
4. Do I have duplicate services?

Many people find they can save $50-100/month by reviewing subscriptions quarterly.`,
    rec_user_004: `Credit card interest compounds daily, which means you're paying interest on your interest.

Your Current Interest:
• Based on your $5,500 balance and typical APRs
• Estimated: $70-90/month = $840-1,080/year

How to minimize interest:
1. Pay more than the minimum
2. Focus on high APR cards first
3. Consider balance transfer offers
4. Make payments before statement date

Even small additional payments can save hundreds in interest over time!`,
    rec_user_005: `An emergency fund is your financial safety net. Here's why it matters:

Your Current Status:
• Savings: $5,250
• Coverage: 2.1 months of expenses
• Goal: 3-6 months recommended

Building Your Emergency Fund:
1. Start small - even $25/week adds up
2. Automate transfers to savings
3. Keep it in a high-yield savings account
4. Don't touch it except for emergencies

Why 3-6 Months?
• Job loss buffer
• Medical emergencies
• Major repairs
• Unexpected expenses

You're already making great progress. Keep going!`,
  };

  const handleExpand = async () => {
    if (!expanded) {
      // Record view
      try {
        await recordRecommendationView(recommendation.id);
      } catch (error) {
        console.error("Failed to record view:", error);
      }
    }
    setExpanded(!expanded);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await markRecommendationComplete(recommendation.id, userId);
      setCompleted(true);
    } catch (error) {
      console.error("Failed to mark complete:", error);
    } finally {
      setLoading(false);
    }
  };

  const content =
    articleContent[recommendation.id as keyof typeof articleContent] || "";

  return (
    <div
      className={`rounded-xl border-l-4 border border-gray-200 dark:border-gray-700 ${priorityAccentColors[recommendation.priority]} bg-white dark:bg-card transition-all duration-200 hover:shadow-lg ${
        completed ? "opacity-60" : ""
      }`}
    >
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Badges and Metadata */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {/* Priority Dot */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${priorityDotColors[recommendation.priority]}`}
                />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  {recommendation.priority}
                </span>
              </div>

              {/* Type Badge */}
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {recommendation.type}
              </span>

              {/* Read Time */}
              {recommendation.read_time_minutes && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {recommendation.read_time_minutes} min
                </span>
              )}

              {/* Completed Badge */}
              {completed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  <Check className="h-3.5 w-3.5" />
                  Completed
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 leading-snug">
              {recommendation.title}
            </h3>

            {/* Rationale (preview) */}
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {recommendation.rationale}
            </p>
          </div>

          {/* Expand Button */}
          <button
            onClick={handleExpand}
            className="ml-4 p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all shrink-0"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-5">
            {/* Full Content */}
            {recommendation.type === "article" && content && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {content}
                  </p>
                </div>
              </div>
            )}

            {recommendation.type === "calculator" && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                {/* Determine calculator type from URL */}
                {recommendation.content_url?.includes("emergency-fund") && (
                  <EmergencyFundCalculator
                    initialMonthlyExpenses={0}
                    initialCurrentSavings={0}
                  />
                )}
                {recommendation.content_url?.includes("credit-utilization") && (
                  <CreditUtilizationCalculator initialCards={[]} />
                )}
                {recommendation.content_url?.includes(
                  "subscription-savings"
                ) && <SubscriptionSavingsCalculator subscriptions={[]} />}
                {!recommendation.content_url?.includes("emergency-fund") &&
                  !recommendation.content_url?.includes("credit-utilization") &&
                  !recommendation.content_url?.includes(
                    "subscription-savings"
                  ) && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 dark:text-gray-600 mb-4">
                        <BookOpen className="h-12 w-12 mx-auto" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Calculator type not recognized
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 dark:text-blue-300">
                This is educational information, not financial advice. Consult a
                licensed financial advisor for personalized guidance.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              {!completed && (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <Check className="h-4 w-4" />
                  {loading ? "Saving..." : "Mark as Complete"}
                </button>
              )}
              {recommendation.content_url && (
                <a
                  href={recommendation.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <BookOpen className="h-4 w-4" />
                  Read Full Article
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
