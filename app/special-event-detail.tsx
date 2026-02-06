
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { authenticatedGet, authenticatedPost } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { Modal } from '@/components/button';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SpecialEventDetail,
  SpecialEventLeaderboard,
  Difficulty,
} from '@/types/game';

export default function SpecialEventDetailScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [event, setEvent] = useState<SpecialEventDetail | null>(null);
  const [leaderboard, setLeaderboard] = useState<SpecialEventLeaderboard | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    console.log('[SpecialEventDetail] Screen mounted with eventId:', eventId);
    if (eventId) {
      loadEventDetail();
      loadLeaderboard();
    }
  }, [eventId]);

  useEffect(() => {
    if (!event) {
      return;
    }

    const updateTimer = () => {
      const seconds = event.timeRemaining;
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (days > 0) {
        const daysText = String(days);
        const hoursText = String(hours);
        setTimeRemaining(`${daysText}d ${hoursText}h`);
      } else if (hours > 0) {
        const hoursText = String(hours);
        const minutesText = String(minutes);
        setTimeRemaining(`${hoursText}h ${minutesText}m`);
      } else {
        const minutesText = String(minutes);
        const secsText = String(secs);
        setTimeRemaining(`${minutesText}:${secsText}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [event]);

  const loadEventDetail = async () => {
    console.log('[SpecialEventDetail] Loading event detail...');
    setLoading(true);
    try {
      const eventData = await authenticatedGet<SpecialEventDetail>(
        `/api/special-events/${eventId}`
      );
      console.log('[SpecialEventDetail] Event loaded:', eventData);
      setEvent(eventData);
    } catch (error: any) {
      console.error('[SpecialEventDetail] Failed to load event:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to load event details',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    console.log('[SpecialEventDetail] Loading leaderboard...');
    setLeaderboardLoading(true);
    try {
      const leaderboardData = await authenticatedGet<SpecialEventLeaderboard>(
        `/api/special-events/${eventId}/leaderboard?limit=10`
      );
      console.log('[SpecialEventDetail] Leaderboard loaded:', leaderboardData);
      setLeaderboard(leaderboardData);
    } catch (error: any) {
      console.error('[SpecialEventDetail] Failed to load leaderboard:', error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleStartEvent = async () => {
    console.log('[SpecialEventDetail] User tapped Start Event button');
    setStarting(true);
    try {
      const response = await authenticatedPost<{ gameId: string; boardState: any }>(
        `/api/special-events/${eventId}/start`,
        { gameMode: 'specialEventSolo' }
      );
      console.log('[SpecialEventDetail] Event started:', response);
      
      // Navigate to game with special event parameters
      const startTime = Date.now();
      router.push(
        `/game?gameId=${response.gameId}&mode=specialEvent&eventId=${eventId}&startTime=${startTime}&boardName=${encodeURIComponent(event?.name || 'Special Event')}&difficulty=${event?.difficulty || 'Special'}`
      );
    } catch (error: any) {
      console.error('[SpecialEventDetail] Failed to start event:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to start event',
      });
    } finally {
      setStarting(false);
    }
  };

  const getDifficultyColor = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'Easy':
        return '#10B981';
      case 'Medium':
        return '#F59E0B';
      case 'Hard':
        return '#EF4444';
      case 'Special':
        return '#8B5CF6';
      default:
        return colors.primary;
    }
  };

  const getDifficultyIcon = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'Easy':
        return '🌱';
      case 'Medium':
        return '⚡';
      case 'Hard':
        return '🔥';
      case 'Special':
        return '⭐';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Event Details',
            headerBackTitle: 'Events',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Event Details',
            headerBackTitle: 'Events',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const difficultyColor = getDifficultyColor(event.difficulty);
  const difficultyIcon = getDifficultyIcon(event.difficulty);
  const bestScoreText = event.userProgress.bestScore
    ? String(event.userProgress.bestScore)
    : 'N/A';
  const attemptsText = String(event.userProgress.attemptsUsed);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: event.name,
          headerBackTitle: 'Events',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Header Card */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={[difficultyColor, difficultyColor + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerIconContainer}>
              <Text style={styles.headerIcon}>{difficultyIcon}</Text>
            </View>
            <Text style={styles.eventTitle}>{event.name}</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>

            <View style={styles.headerStats}>
              <View style={styles.headerStat}>
                <IconSymbol
                  ios_icon_name="clock.fill"
                  android_material_icon_name="schedule"
                  size={20}
                  color="rgba(255, 255, 255, 0.9)"
                />
                <Text style={styles.headerStatText}>{timeRemaining} left</Text>
              </View>
              <View style={styles.headerStat}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={20}
                  color="rgba(255, 255, 255, 0.9)"
                />
                <Text style={styles.headerStatText}>{event.difficulty}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* User Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressStat}>
              <Text style={styles.progressLabel}>Best Score</Text>
              <Text style={styles.progressValue}>{bestScoreText}</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressLabel}>Attempts</Text>
              <Text style={styles.progressValue}>{attemptsText}</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressLabel}>Status</Text>
              <Text style={styles.progressValue}>
                {event.userProgress.isCompleted ? '✓ Done' : 'In Progress'}
              </Text>
            </View>
          </View>
        </View>

        {/* Event Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Rules</Text>
          <View style={styles.rulesCard}>
            {event.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <View style={styles.ruleBullet}>
                  <Text style={styles.ruleBulletText}>•</Text>
                </View>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rewards</Text>
          <View style={styles.rewardsCard}>
            {event.rewards.map((reward, index) => (
              <View key={index} style={styles.rewardItem}>
                <IconSymbol
                  ios_icon_name="gift.fill"
                  android_material_icon_name="card-giftcard"
                  size={24}
                  color={colors.highlight}
                />
                <View style={styles.rewardContent}>
                  <Text style={styles.rewardType}>{reward.type}</Text>
                  <Text style={styles.rewardValue}>{String(reward.value)}</Text>
                  {reward.description && (
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          {leaderboardLoading ? (
            <View style={styles.leaderboardLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : leaderboard && leaderboard.entries.length > 0 ? (
            <View style={styles.leaderboardCard}>
              {leaderboard.entries.map((entry, index) => {
                const rankText = String(entry.rank);
                const scoreText = String(entry.score);
                return (
                  <View key={index} style={styles.leaderboardEntry}>
                    <View style={styles.leaderboardRank}>
                      <Text style={styles.leaderboardRankText}>{rankText}</Text>
                    </View>
                    <Text style={styles.leaderboardName}>{entry.userName}</Text>
                    <Text style={styles.leaderboardScore}>{scoreText}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.leaderboardEmpty}>
              <Text style={styles.leaderboardEmptyText}>
                No entries yet. Be the first!
              </Text>
            </View>
          )}
        </View>

        {/* Start Button */}
        <View style={styles.startButtonContainer}>
          <TouchableOpacity
            style={[styles.startButton, starting && styles.startButtonDisabled]}
            onPress={handleStartEvent}
            disabled={starting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.primary, '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButtonGradient}
            >
              {starting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <IconSymbol
                    ios_icon_name="play.circle.fill"
                    android_material_icon_name="play-circle-filled"
                    size={28}
                    color="#FFFFFF"
                  />
                  <Text style={styles.startButtonText}>Start Event</Text>
                </>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  headerCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  eventDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 21,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  headerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerStatText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressStat: {
    alignItems: 'center',
    gap: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  rulesCard: {
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
  ruleItem: {
    flexDirection: 'row',
    gap: 12,
  },
  ruleBullet: {
    width: 20,
    alignItems: 'center',
  },
  ruleBulletText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  rewardsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardContent: {
    flex: 1,
    gap: 2,
  },
  rewardType: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  rewardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  leaderboardLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  leaderboardCard: {
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
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  leaderboardRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  leaderboardName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  leaderboardScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  leaderboardEmpty: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  leaderboardEmptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
    paddingVertical: 18,
    gap: 12,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
