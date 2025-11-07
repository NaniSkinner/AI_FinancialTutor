"use client";

/**
 * Debug Page - Shows environment variables and auth state
 * Access at /debug to diagnose deployment issues
 */

import { useAuth } from "@/lib/auth";

export default function DebugPage() {
  const { token, operator, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <strong>NEXT_PUBLIC_USE_MOCK_DATA:</strong>{" "}
              <span className="text-blue-600">
                {process.env.NEXT_PUBLIC_USE_MOCK_DATA || "undefined"}
              </span>
            </div>
            <div>
              <strong>NEXT_PUBLIC_API_URL:</strong>{" "}
              <span className="text-blue-600">
                {process.env.NEXT_PUBLIC_API_URL || "undefined"}
              </span>
            </div>
            <div>
              <strong>NEXT_PUBLIC_OPERATOR_ID:</strong>{" "}
              <span className="text-blue-600">
                {process.env.NEXT_PUBLIC_OPERATOR_ID || "undefined"}
              </span>
            </div>
            <div className="pt-4 border-t mt-4">
              <strong>Mock Mode Active:</strong>{" "}
              <span
                className={
                  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
                    ? "text-green-600 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                {process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
                  ? "YES ✓"
                  : "NO ✗"}
              </span>
            </div>
          </div>
        </div>

        {/* Auth State */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication State</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <strong>Is Authenticated:</strong>{" "}
              <span
                className={
                  isAuthenticated() ? "text-green-600" : "text-red-600"
                }
              >
                {isAuthenticated() ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <strong>Token Present:</strong>{" "}
              <span className={token ? "text-green-600" : "text-red-600"}>
                {token ? "Yes" : "No"}
              </span>
            </div>
            {operator && (
              <>
                <div className="pt-4 border-t mt-4">
                  <strong>Operator Info:</strong>
                </div>
                <div className="pl-4">
                  <div>
                    <strong>ID:</strong> {operator.operator_id}
                  </div>
                  <div>
                    <strong>Name:</strong> {operator.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {operator.email}
                  </div>
                  <div>
                    <strong>Role:</strong> {operator.role}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Runtime Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Runtime Information</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <strong>Window Location:</strong>{" "}
              {typeof window !== "undefined" ? window.location.href : "SSR"}
            </div>
            <div>
              <strong>User Agent:</strong>{" "}
              {typeof window !== "undefined"
                ? window.navigator.userAgent
                : "SSR"}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-x-4">
          <a
            href="/login"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </a>
          <a
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
