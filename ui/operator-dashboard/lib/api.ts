// API Client for Operator Dashboard
// Handles all communication with the SpendSense backend API

import type {
  Recommendation,
  UserSignals,
  DecisionTrace,
  OperatorStats,
  Alert,
  BulkApproveResult,
  DashboardResponse,
} from "./types";
import {
  mockRecommendations,
  mockUserSignals,
  mockDecisionTraces,
  mockOperatorStats,
  mockAlerts,
  mockPersonaHistory,
  getMockDashboardData,
  type PersonaHistoryEntry,
} from "./mockData";
import { getAuthToken, useAuth } from "./auth";

// CRITICAL: No localhost fallback to prevent hardcoding localhost in production build
// Empty string forces mock mode when no API URL is configured
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Set to true to use mock data instead of real API calls
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

// ============================================================================
// Production Safety Checks
// ============================================================================

/**
 * Detect if we're running in a production environment at runtime
 * (not localhost or 127.0.0.1)
 * Must be a function to work correctly in Next.js SSR
 */
function isProductionEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return !hostname.includes("localhost") && !hostname.includes("127.0.0.1");
}

/**
 * Check if we should use mock data
 * Force mock mode if:
 * 1. USE_MOCK_DATA is explicitly true
 * 2. API_URL is empty (no backend configured)
 * 3. Production environment with localhost API URL
 */
function shouldUseMockData(): boolean {
  const isProd = isProductionEnvironment();
  const hasLocalhostApi = API_URL.includes("localhost");
  const hasEmptyApi = !API_URL || API_URL.trim() === "";
  const forceMock = isProd && (hasLocalhostApi || hasEmptyApi);

  return USE_MOCK_DATA || forceMock;
}

// Stateful mock data - creates a mutable copy of mock recommendations
let runtimeMockRecommendations: Recommendation[] = [...mockRecommendations];

// ============================================================================
// GENERIC API REQUEST HANDLER
// ============================================================================

/**
 * Generic fetch wrapper with error handling and authentication
 * @param endpoint - API endpoint path
 * @param options - Fetch options
 * @returns Typed response data
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  // Handle authentication errors
  if (response.status === 401) {
    // Token expired or invalid - logout user
    useAuth.getState().logout();

    // Redirect to login page if not already there
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }

    throw new Error("Authentication required. Please log in.");
  }

  // Handle permission errors
  if (response.status === 403) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Insufficient permissions" }));
    throw new Error(
      error.detail || "You don't have permission to perform this action"
    );
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.detail || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// RECOMMENDATIONS API
// ============================================================================

/**
 * Fetch recommendations with optional filters
 * @param filters - Filter criteria (status, persona, priority)
 * @returns Array of recommendations
 */
export async function fetchRecommendations(filters: {
  status?: string;
  persona?: string;
  priority?: string;
}): Promise<Recommendation[]> {
  if (shouldUseMockData()) {
    // Filter mock data based on criteria (use runtime copy for stateful behavior)
    return runtimeMockRecommendations.filter((rec) => {
      if (
        filters.status &&
        filters.status !== "all" &&
        rec.status !== filters.status
      ) {
        return false;
      }
      if (
        filters.persona &&
        filters.persona !== "all" &&
        rec.persona_primary !== filters.persona
      ) {
        return false;
      }
      if (
        filters.priority &&
        filters.priority !== "all" &&
        rec.priority !== filters.priority
      ) {
        return false;
      }
      return true;
    });
  }

  const params = new URLSearchParams(
    Object.entries(filters).filter(
      ([, v]) => v !== "all" && v !== undefined
    ) as [string, string][]
  );
  return apiRequest(`/api/operator/recommendations?${params}`);
}

/**
 * Approve a recommendation
 * @param id - Recommendation ID
 * @param data - Operator notes
 * @returns Updated recommendation
 */
