import { useEffect } from "react";

interface KeyboardShortcuts {
  onApprove?: () => void;
  onReject?: () => void;
  onFlag?: () => void;
  onModify?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onToggleSelection?: () => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
}

/**
 * Custom hook for handling keyboard shortcuts in the operator dashboard
 * Supports single-key shortcuts and modifier key combinations
 * Automatically ignores shortcuts when typing in input/textarea elements
 * @param shortcuts - Object mapping shortcut actions to handler functions
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts if user is typing in an input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const { key, metaKey, ctrlKey } = event;

      // Single key shortcuts
      switch (key.toLowerCase()) {
        case "a":
          // Only trigger approve if NOT using Cmd/Ctrl+A (select all)
          if (!metaKey && !ctrlKey) {
            event.preventDefault();
            shortcuts.onApprove?.();
          }
          break;
        case "r":
          event.preventDefault();
          shortcuts.onReject?.();
          break;
        case "f":
          event.preventDefault();
          shortcuts.onFlag?.();
          break;
        case "m":
          event.preventDefault();
          shortcuts.onModify?.();
          break;
        case "arrowdown":
          event.preventDefault();
          shortcuts.onNext?.();
          break;
        case "arrowup":
          event.preventDefault();
          shortcuts.onPrevious?.();
          break;
        case " ":
          event.preventDefault();
          shortcuts.onToggleSelection?.();
          break;
        case "escape":
          event.preventDefault();
          shortcuts.onClearSelection?.();
          break;
      }

      // Cmd/Ctrl + A for select all
      if ((metaKey || ctrlKey) && key === "a") {
        event.preventDefault();
        shortcuts.onSelectAll?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts]);
}
