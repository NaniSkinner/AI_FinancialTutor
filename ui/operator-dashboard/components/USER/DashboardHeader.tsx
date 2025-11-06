"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Settings, User, LogOut, Shield } from "lucide-react";
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">$</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">SpendSense</h1>
            </div>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Your Financial Learning Hub
            </span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => router.push("/notifications")}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {getInitials(userName)}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
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
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/settings");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/consent");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Privacy & Consent
                    </button>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Operator Dashboard
                    </button>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Handle logout
                        console.log("Logout clicked");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
