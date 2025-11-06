// User Explorer Component
// Main component for exploring user behavioral signals and persona history

import React, { useState } from "react";
import { UserSearch } from "./UserSearch";
import { SignalCard } from "./SignalCard";
import { PersonaTimeline } from "./PersonaTimeline";
import { useUserSignals } from "@/hooks/useUserSignals";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { Spinner } from "@/components/Common/Spinner";
import { Badge } from "@/components/Common/Badge";
import { getPersonaColor, formatPersonaName } from "@/lib/utils";

export function UserExplorer() {
  // Performance monitoring
  usePerformanceMonitoring("UserExplorer");

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: userData, isLoading, error } = useUserSignals(selectedUserId);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        User Signal Explorer
      </h2>

      {/* Search */}
      <UserSearch onUserSelect={setSelectedUserId} />

      {/* User Details */}
      {selectedUserId && (
        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <Spinner size="lg" />
              <p className="text-gray-500 mt-2">Loading user data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Failed to load user data. Please try again.
              </p>
            </div>
          ) : userData ? (
            <>
              {/* User Info Header */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {userData.user_id}
                  </h3>
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-4 flex-wrap">
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="font-medium">Primary Persona:</span>
                    <Badge
                      className={getPersonaColor(userData.persona_30d.primary)}
                    >
                      {formatPersonaName(userData.persona_30d.primary)}
                    </Badge>
                  </div>

                  {userData.persona_30d.secondary && (
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="font-medium">Secondary:</span>
                      <Badge
                        className={getPersonaColor(
                          userData.persona_30d.secondary
                        )}
                      >
                        {formatPersonaName(userData.persona_30d.secondary)}
                      </Badge>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Match Strength: </span>
                    <span className="font-semibold text-gray-900">
                      {(userData.persona_30d.match_strength * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Window: </span>
                    30 days
                  </div>
                </div>
              </div>

              {/* Signals Grid */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Behavioral Signals
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SignalCard
                    title="Credit Utilization"
                    data={userData.signals.credit}
                    type="credit"
                  />
                  <SignalCard
                    title="Subscriptions"
                    data={userData.signals.subscriptions}
                    type="subscriptions"
                  />
                  <SignalCard
                    title="Savings"
                    data={userData.signals.savings}
                    type="savings"
                  />
                  <SignalCard
                    title="Income Stability"
                    data={userData.signals.income}
                    type="income"
                  />
                </div>
              </div>

              {/* Persona History Timeline */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Persona History (180 days)
                </h4>
                <PersonaTimeline userId={selectedUserId} />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">User not found</div>
          )}
        </div>
      )}
    </div>
  );
}
