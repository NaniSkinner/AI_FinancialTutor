# Interactive Calculators Specification

**Feature:** Interactive Financial Calculators  
**Priority:** HIGH  
**Estimated Effort:** Week 2

---

## Overview

**Purpose:** Provide interactive tools for users to explore financial concepts hands-on, pre-filled with their actual data.

**Calculators to Implement:**

1. Emergency Fund Calculator (Priority: HIGH)
2. Credit Utilization Impact Calculator (Priority: HIGH)
3. Subscription Savings Calculator (Priority: MEDIUM)
4. Debt Payoff Calculator (Priority: LOW)

---

## 1. Emergency Fund Calculator

**Path:** `ui/operator-dashboard/components/Calculators/EmergencyFundCalculator.tsx`

```tsx
interface EmergencyFundCalculatorProps {
  initialMonthlyExpenses?: number;
  initialCurrentSavings?: number;
}

export function EmergencyFundCalculator({
  initialMonthlyExpenses = 0,
  initialCurrentSavings = 0,
}: EmergencyFundCalculatorProps) {
  const [monthlyExpenses, setMonthlyExpenses] = useState(
    initialMonthlyExpenses
  );
  const [currentSavings, setCurrentSavings] = useState(initialCurrentSavings);
  const [targetMonths, setTargetMonths] = useState(3);
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState(200);

  const targetAmount = monthlyExpenses * targetMonths;
  const remaining = Math.max(0, targetAmount - currentSavings);
  const progress = targetAmount > 0 ? (currentSavings / targetAmount) * 100 : 0;
  const monthsToGoal =
    monthlySavingsGoal > 0 ? Math.ceil(remaining / monthlySavingsGoal) : 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Emergency Fund Calculator</CardTitle>
        <CardDescription>
          Calculate how long it will take to build your emergency fund
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Monthly Expenses */}
        <div className="space-y-2">
          <Label>Monthly Expenses</Label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-2xl font-bold text-muted-foreground">
              ${monthlyExpenses.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Current Savings */}
        <div className="space-y-2">
          <Label>Current Savings</Label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-2xl font-bold text-muted-foreground">
              ${currentSavings.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Target Months */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Target Coverage</Label>
            <span className="text-sm font-medium">{targetMonths} months</span>
          </div>
          <Slider
            value={[targetMonths]}
            onValueChange={(value) => setTargetMonths(value[0])}
            min={1}
            max={12}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 month</span>
            <span>12 months</span>
          </div>
        </div>

        {/* Monthly Savings Goal */}
        <div className="space-y-2">
          <Label>How much can you save monthly?</Label>
          <Input
            type="number"
            value={monthlySavingsGoal}
            onChange={(e) => setMonthlySavingsGoal(Number(e.target.value))}
          />
        </div>

        {/* Results */}
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Your Emergency Fund Goal
            </p>
            <p className="text-3xl font-bold">
              ${targetAmount.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {remaining > 0 ? (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm">Amount Remaining</span>
                <span className="text-lg font-bold">
                  ${remaining.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Time to Goal</span>
                <span className="text-lg font-bold">{monthsToGoal} months</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Saving ${monthlySavingsGoal}/month
              </p>
            </div>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Congratulations! You've reached your {targetMonths}-month
                emergency fund goal!
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This calculator is for educational purposes only. Actual emergency
            fund needs vary by individual circumstances. This is not financial
            advice.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
```

---

## 2. Credit Utilization Calculator

**Path:** `ui/operator-dashboard/components/Calculators/CreditUtilizationCalculator.tsx`

