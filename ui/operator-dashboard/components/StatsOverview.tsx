"use client";

import React, { useState } from "react";
import {
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
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
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load stats
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Overview
        </h2>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          title="Export stats to CSV"
        >
          {isExporting ? (
            <Spinner size="sm" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Pending Recommendations */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Pending Review
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats?.pending || 0}
            </div>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Approved Today */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Approved Today
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats?.approved_today || 0}
            </div>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Rejected Today */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Rejected Today
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats?.rejected_today || 0}
            </div>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Flagged Items */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Flagged Items
            </div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats?.flagged || 0}
            </div>
          </div>
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Average Review Time */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Avg Review Time
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.avg_review_time_seconds || 0}
              <span className="text-xl">s</span>
            </div>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
