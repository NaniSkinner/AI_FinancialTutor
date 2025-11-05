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
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
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
          className="text-sm font-medium underline hover:no-underline ml-4"
        >
          View →
        </a>
      )}
    </div>
  );
}
