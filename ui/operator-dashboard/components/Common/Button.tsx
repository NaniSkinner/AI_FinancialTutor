import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "gradient"
    | "destructive"
    | "outline"
    | "ghost"
    | "secondary";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  children: React.ReactNode;
}

export function Button({
  children,
  className,
  variant = "default",
  size = "default",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm hover:shadow-md",
        {
          "bg-primary text-primary-foreground hover:opacity-90":
            variant === "default",
          "bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 text-white hover:from-indigo-700 hover:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-blue-600":
            variant === "gradient",
          "bg-destructive text-destructive-foreground hover:opacity-90":
            variant === "destructive",
          "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100":
            variant === "outline",
          "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300":
            variant === "ghost",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80":
            variant === "secondary",
        },
        {
          "h-10 px-4 py-2 text-sm": size === "default",
          "h-8 px-3 text-xs": size === "sm",
          "h-12 px-6 text-base": size === "lg",
          "h-14 px-8 text-lg": size === "xl",
          "h-10 w-10 p-0": size === "icon",
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
