/**
 * Test Utilities
 * Custom render functions and helpers for testing components with providers
 */

import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { SWRConfig } from "swr";

/**
 * Custom render function that includes all necessary providers
 * Use this instead of @testing-library/react's render for components that use SWR
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SWRConfig
        value={{
          provider: () => new Map(),
          dedupingInterval: 0, // Disable deduping for tests
        }}
      >
        {children}
      </SWRConfig>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { renderWithProviders as render };
