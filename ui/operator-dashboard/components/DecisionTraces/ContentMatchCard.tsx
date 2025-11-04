import React from "react";
import { SignalStrengthIndicator } from "./SignalStrengthIndicator";

interface ContentMatch {
  content_id: string;
  title: string;
  relevance_score: number;
  match_reason: string;
}

interface Props {
  match: ContentMatch;
}

export function ContentMatchCard({ match }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <h6 className="text-sm font-medium text-gray-900">{match.title}</h6>
          <p className="text-xs text-gray-600 mt-1">ID: {match.content_id}</p>
        </div>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
          {match.match_reason.replace(/_/g, " ")}
        </span>
      </div>

      <SignalStrengthIndicator
        strength={match.relevance_score}
        label="Relevance"
      />
    </div>
  );
}
