
import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface GameCompletionModalProps {
  visible: boolean;
  status: 'won' | 'lost' | 'playing';
  finalScore: number;
  targetScore: number;
  wordsFormed: number;
  efficiency?: number;
  turnsUsed?: number;
  turnLimit?: number;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

const { width } = Dimensions.get('window');

export default function GameCompletionModal({
  visible,
  status,
  finalScore,
  targetScore,
  wordsFormed,
  efficiency,
  turnsUsed,
  turnLimit,
  onPlayAgain,
  onBackToHome,
}: GameCompletionModalProps) {
  if (status === 'playing') return null;

  const isWin = status === 'won';
  const title = isWin ? 'Victory!' : 'Game Over';
  
  // Dynamic messaging based on how the game ended
  let message = '';
  if (isWin) {
    message = 'Congratulations! You completed the puzzle!';
  } else if (turnsUsed !== undefined && turnLimit !== undefined && turnsUsed >= turnLimit) {
    message = 'Ran out of turns! Try forming longer words next time.';
  } else {
    message = "Don't give up! Every game makes you stronger.";
  }
  
  const iconName = isWin ? 'trophy' : 'emoji-events';
  const gradientColors = isWin
    ? [colors.success, '#10B981']
    : [colors.accent, '#F59E0B'];

  const finalScoreText = String(finalScore);
  const targetScoreText = String(targetScore);
  const wordsFormedText = String(wordsFormed);
  const scorePercentage = Math.round((finalScore / targetScore) * 100);
  const scorePercentageText = `${scorePercentage}%`;
  const efficiencyText = efficiency ? efficiency.toFixed(1) : '0.0';
  const turnsUsedText = turnsUsed !== undefined ? String(turnsUsed) : '0';
  const turnLimitText = turnLimit !== undefined ? String(turnLimit) : '0';

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onBackToHome}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={SlideInDown.duration(400)}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <IconSymbol
              ios_icon_name={isWin ? 'trophy.fill' : 'star.fill'}
              android_material_icon_name={iconName}
              size={64}
              color="#FFFFFF"
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Final Score</Text>
                <Text style={styles.statValue}>{finalScoreText}</Text>
                <Text style={styles.statSubtext}>Target: {targetScoreText}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Words Formed</Text>
                <Text style={styles.statValue}>{wordsFormedText}</Text>
                <Text style={styles.statSubtext}>Great job!</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Achievement</Text>
                <Text style={styles.statValue}>{scorePercentageText}</Text>
                <Text style={styles.statSubtext}>of target</Text>
              </View>
            </View>
            
            {/* Additional Solo Mode Stats */}
            {(efficiency !== undefined || turnsUsed !== undefined) && (
              <View style={styles.additionalStatsContainer}>
                {efficiency !== undefined && (
                  <View style={styles.additionalStatBox}>
                    <Text style={styles.additionalStatLabel}>Efficiency</Text>
                    <Text style={styles.additionalStatValue}>{efficiencyText}</Text>
                    <Text style={styles.additionalStatSubtext}>pts/word</Text>
                  </View>
                )}
                
                {turnsUsed !== undefined && turnLimit !== undefined && (
                  <View style={styles.additionalStatBox}>
                    <Text style={styles.additionalStatLabel}>Turns Used</Text>
                    <Text style={styles.additionalStatValue}>{turnsUsedText} / {turnLimitText}</Text>
                    <Text style={styles.additionalStatSubtext}>
                      {turnLimit - turnsUsed} remaining
                    </Text>
                  </View>
                )}
              </View>
            )}

            {!isWin && (
              <View style={styles.encouragementBox}>
                <IconSymbol
                  ios_icon_name="lightbulb.fill"
                  android_material_icon_name="lightbulb"
                  size={20}
                  color={colors.highlight}
                />
                <Text style={styles.encouragementText}>
                  Try forming longer words for more points! Special tiles give bonus multipliers.
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.playAgainButton]}
                onPress={onPlayAgain}
                activeOpacity={0.8}
              >
                <IconSymbol
                  ios_icon_name="arrow.clockwise"
                  android_material_icon_name="refresh"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.buttonText}>Play Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.homeButton]}
                onPress={onBackToHome}
                activeOpacity={0.8}
              >
                <IconSymbol
                  ios_icon_name="house.fill"
                  android_material_icon_name="home"
                  size={24}
                  color={colors.text}
                />
                <Text style={[styles.buttonText, styles.homeButtonText]}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: Math.min(width - 40, 400),
    backgroundColor: colors.background,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  additionalStatsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  additionalStatBox: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  additionalStatLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  additionalStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  additionalStatSubtext: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  encouragementBox: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.highlight,
  },
  encouragementText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  playAgainButton: {
    backgroundColor: colors.primary,
  },
  homeButton: {
    backgroundColor: colors.card,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  homeButtonText: {
    color: colors.text,
  },
});
