# User Dashboard Specification

**Feature:** User Dashboard  
**Priority:** CRITICAL  
**Estimated Effort:** Week 1

---

## Overview

**Purpose:** Primary interface for users to view personalized financial education recommendations and track their progress.

**URL:** `/` or `/dashboard`  
**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui  
**Data Mode:** Mock data (consistent with operator dashboard approach)

---

## Page Layout

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

---

## Component Specifications

### 1. DashboardHeader Component

**Path:** `ui/operator-dashboard/app/dashboard/page.tsx`

```tsx
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

---

### 2. HeroInsight Component

**Path:** `ui/operator-dashboard/components/Dashboard/HeroInsight.tsx`

```tsx
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

---

### 3. FinancialSnapshot Component

**Path:** `ui/operator-dashboard/components/Dashboard/FinancialSnapshot.tsx`

```tsx
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

---

### 4. RecommendationsFeed Component

**Path:** `ui/operator-dashboard/components/Dashboard/RecommendationsFeed.tsx`

```tsx
interface RecommendationsFeedProps {
  userId: string;
}

export function RecommendationsFeed({ userId }: RecommendationsFeedProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">(
    "all"
  );

  useEffect(() => {
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

---

### 5. RecommendationCard Component

**Path:** `ui/operator-dashboard/components/Dashboard/RecommendationCard.tsx`

```tsx
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
            {recommendation.type === "article" && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{recommendation.content}</ReactMarkdown>
              </div>
            )}

            {recommendation.type === "calculator" && (
              <div className="bg-white p-4 rounded-lg">
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

---

## Mock Data Integration

**Path:** `ui/operator-dashboard/lib/api.ts` (extend existing)

```tsx
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

## API Endpoints Required

```tsx
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
