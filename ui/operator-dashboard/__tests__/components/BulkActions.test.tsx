/**
 * BulkActions Component Tests
 * Tests for bulk operations on recommendations
 */

import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "../../__test-utils/test-utils";
import { BulkActions } from "@/components/ReviewQueue/BulkActions";

// Mock Toast hook
jest.mock("@/components/Common/Toast", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

describe("BulkActions", () => {
  const mockOnClearSelection = jest.fn();
  const mockOnBulkApprove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Display", () => {
    it("shows count of selected items", () => {
      render(
        <BulkActions
          selectedCount={5}
          selectedIds={["1", "2", "3", "4", "5"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      expect(
        screen.getByText("5 recommendations selected")
      ).toBeInTheDocument();
    });

    it("uses singular form for single item", () => {
      render(
        <BulkActions
          selectedCount={1}
          selectedIds={["1"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      expect(screen.getByText("1 recommendation selected")).toBeInTheDocument();
    });

    it("shows count in bulk approve button", () => {
      render(
        <BulkActions
          selectedCount={3}
          selectedIds={["1", "2", "3"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      expect(screen.getByText("Bulk Approve (3)")).toBeInTheDocument();
    });
  });

  describe("Clear Selection", () => {
    it("calls onClearSelection when clear button clicked", () => {
      render(
        <BulkActions
          selectedCount={5}
          selectedIds={["1", "2", "3", "4", "5"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      const clearButton = screen.getByText("Clear Selection");
      fireEvent.click(clearButton);

      expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe("Bulk Approve Confirmation", () => {
    it("shows confirmation modal when bulk approve clicked", () => {
      render(
        <BulkActions
          selectedCount={3}
          selectedIds={["1", "2", "3"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      const bulkApproveButton = screen.getByText("Bulk Approve (3)");
      fireEvent.click(bulkApproveButton);

      expect(screen.getByText("Confirm Bulk Approval")).toBeInTheDocument();
    });

    it("displays warning message in modal", () => {
      render(
        <BulkActions
          selectedCount={3}
          selectedIds={["1", "2", "3"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      const bulkApproveButton = screen.getByText("Bulk Approve (3)");
      fireEvent.click(bulkApproveButton);

      expect(
        screen.getByText(/This action will immediately send/i)
      ).toBeInTheDocument();
    });

    it("shows correct count in confirmation modal", () => {
      render(
        <BulkActions
          selectedCount={5}
          selectedIds={["1", "2", "3", "4", "5"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      const bulkApproveButton = screen.getByText("Bulk Approve (5)");
      fireEvent.click(bulkApproveButton);

      expect(
        screen.getByText(/Are you sure you want to approve/)
      ).toBeInTheDocument();
      expect(screen.getByText("Approve 5 Items")).toBeInTheDocument();
    });
  });

  describe("Confirming Bulk Approve", () => {
    it("calls onBulkApprove when confirmed", async () => {
      mockOnBulkApprove.mockResolvedValue(undefined);

      render(
        <BulkActions
          selectedCount={3}
          selectedIds={["1", "2", "3"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      // Open modal
      const bulkApproveButton = screen.getByText("Bulk Approve (3)");
      fireEvent.click(bulkApproveButton);

      // Confirm
      const confirmButton = screen.getByText("Approve 3 Items");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnBulkApprove).toHaveBeenCalledTimes(1);
      });
    });

    it("closes modal after successful approval", async () => {
      mockOnBulkApprove.mockResolvedValue(undefined);

      render(
        <BulkActions
          selectedCount={2}
          selectedIds={["1", "2"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      // Open modal
      const bulkApproveButton = screen.getByText("Bulk Approve (2)");
      fireEvent.click(bulkApproveButton);

      // Confirm
      const confirmButton = screen.getByText("Approve 2 Items");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Confirm Bulk Approval")
        ).not.toBeInTheDocument();
      });
    });

    it("shows processing state during approval", async () => {
      mockOnBulkApprove.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <BulkActions
          selectedCount={3}
          selectedIds={["1", "2", "3"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      // Open modal
      const bulkApproveButton = screen.getByText("Bulk Approve (3)");
      fireEvent.click(bulkApproveButton);

      // Confirm
      const confirmButton = screen.getByText("Approve 3 Items");
      fireEvent.click(confirmButton);

      // Should show processing state
      expect(screen.getByText("Processing...")).toBeInTheDocument();
      expect(confirmButton).toBeDisabled();
    });
  });

  describe("Canceling Bulk Approve", () => {
    it("closes modal when cancel clicked", () => {
      render(
        <BulkActions
          selectedCount={3}
          selectedIds={["1", "2", "3"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      // Open modal
      const bulkApproveButton = screen.getByText("Bulk Approve (3)");
      fireEvent.click(bulkApproveButton);

      // Cancel
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(
        screen.queryByText("Confirm Bulk Approval")
      ).not.toBeInTheDocument();
    });

    it("does not call onBulkApprove when cancelled", () => {
      render(
        <BulkActions
          selectedCount={3}
          selectedIds={["1", "2", "3"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      // Open modal
      const bulkApproveButton = screen.getByText("Bulk Approve (3)");
      fireEvent.click(bulkApproveButton);

      // Cancel
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(mockOnBulkApprove).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("handles bulk approve failure gracefully", async () => {
      mockOnBulkApprove.mockRejectedValue(new Error("API Error"));

      render(
        <BulkActions
          selectedCount={2}
          selectedIds={["1", "2"]}
          onClearSelection={mockOnClearSelection}
          onBulkApprove={mockOnBulkApprove}
        />
      );

      // Open modal
      const bulkApproveButton = screen.getByText("Bulk Approve (2)");
      fireEvent.click(bulkApproveButton);

      // Confirm
      const confirmButton = screen.getByText("Approve 2 Items");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnBulkApprove).toHaveBeenCalled();
        // Modal should still be open after error
        expect(screen.getByText("Confirm Bulk Approval")).toBeInTheDocument();
      });
    });
  });
});
