
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { RemoteConfigProvider } from '@/contexts/RemoteConfigContext';
import { MonetizationProvider } from '@/contexts/MonetizationContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// CRITICAL: Verify all imports are defined to prevent "undefined component" crashes
console.log('[RootLayout] Import verification:');
console.log('  - ErrorBoundary:', typeof ErrorBoundary);
console.log('  - AuthProvider:', typeof AuthProvider);
console.log('  - RemoteConfigProvider:', typeof RemoteConfigProvider);
console.log('  - MonetizationProvider:', typeof MonetizationProvider);
console.log('  - Stack:', typeof Stack);
console.log('  - ThemeProvider:', typeof ThemeProvider);

if (typeof ErrorBoundary === 'undefined') {
  console.error('[RootLayout] CRITICAL: ErrorBoundary is undefined!');
}
if (typeof AuthProvider === 'undefined') {
  console.error('[RootLayout] CRITICAL: AuthProvider is undefined!');
}
if (typeof RemoteConfigProvider === 'undefined') {
  console.error('[RootLayout] CRITICAL: RemoteConfigProvider is undefined!');
}
if (typeof MonetizationProvider === 'undefined') {
  console.error('[RootLayout] CRITICAL: MonetizationProvider is undefined!');
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  console.log('[RootLayout] Rendering with all providers');

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <RemoteConfigProvider>
            <MonetizationProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
                <Stack.Screen name="auth-popup" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="diagnostics" options={{ headerShown: false }} />
                <Stack.Screen name="subscription" options={{ headerShown: false }} />
                <Stack.Screen name="admin-config" options={{ headerShown: false }} />
                <Stack.Screen name="board-select" options={{ headerShown: false }} />
                <Stack.Screen name="game" options={{ headerShown: false }} />
                <Stack.Screen name="multiplayer-game" options={{ headerShown: false }} />
                <Stack.Screen name="multiplayer-matchmaking" options={{ headerShown: false }} />
                <Stack.Screen name="daily-challenge" options={{ headerShown: false }} />
                <Stack.Screen name="special-events" options={{ headerShown: false }} />
                <Stack.Screen name="special-event-detail" options={{ headerShown: false }} />
                <Stack.Screen name="notification-preferences" options={{ headerShown: false }} />
                <Stack.Screen name="accessibility-settings" options={{ headerShown: false }} />
                <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
                <Stack.Screen name="terms-of-service" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </MonetizationProvider>
          </RemoteConfigProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
