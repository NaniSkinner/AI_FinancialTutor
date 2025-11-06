import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
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
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-indigo-600 text-white hover:bg-indigo-700": variant === "default",
          "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
          "border border-gray-300 bg-white hover:bg-gray-50":
            variant === "outline",
          "hover:bg-gray-100": variant === "ghost",
        },
        {
          "h-10 px-4 py-2": size === "default",
          "h-8 px-3 text-sm": size === "sm",
          "h-12 px-6": size === "lg",
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
