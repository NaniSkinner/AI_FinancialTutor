"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Settings,
  User,
  LogOut,
  Shield,
  Calculator,
  Trophy,
} from "lucide-react";
import { ThemeToggle } from "@/components/Common/ThemeToggle";
import { Logo } from "@/components/Common/Logo";
import { getInitials } from "@/lib/utils";

interface DashboardHeaderProps {
  userName: string;
  avatarUrl?: string;
}

export function DashboardHeader({ userName, avatarUrl }: DashboardHeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationCount] = useState(2);

  return (
    <header className="bg-white dark:bg-card border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <Logo size="medium" showTagline={false} variant="dark" />
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              Your Financial Learning Hub
            </span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Tools/Calculators */}
            <button
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
              onClick={() => router.push("/dashboard/tools")}
              title="Financial Calculators"
            >
              <Calculator className="h-5 w-5" />
            </button>

            {/* Progress */}
            <button
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
              onClick={() => router.push("/progress")}
              title="Your Progress"
            >
              <Trophy className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button
              className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
              onClick={() => router.push("/notifications")}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-9 h-9 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-9 h-9 bg-indigo-600 dark:from-indigo-500 dark:to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-md">
                    {getInitials(userName)}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                  {userName}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/settings");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors rounded-lg mx-1"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/settings#privacy");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors rounded-lg mx-1"
                    >
                      <Shield className="h-4 w-4" />
                      Privacy & Consent
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors rounded-lg mx-1"
                    >
                      <User className="h-4 w-4" />
                      Operator Dashboard
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Handle logout
                        console.log("Logout clicked");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors rounded-lg mx-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
