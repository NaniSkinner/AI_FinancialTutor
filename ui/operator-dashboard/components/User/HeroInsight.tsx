"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { formatPersonaName } from "@/lib/utils";
import { Button } from "@/components/Common";
import type { PersonaInfo, UserSignals } from "@/lib/types";

interface HeroInsightProps {
  persona: PersonaInfo;
  signals: UserSignals;
}

export function HeroInsight({ persona, signals }: HeroInsightProps) {
  const router = useRouter();

  // Define insights for each persona type - Origin style
  const insights = {
    high_utilization: {
      title: "Your Credit Utilization Needs Attention",
      description: `Your credit cards are at ${signals.signals.credit?.aggregate_utilization_pct || 0}% utilization. Bringing this below 30% could improve your credit score.`,
      gradient:
        "bg-indigo-600",
      bgGradient:
        "bg-gray-800",
      ctaText: "Learn About Credit Health",
      ctaLink: "/learn/credit-utilization",
    },
    student: {
      title: "Student Budget Optimization",
      description: `Your spending patterns show opportunities for optimization. Small changes could help you reach your goals faster.`,
      gradient:
        "from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400",
      bgGradient:
        "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
      ctaText: "Optimize Your Budget",
      ctaLink: "/learn/student-budget",
    },
    savings_builder: {
      title: "You're Building Great Habits!",
      description: `Your savings grew ${signals.signals.savings?.savings_growth_rate_pct || 0}% this period. Keep it up!`,
      gradient:
        "from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400",
      bgGradient:
        "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
      ctaText: "Level Up Your Savings",
      ctaLink: "/learn/savings-strategies",
    },
    subscription_heavy: {
      title: "Subscription Audit Opportunity",
      description: `Your ${signals.signals.subscriptions?.recurring_merchant_count || 0} subscriptions total $${signals.signals.subscriptions?.monthly_recurring_spend || 0}/month. Review which ones you're actively using.`,
      gradient:
        "from-yellow-500 to-amber-500 dark:from-yellow-400 dark:to-amber-400",
      bgGradient:
        "from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30",
      ctaText: "Audit Your Subscriptions",
      ctaLink: "/learn/subscription-management",
    },
    variable_income_budgeter: {
      title: "Income Stability Focus",
      description: `With ${signals.signals.income?.payment_frequency || "irregular"} income, building a buffer is key. You currently have ${signals.signals.income?.cash_flow_buffer_months || 0} months coverage.`,
      gradient:
        "from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400",
      bgGradient:
        "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
      ctaText: "Learn Income Smoothing",
      ctaLink: "/learn/variable-income",
    },
    general: {
      title: "Welcome to Your Financial Journey",
      description:
        "We're analyzing your financial patterns to provide personalized recommendations.",
      gradient:
        "from-gray-500 to-slate-500 dark:from-gray-400 dark:to-slate-400",
      bgGradient:
        "from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30",
      ctaText: "Explore Resources",
      ctaLink: "/learn",
    },
  };

  const insight =
    insights[persona.primary as keyof typeof insights] || insights.general;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${insight.bgGradient} border border-gray-200 dark:border-gray-700 p-8 md:p-10`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.2),transparent_50%)]" />
      </div>

      <div className="relative">
        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-2 mb-6 flex-wrap"
        >
          <div
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${insight.gradient} text-white shadow-lg`}
          >
            <Sparkles className="h-4 w-4" />
            {formatPersonaName(persona.primary)}
          </div>
          {persona.secondary?.map((p) => (
            <span
              key={p}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
            >
              {formatPersonaName(p)}
            </span>
          ))}
        </motion.div>

        {/* Title and Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {insight.title}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed max-w-3xl">
            {insight.description}
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Button
            variant="gradient"
            size="lg"
            onClick={() => router.push(insight.ctaLink)}
            className="group"
          >
            {insight.ctaText}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
