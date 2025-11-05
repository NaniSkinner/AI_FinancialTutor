"use client";

import { format } from "date-fns";
import { Badge } from "@/components/Common/Badge";
import { Button } from "@/components/Common/Button";
import { Spinner } from "@/components/Common/Spinner";
import { EmptyState } from "@/components/Common/EmptyState";
import type { AuditLogEntry } from "@/hooks/useAuditLogs";

interface AuditLogTableProps {
  logs?: AuditLogEntry[];
  isLoading: boolean;
  onRowClick: (log: AuditLogEntry) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AuditLogTable({
  logs,
  isLoading,
  onRowClick,
  currentPage,
  totalPages,
  onPageChange,
}: AuditLogTableProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Empty state
  if (!logs || logs.length === 0) {
    return (
      <EmptyState
        title="No audit logs found"
        description="Try adjusting your filters to see more results."
      />
    );
  }

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

  // Helper to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy, h:mm a");
    } catch {
      return timestamp;
    }
  };

  // Helper to get metadata summary
  const getMetadataSummary = (metadata: Record<string, any>) => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return "—";
    }
    // Extract key details
    if (metadata.notes) {
      return (
        metadata.notes.substring(0, 50) +
        (metadata.notes.length > 50 ? "..." : "")
      );
    }
    if (metadata.reason) {
      return (
        metadata.reason.substring(0, 50) +
        (metadata.reason.length > 50 ? "..." : "")
      );
    }
    if (metadata.count) {
      return `${metadata.count} items`;
    }
    return Object.keys(metadata).join(", ");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recommendation ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log, index) => (
              <tr
                key={log.audit_id || `log-${index}-${log.timestamp}`}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick(log)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTimestamp(log.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="secondary">{log.operator_id}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getActionBadgeVariant(log.action)}>
                    {formatActionName(log.action)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                  {log.recommendation_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {getMetadataSummary(log.metadata)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(log);
                    }}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
