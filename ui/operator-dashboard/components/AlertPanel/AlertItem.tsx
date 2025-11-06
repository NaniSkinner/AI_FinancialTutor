import React from "react";
import { Badge } from "@/components/Common/Badge";
import type { Alert } from "@/lib/types";

interface Props {
  alert: Alert;
  onDismiss?: () => void;
}

export function AlertItem({ alert, onDismiss }: Props) {
  const getSeverityColor = () => {
    switch (alert.severity) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
      case "low":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600";
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityColor()}`}
    >
      <div className="flex items-center gap-3 flex-1">
        <Badge variant="outline" className="uppercase text-xs">
          {alert.type.replace(/_/g, " ")}
        </Badge>

        <span className="text-sm font-medium">{alert.message}</span>

        {alert.count && <span className="text-xs">({alert.count} items)</span>}
      </div>

      {alert.actionUrl && (
        <a
          href={alert.actionUrl}
          className="text-sm font-medium underline hover:no-underline ml-4 dark:text-gray-200"
        >
          View →
        </a>
      )}
    </div>
  );
}
