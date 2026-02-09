
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// ACCESSIBILITY: Colorblind-friendly palette with high contrast
// Primary colors chosen to be distinguishable for all types of colorblindness
export const colors = {
  // Core brand colors (colorblind-safe)
  primary: '#6366F1',      // Vibrant Indigo (safe for all colorblind types)
  secondary: '#8B5CF6',    // Purple (distinct from primary)
  accent: '#EC4899',       // Pink (high contrast)
  
  // Background colors (high contrast)
  background: '#0F172A',   // Deep Navy (WCAG AAA compliant)
  backgroundAlt: '#1E293B', // Slate (sufficient contrast)
  
  // Text colors (WCAG AAA compliant - 7:1 contrast ratio)
  text: '#F1F5F9',         // Light text (high contrast on dark bg)
  textSecondary: '#94A3B8', // Muted text (still readable, 4.5:1 minimum)
  
  // Card and UI elements
  card: '#1E293B',         // Card background
  cardBorder: '#334155',   // Subtle border for definition
  
  // Game-specific colors (colorblind-friendly with icons)
  highlight: '#FBBF24',    // Gold for special tiles (warm, distinct)
  success: '#10B981',      // Green (paired with checkmark icon)
  error: '#EF4444',        // Red (paired with X icon)
  warning: '#F59E0B',      // Orange (paired with alert icon)
  info: '#3B82F6',         // Blue (paired with info icon)
  
  // Tile colors (colorblind-safe with patterns/icons)
  tile: '#334155',         // Default tile
  tileActive: '#6366F1',   // Active tile (indigo)
  tileSpecial: '#8B5CF6',  // Special tile (purple)
  tileLocked: '#475569',   // Locked tile (gray)
  tileVault: '#FBBF24',    // Vault tile (gold)
  tileFog: '#64748B',      // Fog tile (light gray)
  
  // Status colors (always paired with icons for accessibility)
  online: '#10B981',       // Green + dot icon
  offline: '#6B7280',      // Gray + dot icon
  away: '#F59E0B',         // Orange + dot icon
  
  // Difficulty colors (colorblind-safe + icons)
  difficultyEasy: '#10B981',    // Green + star icon
  difficultyMedium: '#F59E0B',  // Orange + star icon
  difficultyHard: '#EF4444',    // Red + star icon
  difficultyExpert: '#8B5CF6',  // Purple + star icon
};

// ACCESSIBILITY: Minimum font sizes for readability (WCAG AA compliant)
export const fontSizes = {
  xs: 12,   // Minimum for secondary info
  sm: 14,   // Small text, captions
  base: 16, // Body text (WCAG recommended minimum)
  lg: 18,   // Emphasized text
  xl: 20,   // Subheadings
  '2xl': 24, // Headings
  '3xl': 28, // Large headings
  '4xl': 32, // Hero text
};

// ACCESSIBILITY: Line heights for readability
export const lineHeights = {
  tight: 1.2,
  normal: 1.5,  // WCAG recommended
  relaxed: 1.75,
};

// ACCESSIBILITY: Touch target sizes (minimum 44x44 per Apple/Google guidelines)
export const touchTargets = {
  minimum: 44,  // Apple HIG & Material Design minimum
  comfortable: 48, // Recommended for primary actions
  large: 56,    // Large buttons
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
    minHeight: touchTargets.comfortable, // ACCESSIBILITY: Minimum touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
    minHeight: touchTargets.comfortable, // ACCESSIBILITY: Minimum touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
  },
  text: {
    fontSize: fontSizes.base, // ACCESSIBILITY: Minimum readable size
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: fontSizes.base * lineHeights.normal, // ACCESSIBILITY: Proper line height
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: "white",
  },
  // ACCESSIBILITY: High contrast mode styles
  highContrastBorder: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  // ACCESSIBILITY: Focus indicator for keyboard navigation
  focusIndicator: {
    borderWidth: 3,
    borderColor: colors.accent,
    borderRadius: 4,
  },
});

// ACCESSIBILITY: Helper function to get color with icon pairing
export const getStatusColorWithIcon = (status: 'success' | 'error' | 'warning' | 'info') => {
  const colorMap = {
    success: { color: colors.success, icon: 'check-circle' },
    error: { color: colors.error, icon: 'error' },
    warning: { color: colors.warning, icon: 'warning' },
    info: { color: colors.info, icon: 'info' },
  };
  return colorMap[status];
};

// ACCESSIBILITY: Helper function to get difficulty color with icon
export const getDifficultyColorWithIcon = (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => {
  const difficultyMap = {
    easy: { color: colors.difficultyEasy, icon: 'star', label: 'Easy' },
    medium: { color: colors.difficultyMedium, icon: 'star-half', label: 'Medium' },
    hard: { color: colors.difficultyHard, icon: 'star', label: 'Hard' },
    expert: { color: colors.difficultyExpert, icon: 'star', label: 'Expert' },
  };
  return difficultyMap[difficulty];
};
