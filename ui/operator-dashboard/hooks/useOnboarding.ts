/**
 * useOnboarding Hook
 *
 * React hook for managing onboarding state
 * Checks if onboarding should be shown and tracks completion
 */

import { useState, useEffect, useCallback } from "react";
import {
  isOnboardingComplete,
  shouldShowOnboarding,
  completeOnboarding,
  dismissOnboarding,
  getOnboardingMetadata,
} from "@/lib/onboarding";
import type { OnboardingMetadata } from "@/types/onboarding";
import { useCurrentUser } from "./useCurrentUser";

export function useOnboarding() {
  const { userId } = useCurrentUser();
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const [shouldShow, setShouldShow] = useState<boolean | null>(null);
  const [metadata, setMetadata] = useState<OnboardingMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  // Load onboarding status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const [complete, show, meta] = await Promise.all([
          isOnboardingComplete(userId),
          shouldShowOnboarding(userId),
          getOnboardingMetadata(userId),
        ]);

        setIsComplete(complete);
        setShouldShow(show);
        setMetadata(meta);
      } catch (error) {
        console.error("Failed to load onboarding status:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [userId]);

  // Complete onboarding
  const complete = useCallback(async () => {
    try {
      await completeOnboarding(userId);
      setIsComplete(true);
      setShouldShow(false);
      return true;
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      return false;
    }
  }, [userId]);

  // Dismiss onboarding
  const dismiss = useCallback(async () => {
    try {
      await dismissOnboarding(userId);
      setShouldShow(false);
      return true;
    } catch (error) {
      console.error("Failed to dismiss onboarding:", error);
      return false;
    }
  }, [userId]);

  // Refresh status
  const refetch = useCallback(async () => {
    const [complete, show, meta] = await Promise.all([
      isOnboardingComplete(userId),
      shouldShowOnboarding(userId),
      getOnboardingMetadata(userId),
    ]);

    setIsComplete(complete);
    setShouldShow(show);
    setMetadata(meta);
  }, [userId]);

  return {
    isComplete,
    shouldShow,
    metadata,
    loading,
    complete,
    dismiss,
    refetch,
  };
}
