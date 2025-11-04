import React from "react";
import { formatRelativeTime } from "@/lib/utils";

interface TraceEvent {
  step: string;
  timestamp: string;
  duration_ms?: number;
}

interface Props {
  events: TraceEvent[];
}

export function TraceTimeline({ events }: Props) {
  if (!events || events.length === 0) {
    return null;
  }

  // Calculate total duration
  const firstEvent = new Date(events[0].timestamp).getTime();
  const lastEvent = new Date(events[events.length - 1].timestamp).getTime();
  const totalDuration = lastEvent - firstEvent;

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-medium text-gray-900">Processing Timeline</h5>

      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        {events.map((event, index) => {
          if (index === 0) return null; // Skip first event as it's the start

          const eventTime = new Date(event.timestamp).getTime();
          const position = ((eventTime - firstEvent) / totalDuration) * 100;

          return (
            <div
              key={index}
              className="absolute h-full w-1 bg-indigo-600"
              style={{ left: `${position}%` }}
              title={`${event.step}: ${formatRelativeTime(event.timestamp)}`}
            />
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-gray-600">
        <span>Start</span>
        <span>{totalDuration}ms total</span>
      </div>
    </div>
  );
}
