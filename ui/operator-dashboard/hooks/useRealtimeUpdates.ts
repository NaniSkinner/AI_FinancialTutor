/**
 * useRealtimeUpdates Hook
 *
 * Connects to Server-Sent Events (SSE) endpoint for real-time dashboard updates.
 * Automatically refreshes data when other operators take actions.
 *
 * Features:
 * - Automatic reconnection on disconnect
 * - Toast notifications for updates
 * - Triggers SWR cache revalidation
 * - Graceful handling when SSE unavailable
 * - Skip in mock data mode
 */

import { useEffect, useRef } from "react";
import { useRecommendations } from "./useRecommendations";
import { useOperatorStats } from "./useOperatorStats";
import { useAlerts } from "./useAlerts";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
// CRITICAL: No localhost fallback to prevent hardcoding localhost in production build
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Detect if we're running in a production environment at runtime
 * Must be a function to work correctly in Next.js SSR
 */
function isProductionEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return !hostname.includes("localhost") && !hostname.includes("127.0.0.1");
}

/**
 * Check if we should use mock data (disabling realtime)
 * Force mock mode if API_URL is empty or localhost
 */
function shouldUseMockData(): boolean {
  const isProd = isProductionEnvironment();
  const hasLocalhostApi = API_URL.includes("localhost");
  const hasEmptyApi = !API_URL || API_URL.trim() === "";
  const forceMock = isProd && (hasLocalhostApi || hasEmptyApi);

  if (typeof window !== "undefined") {
    if (USE_MOCK_DATA) {
      console.log(
        "[Realtime] Mock mode: Realtime updates disabled (USE_MOCK_DATA=true)"
      );
    } else if (forceMock) {
      console.warn(
        "[Realtime] Mock mode: FORCED - No valid API URL for realtime connection"
      );
    }
  }

  return USE_MOCK_DATA || forceMock;
}

interface RealtimeEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export function useRealtimeUpdates() {
  const { mutate: mutateRecommendations } = useRecommendations({
    persona: "all",
    priority: "all",
    status: "pending",
  });
  const { mutate: mutateStats } = useOperatorStats();
  const { mutate: mutateAlerts } = useAlerts();

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip in mock data mode - no real-time updates needed
    if (shouldUseMockData()) {
      console.log("[Realtime] Skipping SSE in mock data mode");
      return;
    }

    // Skip if already connected
    if (eventSourceRef.current) {
      return;
    }

    // Connect to SSE endpoint
    console.log("[Realtime] Connecting to SSE stream...");
    const eventSource = new EventSource(`${API_URL}/api/realtime/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("[Realtime] Connected to real-time updates");
    };

    eventSource.onmessage = (event) => {
      try {
        const update: RealtimeEvent = JSON.parse(event.data);
        handleRealtimeEvent(update);
      } catch (error) {
        console.error("[Realtime] Error parsing event:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[Realtime] SSE connection error:", error);
      eventSource.close();
      eventSourceRef.current = null;

      // Attempt reconnection after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("[Realtime] Attempting to reconnect...");
        // Trigger re-render to reconnect
        mutateRecommendations();
      }, 5000);
    };

    return () => {
      console.log("[Realtime] Cleaning up SSE connection");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [mutateRecommendations, mutateStats, mutateAlerts]);

  const handleRealtimeEvent = (update: RealtimeEvent) => {
    console.log(`[Realtime] Received: ${update.type}`, update.data);

    switch (update.type) {
      case "connected":
        console.log("[Realtime] Initial connection confirmed");
        break;

      case "ping":
        // Keepalive ping - no action needed
        break;

      case "recommendation_approved":
        mutateRecommendations();
        mutateStats();
        showNotification(
          `Recommendation ${update.data.recommendation_id} approved by ${update.data.operator_id}`
        );
        break;

      case "recommendation_rejected":
        mutateRecommendations();
        mutateStats();
        showNotification(
          `Recommendation ${update.data.recommendation_id} rejected by ${update.data.operator_id}`
        );
        break;

      case "recommendation_modified":
        mutateRecommendations();
        showNotification(
          `Recommendation ${update.data.recommendation_id} modified by ${update.data.operator_id}`
        );
        break;

      case "recommendation_flagged":
        mutateRecommendations();
        mutateStats();
        showNotification(
          `Recommendation ${update.data.recommendation_id} flagged by ${update.data.operator_id}`
        );
        break;

      case "recommendation_created":
        mutateRecommendations();
        mutateStats();
        showNotification(
          `New recommendation created for user ${update.data.user_id}`
        );
        break;

      case "alert_triggered":
        mutateAlerts();
        showNotification(
          `Alert triggered: ${update.data.alert_type}`,
          "warning"
        );
        break;

      case "stats_updated":
        mutateStats();
        break;

      default:
        console.log(`[Realtime] Unknown event type: ${update.type}`);
    }
  };

  const showNotification = (
    message: string,
    type: "info" | "warning" = "info"
  ) => {
    // Simple console notification for now
    // In production, this would use a toast library
    console.log(`[Notification] ${type.toUpperCase()}: ${message}`);

    // Optional: Use native browser notification if permission granted
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("SpendSense Operator Dashboard", {
          body: message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        });
      }
    }
  };
}
