
import React, { createContext, useContext, ReactNode } from 'react';

interface SubscriptionContextType {
  isPremium: boolean;
  subscriptionStatus: 'UNKNOWN' | 'INACTIVE' | 'ACTIVE';
  showPaywall: () => void;
  checkSubscriptionStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SuperwallProvider({ children }: { children: ReactNode }) {
  console.log('[SuperwallContext] Using mock provider (native module not available)');

  const mockContext: SubscriptionContextType = {
    isPremium: false,
    subscriptionStatus: 'INACTIVE',
    showPaywall: () => {
      console.log('[SuperwallContext] Paywall requested - Premium coming soon!');
      alert('Premium features coming soon!');
    },
    checkSubscriptionStatus: async () => {
      console.log('[SuperwallContext] Subscription status check (mock)');
    },
  };

  return (
    <SubscriptionContext.Provider value={mockContext}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within SuperwallProvider');
  }
  return context;
}
