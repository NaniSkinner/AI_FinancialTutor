/**
 * RecommendationCard Component Tests
 * Tests for individual recommendation card functionality
 */

import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "../../__test-utils/test-utils";
import { RecommendationCard } from "@/components/ReviewQueue/RecommendationCard";
import {
  approveRecommendation,
  rejectRecommendation,
  modifyRecommendation,
  flagRecommendation,
} from "@/lib/api";
import { createMockRecommendation } from "../../__test-utils/mock-data";

// Mock API functions
jest.mock("@/lib/api");
jest.mock("@/hooks/useKeyboardShortcuts");
jest.mock("@/components/Common/Toast", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

const mockApprove = approveRecommendation as jest.MockedFunction<
  typeof approveRecommendation
>;
const mockReject = rejectRecommendation as jest.MockedFunction<
  typeof rejectRecommendation
>;
const mockModify = modifyRecommendation as jest.MockedFunction<
  typeof modifyRecommendation
>;
const mockFlag = flagRecommendation as jest.MockedFunction<
  typeof flagRecommendation
>;

describe("RecommendationCard", () => {
  const mockOnToggleSelect = jest.fn();
  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.prompt = jest.fn();
  });

  describe("Rendering", () => {
    it("renders recommendation data correctly", () => {
      const mockRec = createMockRecommendation({
        title: "Test Recommendation Title",
        rationale: "Test rationale",
        priority: "high",
        persona_primary: "high_utilization",
      });

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      expect(screen.getByText("Test Recommendation Title")).toBeInTheDocument();
      expect(screen.getByText("Test rationale")).toBeInTheDocument();
      expect(screen.getByText("HIGH")).toBeInTheDocument();
    });

    it("displays guardrail status correctly - all passed", () => {
      const mockRec = createMockRecommendation({
        guardrails_passed: {
          tone_check: true,
          advice_check: true,
          eligibility_check: true,
        },
      });

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      // Should show checkmarks for passed guardrails
      const passedIndicators = screen.getAllByText("✓");
      expect(passedIndicators.length).toBeGreaterThan(0);
    });

    it("displays guardrail status correctly - some failed", () => {
      const mockRec = createMockRecommendation({
        guardrails_passed: {
          tone_check: false,
          advice_check: true,
          eligibility_check: true,
        },
      });

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      // Should show both checkmarks and X marks
      expect(screen.getByText("✗")).toBeInTheDocument();
      const passedIndicators = screen.getAllByText("✓");
      expect(passedIndicators.length).toBeGreaterThan(0);
    });

    it("shows selected state when isSelected is true", () => {
      const mockRec = createMockRecommendation();

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={true}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });
  });

  describe("Checkbox Selection", () => {
    it("calls onToggleSelect when checkbox clicked", () => {
      const mockRec = createMockRecommendation();

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockOnToggleSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe("Approve Action", () => {
    it("calls approve API when approve button clicked", async () => {
      const mockRec = createMockRecommendation();
      mockApprove.mockResolvedValue(mockRec);

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      const approveButton = screen.getByText(/Approve/i);
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockApprove).toHaveBeenCalledWith(mockRec.id, { notes: "" });
        expect(mockOnAction).toHaveBeenCalled();
      });
    });

    it("shows loading state during approve", async () => {
      const mockRec = createMockRecommendation();
      mockApprove.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      const approveButton = screen.getByText(/Approve/i);
      fireEvent.click(approveButton);

      // Button should be disabled during loading
      expect(approveButton).toBeDisabled();
    });
  });

  describe("Reject Action", () => {
    it("prompts for reason and calls reject API", async () => {
      const mockRec = createMockRecommendation();
      mockReject.mockResolvedValue(mockRec);
      (global.prompt as jest.Mock).mockReturnValue("Not relevant");

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      const rejectButton = screen.getByText(/Reject/i);
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(global.prompt).toHaveBeenCalled();
        expect(mockReject).toHaveBeenCalledWith(mockRec.id, {
          reason: "Not relevant",
        });
        expect(mockOnAction).toHaveBeenCalled();
      });
    });

    it("does not call API if reason is empty", async () => {
      const mockRec = createMockRecommendation();
      (global.prompt as jest.Mock).mockReturnValue("");

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      const rejectButton = screen.getByText(/Reject/i);
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(mockReject).not.toHaveBeenCalled();
      });
    });

    it("does not call API if prompt is cancelled", async () => {
      const mockRec = createMockRecommendation();
      (global.prompt as jest.Mock).mockReturnValue(null);

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      const rejectButton = screen.getByText(/Reject/i);
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(mockReject).not.toHaveBeenCalled();
      });
    });
  });

  describe("Modify Action", () => {
    it("toggles modify mode when modify button clicked", () => {
      const mockRec = createMockRecommendation();

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      const modifyButton = screen.getByText(/Modify/i);
      fireEvent.click(modifyButton);

      // Should show save and cancel buttons
      expect(screen.getByText(/Save/i)).toBeInTheDocument();
      expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    });

    it("saves modification when save button clicked", async () => {
      const mockRec = createMockRecommendation();
      mockModify.mockResolvedValue(mockRec);

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      const modifyButton = screen.getByText(/Modify/i);
      fireEvent.click(modifyButton);

      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockModify).toHaveBeenCalled();
        expect(mockOnAction).toHaveBeenCalled();
      });
    });

    it("cancels modification when cancel button clicked", () => {
      const mockRec = createMockRecommendation();

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      const modifyButton = screen.getByText(/Modify/i);
      fireEvent.click(modifyButton);

      const cancelButton = screen.getByText(/Cancel/i);
      fireEvent.click(cancelButton);

      // Should be back to normal mode
      expect(screen.queryByText(/Save/i)).not.toBeInTheDocument();
    });
  });

  describe("Flag Action", () => {
    it("prompts for reason and calls flag API", async () => {
      const mockRec = createMockRecommendation();
      mockFlag.mockResolvedValue(mockRec);
      (global.prompt as jest.Mock).mockReturnValue("Needs review");

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      const flagButton = screen.getByText(/Flag/i);
      fireEvent.click(flagButton);

      await waitFor(() => {
        expect(global.prompt).toHaveBeenCalled();
        expect(mockFlag).toHaveBeenCalledWith(mockRec.id, {
          reason: "Needs review",
        });
        expect(mockOnAction).toHaveBeenCalled();
      });
    });
  });

  describe("Decision Traces", () => {
    it("toggles decision traces when button clicked", () => {
      const mockRec = createMockRecommendation();

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      const tracesButton = screen.getByText(/Show Traces/i);
      fireEvent.click(tracesButton);

      // After clicking, button text should change to "Hide Traces"
      expect(screen.getByText(/Hide Traces/i)).toBeInTheDocument();
    });
  });

  describe("Status Badges", () => {
    it("displays correct priority badge", () => {
      const mockRec = createMockRecommendation({ priority: "high" });

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      // Priority badge shows uppercase
      expect(screen.getByText("HIGH")).toBeInTheDocument();
    });

    it("displays persona badge", () => {
      const mockRec = createMockRecommendation({
        persona_primary: "high_utilization",
      });

      render(
        <RecommendationCard
          recommendation={mockRec}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onAction={mockOnAction}
        />
      );

      // The formatted persona name should be displayed
      expect(screen.getByText(/High Utilization/i)).toBeInTheDocument();
    });
  });
});
