import React, { useState, memo } from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { SignalStrengthIndicator } from "./SignalStrengthIndicator";
import { CriteriaMetList } from "./CriteriaMetList";
import { ContentMatchCard } from "./ContentMatchCard";

interface Props {
  title: string;
  timestamp: string;
  status: "completed" | "warning" | "error";
  data: any;
  duration_ms?: number; // Processing duration for this step
}

export const TraceStep = memo(function TraceStep({
  title,
  timestamp,
  status,
  data,
  duration_ms,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const getPerformanceColor = (ms?: number) => {
    if (!ms) return "";
    if (ms < 500) return "text-green-600";
    if (ms < 1000) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceLabel = (ms?: number) => {
    if (!ms) return "";
    if (ms < 500) return "Fast";
    if (ms < 1000) return "Moderate";
    return "Slow";
  };

  const getStatusIcon = () => {
    const iconClass = "h-5 w-5";
    switch (status) {
      case "completed":
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case "warning":
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
      case "error":
        return <XCircle className={`${iconClass} text-red-600`} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
    }
  };

  const renderDataSummary = () => {
    // Custom rendering based on step type
    if (title === "Signals Detected") {
      const signalCount = data ? Object.keys(data).length : 0;
      return (
        <div className="text-sm text-gray-700">
          {signalCount} signal categories detected
        </div>
      );
    }

    if (title === "Persona Assigned") {
      if (!data?.primary_persona) {
        return <div className="text-sm text-gray-500">No persona assigned</div>;
      }
      const matchPercent = data.match_strength
        ? (data.match_strength * 100).toFixed(0)
        : 0;
      return (
        <div className="text-sm text-gray-700">
          <strong>{data.primary_persona}</strong> ({matchPercent}% match)
        </div>
      );
    }

    if (title === "Content Matched") {
      return (
        <div className="text-sm text-gray-700">
          {data?.matched_content?.length || 0} content items matched
        </div>
      );
    }

    if (title === "Rationale Generated") {
      return (
        <div className="text-sm text-gray-700">
          Generated using {data?.llm_model || "unknown"} (
          {data?.tokens_used || 0} tokens)
        </div>
      );
    }

    if (title === "Guardrail Checks") {
      if (!data) {
        return <div className="text-sm text-gray-500">No guardrail data</div>;
      }
      const passed = Object.values(data).filter((v) => v === true).length - 1; // -1 for all_passed
      const total = Object.keys(data).length - 1;
      return (
        <div className="text-sm text-gray-700">
          {passed}/{total} checks passed
        </div>
      );
    }

    return null;
  };

  const renderDetailedView = (title: string, data: any) => {
    if (!data) {
      return (
        <div className="text-sm text-gray-500 italic">No data available</div>
      );
    }

    switch (title) {
      case "Persona Assigned":
        return (
          <div className="space-y-3">
            <div className="text-sm">
              <strong>Primary Persona:</strong>{" "}
              {data.primary_persona || "Unknown"}
            </div>
            {data.match_strength !== undefined && (
              <SignalStrengthIndicator
                strength={data.match_strength}
                label="Match Strength"
              />
            )}
            <CriteriaMetList criteria={data.criteria_met || []} />
          </div>
        );

      case "Content Matched":
        const contentCount = data.matched_content?.length || 0;
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
              Matched Content ({contentCount} items)
            </div>
            {contentCount === 0 ? (
              <div className="text-sm text-gray-500 italic">
                No content matches found
              </div>
            ) : (
              <>
                {data.matched_content
                  .slice(0, 3)
                  .map((match: any, i: number) => (
                    <ContentMatchCard key={i} match={match} />
                  ))}
                {contentCount > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{contentCount - 3} more items
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "Rationale Generated":
        return (
          <div className="space-y-3">
            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="text-sm text-gray-700">
                {data.rationale || "No rationale provided"}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div>
                <span className="font-medium">Model:</span>{" "}
                {data.llm_model || "N/A"}
              </div>
              <div>
                <span className="font-medium">Temperature:</span>{" "}
                {data.temperature ?? "N/A"}
              </div>
              <div>
                <span className="font-medium">Tokens:</span>{" "}
                {data.tokens_used || 0}
              </div>
            </div>
          </div>
        );

      case "Guardrail Checks":
        return (
          <div className="space-y-2">
            {Object.entries(data)
              .filter(([key]) => key !== "all_passed")
              .map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={value ? "text-green-600" : "text-red-600"}>
                    {value ? "✓" : "✗"}
                  </span>
                  <span className="text-sm text-gray-700">
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
              ))}
          </div>
        );

      default:
        return (
          <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-3 rounded overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="relative pl-12">
      {/* Status Icon */}
      <div className="absolute left-0 top-0 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center z-10">
        {getStatusIcon()}
      </div>

      {/* Content */}
      <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h5 className="font-medium text-gray-900">{title}</h5>
            {renderDataSummary()}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600">
              {formatDateTime(timestamp)}
            </div>
            {duration_ms !== undefined && (
              <div
                className={`text-xs font-medium ${getPerformanceColor(duration_ms)}`}
              >
                {duration_ms}ms • {getPerformanceLabel(duration_ms)}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
          aria-expanded={expanded}
          aria-label={`${expanded ? "Hide" : "Show"} details for ${title}`}
        >
          {expanded ? "Hide" : "Show"} Details
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            {renderDetailedView(title, data)}
          </div>
        )}
      </div>
    </div>
  );
});
