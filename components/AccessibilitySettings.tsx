
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fontSizes, lineHeights } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { isScreenReaderEnabled, isReduceMotionEnabled } from '@/utils/accessibility';

interface AccessibilityPreferences {
  highContrastMode: boolean;
  reduceAnimations: boolean;
  largerText: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  hapticFeedback: boolean;
  soundEffects: boolean;
}

const ACCESSIBILITY_PREFS_KEY = '@verbloc_accessibility_prefs';

export default function AccessibilitySettings() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    highContrastMode: false,
    reduceAnimations: false,
    largerText: false,
    colorblindMode: 'none',
    hapticFeedback: true,
    soundEffects: true,
  });

  const [screenReaderActive, setScreenReaderActive] = useState(false);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkSystemSettings();
  }, []);

  const checkSystemSettings = async () => {
    const screenReader = await isScreenReaderEnabled();
    const reduceMotion = await isReduceMotionEnabled();
    
    setScreenReaderActive(screenReader);
    setSystemReduceMotion(reduceMotion);
    
    console.log('[Accessibility] Screen reader active:', screenReader);
    console.log('[Accessibility] System reduce motion:', reduceMotion);
  };

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(ACCESSIBILITY_PREFS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
        console.log('[Accessibility] Loaded preferences:', parsed);
      }
    } catch (error) {
      console.error('[Accessibility] Failed to load preferences:', error);
    }
  };

  const savePreferences = async (updated: AccessibilityPreferences) => {
    try {
      await AsyncStorage.setItem(ACCESSIBILITY_PREFS_KEY, JSON.stringify(updated));
      setPreferences(updated);
      console.log('[Accessibility] Saved preferences:', updated);
    } catch (error) {
      console.error('[Accessibility] Failed to save preferences:', error);
    }
  };

  const togglePreference = (key: keyof AccessibilityPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    savePreferences(updated);
  };

  const setColorblindMode = (mode: AccessibilityPreferences['colorblindMode']) => {
    const updated = { ...preferences, colorblindMode: mode };
    savePreferences(updated);
  };

  const highContrastLabel = 'High Contrast Mode';
  const highContrastDescription = 'Increases contrast for better visibility';
  
  const reduceAnimationsLabel = 'Reduce Animations';
  const reduceAnimationsDescription = 'Minimizes motion and animations';
  
  const largerTextLabel = 'Larger Text';
  const largerTextDescription = 'Increases font sizes throughout the app';
  
  const colorblindModeLabel = 'Colorblind Mode';
  const colorblindModeDescription = 'Adjust colors for colorblindness';
  
  const hapticFeedbackLabel = 'Haptic Feedback';
  const hapticFeedbackDescription = 'Vibration feedback for actions';
  
  const soundEffectsLabel = 'Sound Effects';
  const soundEffectsDescription = 'Audio feedback for game events';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="accessibility"
          android_material_icon_name="accessibility"
          size={32}
          color={colors.primary}
        />
        <Text style={styles.headerTitle}>Accessibility Settings</Text>
        <Text style={styles.headerDescription}>
          Customize VERBLOC to meet your needs
        </Text>
      </View>

      {screenReaderActive && (
        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="info.circle"
            android_material_icon_name="info"
            size={20}
            color={colors.info}
          />
          <Text style={styles.infoText}>
            Screen reader detected. VERBLOC is optimized for screen reader use.
          </Text>
        </View>
      )}

      {systemReduceMotion && (
        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="info.circle"
            android_material_icon_name="info"
            size={20}
            color={colors.info}
          />
          <Text style={styles.infoText}>
            System reduce motion is enabled. Animations are automatically reduced.
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visual</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{highContrastLabel}</Text>
            <Text style={styles.settingDescription}>{highContrastDescription}</Text>
          </View>
          <Switch
            value={preferences.highContrastMode}
            onValueChange={() => togglePreference('highContrastMode')}
            trackColor={{ false: colors.backgroundAlt, true: colors.primary }}
            thumbColor={colors.text}
            accessibilityLabel={highContrastLabel}
            accessibilityHint={highContrastDescription}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{largerTextLabel}</Text>
            <Text style={styles.settingDescription}>{largerTextDescription}</Text>
          </View>
          <Switch
            value={preferences.largerText}
            onValueChange={() => togglePreference('largerText')}
            trackColor={{ false: colors.backgroundAlt, true: colors.primary }}
            thumbColor={colors.text}
            accessibilityLabel={largerTextLabel}
            accessibilityHint={largerTextDescription}
          />
        </View>

        <View style={styles.settingColumn}>
          <Text style={styles.settingLabel}>{colorblindModeLabel}</Text>
          <Text style={styles.settingDescription}>{colorblindModeDescription}</Text>
          
          <View style={styles.colorblindOptions}>
            {(['none', 'protanopia', 'deuteranopia', 'tritanopia'] as const).map((mode) => {
              const isSelected = preferences.colorblindMode === mode;
              const modeLabels = {
                none: 'None',
                protanopia: 'Protanopia (Red-Blind)',
                deuteranopia: 'Deuteranopia (Green-Blind)',
                tritanopia: 'Tritanopia (Blue-Blind)',
              };
              const modeLabel = modeLabels[mode];
              
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.colorblindOption, isSelected && styles.colorblindOptionSelected]}
                  onPress={() => setColorblindMode(mode)}
                  accessibilityLabel={modeLabel}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                >
                  <View style={styles.radioButton}>
                    {isSelected && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.colorblindOptionText}>{modeLabel}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Motion</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{reduceAnimationsLabel}</Text>
            <Text style={styles.settingDescription}>{reduceAnimationsDescription}</Text>
          </View>
          <Switch
            value={preferences.reduceAnimations || systemReduceMotion}
            onValueChange={() => togglePreference('reduceAnimations')}
            disabled={systemReduceMotion}
            trackColor={{ false: colors.backgroundAlt, true: colors.primary }}
            thumbColor={colors.text}
            accessibilityLabel={reduceAnimationsLabel}
            accessibilityHint={reduceAnimationsDescription}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feedback</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{hapticFeedbackLabel}</Text>
            <Text style={styles.settingDescription}>{hapticFeedbackDescription}</Text>
          </View>
          <Switch
            value={preferences.hapticFeedback}
            onValueChange={() => togglePreference('hapticFeedback')}
            trackColor={{ false: colors.backgroundAlt, true: colors.primary }}
            thumbColor={colors.text}
            accessibilityLabel={hapticFeedbackLabel}
            accessibilityHint={hapticFeedbackDescription}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{soundEffectsLabel}</Text>
            <Text style={styles.settingDescription}>{soundEffectsDescription}</Text>
          </View>
          <Switch
            value={preferences.soundEffects}
            onValueChange={() => togglePreference('soundEffects')}
            trackColor={{ false: colors.backgroundAlt, true: colors.primary }}
            thumbColor={colors.text}
            accessibilityLabel={soundEffectsLabel}
            accessibilityHint={soundEffectsDescription}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          VERBLOC is designed to be accessible to all players. If you encounter any accessibility issues, please contact us at accessibility@verbloc.app
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSizes.base * lineHeights.normal,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  settingColumn: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  colorblindOptions: {
    marginTop: 12,
    gap: 12,
  },
  colorblindOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorblindOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundAlt,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.text,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  colorblindOptionText: {
    fontSize: fontSizes.base,
    color: colors.text,
  },
  footer: {
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSizes.sm * lineHeights.relaxed,
  },
});
