"use client";

import React, { useState } from "react";
import { useOperatorStats } from "@/hooks/useOperatorStats";
import { Spinner } from "@/components/Common/Spinner";
import { exportStatsToCsv } from "@/lib/export";

export function StatsOverview() {
  const { data: stats, isLoading, error } = useOperatorStats();
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleExport = async () => {
    if (!stats) return;

    setIsExporting(true);
    try {
      await exportStatsToCsv(stats);
      alert("Stats exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export stats. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">Failed to load stats</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          title="Export stats to CSV"
        >
          {isExporting ? (
            <svg
              className="animate-spin h-3 w-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="h-3 w-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          )}
          <span>Export</span>
        </button>
      </div>

      {/* Pending Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Pending Review</div>
        <div className="text-3xl font-bold text-orange-600 mt-1">
          {stats?.pending || 0}
        </div>
      </div>

      {/* Approved Today */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Approved Today</div>
        <div className="text-3xl font-bold text-green-600 mt-1">
          {stats?.approved_today || 0}
        </div>
      </div>

      {/* Rejected Today */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Rejected Today</div>
        <div className="text-3xl font-bold text-red-600 mt-1">
          {stats?.rejected_today || 0}
        </div>
      </div>

      {/* Flagged Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Flagged Items</div>
        <div className="text-3xl font-bold text-yellow-600 mt-1">
          {stats?.flagged || 0}
        </div>
      </div>

      {/* Average Review Time */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Avg Review Time</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">
          {stats?.avg_review_time_seconds || 0}s
        </div>
      </div>
    </div>
  );
}
