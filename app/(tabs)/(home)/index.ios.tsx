
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { authenticatedGet, authenticatedPost } from '@/utils/api';
import { Modal } from '@/components/button';
import { PlayerStats } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';

interface ActiveGame {
  gameId: string;
  opponentName: string;
  isMyTurn: boolean;
  lastMoveAt: string;
}

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
  const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [infoModal, setInfoModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    loadPlayerStats();
    loadActiveGames();
    loadDailyChallenge();
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
      const games = await authenticatedGet<ActiveGame[]>('/api/game/multiplayer/active');
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
    router.push('/game');
  };

  const handleMultiplayer = async () => {
    console.log('[Home] User tapped Multiplayer button');
    
    if (activeGames.length > 0) {
      const gamesText = activeGames.length === 1 ? 'game' : 'games';
      setInfoModal({
        visible: true,
        message: `You have ${activeGames.length} active ${gamesText}. Creating multiplayer games is coming soon!`,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authenticatedPost<{
        gameId: string;
        boardState: any;
        inviteCode: string;
      }>('/api/game/multiplayer/create', {});
      
      console.log('[Home] Multiplayer game created:', response);
      setInfoModal({
        visible: true,
        message: `Game created! Invite code: ${response.inviteCode}\n\nMultiplayer gameplay coming soon!`,
      });
      
      await loadActiveGames();
    } catch (error: any) {
      console.error('[Home] Failed to create multiplayer game:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to create multiplayer game',
      });
    } finally {
      setLoading(false);
    }
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
  
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpProgress = currentXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.min((xpProgress / xpNeeded) * 100, 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>VERBLOC</Text>
          <Text style={styles.tagline}>Form words. Change the board. Win.</Text>
          
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
                    <Text style={styles.statBadgeText}>Level {currentLevel}</Text>
                  </View>
                  
                  <View style={styles.statBadge}>
                    <IconSymbol
                      ios_icon_name="flame.fill"
                      android_material_icon_name="local-fire-department"
                      size={16}
                      color={colors.accent}
                    />
                    <Text style={styles.statBadgeText}>{currentStreak} day streak</Text>
                  </View>
                </View>
                
                <View style={styles.xpContainer}>
                  <View style={styles.xpBar}>
                    <View style={[styles.xpProgress, { width: `${progressPercentage}%` }]} />
                  </View>
                  <Text style={styles.xpText}>{xpProgress} / {xpNeeded} XP</Text>
                </View>
              </View>
            </View>
          )}
        </View>

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
                <Text style={styles.playButtonSubtitle}>Challenge friends and rivals</Text>
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
                  <>
                    <Text style={styles.dailyChallengeTitle}>
                      {dailyChallenge.userCompleted ? 'Completed!' : 'New Challenge'}
                    </Text>
                    <Text style={styles.dailyChallengeSubtitle}>
                      Target: {dailyChallenge.targetScore} points
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.dailyChallengeTitle}>Loading...</Text>
                    <Text style={styles.dailyChallengeSubtitle}>Preparing today&apos;s challenge</Text>
                  </>
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
