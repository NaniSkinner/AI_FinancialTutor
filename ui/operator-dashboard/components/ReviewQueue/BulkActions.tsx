"use client";

import React, { useState } from "react";
import { Button } from "@/components/Common/Button";
import { Modal } from "@/components/Common/Modal";
import { useToast } from "@/components/Common/Toast";

interface Props {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onBulkApprove: () => Promise<void>;
}

/**
 * BulkActions component for performing actions on multiple recommendations
 * Shows selection count and provides bulk approve with confirmation
 */
export function BulkActions({
  selectedCount,
  selectedIds,
  onClearSelection,
  onBulkApprove,
}: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const handleBulkApprove = async () => {
    setIsProcessing(true);
    try {
      await onBulkApprove();
      showToast(
        `Successfully approved ${selectedCount} recommendations`,
        "success"
      );
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Bulk approve failed:", error);
      showToast("Bulk approve failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
              {selectedCount} recommendation{selectedCount !== 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowConfirmModal(true)}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Bulk Approve ({selectedCount})
            </Button>
            <Button variant="ghost" onClick={onClearSelection}>
              Clear Selection
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Bulk Approval"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to approve <strong>{selectedCount}</strong>{" "}
            recommendation{selectedCount !== 1 ? "s" : ""}?
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ This action will immediately send these recommendations to
              users. Please ensure you&apos;ve reviewed all selected items.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowConfirmModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkApprove}
              disabled={isProcessing}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isProcessing
                ? "Processing..."
                : `Approve ${selectedCount} Item${
                    selectedCount !== 1 ? "s" : ""
                  }`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
