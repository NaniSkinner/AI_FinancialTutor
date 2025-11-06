// Data Fetching Hooks Tests
// Tests for useRecommendations, useUserSignals, useOperatorStats, useAlerts

import { renderHook, waitFor } from "@testing-library/react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useUserSignals } from "@/hooks/useUserSignals";
import { useOperatorStats } from "@/hooks/useOperatorStats";
import { useAlerts } from "@/hooks/useAlerts";
import * as api from "@/lib/api";
import type {
  Recommendation,
  UserSignals,
  OperatorStats,
  Alert,
} from "@/lib/types";

// Mock the API module
jest.mock("@/lib/api");

const mockApi = api as jest.Mocked<typeof api>;

// Mock SWR's native features
jest.mock("swr", () => {
  const originalSWR = jest.requireActual("swr");
  return {
    __esModule: true,
    ...originalSWR,
    default: jest.fn((key, fetcher, options) => {
      const useSWR = originalSWR.default;
      return useSWR(key, fetcher, {
        ...options,
        dedupingInterval: 0,
        refreshInterval: 0,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      });
    }),
  };
});

describe("useRecommendations", () => {
  const mockRecommendations: Recommendation[] = [
    {
      id: "rec-1",
      user_id: "user-1",
      persona_primary: "Credit Optimizer",
      type: "credit",
      title: "Test Recommendation",
      rationale: "Test description",
      content_url: "https://test.com",
      priority: "high",
      status: "pending",
      generated_at: "2025-11-05T10:00:00Z",
      read_time_minutes: 5,
      guardrails_passed: {
        tone_check: true,
        advice_check: true,
        eligibility_check: true,
      },
    },
    {
      id: "rec-2",
      user_id: "user-2",
      persona_primary: "Savings Builder",
      type: "savings",
      title: "Test Recommendation 2",
      rationale: "Test description 2",
      content_url: "https://test2.com",
      priority: "medium",
      status: "pending",
      generated_at: "2025-11-05T11:00:00Z",
      read_time_minutes: 3,
      guardrails_passed: {
        tone_check: true,
        advice_check: true,
        eligibility_check: true,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches recommendations successfully", async () => {
    mockApi.fetchRecommendations.mockResolvedValue(mockRecommendations);

    const { result } = renderHook(() =>
      useRecommendations({ status: "pending" })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockRecommendations);
    expect(result.current.error).toBeUndefined();
    expect(mockApi.fetchRecommendations).toHaveBeenCalledWith({
      status: "pending",
    });
  });

  it("handles fetch error", async () => {
    const error = new Error("Failed to fetch");
    mockApi.fetchRecommendations.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useRecommendations({ status: "pending" })
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("applies filters correctly", async () => {
    mockApi.fetchRecommendations.mockResolvedValue(mockRecommendations);

    const filters = {
      status: "approved",
      persona: "Credit Optimizer",
      priority: "high",
    };

    renderHook(() => useRecommendations(filters));

    await waitFor(() => {
      expect(mockApi.fetchRecommendations).toHaveBeenCalledWith(filters);
    });
  });

  it("provides mutate function for manual revalidation", async () => {
    mockApi.fetchRecommendations.mockResolvedValue(mockRecommendations);

    const { result } = renderHook(() =>
      useRecommendations({ status: "pending" })
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockRecommendations);
    });

    expect(result.current.mutate).toBeInstanceOf(Function);
  });
});

describe("useUserSignals", () => {
  const mockUserSignals: UserSignals = {
    user_id: "user-1",
    persona_30d: {
      primary: "Credit Optimizer",
      match_strength: 0.85,
    },
    signals: {
      credit: {
        aggregate_utilization_pct: 75,
        total_credit_used: 7500,
        total_credit_available: 10000,
        any_interest_charges: true,
      },
      subscriptions: {
        recurring_merchant_count: 5,
        monthly_recurring_spend: 200,
        subscription_share_pct: 15,
        merchants: [],
      },
      savings: {
        total_savings_balance: 5000,
        savings_growth_rate_pct: 5,
        net_savings_inflow: 100,
        emergency_fund_months: 2.5,
      },
      income: {
        income_type: "salaried",
        payment_frequency: "biweekly",
        median_pay_gap_days: 14,
        income_variability_pct: 5,
        cash_flow_buffer_months: 2.0,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches user signals successfully", async () => {
    mockApi.fetchUserSignals.mockResolvedValue(mockUserSignals);

    const { result } = renderHook(() => useUserSignals("user-1", "30d"));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockUserSignals);
    expect(result.current.error).toBeUndefined();
    expect(mockApi.fetchUserSignals).toHaveBeenCalledWith("user-1", "30d");
  });

  it("skips fetching when userId is null", async () => {
    const { result } = renderHook(() => useUserSignals(null, "30d"));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockApi.fetchUserSignals).not.toHaveBeenCalled();
  });

  it("handles fetch error", async () => {
    const error = new Error("Failed to fetch signals");
    mockApi.fetchUserSignals.mockRejectedValue(error);

    const { result } = renderHook(() => useUserSignals("user-1", "30d"));

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });

  it("uses default window type when not provided", async () => {
    mockApi.fetchUserSignals.mockResolvedValue(mockUserSignals);

    renderHook(() => useUserSignals("user-1"));

    await waitFor(() => {
      expect(mockApi.fetchUserSignals).toHaveBeenCalledWith("user-1", "30d");
    });
  });
});

describe("useOperatorStats", () => {
  const mockStats: OperatorStats = {
    pending: 10,
    approved_today: 5,
    rejected_today: 2,
    flagged: 1,
    avg_review_time_seconds: 120,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches operator stats successfully", async () => {
    mockApi.fetchOperatorStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useOperatorStats());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockStats);
    expect(result.current.error).toBeUndefined();
    expect(mockApi.fetchOperatorStats).toHaveBeenCalled();
  });

  it("handles fetch error", async () => {
    const error = new Error("Failed to fetch stats");
    mockApi.fetchOperatorStats.mockRejectedValue(error);

    const { result } = renderHook(() => useOperatorStats());

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });

  it("provides mutate function", async () => {
    mockApi.fetchOperatorStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useOperatorStats());

    await waitFor(() => {
      expect(result.current.data).toEqual(mockStats);
    });

    expect(result.current.mutate).toBeInstanceOf(Function);
  });
});

describe("useAlerts", () => {
  const mockAlerts: Alert[] = [
    {
      id: "alert-1",
      type: "high_rejection_rate",
      severity: "high",
      message: "Rejection rate above threshold",
      count: 5,
      createdAt: "2025-11-05T10:00:00Z",
    },
    {
      id: "alert-2",
      type: "long_queue",
      severity: "medium",
      message: "Queue length above normal",
      count: 15,
      createdAt: "2025-11-05T11:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches alerts successfully", async () => {
    mockApi.fetchAlerts.mockResolvedValue(mockAlerts);

    const { result } = renderHook(() => useAlerts());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockAlerts);
    expect(result.current.error).toBeUndefined();
    expect(mockApi.fetchAlerts).toHaveBeenCalled();
  });

  it("handles fetch error", async () => {
    const error = new Error("Failed to fetch alerts");
    mockApi.fetchAlerts.mockRejectedValue(error);

    const { result } = renderHook(() => useAlerts());

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("provides mutate function for manual refresh", async () => {
    mockApi.fetchAlerts.mockResolvedValue(mockAlerts);

    const { result } = renderHook(() => useAlerts());

    await waitFor(() => {
      expect(result.current.data).toEqual(mockAlerts);
    });

    expect(result.current.mutate).toBeInstanceOf(Function);
  });
});
