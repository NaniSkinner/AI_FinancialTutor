# SpendSense User Experience PRD

**Version:** 1.0  
**Date:** November 6, 2025  
**Status:** Ready for Implementation  
**Dependencies:** Main PRD.md, Architecture.md

---

## Executive Summary

This PRD defines the **user-facing features** for SpendSense that are currently missing from the implementation. While the Operator Dashboard exists for internal oversight, users currently have no interface to view their recommendations, interact with educational content, or track their financial learning progress.

### Current State

✅ **Implemented:**

- Operator Dashboard (Review Queue, User Explorer, Decision Traces)
- Backend API with recommendation engine
- Persona detection and signal analysis
- Guardrails and compliance systems

❌ **Missing:**

- User Dashboard
- Chat/Q&A Interface
- Interactive Calculators
- Gamification Elements
- Email Templates
- User Onboarding Flow

---

## Table of Contents

1. [User Dashboard](#1-user-dashboard)
2. [Chat Interface](#2-chat-interface)
3. [Interactive Calculators](#3-interactive-calculators)
4. [Gamification System](#4-gamification-system)
5. [Email Templates](#5-email-templates)
6. [User Onboarding](#6-user-onboarding)
7. [Technical Integration](#7-technical-integration)
8. [Implementation Roadmap](#8-implementation-roadmap)

---

## 1. User Dashboard

### 1.1 Overview

**Purpose:** Primary interface for users to view personalized financial education recommendations and track their progress.

**URL:** `/` or `/dashboard`  
**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui  
**Data Mode:** Mock data (consistent with operator dashboard approach)

### 1.2 Page Layout

```
┌─────────────────────────────────────────────────────┐
│  Header: SpendSense Logo | User Name | Settings    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │         Hero Insight Card                   │   │
│  │  [Persona Badge] Your Primary Focus         │   │
│  │  "Your credit cards are at 68% utilization" │   │
│  │  [Learn More CTA]                           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Your Financial Snapshot                    │   │
│  ├─────────┬─────────┬─────────┬──────────────┤   │
│  │ Credit  │ Savings │ Subscr. │ Income       │   │
│  │ 68% 📊  │ $5.2K 📈│ 5 items │ Stable ✓     │   │
│  └─────────┴─────────┴─────────┴──────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Learning Recommendations (3-5 items)       │   │
│  │                                             │   │
│  │  ┌─────────────────────────────────────┐   │   │
│  │  │ 📄 Understanding Credit Utilization │   │   │
│  │  │ ⏱ 3 min read | Priority: HIGH       │   │
│  │  │ "Your Visa ending in 4523 is at..." │   │
│  │  │ [Learn More] [Mark Complete]        │   │
│  │  └─────────────────────────────────────┘   │   │
│  │  ... (more recommendations)                 │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Chat Widget - Floating Bottom Right]             │
└─────────────────────────────────────────────────────┘
```

### 1.3 Component Specifications

#### 1.3.1 DashboardHeader Component

```typescript
// Path: ui/operator-dashboard/app/dashboard/page.tsx

interface DashboardHeaderProps {
  userName: string;
  avatarUrl?: string;
}

export function DashboardHeader({ userName, avatarUrl }: DashboardHeaderProps) {
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">SpendSense</h1>
        <span className="text-sm text-muted-foreground">
          Your Financial Learning Hub
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarFallback>{userName[0]}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/consent")}>
              Privacy & Consent
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

#### 1.3.2 HeroInsight Component

```typescript
// Path: ui/operator-dashboard/components/Dashboard/HeroInsight.tsx

interface HeroInsightProps {
  persona: {
    primary: string;
    secondary: string[];
  };
  signals: UserSignals;
}

export function HeroInsight({ persona, signals }: HeroInsightProps) {
  const insights = {
    high_utilization: {
      title: "Your Credit Utilization Needs Attention",
      description: `Your credit cards are at ${signals.credit?.aggregateUtilization}% utilization. Bringing this below 30% could improve your credit score.`,
      icon: "📊",
      color: "bg-red-50 border-red-200",
      ctaText: "Learn About Credit Health",
      ctaLink: "/learn/credit-utilization",
    },
    student: {
      title: "Student Budget Optimization",
      description: `Your coffee and delivery spending totals $${signals.subscriptions?.coffeeDelivery} this month. Small changes could free up funds for your goals.`,
      icon: "🎓",
      color: "bg-blue-50 border-blue-200",
      ctaText: "Optimize Your Budget",
      ctaLink: "/learn/student-budget",
    },
    savings_builder: {
      title: "You're Building Great Habits!",
      description: `Your savings grew ${signals.savings?.growthRate}% this period. Keep it up!`,
      icon: "🎉",
      color: "bg-green-50 border-green-200",
      ctaText: "Level Up Your Savings",
      ctaLink: "/learn/savings-strategies",
    },
    subscription_heavy: {
      title: "Subscription Audit Opportunity",
      description: `Your ${signals.subscriptions?.count} subscriptions total $${signals.subscriptions?.monthlySpend}/month. Review which ones you're actively using.`,
      icon: "💳",
      color: "bg-yellow-50 border-yellow-200",
      ctaText: "Audit Your Subscriptions",
      ctaLink: "/learn/subscription-management",
    },
    variable_income_budgeter: {
      title: "Income Stability Focus",
      description: `With ${signals.income?.paymentFrequency} income, building a buffer is key. You currently have ${signals.income?.bufferMonths} months coverage.`,
      icon: "📈",
      color: "bg-purple-50 border-purple-200",
      ctaText: "Learn Income Smoothing",
      ctaLink: "/learn/variable-income",
    },
  };

  const insight = insights[persona.primary] || insights.savings_builder;

  return (
    <Card className={`p-6 ${insight.color} border-2`}>
      <div className="flex items-start gap-4">
        <div className="text-4xl">{insight.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">
              {persona.primary.replace(/_/g, " ").toUpperCase()}
            </Badge>
            {persona.secondary.map((p) => (
              <Badge key={p} variant="outline">
                {p.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
          <h2 className="text-xl font-bold mb-2">{insight.title}</h2>
          <p className="text-muted-foreground mb-4">{insight.description}</p>
          <Button asChild>
            <Link href={insight.ctaLink}>{insight.ctaText}</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

#### 1.3.3 FinancialSnapshot Component

```typescript
// Path: ui/operator-dashboard/components/Dashboard/FinancialSnapshot.tsx

interface FinancialSnapshotProps {
  signals: UserSignals;
}

export function FinancialSnapshot({ signals }: FinancialSnapshotProps) {
  const snapshots = [
    {
      label: "Credit Utilization",
      value: `${signals.credit?.aggregateUtilization || 0}%`,
      icon: CreditCard,
      status: getUtilizationStatus(signals.credit?.aggregateUtilization),
      trend: signals.credit?.trend || "neutral",
    },
    {
      label: "Savings Balance",
      value: formatCurrency(signals.savings?.balance || 0),
      icon: PiggyBank,
      status: "good",
      trend: signals.savings?.growthRate > 0 ? "up" : "neutral",
    },
    {
      label: "Subscriptions",
      value: `${signals.subscriptions?.count || 0} items`,
      icon: RefreshCw,
      status: signals.subscriptions?.count > 5 ? "warning" : "good",
      subtitle:
        formatCurrency(signals.subscriptions?.monthlySpend || 0) + "/mo",
    },
    {
      label: "Income Stability",
      value: signals.income?.paymentFrequency || "Unknown",
      icon: TrendingUp,
      status:
        signals.income?.paymentFrequency === "biweekly" ||
        signals.income?.paymentFrequency === "monthly"
          ? "good"
          : "warning",
      subtitle: `${signals.income?.bufferMonths || 0} mo buffer`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {snapshots.map((snapshot, idx) => (
        <Card key={idx} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {snapshot.label}
              </p>
              <p className="text-2xl font-bold">{snapshot.value}</p>
              {snapshot.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {snapshot.subtitle}
                </p>
              )}
            </div>
            <snapshot.icon
              className={`h-8 w-8 ${getStatusColor(snapshot.status)}`}
            />
          </div>
          {snapshot.trend && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              {snapshot.trend === "up" && (
                <ArrowUp className="h-4 w-4 text-green-600" />
              )}
              {snapshot.trend === "down" && (
                <ArrowDown className="h-4 w-4 text-red-600" />
              )}
              {snapshot.trend === "neutral" && (
                <Minus className="h-4 w-4 text-gray-600" />
              )}
              <span className="text-muted-foreground">vs. last month</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
```

#### 1.3.4 RecommendationsFeed Component

```typescript
// Path: ui/operator-dashboard/components/Dashboard/RecommendationsFeed.tsx

interface RecommendationsFeedProps {
  userId: string;
}

export function RecommendationsFeed({ userId }: RecommendationsFeedProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">(
    "all"
  );

  useEffect(() => {
    // Fetch recommendations from API
    fetchRecommendations(userId).then(setRecommendations);
  }, [userId]);

  const filteredRecs =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.priority === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Learning Recommendations</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredRecs.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onView={() => handleView(rec.id)}
            onComplete={() => handleComplete(rec.id)}
          />
        ))}
      </div>

      {filteredRecs.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No recommendations available yet.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Check back later for personalized learning content.
          </p>
        </Card>
      )}
    </div>
  );
}
```

#### 1.3.5 RecommendationCard Component

```typescript
// Path: ui/operator-dashboard/components/Dashboard/RecommendationCard.tsx

interface RecommendationCardProps {
  recommendation: Recommendation;
  onView: () => void;
  onComplete: () => void;
}

export function RecommendationCard({
  recommendation,
  onView,
  onComplete,
}: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [completed, setCompleted] = useState(
    recommendation.status === "completed"
  );

  const priorityColors = {
    high: "border-red-300 bg-red-50",
    medium: "border-yellow-300 bg-yellow-50",
    low: "border-blue-300 bg-blue-50",
  };

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) {
      onView();
    }
  };

  const handleComplete = () => {
    setCompleted(true);
    onComplete();
  };

  return (
    <Card
      className={`transition-all ${priorityColors[recommendation.priority]} ${
        completed ? "opacity-60" : ""
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={
                  recommendation.priority === "high"
                    ? "destructive"
                    : "secondary"
                }
              >
                {recommendation.priority.toUpperCase()}
              </Badge>
              <Badge variant="outline">{recommendation.type}</Badge>
              {recommendation.readTimeMinutes && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recommendation.readTimeMinutes} min
                </span>
              )}
              {completed && <Badge variant="success">✓ Completed</Badge>}
            </div>
            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleExpand}>
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground mb-4">{recommendation.rationale}</p>

        {expanded && (
          <div className="space-y-4 mt-4 pt-4 border-t">
            {/* Render content based on type */}
            {recommendation.type === "article" && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{recommendation.content}</ReactMarkdown>
              </div>
            )}

            {recommendation.type === "calculator" && (
              <div className="bg-white p-4 rounded-lg">
                {/* Embed calculator component */}
                <CalculatorEmbed
                  type={recommendation.calculatorType}
                  userData={recommendation.userData}
                />
              </div>
            )}

            {recommendation.disclaimer && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {recommendation.disclaimer}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {!completed && (
                <Button onClick={handleComplete} variant="default">
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
              <Button variant="outline" asChild>
                <a href={recommendation.learnMoreUrl} target="_blank">
                  Learn More
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 1.4 API Endpoints Required

```typescript
// GET /api/users/:userId/dashboard
// Returns: Complete dashboard data
interface DashboardResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  persona: {
    primary: string;
    secondary: string[];
    assignedAt: string;
  };
  signals: UserSignals;
  recommendations: Recommendation[];
  progress: {
    completedCount: number;
    totalCount: number;
    streak: number;
  };
}

// POST /api/recommendations/:id/view
// Records user viewed a recommendation

// POST /api/recommendations/:id/complete
// Marks recommendation as completed
```

### 1.5 Mock Data Integration

```typescript
// Path: ui/operator-dashboard/lib/api.ts (extend existing)

export async function getUserDashboard(
  userId: string
): Promise<DashboardResponse> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return getMockDashboardData(userId);
  }

  const response = await fetch(`/api/users/${userId}/dashboard`);
  return response.json();
}

function getMockDashboardData(userId: string): DashboardResponse {
  return {
    user: {
      id: userId,
      name: "Demo User",
      email: "demo@spendsense.com",
    },
    persona: {
      primary: "high_utilization",
      secondary: ["subscription_heavy"],
      assignedAt: new Date().toISOString(),
    },
    signals: {
      credit: {
        aggregateUtilization: 68,
        cards: [
          {
            accountId: "acc_123",
            mask: "4523",
            type: "Visa",
            balance: 3400,
            limit: 5000,
            utilization: 68,
          },
        ],
        anyInterestCharges: true,
        trend: "up",
      },
      savings: {
        balance: 5250,
        growthRate: 3.2,
        netInflowMonthly: 350,
      },
      subscriptions: {
        count: 5,
        monthlySpend: 127.5,
        coffeeDelivery: 95,
        merchants: ["Netflix", "Spotify", "Adobe", "Gym", "Coffee"],
      },
      income: {
        paymentFrequency: "biweekly",
        bufferMonths: 0.8,
        variability: 5.2,
      },
    },
    recommendations: getMockRecommendations(userId),
    progress: {
      completedCount: 2,
      totalCount: 5,
      streak: 3,
    },
  };
}
```

---

## 2. Chat Interface

### 2.1 Overview

**Purpose:** Allow users to ask follow-up questions about their financial data and recommendations using natural language.

**Component:** Floating chat widget (bottom-right corner)  
**AI Model:** GPT-4 with user context  
**Data Access:** User's signals, persona, and recent recommendations

### 2.2 Component Specification

```typescript
// Path: ui/operator-dashboard/components/Dashboard/ChatWidget.tsx

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatWidget({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: input }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Ask a Question
        </Button>
      )}

      {isOpen && (
        <Card className="w-96 h-[500px] flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <div>
              <CardTitle>Financial Q&A</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Ask about your finances
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ask me anything about your finances!</p>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setInput("Why is my credit utilization important?")
                    }
                    className="w-full text-xs"
                  >
                    Why is my credit utilization important?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setInput("How can I reduce my subscription costs?")
                    }
                    className="w-full text-xs"
                  >
                    How can I reduce subscription costs?
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {format(message.timestamp, "HH:mm")}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2 w-full"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center w-full">
              Educational information, not financial advice
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
```

### 2.3 API Endpoint

```typescript
// POST /api/chat
interface ChatRequest {
  userId: string;
  message: string;
}

interface ChatResponse {
  response: string;
  sources?: string[]; // Which signals/recommendations were referenced
}
```

### 2.4 Mock Implementation

```typescript
// Path: ui/operator-dashboard/lib/api.ts

export async function sendChatMessage(
  userId: string,
  message: string
): Promise<ChatResponse> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return getMockChatResponse(message);
  }

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, message }),
  });
  return response.json();
}

function getMockChatResponse(message: string): ChatResponse {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("utilization") || lowerMessage.includes("credit")) {
    return {
      response:
        "Credit utilization is the percentage of your available credit that you're using. Your Visa card is currently at 68% utilization ($3,400 of $5,000 limit). Lenders prefer to see utilization below 30%, as high utilization can impact your credit score. This is educational information, not financial advice.",
      sources: ["credit_signals", "recommendation_credit_101"],
    };
  }

  if (
    lowerMessage.includes("subscription") ||
    lowerMessage.includes("save money")
  ) {
    return {
      response:
        "Your 5 subscriptions total $127.50/month. To optimize: 1) Review which ones you actively use, 2) Check if you can downgrade any plans, 3) Look for annual payment discounts. Many people find 20-30% savings by auditing subscriptions quarterly. This is educational information, not financial advice.",
      sources: ["subscription_signals"],
    };
  }

  if (
    lowerMessage.includes("savings") ||
    lowerMessage.includes("emergency fund")
  ) {
    return {
      response:
        "You currently have $5,250 in savings, which provides about 0.8 months of emergency coverage based on your expenses. Financial experts often recommend 3-6 months of expenses for an emergency fund. Your savings are growing at 3.2% - that's great progress! This is educational information, not financial advice.",
      sources: ["savings_signals"],
    };
  }

  return {
    response:
      "I can help you understand your financial data and the recommendations you receive. Try asking about your credit utilization, subscriptions, savings, or any specific recommendation. This is educational information, not financial advice.",
    sources: [],
  };
}
```

---

## 3. Interactive Calculators

### 3.1 Overview

**Purpose:** Provide interactive tools for users to explore financial concepts hands-on, pre-filled with their actual data.

**Calculators to Implement:**

1. Emergency Fund Calculator (Priority: HIGH)
2. Credit Utilization Impact Calculator (Priority: HIGH)
3. Subscription Savings Calculator (Priority: MEDIUM)
4. Debt Payoff Calculator (Priority: LOW)

### 3.2 Emergency Fund Calculator

```typescript
// Path: ui/operator-dashboard/components/Calculators/EmergencyFundCalculator.tsx

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

### 3.3 Credit Utilization Calculator

```typescript
// Path: ui/operator-dashboard/components/Calculators/CreditUtilizationCalculator.tsx

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

### 3.4 Calculator Routes

```typescript
// Path: ui/operator-dashboard/app/calculators/page.tsx

export default function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] =
    useState<string>("emergency-fund");
  const { userId } = useUser(); // Get from auth context
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

---

## 4. Gamification System

### 4.1 Overview

**Purpose:** Increase engagement and motivation through progress tracking, milestones, and challenges.

**Components:**

- Progress Tracker (streak counter, milestones)
- Savings Challenges
- Persona Transition Celebrations

### 4.2 Progress Tracker Component

```typescript
// Path: ui/operator-dashboard/components/Gamification/ProgressTracker.tsx

interface ProgressTrackerProps {
  userId: string;
  persona: string;
}

export function ProgressTracker({ userId, persona }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    fetchUserProgress(userId).then(setProgress);
  }, [userId]);

  if (!progress) return <Skeleton className="h-64 w-full" />;

  const personaMilestones = {
    high_utilization: [
      {
        id: "util_below_80",
        title: "Utilization Below 80%",
        achieved: true,
        points: 10,
      },
      {
        id: "util_below_50",
        title: "Utilization Below 50%",
        achieved: true,
        points: 25,
      },
      {
        id: "util_below_30",
        title: "Utilization Below 30%",
        achieved: false,
        points: 50,
      },
      {
        id: "no_interest",
        title: "Interest-Free Month",
        achieved: false,
        points: 100,
      },
    ],
    student: [
      {
        id: "budget_created",
        title: "Created First Budget",
        achieved: true,
        points: 10,
      },
      {
        id: "tracked_30days",
        title: "30 Days of Tracking",
        achieved: false,
        points: 25,
      },
      { id: "saved_100", title: "Saved $100", achieved: false, points: 50 },
      {
        id: "reduced_delivery",
        title: "Cut Delivery 25%",
        achieved: false,
        points: 75,
      },
    ],
    savings_builder: [
      {
        id: "1month_fund",
        title: "1 Month Emergency Fund",
        achieved: true,
        points: 25,
      },
      {
        id: "3month_fund",
        title: "3 Month Emergency Fund",
        achieved: false,
        points: 50,
      },
      {
        id: "6month_fund",
        title: "6 Month Emergency Fund",
        achieved: false,
        points: 100,
      },
      {
        id: "automated_savings",
        title: "Automated Savings",
        achieved: true,
        points: 25,
      },
    ],
    subscription_heavy: [
      {
        id: "audit_complete",
        title: "Completed Subscription Audit",
        achieved: true,
        points: 10,
      },
      {
        id: "cancelled_1",
        title: "Cancelled 1 Subscription",
        achieved: true,
        points: 25,
      },
      { id: "saved_50", title: "Saved $50/month", achieved: false, points: 50 },
      {
        id: "under_5",
        title: "Under 5 Subscriptions",
        achieved: false,
        points: 75,
      },
    ],
    variable_income_budgeter: [
      {
        id: "buffer_started",
        title: "Started Emergency Buffer",
        achieved: true,
        points: 10,
      },
      {
        id: "1month_buffer",
        title: "1 Month Buffer Saved",
        achieved: false,
        points: 50,
      },
      {
        id: "income_tracked",
        title: "Tracked Income 90 Days",
        achieved: false,
        points: 25,
      },
      {
        id: "budget_percent",
        title: "Set % Budget Rules",
        achieved: true,
        points: 15,
      },
    ],
  };

  const milestones =
    personaMilestones[persona] || personaMilestones.savings_builder;
  const achievedCount = milestones.filter((m) => m.achieved).length;
  const totalPoints = milestones
    .filter((m) => m.achieved)
    .reduce((sum, m) => sum + m.points, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Your Progress
          <Badge variant="secondary">{totalPoints} points</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Streak Counter */}
        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2">
          <div className="text-6xl font-bold mb-2">{progress.streak}</div>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" />
            day streak
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Keep learning to maintain your streak!
          </p>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Milestones</h4>
            <span className="text-sm text-muted-foreground">
              {achievedCount} of {milestones.length}
            </span>
          </div>

          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                milestone.achieved
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div
                className={`flex-shrink-0 ${
                  milestone.achieved ? "text-green-600" : "text-gray-400"
                }`}
              >
                {milestone.achieved ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    milestone.achieved ? "" : "text-muted-foreground"
                  }`}
                >
                  {milestone.title}
                </p>
              </div>
              <Badge variant={milestone.achieved ? "default" : "outline"}>
                {milestone.points} pts
              </Badge>
            </div>
          ))}
        </div>

        {/* Level Progress */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Level {progress.level}</span>
            <span className="text-muted-foreground">
              {progress.levelProgress}/{progress.levelMax} XP
            </span>
          </div>
          <Progress
            value={(progress.levelProgress / progress.levelMax) * 100}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {progress.levelMax - progress.levelProgress} XP to Level{" "}
            {progress.level + 1}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4.3 Savings Challenges Component

```typescript
// Path: ui/operator-dashboard/components/Gamification/SavingsChallenge.tsx

interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  potentialSavings: number;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

export function SavingsChallenge({ userId }: { userId: string }) {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(
    null
  );
  const [challengeProgress, setChallengeProgress] = useState(0);

  const challenges: Challenge[] = [
    {
      id: "coffee_week",
      title: "7-Day Coffee Challenge",
      description: "Make coffee at home for 7 consecutive days",
      durationDays: 7,
      potentialSavings: 35,
      difficulty: "easy",
      category: "Food & Drink",
    },
    {
      id: "no_delivery",
      title: "No Delivery November",
      description: "Cook or prep all meals at home for 30 days",
      durationDays: 30,
      potentialSavings: 200,
      difficulty: "hard",
      category: "Food & Drink",
    },
    {
      id: "subscription_audit",
      title: "Subscription Audit",
      description: "Review and cancel at least one unused subscription",
      durationDays: 1,
      potentialSavings: 50,
      difficulty: "easy",
      category: "Subscriptions",
    },
    {
      id: "no_impulse",
      title: "30-Day No Impulse Buy",
      description: "Wait 24 hours before any non-essential purchase",
      durationDays: 30,
      potentialSavings: 150,
      difficulty: "medium",
      category: "Shopping",
    },
    {
      id: "pack_lunch",
      title: "2-Week Lunch Prep",
      description: "Bring packed lunch to work for 2 weeks",
      durationDays: 14,
      potentialSavings: 70,
      difficulty: "medium",
      category: "Food & Drink",
    },
  ];

  const startChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    setChallengeProgress(0);
    // Store in backend/localStorage
    saveChallengeStart(userId, challenge.id);
  };

  const completeChallenge = () => {
    if (activeChallenge) {
      saveChallengeCompletion(userId, activeChallenge.id);
      // Show celebration
      toast.success(
        `Challenge Complete! You saved ~$${activeChallenge.potentialSavings}!`
      );
      setActiveChallenge(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Challenges</CardTitle>
        <CardDescription>
          Try these challenges to build better money habits
        </CardDescription>
      </CardHeader>

      <CardContent>
        {activeChallenge ? (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Trophy className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">
                Active Challenge
              </AlertTitle>
              <AlertDescription className="text-blue-800">
                {activeChallenge.title} - Day {challengeProgress} of{" "}
                {activeChallenge.durationDays}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Progress
                value={(challengeProgress / activeChallenge.durationDays) * 100}
                className="h-3"
              />
              <p className="text-sm text-muted-foreground text-center">
                {activeChallenge.durationDays - challengeProgress} days
                remaining
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={completeChallenge} className="flex-1">
                Complete Challenge
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveChallenge(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{challenge.title}</h4>
                      <Badge
                        variant={
                          challenge.difficulty === "easy"
                            ? "secondary"
                            : challenge.difficulty === "medium"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {challenge.durationDays} days
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Save ~${challenge.potentialSavings}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {challenge.category}
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => startChallenge(challenge)} size="sm">
                    Start
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 4.4 Persona Transition Celebration

```typescript
// Path: ui/operator-dashboard/components/Gamification/TransitionCelebration.tsx

export function TransitionCelebration({
  transition,
}: {
  transition: PersonaTransition;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const celebrations = {
    high_utilization_to_savings_builder: {
      title: "🎉 Amazing Progress!",
      message:
        "You've improved your credit health and started building savings!",
      achievement: "Credit Champion",
      color: "from-green-400 to-blue-500",
    },
    student_to_savings_builder: {
      title: "🎓 Financial Graduation!",
      message:
        "You've mastered student budgeting and are building your future!",
      achievement: "Smart Scholar",
      color: "from-blue-400 to-purple-500",
    },
    variable_income_to_savings_builder: {
      title: "📈 Stability Achieved!",
      message: "Your income has stabilized and you're building savings!",
      achievement: "Stability Master",
      color: "from-purple-400 to-pink-500",
    },
  };

  const key = `${transition.fromPersona}_to_${transition.toPersona}`;
  const celebration = celebrations[key] || {
    title: "🎉 Congratulations!",
    message: "You've made great progress on your financial journey!",
    achievement: "Progress Champion",
    color: "from-blue-400 to-green-500",
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <div
          className={`text-center space-y-4 py-8 bg-gradient-to-br ${celebration.color} bg-opacity-10 rounded-lg`}
        >
          <div className="text-6xl animate-bounce">🏆</div>
          <DialogTitle className="text-2xl">{celebration.title}</DialogTitle>
          <p className="text-muted-foreground px-4">{celebration.message}</p>

          <div className="py-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Achievement Unlocked: {celebration.achievement}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              From: <strong>{transition.fromPersona.replace(/_/g, " ")}</strong>
            </p>
            <p>
              To: <strong>{transition.toPersona.replace(/_/g, " ")}</strong>
            </p>
          </div>

          <Button onClick={() => setIsOpen(false)} className="mt-4">
            Continue Learning
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 5. Email Templates

### 5.1 Overview

**Purpose:** Provide weekly/monthly email digests with personalized insights and recommendations.

**Delivery:** HTML email templates  
**Frequency:** Weekly (default), Monthly (optional)  
**Content:** Hero insight, top 3 recommendations, progress summary

### 5.2 Weekly Digest Template

```html
<!-- Path: ui/operator-dashboard/email-templates/weekly-digest.html -->

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Weekly Financial Insights</title>
    <style>
      /* Email-safe CSS */
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px 20px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
      .header p {
        margin: 10px 0 0;
        opacity: 0.9;
      }
      .persona-badge {
        display: inline-block;
        background-color: rgba(255, 255, 255, 0.2);
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 12px;
        margin-top: 10px;
      }
      .content {
        padding: 30px 20px;
      }
      .insight-box {
        background: linear-gradient(135deg, #d4e7c5 0%, #a0c4ff 100%);
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
      }
      .insight-box h2 {
        margin: 0 0 10px;
        font-size: 20px;
        color: #333;
      }
      .insight-box p {
        margin: 0;
        color: #555;
        line-height: 1.6;
      }
      .recommendation {
        background-color: #f9f9f9;
        padding: 20px;
        border-left: 4px solid #667eea;
        margin-bottom: 20px;
        border-radius: 4px;
      }
      .recommendation h3 {
        margin: 0 0 10px;
        font-size: 18px;
        color: #333;
      }
      .recommendation p {
        margin: 0 0 15px;
        color: #666;
        line-height: 1.5;
      }
      .recommendation .meta {
        font-size: 12px;
        color: #999;
        margin-bottom: 10px;
      }
      .cta-button {
        display: inline-block;
        background-color: #667eea;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
      }
      .stats {
        display: flex;
        justify-content: space-around;
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 8px;
        margin: 20px 0;
      }
      .stat {
        text-align: center;
      }
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #667eea;
      }
      .stat-label {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
      }
      .footer {
        background-color: #f5f5f5;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #999;
      }
      .footer a {
        color: #667eea;
        text-decoration: none;
      }
      .disclaimer {
        background-color: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 15px;
        margin: 20px 0;
        font-size: 13px;
        color: #856404;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>📊 Your Weekly Financial Insights</h1>
        <p>{{user_name}}, here's what we noticed this week</p>
        <span class="persona-badge">{{persona_name}}</span>
      </div>

      <!-- Content -->
      <div class="content">
        <!-- Hero Insight -->
        <div class="insight-box">
          <h2>{{insight_title}}</h2>
          <p>{{insight_description}}</p>
        </div>

        <!-- Stats -->
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{{credit_utilization}}%</div>
            <div class="stat-label">Credit Utilization</div>
          </div>
          <div class="stat">
            <div class="stat-value">${{savings_balance}}</div>
            <div class="stat-label">Savings Balance</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{subscription_count}}</div>
            <div class="stat-label">Subscriptions</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{streak_days}}</div>
            <div class="stat-label">Day Streak 🔥</div>
          </div>
        </div>

        <!-- Recommendations -->
        <h2 style="margin-bottom: 20px;">New Learning Recommendations</h2>

        {{#recommendations}}
        <div class="recommendation">
          <div class="meta">{{priority}} Priority • {{read_time}} min read</div>
          <h3>{{title}}</h3>
          <p>{{rationale}}</p>
          <a href="{{link}}" class="cta-button">Learn More</a>
        </div>
        {{/recommendations}}

        <!-- Disclaimer -->
        <div class="disclaimer">
          <strong>Educational Content:</strong> This is educational information,
          not financial advice. Consult a licensed advisor for personalized
          guidance.
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>SpendSense</strong> - Your Financial Learning Hub</p>
        <p style="margin-top: 10px;">
          <a href="{{dashboard_link}}">View Dashboard</a> •
          <a href="{{settings_link}}">Manage Preferences</a> •
          <a href="{{unsubscribe_link}}">Unsubscribe</a>
        </p>
        <p style="margin-top: 15px; font-size: 11px;">
          You're receiving this because you opted in to SpendSense educational
          recommendations.
        </p>
      </div>
    </div>
  </body>
</html>
```

### 5.3 Email Generation API

```typescript
// POST /api/emails/weekly-digest
interface WeeklyDigestRequest {
  userId: string;
}

interface WeeklyDigestResponse {
  html: string;
  subject: string;
  recipient: string;
}

// Implementation in lib/emails.ts
export async function generateWeeklyDigest(userId: string): Promise<string> {
  const userData = await getUserDashboard(userId);
  const template = await fs.readFile(
    "email-templates/weekly-digest.html",
    "utf-8"
  );

  return Mustache.render(template, {
    user_name: userData.user.name,
    persona_name: userData.persona.primary.replace(/_/g, " ").toUpperCase(),
    insight_title: getHeroInsight(userData.persona.primary).title,
    insight_description: getHeroInsight(userData.persona.primary).description,
    credit_utilization: userData.signals.credit?.aggregateUtilization || 0,
    savings_balance: formatCurrency(userData.signals.savings?.balance || 0),
    subscription_count: userData.signals.subscriptions?.count || 0,
    streak_days: userData.progress.streak,
    recommendations: userData.recommendations.slice(0, 3).map((rec) => ({
      priority: rec.priority.toUpperCase(),
      read_time: rec.readTimeMinutes,
      title: rec.title,
      rationale: rec.rationale,
      link: `${process.env.APP_URL}/dashboard?rec=${rec.id}`,
    })),
    dashboard_link: `${process.env.APP_URL}/dashboard`,
    settings_link: `${process.env.APP_URL}/settings`,
    unsubscribe_link: `${process.env.APP_URL}/unsubscribe?user=${userId}`,
  });
}
```

---

## 6. User Onboarding

### 6.1 Overview

**Purpose:** Welcome new users, explain SpendSense, and collect necessary consents.

**Flow:**

1. Welcome screen
2. What is SpendSense (educational vs advice)
3. Consent management
4. Initial persona detection
5. Dashboard tour

### 6.2 Onboarding Component

```typescript
// Path: ui/operator-dashboard/app/onboarding/page.tsx

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [consents, setConsents] = useState({
    dataAnalysis: false,
    recommendations: false,
    partnerOffers: false,
  });
  const router = useRouter();

  const steps = [
    {
      title: "Welcome to SpendSense! 👋",
      description: "Your personal financial education companion",
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg">
            SpendSense helps you understand your money habits and learn
            financial concepts through personalized educational content.
          </p>
          <Alert className="text-left">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> SpendSense provides educational
              content, not financial advice. We help you learn, not tell you
              what to do.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      title: "How It Works",
      description: "Understanding your financial patterns",
      content: (
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
              1️⃣
            </div>
            <div>
              <h3 className="font-semibold mb-2">We Analyze Your Data</h3>
              <p className="text-sm text-muted-foreground">
                We look at your transaction patterns, savings behavior, and
                spending habits.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
              2️⃣
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                You Get Personalized Content
              </h3>
              <p className="text-sm text-muted-foreground">
                Based on your patterns, we recommend educational articles,
                calculators, and learning materials.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              3️⃣
            </div>
            <div>
              <h3 className="font-semibold mb-2">You Learn and Grow</h3>
              <p className="text-sm text-muted-foreground">
                Track your progress, complete challenges, and improve your
                financial literacy.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Your Privacy Matters",
      description: "You're in control of your data",
      content: (
        <div className="space-y-4">
          <p>
            We need your permission to provide personalized recommendations. You
            can change these anytime in Settings.
          </p>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={consents.dataAnalysis}
                  onCheckedChange={(checked) =>
                    setConsents({
                      ...consents,
                      dataAnalysis: checked as boolean,
                    })
                  }
                />
                <div className="flex-1">
                  <Label className="font-semibold">
                    Analyze My Financial Data
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Allow SpendSense to detect spending patterns, savings
                    behaviors, and financial trends to provide personalized
                    educational content.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={consents.recommendations}
                  onCheckedChange={(checked) =>
                    setConsents({
                      ...consents,
                      recommendations: checked as boolean,
                    })
                  }
                />
                <div className="flex-1">
                  <Label className="font-semibold">
                    Receive Educational Recommendations
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get personalized learning content, articles, calculators,
                    and tips based on your financial patterns.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={consents.partnerOffers}
                  onCheckedChange={(checked) =>
                    setConsents({
                      ...consents,
                      partnerOffers: checked as boolean,
                    })
                  }
                />
                <div className="flex-1">
                  <Label className="font-semibold">
                    Show Partner Information (Optional)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    See educational information about financial products that
                    might be relevant to your situation. These are not
                    endorsements or recommendations.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Your data is never sold. You can revoke these permissions anytime
              from Settings.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      title: "You're All Set! 🎉",
      description: "Let's explore your dashboard",
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-lg">
            We've analyzed your financial data and found some interesting
            patterns!
          </p>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2">
            <p className="text-sm text-muted-foreground mb-2">
              Your Primary Focus
            </p>
            <h3 className="text-2xl font-bold mb-2">High Utilization</h3>
            <p className="text-sm text-muted-foreground">
              We've identified opportunities to improve your credit health.
            </p>
          </Card>
          <p className="text-sm text-muted-foreground">
            Your dashboard is ready with personalized recommendations!
          </p>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const canProceed =
    step !== 2 || (consents.dataAnalysis && consents.recommendations);

  const handleNext = async () => {
    if (step === 2) {
      // Save consents
      await saveUserConsents(consents);
    }

    if (step === steps.length - 1) {
      // Complete onboarding
      await completeOnboarding();
      router.push("/dashboard");
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === step
                      ? "w-8 bg-primary"
                      : idx < step
                      ? "w-2 bg-primary"
                      : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {steps.length}
            </span>
          </div>
          <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>

        <CardContent className="py-6">{currentStep.content}</CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed}>
            {step === steps.length - 1 ? "Go to Dashboard" : "Next"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

---

## 7. Technical Integration

### 7.1 Routing Structure

```typescript
// Path: ui/operator-dashboard/app/layout.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UserProvider>
            <ToastProvider>{children}</ToastProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Route Structure:**

```
/                          → User Dashboard (main)
/onboarding                → Onboarding flow
/calculators               → Interactive calculators
/learn/[slug]              → Educational content pages
/progress                  → Progress & gamification page
/settings                  → Settings (consent, preferences)
/operator                  → Operator Dashboard (existing)
/operator/review           → Review Queue (existing)
/operator/traces           → Decision Traces (existing)
```

### 7.2 API Endpoints Summary

```typescript
// User Dashboard
GET  /api/users/:userId/dashboard
POST /api/recommendations/:id/view
POST /api/recommendations/:id/complete

// Chat
POST /api/chat

// Progress & Gamification
GET  /api/users/:userId/progress
POST /api/challenges/:id/start
POST /api/challenges/:id/complete
GET  /api/users/:userId/milestones

// Onboarding
POST /api/users/:userId/complete-onboarding
POST /api/users/:userId/consents

// Email
POST /api/emails/weekly-digest
POST /api/emails/send
```

### 7.3 Mock Data Extensions

```typescript
// Path: ui/operator-dashboard/lib/mockData.ts

export const mockUserData = {
  user: {
    id: "user_demo",
    name: "Demo User",
    email: "demo@spendsense.com",
    onboardingComplete: true,
  },
  persona: {
    primary: "high_utilization",
    secondary: ["subscription_heavy"],
    assignedAt: new Date().toISOString(),
  },
  signals: {
    credit: {
      aggregateUtilization: 68,
      cards: [
        {
          accountId: "acc_123",
          mask: "4523",
          type: "Visa",
          balance: 3400,
          limit: 5000,
          utilization: 68,
          interestCharges: 87.5,
        },
      ],
      anyInterestCharges: true,
      trend: "up",
    },
    savings: {
      balance: 5250,
      growthRate: 3.2,
      netInflowMonthly: 350,
      emergencyFundMonths: 2.1,
    },
    subscriptions: {
      count: 5,
      monthlySpend: 127.5,
      coffeeDelivery: 95,
      merchants: [
        "Netflix",
        "Spotify",
        "Adobe Creative",
        "Planet Fitness",
        "Blue Bottle Coffee",
      ],
    },
    income: {
      paymentFrequency: "biweekly",
      bufferMonths: 0.8,
      variability: 5.2,
      type: "payroll",
    },
    monthlyExpenses: 2500,
  },
  recommendations: [
    {
      id: "rec_001",
      type: "article",
      title: "Understanding Credit Utilization",
      rationale:
        "Your Visa ending in 4523 is at 68% utilization ($3,400 of $5,000 limit). High utilization can impact credit scores. Bringing this below 30% could improve your score and reduce interest charges of $87.50/month.",
      priority: "high",
      readTimeMinutes: 3,
      content: "# Understanding Credit Utilization...",
      status: "approved",
      learnMoreUrl: "/learn/credit-utilization",
      disclaimer: "This is educational content, not financial advice.",
    },
    {
      id: "rec_002",
      type: "calculator",
      title: "Emergency Fund Calculator",
      rationale:
        "Your savings provide 2.1 months of coverage. Use this calculator to plan reaching a 3-6 month emergency fund goal.",
      priority: "medium",
      readTimeMinutes: 5,
      calculatorType: "emergency-fund",
      status: "approved",
      userData: {
        monthlyExpenses: 2500,
        currentSavings: 5250,
      },
    },
    {
      id: "rec_003",
      type: "article",
      title: "The True Cost of Subscriptions",
      rationale:
        "Your 5 subscriptions total $127.50/month (12% of spending). Many people find value in reviewing subscriptions quarterly.",
      priority: "medium",
      readTimeMinutes: 4,
      content: "# The True Cost of Subscriptions...",
      status: "approved",
    },
  ],
  progress: {
    completedCount: 2,
    totalCount: 5,
    streak: 3,
    level: 2,
    levelProgress: 150,
    levelMax: 250,
    totalPoints: 85,
    achievements: ["first_login", "completed_first_rec"],
  },
};
```

---

## 8. Implementation Roadmap

### Phase 1: User Dashboard (Week 1)

**Priority: CRITICAL**

- [ ] Create dashboard page (`/app/dashboard/page.tsx`)
- [ ] Implement HeroInsight component
- [ ] Implement FinancialSnapshot component
- [ ] Implement RecommendationsFeed component
- [ ] Implement RecommendationCard component
- [ ] Integrate mock data (extend existing `lib/api.ts`)
- [ ] Add routing from existing operator dashboard
- [ ] Create user layout with header/navigation

**Deliverable:** Functional user dashboard with mock data showing persona, signals, and recommendations.

---

### Phase 2: Chat Interface (Week 1-2)

**Priority: HIGH**

- [ ] Create ChatWidget component
- [ ] Implement message state management
- [ ] Add mock chat responses (extend `lib/mockData.ts`)
- [ ] Create API endpoint `/api/chat` (mock)
- [ ] Add suggested questions
- [ ] Style floating widget
- [ ] Test conversation flow

**Deliverable:** Working chat widget that responds to common financial questions with mock data.

---

### Phase 3: Interactive Calculators (Week 2)

**Priority: HIGH**

- [ ] Create `/calculators` page
- [ ] Implement EmergencyFundCalculator
- [ ] Implement CreditUtilizationCalculator
- [ ] Implement SubscriptionSavingsCalculator
- [ ] Add calculator navigation menu
- [ ] Pre-fill calculators with user data
- [ ] Add educational tooltips

**Deliverable:** Three working calculators with user data integration.

---

### Phase 4: Gamification (Week 2-3)

**Priority: MEDIUM**

- [ ] Create ProgressTracker component
- [ ] Implement milestone system
- [ ] Create SavingsChallenge component
- [ ] Implement streak counter
- [ ] Create TransitionCelebration component
- [ ] Add `/progress` page
- [ ] Integrate with dashboard

**Deliverable:** Progress tracking system with streaks, milestones, and challenges.

---

### Phase 5: Onboarding (Week 3)

**Priority: MEDIUM**

- [ ] Create `/onboarding` page
- [ ] Implement multi-step wizard
- [ ] Create consent management UI
- [ ] Add welcome screens
- [ ] Implement persona detection preview
- [ ] Add skip/complete logic
- [ ] Redirect to dashboard on completion

**Deliverable:** Complete onboarding flow for new users.

---

### Phase 6: Email Templates (Week 3)

**Priority: LOW**

- [ ] Create HTML email templates
- [ ] Implement template rendering (Mustache.js)
- [ ] Create email generation API
- [ ] Add preview page (`/emails/preview`)
- [ ] Test responsiveness
- [ ] Add unsubscribe logic

**Deliverable:** HTML email templates with data integration.

---

### Phase 7: Polish & Testing (Week 4)

**Priority: MEDIUM**

- [ ] Responsive design testing (mobile/tablet)
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Add loading states
- [ ] Error handling improvements
- [ ] User testing with 5 people
- [ ] Bug fixes

**Deliverable:** Production-ready user experience.

---

## Success Criteria

### Functional Requirements

- [ ] User can view personalized dashboard with persona and recommendations
- [ ] User can ask questions via chat interface
- [ ] User can use 3+ interactive calculators
- [ ] User can track progress with streaks and milestones
- [ ] User can complete onboarding flow
- [ ] Weekly digest email renders correctly

### Technical Requirements

- [ ] All components use existing mock data infrastructure
- [ ] No breaking changes to operator dashboard
- [ ] All routes protected by authentication
- [ ] Responsive on mobile, tablet, desktop
- [ ] Page load time <2 seconds
- [ ] No console errors

### Design Requirements

- [ ] Consistent with operator dashboard styling
- [ ] Uses existing shadcn/ui components
- [ ] Follows accessibility guidelines
- [ ] Professional and friendly tone
- [ ] Clear hierarchy and navigation

---

## Appendix: Component Inventory

### Required shadcn/ui Components

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add skeleton
```

### New Icons Needed (lucide-react)

```typescript
import {
  Bell,
  Settings,
  Shield,
  Trophy,
  Flame,
  Calendar,
  DollarSign,
  Tag,
  MessageCircle,
  Send,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  PiggyBank,
  RefreshCw,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  X,
  Plus,
  Trash2,
  Circle,
} from "lucide-react";
```

### Dependencies to Add

```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "mustache": "^4.2.0",
    "date-fns": "^2.30.0"
  }
}
```

---

## Notes & Constraints

1. **Mock Data Mode**: All features must work with `NEXT_PUBLIC_USE_MOCK_DATA=true` (consistent with existing operator dashboard)
2. **No Backend Changes**: Use existing API structure, extend mock data only
3. **Authentication**: Assume user authentication exists (same as operator dashboard)
4. **Styling**: Use Tailwind CSS and shadcn/ui (consistent with project)
5. **TypeScript**: All components must be fully typed
6. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
7. **Performance**: Lazy load components, optimize images, minimize bundle size

---

## End of User PRD

**Next Steps:**

1. Review this PRD with team
2. Estimate effort for each phase
3. Begin Phase 1 (User Dashboard)
4. Use existing operator dashboard as reference for patterns

**Questions?** Refer to main PRD.md and Architecture.md for system context.

**Version History:**

- 1.0 (Nov 6, 2025): Initial user features PRD
