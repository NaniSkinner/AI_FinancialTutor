"use client";

import React, { useState } from "react";
import {
  TraceSearch,
  TraceComparisonWrapper,
  TraceHistoryWrapper,
} from "@/components/DecisionTraces";

type ViewMode = "search" | "comparison" | "history";

/**
 * Advanced Traces Page
 * Showcases all Phase 18 features: Search, Comparison, and History
 */
export default function AdvancedTracesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("search");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Advanced Decision Traces
          </h1>
          <p className="text-gray-600 mt-2">
            Search, compare, and analyze decision traces with advanced tools
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex gap-1">
          <button
            onClick={() => setViewMode("search")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "search"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            🔍 Search Traces
          </button>
          <button
            onClick={() => setViewMode("comparison")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "comparison"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            ⚖️ Compare Traces
          </button>
          <button
            onClick={() => setViewMode("history")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "history"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            📊 User History
          </button>
        </div>

        {/* Content */}
        <div className="transition-all">
          {viewMode === "search" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  🔍 Trace Search
                </h3>
                <p className="text-sm text-blue-700">
                  Quickly lookup any trace by recommendation ID without
                  navigating through the review queue.
                </p>
              </div>
              <TraceSearch />
            </div>
          )}

          {viewMode === "comparison" && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-purple-900 mb-1">
                  ⚖️ Trace Comparison
                </h3>
                <p className="text-sm text-purple-700">
                  Compare two traces side-by-side to understand why different
                  recommendations were made.
                </p>
              </div>
              <TraceComparisonWrapper />
            </div>
          )}

          {viewMode === "history" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-900 mb-1">
                  📊 User Trace History
                </h3>
                <p className="text-sm text-green-700">
                  View all traces for a user over time and track persona
                  transitions and recommendation patterns.
                </p>
              </div>
              <TraceHistoryWrapper />
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            💡 Quick Test IDs
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white p-2 rounded border border-gray-200">
              <span className="font-medium">rec_001</span>
              <span className="text-gray-600"> - High utilization</span>
            </div>
            <div className="bg-white p-2 rounded border border-gray-200">
              <span className="font-medium">rec_002</span>
              <span className="text-gray-600"> - Subscription heavy</span>
            </div>
            <div className="bg-white p-2 rounded border border-gray-200">
              <span className="font-medium">rec_003</span>
              <span className="text-gray-600"> - Savings builder</span>
            </div>
            <div className="bg-white p-2 rounded border border-gray-200">
              <span className="font-medium">rec_006</span>
              <span className="text-gray-600"> - Guardrail warning</span>
            </div>
            <div className="bg-white p-2 rounded border border-gray-200">
              <span className="font-medium">user_123</span>
              <span className="text-gray-600"> - Sample user</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            ⚡ Performance Metrics
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            All traces now show processing time for each step with color-coded
            performance indicators:
          </p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-medium">&lt;500ms</span>
              <span className="text-gray-600">Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 font-medium">500-1000ms</span>
              <span className="text-gray-600">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-medium">&gt;1000ms</span>
              <span className="text-gray-600">Slow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
