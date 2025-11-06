import React, { useState, useEffect } from "react";
import { Modal } from "@/components/Common/Modal";
import { Button } from "@/components/Common/Button";

/**
 * Keyboard Shortcuts Legend Component
 *
 * Displays a floating button that opens a modal with all available keyboard shortcuts.
 * Can be opened by clicking the button or pressing '?' key.
 *
 * Features:
 * - Floating button in bottom-right corner
 * - Modal with complete shortcuts list
 * - Auto-open with '?' key press
 * - Responsive design
 */
export function KeyboardShortcutsLegend() {
  const [showModal, setShowModal] = useState(false);

  const shortcuts = [
    { key: "a", description: "Approve selected recommendation" },
    { key: "r", description: "Reject selected recommendation" },
    { key: "f", description: "Flag selected recommendation" },
    { key: "m", description: "Modify selected recommendation" },
    { key: "↓", description: "Next recommendation" },
    { key: "↑", description: "Previous recommendation" },
    { key: "Space", description: "Toggle selection" },
    { key: "Cmd/Ctrl + A", description: "Select all" },
    { key: "Esc", description: "Clear selection" },
    { key: "?", description: "Show this help" },
  ];

  // Listen for '?' key to open legend
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Open modal on '?' key press (shift + /)
      // Don't trigger if already in an input/textarea
      if (
        e.key === "?" &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
      ) {
        e.preventDefault();
        setShowModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 bg-white shadow-lg hover:shadow-xl transition-shadow z-50"
        aria-label="Show keyboard shortcuts"
      >
        Shortcuts
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Keyboard Shortcuts"
      >
        <div className="space-y-1">
          {shortcuts.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm text-gray-700">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-800 ml-4">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Keyboard shortcuts only work when not typing
            in an input field. Press{" "}
            <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">
              ?
            </kbd>{" "}
            anytime to see this help.
          </p>
        </div>
      </Modal>
    </>
  );
}
