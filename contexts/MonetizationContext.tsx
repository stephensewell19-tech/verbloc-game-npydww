
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export function MonetizationProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Monetization] Initializing monetization system (mock mode)');
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
      const premiumStatus = stored === 'true';
      setIsPremium(premiumStatus);
      console.log('[Monetization] Loaded premium status:', premiumStatus);
    } catch (err) {
      console.error('[Monetization] Failed to load premium status:', err);
      setError('Failed to load subscription status');
    } finally {
      setIsLoading(false);
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

// Legacy export for backward compatibility
export const SuperwallProvider = MonetizationProvider;
export const useSubscription = useMonetization;
