"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  EmergencyFundCalculator,
  CreditUtilizationCalculator,
  SubscriptionSavingsCalculator,
  type CreditCard,
  type Subscription,
} from "@/components/Calculators";
import { UserSearch } from "@/components/UserExplorer/UserSearch";
import { useUserSignals } from "@/hooks/useUserSignals";
import { Button, Spinner, Badge } from "@/components/Common";
import {
  Shield,
  CreditCard as CreditCardIcon,
  DollarSign,
  ChevronLeft,
} from "lucide-react";
import { getPersonaColor, formatPersonaName } from "@/lib/utils";
import { estimateMonthlyExpenses } from "@/components/Calculators/utils";

type CalculatorType =
  | "emergency-fund"
  | "credit-utilization"
  | "subscription-savings";

export default function CalculatorsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get("type") as CalculatorType | null;
  const userIdParam = searchParams.get("userId");

  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>(
    typeParam || "emergency-fund"
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    userIdParam
  );
  const { data: userData, isLoading } = useUserSignals(selectedUserId);

  // Update active calculator when URL parameter changes
  useEffect(() => {
    if (typeParam && typeParam !== activeCalculator) {
      setActiveCalculator(typeParam);
    }
  }, [typeParam]);

  // Update selected user when URL parameter changes
  useEffect(() => {
    if (userIdParam && userIdParam !== selectedUserId) {
      setSelectedUserId(userIdParam);
    }
  }, [userIdParam]);

  const calculators = [
    {
      id: "emergency-fund" as CalculatorType,
      name: "Emergency Fund",
      icon: Shield,
      description: "Calculate your emergency fund goal",
    },
    {
      id: "credit-utilization" as CalculatorType,
      name: "Credit Utilization",
      icon: CreditCardIcon,
      description: "Understand your credit usage",
    },
    {
      id: "subscription-savings" as CalculatorType,
      name: "Subscription Savings",
      icon: DollarSign,
      description: "See potential subscription savings",
    },
  ];

  // Prepare data for calculators from user signals
  const monthlyExpenses = userData
    ? estimateMonthlyExpenses(
        userData.signals.savings.total_savings_balance,
        userData.signals.savings.emergency_fund_months
      )
    : 0;

  const currentSavings = userData
    ? userData.signals.savings.total_savings_balance
    : 0;

  // Map credit data to CreditCard format
  const creditCards: CreditCard[] = userData
    ? [
        {
          balance: userData.signals.credit.total_credit_used,
          limit: userData.signals.credit.total_credit_available,
          name: "Total Credit",
        },
      ]
    : [];

  // Map subscription data to Subscription format
  const subscriptions: Subscription[] =
    userData?.signals.subscriptions.merchants?.map((merchant) => ({
      name: merchant.name,
      amount: merchant.amount,
      frequency: "Monthly",
    })) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Financial Calculators
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Interactive tools to explore financial scenarios
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Selection */}
        <div className="mb-8 bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Select User (Optional)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose a user to pre-fill calculators with their financial data, or
            use the calculators with manual input.
          </p>
          <UserSearch onUserSelect={setSelectedUserId} />

          {selectedUserId && (
            <div className="mt-4 flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Loading user data...
                  </span>
                </div>
              ) : userData ? (
                <>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      User: {userData.user_id}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Primary Persona:
                      </span>
                      <Badge
                        className={getPersonaColor(
                          userData.persona_30d.primary
                        )}
                      >
                        {formatPersonaName(userData.persona_30d.primary)}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                </>
              ) : (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Failed to load user data
                </p>
              )}
            </div>
          )}
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
