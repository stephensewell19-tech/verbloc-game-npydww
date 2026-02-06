
import React, { createContext, useContext, ReactNode } from 'react';
import { SuperwallProvider as SuperwallSDKProvider, useUser } from 'expo-superwall';
import Constants from 'expo-constants';

// Superwall API keys from app.json
const SUPERWALL_IOS_KEY = Constants.expoConfig?.extra?.superwallIosKey || '';
const SUPERWALL_ANDROID_KEY = Constants.expoConfig?.extra?.superwallAndroidKey || '';

interface SubscriptionContextType {
  isPremium: boolean;
  subscriptionStatus: 'UNKNOWN' | 'INACTIVE' | 'ACTIVE';
  showPaywall: (placement: string) => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

function SubscriptionProviderInner({ children }: { children: ReactNode }) {
  const { subscriptionStatus, user } = useUser();

  const isPremiumValue = subscriptionStatus?.status === 'ACTIVE';
  const statusValue = subscriptionStatus?.status || 'UNKNOWN';

  const showPaywallFunc = async (placement: string) => {
    console.log('[Superwall] Showing paywall for placement:', placement);
    // The paywall will be triggered via usePlacement hook in components
  };

  const checkSubscriptionStatusFunc = async () => {
    console.log('[Superwall] Checking subscription status:', subscriptionStatus);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium: isPremiumValue,
        subscriptionStatus: statusValue,
        showPaywall: showPaywallFunc,
        checkSubscriptionStatus: checkSubscriptionStatusFunc,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function SuperwallProvider({ children }: { children: ReactNode }) {
  return (
    <SuperwallSDKProvider
      apiKeys={{
        ios: SUPERWALL_IOS_KEY,
        android: SUPERWALL_ANDROID_KEY,
      }}
      onConfigurationError={(error) => {
        console.error('[Superwall] Configuration error:', error);
      }}
    >
      <SubscriptionProviderInner>{children}</SubscriptionProviderInner>
    </SuperwallSDKProvider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within SuperwallProvider');
  }
  return context;
}
