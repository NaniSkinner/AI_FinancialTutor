"use client";

/**
 * ConsentRedirectGuard Component
 *
 * Redirects to consent page if user hasn't granted required AI permissions
 * Checks consent on every dashboard load (after each login)
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasRequiredConsents } from "@/lib/consents";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ConsentRedirectGuardProps {
  children: React.ReactNode;
}

export function ConsentRedirectGuard({ children }: ConsentRedirectGuardProps) {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const [checking, setChecking] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const checkConsent = async () => {
      try {
        const granted = await hasRequiredConsents(userId);
        setHasConsent(granted);

        // If no consent, redirect to consent page
        if (!granted) {
          router.push("/consent");
        }
      } catch (error) {
        console.error("Failed to check consents:", error);
        // On error, redirect to consent page to be safe
        router.push("/consent");
      } finally {
        setChecking(false);
      }
    };

    checkConsent();
  }, [userId, router]);

  // Show loading while checking
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // Only render children if consent is granted
  if (hasConsent) {
    return <>{children}</>;
  }

  // Return null if redirecting (no consent)
  return null;
}
