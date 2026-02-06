import { useRef, useEffect, useCallback } from 'react';
import React from 'react';

/**
 * Performance utilities for VERBLOC
 * Provides memoization, debouncing, and throttling helpers
 */

/**
 * Debounce function - delays execution until after wait time has elapsed
 * Useful for search inputs, resize handlers, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - ensures function is called at most once per wait period
 * Useful for scroll handlers, frequent API calls, etc.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, wait);
    }
  };
}

/**
 * Custom hook for debounced values
 * Useful for search inputs where you want to wait for user to stop typing
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Custom hook for previous value
 * Useful for comparing current vs previous state
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Custom hook for mounting state
 * Prevents state updates on unmounted components
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return useCallback(() => isMountedRef.current, []);
}

/**
 * Batch multiple state updates to prevent unnecessary re-renders
 */
export function batchUpdates(callback: () => void): void {
  // React 18+ automatically batches updates
  // This is a no-op for compatibility
  callback();
}

/**
 * Measure component render time (development only)
 */
export function measureRenderTime(componentName: string, callback: () => void): void {
  if (__DEV__) {
    const start = performance.now();
    callback();
    const end = performance.now();
    const duration = end - start;
    
    if (duration > 16) { // More than one frame (60fps = 16.67ms per frame)
      console.warn(`[Performance] ${componentName} took ${duration.toFixed(2)}ms to render (>16ms)`);
    }
  } else {
    callback();
  }
}
