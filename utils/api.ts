
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { BEARER_TOKEN_KEY } from "@/lib/auth";
import * as Notifications from 'expo-notifications';
import { retryWithBackoff, NetworkError, AuthenticationError, getUserFriendlyErrorMessage } from './errorHandling';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Backend URL is configured in app.json under expo.extra.backendUrl
 * It is set automatically when the backend is deployed
 */
export const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || "";

/**
 * Check if backend is properly configured
 */
export const isBackendConfigured = (): boolean => {
  return !!BACKEND_URL && BACKEND_URL.length > 0;
};

/**
 * Get bearer token from platform-specific storage
 * Web: localStorage
 * Native: SecureStore
 *
 * @returns Bearer token or null if not found
 */
export const getBearerToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(BEARER_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(BEARER_TOKEN_KEY);
    }
  } catch (error) {
    console.error("[API] Error retrieving bearer token:", error);
    return null;
  }
};

/**
 * Generic API call helper with error handling and retry logic
 *
 * @param endpoint - API endpoint path (e.g., '/users', '/auth/login')
 * @param options - Fetch options (method, headers, body, etc.)
 * @param retryOptions - Retry configuration
 * @returns Parsed JSON response
 * @throws Error if backend is not configured or request fails
 */
export const apiCall = async <T = any>(
  endpoint: string,
  options?: RequestInit,
  retryOptions?: { maxRetries?: number; baseDelay?: number }
): Promise<T> => {
  if (!isBackendConfigured()) {
    throw new Error("Backend URL not configured. Please rebuild the app.");
  }

  const url = `${BACKEND_URL}${endpoint}`;
  console.log("[API] Calling:", url, options?.method || "GET");

  const makeRequest = async (): Promise<T> => {
    try {
      const fetchOptions: RequestInit = {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      };

      console.log("[API] Fetch options:", fetchOptions);

      // Always send the token if we have it (needed for cross-domain/iframe support)
      const token = await getBearerToken();
      if (token) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const text = await response.text();
        console.error("[API] Error response:", response.status, text);
        
        // Throw specific error types
        if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError('Authentication required');
        }
        
        throw new NetworkError(`API error: ${response.status} - ${text}`, response.status);
      }

      const data = await response.json();
      console.log("[API] Success:", data);
      return data;
    } catch (error) {
      console.error("[API] Request failed:", error);
      
      // Re-throw with better error messages
      if (error instanceof AuthenticationError || error instanceof NetworkError) {
        throw error;
      }
      
      // Network errors
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new NetworkError('No internet connection');
      }
      
      throw error;
    }
  };

  // Use retry logic for non-authentication requests
  if (retryOptions && retryOptions.maxRetries && retryOptions.maxRetries > 0) {
    return retryWithBackoff(makeRequest, retryOptions.maxRetries, retryOptions.baseDelay);
  }

  return makeRequest();
};

/**
 * GET request helper with retry
 */
export const apiGet = async <T = any>(
  endpoint: string,
  retryOptions?: { maxRetries?: number; baseDelay?: number }
): Promise<T> => {
  return apiCall<T>(endpoint, { method: "GET" }, retryOptions || { maxRetries: 3, baseDelay: 1000 });
};

/**
 * POST request helper
 */
export const apiPost = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * PUT request helper
 */
export const apiPut = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request helper
 */
export const apiPatch = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request helper
 * Always sends a body to avoid FST_ERR_CTP_EMPTY_JSON_BODY errors
 */
export const apiDelete = async <T = any>(endpoint: string, data: any = {}): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "DELETE",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated API call helper with retry logic
 * Automatically retrieves bearer token from storage and adds to Authorization header
 *
 * @param endpoint - API endpoint path
 * @param options - Fetch options (method, headers, body, etc.)
 * @param retryOptions - Retry configuration
 * @returns Parsed JSON response
 * @throws Error if token not found or request fails
 */
export const authenticatedApiCall = async <T = any>(
  endpoint: string,
  options?: RequestInit,
  retryOptions?: { maxRetries?: number; baseDelay?: number }
): Promise<T> => {
  const token = await getBearerToken();

  if (!token) {
    throw new AuthenticationError("Authentication token not found. Please sign in.");
  }

  return apiCall<T>(
    endpoint,
    {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    },
    retryOptions
  );
};

/**
 * Authenticated GET request with retry
 */
export const authenticatedGet = async <T = any>(
  endpoint: string,
  retryOptions?: { maxRetries?: number; baseDelay?: number }
): Promise<T> => {
  return authenticatedApiCall<T>(
    endpoint,
    { method: "GET" },
    retryOptions || { maxRetries: 3, baseDelay: 1000 }
  );
};

/**
 * Authenticated POST request
 */
export const authenticatedPost = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated PUT request
 */
export const authenticatedPut = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated PATCH request
 */
export const authenticatedPatch = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated DELETE request
 * Always sends a body to avoid FST_ERR_CTP_EMPTY_JSON_BODY errors
 */
export const authenticatedDelete = async <T = any>(endpoint: string, data: any = {}): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "DELETE",
    body: JSON.stringify(data),
  });
};

/**
 * Export error handling utilities for use in components
 */
export { getUserFriendlyErrorMessage, NetworkError, AuthenticationError };
