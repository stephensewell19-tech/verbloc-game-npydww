
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { PuzzleMode } from '@/types/game';

interface WinConditionDisplayProps {
  puzzleMode: PuzzleMode;
  current: number;
  target: number;
  percentage: number;
  description?: string;
}

export default function WinConditionDisplay({ 
  puzzleMode, 
  current, 
  target, 
  percentage,
  description 
}: WinConditionDisplayProps) {
  const progressValue = Math.min(percentage, 100);
  const progressText = `${Math.round(progressValue)}%`;
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${progressValue}%`, {
        damping: 15,
        stiffness: 100,
      }),
    };
  });

  const getPuzzleModeLabel = () => {
    switch (puzzleMode) {
      case 'vault_break':
        return 'Vaults Unlocked';
      case 'hidden_phrase':
        return 'Phrase Revealed';
      case 'territory_control':
        return 'Territory Control';
      case 'score_target':
        return 'Target Score';
      default:
        return 'Progress';
    }
  };

  const getPuzzleModeIcon = () => {
    switch (puzzleMode) {
      case 'vault_break':
        return '🔓';
      case 'hidden_phrase':
        return '🔍';
      case 'territory_control':
        return '🗺️';
      case 'score_target':
        return '🎯';
      default:
        return '📊';
    }
  };

  const getProgressColor = () => {
    if (progressValue >= 100) return colors.success;
    if (progressValue >= 75) return '#10B981';
    if (progressValue >= 50) return '#F59E0B';
    if (progressValue >= 25) return '#F97316';
    return '#EF4444';
  };

  const conditionLabel = getPuzzleModeLabel();
  const conditionIcon = getPuzzleModeIcon();
  const progressColor = getProgressColor();
  
  // Format display values based on puzzle mode
  let currentText = '';
  let targetText = '';
  
  if (puzzleMode === 'territory_control') {
    currentText = `${Math.round(current)}%`;
    targetText = `${Math.round(target)}%`;
  } else {
    currentText = String(Math.round(current));
    targetText = String(Math.round(target));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Text style={styles.icon}>{conditionIcon}</Text>
          <Text style={styles.label}>{conditionLabel}</Text>
        </View>
        <Text style={styles.values}>
          {currentText} / {targetText}
        </Text>
      </View>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar, 
            animatedStyle,
            { backgroundColor: progressColor }
          ]} 
        />
      </View>
      
      <Text style={styles.progressText}>{progressText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  values: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
