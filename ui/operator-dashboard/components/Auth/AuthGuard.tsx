"use client";

/**
 * AuthGuard Component
 *
 * Protects routes by checking authentication status
 * Redirects to /login if user is not authenticated
 * Shows loading state while checking authentication
 */

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Skip auth guard for login page
    if (pathname === "/login") {
      setChecking(false);
      return;
    }

    // Check authentication
    const authenticated = isAuthenticated();

    if (!authenticated) {
      // Redirect to login
      router.push("/login");
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, router, pathname]);

  // Don't guard login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated, show protected content
  return <>{children}</>;
}

/**
 * PermissionGuard Component
 *
 * Checks if user has a specific permission
 * Shows fallback UI if permission is denied
 */

interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  fallback,
  children,
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-yellow-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-yellow-800">
            You don't have permission to access this feature.
            <br />
            <span className="text-xs">
              Required permission: <code>{permission}</code>
            </span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
