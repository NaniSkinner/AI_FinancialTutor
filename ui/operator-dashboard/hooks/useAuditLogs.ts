import useSWR from "swr";
import { fetchAuditLogs } from "@/lib/api";

export interface AuditLogFilters {
  operator_id?: string;
  action?: "approve" | "reject" | "modify" | "flag" | "bulk_approve" | "all";
  start_date?: string;
  end_date?: string;
  recommendation_id?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogEntry {
  audit_id: string;
  operator_id: string;
  action: string;
  recommendation_id: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface AuditLogResponse {
  count: number;
  total: number;
  limit: number;
  offset: number;
  logs: AuditLogEntry[];
}

/**
 * Hook to fetch audit logs with filters
 * Auto-refreshes every 30 seconds and on window focus
 */
export function useAuditLogs(filters: AuditLogFilters = {}) {
  const filterKey = JSON.stringify(filters);

  const { data, error, isLoading, mutate } = useSWR<AuditLogResponse>(
    ["/api/operator/audit-logs", filterKey],
    () => fetchAuditLogs(filters) as Promise<AuditLogResponse>,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
