
/**
 * Centralized error handling utilities for VERBLOC
 * Provides consistent error handling, logging, and user feedback
 */

import { Platform } from 'react-native';

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
}

/**
 * Error types
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  GAME = 'GAME',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Parse error into AppError format
 */
export function parseError(error: any): AppError {
  console.error('[ErrorHandling] Parsing error:', error);
  
  // Network errors
  if (error.message?.includes('Network') || error.message?.includes('fetch')) {
    return {
      code: ErrorType.NETWORK,
      message: error.message,
      userMessage: 'Network connection lost. Please check your internet connection.',
      recoverable: true,
      retryable: true,
    };
  }
  
  // API errors
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    
    if (status === 401 || status === 403) {
      return {
        code: ErrorType.AUTH,
        message: error.message || 'Authentication failed',
        userMessage: 'Please sign in again to continue.',
        recoverable: true,
        retryable: false,
      };
    }
    
    if (status >= 500) {
      return {
        code: ErrorType.API,
        message: error.message || 'Server error',
        userMessage: 'Server is experiencing issues. Please try again later.',
        recoverable: true,
        retryable: true,
      };
    }
    
    return {
      code: ErrorType.API,
      message: error.message || 'API error',
      userMessage: error.message || 'Something went wrong. Please try again.',
      recoverable: true,
      retryable: true,
    };
  }
  
  // Validation errors
  if (error.code === 'VALIDATION_ERROR') {
    return {
      code: ErrorType.VALIDATION,
      message: error.message,
      userMessage: error.message,
      recoverable: true,
      retryable: false,
    };
  }
  
  // Unknown errors
  return {
    code: ErrorType.UNKNOWN,
    message: error.message || 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.',
    recoverable: true,
    retryable: true,
  };
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[ErrorHandling] Attempt ${attempt + 1}/${maxRetries}`);
      return await fn();
    } catch (error) {
      lastError = error;
      const appError = parseError(error);
      
      if (!appError.retryable || attempt === maxRetries - 1) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`[ErrorHandling] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Safe async wrapper with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const appError = parseError(error);
    console.error('[ErrorHandling] Safe async error:', appError);
    return { data: fallback || null, error: appError };
  }
}

/**
 * Log error with context
 */
export function logError(
  context: string,
  error: any,
  additionalInfo?: Record<string, any>
): void {
  const appError = parseError(error);
  
  console.error(`[${context}] Error:`, {
    code: appError.code,
    message: appError.message,
    userMessage: appError.userMessage,
    recoverable: appError.recoverable,
    retryable: appError.retryable,
    platform: Platform.OS,
    ...additionalInfo,
  });
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: any): boolean {
  const appError = parseError(error);
  return appError.recoverable;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const appError = parseError(error);
  return appError.retryable;
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: any): string {
  const appError = parseError(error);
  return appError.userMessage;
}
