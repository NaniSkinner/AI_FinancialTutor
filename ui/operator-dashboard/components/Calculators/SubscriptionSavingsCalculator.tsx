"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Checkbox,
  Alert,
  AlertDescription,
} from "@/components/Common";
import { TrendingDown, Info, DollarSign } from "lucide-react";
import type { Subscription, SubscriptionSavingsCalculatorProps } from "./types";
import { formatCurrency } from "./utils";

export function SubscriptionSavingsCalculator({
  subscriptions = [],
}: SubscriptionSavingsCalculatorProps) {
  const [selectedForCancellation, setSelectedForCancellation] = useState<
    Set<number>
  >(new Set());

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const totalAnnual = totalMonthly * 12;

  const potentialMonthlySavings = subscriptions
    .filter((_, index) => selectedForCancellation.has(index))
    .reduce((sum, sub) => sum + sub.amount, 0);
  const potentialAnnualSavings = potentialMonthlySavings * 12;

  const newMonthlySpending = totalMonthly - potentialMonthlySavings;
  const percentageSavings =
    totalMonthly > 0 ? (potentialMonthlySavings / totalMonthly) * 100 : 0;

  const toggleSubscription = (index: number) => {
    const newSelected = new Set(selectedForCancellation);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedForCancellation(newSelected);
  };

  // Sort subscriptions by amount (highest first)
  const sortedWithIndex = subscriptions
    .map((sub, index) => ({ ...sub, originalIndex: index }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">
          Subscription Savings Calculator
        </CardTitle>
        <CardDescription>
          Identify potential savings by reviewing your recurring subscriptions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {/* Current Spending Overview */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 mb-1">Monthly Total</p>
            <p className="text-2xl font-bold">
              ${formatCurrency(totalMonthly, 2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Annual Total</p>
            <p className="text-2xl font-bold">
              ${formatCurrency(totalAnnual, 2)}
            </p>
          </div>
        </div>

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
          <Alert>
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5" />
              <AlertDescription>
                No subscription data available. Add your subscriptions manually
                to see potential savings.
              </AlertDescription>
            </div>
          </Alert>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">
              Your Subscriptions (sorted by cost)
            </h3>
            {sortedWithIndex.map((sub) => (
              <div
                key={sub.originalIndex}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  selectedForCancellation.has(sub.originalIndex)
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    checked={selectedForCancellation.has(sub.originalIndex)}
                    onCheckedChange={() =>
                      toggleSubscription(sub.originalIndex)
                    }
                  />
                  <div className="flex-1">
                    <p className="font-medium">{sub.name}</p>
                    {sub.frequency && (
                      <p className="text-xs text-gray-500">{sub.frequency}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${formatCurrency(sub.amount, 2)}/mo
                  </p>
                  <p className="text-xs text-gray-500">
                    ${formatCurrency(sub.amount * 12, 2)}/yr
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Potential Savings */}
        {potentialMonthlySavings > 0 && (
          <div className="space-y-4 p-6 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <TrendingDown className="h-5 w-5" />
              <h3 className="font-semibold">Potential Savings</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-green-700 mb-1">Monthly Savings</p>
                <p className="text-3xl font-bold text-green-900">
                  ${formatCurrency(potentialMonthlySavings, 2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-700 mb-1">Annual Savings</p>
                <p className="text-3xl font-bold text-green-900">
                  ${formatCurrency(potentialAnnualSavings, 2)}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-green-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700">New Monthly Spending</span>
                <span className="font-bold text-green-900">
                  ${formatCurrency(newMonthlySpending, 2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-green-700">Reduction</span>
                <span className="font-bold text-green-900">
                  {percentageSavings.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tips & Recommendations */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-700">
            Subscription Management Tips
          </h3>
          <div className="space-y-2">
            <Alert className="bg-blue-50 border-blue-200">
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
                <AlertDescription className="text-sm text-blue-800">
                  <strong>Tip:</strong> Review your subscriptions quarterly.
                  Many services offer annual plans with 15-20% discounts
                  compared to monthly billing.
                </AlertDescription>
              </div>
            </Alert>
            {totalMonthly > 200 && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <AlertDescription className="text-sm text-yellow-800">
                    Your subscription spending is over $200/month. Consider
                    which services you actively use each month.
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>
        </div>

        <Alert>
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5" />
            <AlertDescription className="text-xs">
              This calculator is for educational purposes only. Actual savings
              depend on your specific usage and cancellation policies. This is
              not financial advice.
            </AlertDescription>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}
