/**
 * API Client Tests
 * Tests for all API client functions in lib/api.ts
 */

import {
  fetchRecommendations,
  approveRecommendation,
  rejectRecommendation,
  modifyRecommendation,
  flagRecommendation,
  bulkApproveRecommendations,
  fetchUserSignals,
  fetchPersonaHistory,
  fetchDecisionTrace,
  fetchOperatorStats,
  fetchAlerts,
  fetchAuditLogs,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

// Mock fetch globally
global.fetch = jest.fn();

// Mock window.location
delete (window as any).location;
(window as any).location = { href: "", pathname: "/" };

// Mock auth module
jest.mock("@/lib/auth", () => ({
  useAuth: {
    getState: jest.fn(() => ({
      token: "test-token",
      logout: jest.fn(),
    })),
  },
  getAuthToken: jest.fn(() => "test-token"),
}));

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("API Client", () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = "false";
  });

  describe("fetchRecommendations", () => {
    it("fetches recommendations with filters", async () => {
      const mockData = [{ id: "rec_001", title: "Test" }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const filters = { status: "pending", persona: "high_utilization" };
      const result = await fetchRecommendations(filters);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/operator/recommendations"),
        expect.any(Object)
      );
    });

    it("handles empty filters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      await fetchRecommendations({});
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe("approveRecommendation", () => {
    it("approves a recommendation", async () => {
      const mockRec = { id: "rec_001", status: "approved" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRec,
      } as Response);

      const result = await approveRecommendation("rec_001", {
        notes: "Looks good",
      });

      expect(result).toEqual(mockRec);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/operator/recommendations/rec_001/approve`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ notes: "Looks good" }),
        })
      );
    });
  });

  describe("rejectRecommendation", () => {
    it("rejects a recommendation", async () => {
      const mockRec = { id: "rec_001", status: "rejected" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRec,
      } as Response);

      const result = await rejectRecommendation("rec_001", {
        reason: "Not relevant",
      });

      expect(result).toEqual(mockRec);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/operator/recommendations/rec_001/reject`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ reason: "Not relevant" }),
        })
      );
    });
  });

  describe("modifyRecommendation", () => {
    it("modifies a recommendation", async () => {
      const mockRec = { id: "rec_001", rationale: "Updated" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRec,
      } as Response);

      const result = await modifyRecommendation("rec_001", {
        rationale: "Updated",
      });

      expect(result).toEqual(mockRec);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/operator/recommendations/rec_001`,
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });
  });

  describe("flagRecommendation", () => {
    it("flags a recommendation", async () => {
      const mockRec = { id: "rec_001", status: "flagged" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRec,
      } as Response);

      const result = await flagRecommendation("rec_001", {
        reason: "Needs review",
      });

      expect(result).toEqual(mockRec);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/operator/recommendations/rec_001/flag`,
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("bulkApproveRecommendations", () => {
    it("bulk approves multiple recommendations", async () => {
      const mockResult = {
        total: 3,
        approved: 3,
        failed: 0,
        approved_ids: ["rec_001", "rec_002", "rec_003"],
        failed_items: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await bulkApproveRecommendations({
        recommendation_ids: ["rec_001", "rec_002", "rec_003"],
        notes: "Bulk approved",
      });

      expect(result).toEqual(mockResult);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/operator/recommendations/bulk-approve`,
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("fetchUserSignals", () => {
    it("fetches user signals with default window", async () => {
      const mockSignals = { user_id: "user_123", signals: {} };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSignals,
      } as Response);

      const result = await fetchUserSignals("user_123");

      expect(result).toEqual(mockSignals);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/operator/users/user_123/signals?window_type=30d`,
        expect.any(Object)
      );
    });

    it("fetches user signals with custom window", async () => {
      const mockSignals = { user_id: "user_123", signals: {} };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSignals,
      } as Response);

      await fetchUserSignals("user_123", "90d");

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/operator/users/user_123/signals?window_type=90d`,
        expect.any(Object)
      );
    });
  });

  describe("fetchPersonaHistory", () => {
    it("fetches persona history for a user", async () => {
      const mockHistory = [{ date: "2025-11-01", persona: "high_utilization" }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistory,
      } as Response);

      const result = await fetchPersonaHistory("user_123");

      expect(result).toEqual(mockHistory);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/operator/users/user_123/persona-history`,
        expect.any(Object)
      );
    });
  });

  describe("fetchDecisionTrace", () => {
    it("fetches decision trace for a recommendation", async () => {
      const mockTrace = { recommendation_id: "rec_001", signals: {} };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrace,
      } as Response);

      const result = await fetchDecisionTrace("rec_001");

      expect(result).toEqual(mockTrace);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/operator/recommendations/rec_001/trace`,
        expect.any(Object)
      );
    });
  });

  describe("fetchOperatorStats", () => {
    it("fetches operator statistics", async () => {
      const mockStats = { pending: 10, approved_today: 5 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      } as Response);

      const result = await fetchOperatorStats();

      expect(result).toEqual(mockStats);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/operator/stats"),
        expect.any(Object)
      );
    });
  });

  describe("fetchAlerts", () => {
    it("fetches current alerts", async () => {
      const mockAlerts = [{ id: "alert_001", type: "high_rejection_rate" }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlerts,
      } as Response);

      const result = await fetchAlerts();

      expect(result).toEqual(mockAlerts);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/operator/alerts`,
        expect.any(Object)
      );
    });
  });

  describe("fetchAuditLogs", () => {
    it("fetches audit logs with filters", async () => {
      const mockLogs = {
        logs: [{ audit_id: "audit_001", action: "approve" }],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLogs,
      } as Response);

      const result = await fetchAuditLogs({
        operator_id: "op_001",
        start_date: "2025-11-01",
      });

      expect(result).toEqual(mockLogs);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/operator/audit-logs"),
        expect.any(Object)
      );
    });
  });

  describe("Error Handling", () => {
    it("handles 401 unauthorized errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: "Unauthorized" }),
      } as Response);

      await expect(fetchRecommendations({})).rejects.toThrow(
        /Authentication required/
      );
    });

    it("handles 403 forbidden errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ detail: "Forbidden" }),
      } as Response);

      await expect(fetchRecommendations({})).rejects.toThrow();
    });

    it("handles 500 server errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Server error" }),
      } as Response);

      await expect(fetchRecommendations({})).rejects.toThrow();
    });

    it("handles network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(fetchRecommendations({})).rejects.toThrow("Network error");
    });
  });

  describe("Authentication Headers", () => {
    it("includes Authorization header when token exists", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      await fetchRecommendations({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });
  });
});
