/**
 * Performance Monitoring Hook
 *
 * Tracks component render times and logs performance metrics.
 * Helps identify slow components and optimize rendering.
 *
 * Usage:
 *   usePerformanceMonitoring('ComponentName');
 *
 * Features:
 * - Measures component mount to unmount time
 * - Warns when components take >1000ms to render
 * - Logs to console in development
 * - Can be integrated with analytics in production
 */

import { useEffect, useRef } from "react";

interface PerformanceMetric {
  component: string;
  duration: number;
  timestamp: string;
}

/**
 * Hook to monitor component performance
 * @param componentName - Name of the component being monitored
 */
export function usePerformanceMonitoring(componentName: string) {
  const startTimeRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    // Record start time when component mounts
    startTimeRef.current = performance.now();
    mountTimeRef.current = Date.now();

    return () => {
      // Calculate duration when component unmounts
      const duration = performance.now() - startTimeRef.current;

      // Create performance metric
      const metric: PerformanceMetric = {
        component: componentName,
        duration,
        timestamp: new Date(mountTimeRef.current).toISOString(),
      };

      // Log performance
      logPerformance(metric);

      // Warn if slow (>1000ms)
      if (duration > 1000) {
        console.warn(
          `[Performance Warning] ${componentName} took ${duration.toFixed(2)}ms to render`
        );
      }
    };
  }, [componentName]);
}

/**
 * Log performance metric to console or analytics service
 */
function logPerformance(metric: PerformanceMetric) {
  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Performance] ${metric.component}: ${metric.duration.toFixed(2)}ms`
    );
  }

  // In production, send to analytics service
  // TODO: Integrate with analytics service (e.g., Google Analytics, Mixpanel, DataDog)
  if (process.env.NODE_ENV === "production") {
    // Example: Send to analytics
    // analytics.track('component_render', {
    //   component: metric.component,
    //   duration: metric.duration,
    //   timestamp: metric.timestamp,
    // });
  }

  // Store in performance buffer for debugging
  if (typeof window !== "undefined") {
    if (!window.__PERFORMANCE_METRICS__) {
      window.__PERFORMANCE_METRICS__ = [];
    }
    window.__PERFORMANCE_METRICS__.push(metric);

    // Keep only last 100 metrics
    if (window.__PERFORMANCE_METRICS__.length > 100) {
      window.__PERFORMANCE_METRICS__.shift();
    }
  }
}

/**
 * Get all stored performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetric[] {
  if (typeof window !== "undefined" && window.__PERFORMANCE_METRICS__) {
    return window.__PERFORMANCE_METRICS__;
  }
  return [];
}

/**
 * Get average render time for a component
 */
export function getAverageRenderTime(componentName: string): number {
  const metrics = getPerformanceMetrics().filter(
    (m) => m.component === componentName
  );

  if (metrics.length === 0) return 0;

  const total = metrics.reduce((sum, m) => sum + m.duration, 0);
  return total / metrics.length;
}

/**
 * Get slowest components
 */
export function getSlowestComponents(
  limit: number = 5
): { component: string; avgDuration: number }[] {
  const metrics = getPerformanceMetrics();
  const componentMap = new Map<string, number[]>();

  // Group by component
  metrics.forEach((m) => {
    if (!componentMap.has(m.component)) {
      componentMap.set(m.component, []);
    }
    componentMap.get(m.component)!.push(m.duration);
  });

  // Calculate averages
  const averages = Array.from(componentMap.entries()).map(
    ([component, durations]) => ({
      component,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
    })
  );

  // Sort by duration (slowest first)
  return averages.sort((a, b) => b.avgDuration - a.avgDuration).slice(0, limit);
}

/**
 * Clear all performance metrics
 */
export function clearPerformanceMetrics() {
  if (typeof window !== "undefined") {
    window.__PERFORMANCE_METRICS__ = [];
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __PERFORMANCE_METRICS__?: PerformanceMetric[];
  }
}
