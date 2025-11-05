import "@testing-library/jest-dom";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

// Use fake timers
jest.useFakeTimers();

describe("useDebounce", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("debounces value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    // Initial value
    expect(result.current).toBe("initial");

    // Update value
    rerender({ value: "updated", delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe("initial");

    // Fast-forward time by 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now value should be updated
    expect(result.current).toBe("updated");
  });

  it("resets timer on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    );

    // Change value multiple times rapidly
    rerender({ value: "change1" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: "change2" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: "final" });

    // Value should still be initial
    expect(result.current).toBe("initial");

    // Fast-forward full delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Only the final value should be set
    expect(result.current).toBe("final");
  });

  it("handles custom delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 1000 } }
    );

    rerender({ value: "updated", delay: 1000 });

    // Should not update after 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("initial");

    // Should update after full 1000ms
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("updated");
  });
});
