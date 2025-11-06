/**
 * Onboarding Types
 *
 * Defines the onboarding flow state and configuration
 */

import type { ReactNode } from "react";
import type { UserConsents } from "./consents";

export interface OnboardingStep {
  /** Step title */
  title: string;

  /** Step description/subtitle */
  description: string;

  /** Step content (React component) */
  content: ReactNode;

  /** Can proceed to next step */
  canProceed?: boolean;
}

export interface OnboardingState {
  /** Current step index (0-based) */
  currentStep: number;

  /** User consents being collected */
  consents: UserConsents;

  /** Whether onboarding has been completed */
  completed: boolean;

  /** Whether onboarding has been dismissed without completion */
  dismissed?: boolean;
}

export interface OnboardingMetadata {
  /** User ID */
  userId: string;

  /** Whether onboarding was completed */
  completed: boolean;

  /** When onboarding was completed */
  completedAt?: string;

  /** Whether onboarding was dismissed */
  dismissed?: boolean;

  /** When onboarding was last dismissed */
  dismissedAt?: string;

  /** Number of times dismissed */
  dismissCount?: number;
}

/**
 * Mock persona data for onboarding completion screen
 */
export interface MockPersona {
  name: string;
  description: string;
  color: string;
}

export const MOCK_PERSONAS: Record<string, MockPersona> = {
  high_utilization: {
    name: "High Utilization",
    description:
      "We've identified opportunities to improve your credit health and reduce interest charges.",
    color: "from-red-50 to-orange-50",
  },
  savings_builder: {
    name: "Savings Builder",
    description:
      "You're making great progress building your emergency fund and financial cushion.",
    color: "from-green-50 to-emerald-50",
  },
  student: {
    name: "Student Budgeter",
    description:
      "We've identified student-specific opportunities to optimize your budget.",
    color: "from-blue-50 to-indigo-50",
  },
  variable_income: {
    name: "Variable Income",
    description:
      "We've found strategies to help you manage irregular income patterns.",
    color: "from-purple-50 to-pink-50",
  },
  subscription_heavy: {
    name: "Subscription Manager",
    description:
      "We've analyzed your recurring expenses and found potential savings.",
    color: "from-yellow-50 to-amber-50",
  },
};

/**
 * Get a random mock persona key for demonstration purposes
 * Returns the key (e.g., 'high_utilization') that can be used to lookup MOCK_PERSONAS
 */
export function getRandomMockPersona(): string {
  const personaKeys = Object.keys(MOCK_PERSONAS);
  if (personaKeys.length === 0) {
    return "savings_builder"; // Fallback to a known persona
  }
  return personaKeys[Math.floor(Math.random() * personaKeys.length)];
}
