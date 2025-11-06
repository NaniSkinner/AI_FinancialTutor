"use client";

import React, { useState, useEffect } from "react";
import {
  EmergencyFundCalculator,
  CreditUtilizationCalculator,
  SubscriptionSavingsCalculator,
  type CreditCard,
  type Subscription,
} from "@/components/Calculators";
import { Button } from "@/components/Common";
import {
  Shield,
  CreditCard as CreditCardIcon,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getUserDashboard } from "@/lib/api";
import { estimateMonthlyExpenses } from "@/components/Calculators/utils";
import type { DashboardResponse } from "@/lib/types";

type CalculatorType =
  | "emergency-fund"
  | "credit-utilization"
  | "subscription-savings";

export default function UserToolsPage() {
  const router = useRouter();
  const [activeCalculator, setActiveCalculator] =
    useState<CalculatorType>("emergency-fund");
  const [userData, setUserData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // In production, get user ID from auth context
        const userId = "user_demo_001";
        const data = await getUserDashboard(userId);
        setUserData(data);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const calculators = [
    {
      id: "emergency-fund" as CalculatorType,
      name: "Emergency Fund",
      icon: Shield,
      description: "Calculate your emergency fund goal",
    },
    {
      id: "credit-utilization" as CalculatorType,
      name: "Credit Health",
      icon: CreditCardIcon,
      description: "Check your credit utilization",
    },
    {
      id: "subscription-savings" as CalculatorType,
      name: "Subscription Audit",
      icon: DollarSign,
      description: "Find subscription savings",
    },
  ];

  // Prepare data for calculators from user signals
  const monthlyExpenses = userData
    ? estimateMonthlyExpenses(
        userData.signals.signals.savings.total_savings_balance,
        userData.signals.signals.savings.emergency_fund_months
      )
    : 0;

  const currentSavings = userData
    ? userData.signals.signals.savings.total_savings_balance
    : 0;

  // Map credit data to CreditCard format
  const creditCards: CreditCard[] = userData
    ? [
        {
          balance: userData.signals.signals.credit.total_credit_used,
          limit: userData.signals.signals.credit.total_credit_available,
          name: "Total Credit",
        },
      ]
    : [];

  // Map subscription data to Subscription format
  const subscriptions: Subscription[] =
    userData?.signals.signals.subscriptions.merchants?.map((merchant) => ({
      name: merchant.name,
      amount: merchant.amount,
      frequency: "Monthly",
    })) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Financial Tools
              </h1>
              <p className="text-gray-600 mt-1">
                Interactive calculators personalized with your data
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> These calculators are pre-filled with your
            financial data, but you can adjust any values to explore different
            scenarios.
          </p>
        </div>

        {/* Calculators Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calculator Menu */}
          <div className="lg:space-y-2 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {calculators.map((calc) => (
              <Button
                key={calc.id}
                variant={activeCalculator === calc.id ? "default" : "outline"}
                className="w-full justify-start whitespace-nowrap"
                onClick={() => setActiveCalculator(calc.id)}
              >
                <calc.icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{calc.name}</span>
                <span className="sm:hidden">{calc.name.split(" ")[0]}</span>
              </Button>
            ))}
          </div>

          {/* Calculator Display */}
          <div className="lg:col-span-3 flex justify-center">
            {activeCalculator === "emergency-fund" && (
              <EmergencyFundCalculator
                initialMonthlyExpenses={monthlyExpenses}
                initialCurrentSavings={currentSavings}
              />
            )}
            {activeCalculator === "credit-utilization" && (
              <CreditUtilizationCalculator initialCards={creditCards} />
            )}
            {activeCalculator === "subscription-savings" && (
              <SubscriptionSavingsCalculator subscriptions={subscriptions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
