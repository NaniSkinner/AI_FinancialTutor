/**
 * useNotes Hook
 *
 * Custom hook for managing operator notes on recommendations.
 * Provides data fetching, caching, and mutation capabilities.
 */

import useSWR from "swr";
import { fetchNotes, type Note } from "@/lib/api";

export function useNotes(recommendationId: string | null) {
  const { data, error, mutate, isLoading } = useSWR<Note[]>(
    recommendationId
      ? `/api/operator/recommendations/${recommendationId}/notes`
      : null,
    () =>
      recommendationId ? fetchNotes(recommendationId) : Promise.resolve([]),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Don't auto-refresh notes (only on manual mutate)
    }
  );

  return {
    notes: data,
    isLoading,
    error,
    mutate,
  };
}
