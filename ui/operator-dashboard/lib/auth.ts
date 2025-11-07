/**
 * Authentication Store
 *
 * JWT-based authentication with Zustand for state management
 * Persists authentication state to localStorage
 *
 * Usage:
 * const { login, logout, isAuthenticated, hasPermission } = useAuth();
 *
 * if (isAuthenticated()) {
 *   // User is logged in
 * }
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

// ============================================================================
// Production Safety Checks
// ============================================================================

/**
 * Detect if we're running in a production environment
 * (not localhost or 127.0.0.1)
 */
const IS_PRODUCTION =
  typeof window !== "undefined" &&
  !window.location.hostname.includes("localhost") &&
  !window.location.hostname.includes("127.0.0.1");

/**
 * Force mock mode if we detect production with localhost API URL
 * This prevents CORS errors when deployed to Vercel/Netlify
 */
const SHOULD_USE_MOCK =
  USE_MOCK_DATA || (IS_PRODUCTION && API_URL.includes("localhost"));

// Log warning if we're forcing mock mode due to localhost detection
if (SHOULD_USE_MOCK && IS_PRODUCTION && API_URL.includes("localhost")) {
  console.warn(
    "[AUTH] Production environment detected with localhost API URL - forcing mock mode to prevent CORS errors"
  );
  console.warn("[AUTH] API_URL:", API_URL);
  console.warn("[AUTH] Hostname:", typeof window !== "undefined" ? window.location.hostname : "SSR");
}

// ============================================================================
// Types
// ============================================================================

export interface Operator {
  operator_id: string;
  name: string;
  email: string;
  role: "junior" | "senior" | "admin";
}

interface AuthState {
  // State
  token: string | null;
  operator: Operator | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasPermission: (permission: string) => boolean;
  refreshOperatorInfo: () => Promise<void>;
}

// ============================================================================
// Mock Authentication Data
// ============================================================================

const MOCK_OPERATORS: Record<string, { password: string; operator: Operator }> =
  {
    "jane.doe@spendsense.com": {
      password: "password123",
      operator: {
        operator_id: "op_001",
        name: "Jane Doe",
        email: "jane.doe@spendsense.com",
        role: "senior",
      },
    },
    "john.smith@spendsense.com": {
      password: "password123",
      operator: {
        operator_id: "op_002",
        name: "John Smith",
        email: "john.smith@spendsense.com",
        role: "junior",
      },
    },
    "admin@spendsense.com": {
      password: "admin123",
      operator: {
        operator_id: "op_admin",
        name: "Admin User",
        email: "admin@spendsense.com",
        role: "admin",
      },
    },
  };

// ============================================================================
// Role-Based Permissions
// ============================================================================

const ROLE_PERMISSIONS: Record<string, string[]> = {
  junior: ["view", "approve", "reject"],
  senior: ["view", "approve", "reject", "modify", "bulk_approve", "flag"],
  admin: ["*"], // All permissions
};

/**
 * Check if a role has a specific permission
 */
function roleHasPermission(role: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  // Admin has all permissions
  if (permissions.includes("*")) return true;

  return permissions.includes(permission);
}

// ============================================================================
// Auth Store
// ============================================================================

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      token: null,
      operator: null,

      // Login action
      login: async (email: string, password: string) => {
        // Mock authentication when in mock data mode
        if (SHOULD_USE_MOCK) {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Check if credentials exist in mock data
          const mockUser = MOCK_OPERATORS[email];

          if (!mockUser || mockUser.password !== password) {
            throw new Error("Invalid email or password");
          }

          // Generate mock token
          const mockToken = `mock_token_${Date.now()}_${mockUser.operator.operator_id}`;

          // Store token and operator info
          set({
            token: mockToken,
            operator: mockUser.operator,
          });

          return;
        }

        // Real authentication via API
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response
            .json()
            .catch(() => ({ detail: "Login failed" }));
          throw new Error(error.detail || "Invalid credentials");
        }

        const data = await response.json();

        // Store token and operator info
        set({
          token: data.access_token,
          operator: data.operator,
        });
      },

      // Logout action
      logout: () => {
        set({
          token: null,
          operator: null,
        });

        // Skip API call in mock mode
        if (SHOULD_USE_MOCK) {
          return;
        }

        // Optional: Call logout endpoint (for logging purposes)
        try {
          fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${get().token}`,
            },
          });
        } catch (error) {
          // Ignore errors on logout
          console.error("Logout API error:", error);
        }
      },

      // Check if user is authenticated
      isAuthenticated: () => {
        const { token } = get();
        return !!token;
      },

      // Check if user has a specific permission
      hasPermission: (permission: string) => {
        const { operator } = get();
        if (!operator) return false;

        return roleHasPermission(operator.role, permission);
      },

      // Refresh operator info from API
      refreshOperatorInfo: async () => {
        const { token, operator } = get();
        if (!token) {
          throw new Error("Not authenticated");
        }

        // In mock mode, operator info is already set and doesn't need refreshing
        if (SHOULD_USE_MOCK) {
          if (!operator) {
            throw new Error("Session expired");
          }
          return;
        }

        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Token expired or invalid
          set({ token: null, operator: null });
          throw new Error("Session expired");
        }

        const fetchedOperator = await response.json();
        set({ operator: fetchedOperator });
      },
    }),
    {
      name: "operator-auth", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist token and operator
      partialize: (state) => ({
        token: state.token,
        operator: state.operator,
      }),
    }
  )
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the current auth token
 * Useful for API requests outside of React components
 */
export function getAuthToken(): string | null {
  return useAuth.getState().token;
}

/**
 * Get the current operator
 * Useful for accessing operator info outside of React components
 */
export function getCurrentOperator(): Operator | null {
  return useAuth.getState().operator;
}

/**
 * Check if user is authenticated
 * Useful for conditional logic outside of React components
 */
export function isAuthenticated(): boolean {
  return useAuth.getState().isAuthenticated();
}
