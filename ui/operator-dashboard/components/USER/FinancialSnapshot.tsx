"use client";

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
        return "text-red-600";
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
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Your Financial Snapshot
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {snapshots.map((snapshot, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{snapshot.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {snapshot.value}
                </p>
                {snapshot.subtitle && (
                  <p className="text-sm text-gray-500 mt-1">
                    {snapshot.subtitle}
                  </p>
                )}
              </div>
              <snapshot.icon
                className={`h-8 w-8 ${getStatusColor(snapshot.status)}`}
              />
            </div>

            {snapshot.trend && (
              <div className="mt-2 flex items-center gap-1 text-sm">
                {snapshot.trend === "up" && (
                  <ArrowUp className="h-4 w-4 text-green-600" />
                )}
                {snapshot.trend === "down" && (
                  <ArrowDown className="h-4 w-4 text-red-600" />
                )}
                {snapshot.trend === "neutral" && (
                  <Minus className="h-4 w-4 text-gray-600" />
                )}
                <span className="text-gray-500">vs. last month</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
