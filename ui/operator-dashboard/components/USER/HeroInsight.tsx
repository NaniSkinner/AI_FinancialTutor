"use client";

import { useRouter } from "next/navigation";
import { formatPersonaName } from "@/lib/utils";
import type { PersonaInfo, UserSignals } from "@/lib/types";

interface HeroInsightProps {
  persona: PersonaInfo;
  signals: UserSignals;
}

export function HeroInsight({ persona, signals }: HeroInsightProps) {
  const router = useRouter();

  // Define insights for each persona type
  const insights = {
    high_utilization: {
      title: "Your Credit Utilization Needs Attention",
      description: `Your credit cards are at ${signals.signals.credit?.aggregate_utilization_pct || 0}% utilization. Bringing this below 30% could improve your credit score.`,
      icon: "📊",
      color: "bg-red-50 border-red-200",
      ctaText: "Learn About Credit Health",
      ctaLink: "/learn/credit-utilization",
    },
    student: {
      title: "Student Budget Optimization",
      description: `Your spending patterns show opportunities for optimization. Small changes could help you reach your goals faster.`,
      icon: "🎓",
      color: "bg-blue-50 border-blue-200",
      ctaText: "Optimize Your Budget",
      ctaLink: "/learn/student-budget",
    },
    savings_builder: {
      title: "You're Building Great Habits!",
      description: `Your savings grew ${signals.signals.savings?.savings_growth_rate_pct || 0}% this period. Keep it up!`,
      icon: "🎉",
      color: "bg-green-50 border-green-200",
      ctaText: "Level Up Your Savings",
      ctaLink: "/learn/savings-strategies",
    },
    subscription_heavy: {
      title: "Subscription Audit Opportunity",
      description: `Your ${signals.signals.subscriptions?.recurring_merchant_count || 0} subscriptions total $${signals.signals.subscriptions?.monthly_recurring_spend || 0}/month. Review which ones you're actively using.`,
      icon: "💳",
      color: "bg-yellow-50 border-yellow-200",
      ctaText: "Audit Your Subscriptions",
      ctaLink: "/learn/subscription-management",
    },
    variable_income_budgeter: {
      title: "Income Stability Focus",
      description: `With ${signals.signals.income?.payment_frequency || "irregular"} income, building a buffer is key. You currently have ${signals.signals.income?.cash_flow_buffer_months || 0} months coverage.`,
      icon: "📈",
      color: "bg-purple-50 border-purple-200",
      ctaText: "Learn Income Smoothing",
      ctaLink: "/learn/variable-income",
    },
    general: {
      title: "Welcome to Your Financial Journey",
      description:
        "We're analyzing your financial patterns to provide personalized recommendations.",
      icon: "✨",
      color: "bg-gray-50 border-gray-200",
      ctaText: "Explore Resources",
      ctaLink: "/learn",
    },
  };

  const insight =
    insights[persona.primary as keyof typeof insights] || insights.general;

  return (
    <div className={`rounded-lg border-2 p-6 ${insight.color}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="text-4xl shrink-0">{insight.icon}</div>

        {/* Content */}
        <div className="flex-1">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-300">
              {formatPersonaName(persona.primary)}
            </span>
            {persona.secondary?.map((p) => (
              <span
                key={p}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/50 border border-gray-200"
              >
                {formatPersonaName(p)}
              </span>
            ))}
          </div>

          {/* Title and Description */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {insight.title}
          </h2>
          <p className="text-gray-700 mb-4">{insight.description}</p>

          {/* CTA Button */}
          <button
            onClick={() => router.push(insight.ctaLink)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {insight.ctaText}
          </button>
        </div>
      </div>
    </div>
  );
}
