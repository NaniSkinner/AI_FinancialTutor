"use client";

/**
 * ConsentGuard Component
 *
 * Wrapper component that checks for consent before rendering children
 * Shows ConsentPrompt if consent is not granted
 */

import { useState, useEffect } from "react";
import { ConsentPrompt } from "./ConsentPrompt";
import { ConsentDialog } from "./ConsentDialog";
import { useConsents } from "@/hooks/useConsents";
import type { ConsentType } from "@/types/consents";

interface ConsentGuardProps {
  children: React.ReactNode;
  requiredConsents: ConsentType[];
  featureName: string;
  featureDescription: string;
  promptDescription: string;
  icon?: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ConsentGuard({
  children,
  requiredConsents,
  featureName,
  featureDescription,
  promptDescription,
  icon,
  fallback,
}: ConsentGuardProps) {
  const { consents, loading } = useConsents();
  const [showDialog, setShowDialog] = useState(false);
  const [hasAllConsents, setHasAllConsents] = useState(false);

  // Check if all required consents are granted
  useEffect(() => {
    if (!loading && consents) {
      const allGranted = requiredConsents.every(
        (consent) => consents[consent] === true
      );
      setHasAllConsents(allGranted);
    }
  }, [consents, loading, requiredConsents]);

  // Show loading state
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
      </div>
    );
  }

  // If all consents granted, show children
  if (hasAllConsents) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show consent prompt and dialog
  return (
    <>
      <ConsentPrompt
        featureName={featureName}
        icon={icon}
        description={promptDescription}
        onEnable={() => setShowDialog(true)}
      />

      <ConsentDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onGranted={() => {
          setShowDialog(false);
          setHasAllConsents(true);
        }}
        requiredConsents={requiredConsents}
        featureName={featureName}
        featureDescription={featureDescription}
      />
    </>
  );
}
