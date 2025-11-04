"use client";

import useSWR from "swr";
import { fetchOperatorStats } from "@/lib/api";
import type { OperatorStats } from "@/lib/types";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export function useOperatorStats() {
  const { data, error, isLoading, mutate } = useSWR<OperatorStats>(
    "/api/operator/stats",
    fetchOperatorStats,
    {
      refreshInterval: USE_MOCK_DATA ? 0 : 30000, // Don't refresh if using mock data
      revalidateOnFocus: !USE_MOCK_DATA, // Don't revalidate if using mock data
      shouldRetryOnError: !USE_MOCK_DATA, // Don't retry if using mock data
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
