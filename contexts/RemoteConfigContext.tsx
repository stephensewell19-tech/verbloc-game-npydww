
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RemoteConfig, getRemoteConfig, refreshRemoteConfig, isFeatureEnabled, getABTestVariant } from '@/utils/remoteConfig';

interface RemoteConfigContextType {
  config: RemoteConfig | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isFeatureEnabled: (featureName: string) => boolean;
  getABTestVariant: (testName: string) => string | null;
}

const RemoteConfigContext = createContext<RemoteConfigContextType | undefined>(undefined);

export function RemoteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<RemoteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const remoteConfig = await getRemoteConfig();
      setConfig(remoteConfig);
      console.log('Remote config loaded in context:', remoteConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load remote config';
      setError(errorMessage);
      console.error('Error loading remote config:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const remoteConfig = await refreshRemoteConfig();
      setConfig(remoteConfig);
      console.log('Remote config refreshed:', remoteConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh remote config';
      setError(errorMessage);
      console.error('Error refreshing remote config:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkFeatureEnabled = (featureName: string): boolean => {
    if (!config) return false;
    return config.featureFlags[featureName] ?? false;
  };

  const getVariant = (testName: string): string | null => {
    if (!config) return null;
    const test = config.abTests[testName];
    return test?.enabled ? test.variant : null;
  };

  useEffect(() => {
    loadConfig();
  }, []);

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

export function useRemoteConfig() {
  const context = useContext(RemoteConfigContext);
  if (context === undefined) {
    throw new Error('useRemoteConfig must be used within a RemoteConfigProvider');
  }
  return context;
}
