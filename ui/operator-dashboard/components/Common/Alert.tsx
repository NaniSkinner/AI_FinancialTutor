import React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
  children: React.ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4",
          {
            "bg-white border-gray-200 text-gray-900": variant === "default",
            "border-red-200 bg-red-50 text-red-900": variant === "destructive",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Alert.displayName = "Alert";

interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    >
      {children}
    </div>
  );
});
AlertDescription.displayName = "AlertDescription";
