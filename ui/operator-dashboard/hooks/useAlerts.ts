import useSWR from "swr";
import { fetchAlerts } from "@/lib/api";
import type { Alert } from "@/lib/types";

/**
 * Custom hook for fetching and managing alerts
 * Auto-refreshes every minute and revalidates on focus
 *
 * @returns {object} Object containing alerts data, loading state, error, and mutate function
 */
export function useAlerts() {
  const { data, error, isLoading, mutate } = useSWR<Alert[]>(
    "/api/operator/alerts",
    fetchAlerts,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true, // Revalidate when window regains focus
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
