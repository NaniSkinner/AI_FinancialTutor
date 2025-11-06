/**
 * useConsents Hook
 *
 * React hook for managing user consents in components
 * Provides real-time consent checking and updates
 */

import { useState, useEffect, useCallback } from "react";
import type { UserConsents, ConsentType } from "@/types/consents";
import {
  getUserConsents,
  saveUserConsents,
  hasRequiredConsents,
  hasConsent as checkConsent,
} from "@/lib/consents";
import { useCurrentUser } from "./useCurrentUser";

export function useConsents() {
  const { userId } = useCurrentUser();
  const [consents, setConsents] = useState<UserConsents | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRequired, setHasRequired] = useState(false);

  // Load consents on mount
  useEffect(() => {
    const loadConsents = async () => {
      try {
        const userConsents = await getUserConsents(userId);
        setConsents(userConsents);

        const required = await hasRequiredConsents(userId);
        setHasRequired(required);
      } catch (error) {
        console.error("Failed to load consents:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConsents();
  }, [userId]);

  // Save consents
  const updateConsents = useCallback(
    async (newConsents: UserConsents) => {
      try {
        await saveUserConsents(userId, newConsents);
        setConsents(newConsents);

        const required = await hasRequiredConsents(userId);
        setHasRequired(required);

        return true;
      } catch (error) {
        console.error("Failed to save consents:", error);
        return false;
      }
    },
    [userId]
  );

  // Check if has specific consent
  const hasConsent = useCallback(
    (consentType: ConsentType): boolean => {
      if (!consents) return false;
      return consents[consentType] === true;
    },
    [consents]
  );

  // Toggle a specific consent
  const toggleConsent = useCallback(
    async (consentType: ConsentType) => {
      if (!consents) return false;

      const newConsents = {
        ...consents,
        [consentType]: !consents[consentType],
      };

      return updateConsents(newConsents);
    },
    [consents, updateConsents]
  );

  return {
    consents,
    loading,
    hasRequired,
    hasConsent,
    updateConsents,
    toggleConsent,
    refetch: async () => {
      const userConsents = await getUserConsents(userId);
      setConsents(userConsents);
      const required = await hasRequiredConsents(userId);
      setHasRequired(required);
    },
  };
}
