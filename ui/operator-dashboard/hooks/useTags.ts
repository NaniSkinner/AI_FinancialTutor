/**
 * useTags Hook
 *
 * SWR hook for managing tags on recommendations.
 * Automatically handles fetching, caching, and revalidation of tags.
 *
 * Features:
 * - Automatic revalidation on focus/reconnect
 * - Optimistic updates for add/delete operations
 * - Error handling with retry logic
 * - Works with mock data
 *
 * Usage:
 *   const { data: tags, error, isLoading, mutate } = useTags(recommendationId);
 */

import useSWR from "swr";
import { fetchTags, type Tag } from "@/lib/api";

interface UseTagsOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
}

export function useTags(
  recommendationId: string | null,
  options: UseTagsOptions = {}
) {
  const {
    refreshInterval = 0, // Don't auto-refresh by default (tags change infrequently)
    revalidateOnFocus = true,
  } = options;

  return useSWR<Tag[]>(
    recommendationId
      ? `/api/operator/recommendations/${recommendationId}/tags`
      : null,
    () =>
      recommendationId ? fetchTags(recommendationId) : Promise.resolve([]),
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
    }
  );
}
