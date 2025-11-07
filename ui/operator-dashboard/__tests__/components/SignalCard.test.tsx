// SignalCard Component Tests
// Tests different signal types with various data scenarios

import "@testing-library/jest-dom";
import { render, screen } from "../../__test-utils/test-utils";
import { SignalCard } from "@/components/UserExplorer/SignalCard";
import type {
  CreditSignals,
  SubscriptionSignals,
  SavingsSignals,
  IncomeSignals,
} from "@/lib/types";

describe("SignalCard", () => {
  describe("Credit Signals", () => {
    it("renders credit signal data correctly", () => {
      const creditData: CreditSignals = {
        aggregate_utilization_pct: 25,
        total_credit_used: 5000,
        total_credit_available: 20000,
        any_interest_charges: false,
      };

      render(
        <SignalCard title="Credit Usage" data={creditData} type="credit" />
      );

      expect(screen.getByText("Credit Usage")).toBeInTheDocument();
      expect(screen.getByText("Aggregate Utilization")).toBeInTheDocument();
      expect(screen.getByText("25%")).toBeInTheDocument();
      expect(screen.getByText("$5,000")).toBeInTheDocument();
      expect(screen.getByText("$20,000")).toBeInTheDocument();
      expect(screen.getByText("None")).toBeInTheDocument();
    });

    it("shows green color for low utilization (<30%)", () => {
      const creditData: CreditSignals = {
        aggregate_utilization_pct: 15,
        total_credit_used: 1500,
        total_credit_available: 10000,
        any_interest_charges: false,
      };

      const { container } = render(
        <SignalCard title="Credit Usage" data={creditData} type="credit" />
      );

      const utilizationValue = screen.getByText("15%");
      expect(utilizationValue).toHaveClass("text-green-600");
    });

    it("shows yellow color for medium utilization (30-49%)", () => {
      const creditData: CreditSignals = {
        aggregate_utilization_pct: 35,
        total_credit_used: 3500,
        total_credit_available: 10000,
        any_interest_charges: false,
      };

      render(
        <SignalCard title="Credit Usage" data={creditData} type="credit" />
      );

      const utilizationValue = screen.getByText("35%");
      expect(utilizationValue).toHaveClass("text-yellow-600");
    });

    it("shows red color for high utilization (>=50%)", () => {
      const creditData: CreditSignals = {
        aggregate_utilization_pct: 75,
        total_credit_used: 7500,
        total_credit_available: 10000,
        any_interest_charges: true,
      };

      render(
        <SignalCard title="Credit Usage" data={creditData} type="credit" />
      );

      const utilizationValue = screen.getByText("75%");
      expect(utilizationValue).toHaveClass("text-red-600");
      expect(screen.getByText("Yes")).toBeInTheDocument();
      expect(screen.getByText("Yes")).toHaveClass("text-red-600");
    });
  });

  describe("Subscription Signals", () => {
    it("renders subscription signal data correctly", () => {
      const subsData: SubscriptionSignals = {
        recurring_merchant_count: 8,
        monthly_recurring_spend: 250,
        subscription_share_pct: 15,
        merchants: [
          { name: "Netflix", amount: 15.99 },
          { name: "Spotify", amount: 9.99 },
          { name: "Amazon Prime", amount: 14.99 },
        ],
      };

      render(
        <SignalCard
          title="Subscriptions"
          data={subsData}
          type="subscriptions"
        />
      );

      expect(screen.getByText("Subscriptions")).toBeInTheDocument();
      expect(screen.getByText("Recurring Merchants")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
      expect(screen.getByText("$250")).toBeInTheDocument();
      expect(screen.getByText("15%")).toBeInTheDocument();
    });

    it("renders top merchants when available", () => {
      const subsData: SubscriptionSignals = {
        recurring_merchant_count: 5,
        monthly_recurring_spend: 100,
        subscription_share_pct: 10,
        merchants: [
          { name: "Netflix", amount: 15.99 },
          { name: "Spotify", amount: 9.99 },
          { name: "HBO Max", amount: 14.99 },
          { name: "Disney+", amount: 7.99 },
        ],
      };

      render(
        <SignalCard
          title="Subscriptions"
          data={subsData}
          type="subscriptions"
        />
      );

      expect(screen.getByText("Top Subscriptions:")).toBeInTheDocument();
      expect(screen.getByText("• Netflix: $15.99")).toBeInTheDocument();
      expect(screen.getByText("• Spotify: $9.99")).toBeInTheDocument();
      expect(screen.getByText("• HBO Max: $14.99")).toBeInTheDocument();
      // Should only show top 3, not 4th
      expect(screen.queryByText("• Disney+: $7.99")).not.toBeInTheDocument();
    });

    it("does not render merchants section when empty", () => {
      const subsData: SubscriptionSignals = {
        recurring_merchant_count: 2,
        monthly_recurring_spend: 50,
        subscription_share_pct: 5,
        merchants: [],
      };

      render(
        <SignalCard
          title="Subscriptions"
          data={subsData}
          type="subscriptions"
        />
      );

      expect(screen.queryByText("Top Subscriptions:")).not.toBeInTheDocument();
    });
  });

  describe("Savings Signals", () => {
    it("renders savings signal data correctly", () => {
      const savingsData: SavingsSignals = {
        total_savings_balance: 15000,
        savings_growth_rate_pct: 5,
        net_savings_inflow: 500,
        emergency_fund_months: 4.5,
      };

      render(<SignalCard title="Savings" data={savingsData} type="savings" />);

      expect(screen.getByText("Savings")).toBeInTheDocument();
      expect(screen.getByText("Total Balance")).toBeInTheDocument();
      expect(screen.getByText("$15,000")).toBeInTheDocument();
      expect(screen.getByText("+5%")).toBeInTheDocument();
      expect(screen.getByText("$500")).toBeInTheDocument();
      expect(screen.getByText("4.5 months")).toBeInTheDocument();
    });

    it("shows green for positive growth rate", () => {
      const savingsData: SavingsSignals = {
        total_savings_balance: 10000,
        savings_growth_rate_pct: 10,
        net_savings_inflow: 300,
        emergency_fund_months: 3.0,
      };

      render(<SignalCard title="Savings" data={savingsData} type="savings" />);

      const growthRate = screen.getByText("+10%");
      expect(growthRate).toHaveClass("text-green-600");
    });

    it("shows red for negative growth rate", () => {
      const savingsData: SavingsSignals = {
        total_savings_balance: 5000,
        savings_growth_rate_pct: -5,
        net_savings_inflow: -100,
        emergency_fund_months: 2.0,
      };

      render(<SignalCard title="Savings" data={savingsData} type="savings" />);

      const growthRate = screen.getByText("-5%");
      expect(growthRate).toHaveClass("text-red-600");
    });

    it("shows green for adequate emergency fund (>=3 months)", () => {
      const savingsData: SavingsSignals = {
        total_savings_balance: 10000,
        savings_growth_rate_pct: 3,
        net_savings_inflow: 200,
        emergency_fund_months: 6.0,
      };

      render(<SignalCard title="Savings" data={savingsData} type="savings" />);

      const emergencyFund = screen.getByText("6.0 months");
      expect(emergencyFund).toHaveClass("text-green-600");
    });

    it("shows yellow for low emergency fund (<3 months)", () => {
      const savingsData: SavingsSignals = {
        total_savings_balance: 2000,
        savings_growth_rate_pct: 1,
        net_savings_inflow: 100,
        emergency_fund_months: 1.5,
      };

      render(<SignalCard title="Savings" data={savingsData} type="savings" />);

      const emergencyFund = screen.getByText("1.5 months");
      expect(emergencyFund).toHaveClass("text-yellow-600");
    });
  });

  describe("Income Signals", () => {
    it("renders income signal data correctly", () => {
      const incomeData: IncomeSignals = {
        income_type: "salaried",
        payment_frequency: "biweekly",
        median_pay_gap_days: 14,
        income_variability_pct: 5,
        cash_flow_buffer_months: 2.5,
        monthly_income: 4200,
      };

      render(<SignalCard title="Income" data={incomeData} type="income" />);

      expect(screen.getByText("Income")).toBeInTheDocument();
      expect(screen.getByText("Income Type")).toBeInTheDocument();
      expect(screen.getByText("salaried")).toBeInTheDocument();
      expect(screen.getByText("Payment Frequency")).toBeInTheDocument();
      expect(screen.getByText("biweekly")).toBeInTheDocument();
      expect(screen.getByText("14 days")).toBeInTheDocument();
      expect(screen.getByText("5%")).toBeInTheDocument();
      expect(screen.getByText("2.5 months")).toBeInTheDocument();
    });

    it("shows green for low income variability (<=20%)", () => {
      const incomeData: IncomeSignals = {
        income_type: "salaried",
        payment_frequency: "monthly",
        median_pay_gap_days: 30,
        income_variability_pct: 10,
        cash_flow_buffer_months: 3.0,
        monthly_income: 4200,
      };

      render(<SignalCard title="Income" data={incomeData} type="income" />);

      const variability = screen.getByText("10%");
      expect(variability).toHaveClass("text-green-600");
    });

    it("shows red for high income variability (>20%)", () => {
      const incomeData: IncomeSignals = {
        income_type: "variable",
        payment_frequency: "monthly",
        median_pay_gap_days: 45,
        income_variability_pct: 35,
        cash_flow_buffer_months: 0.5,
        monthly_income: 3500,
      };

      render(<SignalCard title="Income" data={incomeData} type="income" />);

      const variability = screen.getByText("35%");
      expect(variability).toHaveClass("text-red-600");
    });

    it("shows green for adequate cash flow buffer (>=1 month)", () => {
      const incomeData: IncomeSignals = {
        income_type: "salaried",
        payment_frequency: "monthly",
        median_pay_gap_days: 30,
        income_variability_pct: 5,
        cash_flow_buffer_months: 2.0,
        monthly_income: 4200,
      };

      render(<SignalCard title="Income" data={incomeData} type="income" />);

      const buffer = screen.getByText("2.0 months");
      expect(buffer).toHaveClass("text-green-600");
    });

    it("shows red for low cash flow buffer (<1 month)", () => {
      const incomeData: IncomeSignals = {
        income_type: "variable",
        payment_frequency: "weekly",
        median_pay_gap_days: 7,
        income_variability_pct: 15,
        cash_flow_buffer_months: 0.3,
        monthly_income: 3000,
      };

      render(<SignalCard title="Income" data={incomeData} type="income" />);

      const buffer = screen.getByText("0.3 months");
      expect(buffer).toHaveClass("text-red-600");
    });
  });

  describe("Edge Cases", () => {
    it("handles zero values correctly", () => {
      const savingsData: SavingsSignals = {
        total_savings_balance: 0,
        savings_growth_rate_pct: 0,
        net_savings_inflow: 0,
        emergency_fund_months: 0,
      };

      render(<SignalCard title="Savings" data={savingsData} type="savings" />);

      expect(screen.getByText("Total Balance")).toBeInTheDocument();
      expect(screen.getByText("Growth Rate")).toBeInTheDocument();
      // Check that emergency fund shows 0.0 months
      expect(screen.getByText("0.0 months")).toBeInTheDocument();
    });

    it("handles large numbers with proper formatting", () => {
      const creditData: CreditSignals = {
        aggregate_utilization_pct: 25,
        total_credit_used: 125000,
        total_credit_available: 500000,
        any_interest_charges: false,
      };

      render(
        <SignalCard title="Credit Usage" data={creditData} type="credit" />
      );

      expect(screen.getByText("$125,000")).toBeInTheDocument();
      expect(screen.getByText("$500,000")).toBeInTheDocument();
    });
  });
});
