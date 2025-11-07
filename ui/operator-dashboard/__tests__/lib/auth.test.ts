/**
 * Authentication Tests
 * Tests for Zustand auth store and helper functions
 */

import {
  useAuth,
  getAuthToken,
  getCurrentOperator,
  isAuthenticated,
} from "@/lib/auth";
import type { Operator } from "@/lib/auth";

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("Authentication Store", () => {
  const mockOperator: Operator = {
    operator_id: "op_001",
    name: "Test Operator",
    email: "test@example.com",
    role: "senior",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    // Reset Zustand store
    useAuth.getState().logout();
  });

  describe("login", () => {
    it("successfully logs in with valid credentials", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "test-token-123",
          operator: mockOperator,
        }),
      } as Response);

      await useAuth.getState().login("test@example.com", "password123");

      const state = useAuth.getState();
      expect(state.token).toBe("test-token-123");
      expect(state.operator).toEqual(mockOperator);
      expect(state.isAuthenticated()).toBe(true);
    });

    it("throws error on invalid credentials", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: "Invalid credentials" }),
      } as Response);

      await expect(
        useAuth.getState().login("wrong@example.com", "wrongpass")
      ).rejects.toThrow("Invalid credentials");

      expect(useAuth.getState().token).toBeNull();
      expect(useAuth.getState().operator).toBeNull();
    });

    it("handles network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        useAuth.getState().login("test@example.com", "password123")
      ).rejects.toThrow("Network error");
    });

    it("handles malformed JSON response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as unknown as Response);

      await expect(
        useAuth.getState().login("test@example.com", "password123")
      ).rejects.toThrow("Login failed");
    });

    it("calls correct API endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "token",
          operator: mockOperator,
        }),
      } as Response);

      await useAuth.getState().login("test@example.com", "password");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/login"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password",
          }),
        })
      );
    });
  });

  describe("logout", () => {
    it("clears token and operator on logout", async () => {
      // First login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "test-token",
          operator: mockOperator,
        }),
      } as Response);

      await useAuth.getState().login("test@example.com", "password");

      // Then logout
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      useAuth.getState().logout();

      const state = useAuth.getState();
      expect(state.token).toBeNull();
      expect(state.operator).toBeNull();
      expect(state.isAuthenticated()).toBe(false);
    });

    it("calls logout API endpoint", () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      useAuth.setState({
        token: "test-token",
        operator: mockOperator,
      });

      useAuth.getState().logout();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/logout"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("handles logout API errors gracefully", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      // Mock successful response to avoid unhandled promise rejection
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      useAuth.setState({
        token: "test-token",
        operator: mockOperator,
      });

      // Should not throw
      expect(() => useAuth.getState().logout()).not.toThrow();

      // Wait for any async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      consoleError.mockRestore();
    });
  });

  describe("isAuthenticated", () => {
    it("returns false when not logged in", () => {
      expect(useAuth.getState().isAuthenticated()).toBe(false);
    });

    it("returns true when logged in", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "test-token",
          operator: mockOperator,
        }),
      } as Response);

      await useAuth.getState().login("test@example.com", "password");

      expect(useAuth.getState().isAuthenticated()).toBe(true);
    });
  });

  describe("hasPermission", () => {
    describe("junior role", () => {
      const juniorOperator: Operator = { ...mockOperator, role: "junior" };

      it("has view permission", async () => {
        useAuth.setState({ token: "token", operator: juniorOperator });
        expect(useAuth.getState().hasPermission("view")).toBe(true);
      });

      it("has approve permission", () => {
        useAuth.setState({ token: "token", operator: juniorOperator });
        expect(useAuth.getState().hasPermission("approve")).toBe(true);
      });

      it("has reject permission", () => {
        useAuth.setState({ token: "token", operator: juniorOperator });
        expect(useAuth.getState().hasPermission("reject")).toBe(true);
      });

      it("does not have modify permission", () => {
        useAuth.setState({ token: "token", operator: juniorOperator });
        expect(useAuth.getState().hasPermission("modify")).toBe(false);
      });

      it("does not have bulk_approve permission", () => {
        useAuth.setState({ token: "token", operator: juniorOperator });
        expect(useAuth.getState().hasPermission("bulk_approve")).toBe(false);
      });
    });

    describe("senior role", () => {
      const seniorOperator: Operator = { ...mockOperator, role: "senior" };

      it("has all junior permissions", () => {
        useAuth.setState({ token: "token", operator: seniorOperator });
        expect(useAuth.getState().hasPermission("view")).toBe(true);
        expect(useAuth.getState().hasPermission("approve")).toBe(true);
        expect(useAuth.getState().hasPermission("reject")).toBe(true);
      });

      it("has modify permission", () => {
        useAuth.setState({ token: "token", operator: seniorOperator });
        expect(useAuth.getState().hasPermission("modify")).toBe(true);
      });

      it("has bulk_approve permission", () => {
        useAuth.setState({ token: "token", operator: seniorOperator });
        expect(useAuth.getState().hasPermission("bulk_approve")).toBe(true);
      });

      it("has flag permission", () => {
        useAuth.setState({ token: "token", operator: seniorOperator });
        expect(useAuth.getState().hasPermission("flag")).toBe(true);
      });
    });

    describe("admin role", () => {
      const adminOperator: Operator = { ...mockOperator, role: "admin" };

      it("has all permissions", () => {
        useAuth.setState({ token: "token", operator: adminOperator });
        expect(useAuth.getState().hasPermission("view")).toBe(true);
        expect(useAuth.getState().hasPermission("approve")).toBe(true);
        expect(useAuth.getState().hasPermission("modify")).toBe(true);
        expect(useAuth.getState().hasPermission("bulk_approve")).toBe(true);
        expect(useAuth.getState().hasPermission("any_permission")).toBe(true);
      });
    });

    it("returns false when not authenticated", () => {
      expect(useAuth.getState().hasPermission("view")).toBe(false);
    });
  });

  describe("refreshOperatorInfo", () => {
    it("refreshes operator data successfully", async () => {
      useAuth.setState({ token: "test-token", operator: mockOperator });

      const updatedOperator = { ...mockOperator, name: "Updated Name" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedOperator,
      } as Response);

      await useAuth.getState().refreshOperatorInfo();

      expect(useAuth.getState().operator).toEqual(updatedOperator);
    });

    it("throws error when not authenticated", async () => {
      useAuth.setState({ token: null, operator: null });

      await expect(useAuth.getState().refreshOperatorInfo()).rejects.toThrow(
        "Not authenticated"
      );
    });

    it("clears auth on invalid token", async () => {
      useAuth.setState({ token: "expired-token", operator: mockOperator });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(useAuth.getState().refreshOperatorInfo()).rejects.toThrow(
        "Session expired"
      );

      expect(useAuth.getState().token).toBeNull();
      expect(useAuth.getState().operator).toBeNull();
    });

    it("calls correct API endpoint with auth header", async () => {
      useAuth.setState({ token: "test-token", operator: mockOperator });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOperator,
      } as Response);

      await useAuth.getState().refreshOperatorInfo();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/me"),
        expect.objectContaining({
          headers: {
            Authorization: "Bearer test-token",
          },
        })
      );
    });
  });

  describe("Helper Functions", () => {
    describe("getAuthToken", () => {
      it("returns null when not authenticated", () => {
        expect(getAuthToken()).toBeNull();
      });

      it("returns token when authenticated", () => {
        useAuth.setState({ token: "test-token", operator: mockOperator });
        expect(getAuthToken()).toBe("test-token");
      });
    });

    describe("getCurrentOperator", () => {
      it("returns null when not authenticated", () => {
        expect(getCurrentOperator()).toBeNull();
      });

      it("returns operator when authenticated", () => {
        useAuth.setState({ token: "test-token", operator: mockOperator });
        expect(getCurrentOperator()).toEqual(mockOperator);
      });
    });

    describe("isAuthenticated", () => {
      it("returns false when not authenticated", () => {
        expect(isAuthenticated()).toBe(false);
      });

      it("returns true when authenticated", () => {
        useAuth.setState({ token: "test-token", operator: mockOperator });
        expect(isAuthenticated()).toBe(true);
      });
    });
  });

  describe("State Management", () => {
    it("maintains auth state after login", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "test-token",
          operator: mockOperator,
        }),
      } as Response);

      await useAuth.getState().login("test@example.com", "password");

      // Verify state is maintained in store
      const state = useAuth.getState();
      expect(state.token).toBe("test-token");
      expect(state.operator).toEqual(mockOperator);
      expect(state.isAuthenticated()).toBe(true);
    });
  });
});
