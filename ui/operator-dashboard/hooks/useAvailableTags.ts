/**
 * useAvailableTags Hook
 *
 * SWR hook for fetching the list of available predefined tags.
 * This list rarely changes, so it's aggressively cached.
 *
 * Features:
 * - Fetches predefined tag categories
 * - Provides display names for UI rendering
 * - Aggressive caching (1 hour)
 * - Works with mock data
 *
 * Usage:
 *   const { data: availableTags, error, isLoading } = useAvailableTags();
 */

import useSWR from "swr";
import { fetchAvailableTags, type AvailableTags } from "@/lib/api";

export function useAvailableTags() {
  return useSWR<AvailableTags>(
    "/api/operator/tags/available",
    fetchAvailableTags,
    {
      // Available tags rarely change, so cache aggressively
      dedupingInterval: 3600000, // 1 hour
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Keep data fresh but don't revalidate often
      revalidateIfStale: false,
    }
  );
}
