import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
}

export function Badge({
  children,
  className,
  variant = "default",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300": variant === "default",
          "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100": variant === "secondary",
          "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300": variant === "destructive",
          "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300":
            variant === "outline",
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300": variant === "success",
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300": variant === "warning",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
