/**
 * TagsPanel Component
 *
 * Displays and manages tags for a recommendation.
 * Allows operators to add/remove predefined tags for categorization.
 *
 * Features:
 * - Display existing tags as badges
 * - Add tags from predefined list
 * - Remove tags with confirmation
 * - Color-coded tag categories
 * - Real-time updates via SWR
 *
 * Usage:
 *   <TagsPanel recommendationId={recommendation.id} />
 */

"use client";

import React, { useState } from "react";
import { useTags } from "@/hooks/useTags";
import { useAvailableTags } from "@/hooks/useAvailableTags";
import { addTag, deleteTag } from "@/lib/api";

interface TagsPanelProps {
  recommendationId: string;
}

// Tag color mapping for better visual organization
const TAG_COLORS: Record<string, string> = {
  needs_review: "bg-yellow-100 text-yellow-800 border-yellow-300",
  edge_case: "bg-purple-100 text-purple-800 border-purple-300",
  training_example: "bg-green-100 text-green-800 border-green-300",
  policy_question: "bg-blue-100 text-blue-800 border-blue-300",
  tone_concern: "bg-orange-100 text-orange-800 border-orange-300",
  eligibility_question: "bg-indigo-100 text-indigo-800 border-indigo-300",
  llm_error: "bg-red-100 text-red-800 border-red-300",
  great_example: "bg-teal-100 text-teal-800 border-teal-300",
};

export function TagsPanel({ recommendationId }: TagsPanelProps) {
  const { data: tags, error, isLoading, mutate } = useTags(recommendationId);
  const { data: availableTags } = useAvailableTags();

  const [showAddTag, setShowAddTag] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Get tags that haven't been applied yet
  const unusedTags =
    availableTags?.tags.filter(
      (tag) => !tags?.some((t) => t.tag_name === tag)
    ) || [];

  const handleAddTag = async (tagName: string) => {
    if (!tagName) return;

    setIsAdding(true);
    setAddError(null);

    try {
      await addTag(recommendationId, tagName);
      await mutate(); // Revalidate tags
      setShowAddTag(false);
    } catch (error: any) {
      console.error("Failed to add tag:", error);
      setAddError(error.message || "Failed to add tag");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTag = async (tagId: string, tagName: string) => {
    if (
      !confirm(
        `Remove the "${availableTags?.display_names[tagName] || tagName}" tag?`
      )
    ) {
      return;
    }

    try {
      await deleteTag(tagId);
      await mutate(); // Revalidate tags
    } catch (error: any) {
      console.error("Failed to remove tag:", error);
      alert(error.message || "Failed to remove tag");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Tags</label>
        <div className="text-sm text-gray-500">Loading tags...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Tags</label>
        <div className="text-sm text-red-600">Failed to load tags</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Tags {tags && tags.length > 0 && `(${tags.length})`}
        </label>
      </div>

      {/* Existing Tags */}
      <div className="flex flex-wrap gap-2">
        {tags && tags.length > 0 ? (
          tags.map((tag) => {
            const displayName =
              availableTags?.display_names[tag.tag_name] ||
              tag.tag_name.replace(/_/g, " ");
            const colorClass =
              TAG_COLORS[tag.tag_name] ||
              "bg-gray-100 text-gray-800 border-gray-300";

            return (
              <span
                key={tag.tag_id}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}
              >
                {displayName}
                <button
                  onClick={() => handleRemoveTag(tag.tag_id, tag.tag_name)}
                  className="ml-1 hover:opacity-70 focus:outline-none"
                  aria-label={`Remove ${displayName} tag`}
                  title={`Remove tag (added by ${tag.tagged_by})`}
                >
                  ×
                </button>
              </span>
            );
          })
        ) : (
          <div className="text-sm text-gray-500 italic">
            No tags yet. Add tags to categorize this recommendation.
          </div>
        )}

        {/* Add Tag Control */}
        {showAddTag ? (
          <div className="flex flex-col gap-1">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddTag(e.target.value);
                  e.target.value = ""; // Reset select
                }
              }}
              className="text-xs border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isAdding || unusedTags.length === 0}
            >
              <option value="">
                {unusedTags.length > 0
                  ? "Select a tag..."
                  : "No more tags available"}
              </option>
              {unusedTags.map((tag) => (
                <option key={tag} value={tag}>
                  {availableTags?.display_names[tag] || tag.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            {addError && <div className="text-xs text-red-600">{addError}</div>}
            <button
              onClick={() => {
                setShowAddTag(false);
                setAddError(null);
              }}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          unusedTags.length > 0 && (
            <button
              onClick={() => setShowAddTag(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              + Add Tag
            </button>
          )
        )}
      </div>

      {/* Tag Legend (optional - helps operators understand tag meanings) */}
      {tags && tags.length === 0 && !showAddTag && (
        <details className="text-xs text-gray-600 mt-2">
          <summary className="cursor-pointer hover:text-gray-800">
            Available tag categories
          </summary>
          <ul className="mt-2 space-y-1 ml-4 list-disc">
            {availableTags?.tags.map((tag) => (
              <li key={tag}>
                <span className="font-medium">
                  {availableTags.display_names[tag]}
                </span>
                : {getTagDescription(tag)}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// Helper function to provide tag descriptions
function getTagDescription(tagName: string): string {
  const descriptions: Record<string, string> = {
    needs_review: "Requires additional review before approval",
    edge_case: "Unusual scenario that needs special attention",
    training_example: "Good example for operator training",
    policy_question: "Policy clarification needed",
    tone_concern: "Tone or language needs adjustment",
    eligibility_question: "Eligibility criteria unclear",
    llm_error: "LLM generated incorrect or problematic content",
    great_example: "Excellent recommendation example",
  };

  return descriptions[tagName] || "Categorization tag";
}
