// Utility functions for Chat Widget

/**
 * Generate a unique ID for messages
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get suggested questions for a given persona or mode
 * @param persona - User's primary persona or mode
 * @returns Array of suggested question strings
 */
export function getSuggestedQuestions(persona?: string): string[] {
  const { SUGGESTED_QUESTIONS } = require("./constants");

  if (!persona) {
    return SUGGESTED_QUESTIONS.general;
  }

  // Map common persona variations
  const personaKey = persona.toLowerCase().replace(/\s+/g, "_");

  return (
    SUGGESTED_QUESTIONS[personaKey as keyof typeof SUGGESTED_QUESTIONS] ||
    SUGGESTED_QUESTIONS.general
  );
}

/**
 * Format timestamp for display in chat
 */
export function formatMessageTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Validate message input
 */
export function isValidMessage(message: string): boolean {
  return message.trim().length > 0 && message.trim().length <= 1000;
}
