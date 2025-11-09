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

// CRITICAL: No localhost fallback to prevent hardcoding localhost in production build
// Empty string forces mock mode when no API URL is configured
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";


// ============================================================================
// Production Safety Checks
// ============================================================================

/**
 * Detect if we're running in a production environment at runtime
 * (not localhost or 127.0.0.1)
 * Must be a function to work correctly in Next.js SSR
 */
function isProductionEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return !hostname.includes("localhost") && !hostname.includes("127.0.0.1");
}

/**
 * Check if we should use mock data
 * Force mock mode if:
 * 1. USE_MOCK_DATA is explicitly true
 * 2. API_URL is empty (no backend configured)
 * 3. Production environment with localhost API URL
 */
function shouldUseMockData(): boolean {
  const isProd = isProductionEnvironment();
  const hasLocalhostApi = API_URL.includes("localhost");
  const hasEmptyApi = !API_URL || API_URL.trim() === "";
  const forceMock = isProd && (hasLocalhostApi || hasEmptyApi);

  return USE_MOCK_DATA || forceMock;
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
        if (shouldUseMockData()) {
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
        // Clear user consents when logging out
        if (typeof window !== "undefined") {
          const userId = "user_demo_001";
          try {
            localStorage.removeItem(`spendsense_consents_${userId}`);
          } catch (error) {
            // Ignore consent clear errors
          }
        }

        set({
          token: null,
          operator: null,
        });

        // Skip API call in mock mode
        if (shouldUseMockData()) {
          return;
        }

        // Optional: Call logout endpoint
        try {
          fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${get().token}`,
            },
          });
        } catch (error) {
          // Ignore logout errors silently
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
        if (shouldUseMockData()) {
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
