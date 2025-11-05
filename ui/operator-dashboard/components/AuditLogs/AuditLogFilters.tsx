"use client";

import { useState, useEffect } from "react";
import { Select } from "@/components/Common/Select";
import { Button } from "@/components/Common/Button";
import type { AuditLogFilters as FilterType } from "@/hooks/useAuditLogs";
import { exportAuditLogsToCsv } from "@/lib/export";

interface AuditLogFiltersProps {
  onFilterChange: (filters: FilterType) => void;
}

export function AuditLogFilters({ onFilterChange }: AuditLogFiltersProps) {
  const [operatorId, setOperatorId] = useState<string>("");
  const [action, setAction] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [recommendationId, setRecommendationId] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Trigger filter change whenever any filter updates
  useEffect(() => {
    const filters: FilterType = {};

    if (operatorId) filters.operator_id = operatorId;
    if (action && action !== "all")
      filters.action = action as FilterType["action"];
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    if (recommendationId) filters.recommendation_id = recommendationId;

    onFilterChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatorId, action, startDate, endDate, recommendationId]);

  // Quick filter helpers
  const setToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  };

  const setThisWeek = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    setStartDate(weekAgo.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  const setThisMonth = () => {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);
    setStartDate(monthAgo.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  const resetFilters = () => {
    setOperatorId("");
    setAction("all");
    setStartDate("");
    setEndDate("");
    setRecommendationId("");
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filters: FilterType = {};
      if (operatorId) filters.operator_id = operatorId;
      if (action && action !== "all")
        filters.action = action as FilterType["action"];
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (recommendationId) filters.recommendation_id = recommendationId;

      await exportAuditLogsToCsv(filters);

      // Success feedback (could be replaced with toast notification)
      alert("Audit logs exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to export audit logs. Please try again."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Operator Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operator
          </label>
          <input
            type="text"
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
            placeholder="op_001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Action Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action Type
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Actions</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="modify">Modify</option>
            <option value="flag">Flag</option>
            <option value="bulk_approve">Bulk Approve</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Recommendation ID Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recommendation ID
          </label>
          <input
            type="text"
            value={recommendationId}
            onChange={(e) => setRecommendationId(e.target.value)}
            placeholder="rec_..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
        <span className="text-sm font-medium text-gray-700">Quick:</span>
        <Button variant="outline" size="sm" onClick={setToday}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={setThisWeek}>
          This Week
        </Button>
        <Button variant="outline" size="sm" onClick={setThisMonth}>
          This Month
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
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
              Exporting...
            </>
          ) : (
            <>
              <svg
                className="mr-2 h-4 w-4"
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
              Export to CSV
            </>
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
