// Constants for Chat Widget - Suggested questions by persona

import type { SuggestedQuestionsMap } from "./types";

export const SUGGESTED_QUESTIONS: SuggestedQuestionsMap = {
  high_utilization: [
    "Why is my credit utilization important?",
    "How can I lower my credit utilization?",
    "Will paying down my balance help my credit score?",
  ],
  student: [
    "How can I reduce my coffee spending?",
    "What's a realistic budget for a student?",
    "How do I start building savings?",
  ],
  subscription_heavy: [
    "How can I reduce my subscription costs?",
    "Which subscriptions should I cancel?",
    "Are there cheaper alternatives to my current subscriptions?",
  ],
  savings_builder: [
    "How much should I have in emergency savings?",
    "What's the best way to automate savings?",
    "How do I accelerate my savings growth?",
  ],
  variable_income_budgeter: [
    "How do I budget with irregular income?",
    "How much buffer should I have?",
    "What's the best approach to saving with variable income?",
  ],
  general: [
    "How can I improve my financial health?",
    "What should I focus on first?",
    "How do I track my spending better?",
  ],
  operator: [
    "How do I approve or reject recommendations?",
    "What are keyboard shortcuts?",
    "How do decision traces work?",
  ],
};

export const DISCLAIMER_TEXT = "Educational information, not financial advice";
