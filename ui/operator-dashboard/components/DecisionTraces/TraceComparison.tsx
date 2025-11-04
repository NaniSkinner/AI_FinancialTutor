"use client";

import React, { useState } from "react";
import { useDecisionTrace } from "@/hooks/useDecisionTrace";
import { TraceStep } from "./TraceStep";
import { Spinner } from "@/components/Common/Spinner";
import { Button } from "@/components/Common/Button";

interface Props {
  recommendationId1: string;
  recommendationId2: string;
}

/**
 * TraceComparison component - Side-by-side trace comparison
 * Compares two decision traces to highlight differences
 */
export function TraceComparison({
  recommendationId1,
  recommendationId2,
}: Props) {
  const {
    data: trace1,
    isLoading: loading1,
    error: error1,
  } = useDecisionTrace(recommendationId1);
  const {
    data: trace2,
    isLoading: loading2,
    error: error2,
  } = useDecisionTrace(recommendationId2);

  if (loading1 || loading2) {
    return (
      <div
        className="flex items-center gap-2 justify-center p-8"
        role="status"
        aria-live="polite"
      >
        <Spinner size="sm" />
        <span className="text-sm text-gray-500">Loading traces...</span>
      </div>
    );
  }

  if (error1 || error2) {
    return (
      <div className="text-sm text-red-600 p-4" role="alert">
        Failed to load one or both traces
      </div>
    );
  }

  if (!trace1 || !trace2) {
    return (
      <div className="text-sm text-gray-500 p-4">
        One or both traces unavailable
      </div>
    );
  }

  // Calculate durations
  const calculateDuration = (start: string, end: string): number => {
    return new Date(end).getTime() - new Date(start).getTime();
  };

  const getDurations = (trace: typeof trace1) => ({
    signals: calculateDuration(
      trace.signals_detected_at,
      trace.persona_assigned_at
    ),
    persona: calculateDuration(
      trace.persona_assigned_at,
      trace.content_matched_at
    ),
    content: calculateDuration(
      trace.content_matched_at,
      trace.rationale_generated_at
    ),
    rationale: calculateDuration(
      trace.rationale_generated_at,
      trace.guardrails_checked_at
    ),
    guardrails: calculateDuration(
      trace.guardrails_checked_at,
      trace.created_at
    ),
  });

  const durations1 = getDurations(trace1);
  const durations2 = getDurations(trace2);

  // Check for differences
  const personaDifferent =
    trace1.persona_assignment.primary_persona !==
    trace2.persona_assignment.primary_persona;
  const priorityDifferent = trace1.priority !== trace2.priority;
  const guardrailsDifferent =
    trace1.guardrails_passed !== trace2.guardrails_passed;

  return (
    <div className="space-y-4">
      {/* Header with diff summary */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Trace Comparison
        </h3>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-gray-600">Trace 1:</span>
            <span className="font-medium ml-1">{recommendationId1}</span>
          </div>
          <div>
            <span className="text-gray-600">Trace 2:</span>
            <span className="font-medium ml-1">{recommendationId2}</span>
          </div>
        </div>

        {/* Differences highlight */}
        {(personaDifferent || priorityDifferent || guardrailsDifferent) && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Key Differences:
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              {personaDifferent && (
                <div>
                  • Persona: {trace1.persona_assignment.primary_persona} vs{" "}
                  {trace2.persona_assignment.primary_persona}
                </div>
              )}
              {priorityDifferent && (
                <div>
                  • Priority: {trace1.priority} vs {trace2.priority}
                </div>
              )}
              {guardrailsDifferent && (
                <div>
                  • Guardrails: {trace1.guardrails_passed ? "Passed" : "Failed"}{" "}
                  vs {trace2.guardrails_passed ? "Passed" : "Failed"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* Trace 1 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border-2 border-indigo-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Trace 1: {recommendationId1}
            </h4>
            <div className="space-y-6">
              <TraceStep
                title="Persona Assigned"
                timestamp={trace1.persona_assigned_at}
                status="completed"
                duration_ms={durations1.persona}
                data={{
                  primary_persona: trace1.persona_assignment.primary_persona,
                  match_strength:
                    trace1.persona_assignment.primary_match_strength,
                  criteria_met: trace1.persona_assignment.criteria_met,
                }}
              />
              <TraceStep
                title="Guardrail Checks"
                timestamp={trace1.guardrails_checked_at}
                status={trace1.guardrails_passed ? "completed" : "warning"}
                duration_ms={durations1.guardrails}
                data={{
                  tone_check: trace1.tone_check,
                  advice_check: trace1.advice_check,
                  eligibility_check: trace1.eligibility_check,
                  all_passed: trace1.guardrails_passed,
                }}
              />
              <TraceStep
                title="Recommendation Created"
                timestamp={trace1.created_at}
                status="completed"
                data={{
                  recommendation_id: trace1.recommendation_id,
                  priority: trace1.priority,
                  type: trace1.type,
                }}
              />
            </div>
          </div>
        </div>

        {/* Trace 2 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border-2 border-purple-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Trace 2: {recommendationId2}
            </h4>
            <div className="space-y-6">
              <TraceStep
                title="Persona Assigned"
                timestamp={trace2.persona_assigned_at}
                status="completed"
                duration_ms={durations2.persona}
                data={{
                  primary_persona: trace2.persona_assignment.primary_persona,
                  match_strength:
                    trace2.persona_assignment.primary_match_strength,
                  criteria_met: trace2.persona_assignment.criteria_met,
                }}
              />
              <TraceStep
                title="Guardrail Checks"
                timestamp={trace2.guardrails_checked_at}
                status={trace2.guardrails_passed ? "completed" : "warning"}
                duration_ms={durations2.guardrails}
                data={{
                  tone_check: trace2.tone_check,
                  advice_check: trace2.advice_check,
                  eligibility_check: trace2.eligibility_check,
                  all_passed: trace2.guardrails_passed,
                }}
              />
              <TraceStep
                title="Recommendation Created"
                timestamp={trace2.created_at}
                status="completed"
                data={{
                  recommendation_id: trace2.recommendation_id,
                  priority: trace2.priority,
                  type: trace2.type,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * TraceComparisonWrapper - Component with input fields to select traces to compare
 */
export function TraceComparisonWrapper() {
  const [id1, setId1] = useState("");
  const [id2, setId2] = useState("");
  const [comparing, setComparing] = useState(false);

  const handleCompare = () => {
    if (id1.trim() && id2.trim()) {
      setComparing(true);
    }
  };

  if (comparing && id1 && id2) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => setComparing(false)}
          variant="ghost"
          className="mb-4"
        >
          ← Back to Selection
        </Button>
        <TraceComparison recommendationId1={id1} recommendationId2={id2} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Compare Decision Traces
      </h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="trace1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            First Trace ID
          </label>
          <input
            id="trace1"
            type="text"
            value={id1}
            onChange={(e) => setId1(e.target.value)}
            placeholder="e.g., rec_001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="trace2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Second Trace ID
          </label>
          <input
            id="trace2"
            type="text"
            value={id2}
            onChange={(e) => setId2(e.target.value)}
            placeholder="e.g., rec_002"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <Button
          onClick={handleCompare}
          disabled={!id1.trim() || !id2.trim()}
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Compare Traces
        </Button>
      </div>
    </div>
  );
}
