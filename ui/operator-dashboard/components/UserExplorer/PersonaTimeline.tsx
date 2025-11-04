// Persona Timeline Component
// Displays historical persona assignments for a user

import React from "react";
import { usePersonaHistory } from "@/hooks/usePersonaHistory";
import { Spinner } from "@/components/Common/Spinner";
import { Badge } from "@/components/Common/Badge";
import { getPersonaColor, formatPersonaName, formatDate } from "@/lib/utils";

interface Props {
  userId: string;
}

export function PersonaTimeline({ userId }: Props) {
  const { data: history, isLoading, error } = usePersonaHistory(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">Failed to load persona history</div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-gray-500">No persona history available</div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
        >
          <div className="shrink-0 text-sm text-gray-600 w-24">
            {formatDate(entry.date)}
          </div>

          <div className="flex-1 flex items-center gap-2">
            <Badge className={getPersonaColor(entry.persona)}>
              {formatPersonaName(entry.persona)}
            </Badge>

            <span className="text-sm text-gray-600">
              ({(entry.match_strength * 100).toFixed(0)}% match)
            </span>
          </div>

          {index === 0 && (
            <div className="shrink-0">
              <Badge className="bg-indigo-100 text-indigo-800">Current</Badge>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
