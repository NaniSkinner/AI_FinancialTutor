// Type definitions for Calculator components

export interface CreditCard {
  balance: number;
  limit: number;
  name?: string;
}

export interface Subscription {
  name: string;
  amount: number;
  frequency?: string;
}

export interface EmergencyFundCalculatorProps {
  initialMonthlyExpenses?: number;
  initialCurrentSavings?: number;
}

export interface CreditUtilizationCalculatorProps {
  initialCards?: CreditCard[];
}

export interface SubscriptionSavingsCalculatorProps {
  subscriptions?: Subscription[];
}