export async function approveRecommendation(
  id: string,
  data: { notes: string }
): Promise<Recommendation> {
  if (shouldUseMockData()) {
    // Mock: Find recommendation and update its status to approved
    const rec = runtimeMockRecommendations.find((r) => r.id === id);
    if (rec) {
      const now = new Date().toISOString();
      const undoExpires = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes from now

      // Store previous status for undo
      rec.previous_status = rec.status;
      rec.status = "approved";
      rec.approved_by = "op_001";
      rec.approved_at = now;
      rec.operator_notes = data.notes;
      rec.status_changed_at = now;
      rec.undo_window_expires_at = undoExpires;

      return { ...rec };
    }
  }
  return apiRequest(`/api/operator/recommendations/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Reject a recommendation
 * @param id - Recommendation ID
 * @param data - Rejection reason
 * @returns Updated recommendation
 */
export async function rejectRecommendation(
  id: string,
  data: { reason: string }
): Promise<Recommendation> {
  if (shouldUseMockData()) {
    const rec = runtimeMockRecommendations.find((r) => r.id === id);
    if (rec) {
      const now = new Date().toISOString();
      const undoExpires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Store previous status for undo
      rec.previous_status = rec.status;
      rec.status = "rejected";
      rec.approved_by = "op_001";
      rec.approved_at = now;
      rec.operator_notes = `Rejected: ${data.reason}`;
      rec.status_changed_at = now;
      rec.undo_window_expires_at = undoExpires;

      return { ...rec };
    }
  }
  return apiRequest(`/api/operator/recommendations/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Modify a recommendation
 * @param id - Recommendation ID
 * @param modifications - Fields to modify
 * @returns Updated recommendation
 */
export async function modifyRecommendation(
  id: string,
  modifications: Partial<{ rationale: string; priority: string; title: string }>
): Promise<Recommendation> {
  if (shouldUseMockData()) {
    const rec = runtimeMockRecommendations.find((r) => r.id === id);
    if (rec) {
      // Apply modifications directly to the recommendation
      Object.assign(rec, modifications);
      return { ...rec };
    }
  }
  return apiRequest(`/api/operator/recommendations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(modifications),
  });
}

/**
 * Flag a recommendation for review
 * @param id - Recommendation ID
 * @param data - Flag reason
 * @returns Updated recommendation
 */
export async function flagRecommendation(
  id: string,
  data: { reason: string }
): Promise<Recommendation> {
  if (shouldUseMockData()) {
    const rec = runtimeMockRecommendations.find((r) => r.id === id);
    if (rec) {
      const now = new Date().toISOString();
      const undoExpires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Store previous status for undo
      rec.previous_status = rec.status;
      rec.status = "flagged";
      rec.operator_notes = `Flagged: ${data.reason}`;
      rec.status_changed_at = now;
      rec.undo_window_expires_at = undoExpires;

      return { ...rec };
    }
  }
  return apiRequest(`/api/operator/recommendations/${id}/flag`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Undo the last action on a recommendation within 5-minute window
 * @param id - Recommendation ID
 * @returns Undo result with restored status
 */
export async function undoAction(id: string): Promise<{
  status: string;
  recommendation_id: string;
  restored_status: string;
  reverted_from: string;
  undone_by: string;
  undone_at: string;
}> {
  if (shouldUseMockData()) {
    const rec = runtimeMockRecommendations.find((r) => r.id === id);
    if (rec && rec.previous_status) {
      // Restore previous status
      const restoredStatus = rec.previous_status as
        | "pending"
        | "approved"
        | "rejected"
        | "flagged";
      const currentStatus = rec.status;
      rec.status = restoredStatus;
      rec.previous_status = undefined;
      rec.status_changed_at = undefined;
      rec.undo_window_expires_at = undefined;

      return {
        status: "undone",
        recommendation_id: id,
        restored_status: restoredStatus,
        reverted_from: currentStatus,
        undone_by: "op_001",
        undone_at: new Date().toISOString(),
      };
    }
    throw new Error("No undo available for this recommendation");
  }
  return apiRequest(`/api/operator/recommendations/${id}/undo`, {
    method: "POST",
  });
}

/**
 * Bulk approve multiple recommendations
 * @param data - Array of recommendation IDs and notes
 * @returns Bulk approval result
 */
export async function bulkApproveRecommendations(data: {
  recommendation_ids: string[];
  notes: string;
}): Promise<BulkApproveResult> {
  if (shouldUseMockData()) {
    // Update all selected recommendations to approved status
    data.recommendation_ids.forEach((id) => {
      const rec = runtimeMockRecommendations.find((r) => r.id === id);
      if (rec) {
        rec.status = "approved";
        rec.approved_by = "op_001";
        rec.approved_at = new Date().toISOString();
        rec.operator_notes = data.notes;
      }
    });

    return {
      total: data.recommendation_ids.length,
      approved: data.recommendation_ids.length,
      failed: 0,
      approved_ids: data.recommendation_ids,
      failed_items: [],
    };
  }
  return apiRequest(`/api/operator/recommendations/bulk-approve`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// USER API
// ============================================================================

/**
 * Fetch user signals for a specific time window
 * @param userId - User ID
 * @param windowType - Time window (default: 30d)
 * @returns User signals data
 */
export async function fetchUserSignals(
  userId: string,
  windowType: string = "30d"
): Promise<UserSignals> {
  if (shouldUseMockData()) {
    return mockUserSignals[userId] || mockUserSignals.user_123;
  }

  return apiRequest(
    `/api/operator/users/${userId}/signals?window_type=${windowType}`
  );
}

/**
 * Fetch persona history for a user
 * @param userId - User ID
 * @returns Array of persona history entries (180 days)
 */
export async function fetchPersonaHistory(
  userId: string
): Promise<PersonaHistoryEntry[]> {
  if (shouldUseMockData()) {
    return mockPersonaHistory[userId] || [];
  }

  return apiRequest(`/api/operator/users/${userId}/persona-history`);
}

// Export PersonaHistoryEntry type for use in hooks
export type { PersonaHistoryEntry };

// ============================================================================
// DECISION TRACES API
// ============================================================================

/**
 * Fetch decision trace for a recommendation
 * @param recommendationId - Recommendation ID
 * @returns Complete decision trace
 */
export async function fetchDecisionTrace(
  recommendationId: string
): Promise<DecisionTrace> {
  if (shouldUseMockData()) {
    return mockDecisionTraces[recommendationId] || mockDecisionTraces.rec_001;
  }

  return apiRequest(`/api/operator/recommendations/${recommendationId}/trace`);
}

// ============================================================================
// OPERATOR STATS API
// ============================================================================

/**
 * Fetch operator statistics
 * @param operatorId - Operator ID (optional, uses env default)
 * @returns Operator statistics
 */
export async function fetchOperatorStats(
  operatorId?: string
): Promise<OperatorStats> {
  if (shouldUseMockData()) {
    return mockOperatorStats;
  }

  const id = operatorId || process.env.NEXT_PUBLIC_OPERATOR_ID;
  return apiRequest(`/api/operator/stats?operator_id=${id}`);
}

// ============================================================================
// ALERTS API
// ============================================================================

/**
 * Fetch current alerts
 * @returns Array of alerts
 */
export async function fetchAlerts(): Promise<Alert[]> {
  if (shouldUseMockData()) {
    return mockAlerts;
  }

  return apiRequest(`/api/operator/alerts`);
}

// ============================================================================
// AUDIT LOGS API
// ============================================================================

/**
 * Fetch audit logs with optional filters
 * @param params - Filter parameters
 * @returns Audit log entries
 */
export async function fetchAuditLogs(params: {
  operator_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<unknown> {
  const queryParams = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [
      string,
      string,
    ][]
  );
  return apiRequest(`/api/operator/audit-logs?${queryParams}`);
}

// ============================================================================
// Notes API
// ============================================================================

export interface Note {
  note_id: string;
  recommendation_id: string;
  operator_id: string;
  note_text: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Get all notes for a recommendation
 */
export async function fetchNotes(recommendationId: string): Promise<Note[]> {
  if (shouldUseMockData()) {
    // Mock notes data
    return [
      {
        note_id: `note_${recommendationId}_1`,
        recommendation_id: recommendationId,
        operator_id: "op_001",
        note_text: "This recommendation looks good but check the tone.",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: null,
      },
      {
        note_id: `note_${recommendationId}_2`,
        recommendation_id: recommendationId,
        operator_id: "op_002",
        note_text: "Verified - tone is appropriate. Ready to approve.",
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ];
  }

  return apiRequest(`/api/operator/recommendations/${recommendationId}/notes`);
}

/**
 * Create a new note
 */
export async function createNote(
  recommendationId: string,
  noteText: string
): Promise<Note> {
  if (shouldUseMockData()) {
    // Mock create note
    const newNote: Note = {
      note_id: `note_${recommendationId}_${Date.now()}`,
      recommendation_id: recommendationId,
      operator_id: "op_001",
      note_text: noteText,
      created_at: new Date().toISOString(),
      updated_at: null,
    };
    return newNote;
  }

  return apiRequest(`/api/operator/recommendations/${recommendationId}/notes`, {
    method: "POST",
    body: JSON.stringify({ note_text: noteText }),
  });
}

/**
 * Update an existing note
 */
export async function updateNote(
  noteId: string,
  noteText: string
): Promise<Note> {
  if (shouldUseMockData()) {
    // Mock update note
    const parts = noteId.split("_");
    const recommendationId = parts.slice(1, -1).join("_");

    return {
      note_id: noteId,
      recommendation_id: recommendationId,
      operator_id: "op_001",
      note_text: noteText,
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return apiRequest(`/api/operator/notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify({ note_text: noteText }),
  });
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: string): Promise<void> {
  if (shouldUseMockData()) {
    // Mock delete note
    return Promise.resolve();
  }

  return apiRequest(`/api/operator/notes/${noteId}`, {
    method: "DELETE",
  });
}

// ============================================================================
// TAGS API
// ============================================================================

export interface Tag {
  tag_id: string;
  recommendation_id: string;
  tag_name: string;
  tagged_by: string;
  tagged_at: string;
}

export interface AvailableTags {
  tags: string[];
  display_names: Record<string, string>;
}

// Mock tags storage (for stateful mock data)
let mockTagsStorage: Tag[] = [];

/**
 * Get all available predefined tags
 */
export async function fetchAvailableTags(): Promise<AvailableTags> {
  if (shouldUseMockData()) {
    return {
      tags: [
        "needs_review",
        "edge_case",
        "training_example",
        "policy_question",
        "tone_concern",
        "eligibility_question",
        "llm_error",
        "great_example",
      ],
      display_names: {
        needs_review: "Needs Review",
        edge_case: "Edge Case",
        training_example: "Training Example",
        policy_question: "Policy Question",
        tone_concern: "Tone Concern",
        eligibility_question: "Eligibility Question",
        llm_error: "LLM Error",
        great_example: "Great Example",
      },
    };
  }

  return apiRequest("/api/operator/tags/available");
}

/**
 * Get all tags for a recommendation
 */
export async function fetchTags(recommendationId: string): Promise<Tag[]> {
  if (shouldUseMockData()) {
    // Return tags for this recommendation from mock storage
    return mockTagsStorage.filter(
      (tag) => tag.recommendation_id === recommendationId
    );
  }

  return apiRequest(`/api/operator/recommendations/${recommendationId}/tags`);
}

/**
 * Add a tag to a recommendation
 */
export async function addTag(
  recommendationId: string,
  tagName: string
): Promise<Tag> {
  if (shouldUseMockData()) {
    // Check if tag already exists
    const existing = mockTagsStorage.find(
      (tag) =>
        tag.recommendation_id === recommendationId && tag.tag_name === tagName
    );
    if (existing) {
      throw new Error("Tag already exists on this recommendation");
    }

    // Create new tag
    const newTag: Tag = {
      tag_id: `tag_${recommendationId}_${tagName}_${Date.now()}`,
      recommendation_id: recommendationId,
      tag_name: tagName,
      tagged_by: "op_001",
      tagged_at: new Date().toISOString(),
    };

    mockTagsStorage.push(newTag);
    return newTag;
  }

  return apiRequest(`/api/operator/recommendations/${recommendationId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tag_name: tagName }),
  });
}

/**
 * Remove a tag
 */
export async function deleteTag(tagId: string): Promise<void> {
  if (shouldUseMockData()) {
    // Remove from mock storage
    mockTagsStorage = mockTagsStorage.filter((tag) => tag.tag_id !== tagId);
    return Promise.resolve();
  }

  return apiRequest(`/api/operator/tags/${tagId}`, {
    method: "DELETE",
  });
}

// ============================================================================
// ANALYTICS API
// ============================================================================

export interface AnalyticsSummary {
  total_actions: number;
  approval_rate: number;
  flag_rate: number;
  queue_size: number;
  avg_processing_time_minutes: number;
  recommendations_generated: number;
}

export interface ActionByType {
  action: string;
  count: number;
}

export interface ActionTimeline {
  date: string;
  action: string;
  count: number;
}

export interface OperatorActivity {
  operator_id: string;
  total_actions: number;
  approvals: number;
  rejections: number;
  modifications: number;
  flags: number;
}

export interface ApprovalByPersona {
  persona_primary: string;
  total: number;
  approved: number;
  rejected: number;
  approval_rate: number;
}

export interface AnalyticsData {
  date_range: {
    start: string;
    end: string;
  };
  summary: AnalyticsSummary;
  actions_by_type: ActionByType[];
  actions_timeline: ActionTimeline[];
  operator_activity: OperatorActivity[];
  approval_by_persona: ApprovalByPersona[];
}

/**
 * Fetch analytics data for the dashboard
 */
export async function fetchAnalytics(
  startDate?: string,
  endDate?: string
): Promise<AnalyticsData> {
  if (shouldUseMockData()) {
    // Generate mock analytics data
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      date_range: {
        start: startDate || thirtyDaysAgo.toISOString(),
        end: endDate || now.toISOString(),
      },
      summary: {
        total_actions: 847,
        approval_rate: 73.5,
        flag_rate: 8.2,
        queue_size: 42,
        avg_processing_time_minutes: 12.3,
        recommendations_generated: 923,
      },
      actions_by_type: [
        { action: "approve", count: 623 },
        { action: "reject", count: 154 },
        { action: "modify", count: 45 },
        { action: "flag", count: 25 },
      ],
      actions_timeline: generateMockTimeline(30),
      operator_activity: [
        {
          operator_id: "op_001",
          total_actions: 312,
          approvals: 234,
          rejections: 56,
          modifications: 15,
          flags: 7,
        },
        {
          operator_id: "op_002",
          total_actions: 289,
          approvals: 215,
          rejections: 52,
          modifications: 17,
          flags: 5,
        },
        {
          operator_id: "op_003",
          total_actions: 246,
          approvals: 174,
          rejections: 46,
          modifications: 13,
          flags: 13,
        },
      ],
      approval_by_persona: [
        {
          persona_primary: "budget_conscious",
          total: 245,
          approved: 189,
          rejected: 56,
          approval_rate: 77.1,
        },
        {
          persona_primary: "goal_oriented",
          total: 198,
          approved: 152,
          rejected: 46,
          approval_rate: 76.8,
        },
        {
          persona_primary: "debt_focused",
          total: 167,
          approved: 114,
          rejected: 53,
          approval_rate: 68.3,
        },
        {
          persona_primary: "passive_saver",
          total: 142,
          approved: 98,
          rejected: 44,
          approval_rate: 69.0,
        },
      ],
    };
  }

  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  return apiRequest(`/api/operator/analytics?${params.toString()}`);
}

// Helper function to generate mock timeline data
function generateMockTimeline(days: number): ActionTimeline[] {
  const timeline: ActionTimeline[] = [];
  const now = new Date();
  const actions = ["approve", "reject", "modify", "flag"];

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];

    actions.forEach((action) => {
      const count = Math.floor(Math.random() * 30) + 5; // Random count between 5-35
      timeline.push({ date: dateStr, action, count });
    });
  }

  return timeline;
}

// ============================================================================
// USER DASHBOARD API
// ============================================================================

/**
 * Get complete dashboard data for a user
 */
export async function getUserDashboard(
  userId: string
): Promise<DashboardResponse> {
  if (shouldUseMockData()) {
    return getMockDashboardData(userId);
  }

  try {
    const response = await fetch(`${API_URL}/api/users/${userId}/dashboard`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    // Fallback to mock data on error
    return getMockDashboardData(userId);
  }
}

/**
 * Record that user viewed a recommendation
 */
export async function recordRecommendationView(
  recommendationId: string
): Promise<void> {
  if (shouldUseMockData()) {
    return Promise.resolve();
  }

  try {
    await fetch(`${API_URL}/api/recommendations/${recommendationId}/view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Silently fail
  }
}

/**
 * Mark recommendation as completed
 */
export async function markRecommendationComplete(
  recommendationId: string,
  userId: string
): Promise<void> {
  if (shouldUseMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return Promise.resolve();
  }

  try {
    await fetch(`${API_URL}/api/recommendations/${recommendationId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// CHAT API FUNCTIONS
// ============================================================================

export interface ChatRequest {
  userId: string;
  message: string;
  persona?: string;
  mode?: "user" | "operator";
}

export interface ChatResponse {
  response: string;
  sources?: string[];
}

/**
 * Send a chat message and get AI/keyword-based response
 */
export async function sendChatMessage(
  userId: string,
  message: string,
  persona?: string,
  mode: "user" | "operator" = "user"
): Promise<ChatResponse> {
  if (shouldUseMockData()) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return getMockChatResponse(message, userId, persona, mode);
  }

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, message, persona, mode }),
  });

  if (!response.ok) {
    throw new Error("Failed to send chat message");
  }

  return response.json();
}

/**
 * Generate mock chat responses based on keywords and user context
 */
function getMockChatResponse(
  message: string,
  userId: string,
  persona?: string,
  mode: "user" | "operator" = "user"
): ChatResponse {
  const lowerMessage = message.toLowerCase();

  // Operator mode - answer questions about the dashboard
  if (mode === "operator") {
    return getOperatorResponse(lowerMessage);
  }

  // Get user data if available
  const userSignals = mockUserSignals[userId];
  const userDashboardData = getMockDashboardData(userId);

  // Credit utilization questions
  if (
    lowerMessage.includes("utilization") ||
    lowerMessage.includes("credit") ||
    lowerMessage.includes("credit score")
  ) {
    const utilization =
      userSignals?.signals.credit.aggregate_utilization_pct ||
      userDashboardData.signals.signals.credit.aggregate_utilization_pct ||
      68;
    const creditUsed =
      userSignals?.signals.credit.total_credit_used ||
      userDashboardData.signals.signals.credit.total_credit_used ||
      5500;
    const creditAvailable =
      userSignals?.signals.credit.total_credit_available ||
      userDashboardData.signals.signals.credit.total_credit_available ||
      8000;

    return {
      response: `Credit utilization is the percentage of your available credit that you're using. Your current utilization is ${utilization}% ($${creditUsed.toLocaleString()} of $${creditAvailable.toLocaleString()} limit). Financial experts generally recommend keeping utilization below 30%, as high utilization can impact your credit score. Lower utilization shows lenders that you're not overly dependent on credit. ${DISCLAIMER_TEXT}`,
      sources: ["credit_signals", "recommendation_credit_101"],
    };
  }

  // Subscription questions - specific expense queries
  if (
    lowerMessage.includes("subscription") ||
    lowerMessage.includes("save money") ||
    lowerMessage.includes("recurring")
  ) {
    const subscriptionCount =
      userSignals?.signals.subscriptions.recurring_merchant_count ||
      userDashboardData.signals.signals.subscriptions
        .recurring_merchant_count ||
      5;
    const subscriptionSpend =
      userSignals?.signals.subscriptions.monthly_recurring_spend ||
      userDashboardData.signals.signals.subscriptions.monthly_recurring_spend ||
      127.5;

    // Check for specific "how much" or "last month" questions
    if (
      lowerMessage.includes("how much") ||
      lowerMessage.includes("last month") ||
      lowerMessage.includes("spent on") ||
      lowerMessage.includes("cost")
    ) {
      return {
        response: `Last month, you spent **$${subscriptionSpend.toFixed(2)}** on subscriptions across ${subscriptionCount} services. This breaks down to about $${(subscriptionSpend / 30).toFixed(2)} per day. Your main subscriptions likely include streaming services, software, and lifestyle apps. That's about ${((subscriptionSpend / (userDashboardData.signals.signals.income.monthly_income || 4200)) * 100).toFixed(1)}% of your monthly income. ${DISCLAIMER_TEXT}`,
        sources: ["subscription_signals", "user_transactions"],
      };
    }

    return {
      response: `You have ${subscriptionCount} active subscriptions totaling $${subscriptionSpend.toFixed(2)}/month. To optimize: 1) Review which ones you actively use each month, 2) Check if you can downgrade any premium plans, 3) Look for annual payment discounts (often 10-20% savings), 4) Cancel duplicates (like multiple streaming services). Many people find they can save 20-30% by auditing subscriptions quarterly. ${DISCLAIMER_TEXT}`,
      sources: ["subscription_signals"],
    };
  }

  // Savings and emergency fund questions
  if (
    lowerMessage.includes("savings") ||
    lowerMessage.includes("emergency fund") ||
    lowerMessage.includes("save")
  ) {
    const savingsBalance =
      userSignals?.signals.savings.total_savings_balance ||
      userDashboardData.signals.signals.savings.total_savings_balance ||
      5250;
    const emergencyMonths =
      userSignals?.signals.savings.emergency_fund_months ||
      userDashboardData.signals.signals.savings.emergency_fund_months ||
      2.1;
    const growthRate =
      userSignals?.signals.savings.savings_growth_rate_pct ||
      userDashboardData.signals.signals.savings.savings_growth_rate_pct ||
      3.2;

    return {
      response: `You currently have $${savingsBalance.toLocaleString()} in savings, which provides about ${emergencyMonths.toFixed(1)} months of emergency coverage. Financial experts often recommend 3-6 months of expenses for an emergency fund. Your savings are growing at ${growthRate.toFixed(1)}% - ${growthRate > 5 ? "that's great progress!" : "consider setting up automatic transfers to accelerate growth."} ${DISCLAIMER_TEXT}`,
      sources: ["savings_signals"],
    };
  }

  // Interest charges
  if (
    lowerMessage.includes("interest") ||
    lowerMessage.includes("charges") ||
    lowerMessage.includes("apr")
  ) {
    const hasInterest =
      userSignals?.signals.credit.any_interest_charges ||
      userDashboardData.signals.signals.credit.any_interest_charges;

    if (hasInterest) {
      return {
        response: `You're currently paying interest charges on your credit cards. Interest on credit cards typically compounds daily, which can significantly increase the total amount you pay over time. Strategies to reduce interest: 1) Pay more than the minimum payment, 2) Focus on paying down high-interest cards first, 3) Consider a balance transfer to a 0% APR card if eligible. Even small extra payments can make a big difference over time. ${DISCLAIMER_TEXT}`,
        sources: ["credit_signals", "interest_education"],
      };
    } else {
      return {
        response: `Great news! You're not currently paying interest charges, which means you're paying your balance in full each month. This is an excellent habit that saves you money and helps build good credit. Keep it up! ${DISCLAIMER_TEXT}`,
        sources: ["credit_signals"],
      };
    }
  }

  // Variable income / budgeting
  if (
    lowerMessage.includes("budget") ||
    lowerMessage.includes("irregular income") ||
    lowerMessage.includes("variable income") ||
    lowerMessage.includes("freelance")
  ) {
    const incomeType =
      userSignals?.signals.income.income_type ||
      userDashboardData.signals.signals.income.income_type;
    const cashBuffer =
      userSignals?.signals.income.cash_flow_buffer_months ||
      userDashboardData.signals.signals.income.cash_flow_buffer_months ||
      0.8;

    if (incomeType === "variable" || incomeType === "irregular") {
      return {
        response: `With variable income, budgeting requires a different approach. Your current cash flow buffer is ${cashBuffer.toFixed(1)} months. Strategies: 1) Budget based on your lowest monthly income, 2) Build a larger emergency fund (aim for 6-9 months vs 3-6), 3) Track income patterns to spot trends, 4) Set aside extra during high-income months for leaner periods. ${DISCLAIMER_TEXT}`,
        sources: ["income_signals", "variable_income_guide"],
      };
    } else {
      return {
        response: `With steady income, you can create a consistent monthly budget. Your current cash flow buffer is ${cashBuffer.toFixed(1)} months. Basic budgeting steps: 1) List all fixed expenses (rent, utilities, subscriptions), 2) Set savings goals (automate if possible), 3) Track discretionary spending, 4) Review and adjust monthly. The 50/30/20 rule (50% needs, 30% wants, 20% savings) is a good starting framework. ${DISCLAIMER_TEXT}`,
        sources: ["income_signals", "budgeting_basics"],
      };
    }
  }

  // Savings goals and purchase planning
  if (
    (lowerMessage.includes("buy") || lowerMessage.includes("purchase")) &&
    (lowerMessage.includes("save") ||
      lowerMessage.includes("month") ||
      lowerMessage.includes("year"))
  ) {
    // Extract dollar amount if mentioned (e.g., "40k", "$40,000", "40000")
    const amountMatch = lowerMessage.match(/\$?([\d,]+)k|\$?([\d,]+),?(\d{3})/);
    let targetAmount = 40000; // default

    if (amountMatch) {
      if (amountMatch[1] && lowerMessage.includes("k")) {
        targetAmount = parseInt(amountMatch[1].replace(/,/g, "")) * 1000;
      } else if (amountMatch[1]) {
        targetAmount = parseInt(
          (amountMatch[1] + (amountMatch[3] || "")).replace(/,/g, "")
        );
      }
    }

    // Extract timeframe (default to 1 year)
    const monthsMatch = lowerMessage.match(/(\d+)\s*(month|year)/i);
    let months = 12;
    if (monthsMatch) {
      months = parseInt(monthsMatch[1]);
      if (monthsMatch[2].toLowerCase() === "year") {
        months *= 12;
      }
    }

    const monthlyNeeded = targetAmount / months;
    const currentSavings =
      userSignals?.signals.savings.total_savings_balance ||
      userDashboardData.signals.signals.savings.total_savings_balance ||
      5250;
    const monthlyIncome =
      userSignals?.signals.income.monthly_income ||
      userDashboardData.signals.signals.income.monthly_income ||
      4200;
    const percentOfIncome = (monthlyNeeded / monthlyIncome) * 100;

    return {
      response: `To save $${targetAmount.toLocaleString()} in ${months} month${months > 1 ? "s" : ""} (${months / 12} year${months / 12 !== 1 ? "s" : ""}), you'd need to save **$${monthlyNeeded.toFixed(2)} per month**.\n\nWith your current savings of $${currentSavings.toLocaleString()}, you'd still need $${(targetAmount - currentSavings).toLocaleString()}.\n\nThis represents ${percentOfIncome.toFixed(1)}% of your monthly income ($${monthlyIncome.toLocaleString()}). ${percentOfIncome > 30 ? "This is an ambitious goal - consider extending the timeframe or looking for ways to increase income." : percentOfIncome > 20 ? "This is achievable with disciplined budgeting." : "This is a very realistic goal!"}\n\nTips: 1) Automate transfers to savings, 2) Cut back on non-essentials, 3) Consider a high-yield savings account to earn interest. ${DISCLAIMER_TEXT}`,
      sources: ["savings_calculator", "goal_planning"],
    };
  }

  // Persona-specific questions
  if (persona === "student" && lowerMessage.includes("coffee")) {
    return {
      response: `Coffee shop visits can add up quickly! At $5 per visit, 5 days a week equals about $100/month. Alternatives: 1) Make coffee at home (saves ~80%), 2) Bring a thermos to campus, 3) Limit to 1-2 shop visits per week as a treat, 4) Look for student discounts. Small daily expenses like this are called "latte factors" and cutting them can free up significant money for savings or reducing debt. ${DISCLAIMER_TEXT}`,
      sources: ["student_budgeting"],
    };
  }

  // Spending analysis questions
  if (
    lowerMessage.includes("spend") ||
    lowerMessage.includes("spent") ||
    lowerMessage.includes("expense")
  ) {
    const monthlyIncome =
      userSignals?.signals.income.monthly_income ||
      userDashboardData.signals.signals.income.monthly_income ||
      4200;
    const subscriptionSpend =
      userSignals?.signals.subscriptions.monthly_recurring_spend ||
      userDashboardData.signals.signals.subscriptions.monthly_recurring_spend ||
      127.5;

    return {
      response: `Based on your recent activity:\n\n• **Monthly Income**: $${monthlyIncome.toLocaleString()}\n• **Subscriptions**: $${subscriptionSpend.toFixed(2)}/month (${((subscriptionSpend / monthlyIncome) * 100).toFixed(1)}% of income)\n• **Current Savings**: $${(userSignals?.signals.savings.total_savings_balance || userDashboardData.signals.signals.savings.total_savings_balance || 5250).toLocaleString()}\n\nYour subscription spending is ${(subscriptionSpend / monthlyIncome) * 100 < 5 ? "well controlled" : "something to monitor"}. Want to know about specific categories? Ask me about credit cards, subscriptions, or savings goals! ${DISCLAIMER_TEXT}`,
      sources: ["spending_analysis", "user_signals"],
    };
  }

  // Default response
  return {
    response: `I can help you understand your financial data! I have access to information about your credit utilization, subscriptions, savings, income patterns, and the recommendations you've received. Try asking specific questions like:\n\n• "How much did I spend on subscriptions last month?"\n• "How much do I need to save per month to buy a $40K car in a year?"\n• "Why is my credit utilization important?"\n• "How can I reduce my subscription costs?"\n• "What's my current savings rate?"\n\n${DISCLAIMER_TEXT}`,
    sources: [],
  };
}

