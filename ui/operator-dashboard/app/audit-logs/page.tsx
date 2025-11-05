"use client";

import { useState, useCallback } from "react";
import {
  AuditLogFilters,
  AuditLogTable,
  AuditLogDetails,
  AuditLogStats,
} from "@/components/AuditLogs";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import type {
  AuditLogFilters as FilterType,
  AuditLogEntry,
} from "@/hooks/useAuditLogs";

const ITEMS_PER_PAGE = 25;

export default function AuditLogsPage() {
  const [filters, setFilters] = useState<FilterType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Calculate offset based on current page
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch audit logs with filters and pagination
  const { data, isLoading, error } = useAuditLogs({
    ...filters,
    limit: ITEMS_PER_PAGE,
    offset,
  });

  // Calculate total pages
  const totalPages = data?.total ? Math.ceil(data.total / ITEMS_PER_PAGE) : 1;

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FilterType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle row click to show details
  const handleRowClick = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  // Handle details modal close
  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedLog(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <a
                  href="/"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  ← Back to Dashboard
                </a>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and filter all operator actions for compliance and review
              </p>
            </div>
            {data && (
              <div className="text-sm text-gray-500">
                {data.total.toLocaleString()} total logs
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <AuditLogFilters onFilterChange={handleFilterChange} />

        {/* Stats Cards */}
        <AuditLogStats logs={data?.logs} totalCount={data?.total} />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 text-sm">
                <strong>Error loading audit logs:</strong>{" "}
                {error.message || "Unknown error"}
              </div>
            </div>
          </div>
        )}

        {/* Audit Table */}
        <AuditLogTable
          logs={data?.logs}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Pagination Info */}
        {data && data.logs.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {offset + 1} to{" "}
            {Math.min(offset + ITEMS_PER_PAGE, data.total)} of {data.total} logs
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AuditLogDetails
        log={selectedLog}
        isOpen={isDetailsOpen}
        onClose={handleDetailsClose}
      />
    </div>
  );
}
