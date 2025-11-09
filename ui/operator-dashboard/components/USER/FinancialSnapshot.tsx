"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  PiggyBank,
  RefreshCw,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SpendingChart } from "./SpendingChart";
import { CategoryBreakdown } from "./CategoryBreakdown";
import type { UserSignals } from "@/lib/types";

interface FinancialSnapshotProps {
  signals: UserSignals;
}

export function FinancialSnapshot({ signals }: FinancialSnapshotProps) {
  const getUtilizationStatus = (
    utilization: number | undefined
  ): "good" | "warning" | "danger" => {
    if (!utilization) return "good";
    if (utilization < 30) return "good";
    if (utilization < 50) return "warning";
    return "danger";
  };

  const getStatusColor = (
    status: "good" | "warning" | "danger" | "neutral"
  ): string => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "danger":
        return "text-indigo-600";
      default:
        return "text-gray-600";
    }
  };

  const snapshots: Array<{
    label: string;
    value: string;
    icon: typeof CreditCard;
    status: "good" | "warning" | "danger" | "neutral";
    trend?: "up" | "down" | "neutral";
    subtitle?: string;
  }> = [
    {
      label: "Credit Utilization",
      value: `${signals.signals.credit?.aggregate_utilization_pct || 0}%`,
      icon: CreditCard,
      status: getUtilizationStatus(
        signals.signals.credit?.aggregate_utilization_pct
      ),
      trend:
        (signals.signals.credit?.aggregate_utilization_pct || 0) > 50
          ? "up"
          : "neutral",
    },
    {
      label: "Savings Balance",
      value: formatCurrency(
        signals.signals.savings?.total_savings_balance || 0
      ),
      icon: PiggyBank,
      status: "good",
      trend:
        (signals.signals.savings?.savings_growth_rate_pct || 0) > 0
          ? "up"
          : (signals.signals.savings?.savings_growth_rate_pct || 0) < 0
            ? "down"
            : "neutral",
    },
    {
      label: "Subscriptions",
      value: `${signals.signals.subscriptions?.recurring_merchant_count || 0} items`,
      icon: RefreshCw,
      status:
        (signals.signals.subscriptions?.recurring_merchant_count || 0) > 5
          ? "warning"
          : "good",
      subtitle:
        formatCurrency(
          signals.signals.subscriptions?.monthly_recurring_spend || 0
        ) + "/mo",
    },
    {
      label: "Income Stability",
      value: signals.signals.income?.payment_frequency || "Unknown",
      icon: TrendingUp,
      status:
        signals.signals.income?.payment_frequency === "biweekly" ||
        signals.signals.income?.payment_frequency === "monthly"
          ? "good"
          : "warning",
      subtitle: `${(signals.signals.income?.cash_flow_buffer_months || 0).toFixed(1)} mo buffer`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Your Financial Snapshot
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {snapshots.map((snapshot, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {snapshot.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {snapshot.value}
                  </p>
                  {snapshot.subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {snapshot.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900`}>
                  <snapshot.icon
                    className={`h-6 w-6 ${getStatusColor(snapshot.status)}`}
                  />
                </div>
              </div>

              {snapshot.trend && (
                <div className="mt-4 flex items-center gap-1.5 text-sm">
                  {snapshot.trend === "up" && (
                    <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                  {snapshot.trend === "down" && (
                    <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  {snapshot.trend === "neutral" && (
                    <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="text-gray-500 dark:text-gray-400">
                    vs. last month
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart />
        <CategoryBreakdown />
      </div>
    </div>
  );
}
