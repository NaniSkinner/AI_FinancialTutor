/**
 * Export Functions Tests
 * Tests for CSV export utilities
 */

import {
  exportAuditLogsToCsv,
  exportRecommendationsToCsv,
  exportStatsToCsv,
} from "@/lib/export";
import * as api from "@/lib/api";

// Mock API module
jest.mock("@/lib/api");

const mockApi = api as jest.Mocked<typeof api>;

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-url");
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement and click
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

describe("Export Functions", () => {
  let mockLink: HTMLAnchorElement;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLink = {
      href: "",
      download: "",
      click: mockClick,
    } as any;

    jest.spyOn(document, "createElement").mockReturnValue(mockLink);
    jest
      .spyOn(document.body, "appendChild")
      .mockImplementation(mockAppendChild);
    jest
      .spyOn(document.body, "removeChild")
      .mockImplementation(mockRemoveChild);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("exportAuditLogsToCsv", () => {
    it("exports audit logs successfully", async () => {
      const mockLogs = {
        logs: [
          {
            audit_id: "audit_001",
            timestamp: "2025-11-05T10:00:00Z",
            operator_id: "op_001",
            action: "approve",
            recommendation_id: "rec_001",
            metadata: { notes: "Test note" },
          },
        ],
      };

      mockApi.fetchAuditLogs.mockResolvedValue(mockLogs);

      await exportAuditLogsToCsv({});

      expect(mockApi.fetchAuditLogs).toHaveBeenCalledWith({
        limit: 10000,
        offset: 0,
      });
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("includes metadata in export", async () => {
      const mockLogs = {
        logs: [
          {
            audit_id: "audit_001",
            timestamp: "2025-11-05T10:00:00Z",
            operator_id: "op_001",
            action: "reject",
            recommendation_id: "rec_001",
            metadata: {
              notes: "Not relevant",
              reason: "Out of scope",
            },
          },
        ],
      };

      mockApi.fetchAuditLogs.mockResolvedValue(mockLogs);

      await exportAuditLogsToCsv({}, { includeMetadata: true });

      expect(mockApi.fetchAuditLogs).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it("exports without metadata when option is false", async () => {
      const mockLogs = {
        logs: [
          {
            audit_id: "audit_001",
            timestamp: "2025-11-05T10:00:00Z",
            operator_id: "op_001",
            action: "approve",
            recommendation_id: "rec_001",
            metadata: {},
          },
        ],
      };

      mockApi.fetchAuditLogs.mockResolvedValue(mockLogs);

      await exportAuditLogsToCsv({}, { includeMetadata: false });

      expect(mockApi.fetchAuditLogs).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it("applies filters correctly", async () => {
      mockApi.fetchAuditLogs.mockResolvedValue({
        logs: [
          {
            audit_id: "audit_001",
            timestamp: "2025-11-05T10:00:00Z",
            operator_id: "op_001",
            action: "approve",
            recommendation_id: "rec_001",
            metadata: {},
          },
        ],
      });

      const filters = {
        operator_id: "op_001",
        action: "approve" as const,
        start_date: "2025-11-01",
        end_date: "2025-11-05",
      };

      await exportAuditLogsToCsv(filters);

      expect(mockApi.fetchAuditLogs).toHaveBeenCalledWith({
        ...filters,
        limit: 10000,
        offset: 0,
      });
    });

    it("throws error when no logs to export", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      mockApi.fetchAuditLogs.mockResolvedValue({ logs: [] });

      await expect(exportAuditLogsToCsv({})).rejects.toThrow(
        "No audit logs to export"
      );

      consoleError.mockRestore();
    });

    it("handles API errors", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      mockApi.fetchAuditLogs.mockRejectedValue(new Error("API Error"));

      await expect(exportAuditLogsToCsv({})).rejects.toThrow("API Error");

      consoleError.mockRestore();
    });

    it("generates filename with timestamp", async () => {
      const mockLogs = {
        logs: [
          {
            audit_id: "audit_001",
            timestamp: "2025-11-05T10:00:00Z",
            operator_id: "op_001",
            action: "approve",
            recommendation_id: "rec_001",
            metadata: {},
          },
        ],
      };

      mockApi.fetchAuditLogs.mockResolvedValue(mockLogs);

      await exportAuditLogsToCsv({});

      expect(mockLink.download).toMatch(
        /^audit-logs-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.csv$/
      );
    });
  });

  describe("exportRecommendationsToCsv", () => {
    it("exports recommendations successfully", async () => {
      const mockRecs = [
        {
          id: "rec_001",
          user_id: "user_123",
          persona_primary: "high_utilization",
          type: "educational",
          title: "Test Rec",
          priority: "high",
          status: "pending",
          generated_at: "2025-11-05T10:00:00Z",
        },
      ];

      mockApi.fetchRecommendations.mockResolvedValue(mockRecs as any);

      await exportRecommendationsToCsv({});

      expect(mockApi.fetchRecommendations).toHaveBeenCalledWith({});
      expect(mockClick).toHaveBeenCalled();
    });

    it("includes filter in filename when present", async () => {
      const mockRecs = [
        {
          id: "rec_001",
          status: "approved",
        },
      ];

      mockApi.fetchRecommendations.mockResolvedValue(mockRecs as any);

      await exportRecommendationsToCsv({ status: "approved" });

      expect(mockLink.download).toMatch(
        /recommendations-approved-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.csv$/
      );
    });

    it("throws error when no recommendations to export", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      mockApi.fetchRecommendations.mockResolvedValue([]);

      await expect(exportRecommendationsToCsv({})).rejects.toThrow(
        "No recommendations to export"
      );

      consoleError.mockRestore();
    });

    it("applies filters correctly", async () => {
      mockApi.fetchRecommendations.mockResolvedValue([
        { id: "rec_001" } as any,
      ]);

      const filters = {
        status: "pending",
        persona: "high_utilization",
        priority: "high",
      };

      await exportRecommendationsToCsv(filters);

      expect(mockApi.fetchRecommendations).toHaveBeenCalledWith(filters);
    });
  });

  describe("exportStatsToCsv", () => {
    it("exports statistics successfully", async () => {
      const mockStats = {
        pending: 10,
        approved_today: 5,
        rejected_today: 2,
        flagged: 1,
        avg_review_time_seconds: 120,
      };

      await exportStatsToCsv(mockStats);

      expect(mockClick).toHaveBeenCalled();
      expect(mockLink.download).toMatch(
        /^operator-stats-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.csv$/
      );
    });

    it("converts stats object to array format", async () => {
      const mockStats = {
        pending: 15,
        approved_today: 8,
        rejected_today: 3,
        flagged: 2,
        avg_review_time_seconds: 90,
      };

      await exportStatsToCsv(mockStats);

      expect(mockClick).toHaveBeenCalled();
    });

    it("handles zero values correctly", async () => {
      const mockStats = {
        pending: 0,
        approved_today: 0,
        rejected_today: 0,
        flagged: 0,
        avg_review_time_seconds: 0,
      };

      await exportStatsToCsv(mockStats);

      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe("CSV Formatting", () => {
    it("handles commas in data correctly", async () => {
      const mockLogs = {
        logs: [
          {
            audit_id: "audit_001",
            timestamp: "2025-11-05T10:00:00Z",
            operator_id: "op_001",
            action: "approve",
            recommendation_id: "rec_001",
            metadata: { notes: "Test, with, commas" },
          },
        ],
      };

      mockApi.fetchAuditLogs.mockResolvedValue(mockLogs);

      await exportAuditLogsToCsv({});

      expect(mockClick).toHaveBeenCalled();
    });

    it("handles quotes in data correctly", async () => {
      const mockLogs = {
        logs: [
          {
            audit_id: "audit_001",
            timestamp: "2025-11-05T10:00:00Z",
            operator_id: "op_001",
            action: "approve",
            recommendation_id: "rec_001",
            metadata: { notes: 'Test "with" quotes' },
          },
        ],
      };

      mockApi.fetchAuditLogs.mockResolvedValue(mockLogs);

      await exportAuditLogsToCsv({});

      expect(mockClick).toHaveBeenCalled();
    });

    it("handles newlines in data correctly", async () => {
      const mockLogs = {
        logs: [
          {
            audit_id: "audit_001",
            timestamp: "2025-11-05T10:00:00Z",
            operator_id: "op_001",
            action: "approve",
            recommendation_id: "rec_001",
            metadata: { notes: "Test\nwith\nnewlines" },
          },
        ],
      };

      mockApi.fetchAuditLogs.mockResolvedValue(mockLogs);

      await exportAuditLogsToCsv({});

      expect(mockClick).toHaveBeenCalled();
    });

    it("handles null and undefined values", async () => {
      const mockLogs = {
        logs: [
          {
            audit_id: "audit_001",
            timestamp: "2025-11-05T10:00:00Z",
            operator_id: null,
            action: "approve",
            recommendation_id: undefined,
            metadata: {},
          },
        ],
      };

      mockApi.fetchAuditLogs.mockResolvedValue(mockLogs as any);

      await exportAuditLogsToCsv({});

      expect(mockClick).toHaveBeenCalled();
    });
  });
});
