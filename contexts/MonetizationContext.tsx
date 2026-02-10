
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MonetizationContextType {
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
  showPaywall: (placement?: string) => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
}

const MonetizationContext = createContext<MonetizationContextType | undefined>(undefined);

const PREMIUM_STATUS_KEY = '@verbloc_premium_status';

/**
 * MonetizationProvider - Manages premium subscription state
 * EXPORT: Named export only
 * Usage: import { MonetizationProvider } from '@/contexts/MonetizationContext'
 */
export function MonetizationProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const initializedRef = useRef(false);

  // ✅ FIXED: Initialize only once with proper guards
  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) {
      console.log('[Monetization] Already initialized, skipping duplicate init');
      return;
    }
    
    if (mountedRef.current) {
      console.log('[Monetization] Already mounted, skipping duplicate init');
      return;
    }
    
    mountedRef.current = true;
    initializedRef.current = true;
    console.log('[Monetization] Initializing monetization system (mock mode)');
    
    loadPremiumStatus();
    
    return () => {
      console.log('[Monetization] Component unmounting');
      mountedRef.current = false;
    };
  }, []); // ✅ FIXED: Empty dependency array - only run once

  const loadPremiumStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
      const premiumStatus = stored === 'true';
      
      if (mountedRef.current) {
        setIsPremium(premiumStatus);
      }
      console.log('[Monetization] Loaded premium status:', premiumStatus);
    } catch (err) {
      console.error('[Monetization] Failed to load premium status:', err);
      if (mountedRef.current) {
        setError('Failed to load subscription status');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const checkSubscriptionStatus = async () => {
    console.log('[Monetization] Checking subscription status (mock)');
    await loadPremiumStatus();
  };

  const showPaywall = async (placement?: string) => {
    console.log('[Monetization] Paywall requested from:', placement || 'unknown');
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Premium features are coming soon!\n\nWould you like to be notified when subscriptions are available?'
      );
      if (confirmed) {
        console.log('[Monetization] User opted in for notifications');
      }
    } else {
      Alert.alert(
        'Premium Coming Soon! 🎉',
        'Premium subscriptions will be available in a future update. Stay tuned for exclusive features!',
        [
          {
            text: 'OK',
            onPress: () => console.log('[Monetization] User dismissed paywall'),
          },
        ]
      );
    }
  };

  const contextValue: MonetizationContextType = {
    isPremium,
    isLoading,
    error,
    showPaywall,
    checkSubscriptionStatus,
  };

  return (
    <MonetizationContext.Provider value={contextValue}>
      {children}
    </MonetizationContext.Provider>
  );
}

/**
 * useMonetization hook - Access monetization context
 * EXPORT: Named export only
 * Usage: import { useMonetization } from '@/contexts/MonetizationContext'
 */
export function useMonetization() {
  const context = useContext(MonetizationContext);
  if (context === undefined) {
    console.warn('[Monetization] useMonetization used outside provider, returning safe defaults');
    return {
      isPremium: false,
      isLoading: false,
      error: 'Monetization not initialized',
      showPaywall: async () => {
        Alert.alert('Premium Coming Soon!', 'Monetization is not available yet.');
      },
      checkSubscriptionStatus: async () => {
        console.log('[Monetization] Subscription check skipped (no provider)');
      },
    };
  }
  return context;
}

// Legacy exports for backward compatibility
export const SuperwallProvider = MonetizationProvider;
export const useSubscription = useMonetization;

// Verify exports at module load time
console.log('[MonetizationContext] Module loaded, MonetizationProvider type:', typeof MonetizationProvider);
console.log('[MonetizationContext] Module loaded, useMonetization type:', typeof useMonetization);
