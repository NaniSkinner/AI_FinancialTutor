# SHARD 2: Core UI Framework

**Project:** SpendSense Operator Dashboard  
**Purpose:** Reusable UI components, layout system, design patterns  
**Phase:** UI Foundation  
**Estimated Size:** ~10% of total implementation  
**Dependencies:** Shard 1 (Foundation)

---

## Overview

This shard focuses on building the reusable UI component library that will be used throughout the dashboard. These components follow shadcn/ui patterns and are built with Radix UI primitives + Tailwind CSS.

---

## Main Dashboard Layout

Create `/pages/index.tsx`:

```tsx
import React from "react";
import { ReviewQueue } from "@/components/ReviewQueue/ReviewQueue";
import { AlertPanel } from "@/components/AlertPanel/AlertPanel";
import { StatsOverview } from "@/components/StatsOverview";

export default function OperatorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                SpendSense Operator View
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">Pending: </span>
                <span className="text-orange-600 font-bold">23</span>
              </div>

              {/* Operator Info */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  JD
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Jane Doe
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      <AlertPanel />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Stats */}
          <div className="col-span-3">
            <StatsOverview />
          </div>

          {/* Main Content - Review Queue */}
          <div className="col-span-9">
            <ReviewQueue />
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## Common Components

### Badge Component

Create `/components/Common/Badge.tsx`:

```tsx
import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
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
          "bg-gray-100 text-gray-800": variant === "default",
          "bg-gray-200 text-gray-900": variant === "secondary",
          "bg-red-100 text-red-800": variant === "destructive",
          "border border-gray-300 bg-white text-gray-700":
            variant === "outline",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
```

---

### Button Component

Create `/components/Common/Button.tsx`:

```tsx
import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
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
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
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
```

---

### Modal Component

Create `/components/Common/Modal.tsx`:

```tsx
import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg",
            "translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg p-6",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            className
          )}
        >
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </Dialog.Title>

          {description && (
            <Dialog.Description className="text-sm text-gray-600 mb-4">
              {description}
            </Dialog.Description>
          )}

          <div className="mt-4">{children}</div>

          <Dialog.Close asChild>
            <button
              className={cn(
                "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white",
                "transition-opacity hover:opacity-100",
                "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              )}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

---

### Select Component

Create `/components/Common/Select.tsx`:

```tsx
import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300",
          "bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500",
          "focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="ml-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-lg"
          position="popper"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm py-2 px-8",
                  "text-sm outline-none focus:bg-gray-100",
                  "data-disabled:pointer-events-none data-disabled:opacity-50"
                )}
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
```

---

### Checkbox Component

Create `/components/Common/Checkbox.tsx`:

```tsx
import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  label?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  id,
  label,
  className,
}: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "h-4 w-4 rounded border border-gray-300",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600",
          className
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  );
}
```

---

### Loading Spinner Component

Create `/components/Common/Spinner.tsx`:

```tsx
import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600",
        {
          "h-4 w-4": size === "sm",
          "h-8 w-8": size === "md",
          "h-12 w-12": size === "lg",
        },
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

---

### Toast Notification Component

Create `/components/Common/Toast.tsx`:

```tsx
import React from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
  const icons = {
    success: "✓",
    error: "✗",
    warning: "⚠",
    info: "ℹ",
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg",
        colors[type]
      )}
    >
      <span className="text-lg">{icons[type]}</span>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}
```

---

### Empty State Component

Create `/components/Common/EmptyState.tsx`:

```tsx
import React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      {icon && (
        <div className="mb-4 flex justify-center text-gray-400">{icon}</div>
      )}

      <h3 className="text-lg font-medium text-gray-900">{title}</h3>

      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg",
            "text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

---

## Stats Overview Component

Create `/components/StatsOverview.tsx`:

