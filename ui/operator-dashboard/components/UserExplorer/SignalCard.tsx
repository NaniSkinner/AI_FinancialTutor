// Signal Card Component
// Displays different types of user behavioral signals

import React from "react";
import type {
  CreditSignals,
  SubscriptionSignals,
  SavingsSignals,
  IncomeSignals,
} from "@/lib/types";

interface Props {
  title: string;
  data: CreditSignals | SubscriptionSignals | SavingsSignals | IncomeSignals;
  type: "credit" | "subscriptions" | "savings" | "income";
}

export function SignalCard({ title, data, type }: Props) {
  const renderContent = () => {
    switch (type) {
      case "credit":
        const creditData = data as CreditSignals;
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Aggregate Utilization
              </span>
              <span
                className={`text-sm font-semibold ${
                  creditData.aggregate_utilization_pct >= 50
                    ? "text-red-600"
                    : creditData.aggregate_utilization_pct >= 30
                      ? "text-yellow-600"
                      : "text-green-600"
                }`}
              >
                {creditData.aggregate_utilization_pct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Credit Used</span>
              <span className="text-sm font-semibold text-gray-900">
                ${creditData.total_credit_used.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Total Credit Available
              </span>
              <span className="text-sm font-semibold text-gray-900">
                ${creditData.total_credit_available.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Interest Charges</span>
              <span
                className={`text-sm font-semibold ${
                  creditData.any_interest_charges
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {creditData.any_interest_charges ? "Yes" : "None"}
              </span>
            </div>
          </div>
        );

      case "subscriptions":
        const subsData = data as SubscriptionSignals;
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Recurring Merchants</span>
              <span className="text-sm font-semibold text-gray-900">
                {subsData.recurring_merchant_count}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Spend</span>
              <span className="text-sm font-semibold text-gray-900">
                ${subsData.monthly_recurring_spend.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">% of Total Spend</span>
              <span className="text-sm font-semibold text-gray-900">
                {subsData.subscription_share_pct}%
              </span>
            </div>
            {subsData.merchants && subsData.merchants.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">
                  Top Subscriptions:
                </div>
                {subsData.merchants.slice(0, 3).map((m, i) => (
                  <div key={i} className="text-xs text-gray-600">
                    • {m.name}: ${m.amount.toFixed(2)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "savings":
        const savingsData = data as SavingsSignals;
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Balance</span>
              <span className="text-sm font-semibold text-gray-900">
                ${savingsData.total_savings_balance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Growth Rate</span>
              <span
                className={`text-sm font-semibold ${
                  savingsData.savings_growth_rate_pct > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {savingsData.savings_growth_rate_pct > 0 ? "+" : ""}
                {savingsData.savings_growth_rate_pct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Inflow</span>
              <span className="text-sm font-semibold text-gray-900">
                ${savingsData.net_savings_inflow.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Emergency Fund</span>
              <span
                className={`text-sm font-semibold ${
                  savingsData.emergency_fund_months >= 3
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {savingsData.emergency_fund_months.toFixed(1)} months
              </span>
            </div>
          </div>
        );

      case "income":
        const incomeData = data as IncomeSignals;
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Income Type</span>
              <span className="text-sm font-semibold text-gray-900 capitalize">
                {incomeData.income_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment Frequency</span>
              <span className="text-sm font-semibold text-gray-900 capitalize">
                {incomeData.payment_frequency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Median Pay Gap</span>
              <span className="text-sm font-semibold text-gray-900">
                {incomeData.median_pay_gap_days} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Income Variability</span>
              <span
                className={`text-sm font-semibold ${
                  incomeData.income_variability_pct > 20
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {incomeData.income_variability_pct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cash Flow Buffer</span>
              <span
                className={`text-sm font-semibold ${
                  incomeData.cash_flow_buffer_months < 1
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {incomeData.cash_flow_buffer_months.toFixed(1)} months
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
      {renderContent()}
    </div>
  );
}
