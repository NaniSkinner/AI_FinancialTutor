"use client";

import React, { useState } from "react";
import { ReviewQueue } from "@/components/ReviewQueue/ReviewQueue";
import { AlertPanel } from "@/components/AlertPanel/AlertPanel";
import { StatsOverview } from "@/components/StatsOverview";
import { UserExplorer } from "@/components/UserExplorer";
import { KeyboardShortcutsLegend } from "@/components/KeyboardShortcutsLegend";

type TabType = "review" | "explorer";

export default function OperatorDashboard() {
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  const [activeTab, setActiveTab] = useState<TabType>("review");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                SpendSense Operator View
              </h1>
              {useMockData && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Mock Data
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Navigation Links */}
              <a
                href="/audit-logs"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <span>📋</span>
                <span>Audit Logs</span>
              </a>

              {/* Quick Stats */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">Pending: </span>
                <span className="text-orange-600 font-bold">23</span>
              </div>

              {/* Operator Info */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  JD
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Jane Doe
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      <AlertPanel />

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("review")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "review"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Review Queue
            </button>
            <button
              onClick={() => setActiveTab("explorer")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "explorer"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              User Explorer
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "review" ? (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Stats */}
            <div className="col-span-3">
              <StatsOverview />
            </div>

            {/* Main Content - Review Queue */}
            <div className="col-span-9">
              <ReviewQueue />
            </div>
          </div>
        ) : (
          <div>
            {/* User Explorer View */}
            <UserExplorer />
          </div>
        )}
      </main>

      {/* Keyboard Shortcuts Legend */}
      <KeyboardShortcutsLegend />
    </div>
  );
}
