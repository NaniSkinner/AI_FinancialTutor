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

  const priorityColors = {
    high: "border-red-300 bg-red-50",
    medium: "border-yellow-300 bg-yellow-50",
    low: "border-blue-300 bg-blue-50",
  };

  const priorityBadgeColors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-blue-100 text-blue-800 border-blue-200",
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
      className={`rounded-lg border-2 transition-all ${priorityColors[recommendation.priority]} ${
        completed ? "opacity-60" : ""
      }`}
    >
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                  priorityBadgeColors[recommendation.priority]
                }`}
              >
                {recommendation.priority.toUpperCase()}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white border border-gray-300">
                {recommendation.type}
              </span>
              {recommendation.read_time_minutes && (
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recommendation.read_time_minutes} min
                </span>
              )}
              {completed && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  ✓ Completed
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {recommendation.title}
            </h3>

            {/* Rationale (preview) */}
            <p className="text-gray-700 text-sm">{recommendation.rationale}</p>
          </div>

          {/* Expand Button */}
          <button
            onClick={handleExpand}
            className="ml-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-colors shrink-0"
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
          <div className="mt-4 pt-4 border-t border-gray-300 space-y-4">
            {/* Full Content */}
            {recommendation.type === "article" && content && (
              <div className="bg-white rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
                </div>
              </div>
            )}

            {recommendation.type === "calculator" && (
              <div className="bg-white rounded-lg p-4">
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <BookOpen className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-600">
                    Interactive calculator would be loaded here
                  </p>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900">
                This is educational information, not financial advice. Consult a
                licensed financial advisor for personalized guidance.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {!completed && (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
