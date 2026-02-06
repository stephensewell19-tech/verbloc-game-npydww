
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@verbloc_onboarding_completed';

export const markOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    console.log('[Onboarding] Marked as complete');
  } catch (error) {
    console.error('[Onboarding] Failed to mark as complete:', error);
  }
};

export const isOnboardingComplete = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('[Onboarding] Failed to check status:', error);
    return false;
  }
};

export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    console.log('[Onboarding] Reset');
  } catch (error) {
    console.error('[Onboarding] Failed to reset:', error);
  }
};
