
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { CurrentSpecialEvents } from '@/types/game';

interface SpecialEventsCardProps {
  events: CurrentSpecialEvents | null;
  loading?: boolean;
  onPress: () => void;
}

export default function SpecialEventsCard({ events, loading, onPress }: SpecialEventsCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!events?.dailyFeatured) {
      return;
    }

    const updateTimer = () => {
      const seconds = events.dailyFeatured!.timeRemaining;
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      const hoursText = String(hours).padStart(2, '0');
      const minutesText = String(minutes).padStart(2, '0');
      const secsText = String(secs).padStart(2, '0');

      setTimeRemaining(`${hoursText}:${minutesText}:${secsText}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [events]);

  const getTotalActiveEvents = () => {
    if (!events) {
      return 0;
    }
    const dailyCount = events.dailyFeatured ? 1 : 0;
    const weeklyCount = events.weeklyChallenges.length;
    const limitedCount = events.limitedTimeEvents.length;
    return dailyCount + weeklyCount + limitedCount;
  };

  const getEventIcon = () => {
    if (!events) {
      return 'hourglass-empty';
    }
    const totalEvents = getTotalActiveEvents();
    if (totalEvents === 0) {
      return 'event-busy';
    }
    return 'event-available';
  };

  const getEventColor = () => {
    if (!events) {
      return colors.textSecondary;
    }
    const totalEvents = getTotalActiveEvents();
    if (totalEvents === 0) {
      return colors.textSecondary;
    }
    return '#FFFFFF';
  };

  const getStatusText = () => {
    if (!events) {
      return 'Loading...';
    }
    const totalEvents = getTotalActiveEvents();
    if (totalEvents === 0) {
      return 'No Active Events';
    }
    const totalEventsText = String(totalEvents);
    return `${totalEventsText} Active ${totalEvents === 1 ? 'Event' : 'Events'}`;
  };

  const getSubtitleText = () => {
    if (!events) {
      return 'Checking for special events';
    }
    const totalEvents = getTotalActiveEvents();
    if (totalEvents === 0) {
      return 'Check back soon for new events';
    }
    if (events.dailyFeatured) {
      return events.dailyFeatured.name;
    }
    if (events.weeklyChallenges.length > 0) {
      return events.weeklyChallenges[0].name;
    }
    if (events.limitedTimeEvents.length > 0) {
      return events.limitedTimeEvents[0].name;
    }
    return 'Tap to view all events';
  };

  const eventIcon = getEventIcon();
  const eventColor = getEventColor();
  const statusText = getStatusText();
  const subtitleText = getSubtitleText();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading || !events}
    >
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="sparkles"
              android_material_icon_name={eventIcon}
              size={40}
              color={eventColor}
            />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{statusText}</Text>
            <Text style={styles.subtitle}>{subtitleText}</Text>
          </View>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={24}
            color="#FFFFFF"
          />
        </View>

        {events && events.dailyFeatured && (
          <View style={styles.footer}>
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="schedule"
                size={16}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={styles.infoText}>Resets in {timeRemaining}</Text>
            </View>
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={16}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={styles.infoText}>Limited Time</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.25)',
  },
  gradient: {
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
});
