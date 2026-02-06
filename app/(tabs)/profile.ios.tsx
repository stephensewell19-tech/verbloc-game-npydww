
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
import { authenticatedGet, apiPost } from '@/utils/api';
import { PlayerStats, PlayerProgression } from '@/types/game';
import { Modal } from '@/components/button';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [progression, setProgression] = useState<PlayerProgression | null>(null);
  const [progressionLoading, setProgressionLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    fetchPlayerStats();
    fetchProgression();
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
      
      // Try to initialize stats if they don't exist
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        console.log('[Profile] Attempting to initialize player stats...');
        try {
          await apiPost('/api/player/stats/initialize', {});
          // Retry fetching stats
          const retryData = await authenticatedGet<PlayerStats>('/api/player/stats');
          console.log('[Profile] Player stats initialized and loaded:', retryData);
          setStats(retryData);
        } catch (initError: any) {
          console.error('[Profile] Failed to initialize player stats:', initError);
          setErrorModal({
            visible: true,
            message: initError.message || 'Failed to initialize player stats',
          });
        }
      } else {
        setErrorModal({
          visible: true,
          message: error.message || 'Failed to load player stats',
        });
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchProgression = async () => {
    console.log('[Profile] Fetching player progression...');
    try {
      setProgressionLoading(true);
      const data = await authenticatedGet<PlayerProgression>('/api/player/progress');
      console.log('[Profile] Player progression loaded:', data);
      setProgression(data);
    } catch (error: any) {
      console.error('[Profile] Failed to fetch player progression:', error);
    } finally {
      setProgressionLoading(false);
    }
  };

  const handleSeedBoards = async () => {
    console.log('[Profile] User tapped Seed Production Boards button');
    try {
      setLoading(true);
      const result = await apiPost<{ message: string; created: number; skipped: number; total: number }>(
        '/api/boards/seed-production',
        {}
      );
      console.log('[Profile] Production boards seeded:', result);
      const successMessage = `${result.message}\n\nCreated: ${result.created}\nSkipped: ${result.skipped}\nTotal: ${result.total}`;
      setErrorModal({
        visible: true,
        message: successMessage,
      });
    } catch (error: any) {
      console.error('[Profile] Failed to seed production boards:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to seed production boards',
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

        {/* Progression Section */}
        <View style={styles.progressionContainer}>
          <Text style={styles.sectionTitle}>Progression</Text>
          
          {progressionLoading ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.progressionContent}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.levelCard}
              >
                <View style={styles.levelCardContent}>
                  <View style={styles.levelBadge}>
                    <IconSymbol
                      ios_icon_name="star.fill"
                      android_material_icon_name="star"
                      size={32}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelTitle}>Level {progression?.level || 1}</Text>
                    <Text style={styles.levelSubtitle}>{progression?.xp || 0} XP</Text>
                    <View style={styles.xpProgressBar}>
                      <View 
                        style={[
                          styles.xpProgressFill, 
                          { width: `${Math.min(((progression?.xp || 0) / ((progression?.xp || 0) + (progression?.xpToNextLevel || 1))) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.xpProgressText}>
                      {progression?.xpToNextLevel || 0} XP to next level
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Unlocks Summary */}
              <View style={styles.unlocksGrid}>
                <View style={styles.unlockCard}>
                  <IconSymbol
                    ios_icon_name="paintbrush.fill"
                    android_material_icon_name="palette"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.unlockValue}>{progression?.unlockedCosmetics.length || 0}</Text>
                  <Text style={styles.unlockLabel}>Cosmetics</Text>
                </View>

                <View style={styles.unlockCard}>
                  <IconSymbol
                    ios_icon_name="text.badge.star"
                    android_material_icon_name="title"
                    size={24}
                    color={colors.secondary}
                  />
                  <Text style={styles.unlockValue}>{progression?.unlockedTitles.length || 0}</Text>
                  <Text style={styles.unlockLabel}>Titles</Text>
                </View>

                <View style={styles.unlockCard}>
                  <IconSymbol
                    ios_icon_name="shield.fill"
                    android_material_icon_name="verified"
                    size={24}
                    color={colors.highlight}
                  />
                  <Text style={styles.unlockValue}>{progression?.unlockedBadges.length || 0}</Text>
                  <Text style={styles.unlockLabel}>Badges</Text>
                </View>

                <View style={styles.unlockCard}>
                  <IconSymbol
                    ios_icon_name="rosette"
                    android_material_icon_name="military-tech"
                    size={24}
                    color={colors.accent}
                  />
                  <Text style={styles.unlockValue}>{progression?.achievements.length || 0}</Text>
                  <Text style={styles.unlockLabel}>Achievements</Text>
                </View>
              </View>
            </View>
          )}
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
            <Text style={[styles.actionButtonText, styles.seedButtonText]}>
              Seed Production Boards (70+)
            </Text>
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
        title={errorModal.message.includes('Success') ? 'Success' : 'Error'}
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        type={errorModal.message.includes('Success') ? 'success' : 'error'}
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
  progressionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressionContent: {
    gap: 16,
  },
  levelCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  levelCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  xpProgressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  unlocksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  unlockCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
  },
  unlockValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  unlockLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
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
