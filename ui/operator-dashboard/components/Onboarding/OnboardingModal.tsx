"use client";

/**
 * OnboardingModal Component
 *
 * Modal overlay that guides new users through SpendSense features
 * Collects necessary consents and introduces the platform
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, Info, Shield, X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/Common/Card";
import { Button } from "@/components/Common/Button";
import { Checkbox } from "@/components/Common/Checkbox";
import { Label } from "@/components/Common/Label";
import { Alert, AlertDescription } from "@/components/Common/Alert";
import { Modal } from "@/components/Common/Modal";
import { useToast } from "@/hooks/useToast";
import { useConsents } from "@/hooks/useConsents";
import { useOnboarding } from "@/hooks/useOnboarding";
import type { UserConsents } from "@/types/consents";
import { DEFAULT_CONSENTS, REQUIRED_CONSENTS } from "@/types/consents";
import { getRandomMockPersona, MOCK_PERSONAS } from "@/types/onboarding";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [localConsents, setLocalConsents] = useState<UserConsents>({
    ...DEFAULT_CONSENTS,
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const { updateConsents } = useConsents();
  const { complete } = useOnboarding();

  // Mock persona for completion screen
  const [mockPersonaKey] = useState(() => getRandomMockPersona());
  const mockPersona =
    MOCK_PERSONAS[mockPersonaKey] || MOCK_PERSONAS.savings_builder;

  const totalSteps = 4;

  // Step validation
  const canProceed = () => {
    if (step === 2) {
      // Must have required consents to proceed from consent step
      return localConsents.dataAnalysis && localConsents.recommendations;
    }
    return true;
  };

  // Handle next button
  const handleNext = async () => {
    // Save consents on consent step
    if (step === 2) {
      setSaving(true);
      try {
        const success = await updateConsents(localConsents);
        if (!success) {
          showToast("Failed to save preferences", "error");
          setSaving(false);
          return;
        }
      } catch (error) {
        console.error("Error saving consents:", error);
        showToast("Failed to save preferences", "error");
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    // Complete onboarding on last step
    if (step === totalSteps - 1) {
      setSaving(true);
      try {
        const success = await complete();
        if (success) {
          showToast("Welcome to SpendSense! 🎉", "success");
          onComplete?.();
          onClose();
        } else {
          showToast("Failed to complete onboarding", "error");
        }
      } catch (error) {
        console.error("Error completing onboarding:", error);
        showToast("Failed to complete onboarding", "error");
      }
      setSaving(false);
      return;
    }

    // Move to next step
    setStep(step + 1);
  };

  // Handle back button
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Handle modal close/dismiss
  const handleDismiss = () => {
    onClose();
  };

  // Step 1: Welcome
  const step1Content = (
    <div className="text-center space-y-6 py-4">
      <div className="text-8xl mb-6">📊</div>
      <div className="space-y-4 text-left max-w-md mx-auto">
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          SpendSense helps you{" "}
          <strong className="font-semibold text-gray-900 dark:text-gray-100">
            understand your money habits
          </strong>{" "}
          and learn financial concepts through personalized educational content.
        </p>
        <ul className="space-y-3 text-base text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-3">
            <span className="text-primary text-xl mt-0.5">•</span>
            <span>Analyze your spending patterns and habits</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary text-xl mt-0.5">•</span>
            <span>Get personalized educational content</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary text-xl mt-0.5">•</span>
            <span>Learn financial concepts at your own pace</span>
          </li>
        </ul>
      </div>
      <Alert className="text-left max-w-md mx-auto bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <AlertDescription>
            <strong className="text-gray-900 dark:text-gray-100">
              Important:
            </strong>{" "}
            <span className="text-gray-700 dark:text-gray-300">
              SpendSense provides educational content, not financial advice. We
              help you learn, not tell you what to do.
            </span>
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );

  // Step 2: How It Works
  const step2Content = (
    <div className="space-y-6 py-4">
      {/* Step 1 */}
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <span className="text-2xl">1️⃣</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-gray-100">
            We Analyze Your Data
          </h3>
          <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
            We look at your transaction patterns, savings behavior, and spending
            habits to understand your financial situation.
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
          <span className="text-2xl">2️⃣</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-gray-100">
            You Get Personalized Content
          </h3>
          <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
            Based on your patterns, we recommend educational articles,
            calculators, and learning materials tailored to your needs.
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <span className="text-2xl">3️⃣</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-gray-100">
            You Learn and Grow
          </h3>
          <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
            Track your progress, complete challenges, and improve your financial
            literacy over time.
          </p>
        </div>
      </div>
    </div>
  );

  // Step 3: Privacy & Consent
  const step3Content = (
    <div className="space-y-6 py-4">
      <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
        We need your permission to provide personalized recommendations. You can
        change these anytime in{" "}
        <strong className="font-semibold">Settings</strong>.
      </p>

      <div className="space-y-4">
        {/* Required Consent 1: Data Analysis */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={localConsents.dataAnalysis}
              onCheckedChange={(checked) =>
                setLocalConsents({
                  ...localConsents,
                  dataAnalysis: checked as boolean,
                })
              }
              id="consent-data-analysis"
              className="h-5 w-5 border-2 border-gray-400 dark:border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor="consent-data-analysis"
                className="font-semibold text-lg cursor-pointer text-gray-900 dark:text-gray-100"
              >
                Analyze My Financial Data{" "}
                <span className="text-red-500">*</span>
              </Label>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                Allow SpendSense to detect spending patterns, savings behaviors,
                and financial trends to provide personalized educational
                content.
              </p>
            </div>
          </div>
        </div>

        {/* Required Consent 2: Recommendations */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={localConsents.recommendations}
              onCheckedChange={(checked) =>
                setLocalConsents({
                  ...localConsents,
                  recommendations: checked as boolean,
                })
              }
              id="consent-recommendations"
              className="h-5 w-5 border-2 border-gray-400 dark:border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor="consent-recommendations"
                className="font-semibold text-lg cursor-pointer text-gray-900 dark:text-gray-100"
              >
                Receive Educational Recommendations{" "}
                <span className="text-red-500">*</span>
              </Label>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                Get personalized learning content, articles, calculators, and
                tips based on your financial patterns.
              </p>
            </div>
          </div>
        </div>

        {/* Optional Consent: Partner Offers */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={localConsents.partnerOffers}
              onCheckedChange={(checked) =>
                setLocalConsents({
                  ...localConsents,
                  partnerOffers: checked as boolean,
                })
              }
              id="consent-partner-offers"
              className="h-5 w-5 border-2 border-gray-400 dark:border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor="consent-partner-offers"
                className="font-semibold text-lg cursor-pointer text-gray-900 dark:text-gray-100"
              >
                Show Partner Information{" "}
                <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                See educational information about financial products that might
                be relevant to your situation. These are not endorsements or
                recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Alert className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          <AlertDescription className="text-xs text-gray-700 dark:text-gray-300">
            Your data is never sold. You can revoke these permissions anytime
            from Settings.
          </AlertDescription>
        </div>
      </Alert>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        <span className="text-red-500">*</span> Required to use SpendSense
      </p>
    </div>
  );

  // Step 4: Completion
  const step4Content = (
    <div className="text-center space-y-6 py-4">
      <div className="text-8xl mb-6">✨</div>
      <p className="text-xl font-medium leading-relaxed text-gray-700 dark:text-gray-300">
        We've analyzed your financial data and found some interesting patterns!
      </p>

      <Card
        className={`p-6 bg-gradient-to-br ${mockPersona.color} border-2 border-primary/20 max-w-md mx-auto`}
      >
        <p className="text-base font-medium text-gray-600 dark:text-gray-500 mb-2">
          Your Primary Focus
        </p>
        <h3 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">
          {mockPersona.name}
        </h3>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-400">
          {mockPersona.description}
        </p>
      </Card>

      <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        Your dashboard is ready with personalized recommendations and tools to
        help you learn!
      </p>
    </div>
  );

  const steps = [
    {
      title: "Welcome to SpendSense! 👋",
      description: "Your personal financial education companion",
      content: step1Content,
    },
    {
      title: "How It Works",
      description: "Understanding your financial patterns",
      content: step2Content,
    },
    {
      title: "Your Privacy Matters",
      description: "You're in control of your data",
      content: step3Content,
    },
    {
      title: "You're All Set! 🎉",
      description: "Let's explore your dashboard",
      content: step4Content,
    },
  ];

  const currentStep = steps[step];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDismiss}
      size="large"
      title="SpendSense Onboarding"
    >
      <div
        className="relative"
        role="dialog"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
      >
        {/* Close button - only show if not on last step */}
        {step < totalSteps - 1 && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close onboarding"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}

        <div className="p-6">
          {/* Progress Indicator */}
          <div
            className="flex items-center justify-between mb-6"
            role="navigation"
            aria-label="Onboarding progress"
          >
            <div
              className="flex gap-2"
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
            >
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === step
                      ? "w-8 bg-primary"
                      : idx < step
                        ? "w-2 bg-primary"
                        : "w-2 bg-gray-300 dark:bg-gray-700"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span
              className="text-sm text-gray-500 dark:text-gray-400"
              aria-live="polite"
            >
              Step {step + 1} of {totalSteps}
            </span>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2
              id="onboarding-title"
              className="text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100 tracking-tight"
            >
              {currentStep.title}
            </h2>
            <p
              id="onboarding-description"
              className="text-lg text-gray-600 dark:text-gray-400"
            >
              {currentStep.description}
            </p>
          </div>

          {/* Content */}
          <div className="min-h-[400px] animate-in fade-in-0 slide-in-from-right-2 duration-300">
            {currentStep.content}
          </div>

          {/* Footer Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              className="gap-2"
            >
              {saving ? (
                "Saving..."
              ) : step === totalSteps - 1 ? (
                "Go to Dashboard"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
