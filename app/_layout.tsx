
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { SuperwallProvider } from '@/contexts/SuperwallContext';
import { RemoteConfigProvider } from '@/contexts/RemoteConfigContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = '@verbloc_onboarding_completed';

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        console.log('[RootLayout] Checking onboarding status');
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        setIsOnboardingComplete(completed === 'true');
        console.log('[RootLayout] Onboarding complete:', completed === 'true');
      } catch (error) {
        console.error('[RootLayout] Failed to check onboarding status:', error);
        setIsOnboardingComplete(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isOnboardingComplete !== null && !isReady) {
      console.log('[RootLayout] App ready, hiding splash screen');
      setIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isOnboardingComplete, isReady]);

  useEffect(() => {
    if (!isReady || isOnboardingComplete === null) {
      return;
    }

    const currentRoute = segments[0];
    const isOnAuthRoute = currentRoute === 'auth' || currentRoute === 'auth-popup' || currentRoute === 'auth-callback';
    const isOnOnboardingRoute = currentRoute === 'onboarding';

    if (!isOnboardingComplete && !isOnOnboardingRoute && !isOnAuthRoute) {
      console.log('[RootLayout] Redirecting to onboarding');
      router.replace('/onboarding');
    }
  }, [isReady, isOnboardingComplete, segments, router]);

  if (!isReady) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="auth-popup" options={{ headerShown: false }} />
      <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
      <Stack.Screen name="game" options={{ headerShown: false }} />
      <Stack.Screen name="board-select" options={{ headerShown: false }} />
      <Stack.Screen name="multiplayer-matchmaking" options={{ headerShown: false }} />
      <Stack.Screen name="multiplayer-game" options={{ headerShown: false }} />
      <Stack.Screen name="daily-challenge" options={{ headerShown: false }} />
      <Stack.Screen name="special-events" options={{ headerShown: false }} />
      <Stack.Screen name="special-event-detail" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ headerShown: false }} />
      <Stack.Screen name="notification-preferences" options={{ headerShown: false }} />
      <Stack.Screen name="accessibility-settings" options={{ headerShown: false }} />
      <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
      <Stack.Screen name="terms-of-service" options={{ headerShown: false }} />
      <Stack.Screen name="admin-config" options={{ headerShown: false }} />
      <Stack.Screen name="diagnostics" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SuperwallProvider>
          <RemoteConfigProvider>
            <RootLayoutContent />
          </RemoteConfigProvider>
        </SuperwallProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
