
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { authenticatedGet, authenticatedPut } from '@/utils/api';
import { Modal } from '@/components/button';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications } from '@/utils/notifications';

interface NotificationPreferences {
  multiplayerTurnReminders: boolean;
  dailyChallengeAvailability: boolean;
  eventBoardStartEnd: boolean;
}

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    multiplayerTurnReminders: true,
    dailyChallengeAvailability: true,
    eventBoardStartEnd: true,
  });
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    loadPreferences();
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    console.log('[NotificationPreferences] Checking notification permission status');
    const { status } = await Notifications.getPermissionsAsync();
    console.log('[NotificationPreferences] Permission status:', status);
    setPermissionStatus(status);
  };

  const loadPreferences = async () => {
    console.log('[NotificationPreferences] Loading notification preferences');
    try {
      setLoading(true);
      const prefs = await authenticatedGet<NotificationPreferences>('/api/notifications/preferences');
      console.log('[NotificationPreferences] Preferences loaded:', prefs);
      setPreferences(prefs);
    } catch (error: any) {
      console.error('[NotificationPreferences] Failed to load preferences:', error);
      // If preferences don't exist yet, use defaults
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        console.log('[NotificationPreferences] Using default preferences');
      } else {
        setErrorModal({
          visible: true,
          message: error.message || 'Failed to load notification preferences',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updatedPreferences: Partial<NotificationPreferences>) => {
    console.log('[NotificationPreferences] Saving preferences:', updatedPreferences);
    try {
      setSaving(true);
      const updated = await authenticatedPut<NotificationPreferences>(
        '/api/notifications/preferences',
        updatedPreferences
      );
      console.log('[NotificationPreferences] Preferences saved:', updated);
      setPreferences(updated);
    } catch (error: any) {
      console.error('[NotificationPreferences] Failed to save preferences:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to save notification preferences',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newValue = !preferences[key];
    console.log(`[NotificationPreferences] Toggling ${key} to ${newValue}`);
    
    // Optimistically update UI
    setPreferences((prev) => ({ ...prev, [key]: newValue }));
    
    // Save to backend
    await savePreferences({ [key]: newValue });
  };

  const handleRequestPermission = async () => {
    console.log('[NotificationPreferences] Requesting notification permission');
    try {
      const token = await registerForPushNotifications();
      if (token) {
        console.log('[NotificationPreferences] Permission granted, token:', token);
        setPermissionStatus('granted');
      } else {
        console.log('[NotificationPreferences] Permission denied');
        setPermissionStatus('denied');
        setErrorModal({
          visible: true,
          message: 'Notification permission was denied. Please enable notifications in your device settings.',
        });
      }
    } catch (error: any) {
      console.error('[NotificationPreferences] Failed to request permission:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to request notification permission',
      });
    }
  };

  const handleOpenSettings = async () => {
    console.log('[NotificationPreferences] Opening device settings');
    if (Platform.OS === 'ios') {
      // On iOS, we can open the app settings
      try {
        const { Linking } = await import('react-native');
        await Linking.openSettings();
      } catch (error) {
        console.error('[NotificationPreferences] Failed to open settings:', error);
        setErrorModal({
          visible: true,
          message: 'Please enable notifications in Settings > VERBLOC > Notifications',
        });
      }
    } else {
      setErrorModal({
        visible: true,
        message: 'Please enable notifications in your device settings: Settings > Apps > VERBLOC > Notifications',
      });
    }
  };

  const multiplayerTurnText = preferences.multiplayerTurnReminders ? 'Enabled' : 'Disabled';
  const dailyChallengeText = preferences.dailyChallengeAvailability ? 'Enabled' : 'Disabled';
  const eventBoardText = preferences.eventBoardStartEnd ? 'Enabled' : 'Disabled';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Permission Status Banner */}
        {permissionStatus !== 'granted' && (
          <View style={styles.permissionBanner}>
            <View style={styles.permissionBannerContent}>
              <IconSymbol
                ios_icon_name="bell.slash.fill"
                android_material_icon_name="notifications-off"
                size={32}
                color={colors.error}
              />
              <View style={styles.permissionBannerText}>
                <Text style={styles.permissionBannerTitle}>Notifications Disabled</Text>
                <Text style={styles.permissionBannerSubtitle}>
                  {permissionStatus === 'denied'
                    ? 'Enable notifications in your device settings to receive updates.'
                    : 'Allow notifications to stay updated on your games and challenges.'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={permissionStatus === 'denied' ? handleOpenSettings : handleRequestPermission}
            >
              <Text style={styles.permissionButtonText}>
                {permissionStatus === 'denied' ? 'Open Settings' : 'Enable Notifications'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <IconSymbol
            ios_icon_name="bell.fill"
            android_material_icon_name="notifications"
            size={48}
            color={colors.primary}
          />
          <Text style={styles.headerTitle}>Notification Preferences</Text>
          <Text style={styles.headerSubtitle}>
            Choose which notifications you'd like to receive. We'll only notify you when it matters.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Notification Types */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Game Notifications</Text>

              {/* Multiplayer Turn Reminders */}
              <View style={styles.preferenceCard}>
                <View style={styles.preferenceHeader}>
                  <View style={styles.preferenceIcon}>
                    <IconSymbol
                      ios_icon_name="person.2.fill"
                      android_material_icon_name="group"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.preferenceContent}>
                    <Text style={styles.preferenceTitle}>Multiplayer Turn Reminders</Text>
                    <Text style={styles.preferenceDescription}>
                      Get notified when it's your turn in a multiplayer game.
                    </Text>
                    <Text style={styles.preferenceExample}>Example: "Your move."</Text>
                  </View>
                  <Switch
                    value={preferences.multiplayerTurnReminders}
                    onValueChange={() => handleToggle('multiplayerTurnReminders')}
                    trackColor={{ false: colors.backgroundAlt, true: colors.primary }}
                    thumbColor="#FFFFFF"
                    disabled={saving}
                  />
                </View>
                <View style={styles.preferenceStatus}>
                  <Text style={styles.preferenceStatusText}>Status: {multiplayerTurnText}</Text>
                </View>
              </View>

              {/* Daily Challenge Availability */}
              <View style={styles.preferenceCard}>
                <View style={styles.preferenceHeader}>
                  <View style={styles.preferenceIcon}>
                    <IconSymbol
                      ios_icon_name="calendar.badge.clock"
                      android_material_icon_name="event"
                      size={24}
                      color={colors.secondary}
                    />
                  </View>
                  <View style={styles.preferenceContent}>
                    <Text style={styles.preferenceTitle}>Daily Challenge</Text>
                    <Text style={styles.preferenceDescription}>
                      Get notified when a new daily challenge is available.
                    </Text>
                    <Text style={styles.preferenceExample}>Example: "Daily Challenge is live."</Text>
                  </View>
                  <Switch
                    value={preferences.dailyChallengeAvailability}
                    onValueChange={() => handleToggle('dailyChallengeAvailability')}
                    trackColor={{ false: colors.backgroundAlt, true: colors.secondary }}
                    thumbColor="#FFFFFF"
                    disabled={saving}
                  />
                </View>
                <View style={styles.preferenceStatus}>
                  <Text style={styles.preferenceStatusText}>Status: {dailyChallengeText}</Text>
                </View>
              </View>

              {/* Event Board Start/End */}
              <View style={styles.preferenceCard}>
                <View style={styles.preferenceHeader}>
                  <View style={styles.preferenceIcon}>
                    <IconSymbol
                      ios_icon_name="star.fill"
                      android_material_icon_name="star"
                      size={24}
                      color={colors.highlight}
                    />
                  </View>
                  <View style={styles.preferenceContent}>
                    <Text style={styles.preferenceTitle}>Special Events</Text>
                    <Text style={styles.preferenceDescription}>
                      Get notified when special events start or are ending soon.
                    </Text>
                    <Text style={styles.preferenceExample}>Example: "New event: Word Master Challenge"</Text>
                  </View>
                  <Switch
                    value={preferences.eventBoardStartEnd}
                    onValueChange={() => handleToggle('eventBoardStartEnd')}
                    trackColor={{ false: colors.backgroundAlt, true: colors.highlight }}
                    thumbColor="#FFFFFF"
                    disabled={saving}
                  />
                </View>
                <View style={styles.preferenceStatus}>
                  <Text style={styles.preferenceStatusText}>Status: {eventBoardText}</Text>
                </View>
              </View>
            </View>

            {/* Notification Philosophy */}
            <View style={styles.philosophySection}>
              <Text style={styles.philosophyTitle}>Our Notification Philosophy</Text>
              <View style={styles.philosophyCard}>
                <View style={styles.philosophyItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.philosophyText}>Never spam - only notify when it matters</Text>
                </View>
                <View style={styles.philosophyItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.philosophyText}>Short, friendly, non-demanding messages</Text>
                </View>
                <View style={styles.philosophyItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.philosophyText}>Respect your preferences and time</Text>
                </View>
                <View style={styles.philosophyItem}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.philosophyText}>Increase engagement without annoyance</Text>
                </View>
              </View>
            </View>

            {/* Notification Timing Info */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>When You'll Receive Notifications</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                  <IconSymbol
                    ios_icon_name="clock.fill"
                    android_material_icon_name="schedule"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.infoText}>
                    <Text style={styles.infoBold}>Turn Reminders:</Text> Only if you haven't moved in 12+ hours
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <IconSymbol
                    ios_icon_name="clock.fill"
                    android_material_icon_name="schedule"
                    size={16}
                    color={colors.secondary}
                  />
                  <Text style={styles.infoText}>
                    <Text style={styles.infoBold}>Daily Challenge:</Text> Once per day when available
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <IconSymbol
                    ios_icon_name="clock.fill"
                    android_material_icon_name="schedule"
                    size={16}
                    color={colors.highlight}
                  />
                  <Text style={styles.infoText}>
                    <Text style={styles.infoBold}>Events:</Text> When they start or 2 hours before ending
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={errorModal.visible}
        title="Error"
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        type="error"
      />

      {saving && (
        <View style={styles.savingOverlay}>
          <View style={styles.savingCard}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  permissionBanner: {
    backgroundColor: colors.error,
    padding: 20,
    gap: 16,
  },
  permissionBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  permissionBannerText: {
    flex: 1,
  },
  permissionBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  permissionBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  permissionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  preferenceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preferenceContent: {
    flex: 1,
    gap: 4,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  preferenceDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  preferenceExample: {
    fontSize: 12,
    color: colors.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  preferenceStatus: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundAlt,
  },
  preferenceStatusText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  philosophySection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 12,
  },
  philosophyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  philosophyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  philosophyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  philosophyText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoBold: {
    fontWeight: '700',
    color: colors.text,
  },
  savingOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  savingCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  savingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