const DISCLAIMER_TEXT =
  "This is educational information, not financial advice.";

/**
 * Generate operator-specific responses about the dashboard
 */
function getOperatorResponse(lowerMessage: string): ChatResponse {
  // Approve/Reject questions
  if (
    lowerMessage.includes("approve") ||
    lowerMessage.includes("reject") ||
    lowerMessage.includes("review")
  ) {
    return {
      response: `To review recommendations: Click on any recommendation card in the Review Queue. You'll see the full details including the decision trace, user signals, and generated rationale. Use the action buttons to Approve (makes it visible to users), Reject (removes it), or Flag for further review. You can also add operator notes to document your decision. Keyboard shortcuts: 'A' to approve, 'R' to reject.`,
      sources: ["operator_guide"],
    };
  }

  // Bulk actions
  if (lowerMessage.includes("bulk") || lowerMessage.includes("multiple")) {
    return {
      response: `Bulk actions let you process multiple recommendations at once. Select recommendations using the checkboxes, then use the "Bulk Approve" button at the top. This is useful when you have many similar high-quality recommendations. Be careful - bulk actions affect all selected items at once. You can undo bulk actions for up to 30 seconds.`,
      sources: ["operator_guide", "bulk_actions"],
    };
  }

  // Decision traces
  if (
    lowerMessage.includes("decision trace") ||
    lowerMessage.includes("why") ||
    lowerMessage.includes("how was")
  ) {
    return {
      response: `Decision traces show exactly how each recommendation was generated. You'll see: 1) User signals detected (credit, savings, subscriptions, income), 2) Persona assignment and match strength, 3) Content matches with relevance scores, 4) LLM-generated rationale, 5) Guardrails checks (tone, advice, eligibility). This transparency helps you verify the AI's reasoning and catch any issues.`,
      sources: ["decision_traces"],
    };
  }

  // Guardrails
  if (
    lowerMessage.includes("guardrail") ||
    lowerMessage.includes("safety") ||
    lowerMessage.includes("check")
  ) {
    return {
      response: `Guardrails are automated safety checks: 1) Tone Check - ensures no financial shaming language, 2) Advice Check - verifies we're providing education, not prescriptive advice, 3) Eligibility Check - confirms the user qualifies for any product offers. Recommendations that fail guardrails are automatically flagged for your review. Red indicators show which checks failed.`,
      sources: ["guardrails_system"],
    };
  }

  // Undo functionality
  if (lowerMessage.includes("undo") || lowerMessage.includes("mistake")) {
    return {
      response: `You can undo recent actions! After approving or rejecting a recommendation, you have a 30-second window to undo. Click the "Undo" button that appears, or use Ctrl+Z (Cmd+Z on Mac). The recommendation returns to its previous state. This helps prevent accidental actions, especially with keyboard shortcuts.`,
      sources: ["undo_system"],
    };
  }

  // Keyboard shortcuts
  if (
    lowerMessage.includes("keyboard") ||
    lowerMessage.includes("shortcut") ||
    lowerMessage.includes("hotkey")
  ) {
    return {
      response: `Keyboard shortcuts speed up your workflow: A = Approve, R = Reject, F = Flag, U = Undo, J/K = Navigate between recommendations, Escape = Close modals, / = Focus search. Press '?' to see the full list. These shortcuts work when you're focused on a recommendation card.`,
      sources: ["keyboard_shortcuts"],
    };
  }

  // Priority levels
  if (
    lowerMessage.includes("priority") ||
    lowerMessage.includes("high") ||
    lowerMessage.includes("urgent")
  ) {
    return {
      response: `Recommendations are prioritized as High, Medium, or Low based on urgency and impact. High priority (red badge) = time-sensitive or high-impact situations like high credit utilization. Medium priority (yellow) = important but not urgent. Low priority (green) = informational or long-term improvements. Review high priority items first.`,
      sources: ["priority_system"],
    };
  }

  // Stats and metrics
  if (
    lowerMessage.includes("stats") ||
    lowerMessage.includes("metrics") ||
    lowerMessage.includes("how many")
  ) {
    return {
      response: `The Stats Overview shows: Pending items (need your review), Approved today (your productivity), Rejected today (quality control), Flagged items (need special attention), and Average review time (your efficiency). These metrics help you manage your workload and maintain quality standards. The queue resets daily.`,
      sources: ["stats_overview"],
    };
  }

  // Alerts
  if (lowerMessage.includes("alert") || lowerMessage.includes("notification")) {
    return {
      response: `Alerts appear at the top when important events occur: Long queue (47+ pending items), Flagged items need attention, Guardrail failures detected, or Unusual patterns found. Click alerts to jump directly to the relevant recommendations. Alerts are color-coded by severity: red (high), yellow (medium), blue (low).`,
      sources: ["alert_system"],
    };
  }

  // User Explorer
  if (
    lowerMessage.includes("user explorer") ||
    lowerMessage.includes("search user")
  ) {
    return {
      response: `User Explorer lets you look up any user's full context: their financial signals, persona history, all recommendations (approved/rejected), and persona transitions over time. Use this to understand patterns, investigate issues, or provide context-aware support. Search by user ID or name in the User Explorer tab.`,
      sources: ["user_explorer"],
    };
  }

  // Tags
  if (lowerMessage.includes("tag") || lowerMessage.includes("label")) {
    return {
      response: `Tags help you organize and filter recommendations. Add tags like "needs-review", "excellent", "edge-case", or create custom tags. Filter the queue by tags to find similar items. Tags are visible only to operators and help with quality assurance, training, and identifying patterns across recommendations.`,
      sources: ["tags_system"],
    };
  }

  // Default operator response
  return {
    response: `I can help you use the SpendSense Operator Dashboard! Ask me about: reviewing recommendations, bulk actions, decision traces, guardrails, keyboard shortcuts, priority levels, stats and metrics, alerts, the user explorer, tags, or the undo system. What would you like to know?`,
    sources: ["operator_guide"],
  };
}
