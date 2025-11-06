/**
 * useAnalytics Hook
 *
 * SWR hook for fetching analytics dashboard data.
 * Supports date range filtering and automatic revalidation.
 *
 * Features:
 * - Fetches comprehensive analytics metrics
 * - Supports custom date ranges
 * - Automatic caching and revalidation
 * - Works with mock data
 *
 * Usage:
 *   const { data, error, isLoading } = useAnalytics(startDate, endDate);
 */

import useSWR from "swr";
import { fetchAnalytics, type AnalyticsData } from "@/lib/api";

interface UseAnalyticsOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
}

export function useAnalytics(
  startDate?: string,
  endDate?: string,
  options: UseAnalyticsOptions = {}
) {
  const {
    refreshInterval = 60000, // Refresh every minute by default
    revalidateOnFocus = true,
  } = options;

  // Create cache key that includes date range
  const cacheKey = `/api/operator/analytics?start=${startDate || ""}&end=${endDate || ""}`;

  return useSWR<AnalyticsData>(
    cacheKey,
    () => fetchAnalytics(startDate, endDate),
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );
}
