"use client";

/**
 * ConsentPrompt Component
 *
 * Friendly prompt that appears before showing the consent dialog
 * Explains why consent is needed and offers to enable the feature
 */

import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/Common/Button";
import { Card } from "@/components/Common/Card";

interface ConsentPromptProps {
  featureName: string;
  icon?: React.ReactNode;
  description: string;
  onEnable: () => void;
  className?: string;
}

export function ConsentPrompt({
  featureName,
  icon,
  description,
  onEnable,
  className = "",
}: ConsentPromptProps) {
  return (
    <Card
      className={`p-8 text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ${className}`}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
            {icon || <Sparkles className="h-8 w-8 text-primary" />}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-900">
            <Lock className="h-3 w-3 text-gray-600 dark:text-gray-400" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 max-w-md">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {featureName} Requires Permission
          </h3>
          <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        {/* Action Button */}
        <Button onClick={onEnable} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Enable AI Features
        </Button>

        {/* Privacy note */}
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
          We'll ask for your permission to analyze your data and provide
          personalized recommendations. Your privacy is protected.
        </p>
      </div>
    </Card>
  );
}
