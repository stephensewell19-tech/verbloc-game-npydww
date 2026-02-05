
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { Modal } from '@/components/button';
import { authenticatedGet, authenticatedPost } from '@/utils/api';
import {
  DailyChallenge,
  DailyChallengeLeaderboard,
  DailyChallengeStreak,
  DailyChallengeGameMode,
} from '@/types/game';

export default function DailyChallengeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<DailyChallengeLeaderboard | null>(null);
  const [streak, setStreak] = useState<DailyChallengeStreak | null>(null);
  const [selectedMode, setSelectedMode] = useState<DailyChallengeGameMode>('dailyChallengeSolo');
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [startingGame, setStartingGame] = useState(false);

  useEffect(() => {
    console.log('[DailyChallenge] Screen mounted');
    const initializeChallenge = async () => {
      await loadDailyChallenge();
      await loadStreak();
    };
    initializeChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDailyChallenge = async () => {
    console.log('[DailyChallenge] Loading daily challenge...');
    setLoading(true);
    try {
      // TODO: Backend Integration - GET /api/daily-challenge/current
      const data = await authenticatedGet<DailyChallenge>('/api/daily-challenge/current');
      console.log('[DailyChallenge] Challenge loaded:', data);
      setChallenge(data);
      setSelectedMode(data.gameMode);

      if (data.leaderboardId) {
        loadLeaderboard(data.id);
      }
    } catch (error: any) {
      console.error('[DailyChallenge] Failed to load challenge:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to load daily challenge',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (challengeId: string) => {
    console.log('[DailyChallenge] Loading leaderboard...');
    try {
      // TODO: Backend Integration - GET /api/daily-challenge/:challengeId/leaderboard
      const data = await authenticatedGet<DailyChallengeLeaderboard>(
        `/api/daily-challenge/${challengeId}/leaderboard?sortBy=score&limit=10`
      );
      console.log('[DailyChallenge] Leaderboard loaded:', data);
      setLeaderboard(data);
    } catch (error: any) {
      console.error('[DailyChallenge] Failed to load leaderboard:', error);
    }
  };

  const loadStreak = async () => {
    console.log('[DailyChallenge] Loading streak...');
    try {
      // TODO: Backend Integration - GET /api/daily-challenge/streak
      const data = await authenticatedGet<DailyChallengeStreak>('/api/daily-challenge/streak');
      console.log('[DailyChallenge] Streak loaded:', data);
      setStreak(data);
    } catch (error: any) {
      console.error('[DailyChallenge] Failed to load streak:', error);
    }
  };

  const handleStartChallenge = async () => {
    if (!challenge) {
      return;
    }

    console.log('[DailyChallenge] User tapped Start Challenge button');

    if (challenge.isCompleted) {
      setErrorModal({
        visible: true,
        message: 'You have already completed today\'s challenge!',
      });
      return;
    }

    if (challenge.attemptsUsed >= challenge.attemptsAllowed) {
      setErrorModal({
        visible: true,
        message: 'You have used all your attempts for today.',
      });
      return;
    }

    setStartingGame(true);
    try {
      // TODO: Backend Integration - POST /api/daily-challenge/:challengeId/start
      const response = await authenticatedPost<{ gameId: string; attemptsRemaining: number }>(
        `/api/daily-challenge/${challenge.id}/start`,
        { gameMode: selectedMode }
      );
      console.log('[DailyChallenge] Game started:', response);

      if (selectedMode === 'dailyChallengeSolo') {
        // Pass all necessary parameters for daily challenge tracking
        const startTime = Date.now();
        router.push(
          `/game?gameId=${response.gameId}&dailyChallenge=true&challengeId=${challenge.id}&` +
          `boardId=${challenge.boardId}&mode=solo&puzzleMode=${challenge.puzzleMode}&` +
          `targetScore=${challenge.winCondition.target}&turnLimit=${challenge.turnLimit || 20}&` +
          `startTime=${startTime}`
        );
      } else {
        router.push(
          `/multiplayer-game?gameId=${response.gameId}&dailyChallenge=true&challengeId=${challenge.id}`
        );
      }
    } catch (error: any) {
      console.error('[DailyChallenge] Failed to start challenge:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to start challenge',
      });
    } finally {
      setStartingGame(false);
    }
  };

  const getPuzzleModeLabel = (mode: string): string => {
    const labels: Record<string, string> = {
      score_target: 'Score Target',
      vault_break: 'Vault Break',
      hidden_phrase: 'Hidden Phrase',
      territory_control: 'Territory Control',
    };
    return labels[mode] || mode;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            title: 'Daily Challenge',
            headerShown: true,
            headerBackTitle: 'Back',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading challenge...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            title: 'Daily Challenge',
            headerShown: true,
            headerBackTitle: 'Back',
          }}
        />
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="error"
            size={64}
            color={colors.error}
          />
          <Text style={styles.errorTitle}>Challenge Unavailable</Text>
          <Text style={styles.errorMessage}>
            Today&apos;s daily challenge could not be loaded. Please try again later.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDailyChallenge}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const attemptsLeft = challenge.attemptsAllowed - challenge.attemptsUsed;
  const attemptsLeftText = String(attemptsLeft);
  const attemptsAllowedText = String(challenge.attemptsAllowed);
  const puzzleModeLabel = getPuzzleModeLabel(challenge.puzzleMode);
  const targetText = String(challenge.winCondition.target);
  const xpRewardText = String(challenge.rewards.xp);
  const currentStreakText = String(streak?.currentStreak || 0);
  const longestStreakText = String(streak?.longestStreak || 0);

  const hours = Math.floor(challenge.timeRemaining / 3600);
  const minutes = Math.floor((challenge.timeRemaining % 3600) / 60);
  const hoursText = String(hours);
  const minutesText = String(minutes);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Daily Challenge',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Challenge Header */}
        <LinearGradient
          colors={[colors.accent, '#DB2777']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <IconSymbol
              ios_icon_name="star.circle.fill"
              android_material_icon_name="stars"
              size={64}
              color="#FFFFFF"
            />
            <Text style={styles.headerTitle}>Daily Challenge</Text>
            <Text style={styles.headerDate}>{challenge.date}</Text>
          </View>
        </LinearGradient>

        {/* Streak Info */}
        {streak && (
          <View style={styles.streakCard}>
            <View style={styles.streakItem}>
              <IconSymbol
                ios_icon_name="flame.fill"
                android_material_icon_name="local-fire-department"
                size={32}
                color={colors.accent}
              />
              <Text style={styles.streakValue}>{currentStreakText}</Text>
              <Text style={styles.streakLabel}>Current Streak</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <IconSymbol
                ios_icon_name="trophy.fill"
                android_material_icon_name="emoji-events"
                size={32}
                color={colors.highlight}
              />
              <Text style={styles.streakValue}>{longestStreakText}</Text>
              <Text style={styles.streakLabel}>Best Streak</Text>
            </View>
          </View>
        )}

        {/* Challenge Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <IconSymbol
                ios_icon_name="gamecontroller.fill"
                android_material_icon_name="sports-esports"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.detailLabel}>Puzzle Mode</Text>
              <Text style={styles.detailValue}>{puzzleModeLabel}</Text>
            </View>
            <View style={styles.detailRow}>
              <IconSymbol
                ios_icon_name="target"
                android_material_icon_name="flag"
                size={20}
                color={colors.secondary}
              />
              <Text style={styles.detailLabel}>Target</Text>
              <Text style={styles.detailValue}>{targetText} points</Text>
            </View>
            <View style={styles.detailRow}>
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={20}
                color={colors.accent}
              />
              <Text style={styles.detailLabel}>Attempts</Text>
              <Text style={styles.detailValue}>
                {attemptsLeftText} / {attemptsAllowedText}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="schedule"
                size={20}
                color={colors.highlight}
              />
              <Text style={styles.detailLabel}>Resets In</Text>
              <Text style={styles.detailValue}>
                {hoursText}h {minutesText}m
              </Text>
            </View>
          </View>
        </View>

        {/* Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rewards</Text>
          <View style={styles.rewardsCard}>
            <View style={styles.rewardItem}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={24}
                color={colors.highlight}
              />
              <Text style={styles.rewardText}>+{xpRewardText} XP</Text>
            </View>
            {challenge.rewards.cosmeticUnlockIds.length > 0 && (
              <View style={styles.rewardItem}>
                <IconSymbol
                  ios_icon_name="paintbrush.fill"
                  android_material_icon_name="palette"
                  size={24}
                  color={colors.secondary}
                />
                <Text style={styles.rewardText}>Cosmetic Unlocks</Text>
              </View>
            )}
            <View style={styles.rewardItem}>
              <IconSymbol
                ios_icon_name="flame.fill"
                android_material_icon_name="local-fire-department"
                size={24}
                color={colors.accent}
              />
              <Text style={styles.rewardText}>Streak Progress</Text>
            </View>
          </View>
        </View>

        {/* Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Mode</Text>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                selectedMode === 'dailyChallengeSolo' && styles.modeButtonActive,
              ]}
              onPress={() => setSelectedMode('dailyChallengeSolo')}
            >
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={24}
                color={selectedMode === 'dailyChallengeSolo' ? '#FFFFFF' : colors.text}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  selectedMode === 'dailyChallengeSolo' && styles.modeButtonTextActive,
                ]}
              >
                Solo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                selectedMode === 'dailyChallengeMultiplayer' && styles.modeButtonActive,
              ]}
              onPress={() => setSelectedMode('dailyChallengeMultiplayer')}
            >
              <IconSymbol
                ios_icon_name="person.2.fill"
                android_material_icon_name="group"
                size={24}
                color={selectedMode === 'dailyChallengeMultiplayer' ? '#FFFFFF' : colors.text}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  selectedMode === 'dailyChallengeMultiplayer' && styles.modeButtonTextActive,
                ]}
              >
                Multiplayer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leaderboard Preview */}
        {leaderboard && leaderboard.entries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Players</Text>
            <View style={styles.leaderboardCard}>
              {leaderboard.entries.slice(0, 5).map((entry, index) => {
                const rankText = String(entry.rank);
                const scoreText = String(entry.score);
                return (
                  <View key={index} style={styles.leaderboardEntry}>
                    <Text style={styles.leaderboardRank}>#{rankText}</Text>
                    <Text style={styles.leaderboardName}>{entry.userName}</Text>
                    <Text style={styles.leaderboardScore}>{scoreText}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Start Button */}
        <View style={styles.startButtonContainer}>
          <TouchableOpacity
            style={[
              styles.startButton,
              (challenge.isCompleted || attemptsLeft === 0 || startingGame) &&
                styles.startButtonDisabled,
            ]}
            onPress={handleStartChallenge}
            disabled={challenge.isCompleted || attemptsLeft === 0 || startingGame}
          >
            <LinearGradient
              colors={
                challenge.isCompleted || attemptsLeft === 0
                  ? [colors.textSecondary, colors.textSecondary]
                  : [colors.primary, '#4F46E5']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButtonGradient}
            >
              {startingGame ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <React.Fragment>
                  <IconSymbol
                    ios_icon_name="play.circle.fill"
                    android_material_icon_name="play-circle-filled"
                    size={32}
                    color="#FFFFFF"
                  />
                  <Text style={styles.startButtonText}>
                    {challenge.isCompleted
                      ? 'Completed'
                      : attemptsLeft === 0
                      ? 'No Attempts Left'
                      : 'Start Challenge'}
                  </Text>
                </React.Fragment>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerDate: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  streakCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  streakDivider: {
    width: 1,
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: 16,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  streakLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rewardsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  leaderboardCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderboardRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    width: 40,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  leaderboardScore: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.highlight,
  },
  startButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
