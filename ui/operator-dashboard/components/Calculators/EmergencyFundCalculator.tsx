"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Label,
  Slider,
  Progress,
  Alert,
  AlertDescription,
} from "@/components/Common";
import { CheckCircle2, Info } from "lucide-react";
import type { EmergencyFundCalculatorProps } from "./types";
import { formatCurrency, calculateMonthsToGoal } from "./utils";

export function EmergencyFundCalculator({
  initialMonthlyExpenses = 0,
  initialCurrentSavings = 0,
}: EmergencyFundCalculatorProps) {
  const [monthlyExpenses, setMonthlyExpenses] = useState(
    initialMonthlyExpenses
  );
  const [currentSavings, setCurrentSavings] = useState(initialCurrentSavings);
  const [targetMonths, setTargetMonths] = useState(3);
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState(200);

  const targetAmount = monthlyExpenses * targetMonths;
  const remaining = Math.max(0, targetAmount - currentSavings);
  const progress = targetAmount > 0 ? (currentSavings / targetAmount) * 100 : 0;
  const monthsToGoal = calculateMonthsToGoal(remaining, monthlySavingsGoal);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">
          Emergency Fund Calculator
        </CardTitle>
        <CardDescription>
          Calculate how long it will take to build your emergency fund
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {/* Monthly Expenses */}
        <div className="space-y-2">
          <Label>Monthly Expenses</Label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Input
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
              className="flex-1 w-full"
              min="0"
            />
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${formatCurrency(monthlyExpenses)}
            </span>
          </div>
        </div>

        {/* Current Savings */}
        <div className="space-y-2">
          <Label>Current Savings</Label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              className="flex-1 w-full"
              min="0"
            />
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${formatCurrency(currentSavings)}
            </span>
          </div>
        </div>

        {/* Target Months */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Target Coverage</Label>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {targetMonths} months
            </span>
          </div>
          <Slider
            value={[targetMonths]}
            onValueChange={(value) => setTargetMonths(value[0])}
            min={1}
            max={12}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>1 month</span>
            <span>12 months</span>
          </div>
        </div>

        {/* Monthly Savings Goal */}
        <div className="space-y-2">
          <Label>How much can you save monthly?</Label>
          <Input
            type="number"
            value={monthlySavingsGoal}
            onChange={(e) => setMonthlySavingsGoal(Number(e.target.value))}
            min="0"
          />
        </div>

        {/* Results */}
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Your Emergency Fund Goal
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${formatCurrency(targetAmount)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-900 dark:text-gray-100">
              <span>Progress</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {remaining > 0 ? (
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  Amount Remaining
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  ${formatCurrency(remaining)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  Time to Goal
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {monthsToGoal} {monthsToGoal === 1 ? "month" : "months"}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Saving ${formatCurrency(monthlySavingsGoal)}/month
              </p>
            </div>
          ) : (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  Congratulations! You&apos;ve reached your {targetMonths}-month
                  emergency fund goal!
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        <Alert>
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5" />
            <AlertDescription className="text-xs">
              This calculator is for educational purposes only. Actual emergency
              fund needs vary by individual circumstances. This is not financial
              advice.
            </AlertDescription>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}
