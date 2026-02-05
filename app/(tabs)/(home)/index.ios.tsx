
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerStats, ActiveMultiplayerGame } from '@/types/game';
import { Modal } from '@/components/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { authenticatedGet, authenticatedPost } from '@/utils/api';
import { Stack } from 'expo-router';
import { registerForPushNotifications, setupNotificationListeners } from '@/utils/notifications';



interface DailyChallenge {
  challengeId: string;
  date: string;
  boardState: any;
  targetScore: number;
  userCompleted: boolean;
  userScore?: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeGames, setActiveGames] = useState<ActiveMultiplayerGame[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [infoModal, setInfoModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    console.log('[Home] Home screen mounted (iOS)');
    loadPlayerStats();
    loadActiveGames();
    loadDailyChallenge();
    
    // Register for push notifications
    registerForPushNotifications();
    
    // Set up notification listeners
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('[Home] Notification received:', notification);
        // Reload active games when notification received
        loadActiveGames();
      },
      (response) => {
        console.log('[Home] Notification tapped:', response);
        // Navigate to game if notification contains gameId
        const gameId = response.notification.request.content.data?.gameId;
        if (gameId) {
          router.push(`/multiplayer-game?gameId=${gameId}`);
        }
      }
    );
    
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlayerStats = async () => {
    console.log('[Home] Loading player stats...');
    try {
      const stats = await authenticatedGet<PlayerStats>('/api/player/stats');
      console.log('[Home] Player stats loaded:', stats);
      setPlayerStats(stats);
    } catch (error: any) {
      console.error('[Home] Failed to load player stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadActiveGames = async () => {
    console.log('[Home] Loading active multiplayer games...');
    try {
      const games = await authenticatedGet<ActiveMultiplayerGame[]>('/api/game/multiplayer/active');
      console.log('[Home] Active games loaded:', games);
      setActiveGames(games);
    } catch (error: any) {
      console.error('[Home] Failed to load active games:', error);
    }
  };

  const loadDailyChallenge = async () => {
    console.log('[Home] Loading daily challenge...');
    try {
      const challenge = await authenticatedGet<DailyChallenge>('/api/daily-challenge/today');
      console.log('[Home] Daily challenge loaded:', challenge);
      setDailyChallenge(challenge);
    } catch (error: any) {
      console.error('[Home] Failed to load daily challenge:', error);
    }
  };

  const handlePlaySolo = () => {
    console.log('[Home] User tapped Play Solo button');
    // Navigate to board selection screen for solo mode
    router.push('/board-select?mode=solo');
  };

  const handleMultiplayer = () => {
    console.log('[Home] User tapped Multiplayer button');
    // Navigate to matchmaking screen
    router.push('/multiplayer-matchmaking');
  };

  const handleDailyChallenge = () => {
    console.log('[Home] User tapped Daily Challenge button');
    
    if (!dailyChallenge) {
      setErrorModal({
        visible: true,
        message: 'Daily challenge not available. Please try again later.',
      });
      return;
    }

    if (dailyChallenge.userCompleted) {
      const userScoreText = String(dailyChallenge.userScore || 0);
      const targetScoreText = String(dailyChallenge.targetScore);
      setInfoModal({
        visible: true,
        message: `You've already completed today's challenge!\n\nYour score: ${userScoreText}\nTarget: ${targetScoreText}`,
      });
      return;
    }

    const targetScoreText = String(dailyChallenge.targetScore);
    setInfoModal({
      visible: true,
      message: `Daily Challenge\n\nTarget Score: ${targetScoreText}\n\nDaily challenge gameplay coming soon!`,
    });
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'Player';
  const currentLevel = playerStats?.level || 1;
  const currentXP = playerStats?.experiencePoints || 0;
  const currentStreak = playerStats?.currentStreak || 0;
  
  // Calculate XP progress (1000 XP per level)
  const xpForCurrentLevel = (currentLevel - 1) * 1000;
  const xpForNextLevel = currentLevel * 1000;
  const xpProgress = currentXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.min((xpProgress / xpNeeded) * 100, 100);

  const xpProgressText = String(xpProgress);
  const xpNeededText = String(xpNeeded);
  const levelText = String(currentLevel);
  const streakText = String(currentStreak);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with Player Info */}
        <View style={styles.header}>
          <Text style={styles.logo}>VERBLOC</Text>
          <Text style={styles.tagline}>Form words. Change the board. Win.</Text>
          
          {/* Player Level and Streak */}
          {statsLoading ? (
            <View style={styles.playerInfoLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.playerInfoContainer}>
              <View style={styles.playerInfo}>
                <View style={styles.playerNameRow}>
                  <IconSymbol
                    ios_icon_name="person.circle.fill"
                    android_material_icon_name="account-circle"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.playerName}>{userName}</Text>
                </View>
                
                <View style={styles.statsRow}>
                  <View style={styles.statBadge}>
                    <IconSymbol
                      ios_icon_name="star.fill"
                      android_material_icon_name="star"
                      size={16}
                      color={colors.highlight}
                    />
                    <Text style={styles.statBadgeText}>Level {levelText}</Text>
                  </View>
                  
                  <View style={styles.statBadge}>
                    <IconSymbol
                      ios_icon_name="flame.fill"
                      android_material_icon_name="local-fire-department"
                      size={16}
                      color={colors.accent}
                    />
                    <Text style={styles.statBadgeText}>{streakText} day streak</Text>
                  </View>
                </View>
                
                {/* XP Progress Bar */}
                <View style={styles.xpContainer}>
                  <View style={styles.xpBar}>
                    <View style={[styles.xpProgress, { width: `${progressPercentage}%` }]} />
                  </View>
                  <Text style={styles.xpText}>{xpProgressText} / {xpNeededText} XP</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Main Play Buttons */}
        <View style={styles.playButtonsContainer}>
          <Text style={styles.sectionTitle}>Choose Your Mode</Text>
          
          <TouchableOpacity
            style={[styles.playButton, styles.soloButton]}
            onPress={handlePlaySolo}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.primary, '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButtonGradient}
            >
              <View style={styles.playButtonIcon}>
                <IconSymbol
                  ios_icon_name="play.circle.fill"
                  android_material_icon_name="play-circle-filled"
                  size={48}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.playButtonContent}>
                <Text style={styles.playButtonTitle}>Play Solo</Text>
                <Text style={styles.playButtonSubtitle}>Practice and master your skills</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={28}
                color="#FFFFFF"
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, styles.multiplayerButton]}
            onPress={handleMultiplayer}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.secondary, '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButtonGradient}
            >
              <View style={styles.playButtonIcon}>
                <IconSymbol
                  ios_icon_name="person.2.circle.fill"
                  android_material_icon_name="group"
                  size={48}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.playButtonContent}>
                <Text style={styles.playButtonTitle}>Multiplayer</Text>
                <Text style={styles.playButtonSubtitle}>
                  {activeGames.length > 0 ? 'Continue your games' : 'Challenge friends and rivals'}
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={28}
                color="#FFFFFF"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Daily Challenge Card */}
        <View style={styles.dailyChallengeContainer}>
          <Text style={styles.sectionTitle}>Daily Challenge</Text>
          
          <TouchableOpacity
            style={styles.dailyChallengeCard}
            onPress={handleDailyChallenge}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.accent, '#DB2777']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dailyChallengeGradient}
            >
              <View style={styles.dailyChallengeIcon}>
                <IconSymbol
                  ios_icon_name="star.circle.fill"
                  android_material_icon_name="stars"
                  size={40}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.dailyChallengeContent}>
                {dailyChallenge ? (
                  <React.Fragment>
                    <Text style={styles.dailyChallengeTitle}>
                      {dailyChallenge.userCompleted ? 'Completed!' : 'New Challenge'}
                    </Text>
                    <Text style={styles.dailyChallengeSubtitle}>
                      Target: {dailyChallenge.targetScore} points
                    </Text>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Text style={styles.dailyChallengeTitle}>Loading...</Text>
                    <Text style={styles.dailyChallengeSubtitle}>Preparing today&apos;s challenge</Text>
                  </React.Fragment>
                )}
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={24}
                color="#FFFFFF"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Active Games Indicator */}
        {activeGames.length > 0 && (
          <View style={styles.activeGamesContainer}>
            <View style={styles.activeGamesCard}>
              <IconSymbol
                ios_icon_name="gamecontroller.fill"
                android_material_icon_name="sports-esports"
                size={24}
                color={colors.success}
              />
              <Text style={styles.activeGamesText}>
                {activeGames.length} active multiplayer {activeGames.length === 1 ? 'game' : 'games'}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Tip */}
        <View style={styles.tipContainer}>
          <View style={styles.tipCard}>
            <IconSymbol
              ios_icon_name="lightbulb.fill"
              android_material_icon_name="lightbulb"
              size={20}
              color={colors.highlight}
            />
            <Text style={styles.tipText}>
              Both Solo and Multiplayer modes share the same progression system. Play your way!
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={errorModal.visible}
        title="Error"
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        type="error"
      />

      <Modal
        visible={infoModal.visible}
        title="Info"
        message={infoModal.message}
        onClose={() => setInfoModal({ visible: false, message: '' })}
        type="info"
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
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
    flexGrow: 1,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 6,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  playerInfoLoading: {
    paddingVertical: 20,
  },
  playerInfoContainer: {
    width: '100%',
    marginTop: 8,
  },
  playerInfo: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  xpContainer: {
    gap: 6,
  },
  xpBar: {
    height: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  playButtonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  playButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  soloButton: {
    marginBottom: 4,
  },
  multiplayerButton: {
    marginBottom: 4,
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  playButtonIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonContent: {
    flex: 1,
    gap: 4,
  },
  playButtonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  dailyChallengeContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  dailyChallengeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  dailyChallengeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  dailyChallengeIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyChallengeContent: {
    flex: 1,
    gap: 2,
  },
  dailyChallengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dailyChallengeSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  activeGamesContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  activeGamesCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  activeGamesText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tipContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  tipCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.backgroundAlt,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
