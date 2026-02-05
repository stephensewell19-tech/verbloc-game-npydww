
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface WinCondition {
  type: 'score' | 'turns' | 'words';
  target: number;
  current: number;
}

interface WinConditionDisplayProps {
  winCondition: WinCondition;
}

export default function WinConditionDisplay({ winCondition }: WinConditionDisplayProps) {
  const progress = Math.min((winCondition.current / winCondition.target) * 100, 100);
  const progressText = `${Math.round(progress)}%`;
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${progress}%`, {
        damping: 15,
        stiffness: 100,
      }),
    };
  });

  const getConditionLabel = () => {
    switch (winCondition.type) {
      case 'score':
        return 'Target Score';
      case 'turns':
        return 'Turns Remaining';
      case 'words':
        return 'Words to Form';
      default:
        return 'Progress';
    }
  };

  const conditionLabel = getConditionLabel();
  const currentText = String(winCondition.current);
  const targetText = String(winCondition.target);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{conditionLabel}</Text>
        <Text style={styles.values}>
          {currentText} / {targetText}
        </Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, animatedStyle]} />
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
    marginBottom: 12,
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
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
