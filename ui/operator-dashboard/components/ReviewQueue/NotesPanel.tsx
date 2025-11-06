/**
 * NotesPanel Component
 *
 * Displays and manages operator notes for a recommendation.
 * Features:
 * - View all notes with operator attribution and timestamps
 * - Add new notes
 * - Edit existing notes (own notes only, or admin)
 * - Delete notes (own notes only, or admin)
 * - Real-time updates via SWR
 */

import React, { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import { useAuth } from "@/lib/auth";
import { createNote, updateNote, deleteNote } from "@/lib/api";
import { Button } from "@/components/Common/Button";
import { Spinner } from "@/components/Common/Spinner";
import { formatDateTime } from "@/lib/utils";

interface NotesPanelProps {
  recommendationId: string;
}

export function NotesPanel({ recommendationId }: NotesPanelProps) {
  const { notes, isLoading, mutate } = useNotes(recommendationId);
  const { operator } = useAuth();
  const [newNoteText, setNewNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;

    setIsSubmitting(true);
    try {
      await createNote(recommendationId, newNoteText);
      setNewNoteText("");
      await mutate(); // Refresh notes
    } catch (error) {
      console.error("Failed to add note:", error);
      alert("Failed to add note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editText.trim()) return;

    setIsSubmitting(true);
    try {
      await updateNote(noteId, editText);
      setEditingNoteId(null);
      setEditText("");
      await mutate(); // Refresh notes
    } catch (error) {
      console.error("Failed to update note:", error);
      alert("Failed to update note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    setIsSubmitting(true);
    try {
      await deleteNote(noteId);
      await mutate(); // Refresh notes
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEdit = (noteOperatorId: string) => {
    return (
      operator?.operator_id === noteOperatorId || operator?.role === "admin"
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Spinner size="sm" />
        <span className="ml-2 text-sm text-gray-500">Loading notes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          Operator Notes {notes && notes.length > 0 && `(${notes.length})`}
        </h4>
      </div>

      {/* Existing Notes */}
      {notes && notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.note_id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              {editingNoteId === note.note_id ? (
                // Edit mode
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isSubmitting}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditNote(note.note_id)}
                      disabled={isSubmitting || !editText.trim()}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingNoteId(null);
                        setEditText("");
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">
                        {note.operator_id}
                      </span>
                      {" • "}
                      {formatDateTime(note.created_at)}
                      {note.updated_at && (
                        <span className="text-gray-400"> (edited)</span>
                      )}
                    </div>
                    {canEdit(note.operator_id) && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingNoteId(note.note_id);
                            setEditText(note.note_text);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                          disabled={isSubmitting}
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDeleteNote(note.note_id)}
                          className="text-xs text-red-600 hover:text-red-800 transition-colors"
                          disabled={isSubmitting}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {note.note_text}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          No notes yet. Add one below to document your thoughts or collaborate
          with other operators.
        </p>
      )}

      {/* Add New Note Form */}
      <div className="pt-3 border-t border-gray-200">
        <label
          htmlFor="new-note"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Add a Note
        </label>
        <textarea
          id="new-note"
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Add a note for other operators (e.g., 'Needs senior review', 'Verified with compliance team')..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {newNoteText.length}/5000 characters
          </span>
          <Button
            onClick={handleAddNote}
            disabled={isSubmitting || !newNoteText.trim()}
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Adding...
              </>
            ) : (
              "Add Note"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
