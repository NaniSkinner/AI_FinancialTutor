"use client";

/**
 * AI Consent Page
 *
 * Displayed after login to get user authorization for AI data analysis
 * Users must grant consent every login session to use AI features
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Common/Button";
import { Checkbox } from "@/components/Common/Checkbox";
import { Label } from "@/components/Common/Label";
import { Alert, AlertDescription } from "@/components/Common/Alert";
import { useToast } from "@/hooks/useToast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { saveUserConsents } from "@/lib/consents";
import { REQUIRED_CONSENTS, CONSENT_DESCRIPTIONS } from "@/types/consents";
import type { UserConsents } from "@/types/consents";

export default function ConsentPage() {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  // Initialize consents - all unchecked by default
  const [consents, setConsents] = useState<UserConsents>({
    dataAnalysis: false,
    recommendations: false,
    partnerOffers: false,
    marketingEmails: false,
  });

  // Check if all required consents are granted
  const allRequiredGranted = REQUIRED_CONSENTS.every(
    (consent) => consents[consent] === true
  );

  const handleGrantConsent = async () => {
    if (!allRequiredGranted) {
      showToast("Please grant all required permissions to continue", "warning");
      return;
    }

    setSaving(true);
    try {
      await saveUserConsents(userId, consents);
      showToast("Authorization granted successfully", "success");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving consents:", error);
      showToast("Failed to save authorization", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDecline = () => {
    // Redirect back to operator login
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            AI Authorization Required
          </h1>
          <p className="text-lg text-gray-400">
            SpendSense uses AI to analyze financial data and provide personalized recommendations
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-800">
          {/* Info Alert */}
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <AlertDescription>
                <p className="text-sm text-gray-700">
                  To provide you with personalized financial insights and educational content,
                  we need your permission to use AI to analyze your financial data.
                  You&apos;ll be asked to authorize this every time you log in.
                </p>
              </AlertDescription>
            </div>
          </Alert>

          {/* Consent Checkboxes */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              Required Permissions
            </h3>

            {REQUIRED_CONSENTS.map((consentType) => {
              const info = CONSENT_DESCRIPTIONS[consentType];
              return (
                <div
                  key={consentType}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    consents[consentType]
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={consents[consentType] || false}
                      onCheckedChange={(checked) =>
                        setConsents({
                          ...consents,
                          [consentType]: checked as boolean,
                        })
                      }
                      id={`consent-${consentType}`}
                      className="h-5 w-5 mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`consent-${consentType}`}
                        className="font-semibold text-base cursor-pointer text-gray-900 flex items-center gap-2"
                      >
                        {info.title}
                        <span className="text-red-500">*</span>
                        {consents[consentType] && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Optional Consents */}
            <h3 className="font-semibold text-lg text-gray-900 mb-4 mt-6">
              Optional Permissions
            </h3>

            {(Object.keys(consents) as Array<keyof UserConsents>)
              .filter(key => !REQUIRED_CONSENTS.includes(key as any))
              .map((consentType) => {
                const info = CONSENT_DESCRIPTIONS[consentType];
                return (
                  <div
                    key={consentType}
                    className={`p-4 border rounded-lg transition-colors ${
                      consents[consentType]
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={consents[consentType] || false}
                        onCheckedChange={(checked) =>
                          setConsents({
                            ...consents,
                            [consentType]: checked as boolean,
                          })
                        }
                        id={`consent-${consentType}`}
                        className="h-5 w-5 mt-0.5"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`consent-${consentType}`}
                          className="font-medium text-base cursor-pointer text-gray-900"
                        >
                          {info.title}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Privacy Notice */}
          <Alert className="mb-6 bg-green-50 border-green-200">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-green-600 shrink-0" />
              <AlertDescription className="text-sm text-gray-700">
                <strong>Your Privacy Matters:</strong> Your data is never sold to third parties.
                All AI analysis happens securely. You can revoke these permissions anytime
                from your Settings page.
              </AlertDescription>
            </div>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Decline & Logout
            </Button>
            <Button
              onClick={handleGrantConsent}
              disabled={!allRequiredGranted || saving}
              className="w-full sm:w-auto"
            >
              {saving ? "Saving..." : "Authorize & Continue"}
            </Button>
          </div>

          {/* Required notice */}
          {!allRequiredGranted && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              <span className="text-red-500">*</span> All required permissions must be granted to use the dashboard
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>SpendSense User Dashboard - Secure AI Authorization</p>
        </div>
      </div>
    </div>
  );
}
