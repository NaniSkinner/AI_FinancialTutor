# Financial Calculators

Interactive financial calculators that help users explore financial scenarios hands-on, pre-filled with their actual data from the SpendSense system.

## Overview

The calculators feature provides three main tools:

1. **Emergency Fund Calculator** (Priority: HIGH)
2. **Credit Utilization Calculator** (Priority: HIGH)
3. **Subscription Savings Calculator** (Priority: MEDIUM)

## Components

### EmergencyFundCalculator

Helps users calculate how long it will take to build their emergency fund based on monthly expenses, current savings, target coverage months, and monthly savings goal.

**Props:**

- `initialMonthlyExpenses?: number` - Pre-filled monthly expenses from user data
- `initialCurrentSavings?: number` - Pre-filled current savings from user data

**Features:**

- Adjustable target coverage (1-12 months)
- Real-time progress calculation
- Visual progress bar
- Time-to-goal estimation
- Success message when goal is reached

### CreditUtilizationCalculator

Shows how credit card balances affect utilization ratio with color-coded recommendations.

**Props:**

- `initialCards?: CreditCard[]` - Pre-filled credit card data from user signals

**Features:**

- Multiple credit cards support
- Add/remove cards dynamically
- Per-card utilization display
- Overall utilization percentage
- Color-coded recommendations (red >50%, yellow 30-50%, green <30%)

### SubscriptionSavingsCalculator

Helps users identify potential savings by reviewing recurring subscriptions.

**Props:**

- `subscriptions?: Subscription[]` - Pre-filled subscription data from user signals

**Features:**

- List of subscriptions sorted by cost
- Select subscriptions to consider canceling
- Potential monthly and annual savings calculation
- Management tips and recommendations

## Usage

### Basic Usage

```tsx
import {
  EmergencyFundCalculator,
  CreditUtilizationCalculator,
  SubscriptionSavingsCalculator,
} from "@/components/Calculators";

// Emergency Fund
<EmergencyFundCalculator
  initialMonthlyExpenses={2500}
  initialCurrentSavings={5000}
/>

// Credit Utilization
<CreditUtilizationCalculator
  initialCards={[
    { balance: 1500, limit: 5000 },
    { balance: 2000, limit: 10000 },
  ]}
/>

// Subscription Savings
<SubscriptionSavingsCalculator
  subscriptions={[
    { name: "Netflix", amount: 15.99 },
    { name: "Spotify", amount: 10.99 },
  ]}
/>
```

### With User Data Integration

The calculators page (`/app/calculators/page.tsx`) demonstrates how to integrate with user data:

```tsx
import { useUserSignals } from "@/hooks/useUserSignals";

const { data: userData } = useUserSignals(selectedUserId);

// Map user signals to calculator props
const monthlyExpenses = estimateMonthlyExpenses(
  userData.signals.savings.total_savings_balance,
  userData.signals.savings.emergency_fund_months
);

<EmergencyFundCalculator
  initialMonthlyExpenses={monthlyExpenses}
  initialCurrentSavings={userData.signals.savings.total_savings_balance}
/>;
```

## Type Definitions

### CreditCard

```typescript
interface CreditCard {
  balance: number;
  limit: number;
  name?: string;
}
```

### Subscription

```typescript
interface Subscription {
  name: string;
  amount: number;
  frequency?: string;
}
```

## Utility Functions

### formatCurrency(value, decimals)

Formats a number as currency with thousands separators.

### calculateUtilization(balance, limit)

Calculates credit utilization percentage.

### estimateMonthlyExpenses(savingsBalance, emergencyFundMonths)

Estimates monthly expenses when not directly available.

## Responsive Design

All calculators are fully responsive:

- **Mobile (320px-640px)**: Stacked layouts, simplified navigation
- **Tablet (768px-1024px)**: Balanced grid layouts
- **Desktop (1280px+)**: Full-width with sidebar navigation

## Accessibility

- All inputs have proper labels
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Color contrast meets WCAG AA standards
- Screen reader friendly

## Educational Disclaimers

All calculators include educational disclaimers stating:

- "This calculator is for educational purposes only"
- "Actual needs vary by individual circumstances"
- "This is not financial advice"

## Navigation

Access calculators through:

- Main dashboard navigation: `/calculators`
- Direct links from recommendations
- User Explorer integration

## Mock Data Integration

The calculators work with the mock data system:

- Pre-fills from `mockUserSignals` in `lib/mockData.ts`
- Falls back to manual input when no user data available
- Maintains state during session

## Future Enhancements

Potential additions (Low Priority):

- Debt Payoff Calculator
- Budget Builder
- Investment Calculator
- Retirement Savings Planner
