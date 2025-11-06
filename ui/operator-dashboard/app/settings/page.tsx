"use client";

/**
 * Settings Page
 *
 * Allows users to manage their privacy preferences and consents
 */

import { useState } from "react";
import { Shield, Trash2, Info, Save } from "lucide-react";
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
import { Skeleton } from "@/components/Common/Skeleton";
import { Modal } from "@/components/Common/Modal";
import { useToast } from "@/hooks/useToast";
import { useConsents } from "@/hooks/useConsents";
import { useOnboarding } from "@/hooks/useOnboarding";
import type { ConsentType, UserConsents } from "@/types/consents";
import { CONSENT_DESCRIPTIONS, REQUIRED_CONSENTS } from "@/types/consents";
import { clearConsentData } from "@/lib/consents";
import { resetOnboarding } from "@/lib/onboarding";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function SettingsPage() {
  const { userId } = useCurrentUser();
  const { consents, loading, updateConsents, refetch } = useConsents();
  const { refetch: refetchOnboarding } = useOnboarding();
  const { showToast } = useToast();

  const [localConsents, setLocalConsents] = useState<UserConsents | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Initialize local consents when loaded
  useState(() => {
    if (consents && !localConsents) {
      setLocalConsents({ ...consents });
    }
  });

  // Update local state when consents change
  if (consents && !localConsents) {
    setLocalConsents({ ...consents });
  }

  const hasChanges = () => {
    if (!localConsents || !consents) return false;
    return Object.keys(localConsents).some(
      (key) =>
        localConsents[key as ConsentType] !== consents[key as ConsentType]
    );
  };

  const handleSave = async () => {
    if (!localConsents) return;

    // Check if required consents are granted
    const hasRequired = REQUIRED_CONSENTS.every(
      (consent) => localConsents[consent] === true
    );

    if (!hasRequired) {
      showToast(
        "Required permissions must be granted to continue using SpendSense",
        "warning"
      );
      return;
    }

    setSaving(true);
    try {
      const success = await updateConsents(localConsents);
      if (success) {
        showToast("Settings saved successfully", "success");
      } else {
        showToast("Failed to save settings", "error");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (consents) {
      setLocalConsents({ ...consents });
    }
  };

  const handleDeleteData = async () => {
    try {
      clearConsentData(userId);
      resetOnboarding(userId);
      await refetch();
      await refetchOnboarding();
      showToast("All data has been deleted", "success");
      setShowDeleteConfirm(false);

      // Reload page to reset state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error deleting data:", error);
      showToast("Failed to delete data", "error");
    }
  };

  const handleResetOnboarding = () => {
    try {
      resetOnboarding(userId);
      refetchOnboarding();
      showToast("Onboarding has been reset", "success");
      setShowResetConfirm(false);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      showToast("Failed to reset onboarding", "error");
    }
  };

  if (loading || !localConsents) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your privacy preferences and account settings
          </p>
        </div>

        {/* Privacy & Consent Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy & Consent
            </CardTitle>
            <CardDescription>
              Control how SpendSense uses your data
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Info Alert */}
            <Alert className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <AlertDescription className="text-sm text-gray-700 dark:text-gray-300">
                  SpendSense requires certain permissions to provide
                  personalized educational content. Required permissions are
                  marked with{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </AlertDescription>
              </div>
            </Alert>

            {/* Consent Checkboxes */}
            <div className="space-y-4">
              {Object.keys(CONSENT_DESCRIPTIONS).map((consentType) => {
                const key = consentType as ConsentType;
                const info = CONSENT_DESCRIPTIONS[key];

                return (
                  <div
                    key={key}
                    className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <Checkbox
                      checked={localConsents[key] || false}
                      onCheckedChange={(checked) =>
                        setLocalConsents({
                          ...localConsents,
                          [key]: checked as boolean,
                        })
                      }
                      id={`settings-${key}`}
                      className="h-5 w-5 border-2 border-gray-400 dark:border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`settings-${key}`}
                        className="font-semibold text-base cursor-pointer text-gray-900 dark:text-gray-100"
                      >
                        {info.title}
                        {info.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {info.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Privacy Notice */}
            <Alert className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <AlertDescription className="text-xs text-gray-700 dark:text-gray-300">
                  Your data is never sold. All permissions can be changed at any
                  time.
                </AlertDescription>
              </div>
            </Alert>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges() || saving}
            >
              Reset Changes
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges() || saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>

        {/* Development Tools Card (optional - for testing) */}
        <Card className="mb-6 border-yellow-200 dark:border-yellow-900">
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-500">
              Development Tools
            </CardTitle>
            <CardDescription>Testing and debugging utilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(true)}
              className="w-full"
            >
              Reset Onboarding Flow
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This will show the onboarding modal again on next visit
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-500">
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete All My Data
            </Button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This will permanently delete all your consent preferences and
              reset your account. <strong>This action cannot be undone.</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        size="small"
        title="Delete All Data Confirmation"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Delete All Data?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            This will permanently delete all your consent preferences and
            onboarding data. You&apos;ll need to complete onboarding again.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteData}>
              Delete Everything
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Onboarding Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        size="small"
        title="Reset Onboarding Confirmation"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Reset Onboarding?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            This will reset your onboarding status. The onboarding modal will
            appear again on your next visit to the dashboard.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleResetOnboarding}>Reset Onboarding</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
