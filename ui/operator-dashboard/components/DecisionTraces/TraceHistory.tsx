"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Spinner } from "@/components/Common/Spinner";
import { Button } from "@/components/Common/Button";
import { formatDate } from "@/lib/utils";

interface TraceHistoryEntry {
  recommendation_id: string;
  created_at: string;
  persona: string;
  priority: string;
  type: string;
  guardrails_passed: boolean;
}

interface Props {
  userId: string;
}

/**
 * TraceHistory component - Shows all traces for a user over time
 * Visualizes persona changes and recommendation patterns
 */
export function TraceHistory({ userId }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Mock data fetcher - replace with real API call
  const fetchUserTraces = async (
    userId: string
  ): Promise<TraceHistoryEntry[]> => {
    // Mock implementation - in production, call:
    // return apiRequest(`/api/operator/users/${userId}/traces`);

    // For now, return mock data
    return [
      {
        recommendation_id: "rec_001",
        created_at: "2025-11-04T09:30:00Z",
        persona: "high_utilization",
        priority: "high",
        type: "educational_content",
        guardrails_passed: true,
      },
      {
        recommendation_id: "rec_005",
        created_at: "2025-10-15T14:20:00Z",
        persona: "high_utilization",
        priority: "high",
        type: "educational_content",
        guardrails_passed: true,
      },
      {
        recommendation_id: "rec_012",
        created_at: "2025-09-20T11:45:00Z",
        persona: "subscription_heavy",
        priority: "medium",
        type: "tool",
        guardrails_passed: true,
      },
      {
        recommendation_id: "rec_018",
        created_at: "2025-08-10T08:30:00Z",
        persona: "subscription_heavy",
        priority: "medium",
        type: "educational_content",
        guardrails_passed: true,
      },
    ];
  };

  const {
    data: traces,
    isLoading,
    error,
  } = useSWR(userId ? `/api/operator/users/${userId}/traces` : null, () =>
    fetchUserTraces(userId)
  );

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 justify-center p-8"
        role="status"
        aria-live="polite"
      >
        <Spinner size="sm" />
        <span className="text-sm text-gray-500">Loading trace history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 p-4" role="alert">
        Failed to load trace history
      </div>
    );
  }

  if (!traces || traces.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-4">
        No trace history available for this user
      </div>
    );
  }

  // Detect persona transitions
  const personaTransitions: Array<{ from: string; to: string; date: string }> =
    [];
  for (let i = 0; i < traces.length - 1; i++) {
    if (traces[i].persona !== traces[i + 1].persona) {
      personaTransitions.push({
        from: traces[i + 1].persona,
        to: traces[i].persona,
        date: traces[i].created_at,
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Trace History for User: {userId}
        </h3>
        <div className="text-sm text-gray-600">
          {traces.length} recommendations • {personaTransitions.length} persona
          {personaTransitions.length === 1 ? " transition" : " transitions"}
        </div>
      </div>

      {/* Persona Transitions */}
      {personaTransitions.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            🎯 Persona Transitions
          </h4>
          <div className="space-y-2">
            {personaTransitions.map((transition, i) => (
              <div key={i} className="text-sm text-gray-700">
                <span className="font-medium">
                  {formatDate(transition.date)}:
                </span>{" "}
                {transition.from.replace(/_/g, " ")} →{" "}
                {transition.to.replace(/_/g, " ")}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">
            Recommendation Timeline
          </h4>
        </div>

        <div className="divide-y divide-gray-200">
          {traces.map((trace) => (
            <div key={trace.recommendation_id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {trace.recommendation_id}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        trace.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : trace.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {trace.priority}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                      {trace.persona.replace(/_/g, " ")}
                    </span>
                    {!trace.guardrails_passed && (
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded">
                        ⚠️ Guardrail Warning
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatDate(trace.created_at)} • {trace.type}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpandedId(
                      expandedId === trace.recommendation_id
                        ? null
                        : trace.recommendation_id
                    )
                  }
                >
                  {expandedId === trace.recommendation_id
                    ? "Hide Details"
                    : "View Trace"}
                </Button>
              </div>

              {expandedId === trace.recommendation_id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm text-indigo-600">
                    Full trace view would load here (integrate DecisionTraces
                    component)
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * TraceHistoryWrapper - Component with input field to select user
 */
export function TraceHistoryWrapper() {
  const [userId, setUserId] = useState("");
  const [viewing, setViewing] = useState(false);

  const handleView = () => {
    if (userId.trim()) {
      setViewing(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleView();
    }
  };

  if (viewing && userId) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => setViewing(false)}
          variant="ghost"
          className="mb-4"
        >
          ← Back to Search
        </Button>
        <TraceHistory userId={userId} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        View User Trace History
      </h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            User ID
          </label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., user_123"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <Button
          onClick={handleView}
          disabled={!userId.trim()}
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
        >
          View History
        </Button>
      </div>
    </div>
  );
}
