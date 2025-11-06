# Gamification System Specification

**Feature:** Gamification & Progress Tracking  
**Priority:** MEDIUM  
**Estimated Effort:** Week 2-3

---

## Overview

**Purpose:** Increase engagement and motivation through progress tracking, milestones, and challenges.

**Components:**

- Progress Tracker (streak counter, milestones)
- Savings Challenges
- Persona Transition Celebrations

---

## 1. Progress Tracker Component

**Path:** `ui/operator-dashboard/components/Gamification/ProgressTracker.tsx`

```typescript
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

---

## 2. Savings Challenges Component

**Path:** `ui/operator-dashboard/components/Gamification/SavingsChallenge.tsx`

```typescript
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
    saveChallengeStart(userId, challenge.id);
  };

  const completeChallenge = () => {
    if (activeChallenge) {
      saveChallengeCompletion(userId, activeChallenge.id);
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

---

## 3. Persona Transition Celebration

**Path:** `ui/operator-dashboard/components/Gamification/TransitionCelebration.tsx`

```typescript
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

## 4. Progress Page Route

**Path:** `ui/operator-dashboard/app/progress/page.tsx`

```typescript
export default function ProgressPage() {
  const { userId } = useUser();
  const { data: userData } = useUserData(userId);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
        <p className="text-muted-foreground">
          Track your learning journey and achievements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressTracker userId={userId} persona={userData?.persona.primary} />
        <SavingsChallenge userId={userId} />
      </div>

      {/* Recent Achievements */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-4xl mb-2">🔥</div>
            <p className="font-semibold">7-Day Streak</p>
            <p className="text-xs text-muted-foreground">Earned 3 days ago</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-4xl mb-2">📚</div>
            <p className="font-semibold">First Article Complete</p>
            <p className="text-xs text-muted-foreground">Earned 1 week ago</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-4xl mb-2">💰</div>
            <p className="font-semibold">Calculator Pro</p>
            <p className="text-xs text-muted-foreground">Earned 2 weeks ago</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## Mock Data

**Path:** `ui/operator-dashboard/lib/mockData.ts` (extend)

```typescript
export const mockProgressData: ProgressData = {
  streak: 7,
  level: 2,
  levelProgress: 150,
  levelMax: 250,
  totalPoints: 85,
  completedRecommendations: 3,
  totalRecommendations: 5,
  achievements: [
    {
      id: "first_login",
      title: "Welcome Aboard",
      earnedAt: new Date("2025-10-01"),
    },
    {
      id: "first_rec_complete",
      title: "First Article Complete",
      earnedAt: new Date("2025-10-05"),
    },
    {
      id: "7_day_streak",
      title: "7-Day Streak",
      earnedAt: new Date("2025-11-01"),
    },
  ],
  activeChallenges: [],
  completedChallenges: [
    {
      id: "subscription_audit",
      completedAt: new Date("2025-10-15"),
      savings: 50,
    },
  ],
};
```
