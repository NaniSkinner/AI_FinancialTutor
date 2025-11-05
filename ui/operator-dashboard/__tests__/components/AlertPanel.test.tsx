import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { AlertPanel } from "@/components/AlertPanel/AlertPanel";
import { useAlerts } from "@/hooks/useAlerts";

// Mock the useAlerts hook
jest.mock("@/hooks/useAlerts");

// Mock SWR to avoid network requests
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("AlertPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when there are no alerts", () => {
    (useAlerts as jest.Mock).mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { container } = render(<AlertPanel />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when alerts data is undefined", () => {
    (useAlerts as jest.Mock).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { container } = render(<AlertPanel />);
    expect(container.firstChild).toBeNull();
  });

  it("renders alerts when data is available", () => {
    const mockAlerts = [
      {
        id: "alert_1",
        type: "high_rejection_rate",
        severity: "medium",
        message: "High rejection rate detected",
        createdAt: "2025-11-04T10:00:00Z",
      },
    ];

    (useAlerts as jest.Mock).mockReturnValue({
      data: mockAlerts,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    render(<AlertPanel />);

    // Check for warning icon
    expect(screen.getByText("⚠️")).toBeInTheDocument();

    // Check for alert message
    expect(
      screen.getByText("High rejection rate detected")
    ).toBeInTheDocument();
  });

  it("renders multiple alerts", () => {
    const mockAlerts = [
      {
        id: "alert_1",
        type: "high_rejection_rate",
        severity: "medium",
        message: "Alert 1",
        createdAt: "2025-11-04T10:00:00Z",
      },
      {
        id: "alert_2",
        type: "long_queue",
        severity: "high",
        message: "Alert 2",
        createdAt: "2025-11-04T10:00:00Z",
      },
    ];

    (useAlerts as jest.Mock).mockReturnValue({
      data: mockAlerts,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    render(<AlertPanel />);

    expect(screen.getByText("Alert 1")).toBeInTheDocument();
    expect(screen.getByText("Alert 2")).toBeInTheDocument();
  });
});
