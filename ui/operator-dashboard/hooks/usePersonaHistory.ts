// Custom hook for fetching user persona history
// Uses SWR for caching and automatic revalidation

import useSWR from "swr";
import { fetchPersonaHistory, type PersonaHistoryEntry } from "@/lib/api";

/**
 * Hook to fetch persona history for a specific user
 * @param userId - User ID to fetch history for (null to skip fetching)
 * @returns SWR response with persona history data
 */
export function usePersonaHistory(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<PersonaHistoryEntry[]>(
    userId ? `/api/operator/users/${userId}/persona-history` : null,
    userId ? () => fetchPersonaHistory(userId) : null,
    {
      revalidateOnFocus: false, // Don't refetch on focus
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
