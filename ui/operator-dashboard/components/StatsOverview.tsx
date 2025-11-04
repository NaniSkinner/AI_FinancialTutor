"use client";

import React from "react";
import { useOperatorStats } from "@/hooks/useOperatorStats";
import { Spinner } from "@/components/Common/Spinner";

export function StatsOverview() {
  const { data: stats, isLoading, error } = useOperatorStats();

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
      <h2 className="text-lg font-semibold text-gray-900">Overview</h2>

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
