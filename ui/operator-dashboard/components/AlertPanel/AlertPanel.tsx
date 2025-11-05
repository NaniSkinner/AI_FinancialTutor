import React from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertItem } from "./AlertItem";

export function AlertPanel() {
  const { data: alerts, mutate } = useAlerts();

  // Don't render anything if there are no alerts
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <span className="text-yellow-600 text-xl">⚠️</span>
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
