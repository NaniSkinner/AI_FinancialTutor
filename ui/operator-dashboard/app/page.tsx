"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  LogOut,
  ChevronDown,
  ClipboardList,
  Calculator,
} from "lucide-react";
import { ReviewQueue } from "@/components/ReviewQueue/ReviewQueue";
import { AlertPanel } from "@/components/AlertPanel/AlertPanel";
import { StatsOverview } from "@/components/StatsOverview";
import { UserExplorer } from "@/components/UserExplorer";
import { KeyboardShortcutsLegend } from "@/components/KeyboardShortcutsLegend";
import { ChatWidget } from "@/components/ChatWidget";
import { ThemeToggle } from "@/components/Common/ThemeToggle";
import { LogoCompact } from "@/components/Common/Logo";
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
    <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <LogoCompact />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Operator
                  </span>
                  {useMockData && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full whitespace-nowrap">
                      Mock Data
                    </span>
                  )}
                  {!useMockData && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full whitespace-nowrap">
                      <span className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Navigation Links */}
              <a
                href="/audit-logs"
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 flex items-center gap-2"
                title="Audit Logs"
              >
                <ClipboardList className="h-5 w-5" />
                <span className="text-sm font-medium hidden lg:inline">
                  Audit Logs
                </span>
              </a>
              <a
                href="/analytics"
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 flex items-center gap-2"
                title="Analytics"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm font-medium hidden lg:inline">
                  Analytics
                </span>
              </a>
              <a
                href="/calculators"
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 flex items-center gap-2"
                title="Calculators"
              >
                <Calculator className="h-5 w-5" />
                <span className="text-sm font-medium hidden lg:inline">
                  Calculators
                </span>
              </a>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Quick Stats */}
              <div className="px-3 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Pending:{" "}
                </span>
                <span className="text-sm text-orange-600 dark:text-orange-400 font-bold">
                  23
                </span>
              </div>

              {/* Operator Info */}
              <div className="relative">
                <button
                  onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                  className="flex items-center gap-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-3 py-2 transition-all duration-200"
                >
                  <div className="w-9 h-9 bg-indigo-600 dark:from-indigo-500 dark:to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md ring-2 ring-gray-200 dark:ring-gray-700">
                    {operator ? getInitials(operator.name) : "OP"}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {operator?.name || "Operator"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {operator?.role || "user"}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showLogoutMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowLogoutMenu(false)}
                    />
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Signed in as
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mt-1">
                          {operator?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowLogoutMenu(false);
                          router.push("/dashboard");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 rounded-lg mx-1 mt-1"
                      >
                        <Users className="w-4 h-4" />
                        User Dashboard
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 rounded-lg mx-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      <AlertPanel />

      {/* Tab Navigation - Segmented Control Style */}
      <div className="bg-white dark:bg-card border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setActiveTab("review")}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === "review"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <span>📝</span>
              Review Queue
            </button>
            <button
              onClick={() => setActiveTab("explorer")}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === "explorer"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Users className="h-4 w-4" />
              User Explorer
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "review" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Stats */}
            <div className="lg:col-span-3">
              <StatsOverview />
            </div>

            {/* Main Content - Review Queue */}
            <div className="lg:col-span-9">
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
