/**
 * Onboarding Management Functions
 *
 * Handles onboarding state, completion status, and flow control
 * Uses localStorage for mock data mode
 */

import type { OnboardingMetadata } from "@/types/onboarding";

const STORAGE_KEY_PREFIX = "spendsense_onboarding";

/**
 * Mark onboarding as completed for a user
 */
export async function completeOnboarding(userId: string): Promise<void> {
  try {
    const metadata: OnboardingMetadata = {
      userId,
      completed: true,
      completedAt: new Date().toISOString(),
      dismissed: false,
    };

    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}_${userId}`,
      JSON.stringify(metadata)
    );
  } catch (error) {
    throw new Error("Failed to complete onboarding");
  }
}

/**
 * Mark onboarding as dismissed (not completed)
 */
export async function dismissOnboarding(userId: string): Promise<void> {
  try {
    const existing = await getOnboardingMetadata(userId);

    const metadata: OnboardingMetadata = {
      userId,
      completed: false,
      dismissed: true,
      dismissedAt: new Date().toISOString(),
      dismissCount: (existing?.dismissCount || 0) + 1,
    };

    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}_${userId}`,
      JSON.stringify(metadata)
    );
  } catch (error) {
    throw new Error("Failed to dismiss onboarding");
  }
}

/**
 * Check if user has completed onboarding
 */
export async function isOnboardingComplete(userId: string): Promise<boolean> {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}_${userId}`);

    if (!stored) {
      return false;
    }

    const metadata: OnboardingMetadata = JSON.parse(stored);
    return metadata.completed === true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if onboarding should be shown
 */
export async function shouldShowOnboarding(userId: string): Promise<boolean> {
  try {
    const metadata = await getOnboardingMetadata(userId);

    if (!metadata) {
      return true;
    }

    if (metadata.completed) {
      return false;
    }

    if (metadata.dismissCount && metadata.dismissCount >= 3) {
      return false;
    }

    if (metadata.dismissedAt) {
      const dismissedDate = new Date(metadata.dismissedAt);
      const daysSinceDismissed =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceDismissed < 7) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get onboarding metadata
 */
export async function getOnboardingMetadata(
  userId: string
): Promise<OnboardingMetadata | null> {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}_${userId}`);

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch (error) {
    return null;
  }
}

/**
 * Reset onboarding state
 */
export function resetOnboarding(userId: string): void {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}_${userId}`);
}

/**
 * Get a random mock persona
 */
export function getRandomMockPersona(): string {
  const personas = [
    "high_utilization",
    "savings_builder",
    "student",
    "variable_income",
    "subscription_heavy",
  ];

  return personas[Math.floor(Math.random() * personas.length)];
}
