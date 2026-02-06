import React from 'react';

/**
 * Performance monitoring utilities for VERBLOC
 * Tracks render times, memory usage, and identifies bottlenecks
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100; // Keep last 100 metrics
  
  /**
   * Start timing an operation
   */
  startTiming(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
      });
      
      // Warn if operation took too long
      if (duration > 100) {
        console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms (>100ms)`);
      }
    };
  }
  
  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }
  
  /**
   * Get average duration for a specific operation
   */
  getAverageDuration(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    
    if (relevantMetrics.length === 0) {
      return 0;
    }
    
    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / relevantMetrics.length;
  }
  
  /**
   * Get all metrics for a specific operation
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }
  
  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; avgDuration: number; maxDuration: number }> {
    const summary: Record<string, { count: number; avgDuration: number; maxDuration: number }> = {};
    
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          avgDuration: 0,
          maxDuration: 0,
        };
      }
      
      summary[metric.name].count++;
      summary[metric.name].maxDuration = Math.max(summary[metric.name].maxDuration, metric.duration);
    });
    
    // Calculate averages
    Object.keys(summary).forEach(name => {
      summary[name].avgDuration = this.getAverageDuration(name);
    });
    
    return summary;
  }
  
  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
  
  /**
   * Log performance summary to console
   */
  logSummary(): void {
    const summary = this.getSummary();
    
    console.log('[Performance] Summary:');
    Object.entries(summary).forEach(([name, stats]) => {
      console.log(
        `  ${name}: ${stats.count} calls, avg ${stats.avgDuration.toFixed(2)}ms, max ${stats.maxDuration.toFixed(2)}ms`
      );
    });
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render time
 */
export function usePerformanceMonitor(componentName: string): void {
  const endTimingRef = React.useRef<(() => void) | null>(null);
  
  if (__DEV__) {
    endTimingRef.current = performanceMonitor.startTiming(`${componentName} render`);
  }
  
  // End timing after render
  React.useEffect(() => {
    if (__DEV__ && endTimingRef.current) {
      endTimingRef.current();
    }
  });
}

/**
 * Decorator for measuring function execution time
 */
export function measurePerformance(name: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const endTiming = performanceMonitor.startTiming(name);
      
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        endTiming();
      }
    };
    
    return descriptor;
  };
}
