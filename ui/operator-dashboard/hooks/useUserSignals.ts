// Custom hook for fetching user signals data
// Uses SWR for caching and automatic revalidation

import useSWR from "swr";
import { fetchUserSignals } from "@/lib/api";
import type { UserSignals } from "@/lib/types";

/**
 * Hook to fetch user signals for a specific user
 * @param userId - User ID to fetch signals for (null to skip fetching)
 * @param windowType - Time window for signals (default: 30d)
 * @returns SWR response with user signals data
 */
export function useUserSignals(
  userId: string | null,
  windowType: string = "30d"
) {
  const { data, error, isLoading, mutate } = useSWR<UserSignals>(
    userId
      ? `/api/operator/users/${userId}/signals?window=${windowType}`
      : null,
    userId ? () => fetchUserSignals(userId, windowType) : null,
    {
      revalidateOnFocus: false, // Don't refetch on focus for user data
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
