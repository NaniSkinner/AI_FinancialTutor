"use client";

import React, { useState } from "react";
import { DecisionTraces } from "./DecisionTraces";
import { Button } from "@/components/Common/Button";

/**
 * TraceSearch component - Standalone trace viewer
 * Allows searching for traces by recommendation ID
 */
export function TraceSearch() {
  const [searchId, setSearchId] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleSearch = () => {
    if (searchId.trim()) {
      setActiveId(searchId.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Search Decision Trace
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter recommendation ID (e.g., rec_001)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="Search recommendation ID"
          />
          <Button
            onClick={handleSearch}
            disabled={!searchId.trim()}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Search
          </Button>
        </div>

        {activeId && (
          <div className="mt-2 text-sm text-gray-600">
            Showing trace for: <span className="font-medium">{activeId}</span>
          </div>
        )}
      </div>

      {activeId && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <DecisionTraces recommendationId={activeId} />
        </div>
      )}
    </div>
  );
}
