import React from "react";

interface Props {
  strength: number; // 0-1
  label: string;
}

export function SignalStrengthIndicator({ strength, label }: Props) {
  const percentage = Math.round(strength * 100);

  const getColor = () => {
    if (strength >= 0.7) return "bg-green-500";
    if (strength >= 0.4) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
