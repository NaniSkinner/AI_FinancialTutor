/**
 * Consent Types
 *
 * Defines the consent system for SpendSense user dashboard
 * Manages user permissions for AI-powered features
 */

export interface UserConsents {
  /** Allow SpendSense to analyze financial data for patterns (REQUIRED) */
  dataAnalysis: boolean;

  /** Receive personalized educational recommendations (REQUIRED) */
  recommendations: boolean;

  /** Show partner information and offers (OPTIONAL) */
  partnerOffers: boolean;

  /** Receive marketing emails (OPTIONAL) */
  marketingEmails?: boolean;
}

export type ConsentType = keyof UserConsents;

export interface ConsentMetadata {
  /** When the consent was last updated */
  updatedAt: string;

  /** User ID who owns these consents */
  userId: string;

  /** Version of consent terms (for tracking changes) */
  version?: string;
}

export interface StoredConsents {
  consents: UserConsents;
  metadata: ConsentMetadata;
}

/**
 * Default consents - all set to false initially
 */
export const DEFAULT_CONSENTS: UserConsents = {
  dataAnalysis: false,
  recommendations: false,
  partnerOffers: false,
  marketingEmails: false,
};

/**
 * Required consents that must be granted for full app functionality
 */
export const REQUIRED_CONSENTS: ConsentType[] = [
  "dataAnalysis",
  "recommendations",
];

/**
 * Consent descriptions for UI display
 */
export const CONSENT_DESCRIPTIONS: Record<
  ConsentType,
  {
    title: string;
    description: string;
    required: boolean;
  }
> = {
  dataAnalysis: {
    title: "Analyze My Financial Data",
    description:
      "Allow SpendSense to detect spending patterns, savings behaviors, and financial trends to provide personalized educational content.",
    required: true,
  },
  recommendations: {
    title: "Receive Educational Recommendations",
    description:
      "Get personalized learning content, articles, calculators, and tips based on your financial patterns.",
    required: true,
  },
  partnerOffers: {
    title: "Show Partner Information",
    description:
      "See educational information about financial products that might be relevant to your situation. These are not endorsements or recommendations.",
    required: false,
  },
  marketingEmails: {
    title: "Marketing Communications",
    description:
      "Receive occasional emails about new features, tips, and SpendSense updates.",
    required: false,
  },
};
