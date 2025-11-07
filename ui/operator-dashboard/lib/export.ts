/**
 * CSV Export Utilities
 * Provides functions to export audit logs, recommendations, and stats to CSV format
 */

import { fetchAuditLogs, fetchRecommendations } from "./api";
import type { AuditLogFilters, AuditLogEntry } from "@/hooks/useAuditLogs";
import type { Recommendation } from "./types";

/**
 * Format date for readable filename
 * Example: 2025-11-05-14-30
 */
function getFormattedTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}-${hours}-${minutes}`;
}

/**
 * Convert data to CSV format
 * @param data - Array of objects to convert
 * @param columns - Column definitions
 * @returns CSV string
 */
function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns: { key: string; label: string }[]
): string {
  // Header row
  const header = columns.map((col) => col.label).join(",");

  // Data rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];

        // Handle null/undefined
        if (value === null || value === undefined) {
          return '""';
        }

        // Handle objects/arrays (convert to JSON string)
        if (typeof value === "object") {
          const jsonStr = JSON.stringify(value).replace(/"/g, '""');
          return `"${jsonStr}"`;
        }

        // Handle strings with special characters
        const strValue = String(value);

        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        if (
          strValue.includes(",") ||
          strValue.includes("\n") ||
          strValue.includes('"')
        ) {
          const escaped = strValue.replace(/"/g, '""');
          return `"${escaped}"`;
        }

        // Wrap all values in quotes for consistency
        return `"${strValue}"`;
      })
      .join(",")
  );

  return [header, ...rows].join("\n");
}

/**
 * Trigger browser download of a file
 * @param content - File content
 * @param filename - Filename
 * @param mimeType - MIME type
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Extract common metadata fields from audit log metadata
 * @param metadata - Audit log metadata object
 * @returns Object with extracted fields
 */
function extractMetadataFields(metadata: Record<string, any>): {
  notes: string;
  rejection_reason: string;
  modification_details: string;
  flag_reason: string;
  additional_metadata: string;
} {
  const result = {
    notes: "",
    rejection_reason: "",
    modification_details: "",
    flag_reason: "",
    additional_metadata: "",
  };

  if (!metadata) return result;

  // Extract common fields
  result.notes = metadata.notes || metadata.operator_notes || "";
  result.rejection_reason = metadata.reason || metadata.rejection_reason || "";
  result.flag_reason = metadata.flag_reason || "";

  // Extract modification details
  if (metadata.modifications) {
    result.modification_details = JSON.stringify(metadata.modifications);
  }

  // Store remaining metadata
  const remainingMetadata: Record<string, any> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (
      ![
        "notes",
        "operator_notes",
        "reason",
        "rejection_reason",
        "flag_reason",
        "modifications",
      ].includes(key)
    ) {
      remainingMetadata[key] = value;
    }
  }

  if (Object.keys(remainingMetadata).length > 0) {
    result.additional_metadata = JSON.stringify(remainingMetadata);
  }

  return result;
}

/**
 * Export audit logs to CSV
 * @param filters - Current filter settings
 * @param options - Export options (column selection)
 * @returns Promise that resolves when download starts
 */
export async function exportAuditLogsToCsv(
  filters: AuditLogFilters,
  options: {
    includeMetadata?: boolean;
  } = { includeMetadata: true }
): Promise<void> {
  try {
    // Fetch all matching records (up to 10,000)
    const fetchFilters: AuditLogFilters = {
      ...filters,
      limit: 10000,
      offset: 0,
    };
    const response = await fetchAuditLogs(fetchFilters);

    const logs =
      (response as { logs: AuditLogEntry[] }).logs || (response as any);

    if (!logs || logs.length === 0) {
      throw new Error("No audit logs to export");
    }

    // Transform data to include extracted metadata fields
    const transformedLogs = logs.map((log) => {
      const metadataFields = extractMetadataFields(log.metadata);
      return {
        ...log,
        ...metadataFields,
      };
    });

    // Define columns based on options
    const columns = [
      { key: "timestamp", label: "Timestamp" },
      { key: "operator_id", label: "Operator ID" },
      { key: "action", label: "Action" },
      { key: "recommendation_id", label: "Recommendation ID" },
    ];

    if (options.includeMetadata) {
      columns.push(
        { key: "notes", label: "Notes" },
        { key: "rejection_reason", label: "Rejection Reason" },
        { key: "modification_details", label: "Modification Details" },
        { key: "flag_reason", label: "Flag Reason" },
        { key: "additional_metadata", label: "Additional Metadata" }
      );
    }

    // Convert to CSV
    const csv = convertToCSV(transformedLogs, columns);

    // Generate filename
    const timestamp = getFormattedTimestamp();
    const filename = `audit-logs-${timestamp}.csv`;

    // Trigger download
    downloadFile(csv, filename, "text/csv");
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

/**
 * Export recommendations to CSV
 * @param filters - Current filter settings
 * @returns Promise that resolves when download starts
 */
export async function exportRecommendationsToCsv(filters: {
  status?: string;
  persona?: string;
  priority?: string;
}): Promise<void> {
  try {
    // Fetch all matching recommendations
    const recommendations = await fetchRecommendations(filters);

    if (!recommendations || recommendations.length === 0) {
      throw new Error("No recommendations to export");
    }

    // Define columns
    const columns = [
      { key: "id", label: "Recommendation ID" },
      { key: "user_id", label: "User ID" },
      { key: "persona_primary", label: "Persona Primary" },
      { key: "type", label: "Type" },
      { key: "title", label: "Title" },
      { key: "priority", label: "Priority" },
      { key: "status", label: "Status" },
      { key: "generated_at", label: "Generated At" },
      { key: "approved_by", label: "Approved/Rejected By" },
      { key: "approved_at", label: "Approved/Rejected At" },
      { key: "operator_notes", label: "Operator Notes" },
      { key: "content_url", label: "Content URL" },
      { key: "read_time_minutes", label: "Read Time (minutes)" },
    ];

    // Convert to CSV
    const csv = convertToCSV(recommendations, columns);

    // Generate filename
    const timestamp = getFormattedTimestamp();
    const statusFilter =
      filters.status && filters.status !== "all" ? `-${filters.status}` : "";
    const filename = `recommendations${statusFilter}-${timestamp}.csv`;

    // Trigger download
    downloadFile(csv, filename, "text/csv");
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

/**
 * Export operator statistics to CSV
 * @param stats - Operator statistics object
 * @returns Promise that resolves when download starts
 */
export async function exportStatsToCsv(stats: {
  pending: number;
  approved_today: number;
  rejected_today: number;
  flagged: number;
  avg_review_time_seconds: number;
}): Promise<void> {
  try {
    // Convert stats object to array format
    const statsArray = [
      {
        metric: "Pending Recommendations",
        value: stats.pending,
      },
      {
        metric: "Approved Today",
        value: stats.approved_today,
      },
      {
        metric: "Rejected Today",
        value: stats.rejected_today,
      },
      {
        metric: "Flagged for Review",
        value: stats.flagged,
      },
      {
        metric: "Avg Review Time (seconds)",
        value: stats.avg_review_time_seconds,
      },
    ];

    // Define columns
    const columns = [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value" },
    ];

    // Convert to CSV
    const csv = convertToCSV(statsArray, columns);

    // Generate filename
    const timestamp = getFormattedTimestamp();
    const filename = `operator-stats-${timestamp}.csv`;

    // Trigger download
    downloadFile(csv, filename, "text/csv");
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}
