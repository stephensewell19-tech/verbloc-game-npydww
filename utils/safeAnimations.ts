
import { Platform } from 'react-native';
import {
  FadeIn,
  FadeOut,
  BounceIn,
  ZoomIn,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

// ✅ CRITICAL FIX: Feature flag to disable layout animations on iOS in production
// This prevents SIGABRT crashes from Reanimated layout animation errors
const ENABLE_LAYOUT_ANIMATIONS_IOS = __DEV__; // Only enable in development

/**
 * Safe wrapper for Reanimated entering animations
 * Disables animations on iOS production builds to prevent crashes
 */
export function safeEntering(animation: any) {
  try {
    // Disable layout animations on iOS production builds
    if (Platform.OS === 'ios' && !ENABLE_LAYOUT_ANIMATIONS_IOS) {
      return undefined;
    }
    return animation;
  } catch (error) {
    console.error('[SafeAnimations] Error applying entering animation:', error);
    return undefined;
  }
}

/**
 * Safe wrapper for Reanimated exiting animations
 * Disables animations on iOS production builds to prevent crashes
 */
export function safeExiting(animation: any) {
  try {
    // Disable layout animations on iOS production builds
    if (Platform.OS === 'ios' && !ENABLE_LAYOUT_ANIMATIONS_IOS) {
      return undefined;
    }
    return animation;
  } catch (error) {
    console.error('[SafeAnimations] Error applying exiting animation:', error);
    return undefined;
  }
}

/**
 * Safe FadeIn animation with platform guards
 */
export function safeFadeIn(duration: number = 300) {
  return safeEntering(FadeIn.duration(duration || 300));
}

/**
 * Safe FadeOut animation with platform guards
 */
export function safeFadeOut(duration: number = 300) {
  return safeExiting(FadeOut.duration(duration || 300));
}

/**
 * Safe BounceIn animation with platform guards
 */
export function safeBounceIn(duration: number = 600) {
  return safeEntering(BounceIn.duration(duration || 600));
}

/**
 * Safe ZoomIn animation with platform guards
 */
export function safeZoomIn(duration: number = 300) {
  return safeEntering(ZoomIn.duration(duration || 300));
}

/**
 * Safe withSpring animation with null guards
 */
export function safeWithSpring(toValue: number, config?: any) {
  try {
    // Guard against undefined/null values
    if (toValue === undefined || toValue === null || !isFinite(toValue)) {
      console.warn('[SafeAnimations] Invalid toValue for withSpring:', toValue);
      return toValue || 0;
    }
    return withSpring(toValue, config);
  } catch (error) {
    console.error('[SafeAnimations] Error in withSpring:', error);
    return toValue || 0;
  }
}

/**
 * Safe withTiming animation with null guards
 */
export function safeWithTiming(toValue: number, config?: any) {
  try {
    // Guard against undefined/null values
    if (toValue === undefined || toValue === null || !isFinite(toValue)) {
      console.warn('[SafeAnimations] Invalid toValue for withTiming:', toValue);
      return toValue || 0;
    }
    return withTiming(toValue, config);
  } catch (error) {
    console.error('[SafeAnimations] Error in withTiming:', error);
    return toValue || 0;
  }
}

/**
 * Safe withSequence animation with null guards
 */
export function safeWithSequence(...animations: any[]) {
  try {
    // Filter out any undefined/null animations
    const validAnimations = animations.filter(anim => anim !== undefined && anim !== null);
    if (validAnimations.length === 0) {
      console.warn('[SafeAnimations] No valid animations for withSequence');
      return 0;
    }
    return withSequence(...validAnimations);
  } catch (error) {
    console.error('[SafeAnimations] Error in withSequence:', error);
    return 0;
  }
}

/**
 * Log animation errors for debugging
 */
export function logAnimationError(context: string, error: any) {
  console.error(`[SafeAnimations] ${context}:`, {
    message: error.message,
    stack: error.stack,
    platform: Platform.OS,
  });
}