```tsx
import React from "react";
import { useOperatorStats } from "@/hooks/useOperatorStats";
import { Spinner } from "@/components/Common/Spinner";

export function StatsOverview() {
  const { data: stats, isLoading, error } = useOperatorStats();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">Failed to load stats</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Overview</h2>

      {/* Pending Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Pending Review</div>
        <div className="text-3xl font-bold text-orange-600 mt-1">
          {stats?.pending || 0}
        </div>
      </div>

      {/* Approved Today */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Approved Today</div>
        <div className="text-3xl font-bold text-green-600 mt-1">
          {stats?.approved_today || 0}
        </div>
      </div>

      {/* Rejected Today */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Rejected Today</div>
        <div className="text-3xl font-bold text-red-600 mt-1">
          {stats?.rejected_today || 0}
        </div>
      </div>

      {/* Flagged Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Flagged Items</div>
        <div className="text-3xl font-bold text-yellow-600 mt-1">
          {stats?.flagged || 0}
        </div>
      </div>

      {/* Average Review Time */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-600">Avg Review Time</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">
          {stats?.avg_review_time_seconds || 0}s
        </div>
      </div>
    </div>
  );
}
```

---

## Custom Hook for Stats

Create `/hooks/useOperatorStats.ts`:

```tsx
import useSWR from "swr";
import { fetchOperatorStats } from "@/lib/api";
import type { OperatorStats } from "@/lib/types";

export function useOperatorStats() {
  const { data, error, isLoading, mutate } = useSWR<OperatorStats>(
    "/api/operator/stats",
    fetchOperatorStats,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
```

---

## Design Tokens

Create `/lib/design-tokens.ts`:

```tsx
// Color Palette
export const colors = {
  // Priority colors
  priority: {
    high: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
    },
    medium: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
    },
    low: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
    },
  },

  // Persona colors
  persona: {
    high_utilization: {
      bg: "bg-red-100",
      text: "text-red-800",
    },
    variable_income_budgeter: {
      bg: "bg-orange-100",
      text: "text-orange-800",
    },
    student: {
      bg: "bg-blue-100",
      text: "text-blue-800",
    },
    subscription_heavy: {
      bg: "bg-purple-100",
      text: "text-purple-800",
    },
    savings_builder: {
      bg: "bg-green-100",
      text: "text-green-800",
    },
  },

  // Status colors
  status: {
    pending: {
      bg: "bg-orange-100",
      text: "text-orange-800",
    },
    approved: {
      bg: "bg-green-100",
      text: "text-green-800",
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-800",
    },
    flagged: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
    },
  },
};

// Spacing
export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
};

// Border Radius
export const borderRadius = {
  sm: "0.25rem", // 4px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  full: "9999px",
};

// Font Sizes
export const fontSize = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
};
```

---

## Acceptance Criteria

**Must Have:**

- [ ] All common components (Badge, Button, Modal, Select, Checkbox) implemented
- [ ] Components are fully typed with TypeScript
- [ ] Components use Tailwind CSS for styling
- [ ] Main dashboard layout created
- [ ] StatsOverview component functional
- [ ] All components render without errors
- [ ] Components are reusable and composable

**Should Have:**

- [ ] Components follow accessibility best practices (ARIA labels, keyboard navigation)
- [ ] Loading and error states handled
- [ ] Responsive design considerations
- [ ] Consistent spacing and typography

---

## Component Usage Examples

### Button

```tsx
<Button onClick={handleClick}>Default Button</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost" size="sm">Small Ghost</Button>
```

### Badge

```tsx
<Badge>Default</Badge>
<Badge variant="destructive">Error</Badge>
<Badge className="bg-blue-100 text-blue-800">Custom</Badge>
```

### Modal

```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
  description="This action cannot be undone."
>
  <div>Modal content here</div>
</Modal>
```

---

## Testing Checklist

- [ ] All components import and render correctly
- [ ] Button variants display with correct colors
- [ ] Modal opens and closes properly
- [ ] Select dropdown shows options
- [ ] Checkbox toggles state
- [ ] Loading spinner animates
- [ ] Toast notifications appear and dismiss
- [ ] Empty state displays correctly

---

**Dependencies:** Shard 1  
**Blocks:** Shard 3, 4, 5, 7 (all UI shards need these components)  
**Estimated Time:** 3-5 hours
