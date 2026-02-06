
import { colors } from '@/styles/commonStyles';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Tile, Position } from '@/types/game';

interface GameBoardProps {
  tiles: Tile[][];
  selectedPositions: Position[];
  onTilePress: (row: number, col: number) => void;
  disabled?: boolean;
}

interface TileComponentProps {
  tile: Tile;
  size: number;
  selected: boolean;
  order: number;
  onPress: () => void;
  disabled?: boolean;
}

const BOARD_PADDING = 16;
const TILE_GAP = 4;

function resolveImageSource(source: string | number | any): any {
  if (!source) {
    return { uri: '' };
  }
  if (typeof source === 'string') {
    return { uri: source };
  }
  return source;
}

export default function GameBoard({ tiles, selectedPositions, onTilePress, disabled }: GameBoardProps) {
  const screenWidth = Dimensions.get('window').width;
  const boardSize = tiles.length;
  const availableWidth = screenWidth - (BOARD_PADDING * 2);
  const tileSize = (availableWidth - (TILE_GAP * (boardSize - 1))) / boardSize;

  function isTileSelected(row: number, col: number): boolean {
    return selectedPositions.some(pos => pos.row === row && pos.col === col);
  }

  function getSelectionOrder(row: number, col: number): number {
    const index = selectedPositions.findIndex(pos => pos.row === row && pos.col === col);
    return index !== -1 ? index + 1 : 0;
  }

  return (
    <View style={styles.container}>
      {tiles.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((tile, colIndex) => (
            <TileComponent
              key={`${rowIndex}-${colIndex}`}
              tile={tile}
              size={tileSize}
              selected={isTileSelected(rowIndex, colIndex)}
              order={getSelectionOrder(rowIndex, colIndex)}
              onPress={() => onTilePress(rowIndex, colIndex)}
              disabled={disabled}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function TileComponent({ tile, size, selected, order, onPress, disabled }: TileComponentProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (selected) {
      glow.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.7, { duration: 500 })
      );
    } else {
      glow.value = withTiming(0, { duration: 200 });
    }
  }, [selected, glow]);

  const animatedStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(
      glow.value,
      [0, 1],
      [0, 0.8],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      shadowOpacity: glowOpacity,
      shadowRadius: interpolate(
        glow.value,
        [0, 1],
        [0, 12],
        Extrapolate.CLAMP
      ),
    };
  });

  function handlePress() {
    if (disabled || tile.isLocked) {
      // Shake animation for locked tiles
      rotation.value = withSequence(
        withSpring(-5, { damping: 10 }),
        withSpring(5, { damping: 10 }),
        withSpring(0, { damping: 10 })
      );
      return;
    }

    // Pop animation on press
    scale.value = withSequence(
      withSpring(0.85, { damping: 10 }),
      withSpring(1.05, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );

    onPress();
  }

  function getTileColor(): string {
    if (tile.isLocked) {
      return '#6B7280';
    }

    if (tile.ownerColor) {
      return tile.ownerColor;
    }

    if (selected) {
      return colors.primary;
    }

    if (tile.isSpecial) {
      if (tile.specialType === 'double') {
        return '#3B82F6';
      } else if (tile.specialType === 'triple') {
        return '#8B5CF6';
      } else if (tile.specialType === 'wildcard') {
        return '#F59E0B';
      }
    }

    if (tile.isVault) {
      return tile.isLocked ? '#DC2626' : '#10B981';
    }

    if (tile.isPhraseLetter) {
      return tile.isRevealed ? '#10B981' : '#6366F1';
    }

    if (tile.isClaimable && !tile.ownerId) {
      return '#D1D5DB';
    }

    return colors.card;
  }

  function getTileBadge(): string | null {
    if (tile.isSpecial) {
      if (tile.specialType === 'double') {
        return '2×';
      } else if (tile.specialType === 'triple') {
        return '3×';
      } else if (tile.specialType === 'wildcard') {
        return '★';
      }
    }

    if (tile.isVault && tile.isLocked) {
      return '🔒';
    }

    if (tile.isPhraseLetter && !tile.isRevealed) {
      return '?';
    }

    return null;
  }

  const tileColor = getTileColor();
  const badge = getTileBadge();
  const displayLetter = tile.letter || '';
  const isInteractive = !disabled && !tile.isLocked;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!isInteractive}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.tile,
          {
            width: size,
            height: size,
            backgroundColor: tileColor,
            shadowColor: selected ? colors.primary : '#000',
          },
          animatedStyle,
          !isInteractive && styles.tileDisabled,
        ]}
      >
        {selected && order > 0 && (
          <Animated.View 
            entering={withSpring}
            style={styles.orderBadge}
          >
            <Text style={styles.orderText}>{order}</Text>
          </Animated.View>
        )}

        <Text
          style={[
            styles.letter,
            { fontSize: size * 0.4 },
            selected && styles.letterSelected,
            tile.isLocked && styles.letterLocked,
          ]}
        >
          {displayLetter}
        </Text>

        {badge && (
          <View style={styles.specialBadge}>
            <Text style={styles.specialBadgeText}>{badge}</Text>
          </View>
        )}

        {!tile.isLocked && tile.value > 0 && (
          <Text style={styles.value}>{tile.value}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    padding: BOARD_PADDING,
  },
  row: {
    flexDirection: 'row',
    gap: TILE_GAP,
    marginBottom: TILE_GAP,
  },
  tile: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 4,
  },
  tileDisabled: {
    opacity: 0.6,
  },
  letter: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  letterSelected: {
    color: '#FFFFFF',
  },
  letterLocked: {
    color: '#9CA3AF',
  },
  value: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  orderBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  specialBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  specialBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
