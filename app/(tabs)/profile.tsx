
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { authenticatedGet } from '@/utils/api';
import { PlayerStats } from '@/types/game';
import { Modal } from '@/components/button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    fetchPlayerStats();
  }, []);

  const fetchPlayerStats = async () => {
    console.log('[Profile] Fetching player stats...');
    try {
      setStatsLoading(true);
      const data = await authenticatedGet<PlayerStats>('/api/player/stats');
      console.log('[Profile] Player stats loaded:', data);
      setStats(data);
    } catch (error: any) {
      console.error('[Profile] Failed to fetch player stats:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to load player stats',
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSeedBoards = async () => {
    console.log('[Profile] User tapped Seed Boards button');
    try {
      setLoading(true);
      const { seedBoards } = await import('@/utils/boardApi');
      const result = await seedBoards();
      console.log('[Profile] Boards seeded:', result);
      setErrorModal({
        visible: true,
        message: `Success! ${result.message}`,
      });
    } catch (error: any) {
      console.error('[Profile] Failed to seed boards:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to seed boards',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log('User tapped Sign Out button');
    try {
      setLoading(true);
      await signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const userName = user?.name || user?.email || 'Player';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol
              ios_icon_name="person.circle.fill"
              android_material_icon_name="account-circle"
              size={80}
              color={colors.primary}
            />
          </View>
          <Text style={styles.userName}>{userName}</Text>
          {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          
          {statsLoading ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <IconSymbol
                  ios_icon_name="gamecontroller.fill"
                  android_material_icon_name="videogame-asset"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.statValue}>{stats?.totalGamesPlayed || 0}</Text>
                <Text style={styles.statLabel}>Games Played</Text>
              </View>

              <View style={styles.statCard}>
                <IconSymbol
                  ios_icon_name="trophy.fill"
                  android_material_icon_name="emoji-events"
                  size={32}
                  color={colors.success}
                />
                <Text style={styles.statValue}>{stats?.totalWins || 0}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>

              <View style={styles.statCard}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={32}
                  color={colors.highlight}
                />
                <Text style={styles.statValue}>{stats?.highestScore || 0}</Text>
                <Text style={styles.statLabel}>High Score</Text>
              </View>

              <View style={styles.statCard}>
                <IconSymbol
                  ios_icon_name="flame.fill"
                  android_material_icon_name="local-fire-department"
                  size={32}
                  color={colors.accent}
                />
                <Text style={styles.statValue}>{stats?.currentStreak || 0}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>

              <View style={styles.statCard}>
                <IconSymbol
                  ios_icon_name="text.bubble.fill"
                  android_material_icon_name="chat-bubble"
                  size={32}
                  color={colors.secondary}
                />
                <Text style={styles.statValue}>{stats?.totalWordsFormed || 0}</Text>
                <Text style={styles.statLabel}>Words Formed</Text>
              </View>

              <View style={styles.statCard}>
                <IconSymbol
                  ios_icon_name="chart.bar.fill"
                  android_material_icon_name="bar-chart"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.statValue}>Level {stats?.level || 1}</Text>
                <Text style={styles.statLabel}>{stats?.experiencePoints || 0} XP</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log('View leaderboard')}
          >
            <IconSymbol
              ios_icon_name="chart.bar.fill"
              android_material_icon_name="leaderboard"
              size={24}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>Leaderboard</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log('View achievements')}
          >
            <IconSymbol
              ios_icon_name="rosette"
              android_material_icon_name="military-tech"
              size={24}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>Achievements</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log('Settings')}
          >
            <IconSymbol
              ios_icon_name="gearshape.fill"
              android_material_icon_name="settings"
              size={24}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>Settings</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.seedButton]}
            onPress={handleSeedBoards}
            disabled={loading}
          >
            <IconSymbol
              ios_icon_name="square.grid.3x3.fill"
              android_material_icon_name="grid-on"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.actionButtonText, styles.seedButtonText]}>Seed Boards (Dev)</Text>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <IconSymbol
                ios_icon_name="arrow.right.square"
                android_material_icon_name="logout"
                size={20}
                color={colors.text}
              />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.versionText}>VERBLOC v1.0.0</Text>
      </ScrollView>

      <Modal
        visible={errorModal.visible}
        title="Error"
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        type="error"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingTop: Platform.OS === 'android' ? 48 : 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  seedButton: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  seedButtonText: {
    color: colors.primary,
  },
  signOutButton: {
    backgroundColor: colors.error,
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  versionText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 24,
  },
});
