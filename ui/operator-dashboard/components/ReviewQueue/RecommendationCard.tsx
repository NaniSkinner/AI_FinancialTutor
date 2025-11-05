"use client";

import React, { useState } from "react";
import { Badge } from "@/components/Common/Badge";
import { Button } from "@/components/Common/Button";
import { useToast } from "@/components/Common/Toast";
import { DecisionTraces } from "@/components/DecisionTraces/DecisionTraces";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  approveRecommendation,
  rejectRecommendation,
  modifyRecommendation,
  flagRecommendation,
} from "@/lib/api";
import {
  getPriorityColor,
  getPersonaColor,
  formatPersonaName,
} from "@/lib/utils";
import type { Recommendation } from "@/lib/types";

interface Props {
  recommendation: Recommendation;
  isSelected: boolean;
  onToggleSelect: () => void;
  onAction: () => void;
}

/**
 * RecommendationCard component for displaying and managing individual recommendations
 * Supports approve, reject, modify, and flag actions
 * Shows decision traces and guardrail check results
 */
export function RecommendationCard({
  recommendation,
  isSelected,
  onToggleSelect,
  onAction,
}: Props) {
  const [showTraces, setShowTraces] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [modifiedRationale, setModifiedRationale] = useState(
    recommendation.rationale
  );
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveRecommendation(recommendation.id, { notes: "" });
      showToast("Recommendation approved successfully", "success");
      onAction(); // Refresh the list
    } catch (error) {
      console.error("Failed to approve:", error);
      showToast("Failed to approve recommendation", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Reason for rejection (required):");
    if (!reason) return;

    setActionLoading(true);
    try {
      await rejectRecommendation(recommendation.id, { reason });
      showToast("Recommendation rejected", "success");
      onAction();
    } catch (error) {
      console.error("Failed to reject:", error);
      showToast("Failed to reject recommendation", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveModification = async () => {
    setActionLoading(true);
    try {
      await modifyRecommendation(recommendation.id, {
        rationale: modifiedRationale,
      });
      setIsModifying(false);
      showToast("Changes saved successfully", "success");
      onAction();
    } catch (error) {
      console.error("Failed to modify:", error);
      showToast("Failed to save modifications", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async () => {
    const reason = prompt("Reason for flagging (required):");
    if (!reason) return;

    setActionLoading(true);
    try {
      await flagRecommendation(recommendation.id, { reason });
      showToast("Recommendation flagged for review", "warning");
      onAction();
    } catch (error) {
      console.error("Failed to flag:", error);
      showToast("Failed to flag recommendation", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  // Note: Keyboard shortcuts work when user is not typing in input/textarea
  // This allows operators to use shortcuts while reviewing cards
  useKeyboardShortcuts({
    onApprove: handleApprove,
    onReject: handleReject,
    onFlag: handleFlag,
    onModify: () => setIsModifying(true),
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={`bg-white rounded-lg border-2 ${
        isSelected ? "border-indigo-500" : "border-gray-200"
      } overflow-hidden transition-colors`}
    >
      {/* Card Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              aria-label={`Select recommendation ${recommendation.id}`}
            />

            {/* Priority Badge */}
            <Badge className={getPriorityColor(recommendation.priority)}>
              {recommendation.priority.toUpperCase()}
            </Badge>

            {/* Persona Badge */}
            <Badge className={getPersonaColor(recommendation.persona_primary)}>
              {formatPersonaName(recommendation.persona_primary)}
            </Badge>

            {/* Content Type */}
            <Badge className="bg-blue-100 text-blue-800">
              {recommendation.type}
            </Badge>

            {/* Read Time */}
            {recommendation.read_time_minutes && (
              <span className="text-sm text-gray-500">
                ⏱ {recommendation.read_time_minutes} min
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              User: {recommendation.user_id}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTraces(!showTraces)}
              aria-label={`${showTraces ? "Hide" : "Show"} decision traces for ${recommendation.title}`}
              aria-expanded={showTraces}
            >
              {showTraces ? "Hide" : "Show"} Traces
            </Button>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900">
          {recommendation.title}
        </h3>

        {/* Content URL */}
        {recommendation.content_url && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Content: </span>
            <a
              href={recommendation.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              {recommendation.content_url}
            </a>
          </div>
        )}

        {/* Rationale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Rationale
            </label>
            {!isModifying && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModifying(true)}
                aria-label={`Modify recommendation ${recommendation.title}`}
              >
                Modify
              </Button>
            )}
          </div>

          {isModifying ? (
            <textarea
              value={modifiedRationale}
              onChange={(e) => setModifiedRationale(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              aria-label="Edit recommendation rationale"
            />
          ) : (
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              {recommendation.rationale}
            </p>
          )}
        </div>

        {/* Guardrails Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Guardrail Checks
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {recommendation.guardrails_passed.tone_check ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-red-600">✗</span>
              )}
              <span className="text-sm text-gray-600">Tone Check</span>
            </div>

            <div className="flex items-center gap-2">
              {recommendation.guardrails_passed.advice_check ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-red-600">✗</span>
              )}
              <span className="text-sm text-gray-600">Advice Check</span>
            </div>

            <div className="flex items-center gap-2">
              {recommendation.guardrails_passed.eligibility_check ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-red-600">✗</span>
              )}
              <span className="text-sm text-gray-600">Eligibility</span>
            </div>
          </div>
        </div>

        {/* Decision Traces (Expandable) */}
        {showTraces && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <DecisionTraces recommendationId={recommendation.id} />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          {isModifying ? (
            <>
              <Button
                onClick={handleSaveModification}
                disabled={actionLoading}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Changes
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsModifying(false);
                  setModifiedRationale(recommendation.rationale);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 text-white hover:bg-green-700"
                aria-label={`Approve recommendation ${recommendation.title}`}
              >
                ✓ Approve
              </Button>
              <Button
                onClick={handleReject}
                disabled={actionLoading}
                className="bg-red-600 text-white hover:bg-red-700"
                aria-label={`Reject recommendation ${recommendation.title}`}
              >
                ✗ Reject
              </Button>
              <Button
                variant="ghost"
                onClick={handleFlag}
                disabled={actionLoading}
                aria-label={`Flag recommendation ${recommendation.title} for review`}
              >
                🚩 Flag
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
