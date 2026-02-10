
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { RemoteConfig, getRemoteConfig, refreshRemoteConfig } from '@/utils/remoteConfig';

interface RemoteConfigContextType {
  config: RemoteConfig | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isFeatureEnabled: (featureName: string) => boolean;
  getABTestVariant: (testName: string) => string | null;
}

const RemoteConfigContext = createContext<RemoteConfigContextType | undefined>(undefined);

/**
 * RemoteConfigProvider - Manages remote configuration and feature flags
 * EXPORT: Named export only
 * Usage: import { RemoteConfigProvider } from '@/contexts/RemoteConfigContext'
 */
export function RemoteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<RemoteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const initializingRef = useRef(false);

  // ✅ FIXED: Initialize only once with proper guards
  useEffect(() => {
    // Prevent multiple initializations
    if (initializingRef.current) {
      console.log('[RemoteConfig] Already initializing, skipping duplicate init');
      return;
    }
    
    if (mountedRef.current) {
      console.log('[RemoteConfig] Already mounted, skipping duplicate init');
      return;
    }
    
    mountedRef.current = true;
    initializingRef.current = true;
    console.log('[RemoteConfig] Component mounted, loading config');
    
    const loadConfig = async () => {
      try {
        if (!mountedRef.current) {
          console.log('[RemoteConfig] Skipping load - component not mounted yet');
          return;
        }
        
        setLoading(true);
        setError(null);
        
        const remoteConfig = await getRemoteConfig();
        
        if (!mountedRef.current) {
          console.log('[RemoteConfig] Component unmounted during load, skipping state update');
          return;
        }
        
        setConfig(remoteConfig);
        console.log('[RemoteConfig] Config loaded:', remoteConfig);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load remote config';
        if (mountedRef.current) {
          setError(errorMessage);
        }
        console.error('[RemoteConfig] Error loading config:', err);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        initializingRef.current = false;
      }
    };

    loadConfig();
    
    return () => {
      console.log('[RemoteConfig] Component unmounting, cleaning up');
      mountedRef.current = false;
      initializingRef.current = false;
    };
  }, []); // ✅ FIXED: Empty dependency array - only run once

  const refresh = async () => {
    try {
      if (!mountedRef.current) {
        console.log('[RemoteConfig] Skipping refresh - component not mounted');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const remoteConfig = await refreshRemoteConfig();
      
      if (!mountedRef.current) {
        console.log('[RemoteConfig] Component unmounted during refresh, skipping state update');
        return;
      }
      
      setConfig(remoteConfig);
      console.log('[RemoteConfig] Config refreshed:', remoteConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh remote config';
      if (mountedRef.current) {
        setError(errorMessage);
      }
      console.error('[RemoteConfig] Error refreshing config:', err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const checkFeatureEnabled = (featureName: string): boolean => {
    if (!config) {
      return false;
    }
    return config.featureFlags[featureName] ?? false;
  };

  const getVariant = (testName: string): string | null => {
    if (!config) {
      return null;
    }
    const test = config.abTests[testName];
    return test?.enabled ? test.variant : null;
  };

  return (
    <RemoteConfigContext.Provider
      value={{
        config,
        loading,
        error,
        refresh,
        isFeatureEnabled: checkFeatureEnabled,
        getABTestVariant: getVariant,
      }}
    >
      {children}
    </RemoteConfigContext.Provider>
  );
}

/**
 * useRemoteConfig hook - Access remote configuration context
 * EXPORT: Named export only
 * Usage: import { useRemoteConfig } from '@/contexts/RemoteConfigContext'
 */
export function useRemoteConfig() {
  const context = useContext(RemoteConfigContext);
  if (context === undefined) {
    throw new Error('useRemoteConfig must be used within a RemoteConfigProvider');
  }
  return context;
}

// Verify exports at module load time
console.log('[RemoteConfigContext] Module loaded, RemoteConfigProvider type:', typeof RemoteConfigProvider);
console.log('[RemoteConfigContext] Module loaded, useRemoteConfig type:', typeof useRemoteConfig);