```tsx
export function CreditUtilizationCalculator({
  initialCards = [],
}: {
  initialCards?: CreditCard[];
}) {
  const [cards, setCards] = useState<CreditCard[]>(
    initialCards.length > 0 ? initialCards : [{ balance: 0, limit: 0 }]
  );

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);
  const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0);
  const utilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

  const addCard = () => {
    setCards([...cards, { balance: 0, limit: 0 }]);
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const updateCard = (
    index: number,
    field: "balance" | "limit",
    value: number
  ) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Credit Utilization Calculator</CardTitle>
        <CardDescription>
          See how your credit card balances affect your utilization ratio
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Cards Input */}
        <div className="space-y-4">
          {cards.map((card, index) => (
            <div
              key={index}
              className="flex gap-4 items-center p-4 border rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <Label className="text-xs">Balance</Label>
                <Input
                  type="number"
                  placeholder="Balance"
                  value={card.balance}
                  onChange={(e) =>
                    updateCard(index, "balance", Number(e.target.value))
                  }
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs">Limit</Label>
                <Input
                  type="number"
                  placeholder="Limit"
                  value={card.limit}
                  onChange={(e) =>
                    updateCard(index, "limit", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Util.</Label>
                <div className="text-sm font-medium">
                  {card.limit > 0
                    ? ((card.balance / card.limit) * 100).toFixed(0)
                    : 0}
                  %
                </div>
              </div>
              {cards.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCard(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button variant="outline" onClick={addCard} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Card
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Overall Credit Utilization
            </p>
            <p className="text-5xl font-bold">{utilization.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-2">
              ${totalBalance.toLocaleString()} of ${totalLimit.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Progress
              value={utilization}
              className={`h-4 ${
                utilization > 50
                  ? "bg-red-200"
                  : utilization > 30
                  ? "bg-yellow-200"
                  : "bg-green-200"
              }`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="font-medium">30% (Ideal)</span>
              <span>100%</span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="pt-4 border-t space-y-2">
            {utilization > 50 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  High utilization (&gt;50%) can negatively impact credit
                  scores. Consider paying down balances.
                </AlertDescription>
              </Alert>
            )}
            {utilization > 30 && utilization <= 50 && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm text-yellow-800">
                  Utilization between 30-50% may affect your credit. Aim to get
                  below 30%.
                </AlertDescription>
              </Alert>
            )}
            {utilization <= 30 && utilization > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-800">
                  Great job! Keeping utilization below 30% is ideal for credit
                  health.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 3. Calculator Routes

**Path:** `ui/operator-dashboard/app/calculators/page.tsx`

```tsx
export default function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] =
    useState<string>("emergency-fund");
  const { userId } = useUser();
  const { data: userData } = useUserData(userId);

  const calculators = [
    {
      id: "emergency-fund",
      name: "Emergency Fund",
      icon: Shield,
      description: "Calculate your emergency fund goal",
    },
    {
      id: "credit-utilization",
      name: "Credit Utilization",
      icon: CreditCard,
      description: "Understand your credit usage",
    },
    {
      id: "subscription-savings",
      name: "Subscription Savings",
      icon: DollarSign,
      description: "See potential subscription savings",
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Financial Calculators</h1>
        <p className="text-muted-foreground">
          Interactive tools to explore your financial scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calculator Menu */}
        <div className="space-y-2">
          {calculators.map((calc) => (
            <Button
              key={calc.id}
              variant={activeCalculator === calc.id ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActiveCalculator(calc.id)}
            >
              <calc.icon className="h-4 w-4 mr-2" />
              {calc.name}
            </Button>
          ))}
        </div>

        {/* Calculator Display */}
        <div className="lg:col-span-3">
          {activeCalculator === "emergency-fund" && (
            <EmergencyFundCalculator
              initialMonthlyExpenses={userData?.signals.monthlyExpenses}
              initialCurrentSavings={userData?.signals.savings.balance}
            />
          )}
          {activeCalculator === "credit-utilization" && (
            <CreditUtilizationCalculator
              initialCards={userData?.signals.credit.cards}
            />
          )}
          {activeCalculator === "subscription-savings" && (
            <SubscriptionSavingsCalculator
              subscriptions={userData?.signals.subscriptions.merchants}
            />
          )}
        </div>
      </div>
    </div>
  );
}
```
