import React from "react";
import { useDecisionTrace } from "@/hooks/useDecisionTrace";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { TraceStep } from "./TraceStep";
import { Spinner } from "@/components/Common/Spinner";

interface Props {
  recommendationId: string;
}

export function DecisionTraces({ recommendationId }: Props) {
  // Performance monitoring
  usePerformanceMonitoring("DecisionTraces");

  const { data: trace, isLoading, error } = useDecisionTrace(recommendationId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2" role="status" aria-live="polite">
        <Spinner size="sm" />
        <span className="text-sm text-gray-500">Loading trace...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600" role="alert" aria-live="assertive">
        Failed to load decision trace
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="text-sm text-gray-500" role="status">
        No trace available
      </div>
    );
  }

  // Calculate durations between steps
  const calculateDuration = (start: string, end: string): number => {
    return new Date(end).getTime() - new Date(start).getTime();
  };

  const signalsDuration = calculateDuration(
    trace.signals_detected_at,
    trace.persona_assigned_at
  );
  const personaDuration = calculateDuration(
    trace.persona_assigned_at,
    trace.content_matched_at
  );
  const contentDuration = calculateDuration(
    trace.content_matched_at,
    trace.rationale_generated_at
  );
  const rationaleDuration = calculateDuration(
    trace.rationale_generated_at,
    trace.guardrails_checked_at
  );
  const guardrailsDuration = calculateDuration(
    trace.guardrails_checked_at,
    trace.created_at
  );

  return (
    <div
      className="space-y-4"
      role="region"
      aria-label="Decision trace details"
    >
      <h4 className="text-sm font-medium text-gray-900">Decision Trace</h4>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Trace Steps */}
        <div className="space-y-6">
          <TraceStep
            title="Signals Detected"
            timestamp={trace.signals_detected_at}
            status="completed"
            duration_ms={signalsDuration}
            data={{
              subscription_signals: trace.signals.subscriptions,
              credit_signals: trace.signals.credit,
              savings_signals: trace.signals.savings,
              income_signals: trace.signals.income,
            }}
          />

          <TraceStep
            title="Persona Assigned"
            timestamp={trace.persona_assigned_at}
            status="completed"
            duration_ms={personaDuration}
            data={{
              primary_persona: trace.persona_assignment.primary_persona,
              match_strength: trace.persona_assignment.primary_match_strength,
              criteria_met: trace.persona_assignment.criteria_met,
            }}
          />

          <TraceStep
            title="Content Matched"
            timestamp={trace.content_matched_at}
            status="completed"
            duration_ms={contentDuration}
            data={{
              matched_content: trace.content_matches,
              relevance_scores: trace.relevance_scores,
            }}
          />

          <TraceStep
            title="Rationale Generated"
            timestamp={trace.rationale_generated_at}
            status="completed"
            duration_ms={rationaleDuration}
            data={{
              rationale: trace.rationale,
              llm_model: trace.llm_model,
              temperature: trace.temperature,
              tokens_used: trace.tokens_used,
            }}
          />

          <TraceStep
            title="Guardrail Checks"
            timestamp={trace.guardrails_checked_at}
            status={trace.guardrails_passed ? "completed" : "warning"}
            duration_ms={guardrailsDuration}
            data={{
              tone_check: trace.tone_check,
              advice_check: trace.advice_check,
              eligibility_check: trace.eligibility_check,
              all_passed: trace.guardrails_passed,
            }}
          />

          <TraceStep
            title="Recommendation Created"
            timestamp={trace.created_at}
            status="completed"
            data={{
              recommendation_id: trace.recommendation_id,
              priority: trace.priority,
              type: trace.type,
            }}
          />
        </div>
      </div>
    </div>
  );
}
