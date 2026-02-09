
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerStats, ActiveMultiplayerGame, DailyChallenge } from '@/types/game';
import { Modal } from '@/components/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { authenticatedGet } from '@/utils/api';
import { registerForPushNotifications, setupNotificationListeners } from '@/utils/notifications';
import DailyChallengeCard from '@/components/DailyChallengeCard';
import SpecialEventsCard from '@/components/SpecialEventsCard';
import { CurrentSpecialEvents } from '@/types/game';
import { getLastPlayedMode } from '@/utils/onboarding';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeGames, setActiveGames] = useState<ActiveMultiplayerGame[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [dailyChallengeLoading, setDailyChallengeLoading] = useState(true);
  const [specialEvents, setSpecialEvents] = useState<CurrentSpecialEvents | null>(null);
  const [specialEventsLoading, setSpecialEventsLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [lastMode, setLastMode] = useState<'solo' | 'multiplayer' | null>(null);
  
  // Feature flags
  const isRankedModeEnabled = useFeatureFlag('rankedMode');
  const isTournamentModeEnabled = useFeatureFlag('tournamentMode');

  useEffect(() => {
    console.log('[Home] Home screen mounted (iOS)');
    loadPlayerStats();
    loadActiveGames();
    loadDailyChallenge();
    loadSpecialEvents();
    loadLastMode();
    
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

  const loadLastMode = async () => {
    const mode = await getLastPlayedMode();
    console.log('[Home] Last played mode:', mode);
    setLastMode(mode);
  };

  const loadPlayerStats = async () => {
    console.log('[Home] Loading player stats...');
    try {
      const stats = await authenticatedGet<PlayerStats>('/api/player/stats');
      console.log('[Home] Player stats loaded:', stats);
      setPlayerStats(stats);
    } catch (error: any) {
      console.error('[Home] Failed to load player stats:', error);
      
      // Try to initialize stats if they don't exist
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        console.log('[Home] Attempting to initialize player stats...');
        try {
          const { apiPost } = await import('@/utils/api');
          await apiPost('/api/player/stats/initialize', {});
          // Retry fetching stats
          const retryStats = await authenticatedGet<PlayerStats>('/api/player/stats');
          console.log('[Home] Player stats initialized and loaded:', retryStats);
          setPlayerStats(retryStats);
        } catch (initError: any) {
          console.error('[Home] Failed to initialize player stats:', initError);
        }
      }
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
    setDailyChallengeLoading(true);
    try {
      // TODO: Backend Integration - GET /api/daily-challenge/current
      const challenge = await authenticatedGet<DailyChallenge>('/api/daily-challenge/current');
      console.log('[Home] Daily challenge loaded:', challenge);
      setDailyChallenge(challenge);
    } catch (error: any) {
      console.error('[Home] Failed to load daily challenge:', error);
    } finally {
      setDailyChallengeLoading(false);
    }
  };

  const loadSpecialEvents = async () => {
    console.log('[Home] Loading special events...');
    setSpecialEventsLoading(true);
    try {
      // TODO: Backend Integration - GET /api/special-events/current
      const events = await authenticatedGet<CurrentSpecialEvents>('/api/special-events/current');
      console.log('[Home] Special events loaded:', events);
      setSpecialEvents(events);
    } catch (error: any) {
      console.error('[Home] Failed to load special events:', error);
    } finally {
      setSpecialEventsLoading(false);
    }
  };

  const handlePlaySolo = () => {
    console.log('[Home] User tapped Play Solo button - navigating to board selection');
    router.push('/board-select?mode=Solo');
  };

  const handleMultiplayer = () => {
    console.log('[Home] User tapped Multiplayer button');
    router.push('/multiplayer-matchmaking');
  };

  const handleDailyChallenge = () => {
    console.log('[Home] User tapped Daily Challenge card');
    router.push('/daily-challenge');
  };

  const handleSpecialEvents = () => {
    console.log('[Home] User tapped Special Events card');
    router.push('/special-events');
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'Player';
  const currentLevel = playerStats?.level || 1;
  const currentXP = playerStats?.experiencePoints || 0;
  const currentStreak = playerStats?.currentStreak || 0;
  
  // Calculate XP progress using the same formula as backend: level = floor(sqrt(xp / 100))
  const xpForCurrentLevel = currentLevel * currentLevel * 100;
  const xpForNextLevel = (currentLevel + 1) * (currentLevel + 1) * 100;
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

        {/* Daily Challenge Card */}
        <View style={styles.dailyChallengeContainer}>
          <Text style={styles.sectionTitle}>Daily Challenge</Text>
          <DailyChallengeCard
            challenge={dailyChallenge}
            loading={dailyChallengeLoading}
            onPress={handleDailyChallenge}
          />
        </View>

        {/* Special Events Card */}
        <View style={styles.specialEventsContainer}>
          <Text style={styles.sectionTitle}>Special Events</Text>
          <SpecialEventsCard
            events={specialEvents}
            loading={specialEventsLoading}
            onPress={handleSpecialEvents}
          />
        </View>

        {/* Main Play Buttons - Unified Presentation */}
        <View style={styles.playButtonsContainer}>
          <Text style={styles.sectionTitle}>Play VERBLOC</Text>
          <Text style={styles.sectionSubtitle}>Two ways to enjoy the same great game</Text>
          
          {/* Show last played mode first if available */}
          {lastMode === 'solo' ? (
            <>
              <TouchableOpacity
                style={[styles.playButton, styles.primaryButton]}
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
                    <View style={styles.playButtonTitleRow}>
                      <Text style={styles.playButtonTitle}>Play Solo</Text>
                      <View style={styles.lastPlayedBadge}>
                        <Text style={styles.lastPlayedText}>Last Played</Text>
                      </View>
                    </View>
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
                style={[styles.playButton, styles.secondaryButton]}
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
            </>
          ) : lastMode === 'multiplayer' ? (
            <>
              <TouchableOpacity
                style={[styles.playButton, styles.primaryButton]}
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
                    <View style={styles.playButtonTitleRow}>
                      <Text style={styles.playButtonTitle}>Multiplayer</Text>
                      <View style={styles.lastPlayedBadge}>
                        <Text style={styles.lastPlayedText}>Last Played</Text>
                      </View>
                    </View>
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

              <TouchableOpacity
                style={[styles.playButton, styles.secondaryButton]}
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
            </>
          ) : (
            <>
              {/* Default: Show both equally */}
              <TouchableOpacity
                style={[styles.playButton, styles.primaryButton]}
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
                style={[styles.playButton, styles.primaryButton]}
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
            </>
          )}
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

        {/* Future Features - Enabled via Feature Flags */}
        {(isRankedModeEnabled || isTournamentModeEnabled) && (
          <View style={styles.futureModesContainer}>
            <Text style={styles.sectionTitle}>Competitive Play</Text>
            <Text style={styles.sectionSubtitle}>Test your skills in ranked competition</Text>
            
            {isRankedModeEnabled && (
              <TouchableOpacity
                style={styles.featureButton}
                onPress={() => {
                  console.log('[Home] User tapped Ranked Mode button');
                  alert('Ranked Mode coming soon!');
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featureButtonGradient}
                >
                  <View style={styles.featureButtonIcon}>
                    <IconSymbol
                      ios_icon_name="trophy.fill"
                      android_material_icon_name="emoji-events"
                      size={32}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.featureButtonContent}>
                    <View style={styles.featureButtonTitleRow}>
                      <Text style={styles.featureButtonTitle}>Ranked Mode</Text>
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                      </View>
                    </View>
                    <Text style={styles.featureButtonSubtitle}>Climb the leaderboard and earn rewards</Text>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={24}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isTournamentModeEnabled && (
              <TouchableOpacity
                style={styles.featureButton}
                onPress={() => {
                  console.log('[Home] User tapped Tournament Mode button');
                  alert('Tournament Mode coming soon!');
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featureButtonGradient}
                >
                  <View style={styles.featureButtonIcon}>
                    <IconSymbol
                      ios_icon_name="star.circle.fill"
                      android_material_icon_name="stars"
                      size={32}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.featureButtonContent}>
                    <View style={styles.featureButtonTitleRow}>
                      <Text style={styles.featureButtonTitle}>Tournaments</Text>
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                      </View>
                    </View>
                    <Text style={styles.featureButtonSubtitle}>Compete in scheduled tournaments</Text>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={24}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Difficulty Progression Guide */}
        <View style={styles.difficultyProgressContainer}>
          <Text style={styles.sectionTitle}>Difficulty Tiers</Text>
          <View style={styles.difficultyProgressCard}>
            <View style={styles.difficultyTier}>
              <View style={[styles.difficultyTierBadge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.difficultyTierIcon}>🌱</Text>
              </View>
              <View style={styles.difficultyTierContent}>
                <Text style={styles.difficultyTierTitle}>Easy</Text>
                <Text style={styles.difficultyTierDescription}>Perfect for learning and casual play</Text>
              </View>
            </View>
            
            <View style={styles.difficultyTier}>
              <View style={[styles.difficultyTierBadge, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.difficultyTierIcon}>⚡</Text>
              </View>
              <View style={styles.difficultyTierContent}>
                <Text style={styles.difficultyTierTitle}>Medium</Text>
                <Text style={styles.difficultyTierDescription}>Requires planning and timing</Text>
              </View>
            </View>
            
            <View style={styles.difficultyTier}>
              <View style={[styles.difficultyTierBadge, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.difficultyTierIcon}>🔥</Text>
              </View>
              <View style={styles.difficultyTierContent}>
                <Text style={styles.difficultyTierTitle}>Hard</Text>
                <Text style={styles.difficultyTierDescription}>For mastery and replay value</Text>
              </View>
            </View>
            
            <View style={styles.difficultyTier}>
              <View style={[styles.difficultyTierBadge, { backgroundColor: '#8B5CF6' }]}>
                <Text style={styles.difficultyTierIcon}>⭐</Text>
              </View>
              <View style={styles.difficultyTierContent}>
                <Text style={styles.difficultyTierTitle}>Special</Text>
                <Text style={styles.difficultyTierDescription}>Experimental and event-specific</Text>
              </View>
            </View>
            
            <View style={styles.difficultyNote}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.difficultyNoteText}>
                All difficulties are always available - play at your own pace!
              </Text>
            </View>
          </View>
        </View>

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
              Complete daily challenges to earn bonus XP and maintain your streak!
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
  dailyChallengeContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  specialEventsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
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
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
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
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
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
  playButtonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButtonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lastPlayedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lastPlayedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playButtonSubtitle: {
    fontSize: 14,
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
  futureModesContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  featureButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  featureButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  featureButtonIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureButtonContent: {
    flex: 1,
    gap: 4,
  },
  featureButtonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  newBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  featureButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
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
  difficultyProgressContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  difficultyProgressCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  difficultyTier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyTierBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyTierIcon: {
    fontSize: 20,
  },
  difficultyTierContent: {
    flex: 1,
    gap: 2,
  },
  difficultyTierTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  difficultyTierDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  difficultyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.backgroundAlt,
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  difficultyNoteText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 16,
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
