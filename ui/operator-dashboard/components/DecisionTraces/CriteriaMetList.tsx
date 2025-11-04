import React from "react";

interface Props {
  criteria: string[];
}

export function CriteriaMetList({ criteria }: Props) {
  if (!criteria || criteria.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-700">Criteria Met:</div>
      <ul className="space-y-1">
        {criteria.map((criterion, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-gray-600"
          >
            <span className="text-green-600 mt-0.5">✓</span>
            <span>{criterion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
