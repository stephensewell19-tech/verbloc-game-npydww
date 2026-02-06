
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
import { Stack, useRouter } from 'expo-router';
import { authenticatedGet } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { Modal } from '@/components/button';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CurrentSpecialEvents,
  SpecialEvent,
  Difficulty,
} from '@/types/game';

export default function SpecialEventsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CurrentSpecialEvents | null>(null);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    console.log('[SpecialEvents] Screen mounted');
    loadSpecialEvents();
  }, []);

  const loadSpecialEvents = async () => {
    console.log('[SpecialEvents] Loading special events...');
    setLoading(true);
    try {
      // TODO: Backend Integration - GET /api/special-events/current
      const eventsData = await authenticatedGet<CurrentSpecialEvents>('/api/special-events/current');
      console.log('[SpecialEvents] Events loaded:', eventsData);
      setEvents(eventsData);
    } catch (error: any) {
      console.error('[SpecialEvents] Failed to load events:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to load special events',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (event: SpecialEvent) => {
    console.log('[SpecialEvents] User tapped event:', event.name);
    router.push(`/special-event-detail?eventId=${event.id}`);
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

  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const daysText = String(days);
      return `${daysText}d`;
    }
    if (hours > 0) {
      const hoursText = String(hours);
      return `${hoursText}h`;
    }
    const minutesText = String(minutes);
    return `${minutesText}m`;
  };

  const renderEventCard = (event: SpecialEvent, type: string) => {
    const difficultyColor = getDifficultyColor(event.difficulty);
    const difficultyIcon = getDifficultyIcon(event.difficulty);
    const timeRemainingText = formatTimeRemaining(event.timeRemaining);

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        onPress={() => handleEventPress(event)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[difficultyColor, difficultyColor + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.eventGradient}
        >
          <View style={styles.eventHeader}>
            <View style={styles.eventIconContainer}>
              <Text style={styles.eventIcon}>{difficultyIcon}</Text>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.eventFooter}>
            <View style={styles.eventInfoRow}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="schedule"
                size={14}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={styles.eventInfoText}>{timeRemainingText} left</Text>
            </View>
            <View style={styles.eventInfoRow}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={14}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={styles.eventInfoText}>{event.difficulty}</Text>
            </View>
            <View style={styles.eventInfoRow}>
              <IconSymbol
                ios_icon_name="gift.fill"
                android_material_icon_name="card-giftcard"
                size={14}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={styles.eventInfoText}>Rewards</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const totalEvents = events
    ? (events.dailyFeatured ? 1 : 0) +
      events.weeklyChallenges.length +
      events.limitedTimeEvents.length
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Special Events',
          headerBackTitle: 'Home',
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Special Events</Text>
          <Text style={styles.subtitle}>
            Limited-time challenges with exclusive rewards
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : totalEvents === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="calendar.badge.exclamationmark"
              android_material_icon_name="event-busy"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No Active Events</Text>
            <Text style={styles.emptySubtitle}>
              Check back soon for new special events!
            </Text>
          </View>
        ) : (
          <>
            {/* Daily Featured Board */}
            {events?.dailyFeatured && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <IconSymbol
                    ios_icon_name="star.circle.fill"
                    android_material_icon_name="star"
                    size={24}
                    color={colors.highlight}
                  />
                  <Text style={styles.sectionTitle}>Daily Featured</Text>
                </View>
                {renderEventCard(events.dailyFeatured, 'daily')}
              </View>
            )}

            {/* Weekly Challenges */}
            {events?.weeklyChallenges && events.weeklyChallenges.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <IconSymbol
                    ios_icon_name="calendar.circle.fill"
                    android_material_icon_name="event"
                    size={24}
                    color={colors.secondary}
                  />
                  <Text style={styles.sectionTitle}>Weekly Challenges</Text>
                </View>
                {events.weeklyChallenges.map((event) =>
                  renderEventCard(event, 'weekly')
                )}
              </View>
            )}

            {/* Limited-Time Events */}
            {events?.limitedTimeEvents && events.limitedTimeEvents.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <IconSymbol
                    ios_icon_name="bolt.circle.fill"
                    android_material_icon_name="flash-on"
                    size={24}
                    color={colors.accent}
                  />
                  <Text style={styles.sectionTitle}>Limited-Time Events</Text>
                </View>
                {events.limitedTimeEvents.map((event) =>
                  renderEventCard(event, 'limited')
                )}
              </View>
            )}

            {/* Info Card */}
            <View style={styles.infoCard}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={20}
                color={colors.primary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>About Special Events</Text>
                <Text style={styles.infoText}>
                  Special events are limited-time challenges with unique board
                  mechanics and exclusive rewards. Complete them before they
                  expire to earn bonus XP and cosmetic items!
                </Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  eventGradient: {
    padding: 16,
    gap: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventIcon: {
    fontSize: 28,
  },
  eventContent: {
    flex: 1,
    gap: 4,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventInfoText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.backgroundAlt,
  },
  infoContent: {
    flex: 1,
    gap: 6,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
