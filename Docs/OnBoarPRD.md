# User Onboarding Specification

**Feature:** User Onboarding Flow  
**Priority:** MEDIUM  
**Estimated Effort:** Week 3

---

## Overview

**Purpose:** Welcome new users, explain SpendSense, and collect necessary consents.

**Flow:**

1. Welcome screen
2. What is SpendSense (educational vs advice)
3. Consent management
4. Initial persona detection
5. Dashboard tour

---

## Onboarding Component

**Path:** `ui/operator-dashboard/app/onboarding/page.tsx`

```tsx
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

## Consent Management

**Path:** `ui/operator-dashboard/lib/consents.ts`

```tsx
export interface UserConsents {
  dataAnalysis: boolean;
  recommendations: boolean;
  partnerOffers: boolean;
  marketingEmails?: boolean;
}

export async function saveUserConsents(
  userId: string,
  consents: UserConsents
): Promise<void> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    localStorage.setItem(`consents_${userId}`, JSON.stringify(consents));
    return;
  }

  await fetch(`/api/users/${userId}/consents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(consents),
  });
}

export async function getUserConsents(userId: string): Promise<UserConsents> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    const stored = localStorage.getItem(`consents_${userId}`);
    return stored
      ? JSON.parse(stored)
      : {
          dataAnalysis: false,
          recommendations: false,
          partnerOffers: false,
        };
  }

  const response = await fetch(`/api/users/${userId}/consents`);
  return response.json();
}
```

---

## Settings Page for Consent Changes

**Path:** `ui/operator-dashboard/app/settings/page.tsx`

```tsx
export default function SettingsPage() {
  const { userId } = useUser();
  const [consents, setConsents] = useState<UserConsents | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserConsents(userId).then((data) => {
      setConsents(data);
      setLoading(false);
    });
  }, [userId]);

  const handleSave = async () => {
    if (consents) {
      await saveUserConsents(userId, consents);
      toast.success("Settings saved successfully");
    }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your privacy and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Consent</CardTitle>
          <CardDescription>
            Control how SpendSense uses your data
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Checkbox
                checked={consents?.dataAnalysis}
                onCheckedChange={(checked) =>
                  setConsents({
                    ...consents!,
                    dataAnalysis: checked as boolean,
                  })
                }
              />
              <div className="flex-1">
                <Label className="font-semibold">
                  Analyze My Financial Data
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Allow SpendSense to detect spending patterns and provide
                  personalized educational content.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Checkbox
                checked={consents?.recommendations}
                onCheckedChange={(checked) =>
                  setConsents({
                    ...consents!,
                    recommendations: checked as boolean,
                  })
                }
              />
              <div className="flex-1">
                <Label className="font-semibold">
                  Receive Educational Recommendations
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get personalized learning content and tips based on your
                  financial patterns.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Checkbox
                checked={consents?.partnerOffers}
                onCheckedChange={(checked) =>
                  setConsents({
                    ...consents!,
                    partnerOffers: checked as boolean,
                  })
                }
              />
              <div className="flex-1">
                <Label className="font-semibold">
                  Show Partner Information (Optional)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  See educational information about financial products.
                </p>
              </div>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your data is never sold. You can change these settings anytime.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => {}}>
            Delete All My Data
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            This action cannot be undone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## API Endpoints

```tsx
// POST /api/users/:userId/complete-onboarding
interface CompleteOnboardingRequest {
  userId: string;
}

// POST /api/users/:userId/consents
interface SaveConsentsRequest {
  userId: string;
  consents: UserConsents;
}

// GET /api/users/:userId/consents
interface GetConsentsResponse {
  consents: UserConsents;
}
```
