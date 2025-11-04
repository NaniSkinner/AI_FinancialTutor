import useSWR from "swr";
import { fetchDecisionTrace } from "@/lib/api";
import type { DecisionTrace } from "@/lib/types";

/**
 * Custom hook to fetch decision trace for a recommendation
 * Uses SWR for caching and automatic revalidation
 * @param recommendationId - Recommendation ID to fetch trace for
 * @returns Decision trace data, loading state, error state, and mutate function
 */
export function useDecisionTrace(recommendationId: string) {
  const { data, error, isLoading, mutate } = useSWR<DecisionTrace>(
    recommendationId
      ? `/api/operator/recommendations/${recommendationId}/trace`
      : null,
    recommendationId ? () => fetchDecisionTrace(recommendationId) : null,
    {
      revalidateOnFocus: false, // Traces don't change, no need to refetch
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
