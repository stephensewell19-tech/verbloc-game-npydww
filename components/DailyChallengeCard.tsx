
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { DailyChallenge } from '@/types/game';

interface DailyChallengeCardProps {
  challenge: DailyChallenge | null;
  loading?: boolean;
  onPress: () => void;
}

export default function DailyChallengeCard({ challenge, loading, onPress }: DailyChallengeCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!challenge) {
      return;
    }

    const updateTimer = () => {
      const seconds = challenge.timeRemaining;
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
  }, [challenge]);

  const getStatusIcon = () => {
    if (!challenge) {
      return 'hourglass-empty';
    }
    if (challenge.isCompleted) {
      return 'check-circle';
    }
    if (challenge.attemptsUsed >= challenge.attemptsAllowed) {
      return 'cancel';
    }
    return 'stars';
  };

  const getStatusColor = () => {
    if (!challenge) {
      return colors.textSecondary;
    }
    if (challenge.isCompleted) {
      return colors.success;
    }
    if (challenge.attemptsUsed >= challenge.attemptsAllowed) {
      return colors.error;
    }
    return '#FFFFFF';
  };

  const getStatusText = () => {
    if (!challenge) {
      return 'Loading...';
    }
    if (challenge.isCompleted) {
      return 'Completed!';
    }
    if (challenge.attemptsUsed >= challenge.attemptsAllowed) {
      return 'No Attempts Left';
    }
    return 'New Challenge';
  };

  const getSubtitleText = () => {
    if (!challenge) {
      return 'Preparing today\'s challenge';
    }
    if (challenge.isCompleted) {
      const scoreText = String(challenge.userBestScore || 0);
      return `Your best: ${scoreText} points`;
    }
    const attemptsLeft = challenge.attemptsAllowed - challenge.attemptsUsed;
    const attemptsText = String(attemptsLeft);
    return `${attemptsText} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining`;
  };

  const statusIcon = getStatusIcon();
  const statusColor = getStatusColor();
  const statusText = getStatusText();
  const subtitleText = getSubtitleText();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading || !challenge}
    >
      <LinearGradient
        colors={[colors.accent, '#DB2777']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="star.circle.fill"
              android_material_icon_name={statusIcon}
              size={40}
              color={statusColor}
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

        {challenge && (
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
                ios_icon_name="flame.fill"
                android_material_icon_name="local-fire-department"
                size={16}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={styles.infoText}>+{challenge.rewards.xp} XP</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
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
