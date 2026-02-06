
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Loading skeleton component with shimmer animation
 * Provides better perceived performance while content loads
 */
export function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: LoadingSkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-Dimensions.get('window').width, Dimensions.get('window').width]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
}

/**
 * Board skeleton for game loading
 */
export function BoardSkeleton({ size = 7 }: { size?: number }) {
  const tileSize = (Dimensions.get('window').width - 64) / size;

  return (
    <View style={styles.boardContainer}>
      {Array.from({ length: size }).map((_, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {Array.from({ length: size }).map((_, colIndex) => (
            <LoadingSkeleton
              key={`${rowIndex}-${colIndex}`}
              width={tileSize}
              height={tileSize}
              borderRadius={8}
              style={styles.tile}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Card skeleton for lists
 */
export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <LoadingSkeleton width="60%" height={24} style={styles.cardTitle} />
      <LoadingSkeleton width="40%" height={16} style={styles.cardSubtitle} />
      <LoadingSkeleton width="100%" height={12} style={styles.cardDescription} />
      <LoadingSkeleton width="80%" height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  boardContainer: {
    alignSelf: 'center',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  tile: {
    marginRight: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardSubtitle: {
    marginBottom: 12,
  },
  cardDescription: {
    marginBottom: 8,
  },
});
