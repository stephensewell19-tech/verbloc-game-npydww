
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import AccessibilitySettings from '@/components/AccessibilitySettings';

export default function AccessibilitySettingsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Accessibility',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <AccessibilitySettings />
      </SafeAreaView>
    </>
  );
}
