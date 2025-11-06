import React from "react";
import { AlertTriangle } from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertItem } from "./AlertItem";

export function AlertPanel() {
  const { data: alerts, mutate } = useAlerts();

  // Don't render anything if there are no alerts
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>

          <div className="flex-1 space-y-2">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} onDismiss={mutate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
