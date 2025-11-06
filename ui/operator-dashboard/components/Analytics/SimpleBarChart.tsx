/**
 * SimpleBarChart Component
 *
 * A simple, responsive bar chart component using HTML/CSS.
 * No external charting library required.
 *
 * Features:
 * - Horizontal or vertical bars
 * - Automatic scaling
 * - Color-coded bars
 * - Responsive layout
 *
 * Usage:
 *   <SimpleBarChart
 *     data={[
 *       { label: "Approve", value: 623, color: "green" },
 *       { label: "Reject", value: 154, color: "red" },
 *     ]}
 *     orientation="vertical"
 *   />
 */

"use client";

import React from "react";

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarChartData[];
  orientation?: "horizontal" | "vertical";
  height?: string;
  showValues?: boolean;
}

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
];

export function SimpleBarChart({
  data,
  orientation = "vertical",
  height = "300px",
  showValues = true,
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  if (orientation === "horizontal") {
    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const color =
            item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.label}</span>
                {showValues && (
                  <span className="text-gray-600">
                    {item.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 text-white text-sm font-medium"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                    minWidth: item.value > 0 ? "40px" : "0px",
                  }}
                >
                  {percentage >= 20 && showValues && (
                    <span>{item.value.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical bars
  return (
    <div
      className="flex items-end justify-around gap-4 pb-8"
      style={{ height }}
    >
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        const color =
          item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

        return (
          <div
            key={item.label}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div
              className="relative w-full flex items-end justify-center"
              style={{ height: "100%" }}
            >
              {showValues && (
                <div className="absolute -top-6 text-sm font-medium text-gray-700">
                  {item.value.toLocaleString()}
                </div>
              )}
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${percentage}%`,
                  backgroundColor: color,
                  minHeight: item.value > 0 ? "20px" : "0px",
                }}
              />
            </div>
            <div className="text-xs font-medium text-gray-600 text-center mt-2">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
