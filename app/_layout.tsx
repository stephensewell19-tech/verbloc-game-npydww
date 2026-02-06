
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { SuperwallProvider } from '@/contexts/SuperwallContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SuperwallProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
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
            <Stack.Screen name="+not-found" />
          </Stack>
        </SuperwallProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
