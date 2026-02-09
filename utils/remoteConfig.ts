
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticatedGet } from './api';

// Remote configuration types
export interface RemoteConfig {
  featureFlags: FeatureFlags;
  abTests: ABTests;
  gameConfig: GameConfig;
  lastFetched: string;
}

export interface FeatureFlags {
  rankedMode: boolean;
  aiOpponentDifficulty: boolean;
  newWordEffects: boolean;
  communityChallenges: boolean;
  liveMultiplayer: boolean;
  voiceChat: boolean;
  customBoards: boolean;
  tournamentMode: boolean;
  [key: string]: boolean;
}

export interface ABTests {
  [testName: string]: {
    variant: string;
    enabled: boolean;
  };
}

export interface GameConfig {
  minAppVersion: string;
  maxTurnTimeSeconds: number;
  dailyChallengeRefreshHour: number;
  maxActiveGames: number;
  xpMultipliers: {
    solo: number;
    multiplayer: number;
    dailyChallenge: number;
    specialEvent: number;
  };
  [key: string]: any;
}

// Cache keys
const REMOTE_CONFIG_KEY = '@verbloc_remote_config';
const CONFIG_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Default configuration (fallback)
const DEFAULT_CONFIG: RemoteConfig = {
  featureFlags: {
    rankedMode: false,
    aiOpponentDifficulty: false,
    newWordEffects: false,
    communityChallenges: false,
    liveMultiplayer: true,
    voiceChat: false,
    customBoards: false,
    tournamentMode: false,
  },
  abTests: {},
  gameConfig: {
    minAppVersion: '1.0.0',
    maxTurnTimeSeconds: 300,
    dailyChallengeRefreshHour: 0,
    maxActiveGames: 10,
    xpMultipliers: {
      solo: 1.0,
      multiplayer: 1.2,
      dailyChallenge: 1.5,
      specialEvent: 1.3,
    },
  },
  lastFetched: new Date().toISOString(),
};

/**
 * Fetch remote configuration from backend
 */
export async function fetchRemoteConfig(): Promise<RemoteConfig> {
  try {
    console.log('Fetching remote configuration from backend');
    const response = await authenticatedGet<RemoteConfig>('/api/remote-config');
    
    if (response) {
      const config = {
        ...response,
        lastFetched: new Date().toISOString(),
      };
      
      // Cache the configuration
      await AsyncStorage.setItem(REMOTE_CONFIG_KEY, JSON.stringify(config));
      console.log('Remote configuration fetched and cached successfully');
      
      return config;
    }
    
    throw new Error('No response from remote config endpoint');
  } catch (error) {
    console.error('Error fetching remote config:', error);
    
    // Try to load from cache
    const cached = await getCachedConfig();
    if (cached) {
      console.log('Using cached remote configuration');
      return cached;
    }
    
    // Fall back to default config
    console.log('Using default remote configuration');
    return DEFAULT_CONFIG;
  }
}

/**
 * Get cached configuration
 */
async function getCachedConfig(): Promise<RemoteConfig | null> {
  try {
    const cached = await AsyncStorage.getItem(REMOTE_CONFIG_KEY);
    if (cached) {
      const config = JSON.parse(cached) as RemoteConfig;
      
      // Check if cache is still valid
      const lastFetched = new Date(config.lastFetched).getTime();
      const now = Date.now();
      
      if (now - lastFetched < CONFIG_CACHE_DURATION) {
        return config;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading cached config:', error);
    return null;
  }
}

/**
 * Get current configuration (cached or fetch)
 */
export async function getRemoteConfig(): Promise<RemoteConfig> {
  // Try cache first
  const cached = await getCachedConfig();
  if (cached) {
    // Fetch in background to update cache
    fetchRemoteConfig().catch(console.error);
    return cached;
  }
  
  // Fetch if no valid cache
  return fetchRemoteConfig();
}

/**
 * Check if a feature flag is enabled
 */
export async function isFeatureEnabled(featureName: keyof FeatureFlags): Promise<boolean> {
  try {
    const config = await getRemoteConfig();
    return config.featureFlags[featureName] ?? false;
  } catch (error) {
    console.error(`Error checking feature flag ${featureName}:`, error);
    return false;
  }
}

/**
 * Get A/B test variant for a user
 */
export async function getABTestVariant(testName: string): Promise<string | null> {
  try {
    const config = await getRemoteConfig();
    const test = config.abTests[testName];
    
    if (test && test.enabled) {
      return test.variant;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting A/B test variant for ${testName}:`, error);
    return null;
  }
}

/**
 * Get game configuration value
 */
export async function getGameConfigValue<T = any>(key: string, defaultValue: T): Promise<T> {
  try {
    const config = await getRemoteConfig();
    return (config.gameConfig[key] as T) ?? defaultValue;
  } catch (error) {
    console.error(`Error getting game config value ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Force refresh configuration (bypass cache)
 */
export async function refreshRemoteConfig(): Promise<RemoteConfig> {
  console.log('Force refreshing remote configuration');
  return fetchRemoteConfig();
}

/**
 * Clear cached configuration
 */
export async function clearConfigCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(REMOTE_CONFIG_KEY);
    console.log('Remote config cache cleared');
  } catch (error) {
    console.error('Error clearing config cache:', error);
  }
}
