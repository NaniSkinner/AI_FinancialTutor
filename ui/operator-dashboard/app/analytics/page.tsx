/**
 * Analytics Dashboard Page
 *
 * Comprehensive analytics view showing operator performance,
 * recommendation trends, and system health metrics.
 *
 * Features:
 * - Date range filtering
 * - Key metric cards
 * - Action distribution charts
 * - Timeline visualization
 * - Operator leaderboard
 * - Persona approval rates
 */

"use client";

import React, { useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { MetricCard } from "@/components/Analytics/MetricCard";
import {
  SimpleBarChart,
  type BarChartData,
} from "@/components/Analytics/SimpleBarChart";
import {
  SimpleLineChart,
  type LineChartSeries,
} from "@/components/Analytics/SimpleLineChart";

// Helper to format dates for input fields
function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper to get date range presets
function getDateRange(preset: "7d" | "30d" | "90d" | "custom"): {
  start: string;
  end: string;
} {
  const end = new Date();
  const start = new Date();

  switch (preset) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
      start.setDate(end.getDate() - 30);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    default:
      start.setDate(end.getDate() - 30); // Default to 30 days
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export default function AnalyticsPage() {
  usePerformanceMonitoring("AnalyticsPage");

  const [datePreset, setDatePreset] = useState<"7d" | "30d" | "90d" | "custom">(
    "30d"
  );
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Determine which date range to use
  const dateRange =
    datePreset === "custom"
      ? { start: customStartDate, end: customEndDate }
      : getDateRange(datePreset);

  const {
    data: analytics,
    error,
    isLoading,
  } = useAnalytics(dateRange.start, dateRange.end);

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Analytics Dashboard
        </h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Analytics Dashboard
        </h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Failed to load analytics data. Please try again later.
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Prepare chart data
  const actionsByTypeData: BarChartData[] = analytics.actions_by_type.map(
    (action) => ({
      label: action.action.charAt(0).toUpperCase() + action.action.slice(1),
      value: action.count,
      color:
        action.action === "approve"
          ? "#10b981"
          : action.action === "reject"
            ? "#ef4444"
            : action.action === "modify"
              ? "#f59e0b"
              : "#8b5cf6",
    })
  );

  // Prepare timeline data - aggregate by date
  const timelineByDate = analytics.actions_timeline.reduce(
    (acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = {
          date: item.date,
          approve: 0,
          reject: 0,
          modify: 0,
          flag: 0,
        };
      }
      acc[item.date][item.action as keyof Omit<(typeof acc)[string], "date">] =
        item.count;
      return acc;
    },
    {} as Record<
      string,
      {
        date: string;
        approve: number;
        reject: number;
        modify: number;
        flag: number;
      }
    >
  );

  const timelineSeries: LineChartSeries[] = [
    {
      name: "Approvals",
      color: "#10b981",
      data: Object.values(timelineByDate).map((d) => ({
        date: d.date,
        value: d.approve,
      })),
    },
    {
      name: "Rejections",
      color: "#ef4444",
      data: Object.values(timelineByDate).map((d) => ({
        date: d.date,
        value: d.reject,
      })),
    },
  ];

  const personaData: BarChartData[] = analytics.approval_by_persona.map(
    (persona) => ({
      label: persona.persona_primary.replace(/_/g, " "),
      value: persona.approval_rate,
      color: "#3b82f6",
    })
  );

  const operatorData: BarChartData[] = analytics.operator_activity
    .slice(0, 5)
    .map((op) => ({
      label: op.operator_id,
      value: op.total_actions,
      color: "#8b5cf6",
    }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Performance metrics and insights</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDatePreset("7d")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              datePreset === "7d"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDatePreset("30d")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              datePreset === "30d"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDatePreset("90d")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              datePreset === "90d"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => setDatePreset("custom")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              datePreset === "custom"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Custom Range
          </button>
        </div>
      </div>

      {/* Custom Date Range Inputs */}
      {datePreset === "custom" && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              max={formatDateForInput(new Date())}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              max={formatDateForInput(new Date())}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          label="Total Actions"
          value={analytics.summary.total_actions}
          icon="📊"
          color="blue"
        />
        <MetricCard
          label="Approval Rate"
          value={`${analytics.summary.approval_rate}%`}
          icon="✅"
          color="green"
        />
        <MetricCard
          label="Flag Rate"
          value={`${analytics.summary.flag_rate}%`}
          icon="🚩"
          color="yellow"
        />
        <MetricCard
          label="Queue Size"
          value={analytics.summary.queue_size}
          icon="📋"
          color="purple"
          description="Pending recommendations"
        />
        <MetricCard
          label="Avg Processing Time"
          value={`${analytics.summary.avg_processing_time_minutes.toFixed(1)} min`}
          icon="⏱️"
          color="gray"
        />
        <MetricCard
          label="Recommendations Generated"
          value={analytics.summary.recommendations_generated}
          icon="✨"
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions by Type */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions by Type
          </h2>
          <SimpleBarChart data={actionsByTypeData} orientation="horizontal" />
        </div>

        {/* Top Operators */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Operators (by activity)
          </h2>
          <SimpleBarChart data={operatorData} orientation="horizontal" />
        </div>
      </div>

      {/* Actions Over Time */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actions Over Time
        </h2>
        <SimpleLineChart series={timelineSeries} height={300} />
      </div>

      {/* Approval Rate by Persona */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Approval Rate by Persona
        </h2>
        <SimpleBarChart
          data={personaData}
          orientation="vertical"
          height="250px"
        />
      </div>

      {/* Operator Activity Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Operator Activity Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operator ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approvals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rejections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modifications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.operator_activity.map((operator) => (
                <tr key={operator.operator_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {operator.operator_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {operator.total_actions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {operator.approvals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {operator.rejections}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                    {operator.modifications}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                    {operator.flags}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
