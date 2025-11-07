/**
 * Utility Functions Tests
 * Tests for all utility functions in lib/utils.ts
 */

import {
  cn,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getPriorityColor,
  getPersonaColor,
  formatPersonaName,
  formatCurrency,
  formatPercentage,
  getSignalHealth,
} from "@/lib/utils";

describe("Utility Functions", () => {
  describe("cn - Class Name Utility", () => {
    it("merges class names correctly", () => {
      expect(cn("text-sm", "text-blue-500")).toBe("text-sm text-blue-500");
    });

    it("handles conditional classes", () => {
      expect(cn("text-sm", false && "hidden", "text-blue-500")).toBe(
        "text-sm text-blue-500"
      );
    });

    it("resolves Tailwind conflicts", () => {
      const result = cn("text-sm", "text-lg");
      // twMerge should keep only the last text size class
      expect(result).toBe("text-lg");
    });

    it("handles empty inputs", () => {
      expect(cn()).toBe("");
    });
  });

  describe("formatDate", () => {
    it("formats Date object correctly", () => {
      const date = new Date("2025-11-05T10:00:00Z");
      const result = formatDate(date);
      expect(result).toMatch(/Nov 5, 2025/);
    });

    it("formats date string correctly", () => {
      const result = formatDate("2025-11-05T10:00:00Z");
      expect(result).toMatch(/Nov 5, 2025/);
    });

    it("handles different date formats", () => {
      const result = formatDate("2025-01-15");
      expect(result).toMatch(/Jan 1[45], 2025/);
    });
  });

  describe("formatDateTime", () => {
    it("formats datetime with time", () => {
      const result = formatDateTime("2025-11-05T14:30:00Z");
      expect(result).toMatch(/Nov 5, 2025/);
      expect(result).toMatch(/\d{1,2}:\d{2}\s[AP]M/);
    });

    it("formats Date object with time", () => {
      const date = new Date("2025-11-05T14:30:00Z");
      const result = formatDateTime(date);
      expect(result).toMatch(/Nov 5, 2025/);
    });
  });

  describe("formatRelativeTime", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-11-05T12:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns "just now" for very recent times', () => {
      const date = new Date("2025-11-05T11:59:45Z"); // 15 seconds ago
      expect(formatRelativeTime(date)).toBe("just now");
    });

    it("returns minutes ago", () => {
      const date = new Date("2025-11-05T11:45:00Z"); // 15 minutes ago
      expect(formatRelativeTime(date)).toBe("15m ago");
    });

    it("returns hours ago", () => {
      const date = new Date("2025-11-05T09:00:00Z"); // 3 hours ago
      expect(formatRelativeTime(date)).toBe("3h ago");
    });

    it("returns days ago for recent days", () => {
      const date = new Date("2025-11-03T12:00:00Z"); // 2 days ago
      expect(formatRelativeTime(date)).toBe("2d ago");
    });

    it("returns formatted date for older dates", () => {
      const date = new Date("2025-10-20T12:00:00Z"); // 16 days ago
      const result = formatRelativeTime(date);
      expect(result).toMatch(/Oct 20, 2025/);
    });
  });

  describe("getPriorityColor", () => {
    it("returns red classes for high priority", () => {
      expect(getPriorityColor("high")).toBe("bg-red-100 text-red-800");
    });

    it("returns yellow classes for medium priority", () => {
      expect(getPriorityColor("medium")).toBe("bg-yellow-100 text-yellow-800");
    });

    it("returns green classes for low priority", () => {
      expect(getPriorityColor("low")).toBe("bg-green-100 text-green-800");
    });

    it("returns gray classes for unknown priority", () => {
      expect(getPriorityColor("unknown")).toBe("bg-gray-100 text-gray-800");
    });

    it("handles empty string", () => {
      expect(getPriorityColor("")).toBe("bg-gray-100 text-gray-800");
    });
  });

  describe("getPersonaColor", () => {
    it("returns red for high_utilization", () => {
      expect(getPersonaColor("high_utilization")).toBe(
        "bg-red-100 text-red-800"
      );
    });

    it("returns orange for variable_income_budgeter", () => {
      expect(getPersonaColor("variable_income_budgeter")).toBe(
        "bg-orange-100 text-orange-800"
      );
    });

    it("returns blue for student", () => {
      expect(getPersonaColor("student")).toBe("bg-blue-100 text-blue-800");
    });

    it("returns purple for subscription_heavy", () => {
      expect(getPersonaColor("subscription_heavy")).toBe(
        "bg-purple-100 text-purple-800"
      );
    });

    it("returns green for savings_builder", () => {
      expect(getPersonaColor("savings_builder")).toBe(
        "bg-green-100 text-green-800"
      );
    });

    it("returns gray for unknown persona", () => {
      expect(getPersonaColor("unknown_persona")).toBe(
        "bg-gray-100 text-gray-800"
      );
    });
  });

  describe("formatPersonaName", () => {
    it("formats snake_case to Title Case", () => {
      expect(formatPersonaName("high_utilization")).toBe("High Utilization");
    });

    it("handles multiple underscores", () => {
      expect(formatPersonaName("variable_income_budgeter")).toBe(
        "Variable Income Budgeter"
      );
    });

    it("handles single word", () => {
      expect(formatPersonaName("student")).toBe("Student");
    });

    it("handles empty string", () => {
      expect(formatPersonaName("")).toBe("");
    });

    it("preserves capitalization", () => {
      expect(formatPersonaName("savings_builder")).toBe("Savings Builder");
    });
  });

  describe("formatCurrency", () => {
    it("formats positive amounts", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });

    it("formats amounts without decimals when integer", () => {
      expect(formatCurrency(1000)).toBe("$1,000");
    });

    it("formats zero", () => {
      expect(formatCurrency(0)).toBe("$0");
    });

    it("formats negative amounts", () => {
      expect(formatCurrency(-500.25)).toBe("-$500.25");
    });

    it("formats large amounts with commas", () => {
      expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
    });

    it("handles small decimal amounts", () => {
      expect(formatCurrency(0.99)).toBe("$0.99");
    });
  });

  describe("formatPercentage", () => {
    it("formats integer percentages", () => {
      expect(formatPercentage(25)).toBe("25.0%");
    });

    it("formats decimal percentages", () => {
      expect(formatPercentage(25.5)).toBe("25.5%");
    });

    it("formats zero", () => {
      expect(formatPercentage(0)).toBe("0.0%");
    });

    it("formats negative percentages", () => {
      expect(formatPercentage(-5.2)).toBe("-5.2%");
    });

    it("rounds to one decimal place", () => {
      expect(formatPercentage(25.678)).toBe("25.7%");
    });
  });

  describe("getSignalHealth", () => {
    describe("credit_utilization", () => {
      it("returns good for low utilization (<30%)", () => {
        expect(getSignalHealth("credit_utilization", 25)).toBe("good");
      });

      it("returns warning for medium utilization (30-49%)", () => {
        expect(getSignalHealth("credit_utilization", 35)).toBe("warning");
      });

      it("returns critical for high utilization (>=50%)", () => {
        expect(getSignalHealth("credit_utilization", 75)).toBe("critical");
      });

      it("handles boundary at 30%", () => {
        expect(getSignalHealth("credit_utilization", 30)).toBe("warning");
      });

      it("handles boundary at 50%", () => {
        expect(getSignalHealth("credit_utilization", 50)).toBe("critical");
      });
    });

    describe("emergency_fund", () => {
      it("returns good for adequate fund (>=3 months)", () => {
        expect(getSignalHealth("emergency_fund", 6)).toBe("good");
      });

      it("returns warning for low fund (1-2.9 months)", () => {
        expect(getSignalHealth("emergency_fund", 2)).toBe("warning");
      });

      it("returns critical for very low fund (<1 month)", () => {
        expect(getSignalHealth("emergency_fund", 0.5)).toBe("critical");
      });

      it("handles boundary at 3 months", () => {
        expect(getSignalHealth("emergency_fund", 3)).toBe("good");
      });

      it("handles boundary at 1 month", () => {
        expect(getSignalHealth("emergency_fund", 1)).toBe("warning");
      });
    });

    describe("income_variability", () => {
      it("returns good for low variability (<20%)", () => {
        expect(getSignalHealth("income_variability", 15)).toBe("good");
      });

      it("returns warning for medium variability (20-39%)", () => {
        expect(getSignalHealth("income_variability", 25)).toBe("warning");
      });

      it("returns critical for high variability (>=40%)", () => {
        expect(getSignalHealth("income_variability", 50)).toBe("critical");
      });

      it("handles boundary at 20%", () => {
        expect(getSignalHealth("income_variability", 20)).toBe("warning");
      });

      it("handles boundary at 40%", () => {
        expect(getSignalHealth("income_variability", 40)).toBe("critical");
      });
    });

    describe("unknown signal types", () => {
      it("returns good for unknown types", () => {
        expect(getSignalHealth("unknown_type", 100)).toBe("good");
      });

      it("returns good for empty string", () => {
        expect(getSignalHealth("", 50)).toBe("good");
      });
    });
  });
});
