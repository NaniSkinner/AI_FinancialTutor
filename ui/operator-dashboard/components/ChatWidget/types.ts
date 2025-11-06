// Type definitions for Chat Widget

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
}

export interface ChatRequest {
  userId: string;
  message: string;
  persona?: string;
  mode?: "user" | "operator";
}

export interface ChatResponse {
  response: string;
  sources?: string[];
}

export interface SuggestedQuestionsMap {
  high_utilization: string[];
  variable_income_budgeter: string[];
  student: string[];
  subscription_heavy: string[];
  savings_builder: string[];
  general: string[];
  operator: string[];
}
