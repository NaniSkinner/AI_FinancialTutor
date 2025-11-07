/**
 * Consent Management Functions
 *
 * Handles saving, loading, and checking user consents
 * Uses localStorage for mock data mode
 */

import type {
  UserConsents,
  ConsentType,
  StoredConsents,
  ConsentMetadata,
} from "@/types/consents";
import { DEFAULT_CONSENTS, REQUIRED_CONSENTS } from "@/types/consents";

const STORAGE_KEY_PREFIX = "spendsense_consents";

/**
 * Save user consents to localStorage
 */
export async function saveUserConsents(
  userId: string,
  consents: UserConsents
): Promise<void> {
  try {
    const stored: StoredConsents = {
      consents,
      metadata: {
        userId,
        updatedAt: new Date().toISOString(),
        version: "1.0",
      },
    };

    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}_${userId}`,
      JSON.stringify(stored)
    );
  } catch (error) {
    console.error("Failed to save consents:", error);
    throw new Error("Failed to save consent preferences");
  }
}

/**
 * Get user consents from localStorage
 */
export async function getUserConsents(userId: string): Promise<UserConsents> {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}_${userId}`);

    if (!stored) {
      return { ...DEFAULT_CONSENTS };
    }

    const parsed: StoredConsents = JSON.parse(stored);
    return parsed.consents;
  } catch (error) {
    console.error("Failed to load consents:", error);
    return { ...DEFAULT_CONSENTS };
  }
}

/**
 * Get consent metadata (timestamps, version, etc.)
 */
export async function getConsentMetadata(
  userId: string
): Promise<ConsentMetadata | null> {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}_${userId}`);

    if (!stored) {
      return null;
    }

    const parsed: StoredConsents = JSON.parse(stored);
    return parsed.metadata;
  } catch (error) {
    console.error("Failed to load consent metadata:", error);
    return null;
  }
}

/**
 * Check if user has granted a specific consent
 */
export async function hasConsent(
  userId: string,
  consentType: ConsentType
): Promise<boolean> {
  const consents = await getUserConsents(userId);
  return consents[consentType] === true;
}

/**
 * Check if user has granted all required consents
 */
export async function hasRequiredConsents(userId: string): Promise<boolean> {
  const consents = await getUserConsents(userId);

  return REQUIRED_CONSENTS.every(
    (consentType) => consents[consentType] === true
  );
}

/**
 * Check if user has granted any consents
 */
export async function hasAnyConsent(userId: string): Promise<boolean> {
  const consents = await getUserConsents(userId);

  return Object.values(consents).some((value) => value === true);
}

/**
 * Revoke a specific consent
 */
export async function revokeConsent(
  userId: string,
  consentType: ConsentType
): Promise<void> {
  const consents = await getUserConsents(userId);
  consents[consentType] = false;
  await saveUserConsents(userId, consents);
}

/**
 * Revoke all consents
 */
export async function revokeAllConsents(userId: string): Promise<void> {
  await saveUserConsents(userId, { ...DEFAULT_CONSENTS });
}

/**
 * Clear all consent data for a user (for data deletion)
 */
export function clearConsentData(userId: string): void {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}_${userId}`);
}
