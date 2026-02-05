
import { colors } from '@/styles/commonStyles';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import React from 'react';
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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  function handlePress() {
    if (disabled || tile.isLocked) {
      return;
    }

    // Trigger animation
    scale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );

    onPress();
  }

  function getTileColor(): string {
    // Locked tiles
    if (tile.isLocked) {
      return '#6B7280'; // Gray
    }

    // Territory control - owned tiles
    if (tile.ownerColor) {
      return tile.ownerColor;
    }

    // Selected tiles
    if (selected) {
      return colors.primary;
    }

    // Special tiles
    if (tile.isSpecial) {
      if (tile.specialType === 'double') {
        return '#3B82F6'; // Blue
      } else if (tile.specialType === 'triple') {
        return '#8B5CF6'; // Purple
      } else if (tile.specialType === 'wildcard') {
        return '#F59E0B'; // Amber
      }
    }

    // Vault tiles
    if (tile.isVault) {
      return tile.isLocked ? '#DC2626' : '#10B981'; // Red if locked, green if unlocked
    }

    // Phrase tiles
    if (tile.isPhraseLetter) {
      return tile.isRevealed ? '#10B981' : '#6366F1'; // Green if revealed, indigo if hidden
    }

    // Claimable tiles
    if (tile.isClaimable && !tile.ownerId) {
      return '#D1D5DB'; // Light gray
    }

    // Default
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
          },
          animatedStyle,
          !isInteractive && styles.tileDisabled,
        ]}
      >
        {/* Selection Order Badge */}
        {selected && order > 0 && (
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{order}</Text>
          </View>
        )}

        {/* Letter */}
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

        {/* Special Badge */}
        {badge && (
          <View style={styles.specialBadge}>
            <Text style={styles.specialBadgeText}>{badge}</Text>
          </View>
        )}

        {/* Point Value */}
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
