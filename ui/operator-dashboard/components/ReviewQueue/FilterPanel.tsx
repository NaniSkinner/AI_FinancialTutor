"use client";

import React from "react";

interface Filters {
  persona: string;
  priority: string;
  status: string;
}

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

/**
 * FilterPanel component for filtering recommendations
 * Provides dropdowns for persona, priority, and status filters
 */
export function FilterPanel({ filters, onFiltersChange }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Persona Filter */}
        <div>
          <label
            htmlFor="persona-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Persona
          </label>
          <select
            id="persona-filter"
            value={filters.persona}
            onChange={(e) =>
              onFiltersChange({ ...filters, persona: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="all">All Personas</option>
            <option value="high_utilization">High Utilization</option>
            <option value="variable_income_budgeter">Variable Income</option>
            <option value="student">Student</option>
            <option value="subscription_heavy">Subscription-Heavy</option>
            <option value="savings_builder">Savings Builder</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label
            htmlFor="priority-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Priority
          </label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) =>
              onFiltersChange({ ...filters, priority: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>
      </div>
    </div>
  );
}
