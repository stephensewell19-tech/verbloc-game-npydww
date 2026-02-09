
import { Modal } from '@/components/button';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { authenticatedGet, apiPost } from '@/utils/api';
import { PlayerStats, PlayerProgression } from '@/types/game';
import { useSubscription } from '@/contexts/SuperwallContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  xpText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  premiumBadge: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.background,
  },
  signOutButton: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 8,
  },
  seedButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  seedButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  seedingText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default function ProfileScreen() {
  const { isPremium, showPaywall } = useSubscription();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [progression, setProgression] = useState<PlayerProgression | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPlayerStats();
    fetchProgression();
  }, []);

  const fetchPlayerStats = async () => {
    try {
      const data = await authenticatedGet<PlayerStats>('/api/player-stats');
      setStats(data);
      console.log('[Profile] Loaded player stats:', data);
    } catch (error) {
      console.error('[Profile] Failed to load stats:', error);
    }
  };

  const fetchProgression = async () => {
    try {
      const data = await authenticatedGet<PlayerProgression>('/api/progression');
      setProgression(data);
      console.log('[Profile] Loaded progression:', data);
    } catch (error) {
      console.error('[Profile] Failed to load progression:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedBoards = async () => {
    setSeeding(true);
    try {
      const response = await apiPost('/api/boards/seed-production', {});
      console.log('[Profile] Seeded boards:', response);
      alert('Production boards seeded successfully!');
    } catch (error) {
      console.error('[Profile] Failed to seed boards:', error);
      alert('Failed to seed boards. Please try again.');
    } finally {
      setSeeding(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('[Profile] User initiated sign out');
      await signOut();
      console.log('[Profile] Sign out successful');
      router.replace('/auth');
    } catch (error) {
      console.error('[Profile] Sign out failed:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setShowSignOutModal(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const gamesPlayedValue = stats?.gamesPlayed?.toString() || '0';
  const winRateValue = stats?.winRate ? `${Math.round(stats.winRate)}%` : '0%';
  const currentStreakValue = stats?.currentStreak?.toString() || '0';

  const levelValue = progression?.level?.toString() || '1';
  const currentXpValue = progression?.currentXp?.toString() || '0';
  const xpToNextValue = progression?.xpToNextLevel?.toString() || '100';
  const xpProgressText = `${currentXpValue} / ${xpToNextValue} XP`;
  const progressPercentage = progression ? (progression.currentXp / progression.xpToNextLevel) * 100 : 0;

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.profileIcon}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={40}
                color={colors.text}
              />
            </View>
            <Text style={styles.username}>{user?.name || 'Player'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM</Text>
              </View>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{gamesPlayedValue}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{winRateValue}</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentStreakValue}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progression</Text>
            <View style={styles.progressCard}>
              <View style={styles.levelRow}>
                <Text style={styles.levelText}>Level {levelValue}</Text>
                <Text style={styles.xpText}>{xpProgressText}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
              </View>
              <Text style={styles.progressLabel}>
                {Math.round(progressPercentage)}% to next level
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            {!isPremium && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={showPaywall}
                accessibilityLabel="Upgrade to Premium"
                accessibilityHint="Double tap to view premium subscription options"
              >
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={24}
                  color={colors.highlight}
                />
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>Upgrade to Premium</Text>
                  <Text style={styles.menuItemSubtitle}>Unlock exclusive features</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/accessibility-settings')}
              accessibilityLabel="Accessibility Settings"
              accessibilityHint="Double tap to customize accessibility options"
            >
              <IconSymbol
                ios_icon_name="accessibility"
                android_material_icon_name="accessibility"
                size={24}
                color={colors.primary}
              />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Accessibility</Text>
                <Text style={styles.menuItemSubtitle}>Customize for your needs</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/notification-preferences')}
              accessibilityLabel="Notification Preferences"
              accessibilityHint="Double tap to manage notification settings"
            >
              <IconSymbol
                ios_icon_name="bell.fill"
                android_material_icon_name="notifications"
                size={24}
                color={colors.primary}
              />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Notifications</Text>
                <Text style={styles.menuItemSubtitle}>Manage your alerts</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/privacy-policy')}
              accessibilityLabel="Privacy Policy"
              accessibilityHint="Double tap to read our privacy policy"
            >
              <IconSymbol
                ios_icon_name="lock.shield.fill"
                android_material_icon_name="security"
                size={24}
                color={colors.primary}
              />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Privacy Policy</Text>
                <Text style={styles.menuItemSubtitle}>How we protect your data</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/terms-of-service')}
              accessibilityLabel="Terms of Service"
              accessibilityHint="Double tap to read our terms of service"
            >
              <IconSymbol
                ios_icon_name="doc.text.fill"
                android_material_icon_name="description"
                size={24}
                color={colors.primary}
              />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Terms of Service</Text>
                <Text style={styles.menuItemSubtitle}>Usage guidelines</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Developer Tools</Text>
            <TouchableOpacity
              style={styles.seedButton}
              onPress={handleSeedBoards}
              disabled={seeding}
              accessibilityLabel="Seed Production Boards"
              accessibilityHint="Double tap to populate the database with game boards"
            >
              <Text style={styles.seedButtonText}>
                {seeding ? 'Seeding...' : 'Seed Production Boards'}
              </Text>
            </TouchableOpacity>
            {seeding && (
              <Text style={styles.seedingText}>
                This may take a moment...
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.signOutButton}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.error }]}
            onPress={() => setShowSignOutModal(true)}
            accessibilityLabel="Sign Out"
            accessibilityHint="Double tap to sign out of your account"
          >
            <IconSymbol
              ios_icon_name="arrow.right.square.fill"
              android_material_icon_name="logout"
              size={24}
              color={colors.text}
            />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        primaryButton={{
          text: 'Sign Out',
          onPress: handleSignOut,
          variant: 'destructive',
        }}
        secondaryButton={{
          text: 'Cancel',
          onPress: () => setShowSignOutModal(false),
        }}
      />
    </>
  );
}
