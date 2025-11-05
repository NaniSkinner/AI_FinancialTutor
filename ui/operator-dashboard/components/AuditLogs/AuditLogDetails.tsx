"use client";

import { format } from "date-fns";
import { Modal } from "@/components/Common/Modal";
import { Badge } from "@/components/Common/Badge";
import { Button } from "@/components/Common/Button";
import type { AuditLogEntry } from "@/hooks/useAuditLogs";

interface AuditLogDetailsProps {
  log: AuditLogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogDetails({
  log,
  isOpen,
  onClose,
}: AuditLogDetailsProps) {
  if (!log) return null;

  // Helper to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy, h:mm:ss a");
    } catch {
      return timestamp;
    }
  };

  // Helper to get action badge variant
  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "approve":
      case "bulk_approve":
        return "success";
      case "reject":
        return "destructive";
      case "modify":
        return "warning";
      case "flag":
        return "secondary";
      default:
        return "default";
    }
  };

  // Helper to format action name
  const formatActionName = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Audit Log Details">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Audit ID
            </label>
            <div className="text-sm font-mono text-gray-900">
              {log.audit_id}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Timestamp
            </label>
            <div className="text-sm text-gray-900">
              {formatTimestamp(log.timestamp)}
            </div>
          </div>
        </div>

        {/* Action Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Operator
            </label>
            <div>
              <Badge variant="secondary">{log.operator_id}</Badge>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Action
            </label>
            <div>
              <Badge variant={getActionBadgeVariant(log.action)}>
                {formatActionName(log.action)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Recommendation ID */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Recommendation ID
          </label>
          <div className="flex items-center gap-2">
            <div className="text-sm font-mono text-gray-900">
              {log.recommendation_id}
            </div>
            <a
              href={`/?recommendation=${log.recommendation_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View Recommendation →
            </a>
          </div>
        </div>

        {/* Metadata */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Metadata
          </label>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            {Object.keys(log.metadata).length === 0 ? (
              <div className="text-sm text-gray-500 italic">No metadata</div>
            ) : (
              <div className="space-y-3">
                {Object.entries(log.metadata).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      {key.replace(/_/g, " ")}
                    </div>
                    <div className="text-sm text-gray-900">
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Raw JSON (for debugging) */}
        <details className="border border-gray-200 rounded-lg">
          <summary className="px-4 py-2 bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-100">
            Raw JSON Data
          </summary>
          <div className="p-4 bg-white">
            <pre className="text-xs font-mono text-gray-800 overflow-x-auto">
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        </details>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
