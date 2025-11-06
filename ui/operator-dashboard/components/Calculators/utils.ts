// Utility functions for calculators

/**
 * Format a number as currency with thousands separators
 */
export function formatCurrency(value: number, decimals: number = 0): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

/**
 * Format months with proper singular/plural
 */
export function formatMonths(months: number): string {
  return months === 1 ? "1 month" : `${months} months`;
}

/**
 * Calculate credit utilization percentage
 */
export function calculateUtilization(balance: number, limit: number): number {
  if (limit <= 0) return 0;
  return (balance / limit) * 100;
}

/**
 * Calculate months to reach a goal
 */
export function calculateMonthsToGoal(
  remaining: number,
  monthlySavings: number
): number {
  if (monthlySavings <= 0) return 0;
  return Math.ceil(remaining / monthlySavings);
}

/**
 * Safely parse number input
 */
export function safeNumberInput(
  value: string | number,
  defaultValue: number = 0
): number {
  const parsed = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(parsed) ? defaultValue : Math.max(0, parsed);
}

/**
 * Clamp a value between min and max
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Estimate monthly expenses from savings balance and emergency fund months
 * This is a fallback when monthly expenses aren't directly available
 */
export function estimateMonthlyExpenses(
  savingsBalance: number,
  emergencyFundMonths: number
): number {
  if (emergencyFundMonths <= 0) return 0;
  return Math.round(savingsBalance / emergencyFundMonths);
}
