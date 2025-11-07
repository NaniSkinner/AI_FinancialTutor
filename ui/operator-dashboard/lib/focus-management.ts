/**
 * Focus Management Utilities
 *
 * Provides utilities for managing focus within modal dialogs and other
 * interactive elements to improve keyboard navigation and accessibility.
 */

/**
 * Traps focus within a specified element (typically a modal)
 *
 * When focus trap is active:
 * - Tab cycles through focusable elements within the container
 * - Shift+Tab cycles backwards
 * - Focus never leaves the container
 *
 * @param element - The element to trap focus within
 * @returns Cleanup function to remove the focus trap
 *
 * @example
 * useEffect(() => {
 *   const modalElement = modalRef.current;
 *   if (modalElement && isOpen) {
 *     const cleanup = trapFocus(modalElement);
 *     return cleanup;
 *   }
 * }, [isOpen]);
 */
export function trapFocus(element: HTMLElement): () => void {
  // Get all focusable elements within the container
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) {
    // No focusable elements, nothing to trap
    return () => {};
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      // Shift+Tab: Moving backwards
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: Moving forwards
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  // Focus the first element when trap is activated
  firstElement.focus();

  // Add event listener
  element.addEventListener("keydown", handleTabKey);

  // Return cleanup function
  return () => {
    element.removeEventListener("keydown", handleTabKey);
  };
}

/**
 * Restores focus to a previously focused element
 * Useful for modals that need to return focus to the trigger element
 *
 * @param element - The element to restore focus to
 */
export function restoreFocus(element: HTMLElement | null): void {
  if (element && typeof element.focus === "function") {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      element.focus();
    }, 0);
  }
}

/**
 * Gets the currently focused element
 * Useful for saving focus before opening a modal
 *
 * @returns The currently focused element, or null
 */
export function getCurrentFocus(): HTMLElement | null {
  return document.activeElement as HTMLElement;
}
