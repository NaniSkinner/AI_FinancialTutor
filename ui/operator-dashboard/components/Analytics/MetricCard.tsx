/**
 * MetricCard Component
 *
 * Displays a single metric with label, value, and optional trend indicator.
 * Used in the analytics dashboard to show key performance indicators.
 *
 * Features:
 * - Large, readable value display
 * - Optional icon
 * - Optional trend indicator (up/down/neutral)
 * - Color-coded styling
 *
 * Usage:
 *   <MetricCard
 *     label="Total Actions"
 *     value={847}
 *     icon="📊"
 *     trend={{ direction: "up", value: "12%" }}
 *   />
 */

"use client";

import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: string;
  description?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
}

const COLOR_CLASSES = {
  blue: "bg-blue-50 border-blue-200 text-blue-900",
  green: "bg-green-50 border-green-200 text-green-900",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-900",
  red: "bg-red-50 border-red-200 text-red-900",
  purple: "bg-purple-50 border-purple-200 text-purple-900",
  gray: "bg-gray-50 border-gray-200 text-gray-900",
};

const TREND_COLORS = {
  up: "text-green-600",
  down: "text-red-600",
  neutral: "text-gray-600",
};

const TREND_ICONS = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

export function MetricCard({
  label,
  value,
  icon,
  description,
  trend,
  color = "blue",
}: MetricCardProps) {
  const colorClass = COLOR_CLASSES[color];

  return (
    <div
      className={`p-6 rounded-lg border-2 ${colorClass} transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {label}
            </h3>
          </div>

          <div className="text-3xl font-bold mb-1">
            {typeof value === "number" && value >= 1000
              ? value.toLocaleString()
              : value}
          </div>

          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${TREND_COLORS[trend.direction]}`}
          >
            <span className="text-lg">{TREND_ICONS[trend.direction]}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
