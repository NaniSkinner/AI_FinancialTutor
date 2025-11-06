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
    <div className="text-center py-12 bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-gray-700">
      {icon && (
        <div className="mb-4 flex justify-center text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
