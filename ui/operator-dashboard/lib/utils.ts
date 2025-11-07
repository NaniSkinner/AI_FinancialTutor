// Utility Functions for Operator Dashboard
// Common helper functions for formatting, styling, and data manipulation

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// CLASS NAME UTILITIES
// ============================================================================

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================================
// DATE FORMATTING UTILITIES
// ============================================================================

/**
 * Format date to readable string
 * @param date - Date string or Date object
 * @returns Formatted date (e.g., "Nov 4, 2025")
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date and time to readable string
 * @param date - Date string or Date object
 * @returns Formatted datetime (e.g., "Nov 4, 2025, 2:30 PM")
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date as relative time
 * @param date - Date string or Date object
 * @returns Relative time string (e.g., "2h ago", "3d ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Get Tailwind color classes for priority levels
 * @param priority - Priority level (high, medium, low)
 * @returns Tailwind CSS classes for background and text
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800";
    case "medium":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800";
    case "low":
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
  }
}

/**
 * Get Tailwind color classes for persona types
 * @param persona - Persona identifier
 * @returns Tailwind CSS classes for background and text
 */
export function getPersonaColor(persona: string): string {
  switch (persona) {
    case "high_utilization":
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800";
    case "variable_income_budgeter":
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800";
    case "student":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
    case "subscription_heavy":
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800";
    case "savings_builder":
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
  }
}

// ============================================================================
// TEXT FORMATTING UTILITIES
// ============================================================================

/**
 * Format persona name for display
 * @param persona - Persona identifier (snake_case)
 * @returns Formatted persona name (Title Case with spaces)
 */
export function formatPersonaName(persona: string): string {
  return persona
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ============================================================================
// NUMERIC FORMATTING UTILITIES
// ============================================================================

/**
 * Format number as currency with $ and commas
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number as percentage
 * @param value - Value to format (e.g., 25 for 25%)
 * @returns Formatted percentage string (e.g., "25%")
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ============================================================================
// SIGNAL HEALTH UTILITIES
// ============================================================================

/**
 * Get signal health status based on type and value
 * @param type - Signal type (credit_utilization, emergency_fund, income_variability)
 * @param value - Signal value
 * @returns Health status: good, warning, or critical
 */
export function getSignalHealth(
  type: string,
  value: number
): "good" | "warning" | "critical" {
  switch (type) {
    case "credit_utilization":
      if (value < 30) return "good";
      if (value < 50) return "warning";
      return "critical";

    case "emergency_fund":
      if (value >= 3) return "good";
      if (value >= 1) return "warning";
      return "critical";

    case "income_variability":
      if (value < 20) return "good";
      if (value < 40) return "warning";
      return "critical";

    default:
      return "good";
  }
}

/**
 * Get initials from a name
 * @param name - Full name
 * @returns Initials (e.g., "John Doe" => "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
