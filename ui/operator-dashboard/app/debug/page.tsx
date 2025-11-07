"use client";

/**
 * Debug Page - Shows environment variables and auth state
 * Access at /debug to diagnose deployment issues
 */

import { useAuth } from "@/lib/auth";

export default function DebugPage() {
  const { token, operator, isAuthenticated } = useAuth();

  // Detect environment
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "SSR";
  const isProduction =
    typeof window !== "undefined" &&
    !hostname.includes("localhost") &&
    !hostname.includes("127.0.0.1");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const hasLocalhostApi = apiUrl.includes("localhost");
  const shouldShowWarning = isProduction && hasLocalhostApi;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>

        {/* Warning Banner */}
        {shouldShowWarning && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  Production Environment with Localhost API Detected!
                </h3>
                <div className="mt-2 text-sm">
                  <p>
                    Your app is running in production but trying to connect to
                    localhost. This will cause CORS errors. Mock mode should be
                    forced automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {!shouldShowWarning &&
          process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">
                    Configuration Looks Good!
                  </h3>
                  <div className="mt-2 text-sm">
                    <p>
                      Mock mode is enabled. The app will work without a backend
                      API.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <span
                className={hasLocalhostApi ? "text-red-600" : "text-blue-600"}
              >
                {process.env.NEXT_PUBLIC_API_URL || "undefined (empty)"}
              </span>
              {hasLocalhostApi && isProduction && (
                <span className="ml-2 text-red-600">
                  ⚠ localhost in production!
                </span>
              )}
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
            <div>
              <strong>Environment Type:</strong>{" "}
              <span
                className={isProduction ? "text-green-600" : "text-blue-600"}
              >
                {isProduction ? "Production" : "Development"}
              </span>
            </div>
            <div>
              <strong>Hostname:</strong>{" "}
              <span className="text-blue-600">{hostname}</span>
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
