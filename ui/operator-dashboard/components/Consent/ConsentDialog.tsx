"use client";

/**
 * ConsentDialog Component
 *
 * Reusable dialog that prompts users to grant consent for AI features
 * Shows when users try to access AI-powered features without consent
 */

import { useState } from "react";
import { Shield, Info, Sparkles, X } from "lucide-react";
import { Modal } from "@/components/Common/Modal";
import { Button } from "@/components/Common/Button";
import { Checkbox } from "@/components/Common/Checkbox";
import { Label } from "@/components/Common/Label";
import { Alert, AlertDescription } from "@/components/Common/Alert";
import { useToast } from "@/hooks/useToast";
import { useConsents } from "@/hooks/useConsents";
import type { ConsentType, UserConsents } from "@/types/consents";
import { CONSENT_DESCRIPTIONS } from "@/types/consents";

interface ConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGranted?: () => void;
  requiredConsents: ConsentType[];
  featureName: string;
  featureDescription: string;
}

export function ConsentDialog({
  isOpen,
  onClose,
  onGranted,
  requiredConsents,
  featureName,
  featureDescription,
}: ConsentDialogProps) {
  const { consents, updateConsents } = useConsents();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  // Local state for pending consent changes
  const [localConsents, setLocalConsents] = useState<UserConsents>(() =>
    consents
      ? { ...consents }
      : {
          dataAnalysis: false,
          recommendations: false,
          partnerOffers: false,
          marketingEmails: false,
        }
  );

  // Check if all required consents are granted
  const allGranted = requiredConsents.every(
    (consent) => localConsents[consent] === true
  );

  const handleSave = async () => {
    if (!allGranted) {
      showToast("Please grant all required permissions to continue", "warning");
      return;
    }

    setSaving(true);
    try {
      const success = await updateConsents(localConsents);
      if (success) {
        showToast("Preferences saved successfully", "success");
        onGranted?.();
        onClose();
      } else {
        showToast("Failed to save preferences", "error");
      }
    } catch (error) {
      console.error("Error saving consents:", error);
      showToast("Failed to save preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset local consents to original state
    setLocalConsents(
      consents
        ? { ...consents }
        : {
            dataAnalysis: false,
            recommendations: false,
            partnerOffers: false,
            marketingEmails: false,
          }
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      size="medium"
      title={`Enable ${featureName}`}
    >
      <div
        className="relative p-6 animate-in fade-in-0 zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="consent-dialog-title"
        aria-describedby="consent-dialog-description"
      >
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Header with icon */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 pr-8">
            <h2
              id="consent-dialog-title"
              className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100 tracking-tight"
            >
              Enable {featureName}?
            </h2>
            <p
              id="consent-dialog-description"
              className="text-base leading-relaxed text-gray-600 dark:text-gray-400"
            >
              {featureDescription}
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <AlertDescription>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                To use this feature, we need your permission to analyze your
                financial data and provide personalized recommendations.
              </p>
            </AlertDescription>
          </div>
        </Alert>

        {/* Consent Checkboxes */}
        <div className="space-y-4 mb-6">
          {requiredConsents.map((consentType) => {
            const info = CONSENT_DESCRIPTIONS[consentType];
            return (
              <div
                key={consentType}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={localConsents[consentType] || false}
                    onCheckedChange={(checked) =>
                      setLocalConsents({
                        ...localConsents,
                        [consentType]: checked as boolean,
                      })
                    }
                    id={`consent-dialog-${consentType}`}
                    className="h-5 w-5 border-2 border-gray-400 dark:border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`consent-dialog-${consentType}`}
                      className="font-semibold text-lg cursor-pointer text-gray-900 dark:text-gray-100"
                    >
                      {info.title}
                      {info.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                      {info.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Privacy Notice */}
        <Alert className="mb-6 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
            <AlertDescription className="text-xs text-gray-700 dark:text-gray-300">
              Your data is never sold. You can change these settings anytime
              from your Settings page.
            </AlertDescription>
          </div>
        </Alert>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Not Now
          </Button>
          <Button onClick={handleSave} disabled={!allGranted || saving}>
            {saving ? "Saving..." : "Enable & Continue"}
          </Button>
        </div>

        {/* Required notice */}
        {!allGranted && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            <span className="text-red-500">*</span> All permissions are required
            to use this feature
          </p>
        )}
      </div>
    </Modal>
  );
}
