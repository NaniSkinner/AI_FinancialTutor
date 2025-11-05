"use client";

import React from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface Props {
  onApprove?: () => void;
  onReject?: () => void;
  onFlag?: () => void;
  onModify?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onToggleSelection?: () => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  enabled?: boolean;
}

/**
 * KeyboardShortcutsHandler Component
 *
 * A behavioral component that enables global keyboard shortcuts for the operator dashboard.
 * This component renders nothing but sets up event listeners for keyboard shortcuts.
 *
 * Usage:
 * <KeyboardShortcutsHandler
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 *   enabled={true}
 * />
 *
 * Features:
 * - Can be conditionally enabled/disabled
 * - Passes all handlers to the useKeyboardShortcuts hook
 * - Automatically prevents shortcuts when typing in inputs/textareas
 * - Supports both single-key and modifier key combinations
 *
 * @param props - Handler functions for each keyboard shortcut action
 * @returns null - This is a behavioral component with no visual output
 */
export function KeyboardShortcutsHandler({
  onApprove,
  onReject,
  onFlag,
  onModify,
  onNext,
  onPrevious,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  enabled = true,
}: Props) {
  // Only set up shortcuts if enabled
  useKeyboardShortcuts(
    enabled
      ? {
          onApprove,
          onReject,
          onFlag,
          onModify,
          onNext,
          onPrevious,
          onToggleSelection,
          onSelectAll,
          onClearSelection,
        }
      : {}
  );

  // Behavioral component - renders nothing
  return null;
}
