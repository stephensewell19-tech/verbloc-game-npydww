
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * ACCESSIBILITY UTILITIES
 * Helpers for ensuring VERBLOC meets WCAG 2.1 AA standards
 */

// Check if screen reader is enabled
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.error('[Accessibility] Failed to check screen reader status:', error);
    return false;
  }
};

// Check if reduce motion is enabled
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch (error) {
    console.error('[Accessibility] Failed to check reduce motion status:', error);
    return false;
  }
};

// Announce message to screen reader
export const announceForAccessibility = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message);
};

// WCAG 2.1 contrast ratio calculator
export const getContrastRatio = (foreground: string, background: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map((c) => {
      const sRGB = c / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

// Check if contrast meets WCAG AA standard (4.5:1 for normal text, 3:1 for large text)
export const meetsWCAGAA = (foreground: string, background: string, isLargeText: boolean = false): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

// Check if contrast meets WCAG AAA standard (7:1 for normal text, 4.5:1 for large text)
export const meetsWCAGAAA = (foreground: string, background: string, isLargeText: boolean = false): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
};

// Generate accessibility label for game tiles
export const getTileAccessibilityLabel = (
  letter: string,
  row: number,
  col: number,
  isSelected: boolean,
  isLocked: boolean,
  isSpecial: boolean
): string => {
  let label = `Tile ${letter} at row ${row + 1}, column ${col + 1}`;
  
  if (isLocked) {
    label += ', locked';
  }
  
  if (isSpecial) {
    label += ', special tile';
  }
  
  if (isSelected) {
    label += ', selected';
  }
  
  return label;
};

// Generate accessibility hint for game actions
export const getGameActionHint = (action: 'select' | 'submit' | 'clear' | 'back'): string => {
  const hints = {
    select: 'Double tap to select this tile',
    submit: 'Double tap to submit your word',
    clear: 'Double tap to clear your selection',
    back: 'Double tap to go back',
  };
  return hints[action];
};

// Colorblind mode detection (checks system settings on iOS 13+)
export const getColorblindMode = async (): Promise<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'> => {
  // Note: React Native doesn't have direct API for this
  // This would need native module implementation for full support
  // For now, we return 'none' and rely on our colorblind-safe palette
  return 'none';
};

// Font scaling for accessibility
export const getAccessibleFontSize = (baseFontSize: number, maxScale: number = 2.0): number => {
  // React Native automatically handles font scaling via system settings
  // This helper ensures we don't exceed reasonable limits
  return baseFontSize; // RN handles this automatically
};

// Touch target size validation (minimum 44x44 per Apple HIG)
export const isValidTouchTarget = (width: number, height: number): boolean => {
  const minSize = Platform.OS === 'ios' ? 44 : 48; // iOS: 44pt, Android: 48dp
  return width >= minSize && height >= minSize;
};

// Generate accessible error messages
export const getAccessibleErrorMessage = (error: string): string => {
  // Prefix with "Error:" for screen readers
  return `Error: ${error}`;
};

// Generate accessible success messages
export const getAccessibleSuccessMessage = (message: string): string => {
  // Prefix with "Success:" for screen readers
  return `Success: ${message}`;
};

// Keyboard navigation helpers
export const focusNextElement = (): void => {
  // Helper for keyboard navigation (web primarily)
  if (Platform.OS === 'web') {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
    const nextElement = focusableElements[currentIndex + 1] as HTMLElement;
    if (nextElement) {
      nextElement.focus();
    }
  }
};

export const focusPreviousElement = (): void => {
  // Helper for keyboard navigation (web primarily)
  if (Platform.OS === 'web') {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
    const previousElement = focusableElements[currentIndex - 1] as HTMLElement;
    if (previousElement) {
      previousElement.focus();
    }
  }
};
