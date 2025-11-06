"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/Common/Badge";
import { Button } from "@/components/Common/Button";
import { useToast } from "@/components/Common/Toast";
import { DecisionTraces } from "@/components/DecisionTraces/DecisionTraces";
import { NotesPanel } from "./NotesPanel";
import { TagsPanel } from "./TagsPanel";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  approveRecommendation,
  rejectRecommendation,
  modifyRecommendation,
  flagRecommendation,
  undoAction,
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
  const [showNotes, setShowNotes] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [modifiedRationale, setModifiedRationale] = useState(
    recommendation.rationale
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [showUndoButton, setShowUndoButton] = useState(false);
  const [undoCountdown, setUndoCountdown] = useState<number | null>(null);
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

  const handleUndo = async () => {
    if (!confirm("Undo this action? This will restore the previous status."))
      return;

    setActionLoading(true);
    try {
      await undoAction(recommendation.id);
      showToast("Action undone successfully", "success");
      onAction(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to undo:", error);
      showToast(error.message || "Failed to undo action", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================================
  // UNDO WINDOW COUNTDOWN
  // ============================================================================

  useEffect(() => {
    // Check if undo is available
    if (
      recommendation.status_changed_at &&
      recommendation.undo_window_expires_at
    ) {
      const expiresAt = new Date(recommendation.undo_window_expires_at);
      const now = new Date();

      if (now < expiresAt) {
        setShowUndoButton(true);

        // Update countdown every second
        const interval = setInterval(() => {
          const remaining = Math.floor(
            (expiresAt.getTime() - Date.now()) / 1000
          );
          if (remaining <= 0) {
            setShowUndoButton(false);
            setUndoCountdown(null);
            clearInterval(interval);
          } else {
            setUndoCountdown(remaining);
          }
        }, 1000);

        return () => clearInterval(interval);
      }
    }
  }, [
    recommendation.status_changed_at,
    recommendation.undo_window_expires_at,
    recommendation.id,
  ]);

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
      className={`bg-white dark:bg-card rounded-lg border-2 ${
        isSelected
          ? "border-indigo-500 dark:border-indigo-400"
          : "border-gray-200 dark:border-gray-700"
      } overflow-hidden transition-colors`}
    >
      {/* Card Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
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
            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {recommendation.type}
            </Badge>

            {/* Read Time */}
            {recommendation.read_time_minutes && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ⏱ {recommendation.read_time_minutes} min
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
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

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              aria-label={`${showNotes ? "Hide" : "Show"} operator notes for ${recommendation.title}`}
              aria-expanded={showNotes}
            >
              📝 {showNotes ? "Hide" : "Show"} Notes
            </Button>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {recommendation.title}
        </h3>

        {/* Content URL */}
        {recommendation.content_url && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Content: </span>
            <a
              href={recommendation.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
            >
              {recommendation.content_url}
            </a>
          </div>
        )}

        {/* Rationale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows={4}
              aria-label="Edit recommendation rationale"
            />
          ) : (
            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              {recommendation.rationale}
            </p>
          )}
        </div>

        {/* Guardrails Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Guardrail Checks
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {recommendation.guardrails_passed.tone_check ? (
                <span className="text-green-600 dark:text-green-400">✓</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">✗</span>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tone Check
              </span>
            </div>

            <div className="flex items-center gap-2">
              {recommendation.guardrails_passed.advice_check ? (
                <span className="text-green-600 dark:text-green-400">✓</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">✗</span>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Advice Check
              </span>
            </div>

            <div className="flex items-center gap-2">
              {recommendation.guardrails_passed.eligibility_check ? (
                <span className="text-green-600 dark:text-green-400">✓</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">✗</span>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Eligibility
              </span>
            </div>
          </div>
        </div>

        {/* Tags Panel */}
        <div className="pt-2">
          <TagsPanel recommendationId={recommendation.id} />
        </div>

        {/* Undo Action Banner */}
        {showUndoButton && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                  ⚠️ Action can be undone
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  Time remaining: {undoCountdown}s
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndo}
                disabled={actionLoading}
                className="bg-white dark:bg-gray-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 border-yellow-300 dark:border-yellow-600 text-yellow-900 dark:text-yellow-200"
                aria-label={`Undo last action on recommendation ${recommendation.title}`}
              >
                ⟲ Undo
              </Button>
            </div>
          </div>
        )}

        {/* Decision Traces (Expandable) */}
        {showTraces && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <DecisionTraces recommendationId={recommendation.id} />
          </div>
        )}

        {/* Operator Notes (Expandable) */}
        {showNotes && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <NotesPanel recommendationId={recommendation.id} />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
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
