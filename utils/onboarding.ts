
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@verbloc_onboarding_completed';
const LAST_MODE_KEY = '@verbloc_last_mode';

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

// Mode Memory Functions
export const getLastPlayedMode = async (): Promise<'solo' | 'multiplayer' | null> => {
  try {
    const value = await AsyncStorage.getItem(LAST_MODE_KEY);
    return value as 'solo' | 'multiplayer' | null;
  } catch (error) {
    console.error('[ModeMemory] Failed to get last played mode:', error);
    return null;
  }
};

export const setLastPlayedMode = async (mode: 'solo' | 'multiplayer'): Promise<void> => {
  try {
    await AsyncStorage.setItem(LAST_MODE_KEY, mode);
    console.log('[ModeMemory] Last played mode set to:', mode);
  } catch (error) {
    console.error('[ModeMemory] Failed to set last played mode:', error);
  }
};
