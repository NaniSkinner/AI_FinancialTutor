import useSWR from "swr";
import { fetchRecommendations } from "@/lib/api";
import type { Recommendation } from "@/lib/types";

interface Filters {
  status?: string;
  persona?: string;
  priority?: string;
}

/**
 * Custom hook for fetching and managing recommendations with filtering
 * Auto-refreshes every 30 seconds and revalidates on window focus
 * @param filters - Filter criteria for recommendations
 * @returns SWR response with recommendations data, loading, error states, and mutate function
 */
export function useRecommendations(filters: Filters) {
  const { data, error, isLoading, mutate } = useSWR<Recommendation[]>(
    ["/api/operator/recommendations", filters],
    () => fetchRecommendations(filters),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true, // Refresh when user returns to the tab
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
