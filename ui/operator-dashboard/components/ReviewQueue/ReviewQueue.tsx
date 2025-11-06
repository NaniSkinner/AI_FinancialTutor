"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { RecommendationCard } from "./RecommendationCard";
import { FilterPanel } from "./FilterPanel";
import { BulkActions } from "./BulkActions";
import { EmptyState } from "@/components/Common/EmptyState";
import { Spinner } from "@/components/Common/Spinner";
import { Button } from "@/components/Common/Button";
import { bulkApproveRecommendations } from "@/lib/api";
import { exportRecommendationsToCsv } from "@/lib/export";

/**
 * ReviewQueue component - Main interface for reviewing AI-generated recommendations
 * Features:
 * - Filter by persona, priority, and status
 * - Bulk selection and bulk approve
 * - Individual recommendation actions (approve, reject, modify, flag)
 * - Auto-refresh every 30 seconds
 */
export function ReviewQueue() {
  // Performance monitoring
  usePerformanceMonitoring("ReviewQueue");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    persona: "all",
    priority: "all",
    status: "pending",
  });

  const {
    data: recommendations,
    isLoading,
    error,
    mutate,
  } = useRecommendations(filters);

  // ============================================================================
  // SELECTION HANDLERS (Memoized for performance)
  // ============================================================================

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === recommendations?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(recommendations?.map((r) => r.id) || []);
    }
  }, [selectedIds.length, recommendations]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  // Memoize filtered/processed recommendations
  const processedRecommendations = useMemo(() => {
    if (!recommendations) return [];

    // Additional client-side filtering can go here if needed
    // For now, just return the recommendations as-is
    return recommendations;
  }, [recommendations]);

  // ============================================================================
  // BULK APPROVE HANDLER (Memoized)
  // ============================================================================

  const handleBulkApprove = useCallback(async () => {
    try {
      await bulkApproveRecommendations({
        recommendation_ids: selectedIds,
        notes: "",
      });
      setSelectedIds([]);
      mutate(); // Refresh the list
    } catch (error) {
      console.error("Bulk approve failed:", error);
      // TODO: Show error toast instead of console.error
    }
  }, [selectedIds, mutate]);

  // ============================================================================
  // EXPORT HANDLER (Memoized)
  // ============================================================================

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportRecommendationsToCsv(filters);
      alert("Recommendations exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to export recommendations. Please try again."
      );
    } finally {
      setIsExporting(false);
    }
  }, [filters]);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useKeyboardShortcuts({
    onSelectAll: handleSelectAll,
    onClearSelection: () => setSelectedIds([]),
    onNext: () => {
      if (recommendations && focusedIndex < recommendations.length - 1) {
        setFocusedIndex(focusedIndex + 1);
      }
    },
    onPrevious: () => {
      if (focusedIndex > 0) {
        setFocusedIndex(focusedIndex - 1);
      }
    },
    onToggleSelection: () => {
      if (recommendations && recommendations[focusedIndex]) {
        handleToggleSelect(recommendations[focusedIndex].id);
      }
    },
  });

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Failed to load recommendations. Please try again.
        </p>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Review Queue</h2>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {recommendations?.length || 0} pending recommendation
            {recommendations?.length !== 1 ? "s" : ""}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={
              isExporting || !recommendations || recommendations.length === 0
            }
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
        </div>
      </div>

      {/* Filters */}
      <FilterPanel filters={filters} onFiltersChange={setFilters} />

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <BulkActions
          selectedCount={selectedIds.length}
          selectedIds={selectedIds}
          onClearSelection={() => setSelectedIds([])}
          onBulkApprove={handleBulkApprove}
        />
      )}

      {/* Select All Checkbox */}
      {recommendations && recommendations.length > 0 && (
        <div className="flex items-center gap-2 py-2 px-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="select-all"
            checked={selectedIds.length === recommendations.length}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label
            htmlFor="select-all"
            className="text-sm text-gray-700 cursor-pointer"
          >
            Select all ({recommendations.length})
          </label>
        </div>
      )}

      {/* Recommendation Cards */}
      <div className="space-y-4">
        {recommendations?.length === 0 ? (
          <EmptyState
            title="No pending recommendations"
            description="Great work! The queue is empty."
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            }
          />
        ) : (
          processedRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              isSelected={selectedIds.includes(recommendation.id)}
              onToggleSelect={() => handleToggleSelect(recommendation.id)}
              onAction={mutate}
            />
          ))
        )}
      </div>
    </div>
  );
}
