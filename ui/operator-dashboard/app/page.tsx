"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewQueue } from "@/components/ReviewQueue/ReviewQueue";
import { AlertPanel } from "@/components/AlertPanel/AlertPanel";
import { StatsOverview } from "@/components/StatsOverview";
import { UserExplorer } from "@/components/UserExplorer";
import { KeyboardShortcutsLegend } from "@/components/KeyboardShortcutsLegend";
import { ChatWidget } from "@/components/ChatWidget";
import { useAuth } from "@/lib/auth";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

type TabType = "review" | "explorer";

export default function OperatorDashboard() {
  // Performance monitoring
  usePerformanceMonitoring("OperatorDashboard");

  // Real-time updates
  useRealtimeUpdates();

  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  const [activeTab, setActiveTab] = useState<TabType>("review");
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const { operator, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logout();
      router.push("/login");
    }
  };

  // Get initials from operator name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
              {!useMockData && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                  Live
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
              <a
                href="/analytics"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <span>📊</span>
                <span>Analytics</span>
              </a>
              <a
                href="/calculators"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <span>🧮</span>
                <span>Calculators</span>
              </a>

              {/* Quick Stats */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">Pending: </span>
                <span className="text-orange-600 font-bold">23</span>
              </div>

              {/* Operator Info */}
              <div className="relative">
                <button
                  onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                  className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {operator ? getInitials(operator.name) : "OP"}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-700">
                      {operator?.name || "Operator"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {operator?.role || "user"}
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showLogoutMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {operator?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Log out
                    </button>
                  </div>
                )}
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

      {/* Chat Widget - Operator Mode */}
      <ChatWidget userId="demo_operator" persona="general" mode="operator" />
    </div>
  );
}
